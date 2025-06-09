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

class ODriveTrayApp:
    def __init__(self):
        self.backend_process = None
        self.backend_thread = None
        self.icon = None
        self.backend_started = False
        self.gui_opened = False
        self.backend_starting = False
        self.status = "Starting..."
        logger.info("ODrive Tray App initialized")

    def update_status(self, new_status):
        """Update the status and refresh the menu"""
        self.status = new_status
        logger.info(f"Status updated: {new_status}")
        if self.icon:
            # Update the menu and tooltip to reflect new status
            self.icon.menu = self.create_menu()
            self.icon.title = f"ODrive GUI - {self.status}"

    def start_backend(self):
        """Start the Flask backend in a separate thread - non-blocking"""
        try:
            self.backend_starting = True
            self.update_status("Starting Backend...")
            logger.info("Starting Flask backend...")
            
            def run_backend():
                try:
                    # Import Flask modules in the background thread to avoid blocking UI
                    self.update_status("Loading Modules...")
                    import app
                    logger.info("Flask app imported successfully")
                    
                    # Disable auto-browser opening in the backend
                    os.environ['ODRIVE_NO_AUTO_BROWSER'] = '1'
                    
                    self.update_status("Backend Starting...")
                    app.app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
                except Exception as e:
                    logger.error(f"Error running Flask backend: {e}")
                    self.update_status("Backend Failed")
            
            self.backend_thread = threading.Thread(target=run_backend, daemon=True)
            self.backend_thread.start()
            
            # Don't wait for backend to start - let it start in background
            logger.info("Backend thread started")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start backend: {e}")
            self.update_status("Start Failed")
            return False

    def check_backend_ready(self):
        """Check if backend is ready in background"""
        def check_ready():
            max_attempts = 30  # 30 seconds max wait
            for attempt in range(max_attempts):
                try:
                    import requests
                    response = requests.get('http://localhost:5000/api/health', timeout=2)
                    if response.status_code == 200:
                        logger.info(f"Backend ready after {attempt + 1} seconds")
                        self.backend_started = True
                        self.backend_starting = False
                        self.update_status("Ready")
                        
                        # Auto-open GUI after backend is ready
                        if not self.gui_opened:
                            self.gui_opened = True
                            time.sleep(0.5)  # Small delay to ensure backend is fully ready
                            self.open_gui()
                        return
                except:
                    pass  # Continue waiting
                
                # Update status during wait
                if attempt < 10:
                    self.update_status(f"Backend Starting... ({attempt + 1}s)")
                elif attempt < 20:
                    self.update_status(f"Loading ODrive... ({attempt + 1}s)")
                else:
                    self.update_status(f"Almost Ready... ({attempt + 1}s)")
                
                time.sleep(1)
            
            logger.warning("Backend did not become ready within 30 seconds")
            self.update_status("Backend Timeout")
        
        # Check readiness in background thread
        threading.Thread(target=check_ready, daemon=True).start()

    def open_gui(self, icon=None, item=None):
        """Open the GUI in the default browser"""
        try:
            if not self.backend_started:
                logger.warning("Backend not ready yet, please wait...")
                self.update_status("Backend Not Ready")
                return
                    
            url = "http://localhost:5000"
            logger.info(f"Opening GUI at {url}")
            webbrowser.open(url)
            self.gui_opened = True
            self.update_status("GUI Opened")
        except Exception as e:
            logger.error(f"Failed to open GUI: {e}")
            self.update_status("GUI Failed")

    def restart_backend(self, icon=None, item=None):
        """Restart the backend"""
        try:
            self.update_status("Restarting...")
            self.backend_started = False
            self.gui_opened = False
            # Note: The existing backend thread will continue running
            # This starts a new attempt - in a real implementation you'd want to stop the old one
            self.start_backend()
            self.check_backend_ready()
        except Exception as e:
            logger.error(f"Failed to restart backend: {e}")
            self.update_status("Restart Failed")

    def quit_app(self, icon=None, item=None):
        """Quit the application"""
        logger.info("Shutting down ODrive Tray App")
        self.update_status("Shutting Down...")
        if self.icon:
            self.icon.stop()

    def create_image(self):
        """Create the tray icon image - optimized for speed"""
        try:
            # Try to load the custom icon with faster method
            icon_paths = [
                'servo.ico',
                os.path.join(os.path.dirname(__file__), 'servo.ico'),
                os.path.join(sys._MEIPASS, 'servo.ico') if hasattr(sys, '_MEIPASS') else None
            ]
            
            for icon_path in icon_paths:
                if icon_path and os.path.exists(icon_path):
                    logger.info(f"Loading icon from {icon_path}")
                    # Load icon with specific size for better performance
                    img = Image.open(icon_path)
                    # Resize to standard tray icon size if needed
                    if img.size != (32, 32):
                        img = img.resize((32, 32), Image.Resampling.LANCZOS)
                    return img
            
            logger.warning("Custom icon not found, creating default icon")
            # Create a simple default icon quickly
            return Image.new('RGB', (32, 32), color='#4A90E2')
            
        except Exception as e:
            logger.error(f"Failed to create icon: {e}")
            # Fallback to a simple colored square
            return Image.new('RGB', (32, 32), color='#E74C3C')

    def create_menu(self):
        """Create the tray menu without status line"""
        return pystray.Menu(
            item('Open ODrive GUI', 
                 self.open_gui, 
                 enabled=self.backend_started and not self.backend_starting),
            item('Restart Backend', 
                 self.restart_backend, 
                 enabled=not self.backend_starting),
            pystray.Menu.SEPARATOR,
            item('Exit', self.quit_app)
        )

    def run(self):
        """Run the tray application - optimized startup"""
        try:
            logger.info("Starting ODrive Tray Application")
            
            # Create the tray icon immediately (don't wait for backend)
            image = self.create_image()
            
            # Create initial menu with tooltip
            self.icon = pystray.Icon(
                "ODrive GUI", 
                image, 
                menu=self.create_menu(),
                title=f"ODrive GUI - {self.status}"  # Set initial tooltip
            )
            
            # Start backend in background immediately
            self.start_backend()
            
            # Check backend readiness in background
            self.check_backend_ready()
            
            logger.info("Tray icon created, starting main loop")
            self.icon.run()
            
        except Exception as e:
            logger.error(f"Failed to run tray app: {e}")
            input("Press Enter to close...")

if __name__ == '__main__':
    # Move slow imports to after tray icon creation
    try:
        app = ODriveTrayApp()
        app.run()
    except Exception as e:
        logger.error(f"Failed to start tray app: {e}")
        input("Press Enter to close...")