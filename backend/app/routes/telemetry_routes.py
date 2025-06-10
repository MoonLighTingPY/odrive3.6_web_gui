import logging
from flask import Blueprint, request, jsonify
from ..utils.utils import sanitize_for_json
from ..odrive_telemetry_config import (
    get_high_frequency_telemetry,
    get_configuration_data,
    get_full_device_state
)

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

@telemetry_bp.route('/state', methods=['GET'])
def get_device_state():
    logger.warning("State endpoint called - redirecting to telemetry")
    return get_telemetry()

@telemetry_bp.route('/telemetry', methods=['GET'])
def get_telemetry():
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        telemetry_data = get_high_frequency_telemetry(odrive_manager.odrv)
        serializable_data = sanitize_for_json(telemetry_data)
        
        logger.info(f"Telemetry data structure keys: {list(serializable_data.keys()) if isinstance(serializable_data, dict) else 'Not a dict'}")
        if isinstance(serializable_data, dict) and 'device' in serializable_data:
            device_keys = list(serializable_data['device'].keys()) if isinstance(serializable_data['device'], dict) else 'Device not a dict'
            logger.info(f"Device keys: {device_keys}")
        
        return jsonify(serializable_data)
        
    except Exception as e:
        logger.error(f"Error getting telemetry: {e}")
        return jsonify({"error": str(e)}), 500

@telemetry_bp.route('/full-state', methods=['GET'])  
def get_full_state():
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        full_data = get_full_device_state(odrive_manager.odrv)
        sanitizable_data = sanitize_for_json(full_data)
        
        return jsonify(sanitizable_data)
    except Exception as e:
        logger.error(f"Error getting full state: {e}")
        return jsonify({"error": str(e)}), 500