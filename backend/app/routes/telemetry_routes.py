import logging
from flask import Blueprint, request, jsonify
from ..utils.utils import sanitize_for_json
from ..odrive_telemetry_config import (
    get_high_frequency_telemetry,
    get_configuration_data,
    get_full_device_state
)
import time
from ..odrive_telemetry_config import get_dashboard_telemetry

logger = logging.getLogger(__name__)
telemetry_bp = Blueprint('telemetry', __name__, url_prefix='/api/odrive')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

@telemetry_bp.route('/config/batch', methods=['POST'])
def get_config_batch():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        config_paths = data.get('paths', [])
        
        if not config_paths:
            return jsonify({'error': 'No configuration paths provided'}), 400
            
        if not odrive_manager.is_connected():
            return jsonify({'error': 'No ODrive device connected'}), 400
        
        telemetry_data = get_high_frequency_telemetry(odrive_manager.odrv)
        serializable_data = sanitize_for_json(telemetry_data)
        
        results = {}
        
        for path in config_paths:
            try:
                normalized_path = path.replace('device.', '').split('.')
                
                current = serializable_data.get('device', {})
                for part in normalized_path:
                    if isinstance(current, dict) and part in current:
                        current = current[part]
                    else:
                        current = None
                        break
                
                results[path] = current
                
            except Exception as e:
                results[path] = {'error': str(e)}
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error(f"Error in get_config_batch: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@telemetry_bp.route('/telemetry', methods=['POST'])
def get_selective_telemetry():
    """Get selective telemetry data based on what the frontend needs"""
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        # Additional connection health check
        try:
            # Quick health check - try to read vbus_voltage
            vbus = odrive_manager.odrv.vbus_voltage
            if vbus <= 0:
                # This indicates a disconnected device
                odrive_manager.connection_lost = True
                return jsonify({"error": "Device disconnected - no power detected"}), 404
        except Exception as health_check_error:
            # Connection check failed - device is likely disconnected
            odrive_manager.connection_lost = True
            logger.warning(f"Device connection lost during health check: {health_check_error}")
            return jsonify({"error": "Device disconnected"}), 404
        
        data = request.get_json()
        if not data:
            # Default to high frequency data if no selection provided
            try:
                telemetry_data = get_high_frequency_telemetry(odrive_manager.odrv)
                if not telemetry_data or not telemetry_data.get('device'):
                    return jsonify({"error": "Failed to get telemetry data"}), 404
                return jsonify(sanitize_for_json(telemetry_data))
            except Exception as e:
                logger.error(f"Error getting default telemetry: {e}")
                return jsonify({"error": "Device disconnected"}), 404
        
        # Get the data selection mode
        mode = data.get('mode', 'default')
        specific_paths = data.get('paths', [])
        
        if mode == 'charts' and specific_paths:
            # Chart mode - only fetch specific properties for maximum performance
            result = {'device': {}}
            
            # Always include vbus_voltage for health check
            try:
                vbus_result = odrive_manager.execute_command('odrv0.vbus_voltage')
                if 'result' in vbus_result and 'error' not in vbus_result:
                    if vbus_result['result'] <= 0:
                        return jsonify({"error": "Device disconnected - no power detected"}), 404
                    result['device']['vbus_voltage'] = vbus_result['result']
                else:
                    return jsonify({"error": "Device disconnected during health check"}), 404
            except Exception as e:
                logger.warning(f"Health check failed: {e}")
                return jsonify({"error": "Device disconnected"}), 404
            
            # Fetch each requested path
            for path in specific_paths:
                try:
                    # Convert frontend path to ODrive command
                    odrv_path = f'odrv0.{path}'
                    logger.debug(f"Fetching chart data for path: {odrv_path}")
                    
                    value = odrive_manager.execute_command(odrv_path)
                    if 'result' in value and 'error' not in value:
                        # Set the nested property in the result using the original path
                        set_nested_property(result['device'], path, value['result'])
                        logger.debug(f"Successfully fetched {path}: {value['result']}")
                    else:
                        logger.warning(f"Failed to get path {path}: {value.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    logger.warning(f"Exception getting path {path}: {e}")
                    
            # Add timestamp for charts
            result['timestamp'] = time.time() * 1000
            
            logger.debug(f"Chart result: {result}")
            return jsonify(sanitize_for_json(result))
            
        elif mode == 'dashboard':
            # Dashboard mode - get essential live data only
            try:
                dashboard_data = get_dashboard_telemetry(odrive_manager.odrv)
                if not dashboard_data or not dashboard_data.get('device'):
                    return jsonify({"error": "Failed to get dashboard data"}), 404
                return jsonify(sanitize_for_json(dashboard_data))
            except Exception as e:
                logger.error(f"Error getting dashboard telemetry: {e}")
                return jsonify({"error": "Device disconnected"}), 404
            
        elif mode == 'config':
            # Configuration mode - get configuration data
            config_data = get_configuration_data(odrive_manager.odrv)
            return jsonify(sanitize_for_json(config_data))
            
        elif mode == 'inspector':
            # Inspector mode - get full state for property tree
            full_data = get_full_device_state(odrive_manager.odrv)
            return jsonify(sanitize_for_json(full_data))
            
        else:
            # Default mode - high frequency telemetry
            telemetry_data = get_high_frequency_telemetry(odrive_manager.odrv)
            return jsonify(sanitize_for_json(telemetry_data))
        
    except Exception as e:
        logger.error(f"Error getting telemetry: {e}")
        # Mark connection as lost if we get exceptions
        odrive_manager.connection_lost = True
        return jsonify({"error": str(e)}), 500

def set_nested_property(obj, path, value):
    """Set a nested property in a dictionary structure"""
    parts = path.split('.')
    current = obj
    
    for part in parts[:-1]:
        if part not in current:
            current[part] = {}
        current = current[part]
    
    current[parts[-1]] = value