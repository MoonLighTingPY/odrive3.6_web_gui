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

@telemetry_bp.route('/dashboard', methods=['GET'])
def get_dashboard_telemetry():
    """Simplified telemetry for dashboard and device list"""
    try:
        if not odrive_manager.is_connected():
            return jsonify({"error": "No ODrive connected"}), 404
        
        # Use thread-safe access for dashboard data
        def _get_dashboard_data():
            # Quick health check
            vbus = odrive_manager.safe_get_property('vbus_voltage')
            if vbus <= 0:
                odrive_manager.connection_lost = True
                raise Exception("Device disconnected")
            
            return {
                'device': {
                    'vbus_voltage': vbus,
                    'ibus': odrive_manager.safe_get_property('ibus') or 0,
                    'hw_version_major': odrive_manager.safe_get_property('hw_version_major'),
                    'hw_version_minor': odrive_manager.safe_get_property('hw_version_minor'),
                    'fw_version_major': odrive_manager.safe_get_property('fw_version_major'),
                    'fw_version_minor': odrive_manager.safe_get_property('fw_version_minor'),
                    'serial_number': odrive_manager.safe_get_property('serial_number'),
                    'axis0': {
                        'current_state': odrive_manager.safe_get_property('axis0.current_state'),
                        'error': odrive_manager.safe_get_property('axis0.error'),
                        'motor': {
                            'error': odrive_manager.safe_get_property('axis0.motor.error'),
                            'is_calibrated': odrive_manager.safe_get_property('axis0.motor.is_calibrated'),
                            'current_control': {
                                'Iq_measured': odrive_manager.safe_get_property('axis0.motor.current_control.Iq_measured'),
                            },
                            # Add thermistor temperature readings for ODrive v0.5.6
                            'motor_thermistor': {
                                'temperature': odrive_manager.safe_get_property('axis0.motor.motor_thermistor.temperature'),
                            },
                            'fet_thermistor': {
                                'temperature': odrive_manager.safe_get_property('axis0.motor.fet_thermistor.temperature'),
                            }
                        },
                        'encoder': {
                            'error': odrive_manager.safe_get_property('axis0.encoder.error'),
                            'pos_estimate': odrive_manager.safe_get_property('axis0.encoder.pos_estimate'),
                            'vel_estimate': odrive_manager.safe_get_property('axis0.encoder.vel_estimate'),
                            'is_ready': odrive_manager.safe_get_property('axis0.encoder.is_ready'),
                        },
                        'controller': {
                            'error': odrive_manager.safe_get_property('axis0.controller.error'),
                            'pos_setpoint': odrive_manager.safe_get_property('axis0.controller.pos_setpoint'),
                            'vel_setpoint': odrive_manager.safe_get_property('axis0.controller.vel_setpoint'),
                            'torque_setpoint': odrive_manager.safe_get_property('axis0.controller.torque_setpoint') or 0,
                        }
                    }
                },
                'timestamp': time.time() * 1000
            }
        
        data = _get_dashboard_data()
        return jsonify(sanitize_for_json(data))
        
    except Exception as e:
        logger.error(f"Error getting dashboard telemetry: {e}")
        odrive_manager.connection_lost = True
        return jsonify({"error": str(e)}), 500

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