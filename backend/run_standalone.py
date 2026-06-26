"""Standalone launcher for the ODrive Web GUI.

Runs the Flask app (serving both the API and the built frontend) and opens the
browser. Used for the packaged single-process app on Windows and Linux.

This is a localhost, single-user desktop tool, so the threaded Werkzeug server
is appropriate and—unlike waitress—fully supports the telemetry WebSocket via
flask-sock. Configure with env vars:

    ODRIVE_GUI_HOST   (default 127.0.0.1)
    ODRIVE_GUI_PORT   (default 5000)
    ODRIVE_GUI_NO_BROWSER=1   to skip opening the browser
    ODRIVE_MOCK=1     to run without hardware
"""

from __future__ import annotations

import logging
import os
import threading
import webbrowser

from app.app import create_app
from app.constants import VERSION
from app.paths import frontend_dist
from app import lifecycle


def _open_browser(url: str) -> None:
    try:
        webbrowser.open(url)
    except Exception:  # pragma: no cover - browser is best-effort
        logging.getLogger(__name__).warning("Could not open browser at %s", url)


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    log = logging.getLogger("odrive_gui")

    host = os.environ.get("ODRIVE_GUI_HOST", "127.0.0.1")
    port = int(os.environ.get("ODRIVE_GUI_PORT", "5000"))
    url = f"http://{host if host != '0.0.0.0' else 'localhost'}:{port}"

    # Single instance: if the port is already serving, just open that one.
    if lifecycle.port_in_use(host, port):
        log.info("ODrive GUI already running at %s; opening browser instead.", url)
        if not os.environ.get("ODRIVE_GUI_NO_BROWSER"):
            _open_browser(url)
        return

    # Mark this process as the standalone instance so the app exposes shutdown/
    # heartbeat endpoints and self-exits when the browser tab closes.
    os.environ["ODRIVE_GUI_STANDALONE"] = "1"

    app = create_app()
    lifecycle.start_watchdog()

    if frontend_dist() is None:
        log.warning(
            "No built frontend found (frontend/dist). Serving API only. "
            "Run 'npm run build' in frontend/ to enable the standalone UI."
        )
    else:
        log.info("ODrive Web GUI %s serving at %s", VERSION, url)

    if not os.environ.get("ODRIVE_GUI_NO_BROWSER"):
        threading.Timer(1.0, _open_browser, args=[url]).start()

    # threaded=True lets the telemetry WebSocket and API requests run concurrently.
    app.run(host=host, port=port, debug=False, threaded=True, use_reloader=False)


if __name__ == "__main__":
    main()
