"""A generic in-memory mock ODrive for hardware-free development and tests.

Enabled by setting ``ODRIVE_MOCK=1``. The mock is seeded from the API-reference
JSON, so every property path the frontend reads resolves to a realistic typed
scalar, writes are remembered, and known commands are callable. This lets the
whole app (and the test suite) run end-to-end without a physical ODrive.

Choose the simulated firmware with ``ODRIVE_MOCK_FW`` (``5`` = 0.5.x default,
``6`` = 0.6.x).
"""

from __future__ import annotations

import math
import os
import time
from typing import Any, Dict, Iterable, Set

from .api_reference import load_api_reference

# Wall-clock origin so animated telemetry is a smooth function of elapsed time.
_START = time.time()


def _animated_value(path: str):
    """Return a time-varying value for known live-telemetry paths, else None.

    Lets charts and the dashboard show realistic movement in mock mode without
    hardware. Only read-only telemetry paths are animated; config paths fall
    through to the stored value.
    """
    t = time.time() - _START
    if path.endswith("encoder.pos_estimate") or path.endswith("pos_vel_mapper.pos_rel"):
        return round(2.0 * math.sin(t * 0.5), 4)
    if path.endswith("encoder.vel_estimate") or path.endswith("pos_vel_mapper.vel"):
        return round(1.0 * math.cos(t * 0.5), 4)
    if path.endswith("Iq_measured") or path.endswith("Iq_setpoint"):
        return round(0.6 * math.sin(t * 2.0) + 0.05 * math.sin(t * 31.0), 4)
    if path.endswith("Id_measured"):
        return round(0.05 * math.sin(t * 5.0), 4)
    if path.endswith("vbus_voltage"):
        return round(24.0 + 0.25 * math.sin(t * 0.3), 3)
    if path.endswith(".ibus") or path == "ibus":
        return round(0.4 * math.sin(t * 0.7), 3)
    if "motor_thermistor.temperature" in path:
        return round(31.0 + 3.0 * math.sin(t * 0.1), 2)
    if "fet_thermistor.temperature" in path or path.endswith(".fet_temperature"):
        return round(34.0 + 4.0 * math.sin(t * 0.13 + 1.0), 2)
    return None

# Realistic, non-zero seed values so the UI looks alive in mock mode. Keyed by
# firmware line because the motor-config path differs between 0.5.x and 0.6.x.
_COMMON_SEED: Dict[str, Any] = {
    "vbus_voltage": 24.0,
    "ibus": 0.0,
    # Axes report IDLE by default so the dashboard/sidebar look realistic.
    "axis0.current_state": 1,
    "axis1.current_state": 1,
}
_SEED_BY_LINE: Dict[int, Dict[str, Any]] = {
    5: {
        "axis0.motor.config.pole_pairs": 7,
        "axis0.motor.config.torque_constant": 0.04,
        "axis0.motor.config.current_lim": 10.0,
        "axis1.motor.config.pole_pairs": 7,
        "axis1.motor.config.torque_constant": 0.04,
        "axis1.motor.config.current_lim": 10.0,
    },
    6: {
        "axis0.config.motor.pole_pairs": 7,
        "axis0.config.motor.torque_constant": 0.04,
        "axis1.config.motor.pole_pairs": 7,
        "axis1.config.motor.torque_constant": 0.04,
    },
}

# Commands that report success on the real device.
_TRUE_COMMANDS = {"save_configuration", "erase_configuration"}

# Simulated calibration choreography, keyed by the requested AxisState. Each
# entry is a list of (axis_state, duration_seconds) phases the mock steps
# through (on wall-clock time) before settling back to IDLE. Wall-clock timing
# makes it robust to the many concurrent readers of ``current_state`` (the
# telemetry stream and the calibration poller both read it), so a fast stream
# can't "drain" the sequence early.
_AXIS_IDLE = 1
_CALIB_SEQUENCES: Dict[int, list] = {
    3: [(4, 1.5), (7, 1.5)],   # FULL_CALIBRATION_SEQUENCE: motor then encoder offset
    4: [(4, 2.0)],             # MOTOR_CALIBRATION
    6: [(6, 1.5)],             # ENCODER_INDEX_SEARCH
    7: [(7, 2.0)],             # ENCODER_OFFSET_CALIBRATION
    10: [(10, 1.5)],           # ENCODER_DIR_FIND
    12: [(12, 1.5)],           # ENCODER_HALL_POLARITY_CALIBRATION
}


def _default_for_type(type_str: str):
    """Default scalar for a property type, or None for non-scalar sub-objects.

    Returning None signals "this path is a branch, not a leaf" so the mock keeps
    it navigable (e.g. ``motor.current_control``, ``motor.motor_thermistor``).
    """
    t = type_str or ""
    if "Bool" in t:
        return False
    if "Float" in t:
        return 0.0
    if "Uint" in t or "Int" in t:
        return 0
    if t.startswith("Property["):
        # Enums and error-flag properties read back as ints.
        return 0
    # Sub-object types (e.g. ODrive.Motor.CurrentControl) are not leaves.
    return None


def _expand_axes(path: str) -> Iterable[str]:
    if "{n}" in path:
        return (path.replace("{n}", "0"), path.replace("{n}", "1"))
    return (path,)


class _MockCommand:
    """Callable stand-in for an ODrive method."""

    def __init__(self, path: str):
        self._path = path

    def __call__(self, *args, **kwargs) -> Any:
        leaf = self._path.rsplit(".", 1)[-1]
        if leaf in _TRUE_COMMANDS:
            return True
        return None


