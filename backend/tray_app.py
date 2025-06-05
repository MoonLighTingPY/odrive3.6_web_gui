#!/usr/bin/env python3
"""
ODrive GUI System Tray Application
For ODrive firmware v0.5.6
"""

import sys
import os
import threading
import time
import webbrowser
from PIL import Image
import pystray
from pystray import MenuItem as item
import app             # backend/app.py: Flask app
import start_backend   # backend/start_backend.py: startup script

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def get_icon_path():
    """Get the correct icon path for both development and PyInstaller"""
    if getattr(sys, 'frozen', False):
        # Running as PyInstaller bundle
        base_path = sys._MEIPASS
    else:
        # Running in development
        base_path = os.path.dirname(__file__)
    
    # Try different icon locations - prioritize .ico files
    icon_paths = [
        os.path.join(base_path, 'servo.ico'),  # First priority
        os.path.join(base_path, 'servo.png'),
        os.path.join(base_path, '..', 'frontend', 'public', 'servo.ico'),
        os.path.join(base_path, '..', 'frontend', 'public', 'servo.png'),
    ]
    
    for path in icon_paths:
        if os.path.exists(path):
            print(f"✓ Found icon: {path}")  # Debug info
            return path
    
    print("⚠️ No servo icon found, will create fallback")
    return None

def create_icon_image():
    """Create system tray icon"""
    icon_path = get_icon_path()
    
    if icon_path and os.path.exists(icon_path):
        try:
            print(f"🎨 Loading icon from: {icon_path}")
            # Load the existing icon
            icon = Image.open(icon_path)
            
            # Convert to RGBA if not already
            if icon.mode != 'RGBA':
                icon = icon.convert('RGBA')
            
            # Resize to appropriate size for system tray (32x32 is more standard)
            icon = icon.resize((32, 32), Image.Resampling.LANCZOS)
            print("✓ Successfully loaded servo.ico for tray")
            return icon
            
        except Exception as e:
            print(f"❌ Could not load icon from {icon_path}: {e}")
    
    # Create a simple fallback icon only if servo.ico is not found
    print("🔧 Creating fallback icon")
    width = 32
    height = 32
    image = Image.new('RGBA', (width, height), color=(0, 0, 0, 0))
    
    # Draw a simple ODrive-like icon
    from PIL import ImageDraw
    draw = ImageDraw.Draw(image)
    
    # Draw outer circle
    draw.ellipse([2, 2, 30, 30], fill='#00d4aa', outline='white', width=1)
    # Draw inner circle
    draw.ellipse([10, 10, 22, 22], fill='white')
    # Draw center dot
    draw.ellipse([14, 14, 18, 18], fill='#00d4aa')
    
    return image

class ODriveTrayApp:
    def __init__(self):
        self.server_thread = None
        self.icon = None
        self.server_started = False
        
    def start_server(self):
        """Start Flask server in background"""
        if not self.server_started:
            try:
                # Import Flask app
                from app import app
                
                print("🚀 Starting ODrive GUI server...")
                
                # Start Flask server
                app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
                
            except Exception as e:
                print(f"❌ Failed to start server: {e}")
                # Update tray icon to show error state
                if self.icon:
                    self.icon.title = f"ODrive GUI - Error: {str(e)[:50]}"
    
    def open_gui(self, icon=None, item=None):
        """Open GUI in browser"""
        try:
            webbrowser.open('http://127.0.0.1:5000', new=2)
            print("🌐 Opened ODrive GUI in browser")
            if self.icon:
                self.icon.title = "ODrive GUI - Running (GUI opened)"
        except Exception as e:
            print(f"⚠️ Could not open browser: {e}")
            if self.icon:
                self.icon.title = f"ODrive GUI - Browser error"
    
    def quit_app(self, icon=None, item=None):
        """Quit the application"""
        print("👋 ODrive GUI shutting down...")
        if self.icon:
            self.icon.stop()
        # Force exit (Flask doesn't always shutdown cleanly)
        os._exit(0)
    
    def run(self):
        """Run the tray application"""
        print("🔧 Initializing ODrive GUI...")
        
        # Start server in background thread
        self.server_thread = threading.Thread(target=self.start_server, daemon=True)
        self.server_thread.start()
        
        # Wait a moment for server to start
        time.sleep(2)
        self.server_started = True
        
        # Create system tray menu
        menu = pystray.Menu(
            item("Open ODrive GUI", self.open_gui, default=True),
            pystray.Menu.SEPARATOR,
            item("Exit", self.quit_app)
        )
        
        # Create system tray icon
        icon_image = create_icon_image()
        self.icon = pystray.Icon(
            "ODrive GUI v0.5.6",
            icon_image,
            title="ODrive GUI v0.5.6 - Starting...",
            menu=menu
        )
        
        # Auto-open GUI after startup
        def auto_open():
            time.sleep(3)  # Wait for server to fully start
            self.open_gui()
            if self.icon:
                self.icon.title = "ODrive GUI v0.5.6 - Ready"
        
        threading.Timer(0.5, auto_open).start()
        
        # Run the tray icon (this blocks)
        print("✅ ODrive GUI system tray started")
        print("   - Left click tray icon to open GUI")
        print("   - Right click for menu options")
        
        try:
            self.icon.run()
        except KeyboardInterrupt:
            print("\n👋 ODrive GUI stopped by user")
        except Exception as e:
            print(f"\n❌ Tray application error: {e}")
        finally:
            self.quit_app()

if __name__ == '__main__':
    app = ODriveTrayApp()
    app.run()