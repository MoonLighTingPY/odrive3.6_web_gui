import sys
import os
import threading
import time
import webbrowser
import subprocess
import logging
from PIL import Image
import pystray
from pystray import MenuItem as item

# Configure logging for debugging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('odrive_tray.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Force import the Flask backend modules
try:
    import app
    import start_backend
    logger.info("Successfully imported Flask backend modules")
except ImportError as e:
    logger.error(f"Failed to import Flask backend modules: {e}")
    sys.exit(1)

class ODriveTrayApp:
    def __init__(self):
        self.backend_process = None
        self.backend_thread = None
        self.icon = None
        self.backend_started = False
        logger.info("ODrive Tray App initialized")
        
    def start_backend(self):
        """Start the Flask backend in a separate thread"""
        try:
            logger.info("Starting Flask backend...")
            
            def run_backend():
                try:
                    # Import and run the Flask app directly (avoid start_backend.py auto-browser)
                    from app import app as flask_app
                    logger.info("Flask app imported successfully")
                    
                    # Disable auto-browser opening in the backend
                    os.environ['ODRIVE_NO_AUTO_BROWSER'] = '1'
                    
                    # For PyInstaller compatibility, we need to serve static files differently
                    if hasattr(sys, '_MEIPASS'):
                        # Running as PyInstaller bundle
                        static_folder = os.path.join(sys._MEIPASS, 'static')
                        logger.info(f"PyInstaller detected, using static folder: {static_folder}")
                        
                        # Update Flask app to use the correct static folder
                        flask_app.static_folder = static_folder
                        flask_app.static_url_path = '/static'
                    
                    # Configure Flask for production when bundled
                    flask_app.config['ENV'] = 'production'
                    flask_app.config['DEBUG'] = False
                    
                    logger.info("Starting Flask server on http://localhost:5000")
                    flask_app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False, threaded=True)
                    
                except Exception as e:
                    logger.error(f"Error running Flask backend: {e}")
                    import traceback
                    logger.error(traceback.format_exc())
                    
            self.backend_thread = threading.Thread(target=run_backend, daemon=True)
            self.backend_thread.start()
            
            # Wait longer for backend to start
            logger.info("Waiting for backend to start...")
            time.sleep(5)
            
            # Test if backend is responding
            try:
                import requests
                
                # First check if the main page loads
                logger.info("Testing backend connection...")
                response = requests.get('http://localhost:5000/', timeout=10)
                if response.status_code == 200:
                    logger.info("Backend started successfully and serving main page")
                    self.backend_started = True
                    return True
                else:
                    logger.error(f"Backend main page responding with status code: {response.status_code}")
                    
                # Fallback: check API endpoint
                response = requests.get('http://localhost:5000/api/odrive/scan', timeout=10)
                if response.status_code in [200, 404, 500]:  # Any response means Flask is running
                    logger.info("Backend started successfully (API responding)")
                    self.backend_started = True
                    return True
                else:
                    logger.error(f"Backend API responding with status code: {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                logger.error("Backend not responding - connection refused")
            except Exception as e:
                logger.error(f"Backend connection test failed: {e}")
                
        except Exception as e:
            logger.error(f"Failed to start backend: {e}")
            import traceback
            logger.error(traceback.format_exc())
            
        return False
    
    def open_gui(self, icon=None, item=None):
        """Open the GUI in the default browser"""
        try:
            if not self.backend_started:
                logger.warning("Backend not started, attempting to start...")
                if not self.start_backend():
                    logger.error("Failed to start backend")
                    return
                    
            url = "http://localhost:5000"
            logger.info(f"Opening GUI at {url}")
            webbrowser.open(url)
        except Exception as e:
            logger.error(f"Failed to open GUI: {e}")
    
    def quit_app(self, icon=None, item=None):
        """Quit the application"""
        logger.info("Shutting down ODrive Tray App")
        if self.icon:
            self.icon.stop()
    
    def create_image(self):
        """Create the tray icon image"""
        try:
            # Try to load the custom icon
            icon_paths = [
                'servo.ico',
                os.path.join(os.path.dirname(__file__), 'servo.ico'),
                os.path.join(sys._MEIPASS, 'servo.ico') if hasattr(sys, '_MEIPASS') else None
            ]
            
            for icon_path in icon_paths:
                if icon_path and os.path.exists(icon_path):
                    logger.info(f"Loading icon from {icon_path}")
                    return Image.open(icon_path)
            
            logger.warning("Custom icon not found, creating default icon")
            # Create a simple default icon
            image = Image.new('RGB', (64, 64), color='blue')
            return image
            
        except Exception as e:
            logger.error(f"Failed to create icon: {e}")
            # Fallback to a simple colored square
            return Image.new('RGB', (64, 64), color='red')
    
    def run(self):
        """Run the tray application"""
        try:
            logger.info("Starting ODrive Tray Application")
            
            # Start the backend first
            if not self.start_backend():
                logger.error("Failed to start backend, continuing anyway...")
            
            # Create the tray icon
            image = self.create_image()
            menu = pystray.Menu(
                item('Open ODrive GUI', self.open_gui),
                item('Exit', self.quit_app)
            )
            
            self.icon = pystray.Icon("ODrive GUI", image, menu=menu)
            
            # Auto-open GUI on startup (only once from tray app)
            threading.Timer(2.0, self.open_gui).start()
            
            logger.info("Tray icon created, starting main loop")
            self.icon.run()
            
        except Exception as e:
            logger.error(f"Failed to run tray app: {e}")
            input("Press Enter to close...")

if __name__ == '__main__':
    app = ODriveTrayApp()
    app.run()