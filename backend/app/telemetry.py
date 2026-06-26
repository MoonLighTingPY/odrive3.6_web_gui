import json
import logging
import time
from typing import List, Dict, Any

from .device_manager import (
    attach_or_get,
    get_attr_value,
    set_attr_value,
    invoke,
    io_lock,
)

log = logging.getLogger(__name__)


def telemetry_session(ws, serial: str):
    """
    Per-connection loop carrying both the telemetry stream and request/response
    operations, so a single WebSocket replaces the old REST read/write/command
    calls and never contends with the stream on the USB device.

    Client -> server:
      {"action": "subscribe", "paths": [...], "interval_ms": 100}
      {"action": "update",   "paths": [...]}
      {"action": "interval", "interval_ms": 200}
      {"action": "ping"}
      {"action": "read",    "id": <n>, "paths": [...]}
      {"action": "write",   "id": <n>, "writes": [{path, value}]}
      {"action": "command", "id": <n>, "path": "...", "args": [...]}
    Server -> client:
      {"timestamp": <ms>, "data": { path: value | {error}, ... }}   (stream)
      {"id": <n>, "ok": true, "result": ...} | {"id": <n>, "ok": false, "error": ...}
    """
    paths: List[str] = []
    interval_ms = 200
    odrv = attach_or_get(serial)
    lock = io_lock(serial)

    while True:
        try:
            msg_raw = ws.receive(timeout=0.0)
        except Exception:
            msg_raw = None

        if msg_raw:
            try:
                msg = json.loads(msg_raw)
            except Exception:
                ws.send(json.dumps({"error": "invalid_json"}))
                continue
            action = msg.get("action")
            if action == "subscribe":
                new_paths = msg.get("paths") or []
                if not isinstance(new_paths, list):
                    ws.send(json.dumps({"error": "paths_must_be_list"}))
                    continue
                paths = list(dict.fromkeys(new_paths))  # dedupe preserve order
                intv = msg.get("interval_ms")
                if isinstance(intv, int) and 10 <= intv <= 2000:
                    interval_ms = intv
                ws.send(json.dumps({"ack": "subscribe", "count": len(paths), "interval_ms": interval_ms}))
            elif action == "update":
                new_paths = msg.get("paths") or []
                if isinstance(new_paths, list):
                    paths = list(dict.fromkeys(new_paths))
                    ws.send(json.dumps({"ack": "update", "count": len(paths)}))
            elif action == "interval":
                intv = msg.get("interval_ms")
                if isinstance(intv, int) and 10 <= intv <= 2000:
                    interval_ms = intv
                    ws.send(json.dumps({"ack": "interval", "interval_ms": interval_ms}))
            elif action == "ping":
                ws.send(json.dumps({"ack": "pong"}))
            elif action in ("read", "write", "command"):
                ws.send(json.dumps(_handle_request(odrv, lock, msg)))

        if paths:
            data: Dict[str, Any] = {}
            with lock:
                for p in paths:
                    try:
                        data[p] = get_attr_value(odrv, p)
                    except Exception as e:
                        # Surface the failure instead of a silent None so the
                        # client can tell "unreadable" from a real value.
                        data[p] = {"error": str(e)}
                        log.debug("telemetry read failed for %s: %s", p, e)
            ws.send(json.dumps({
                "timestamp": int(time.time() * 1000),
                "data": data
            }))
        time.sleep(interval_ms / 1000.0)


def _handle_request(odrv, lock, msg: Dict[str, Any]) -> Dict[str, Any]:
    """Run a read/write/command request under the device lock and return a
    response frame keyed by the client-supplied id."""
    rid = msg.get("id")
    action = msg.get("action")
    try:
        with lock:
            if action == "read":
                out: Dict[str, Any] = {}
                for p in (msg.get("paths") or []):
                    try:
                        out[p] = get_attr_value(odrv, p)
                    except Exception as e:
                        out[p] = {"error": str(e)}
                return {"id": rid, "ok": True, "result": out}
            if action == "write":
                results = []
                for item in (msg.get("writes") or []):
                    path = item.get("path")
                    if not path:
                        results.append({"path": path, "status": "error", "error": "missing path"})
                        continue
                    try:
                        set_attr_value(odrv, path, item.get("value"))
                        results.append({"path": path, "status": "ok"})
                    except Exception as e:
                        results.append({"path": path, "status": "error", "error": str(e)})
                return {"id": rid, "ok": True, "result": results}
            path = msg.get("path")
            if not path:
                return {"id": rid, "ok": False, "error": "path required"}
            result = invoke(odrv, path, msg.get("args") or [])
            return {"id": rid, "ok": True, "result": result}
    except Exception as e:
        return {"id": rid, "ok": False, "error": str(e)}