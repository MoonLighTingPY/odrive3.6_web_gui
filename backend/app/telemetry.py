import json
import time
from typing import List, Dict, Any

from .device_manager import attach_or_get, get_attr_value


def telemetry_session(ws, serial: str):
    """
    Per-connection loop.
    Client protocol:
      -> {"action": "subscribe", "paths": [...], "interval_ms": 100}
      -> {"action": "update", "paths": [...]}  (optional)
      -> {"action": "interval", "interval_ms": 200}
    Server pushes:
      <- {"timestamp": <ms>, "data": { path: value, ... }}
    """
    paths: List[str] = []
    interval_ms = 200
    odrv = attach_or_get(serial)

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

        if paths:
            data: Dict[str, Any] = {}
            for p in paths:
                try:
                    data[p] = get_attr_value(odrv, p)
                except Exception as e:
                    data[p] = None  # keep silent; avoid flooding errors
            ws.send(json.dumps({
                "timestamp": int(time.time() * 1000),
                "data": data
            }))
        time.sleep(interval_ms / 1000.0)