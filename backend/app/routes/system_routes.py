import os
import sys
import logging
import tempfile
import subprocess
import requests
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)
system_bp = Blueprint('system', __name__, url_prefix='/api')

from .. import VERSION

@system_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'version': '0.5.6'})

@system_bp.route('/system/check_updates', methods=['GET'])
def check_updates():
    try:
        url = "https://api.github.com/repos/MoonLighTingPY/odrive3.6_web_gui/releases/latest"
        response = requests.get(url)
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to check for updates'}), 400
        
        release_data = response.json()
        latest_version = release_data['tag_name']
        current_version = VERSION
        
        exe_asset = None
        for asset in release_data['assets']:
            if asset['name'].endswith('.exe'):
                exe_asset = asset
                break
        
        if not exe_asset:
            return jsonify({'error': 'No executable found in latest release'}), 400
        
        return jsonify({
            'current_version': current_version,
            'latest_version': latest_version,
            'update_available': latest_version != current_version,
            'download_url': exe_asset['browser_download_url'],
            'file_name': exe_asset['name'],
            'file_size': exe_asset['size'],
            'release_notes': release_data['body']
        })
        
    except Exception as e:
        logger.error(f"Error checking for updates: {e}")
        return jsonify({'error': str(e)}), 500

@system_bp.route('/system/update', methods=['POST'])
def perform_update():
    try:
        data = request.get_json()
        download_url = data.get('download_url')
        file_name = data.get('file_name')
        
        if not download_url or not file_name:
            return jsonify({'error': 'Missing download URL or filename'}), 400
        
        temp_dir = tempfile.mkdtemp()
        temp_file = os.path.join(temp_dir, file_name)
        
        logger.info(f"Downloading update from: {download_url}")
        response = requests.get(download_url, stream=True)
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to download update'}), 400
        
        with open(temp_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        if hasattr(sys, '_MEIPASS'):
            current_exe = sys.executable
        else:
            current_exe = os.path.abspath(__file__)
        
        update_script = f"""
@echo off
echo Updating ODrive GUI...
timeout /t 3 /nobreak >nul
taskkill /f /im "ODrive_GUI_Tray.exe" >nul 2>&1
timeout /t 2 /nobreak >nul
move "{temp_file}" "{current_exe}"
start "" "{current_exe}"
del "%~f0"
"""
        
        script_path = os.path.join(temp_dir, "update.bat")
        with open(script_path, 'w') as f:
            f.write(update_script)
        
        logger.info("Starting update process...")
        subprocess.Popen([script_path], shell=True, creationflags=subprocess.CREATE_NO_WINDOW)
        
        return jsonify({'message': 'Update started successfully'})
        
    except Exception as e:
        logger.error(f"Error performing update: {e}")
        return jsonify({'error': str(e)}), 500