class _MockNode:
    """Proxy that resolves dotted attribute access against a flat backing store."""

    def __init__(self, store: Dict[str, Any], commands: Set[str], prefix: str):
        object.__setattr__(self, "_store", store)
        object.__setattr__(self, "_commands", commands)
        object.__setattr__(self, "_prefix", prefix)

    def _path(self, name: str) -> str:
        prefix = object.__getattribute__(self, "_prefix")
        return f"{prefix}.{name}" if prefix else name

    def __getattr__(self, name: str) -> Any:
        if name.startswith("_"):
            raise AttributeError(name)
        store = object.__getattribute__(self, "_store")
        commands = object.__getattribute__(self, "_commands")
        prefix = object.__getattribute__(self, "_prefix")
        path = self._path(name)
        # Animated live telemetry (read-only) so charts/dashboard move in mock mode.
        animated = _animated_value(path)
        if animated is not None:
            return animated
        # Simulate the axis state machine so calibration flows complete in mock
        # mode. ``current_state`` is derived from wall-clock time since the
        # calibration request, so it's robust to many concurrent readers (the
        # telemetry stream and the calibration poller both read current_state).
        if name == "current_state" and prefix:
            sched = store.get(f"{prefix}.__calib_sched")
            if sched:
                elapsed = time.time() - store.get(f"{prefix}.__calib_start", 0.0)
                acc = 0.0
                for st, dur in sched:
                    acc += dur
                    if elapsed < acc:
                        store[path] = st
                        return st
                # Sequence finished -> settle back to IDLE.
                store[f"{prefix}.__calib_sched"] = None
                store[path] = _AXIS_IDLE
                return _AXIS_IDLE
        if path in store:
            return store[path]
        if path in commands:
            return _MockCommand(path)
        # Unknown leaf -> treat as a branch so deeper resolution keeps working.
        return _MockNode(store, commands, path)

    def __call__(self, *args, **kwargs) -> Any:
        # A node invoked as a method is an unmodelled command (e.g.
        # axis0.clear_errors): behave as a harmless no-op so mock mode matches
        # the real device's "callable" surface instead of raising.
        prefix = object.__getattribute__(self, "_prefix")
        leaf = prefix.rsplit(".", 1)[-1] if prefix else ""
        return True if leaf in _TRUE_COMMANDS else None

    def __setattr__(self, name: str, value: Any) -> None:
        store = object.__getattribute__(self, "_store")
        prefix = object.__getattribute__(self, "_prefix")
        store[self._path(name)] = value
        # A requested_state drives the simulated axis state machine.
        if name == "requested_state" and prefix:
            seq = _CALIB_SEQUENCES.get(value)
            if seq:
                # Kick off a timed calibration choreography.
                store[f"{prefix}.__calib_start"] = time.time()
                store[f"{prefix}.__calib_sched"] = list(seq)
                store[f"{prefix}.current_state"] = seq[0][0]
                # Populate plausible "measured" results so the calibration value
                # editor shows realistic numbers in mock mode.
                if value in (3, 4):  # full / motor calibration
                    for base in (f"{prefix}.motor.config", f"{prefix}.config.motor"):
                        store[f"{base}.phase_resistance"] = 0.085
                        store[f"{base}.phase_inductance"] = 3.2e-05
                if value in (3, 6, 7, 10, 12):  # full / encoder-related
                    store[f"{prefix}.encoder.config.direction"] = 1
                    store[f"{prefix}.encoder.config.phase_offset"] = 1234
            elif value in (0, 1):
                # Explicit IDLE/UNDEFINED request: clear any calibration and rest.
                store[f"{prefix}.__calib_sched"] = None
                store[f"{prefix}.current_state"] = value
            else:
                # Steady non-calibration state (e.g. CLOSED_LOOP_CONTROL): hold it
                # until the user explicitly returns to IDLE.
                store[f"{prefix}.__calib_sched"] = None
                store[f"{prefix}.current_state"] = value


class MockODrive(_MockNode):
    """Top-level mock device exposing the same attribute surface as ``odrive``."""

    def __init__(self, fw_line: int = 5):
        api = load_api_reference(fw_line)

        store: Dict[str, Any] = {}
        for group in api.get("properties", {}).values():
            for prop in group.values():
                path = prop.get("path")
                if not path:
                    continue
                default = _default_for_type(prop.get("type"))
                if default is None:
                    continue  # sub-object: keep it a navigable branch
                for expanded in _expand_axes(path):
                    store[expanded] = default

        commands: Set[str] = set()
        for group in api.get("commands", {}).values():
            for cmd in group.values():
                path = cmd.get("path")
                if not path:
                    continue
                commands.update(_expand_axes(path))

        # Both 0.5.x and 0.6.x report major 0; the line is the minor.
        revision = 12 if fw_line == 6 else 6
        store.update(_COMMON_SEED)
        store.update(_SEED_BY_LINE.get(fw_line, {}))
        store.update({
            "serial_number": 0x123456789ABC,
            "fw_version_major": 0,
            "fw_version_minor": fw_line,
            "fw_version_revision": revision,
            "hw_version_major": 3,
            "hw_version_minor": 6,
            "hw_version_variant": 56,
        })

        super().__init__(store, commands, "")


def mock_enabled() -> bool:
    return os.environ.get("ODRIVE_MOCK", "").strip().lower() in ("1", "true", "yes", "on")

def mock_fw_line() -> int:
    """Firmware line to simulate: 6 for 0.6.x, otherwise 5 (0.5.x)."""
    try:
        return 6 if int(os.environ.get("ODRIVE_MOCK_FW", "5")) == 6 else 5
    except (TypeError, ValueError):
        return 5


_singleton: MockODrive | None = None


def get_mock_device() -> MockODrive:
    """Return the process-wide mock device, creating it on first use."""
    global _singleton
    if _singleton is None:
        _singleton = MockODrive(mock_fw_line())
    return _singleton
