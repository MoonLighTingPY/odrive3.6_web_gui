import subprocess
import sys
import os
import shutil
from pathlib import Path

def check_npm():
    """Check if npm is available"""
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ npm not found. Please install Node.js from https://nodejs.org/")
        print("  Make sure npm is in your PATH")
        return False

def check_python_deps():
    """Check Python dependencies"""
    try:
        import flask
        import flask_cors
        import odrive
        print("✓ All Python dependencies found")
        return True
    except ImportError as e:
        print(f"✗ Missing Python dependency: {e}")
        print("  Run: pip install -r requirements.txt")
        return False

def install_dependencies():
    """Install required dependencies"""
    print("Installing Python dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def build_frontend():
    """Build the frontend"""
    frontend_dir = Path("../frontend")
    if not frontend_dir.exists():
        print("✗ Frontend directory not found")
        return False
        
    print("Building frontend...")
    original_dir = os.getcwd()
    
    try:
        os.chdir(frontend_dir)
        
        # Check if node_modules exists
        if not Path("node_modules").exists():
            print("Installing npm dependencies...")
            subprocess.check_call(["npm", "install"])
        
        print("Building frontend...")
        subprocess.check_call(["npm", "run", "build"])
        
        print("✓ Frontend built successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Frontend build failed: {e}")
        return False
    finally:
        os.chdir(original_dir)

def build_executable():
    """Build the executable with PyInstaller"""
    print("Building executable...")
    
    # Clean previous builds
    if os.path.exists("dist"):
        shutil.rmtree("dist")
    if os.path.exists("build"):
        shutil.rmtree("build")
    
    cmd = [
        "pyinstaller",
        "--onefile",
        "--add-data", "../frontend/dist;frontend/dist",
        "--hidden-import", "odrive",
        "--hidden-import", "odrive.enums", 
        "--hidden-import", "odrive.utils",
        "--hidden-import", "odrive.fibre",
        "--hidden-import", "odrive.fibre.protocol",
        "--hidden-import", "usb",
        "--hidden-import", "usb.core",
        "--hidden-import", "usb.util",
        "--hidden-import", "libusb_package",
        "--hidden-import", "flask",
        "--hidden-import", "flask_cors",
        "--name", "odrive_gui",
        "--console",  # Keep console for debugging
        "app.py"
    ]
    
    try:
        subprocess.check_call(cmd)
        print("✓ Executable built successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Executable build failed: {e}")
        return False

if __name__ == "__main__":
    print("=== ODrive GUI Build Script ===")
    
    # Check prerequisites
    if not check_npm():
        sys.exit(1)
    
    if not check_python_deps():
        print("Installing Python dependencies...")
        install_dependencies()
    
    # Build steps
    success = True
    
    if not build_frontend():
        success = False
    
    if success and not build_executable():
        success = False
    
    if success:
        print("\n✓ Build complete! Executable is in dist/odrive_gui.exe")
        print("\nTo test the executable:")
        print("1. Copy dist/odrive_gui.exe to a clean machine")
        print("2. Connect your ODrive device") 
        print("3. Run odrive_gui.exe")
        print("4. Open http://localhost:5000 in your browser")
    else:
        print("\n✗ Build failed!")
        sys.exit(1)