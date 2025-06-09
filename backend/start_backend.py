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
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'

def colored_print(message, color=Colors.WHITE):
    """Print colored message to console"""
    try:
        print(f"{color}{message}{Colors.RESET}")
    except UnicodeEncodeError:
        # Fallback for terminals that don't support Unicode
        # Remove emoji and Unicode characters
        import re
        clean_message = re.sub(r'[^\x00-\x7F]+', '', message)
        print(f"{color}{clean_message}{Colors.RESET}")

def check_dependencies():
    """Check if all required dependencies are available"""
    try:
        colored_print("Checking dependencies...", Colors.BLUE)
        
        # Check for ODrive
        if importlib.util.find_spec("odrive") is None:
            colored_print("Error: ODrive library not found!", Colors.RED)
            colored_print("Install with: pip install odrive", Colors.YELLOW)
            return False
            
        # Check for Flask
        if importlib.util.find_spec("flask") is None:
            colored_print("Error: Flask not found!", Colors.RED)
            colored_print("Install with: pip install flask", Colors.YELLOW)
            return False
            
        colored_print("All dependencies found", Colors.GREEN)
        return True
        
    except Exception as e:
        colored_print(f"Error checking dependencies: {e}", Colors.RED)
        return False

def is_running_as_executable():
    """Check if we're running as a PyInstaller executable"""
    return getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS')

def open_browser():
    """Open the web browser after a short delay to ensure the server is running"""
    time.sleep(2)  # Wait for server to start
    try:
        webbrowser.open('http://localhost:5000')
        colored_print("Browser opened to http://localhost:5000", Colors.GREEN)
    except Exception as e:
        colored_print(f"Could not open browser: {e}", Colors.YELLOW)
        colored_print("Please open http://localhost:5000 manually", Colors.WHITE)

def main():
    """Main entry point for starting the ODrive GUI backend"""
    colored_print("ODrive GUI v3.6 Backend Starting...", Colors.CYAN)
    
    if is_running_as_executable():
        colored_print("Running as executable", Colors.BLUE)
    else:
        colored_print("Running in development mode", Colors.BLUE)
    
    # Check dependencies
    if not check_dependencies():
        if is_running_as_executable():
            input("Press Enter to close...")
        return 1
    
    colored_print("Initializing ODrive GUI...", Colors.BLUE)
    
    try:
        # Import Flask app
        from app import app
        
        colored_print("Starting ODrive GUI server...", Colors.GREEN)
        
        # Only open browser if running standalone (not from tray) AND not disabled
        should_open_browser = (is_running_as_executable() and 
                              os.environ.get('ODRIVE_NO_AUTO_BROWSER') != '1')
        
        if should_open_browser:
            colored_print("Running as standalone executable - browser will open automatically", Colors.CYAN)
            browser_thread = threading.Thread(target=open_browser, daemon=True)
            browser_thread.start()
        else:
            colored_print("Browser opening disabled or running from tray app", Colors.BLUE)
            colored_print("   Open: http://localhost:5000", Colors.WHITE)
        
        # Start the Flask server
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except KeyboardInterrupt:
        colored_print("\nODrive GUI Backend stopped", Colors.YELLOW)
        return 0
    except Exception as e:
        colored_print(f"\nError: {e}", Colors.RED)
        if is_running_as_executable():
            input("Press Enter to close...")
        return 1

if __name__ == '__main__':
    sys.exit(main())