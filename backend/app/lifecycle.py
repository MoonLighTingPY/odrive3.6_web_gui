"""Lifecycle helpers for the standalone desktop app.

Only active when ODRIVE_GUI_STANDALONE=1 (set by run_standalone). Provides:
  - a heartbeat watchdog so the process exits after the browser tab is closed,
  - a /api/shutdown and /api/heartbeat endpoint pair,
so the user no longer has to kill the process manually. Single-instance
detection lives in run_standalone (it must run before the server binds).
"""

from __future__ import annotations

import logging
import os
import socket
import threading
import time

log = logging.getLogger(__name__)

# Exit if no heartbeat is received within this window (the UI pings every 5 s).
HEARTBEAT_TIMEOUT_S = 15.0

_last_beat = time.time()
_watch_started = False


def standalone_enabled() -> bool:
    return os.environ.get("ODRIVE_GUI_STANDALONE", "").strip().lower() in ("1", "true", "yes", "on")


def beat() -> None:
    global _last_beat
    _last_beat = time.time()


def stop_process() -> None:
    """Hard-exit the process; used by the quit button and the watchdog."""
    log.info("Shutting down ODrive GUI")
    os._exit(0)


def start_watchdog() -> None:
    """Background thread: exit if the UI stops sending heartbeats."""
    global _watch_started
    if _watch_started:
        return
    _watch_started = True

    def _loop():
        # Grace period for the first browser load.
        time.sleep(HEARTBEAT_TIMEOUT_S)
        while True:
            if time.time() - _last_beat > HEARTBEAT_TIMEOUT_S:
                log.info("No UI heartbeat for %.0fs; exiting", HEARTBEAT_TIMEOUT_S)
                stop_process()
            time.sleep(2.0)

    threading.Thread(target=_loop, daemon=True).start()


def port_in_use(host: str, port: int) -> bool:
    """True if something is already listening on host:port (another instance)."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host if host != "0.0.0.0" else "127.0.0.1", port)) == 0
