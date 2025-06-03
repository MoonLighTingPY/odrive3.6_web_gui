#!/usr/bin/env python3
"""
ODrive GUI Backend Startup Script
For ODrive firmware v0.5.6
"""

import sys
import os
import logging
import webbrowser
import threading
import time

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ANSI color codes
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

def colored_print(text, color=Colors.WHITE):
    """Print text with color if terminal supports it"""
    if hasattr(sys.stdout, 'isatty') and sys.stdout.isatty():
        print(f"{color}{text}{Colors.END}")
    else:
        print(text)

# Check dependencies
try:
    import odrive # type: ignore
    colored_print("✓ ODrive library found", Colors.GREEN)
except ImportError:
    colored_print("✗ ODrive library not found. Please install with: pip install odrive==0.6.10.post0", Colors.RED)
    sys.exit(1)

try:
    from flask import Flask
    colored_print("✓ Flask library found", Colors.GREEN)
except ImportError:
    colored_print("✗ Flask library not found. Please install with: pip install flask", Colors.RED)
    sys.exit(1)

try:
    from flask_cors import CORS
    colored_print("✓ Flask-CORS library found", Colors.GREEN)
except ImportError:
    colored_print("✗ Flask-CORS library not found. Please install with: pip install flask-cors", Colors.RED)
    sys.exit(1)

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

print()  # Empty line for spacing
colored_print("🚀 ODrive GUI v3.6 Backend Starting...", Colors.BOLD + Colors.CYAN)

# Only auto-open browser if running as executable
if is_running_as_executable():
    colored_print("📦 Running as executable", Colors.BLUE)
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
else:
    colored_print("🔧 Development mode", Colors.YELLOW)

# Import and run the Flask app
from app import app

if __name__ == '__main__':
    try:
        colored_print("🔌 Server: http://localhost:5000", Colors.GREEN)
        colored_print("=" * 40, Colors.WHITE)
        app.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        print()  # New line after Ctrl+C
        colored_print("👋 ODrive GUI stopped", Colors.YELLOW)
    except Exception as e:
        print()  # New line for spacing
        colored_print(f"❌ Error: {e}", Colors.RED)
        if is_running_as_executable():
            
            input("Press Enter to close...")