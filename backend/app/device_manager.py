import threading
from typing import Any, Dict, List, Iterable

from .mock_odrive import mock_enabled, get_mock_device

_device_lock = threading.Lock()
_device_index: Dict[str, Any] = {}  # serial -> odrive handle
_io_locks: Dict[str, threading.RLock] = {}  # serial -> per-device I/O lock


def io_lock(serial: str) -> threading.RLock:
    """Per-device re-entrant lock serializing all USB access (telemetry + read/
    write/command) so concurrent operations never contend on the same handle."""
    with _device_lock:
        lk = _io_locks.get(serial)
        if lk is None:
            lk = threading.RLock()
            _io_locks[serial] = lk
        return lk


def _find_any() -> Any:
    """Return a device handle: the mock when ODRIVE_MOCK is set, else real
    hardware. Returns None when no device is present instead of raising, so
    discovery just reports "no devices" rather than a 500."""
    if mock_enabled():
        return get_mock_device()
    import odrive  # lazy import; only needed with real hardware
    try:
        return odrive.find_any(timeout=1.0)
    except Exception:
        return None


def list_attached() -> List[Any]:
    with _device_lock:
        return list(_device_index.values())


def serialize_device(odrv: Any) -> Dict[str, Any]:
    fw_major = getattr(odrv, "fw_version_major", None)
    fw_minor = getattr(odrv, "fw_version_minor", None)
    fw_rev = getattr(odrv, "fw_version_revision", None)
    ser = getattr(odrv, "serial_number", None)
    return {
        "serial_number": str(ser) if ser is not None else None,
        "fw_version": f"{fw_major}.{fw_minor}.{fw_rev}",
        "fw_version_major": fw_major,
        "fw_version_minor": fw_minor,
        "fw_version_revision": fw_rev,
    }


def _resolve_attr(root: Any, dotted: str) -> Any:
    cur = root
    for part in dotted.split("."):
        if not hasattr(cur, part):
            raise AttributeError(f"Path segment '{part}' not found while resolving '{dotted}'")
        cur = getattr(cur, part)
    return cur


def get_attr_value(root: Any, dotted: str) -> Any:
    val = _resolve_attr(root, dotted)
    if isinstance(val, (int, float, bool, str)):
        return val
    raise TypeError(f"'{dotted}' is not a scalar (got {val.__class__.__name__})")


def set_attr_value(root: Any, dotted: str, value: Any):
    parts = dotted.split(".")
    parent = _resolve_attr(root, ".".join(parts[:-1])) if len(parts) > 1 else root
    leaf = parts[-1]
    if not hasattr(parent, leaf):
        raise AttributeError(f"Leaf attribute '{leaf}' not found in '{dotted}'")
    setattr(parent, leaf, value)


def invoke(root: Any, dotted: str, args: Iterable[Any]) -> Any:
    """Resolve a dotted method path and call it with the given args."""
    func = _resolve_attr(root, dotted)
    if not callable(func):
        raise TypeError(f"Attribute at '{dotted}' is not callable")
    return func(*list(args))


def attach_or_get(serial: str) -> Any:
    with _device_lock:
        if serial in _device_index:
            return _device_index[serial]

    od = _find_any()
    if not od:
        raise ValueError(f"Device with serial '{serial}' not found")
    found_serial = str(getattr(od, "serial_number", "")).lower()
    if found_serial != serial.lower():
        raise ValueError(f"Device with serial '{serial}' not found (found '{found_serial}')")
    with _device_lock:
        _device_index[serial] = od
    return od


def discover_and_index() -> List[Dict[str, Any]]:
    od = _find_any()
    found = []
    with _device_lock:
        _device_index.clear()
        if od:
            ser = str(getattr(od, "serial_number", ""))
            _device_index[ser] = od
            found.append(serialize_device(od))
    return found


def batch_read(odrv: Any, paths: Iterable[str], lock: Any = None) -> Dict[str, Any]:
    out = {}
    ctx = lock if lock is not None else _NULL_CTX
    with ctx:
        for p in paths:
            try:
                out[p] = get_attr_value(odrv, p)
            except Exception as e:
                out[p] = {"error": str(e)}
    return out


class _NullCtx:
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


_NULL_CTX = _NullCtx()