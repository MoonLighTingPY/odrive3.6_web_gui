import time
import logging
import math
import json
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)
config_bp = Blueprint('config', __name__, url_prefix='/api/odrive')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

def safe_json_serialize(value):
    """Safely serialize a value to JSON, handling NaN, infinity, and None values"""
    if value is None:
        return None
    elif isinstance(value, float):
        if math.isnan(value):
            return 0.0  # Default NaN to 0
        elif math.isinf(value):
            return 1000.0 if value > 0 else -1000.0  # Default infinity to reasonable values
        else:
            return value
    elif isinstance(value, (int, bool, str)):
        return value
    elif hasattr(value, 'value'):  # Enum handling
        return safe_json_serialize(value.value)
    elif hasattr(value, '__float__'):
        return safe_json_serialize(float(value))
    elif hasattr(value, '__int__'):
        return safe_json_serialize(int(value))
    elif hasattr(value, '__bool__'):
        return safe_json_serialize(bool(value))
    else:
        # For any other complex objects, convert to string
        return str(value)

def resolve_property_path_v06x(odrive_obj, path_parts):
    """
    Handle 0.6.x specific path resolution for new components
    """
    current_obj = odrive_obj
    
    # Handle new 0.6.x components that don't exist in 0.5.6
    new_v06x_components = [
        'brake_resistor0', 'load_mapper', 'commutation_mapper', 
        'pos_vel_mapper', 'harmonic_compensation', 'thermal_current_limiter',
        'motor_thermistor_current_limiter', 'sensorless_estimator', 'inverter'
    ]
    
    # Check if path contains new 0.6.x components
    path_str = '.'.join(path_parts)
    if any(comp in path_str for comp in new_v06x_components):
        # Check firmware version
        try:
            fw_major = getattr(current_obj, 'fw_version_major', 0)
            fw_minor = getattr(current_obj, 'fw_version_minor', 5)
            
            if fw_major == 0 and fw_minor < 6:
                # This is a 0.5.x device, component doesn't exist
                return None
        except:
            # If we can't determine version, assume it might not exist
            return None
    
    # Traverse the path
    for part in path_parts:
        try:
            if hasattr(current_obj, part):
                current_obj = getattr(current_obj, part)
            else:
                return None
        except Exception:
            return None
    
    return current_obj

