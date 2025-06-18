import threading
import logging
import os
import sys
from typing import Dict, Any
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from collections import defaultdict

# Import our modules - using relative imports
from .odrive_manager import ODriveManager
from .utils.utils import is_running_as_executable, open_browser
from .constants import VERSION

# Import route blueprints - using relative imports
from .routes.device_routes import device_bp, init_routes as init_device_routes
from .routes.config_routes import config_bp, init_routes as init_config_routes
from .routes.calibration_routes import calibration_bp, init_routes as init_calibration_routes
from .routes.telemetry_routes import telemetry_bp, init_routes as init_telemetry_routes
from .routes.system_routes import system_bp

current_version = VERSION

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Handle static files for PyInstaller
if hasattr(sys, '_MEIPASS'):
    static_folder = os.path.join(sys._MEIPASS, 'static')
    template_folder = os.path.join(sys._MEIPASS, 'static')
else:
    # Fix the path - we're now in backend/app/, so we need to go up two levels to reach frontend
    static_folder = '../../frontend/dist'
    template_folder = '../../frontend/dist'

app = Flask(__name__, 
            static_folder=static_folder,
            static_url_path='/static',
            template_folder=template_folder)

CORS(app, origins=["http://localhost:3000"])
last_api_call = defaultdict(float)
API_RATE_LIMIT = 0.1

# Global variables
connected_odrives: Dict[str, Any] = {}
current_odrive = None
device_state_cache = {}
last_update_time = 0

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

@app.route('/')
def index():
    """Serve the main frontend application"""
    try:
        if hasattr(sys, '_MEIPASS'):
            return send_from_directory(app.static_folder, 'index.html')
        else:
            # Fix the path for development mode
            return send_from_directory('../../frontend/dist', 'index.html')
    except Exception as e:
        return f"Error serving index: {e}", 500

@app.route('/<path:path>')
def catch_all(path):
    try:
        if hasattr(sys, '_MEIPASS'):
            file_path = os.path.join(app.static_folder, path)
        else:
            # Fix the path for development mode
            file_path = os.path.join('../../frontend/dist', path)
            
        if os.path.exists(file_path):
            return send_from_directory(os.path.dirname(file_path), os.path.basename(file_path))
        else:
            return index()
    except Exception as e:
        return f"Error serving file: {e}", 500

# Initialize ODrive manager
odrive_manager = ODriveManager()

# Register blueprints and initialize routes
app.register_blueprint(device_bp)
app.register_blueprint(config_bp)
app.register_blueprint(calibration_bp)
app.register_blueprint(telemetry_bp)
app.register_blueprint(system_bp)

# Initialize routes with ODrive manager
init_device_routes(odrive_manager)
init_config_routes(odrive_manager)
init_calibration_routes(odrive_manager)
init_telemetry_routes(odrive_manager)

@app.after_request
def after_request(response):
    # Add headers to prevent caching of telemetry data
    if request.path.startswith('/api/telemetry') or request.path.startswith('/api/odrive/telemetry'):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

if __name__ == '__main__':
    print("🚀 Starting ODrive GUI Backend...")
    
    should_open_browser = (is_running_as_executable() and 
                          os.environ.get('ODRIVE_NO_AUTO_BROWSER') != '1' and
                          not sys.argv[0].endswith('tray_app.exe'))
    
    if should_open_browser:
        print("📦 Running as executable - browser will open automatically")
        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()
    else:
        print("🔧 Running in development mode or browser disabled by tray app")
        print("   Open: http://localhost:5000")
    
    try:
        logger.info("Starting ODrive GUI Backend v0.5.6")
        app.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        print("\n👋 ODrive GUI Backend stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        if is_running_as_executable():
            input("Press Enter to close...")