import asyncio
import json
import time
from typing import Dict, Any, List, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
import odrive
from odrive.enums import *
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Global variables
connected_odrives: Dict[str, Any] = {}
current_odrive: Optional[Any] = None
device_state_cache = {}
last_update_time = 0

class ODriveManager:
    def __init__(self):
        self.odrives = {}
        self.current_device = None
        self.telemetry_data = {}
        self.is_scanning = False

    def scan_for_devices(self) -> List[Dict[str, Any]]:
        """Scan for ODrive devices"""
        devices = []
        try:
            self.is_scanning = True
            logger.info("Scanning for ODrive devices...")
            
            # Find all connected ODrives
            odrives = odrive.find_any(timeout=5)
            if odrives:
                # Handle single device or list of devices
                if not isinstance(odrives, list):
                    odrives = [odrives]
                
                for i, odrv in enumerate(odrives):
                    try:
                        device_info = {
                            'path': f'USB:{i}',
                            'serial': hex(odrv.serial_number) if hasattr(odrv, 'serial_number') else f'unknown_{i}',
                            'fw_version': getattr(odrv, 'fw_version_string', 'v0.5.6'),
                            'hw_version': getattr(odrv, 'hw_version_string', 'v3.6-56V'),
                            'index': i
                        }
                        devices.append(device_info)
                        logger.info(f"Found ODrive: {device_info}")
                    except Exception as e:
                        logger.error(f"Error getting device info for ODrive {i}: {e}")
                        # Add a basic entry even if we can't get details
                        devices.append({
                            'path': f'USB:{i}',
                            'serial': f'unknown_{i}',
                            'fw_version': 'v0.5.6',
                            'hw_version': 'v3.6-56V',
                            'index': i
                        })
            else:
                logger.info("No ODrive devices found")
                
        except Exception as e:
            logger.error(f"Error during device scan: {e}")
        finally:
            self.is_scanning = False
            
        return devices

    def connect_to_device(self, device_info: Dict[str, Any]) -> bool:
        """Connect to a specific ODrive device"""
        try:
            # Find the specific device
            odrv = odrive.find_any(timeout=10)
            
            if odrv:
                self.current_device = odrv
                self.odrives[device_info['serial']] = odrv
                logger.info(f"Connected to ODrive: {device_info['serial']}")
                return True
            else:
                logger.error("No ODrive found during connection attempt")
                return False
                
        except Exception as e:
            logger.error(f"Error connecting to device: {e}")
            return False
    
    def disconnect_device(self) -> bool:
        """Disconnect from current ODrive device"""
        try:
            if self.current_device:
                self.current_device = None
                logger.info("Disconnected from ODrive")
            return True
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
            return False

    def get_device_state(self) -> Dict[str, Any]:
        """Get current device state"""
        if not self.current_device:
            return {}
        
        try:
            state = {
                'vbus_voltage': self.current_device.vbus_voltage,
                'axis0': {
                    'current_state': self.current_device.axis0.current_state,
                    'error': self.current_device.axis0.error,
                    'motor': {
                        'error': self.current_device.axis0.motor.error,
                        'current_control': {
                            'Iq_measured': self.current_device.axis0.motor.current_control.Iq_measured,
                            'Iq_setpoint': self.current_device.axis0.motor.current_control.Iq_setpoint,
                        },
                        'motor_thermistor': {
                            'temperature': getattr(self.current_device.axis0.motor.motor_thermistor, 'temperature', 25.0)
                        },
                        'fet_thermistor': {
                            'temperature': getattr(self.current_device.axis0.motor.fet_thermistor, 'temperature', 25.0)
                        }
                    },
                    'encoder': {
                        'error': self.current_device.axis0.encoder.error,
                        'pos_estimate': self.current_device.axis0.encoder.pos_estimate,
                        'vel_estimate': self.current_device.axis0.encoder.vel_estimate,
                        'config': {
                            'cpr': self.current_device.axis0.encoder.config.cpr,
                        }
                    },
                    'controller': {
                        'error': self.current_device.axis0.controller.error,
                        'pos_setpoint': self.current_device.axis0.controller.pos_setpoint,
                        'vel_setpoint': self.current_device.axis0.controller.vel_setpoint,
                    }
                }
            }
            return state
        except Exception as e:
            logger.error(f"Error getting device state: {e}")
            return {}

    def execute_command(self, command: str) -> Dict[str, Any]:
        """Execute a command on the ODrive"""
        if not self.current_device:
            return {'error': 'No device connected'}
        
        try:
            # Replace odrv0 with actual device reference
            command = command.replace('odrv0', 'self.current_device')
            
            # Handle boolean values properly
            command = command.replace('True', 'True').replace('False', 'False')
            
            # Execute the command
            result = eval(command)
            
            return {'result': str(result) if result is not None else 'Command executed successfully'}
        except Exception as e:
            logger.error(f"Error executing command '{command}': {e}")
            return {'error': str(e)}

    def set_property(self, path: str, value: Any) -> Dict[str, Any]:
        """Set a property on the ODrive"""
        if not self.current_device:
            return {'error': 'No device connected'}
        
        try:
            # Convert path to actual object reference
            path = path.replace('odrv0', 'self.current_device')
            
            # Set the property
            exec(f"{path} = {repr(value)}")
            
            return {'result': 'Property set successfully'}
        except Exception as e:
            logger.error(f"Error setting property '{path}' to '{value}': {e}")
            return {'error': str(e)}

