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
    """Get telemetry data for specified paths and include connection heartbeat"""
    try:
        data = request.get_json()
        paths = data.get('paths', [])

        # Heartbeat: check connection before fetching properties
        connected = odrive_manager.is_connected() and odrive_manager.check_connection()
        if not connected:
            return jsonify({'connected': False}), 200

        results = {}
        for path in paths:
            try:
                value = odrive_manager.safe_get_property(path)
                results[path] = value
            except Exception as e:
                logger.debug(f"Failed to get {path}: {e}")
                results[path] = None

        # Always include connection status
        results['connected'] = True
        return jsonify(results)

    except Exception as e:
        logger.error(f"Telemetry error: {e}")
        return jsonify({'connected': False, 'error': str(e)}), 200

