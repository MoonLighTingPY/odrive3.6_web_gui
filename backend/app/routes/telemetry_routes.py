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

@telemetry_bp.route('/telemetry', methods=['POST'])
def get_telemetry():
    """Unified telemetry endpoint for both dashboard and charts"""
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No request data"}), 400
            
        dashboard_paths = data.get('dashboard_paths', [])
        chart_paths = data.get('chart_paths', [])
        request_type = data.get('type', 'unified')  # 'dashboard', 'charts', or 'unified'
        
        result = {
            'timestamp': time.time() * 1000
        }
        
        # Collect all unique paths
        all_paths = []
        if dashboard_paths:
            all_paths.extend(dashboard_paths)
        if chart_paths:
            all_paths.extend(chart_paths)
        
        # Remove duplicates while preserving order
        unique_paths = []
        seen = set()
        for path in all_paths:
            if path not in seen:
                unique_paths.append(path)
                seen.add(path)
        
        if not unique_paths:
            return jsonify({"error": "No paths specified"}), 400
        
        # Get all data in one optimized sweep
        telemetry_data = _get_telemetry_data(unique_paths, is_charts_priority=bool(chart_paths))
        
        # Split data based on request
        if dashboard_paths:
            dashboard_data = {path: telemetry_data.get(path) for path in dashboard_paths if path in telemetry_data}
            result['dashboard'] = dashboard_data
        
        if chart_paths:
            chart_data = {path: telemetry_data.get(path) for path in chart_paths if path in telemetry_data}
            result['charts'] = chart_data
        
        return jsonify(sanitize_for_json(result))
        
    except Exception as e:
        logger.error(f"Error in unified telemetry: {e}")
        odrive_manager.connection_lost = True
        return jsonify({"error": str(e)}), 500

def _get_telemetry_data(paths, is_charts_priority=False):
    """Get telemetry data for specified paths with optional timeout for charts"""
    local_result = {}
    start_time = time.time()
    
    # Set timeout based on priority - charts need to be fast
    max_time = 0.1 if is_charts_priority else 0.5  # 100ms for charts, 500ms for dashboard
    
    for path in paths:
        # Hard timeout check for charts priority
        if is_charts_priority and time.time() - start_time > max_time:
            logger.debug(f"Telemetry hard timeout after {len(local_result)} properties")
            break
            
        try:
            # Handle system properties mapping
            actual_path = _map_property_path(path)
            
            # Use the fastest possible property access
            value = odrive_manager.safe_get_property(actual_path)
            if value is not None:
                # Convert to appropriate type
                if isinstance(value, (int, float)):
                    local_result[path] = float(value)
                elif isinstance(value, bool):
                    local_result[path] = float(value) if is_charts_priority else value
                else:
                    local_result[path] = value
                    
        except Exception:
            # Silent fail for speed - don't log in tight loop for charts
            if not is_charts_priority:
                logger.debug(f"Error getting {path}")
            continue
            
    return local_result

def _map_property_path(path):
    """Map frontend path to actual ODrive property path"""
    # Handle system properties
    if path.startswith('system.'):
        prop = path.replace('system.', '')
        if prop in [
            'dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 
            'dc_max_positive_current', 'dc_max_negative_current', 
            'enable_brake_resistor', 'brake_resistance'
        ]:
            return f'config.{prop}'
        else:
            return prop
    else:
        return path

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