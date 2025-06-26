import logging
from flask import Blueprint, request, jsonify

try:
    from ..utils.utils import sanitize_for_json
except Exception as e:
    print(f"Import failed: {e}")
    # Use a fallback
    def sanitize_for_json(data):
        return data

logger = logging.getLogger(__name__)
device_bp = Blueprint('device', __name__, url_prefix='/api/odrive')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

# Global variable to track scanning state
_scanning_lock = False

@device_bp.route('/scan', methods=['GET'])
def scan_devices():
    global odrive_manager, _scanning_lock
    
    # Prevent concurrent scans
    if _scanning_lock:
        logger.warning("Scan request rejected - scan already in progress")
        return jsonify({
            "devices": [],
            "message": "Scan already in progress"
        }), 429  # Too Many Requests
    
    try:
        _scanning_lock = True
        devices = odrive_manager.scan_for_devices()
        logger.info(f"Scan completed, found {len(devices)} devices")
        return jsonify(devices)
    except Exception as e:
        logger.error(f"Error scanning for devices: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        _scanning_lock = False

# Simplify connect route
@device_bp.route('/connect', methods=['POST'])
def connect_device():
    """Connect to a specific ODrive device"""
    try:
        data = request.get_json()
        device = data.get('device')
        
        if not device:
            return jsonify({'error': 'No device specified'}), 400
            
        success = odrive_manager.connect_to_device(device)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Connected to {device.get("path", "device")}'
            })
        else:
            return jsonify({'error': 'Connection failed'}), 500
            
    except Exception as e:
        logger.error(f"Connection error: {e}")
        return jsonify({'error': str(e)}), 500

# Simplify disconnect route
@device_bp.route('/disconnect', methods=['POST'])
def disconnect_device():
    """Disconnect from current device"""
    try:
        success = odrive_manager.disconnect_device()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Disconnected successfully'
            })
        else:
            return jsonify({'error': 'Disconnect failed'}), 500
            
    except Exception as e:
        logger.error(f"Disconnect error: {e}")
        return jsonify({'error': str(e)}), 500

@device_bp.route('/command', methods=['POST'])
def execute_command():
    try:
        command = request.json.get('command', '')
        result = odrive_manager.execute_command(command)
        
        if 'error' in result:
            return jsonify(result), 400
        else:
            return jsonify(result)
    except Exception as e:
        logger.error(f"Error in execute_command: {e}")
        return jsonify({'error': str(e)}), 500

@device_bp.route('/set_property', methods=['POST'])
def set_property():
    try:
        path = request.json.get('path', '')
        value = request.json.get('value')
        
        result = odrive_manager.set_property(path, value)
        
        if 'error' in result:
            return jsonify(result), 400
        else:
            return jsonify(result)
    except Exception as e:
        logger.error(f"Error in set_property: {e}")
        return jsonify({'error': str(e)}), 500



@device_bp.route('/property', methods=['POST'])
def get_single_property():
    """Get single property value or batch of properties"""
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Check if this is a batch request (array of paths) or single property
        if 'paths' in data:
            # Batch request
            paths = data.get('paths', [])
            if not paths:
                return jsonify({"error": "No paths specified"}), 400
            
            results = {}
            for path in paths:
                try:
                    value = get_property_value_direct(odrive_manager.current_device, path)
                    if value is not None:
                        results[path] = sanitize_for_json(value)
                    else:
                        results[path] = None
                except Exception as e:
                    logger.debug(f"Error getting property {path}: {e}")
                    results[path] = None
            
            return jsonify({'results': results})
            
        elif 'path' in data:
            # Single property request (existing functionality)
            path = data.get('path')
            value = get_property_value_direct(odrive_manager.current_device, path)
            
            if value is not None:
                return jsonify({'value': sanitize_for_json(value)})
            else:
                return jsonify({'error': f'Failed to get property: {path}'}), 400
        else:
            return jsonify({"error": "Neither 'path' nor 'paths' specified"}), 400
            
    except Exception as e:
        logger.error(f"Error in get_single_property: {e}")
        return jsonify({'error': str(e)}), 500

def get_property_value_direct(odrv, path):
    """Direct property access for single property requests"""
    try:
        if not odrv:
            return None
        
        # Handle special system properties
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
        
        # Navigate to the property
        current = odrv
        for part in actual_path.split('.'):
            if hasattr(current, part):
                current = getattr(current, part)
            else:
                return None
        
        return current
    except Exception as e:
        logger.debug(f"Error getting property {path}: {e}")
        return None