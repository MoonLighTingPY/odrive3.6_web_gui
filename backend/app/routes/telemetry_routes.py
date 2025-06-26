import logging
import time
from flask import Blueprint, request, jsonify
from ..utils.utils import sanitize_for_json

logger = logging.getLogger(__name__)
telemetry_bp = Blueprint('telemetry', __name__, url_prefix='/api/telemetry')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

def get_property_value(odrv, path):
    """Get a single property value - fast and direct"""
    try:
        # Use the thread-safe method from ODrive manager
        return odrive_manager.safe_get_property(path)
    except Exception as e:
        logger.debug(f"Error getting {path}: {e}")
        return None

@telemetry_bp.route('/get-telemetry', methods=['POST'])
def get_telemetry():
    """Get telemetry data for specified paths"""
    try:
        data = request.get_json()
        paths = data.get('paths', [])
        
        if not odrive_manager.current_device:
            return jsonify({'error': 'No device connected'}), 400
        
        results = {}
        for path in paths:
            try:
                value = odrive_manager.safe_get_property(path)
                results[path] = value
            except Exception as e:
                logger.debug(f"Failed to get {path}: {e}")
                # Don't set connection status - just skip failed properties
                
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Telemetry error: {e}")
        return jsonify({'error': str(e)}), 500