# Initialize ODrive manager
odrive_manager = ODriveManager()

@app.route('/api/odrive/scan', methods=['GET'])
def scan_devices():
    """Scan for ODrive devices"""
    try:
        devices = odrive_manager.scan_for_devices()
        return jsonify(devices)
    except Exception as e:
        logger.error(f"Error in scan_devices: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/connect', methods=['POST'])
def connect_device():
    """Connect to an ODrive device"""
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

@app.route('/api/odrive/disconnect', methods=['POST'])
def disconnect_device():
    """Disconnect from ODrive device"""
    try:
        success = odrive_manager.disconnect_device()
        return jsonify({'message': 'Disconnected successfully'})
    except Exception as e:
        logger.error(f"Error in disconnect_device: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/state', methods=['GET'])
def get_device_state():
    """Get current device state"""
    try:
        state = odrive_manager.get_device_state()
        return jsonify(state)
    except Exception as e:
        logger.error(f"Error in get_device_state: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/telemetry', methods=['GET'])
def get_telemetry():
    """Get high-frequency telemetry data"""
    try:
        # Return the same state data but optimized for high frequency
        state = odrive_manager.get_device_state()
        return jsonify(state)
    except Exception as e:
        logger.error(f"Error in get_telemetry: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/command', methods=['POST'])
def execute_command():
    """Execute a command on the ODrive"""
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

@app.route('/api/odrive/set_property', methods=['POST'])
def set_property():
    """Set a property on the ODrive"""
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

@app.route('/api/odrive/apply_config', methods=['POST'])
def apply_config():
    """Apply configuration commands"""
    try:
        commands = request.json.get('commands', [])
        results = []
        
        for command in commands:
            result = odrive_manager.execute_command(command)
            results.append({'command': command, 'result': result})
            
            if 'error' in result:
                return jsonify({
                    'error': f'Failed at command: {command}',
                    'details': result,
                    'executed_commands': results
                }), 400
        
        return jsonify({
            'message': 'All commands executed successfully',
            'results': results
        })
    except Exception as e:
        logger.error(f"Error in apply_config: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/erase_config', methods=['POST'])
def erase_config():
    """Erase configuration and reboot"""
    try:
        result = odrive_manager.execute_command('self.current_device.erase_configuration()')
        if 'error' not in result:
            # Reboot the device
            odrive_manager.execute_command('self.current_device.reboot()')
            return jsonify({'message': 'Configuration erased and device rebooted'})
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"Error in erase_config: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/save_and_reboot', methods=['POST'])
def save_and_reboot():
    """Save configuration and reboot"""
    try:
        # Save configuration
        result = odrive_manager.execute_command('self.current_device.save_configuration()')
        if 'error' not in result:
            # Reboot the device
            odrive_manager.execute_command('self.current_device.reboot()')
            return jsonify({'message': 'Configuration saved and device rebooted'})
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"Error in save_and_reboot: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/calibrate', methods=['POST'])
def calibrate():
    """Start calibration sequence"""
    try:
        result = odrive_manager.execute_command('self.current_device.axis0.requested_state = 3')  # FULL_CALIBRATION_SEQUENCE
        if 'error' not in result:
            return jsonify({'message': 'Calibration started'})
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"Error in calibrate: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/save_config', methods=['POST'])
def save_config():
    """Save configuration to non-volatile memory"""
    try:
        result = odrive_manager.execute_command('self.current_device.save_configuration()')
        if 'error' not in result:
            return jsonify({'message': 'Configuration saved to non-volatile memory'})
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"Error in save_config: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'version': '0.5.6'})

if __name__ == '__main__':
    logger.info("Starting ODrive GUI Backend v0.5.6")
    app.run(host='0.0.0.0', port=5000, debug=True)