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
def get_charts_telemetry():
    """Ultra-fast telemetry endpoint"""
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        data = request.get_json()
        if not data or not data.get('paths'):
            return jsonify({"error": "No paths specified"}), 400
            
        paths = data.get('paths', [])
        
        # Ultra-fast property collection with immediate timeout
        def _get_properties_fast():
            local_result = {}
            start_time = time.time()
            max_time = 0.1  # 100ms absolute maximum for charts
            
            for path in paths:
                # Hard timeout check
                if time.time() - start_time > max_time:
                    logger.debug(f"Telemetry hard timeout after {len(local_result)} properties")
                    break
                    
                try:
                    # Direct property access without complex mapping for speed
                    if path.startswith('system.'):
                        prop = path.replace('system.', '')
                        actual_path = f'config.{prop}' if prop in [
                            'dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 
                            'dc_max_positive_current', 'dc_max_negative_current', 
                            'enable_brake_resistor', 'brake_resistance'
                        ] else prop
                    else:
                        actual_path = path
                    
                    # Use the fastest possible property access
                    value = odrive_manager.safe_get_property(actual_path)
                    if value is not None:
                        # Convert to float for charts if numeric
                        if isinstance(value, (int, float)):
                            local_result[path] = float(value)
                        elif isinstance(value, bool):
                            local_result[path] = float(value)  # 0/1 for charts
                        
                except Exception:
                    # Silent fail for speed - don't log in tight loop
                    continue
                    
            return local_result

        result = _get_properties_fast()
        
        return jsonify({
            'data': result,
            'timestamp': time.time() * 1000
        })
        
    except Exception as e:
        logger.error(f"Error in charts telemetry: {e}")
        return jsonify({"error": str(e)}), 500

