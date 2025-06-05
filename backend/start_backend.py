import os
import sys
import time
import threading
import webbrowser
import importlib.util

class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'

def colored_print(message, color=Colors.WHITE):
    """Print colored message to console"""
    print(f"{color}{message}{Colors.RESET}")

def check_dependencies():
    """Check if all required dependencies are available"""
    required_modules = [
        ('flask', 'Flask'),
        ('flask_cors', 'Flask-CORS'),
        ('odrive', 'ODrive library')
    ]
    
    missing_modules = []
    
    for module_name, display_name in required_modules:
        try:
            importlib.import_module(module_name)
            colored_print(f"✓ {display_name} found", Colors.GREEN)
        except ImportError:
            colored_print(f"✗ {display_name} not found", Colors.RED)
            missing_modules.append(display_name)
    
    if missing_modules:
        colored_print(f"\n❌ Missing required modules: {', '.join(missing_modules)}", Colors.RED)
        colored_print("Please install them using: pip install flask flask-cors odrive", Colors.YELLOW)
        return False
    
    return True

def is_running_as_executable():
    """Check if we're running as a PyInstaller executable"""
    return getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS')

def open_browser():
    """Open the web browser after a short delay to ensure the server is running"""
    time.sleep(3)  # Wait 3 seconds for the server to start
    try:
        webbrowser.open('http://localhost:5000', new=2)
        colored_print("🌐 Browser opened automatically", Colors.CYAN)
    except Exception as e:
        colored_print(f"⚠️ Could not open browser: {e}", Colors.YELLOW)
        colored_print("   Please open: http://localhost:5000", Colors.WHITE)

def main():
    """Main entry point for starting the ODrive GUI backend"""
    colored_print("🚀 ODrive GUI v3.6 Backend Starting...", Colors.CYAN)
    
    if is_running_as_executable():
        colored_print("📦 Running as executable", Colors.BLUE)
    else:
        colored_print("🔧 Running in development mode", Colors.BLUE)
    
    # Check dependencies
    if not check_dependencies():
        if is_running_as_executable():
            input("Press Enter to close...")
        return 1
    
    colored_print("🔧 Initializing ODrive GUI...", Colors.BLUE)
    
    try:
        # Import Flask app
        from app import app
        
        colored_print("🚀 Starting ODrive GUI server...", Colors.GREEN)
        
        # Only open browser if running standalone (not from tray) AND not disabled
        should_open_browser = (is_running_as_executable() and 
                              os.environ.get('ODRIVE_NO_AUTO_BROWSER') != '1')
        
        if should_open_browser:
            colored_print("📦 Running as standalone executable - browser will open automatically", Colors.CYAN)
            browser_thread = threading.Thread(target=open_browser, daemon=True)
            browser_thread.start()
        else:
            colored_print("🔧 Browser opening disabled or running from tray app", Colors.BLUE)
            colored_print("   Open: http://localhost:5000", Colors.WHITE)
        
        # Start the Flask server
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except KeyboardInterrupt:
        colored_print("\n👋 ODrive GUI Backend stopped", Colors.YELLOW)
        return 0
    except Exception as e:
        colored_print(f"\n❌ Error: {e}", Colors.RED)
        if is_running_as_executable():
            input("Press Enter to close...")
        return 1

if __name__ == '__main__':
    sys.exit(main())