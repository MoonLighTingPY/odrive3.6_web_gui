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
        
        # Direct property access - no overhead, just raw data
        for path in paths:
            try:
                value = get_property_value(odrive_manager.odrv, path)
                if value is not None:
                    result[path] = value
            except Exception as e:
                logger.debug(f"Failed to get {path}: {e}")
                
        return jsonify({
            'data': result,
            'timestamp': time.time() * 1000
        })
        
    except Exception as e:
        logger.error(f"Error in charts telemetry: {e}")
        return jsonify({"error": str(e)}), 500

def get_property_value(odrv, path):
    """Get a single property value - fast and direct"""
    try:
        # Handle system properties
        if path.startswith('system.'):
            prop = path.replace('system.', '')
            if prop in ['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 
                       'dc_max_positive_current', 'dc_max_negative_current', 
                       'enable_brake_resistor', 'brake_resistance']:
                return getattr(odrv.config, prop, None)
            else:
                return getattr(odrv, prop, None)
        
        # Handle axis properties
        parts = path.split('.')
        current = odrv
        for part in parts:
            current = getattr(current, part, None)
            if current is None:
                return None
                
        return float(current) if isinstance(current, (int, float)) else current
        
    except Exception as e:
        logger.debug(f"Error getting {path}: {e}")
        return None
