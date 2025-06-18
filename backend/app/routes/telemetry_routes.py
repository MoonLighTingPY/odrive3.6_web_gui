import logging
import time
from flask import Blueprint, request, jsonify

try:
    from ..utils.utils import sanitize_for_json
except Exception as e:
    print(f"Import failed: {e}")
    # Use a fallback
    def sanitize_for_json(data):
        return data

logger = logging.getLogger(__name__)
telemetry_bp = Blueprint('telemetry', __name__, url_prefix='/api/odrive')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

@telemetry_bp.route('/property', methods=['POST'])
def get_single_property():
    """Get a single property value for refresh buttons"""
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
            
        data = request.get_json()
        if not data or not data.get('path'):
            return jsonify({"error": "No path specified"}), 400
            
        path = data.get('path')
        
        # Remove 'device.' prefix if present
        if path.startswith('device.'):
            path = path[7:]
            
        # Get the value
        value = get_property_value_direct(odrive_manager.odrv, path)
        
        return jsonify({
            'path': path,
            'value': value,
            'timestamp': time.time() * 1000
        })
        
    except Exception as e:
        logger.error(f"Error getting property {data.get('path', 'unknown') if 'data' in locals() and data else 'unknown'}: {e}")
        return jsonify({"error": str(e)}), 500

def get_property_value_direct(odrv, path):
    """Direct property access for single property requests"""
    try:
        # Handle system/config properties
        if path.startswith('config.'):
            prop = path.replace('config.', '')
            return getattr(odrv.config, prop, None)
        elif path in ['hw_version_major', 'hw_version_minor', 'fw_version_major', 
                     'fw_version_minor', 'serial_number', 'vbus_voltage', 'ibus']:
            return getattr(odrv, path, None)
            
        # Handle axis properties
        parts = path.split('.')
        current = odrv
        for part in parts:
            current = getattr(current, part, None)
            if current is None:
                return None
                
        return current
        
    except Exception as e:
        logger.debug(f"Error getting {path}: {e}")
        return None