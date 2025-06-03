#!/usr/bin/env python3
"""
ODrive GUI Backend Startup Script
For ODrive firmware v0.5.6
"""

import sys
import os
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import odrive # type: ignore
    print("✓ ODrive library found")
except ImportError:
    print("✗ ODrive library not found. Please install with: pip install odrive==0.6.10.post0")
    sys.exit(1)

try:
    from flask import Flask
    print("✓ Flask library found")
except ImportError:
    print("✗ Flask library not found. Please install with: pip install flask")
    sys.exit(1)

try:
    from flask_cors import CORS
    print("✓ Flask-CORS library found")
except ImportError:
    print("✗ Flask-CORS library not found. Please install with: pip install flask-cors")
    sys.exit(1)

print("\n🚀 Starting ODrive GUI Backend...")
print("📡 Backend will be available at: http://localhost:5000")
print("🌐 Frontend should connect to: http://localhost:3000")
print("📋 API endpoints available at: http://localhost:5000/api/")

# Import and run the main app
from app import app, logger

if __name__ == '__main__':
    logger.info("ODrive GUI Backend v0.5.6 - Starting...")
    app.run(host='0.0.0.0', port=5000, debug=False)