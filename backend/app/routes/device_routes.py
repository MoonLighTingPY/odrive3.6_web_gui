import logging
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)
device_bp = Blueprint('device', __name__, url_prefix='/api/odrive')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

@device_bp.route('/scan', methods=['GET'])
def scan_devices():
    try:
        devices = odrive_manager.scan_for_devices()
        return jsonify(devices)
    except Exception as e:
        logger.error(f"Error in scan_devices: {e}")
        return jsonify({'error': str(e)}), 500

@device_bp.route('/connect', methods=['POST'])
def connect_device():
    try:
        device_info = request.json.get('device', {})
        success = odrive_manager.connect_to_device(device_info)
        
        if success:
            return jsonify({'message': 'Connected successfully'})
        else:
            return jsonify({'error': 'Failed to connect'}), 500
    except Exception as e:
        logger.error(f"Error in connect_device: {e}")
        return jsonify({'error': str(e)}), 500

@device_bp.route('/disconnect', methods=['POST'])
def disconnect_device():
    try:
        success = odrive_manager.disconnect_device()
        return jsonify({'message': 'Disconnected successfully'})
    except Exception as e:
        logger.error(f"Error in disconnect_device: {e}")
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

@device_bp.route('/connection_status', methods=['GET'])
def connection_status():
    try:
        is_connected = odrive_manager.check_connection()
        
        # If not connected but we expect to be, try to find device immediately
        if not is_connected and odrive_manager.current_device_serial:
            # Try a quick reconnection attempt for physical reconnections
            reconnect_success = odrive_manager.try_reconnect()
            if reconnect_success:
                is_connected = True
                logger.info("Device reconnected during status check (physical reconnection detected)")
        
        return jsonify({
            'connected': is_connected,
            'connection_lost': odrive_manager.connection_lost,
            'device_serial': odrive_manager.current_device_serial,
            'is_rebooting': odrive_manager.is_rebooting,
            'reconnection_attempts': odrive_manager.reconnection_attempts
        })
    except Exception as e:
        logger.error(f"Error in connection_status: {e}")
        return jsonify({'error': str(e)}), 500