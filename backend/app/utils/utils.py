import os
import sys
import time
import webbrowser
import math
import logging

logger = logging.getLogger(__name__)

def is_running_as_executable():
    """Check if we're running as a PyInstaller executable"""
    return getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS')

def open_browser():
    """Open the web browser after a short delay to ensure the server is running"""
    time.sleep(3)
    try:
        webbrowser.open('http://localhost:5000', new=2)
        print("🌐 Opened ODrive GUI in your default web browser")
    except Exception as e:
        print(f"⚠️ Could not automatically open browser: {e}")
        print("   Please manually open: http://localhost:5000")

def get_static_folder():
    """Get the correct static folder path for both development and PyInstaller"""
    if getattr(sys, 'frozen', False):
        # Running as PyInstaller bundle
        return os.path.join(sys._MEIPASS, 'static')
    else:
        # Running in development
        return os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')

def sanitize_for_json(obj, path=""):
    """Recursively sanitize data to handle problematic values like Infinity and NaN"""
    try:
        if obj is None:
            return None
        elif isinstance(obj, (int, str, bool)):
            return obj
        elif isinstance(obj, float):
            if math.isnan(obj):
                return None  # Convert NaN to null
            elif math.isinf(obj):
                if obj > 0:
                    return 1e10  # Replace positive infinity with large number
                else:
                    return -1e10  # Replace negative infinity with large negative number
            else:
                return obj
        elif isinstance(obj, dict):
            result = {}
            for k, v in obj.items():
                try:
                    result[k] = sanitize_for_json(v, f"{path}.{k}")
                except Exception as e:
                    logger.warning(f"Error sanitizing key {k} at {path}: {e}")
                    result[k] = None
            return result
        elif isinstance(obj, list):
            return [sanitize_for_json(item, f"{path}[{i}]") for i, item in enumerate(obj)]
        else:
            # Convert any other type to string
            str_val = str(obj)
            if len(str_val) > 1000:  # Prevent extremely long strings
                logger.warning(f"Truncating long string at {path}")
                return str_val[:1000] + "..."
            return str_val
    except Exception as e:
        logger.warning(f"Error sanitizing object at {path}: {e}")
        return None