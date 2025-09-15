import json
import threading
from typing import Any, Dict, List, Iterable, Optional

_device_lock = threading.Lock()
_device_index: Dict[str, Any] = {}  # serial -> odrive handle


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
    return f"<object:{val.__class__.__name__}>"


def set_attr_value(root: Any, dotted: str, value: Any):
    parts = dotted.split(".")
    parent = _resolve_attr(root, ".".join(parts[:-1])) if len(parts) > 1 else root
    leaf = parts[-1]
    if not hasattr(parent, leaf):
        raise AttributeError(f"Leaf attribute '{leaf}' not found in '{dotted}'")
    setattr(parent, leaf, value)


def attach_or_get(serial: str) -> Any:
    with _device_lock:
        if serial in _device_index:
            return _device_index[serial]

    import odrive  # lazy import
    od = odrive.find_any(timeout=1.0)
    if not od:
        raise ValueError(f"Device with serial '{serial}' not found")
    found_serial = str(getattr(od, "serial_number", "")).lower()
    if found_serial != serial.lower():
        raise ValueError(f"Device with serial '{serial}' not found (found '{found_serial}')")
    with _device_lock:
        _device_index[serial] = od
    return od


def discover_and_index() -> List[Dict[str, Any]]:
    import odrive
    od = odrive.find_any(timeout=1.0)
    found = []
    with _device_lock:
        _device_index.clear()
        if od:
            ser = str(getattr(od, "serial_number", ""))
            _device_index[ser] = od
            found.append(serialize_device(od))
    return found


def batch_read(odrv: Any, paths: Iterable[str]) -> Dict[str, Any]:
    out = {}
    for p in paths:
        try:
            out[p] = get_attr_value(odrv, p)
        except Exception as e:
            out[p] = {"error": str(e)}
    return out