@config_bp.route('/config/batch', methods=['POST'])
def get_config_batch():
    """Get multiple configuration values in a single request"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        config_paths = data.get('paths', [])
        
        if not config_paths:
            return jsonify({'error': 'No configuration paths provided'}), 400
            
        if not odrive_manager.current_device:
            return jsonify({'error': 'No ODrive device connected'}), 400
        
        results = {}
        
        for path in config_paths:
            try:
                # Remove 'device.' prefix if present
                clean_path = path.replace('device.', '') if path.startswith('device.') else path
                
                # Build the actual attribute path for the ODrive object
                try:
                    # Split the path and traverse the object
                    parts = clean_path.split('.')
                    current_obj = odrive_manager.current_device
                    
                    for part in parts:
                        if hasattr(current_obj, part):
                            current_obj = getattr(current_obj, part)
                        else:
                            current_obj = None
                            break
                    
                    if current_obj is not None:
                        # Handle different types of values
                        if hasattr(current_obj, '__call__'):
                            # It's a method, don't call it
                            results[path] = None  # Set to None instead of error object
                        else:
                            # Safely serialize the value
                            safe_value = safe_json_serialize(current_obj)
                            results[path] = safe_value
                    else:
                        # Set to None for missing paths instead of error object
                        results[path] = None
                        
                except Exception as e:
                    logger.warning(f"Error reading path {path}: {e}")
                    results[path] = None  # Set to None instead of error object
                    
            except Exception as e:
                logger.warning(f"Error processing path {path}: {e}")
                results[path] = None  # Set to None instead of error object
        
        # Double-check that the result can be serialized to JSON
        try:
            json.dumps(results)
        except (TypeError, ValueError) as e:
            logger.error(f"JSON serialization failed: {e}")
            # If serialization still fails, create a clean result with safe defaults
            clean_results = {}
            for path in config_paths:
                clean_results[path] = None
            results = clean_results
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error(f"Error in get_config_batch: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Update the batch configuration loading function
@config_bp.route('/batch', methods=['POST'])
def get_batch_configuration():
    try:
        data = request.get_json()
        paths = data.get('paths', [])
        
        if not odrive_manager.is_connected():
            return jsonify({'error': 'ODrive not connected'}), 400
        
        odrive_obj = odrive_manager.get_odrive_object()
        results = {}
        
        # Determine firmware version for path resolution
        try:
            fw_major = getattr(odrive_obj, 'fw_version_major', 0)
            fw_minor = getattr(odrive_obj, 'fw_version_minor', 5)
            is_v06x = fw_major == 0 and fw_minor >= 6
        except:
            is_v06x = False
        
        for path in paths:
            try:
                path_parts = path.split('.')
                
                # Use version-specific path resolution
                if is_v06x:
                    current_obj = resolve_property_path_v06x(odrive_obj, path_parts)
                else:
                    # Standard path traversal for 0.5.x
                    current_obj = odrive_obj
                    for part in path_parts:
                        if hasattr(current_obj, part):
                            current_obj = getattr(current_obj, part)
                        else:
                            current_obj = None
                            break
                
                if current_obj is not None:
                    # Check if it's a callable method
                    if callable(current_obj):
                        results[path] = None  # Don't try to read callable methods
                    else:
                        results[path] = current_obj
                else:
                    results[path] = None
                    
            except Exception as e:
                print(f"Error reading {path}: {e}")
                results[path] = None
        
        return jsonify({'results': results})
        
    except Exception as e:
        print(f"Batch config error: {e}")
        return jsonify({'error': str(e)}), 500

@config_bp.route('/apply_config', methods=['POST'])
def apply_config():
    try:
        commands = request.json.get('commands', [])
        results = []
        skipped_commands = []
        
        for command in commands:
            result = odrive_manager.execute_command(command)
            results.append({'command': command, 'result': result})
            
            if 'error' in result:
                return jsonify({
                    'error': f'Failed at command: {command}',
                    'details': result,
                    'executed_commands': results
                }), 400
            elif 'Skipped' in result.get('result', ''):
                skipped_commands.append(command)
        
        response_message = 'All commands executed successfully'
        if skipped_commands:
            response_message += f'. Skipped {len(skipped_commands)} commands with undefined values.'
        
        return jsonify({
            'message': response_message,
            'results': results,
            'skipped_commands': skipped_commands
        })
    except Exception as e:
        logger.error(f"Error in apply_config: {e}")
        return jsonify({'error': str(e)}), 500

@config_bp.route('/erase_config', methods=['POST'])
def erase_config():
    """Erase configuration and reboot ODrive"""
    if not odrive_manager.current_device:
        return jsonify({'error': 'No device connected'}), 400
    
    try:
        odrive_manager.expecting_reconnection = True  # Expect disconnection/reconnection
        odrive_manager.current_device.erase_configuration()
        odrive_manager.current_device.reboot()
        
        # Attempt reconnection after reboot
        if odrive_manager._attempt_single_reconnection():
            return jsonify({
                'success': True, 
                'message': 'Configuration erased and device rebooted successfully'
            })
        else:
            return jsonify({
                'success': True, 
                'message': 'Configuration erased and device rebooted (manual reconnection may be required)'
            })
    except Exception as e:
        logger.error(f"Erase configuration failed: {e}")
        return jsonify({'error': str(e)}), 500

@config_bp.route('/save_config', methods=['POST'])
def save_config():
    """Save configuration to non-volatile memory"""
    if not odrive_manager.current_device:
        return jsonify({'error': 'No device connected'}), 400
    
    try:
        result = odrive_manager.save_configuration()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Save configuration failed: {e}")
        return jsonify({'error': str(e)}), 500
