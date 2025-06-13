import sys
import os
import threading
import time
import webbrowser
import subprocess
import logging
import psutil
import socket
from tkinter import messagebox, Tk
from PIL import Image
import pystray
from pystray import MenuItem as item

# Configure logging for debugging - disable file logging for executable
if getattr(sys, 'frozen', False):
    # Running as executable - only console logging
    logging.basicConfig(
        level=logging.WARNING,  # Reduce log level for executable
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler()
        ]
    )
else:
    # Running as script - include file logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('odrive_tray.log'),
            logging.StreamHandler()
        ]
    )

logger = logging.getLogger(__name__)

from app.constants import VERSION

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

    def check_existing_instances(self):
        """Check for existing ODrive GUI instances and handle them"""
        try:
            # Check for running ODrive processes
            current_pid = os.getpid()
            current_exe = psutil.Process(current_pid).exe() if hasattr(psutil.Process(current_pid), 'exe') else None
            odrive_processes = []
            
            for proc in psutil.process_iter(['pid', 'name', 'exe']):
                try:
                    proc_info = proc.info
                    if proc_info['pid'] != current_pid and proc_info['name']:
                        # More specific check - only look for exact executable names
                        if proc_info['name'].lower() in ['odrive_gui_tray.exe', 'tray_app.exe']:
                            # Additional check: make sure it's not the same executable path
                            if current_exe and proc_info['exe'] == current_exe:
                                continue  # Skip if it's the same executable (shouldn't happen but safety check)
                            odrive_processes.append(proc)
                        # Check for Python processes only if they're running specific ODrive scripts
                        elif 'python' in proc_info['name'].lower() and proc_info['exe']:
                            try:
                                cmdline = proc.cmdline()
                                # Only detect if explicitly running tray_app.py (not just any odrive script)
                                if any('tray_app.py' in arg for arg in cmdline):
                                    odrive_processes.append(proc)
                            except:
                                pass
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            # Check if port 5000 is already in use (backend running)
            port_in_use = self.is_port_in_use(5000)
            
            if odrive_processes or port_in_use:
                return self.handle_existing_instances(odrive_processes, port_in_use)
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking existing instances: {e}")
            return True  # Continue anyway

    def is_port_in_use(self, port):
        """Check if a port is already in use"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                result = sock.connect_ex(('localhost', port))
                return result == 0
        except:
            return False

    def handle_existing_instances(self, processes, port_in_use):
        """Handle existing ODrive GUI instances"""
        try:
            # Create a hidden root window for the message box
            root = Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            
            # Simplified message
            message = "ODrive GUI is already running!\n\nDo you want to close the existing instance?"
            
            # Show simple yes/no dialog
            result = messagebox.askyesno(
                "ODrive GUI Already Running",
                message,
                icon='question'
            )
            
            root.destroy()
            
            if result:  # YES - Close existing and continue
                logger.info("User chose to close existing instances")
                self.close_existing_instances(processes)
                return True
            else:  # NO - Cancel this instance
                logger.info("User chose to cancel this instance")
                return False
                
        except Exception as e:
            logger.error(f"Error showing dialog: {e}")
            # If GUI dialog fails, just continue
            return True

    def close_existing_instances(self, processes):
        """Close existing ODrive GUI processes"""
        closed_count = 0
        for proc in processes:
            try:
                logger.info(f"Terminating process: {proc.info['name']} (PID: {proc.info['pid']})")
                proc.terminate()
                
                # Wait up to 5 seconds for graceful termination
                try:
                    proc.wait(timeout=5)
                    closed_count += 1
                except psutil.TimeoutExpired:
                    # Force kill if it doesn't terminate gracefully
                    logger.warning(f"Force killing process {proc.info['pid']}")
                    proc.kill()
                    closed_count += 1
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                logger.warning(f"Could not terminate process {proc.info['pid']}: {e}")
                continue
                
        if closed_count > 0:
            logger.info(f"Successfully closed {closed_count} existing instances")
            # Wait a moment for ports to be released
            time.sleep(2)

    def update_status(self, new_status):
        """Update the status and refresh the menu"""
        self.status = new_status
        logger.info(f"Status updated: {new_status}")
        if self.icon:
            # Update the menu and tooltip to reflect new status
            self.icon.menu = self.create_menu()
            self.icon.title = f"ODrive GUI ({VERSION}) - {self.status}"

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
                    import app.app as flask_app  # Updated import path
                    logger.info("Flask app imported successfully")
                    
                    # Disable auto-browser opening in the backend
                    os.environ['ODRIVE_NO_AUTO_BROWSER'] = '1'
                    
                    self.update_status("Backend Starting...")
                    flask_app.app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
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
            
            # Check for existing instances first
            if not self.check_existing_instances():
                logger.info("User cancelled due to existing instances")
                return
            
            # Create the tray icon immediately (don't wait for backend)
            image = self.create_image()
            
            # Create initial menu with tooltip
            self.icon = pystray.Icon(
                "ODrive GUI", 
                image, 
                menu=self.create_menu(),
                title=f"ODrive GUI ({VERSION}) - {self.status}"
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