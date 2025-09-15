import json
import time
from pathlib import Path
from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sock import Sock

from .constants import VERSION  # backend version tag
from . import device_manager
from .telemetry import telemetry_session

# ---- Internal State (in‑memory) ----
_api_cache: Dict[str, Dict[str, Any]] = {}

# ---- Helpers ----
def _repo_root() -> Path:
    # Derive repo root relative to this file (backend/app/app.py -> repo/)
    return Path(__file__).resolve().parents[2]


def _api_json_path(fw_major: int) -> Path:
    # Map major firmware to JSON filename (no hardcoded absolute path)
    if fw_major == 0:
        # 0.5.6
        return _repo_root() / "odriveApiReference05x.json"
    if fw_major == 6:
        return _repo_root() / "odriveApiReference06x.json"
    raise ValueError(f"Unsupported firmware major version: {fw_major}")


def _load_api_metadata(fw_major: int) -> Dict[str, Any]:
    key = str(fw_major)
    if key not in _api_cache:
        path = _api_json_path(fw_major)
        with path.open("r", encoding="utf-8") as f:
            _api_cache[key] = json.load(f)
    return _api_cache[key]


def _detect_fw_major(odrv) -> int:
    # ODrive objects expose fw_version_major attribute
    try:
        return int(getattr(odrv, "fw_version_major"))
    except Exception as e:
        raise RuntimeError(f"Failed to read firmware major: {e}") from e


# ---- Flask App Factory ----
def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    sock = Sock(app)

    @app.route("/api/backend/version", methods=["GET"])
    def backend_version():
        return jsonify({
            "backend_version": VERSION,
            "api_cache_keys": list(_api_cache.keys())
        })

    @app.route("/api/devices", methods=["GET"])
    def list_devices():
        found = device_manager.discover_and_index()
        return jsonify(found)

    @app.route("/api/devices/<serial>/api-metadata", methods=["GET"])
    def device_api_metadata(serial: str):
        try:
            odrv = device_manager.attach_or_get(serial)
            fw_major = _detect_fw_major(odrv)
            meta = _load_api_metadata(fw_major)
            section = request.args.get("section")
            if section:
                if section not in meta:
                    return jsonify({"error": f"Section '{section}' not in metadata"}), 400
                return jsonify({section: meta[section], "version": meta.get("version")})
            return jsonify(meta)
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/api/devices/<serial>/read", methods=["POST"])
    def read_properties(serial: str):
        """
        Body:
        {
          "paths": ["axis0.controller.input_pos", "..."]
        }
        """
        data = request.get_json(silent=True) or {}
        paths: List[str] = data.get("paths") or []
        if not paths:
            return jsonify({"error": "paths required"}), 400
        try:
            odrv = device_manager.attach_or_get(serial)
            results = device_manager.batch_read(odrv, paths)
            return jsonify(results)
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/api/devices/<serial>/write", methods=["POST"])
    def write_properties(serial: str):
        """
        Body:
        {
          "writes": [
            {"path": "axis0.controller.input_pos", "value": 1.234},
            ...
          ]
        }
        """
        payload = request.get_json(silent=True) or {}
        writes = payload.get("writes")
        if not isinstance(writes, list) or not writes:
            return jsonify({"error": "writes must be non-empty list"}), 400
        try:
            odrv = device_manager.attach_or_get(serial)
            results = []
            for item in writes:
                path = item.get("path")
                value = item.get("value")
                if not path:
                    results.append({"path": path, "status": "error", "error": "missing path"})
                    continue
                try:
                    device_manager.set_attr_value(odrv, path, value)
                    results.append({"path": path, "status": "ok"})
                except Exception as e:
                    results.append({"path": path, "status": "error", "error": str(e)})
            return jsonify(results)
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/api/devices/<serial>/command", methods=["POST"])
    def invoke_command(serial: str):
        """
        Body:
        {
          "path": "axis0.controller.move_incremental",
          "args": [displacement, from_input_pos]
        }
        """
        body = request.get_json(silent=True) or {}
        path = body.get("path")
        args = body.get("args", [])
        if not path:
            return jsonify({"error": "path required"}), 400
        try:
            odrv = device_manager.attach_or_get(serial)
            # reuse device_manager resolver (internal helper)
            func = device_manager._resolve_attr(odrv, path)
            if not callable(func):
                return jsonify({"error": f"Attribute at '{path}' not callable"}), 400
            result = func(*args)
            return jsonify({"path": path, "result": result})
        except Exception as e:
            return jsonify({"error": str(e), "path": path}), 400

    @sock.route("/api/devices/<serial>/telemetry")
    def ws_telemetry(ws, serial):
        try:
            telemetry_session(ws, serial)
        except Exception as e:
            try:
                ws.send(json.dumps({"error": str(e)}))
            except Exception:
                pass

    return app