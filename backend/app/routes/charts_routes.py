import logging
import time
from flask import Blueprint, request, jsonify
from ..utils.utils import sanitize_for_json

logger = logging.getLogger(__name__)
charts_bp = Blueprint('charts', __name__, url_prefix='/api/charts')

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

@charts_bp.route('/telemetry', methods=['POST'])
def get_charts_telemetry():
    """Fast, minimal telemetry endpoint specifically for live charts"""
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        data = request.get_json()
        if not data or not data.get('paths'):
            return jsonify({"error": "No paths specified"}), 400
            
        paths = data.get('paths', [])
        result = {}
        
        # Use thread-safe property access
        def _get_all_properties():
            local_result = {}
            for path in paths:
                try:
                    # Handle system properties mapping
                    if path.startswith('system.'):
                        prop = path.replace('system.', '')
                        if prop in ['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 
                                   'dc_max_positive_current', 'dc_max_negative_current', 
                                   'enable_brake_resistor', 'brake_resistance']:
                            actual_path = f'config.{prop}'
                        else:
                            actual_path = prop
                    else:
                        actual_path = path
                    
                    value = odrive_manager.safe_get_property(actual_path)
                    if value is not None:
                        local_result[path] = float(value) if isinstance(value, (int, float)) else value
                except Exception as e:
                    logger.debug(f"Failed to get {path}: {e}")
            return local_result
        
        result = _get_all_properties()
        
        return jsonify({
            'data': result,
            'timestamp': time.time() * 1000
        })
        
    except Exception as e:
        logger.error(f"Error in charts telemetry: {e}")
        return jsonify({"error": str(e)}), 500
