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
        self.current_device_serial = None
        self.telemetry_data = {}
        self.is_scanning = False
        self.connection_lost = False
        self.is_rebooting = False
        self.reboot_start_time = None
        self.reconnection_attempts = 0
        self.max_reconnection_attempts = 10

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
                self.current_device_serial = device_info['serial']
                self.odrives[device_info['serial']] = odrv
                self.connection_lost = False
                self.is_rebooting = False
                self.reboot_start_time = None
                self.reconnection_attempts = 0
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
                self.current_device_serial = None
                self.connection_lost = False
                self.is_rebooting = False
                self.reboot_start_time = None
                self.reconnection_attempts = 0
                logger.info("Disconnected from ODrive")
            return True
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
            return False

    def check_connection(self) -> bool:
        """Check if device is still connected"""
        if not self.current_device:
            return False
        
        # If we're in a reboot state, don't try to check connection yet
        if self.is_rebooting:
            if self.reboot_start_time and (time.time() - self.reboot_start_time) < 10:
                return False  # Wait at least 10 seconds after reboot command
            
        try:
            # Try to read a simple property to check connection
            _ = self.current_device.vbus_voltage
            self.connection_lost = False
            if self.is_rebooting:
                self.is_rebooting = False
                self.reboot_start_time = None
                self.reconnection_attempts = 0
                logger.info("Device has successfully reconnected after reboot")
            return True
        except Exception as e:
            if not self.connection_lost:
                logger.warning(f"Device connection lost: {e}")
                self.connection_lost = True
            return False

    def try_reconnect(self) -> bool:
        """Try to reconnect to the same device"""
        if not self.current_device_serial or not self.connection_lost:
            return False
        
        # If we're rebooting, wait longer between attempts and limit total attempts
        if self.is_rebooting:
            if self.reboot_start_time and (time.time() - self.reboot_start_time) < 5:
                return False  # Don't try to reconnect for first 5 seconds after reboot
            
            if self.reconnection_attempts >= self.max_reconnection_attempts:
                logger.warning(f"Max reconnection attempts reached for rebooting device")
                return False
        
        self.reconnection_attempts += 1
        
        try:
            logger.info(f"Attempting to reconnect to device {self.current_device_serial} (attempt {self.reconnection_attempts})")
            
            # Use shorter timeout for reconnection attempts
            timeout = 3 if self.is_rebooting else 5
            odrv = odrive.find_any(timeout=timeout)
            
            if odrv:
                # Check if this is the same device
                device_serial = hex(odrv.serial_number) if hasattr(odrv, 'serial_number') else None
                if device_serial == self.current_device_serial:
                    self.current_device = odrv
                    self.connection_lost = False
                    self.reconnection_attempts = 0
                    logger.info(f"Reconnected to ODrive: {self.current_device_serial}")
                    
                    if self.is_rebooting:
                        self.is_rebooting = False
                        self.reboot_start_time = None
                        logger.info("Device reconnected successfully after reboot")
                    
                    return True
                else:
                    logger.warning(f"Found different device: {device_serial}, expected: {self.current_device_serial}")
                    
        except Exception as e:
            # Reduce log noise during reboot by only logging every few attempts
            if not self.is_rebooting or self.reconnection_attempts % 3 == 0:
                logger.error(f"Error during reconnection attempt {self.reconnection_attempts}: {e}")
            
        return False

    def get_device_state(self) -> Dict[str, Any]:
        """Get current device state"""
        if not self.current_device:
            return {}
        
        # Check connection and try to reconnect if needed
        if not self.check_connection():
            if self.try_reconnect():
                # Successfully reconnected, proceed
                pass
            else:
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
            if not self.is_rebooting:  # Reduce log noise during reboot
                logger.error(f"Error getting device state: {e}")
            self.connection_lost = True
            return {}

    def _normalize_command(self, command: str) -> str:
        """Normalize command to use device reference instead of hardcoded names"""
        # Replace any common ODrive variable names with 'device'
        command = command.replace('odrv0.', 'device.')
        command = command.replace('odrv1.', 'device.')
        command = command.replace('dev0.', 'device.')
        command = command.replace('dev1.', 'device.')
        command = command.replace('my_drive.', 'device.')
        command = command.replace('odrive.', 'device.')
        
        # Handle function calls without dot notation
        if command.startswith('odrv0'):
            command = command.replace('odrv0', 'device', 1)
        elif command.startswith('odrv1'):
            command = command.replace('odrv1', 'device', 1)
        elif command.startswith('dev0'):
            command = command.replace('dev0', 'device', 1)
        elif command.startswith('dev1'):
            command = command.replace('dev1', 'device', 1)
        elif command.startswith('my_drive'):
            command = command.replace('my_drive', 'device', 1)
        elif command.startswith('odrive'):
            command = command.replace('odrive', 'device', 1)
            
        return command

    def _sanitize_value(self, value_str: str):
        """Sanitize and convert value string to appropriate Python type"""
        value_str = str(value_str).strip()
        
        # Handle undefined/null values
        if value_str.lower() in ['undefined', 'null', 'none', '']:
            return None
            
        # Handle boolean values
        if value_str in ['True', 'true', 'TRUE']:
            return True
        elif value_str in ['False', 'false', 'FALSE']:
            return False
        
        # Handle numeric values
        try:
            # Try integer first
            if '.' not in value_str and 'e' not in value_str.lower():
                return int(value_str)
            else:
                return float(value_str)
        except ValueError:
            # If all else fails, return as string
            return value_str

    def execute_command(self, command: str) -> Dict[str, Any]:
        """Execute a command on the ODrive"""
        if not self.current_device:
            return {'error': 'No device connected'}
        
        # Check connection and try to reconnect if needed (but not during reboot)
        if not self.is_rebooting:
            if not self.check_connection():
                if not self.try_reconnect():
                    return {'error': 'Device disconnected and could not reconnect'}
        
        try:
            # Normalize the command to use 'device' reference
            normalized_command = self._normalize_command(command)
            
            # Create a local context with the current device
            local_context = {
                'device': self.current_device,
                'True': True,
                'False': False,
                # Also add common ODrive variable names pointing to the same device
                'odrv0': self.current_device,
                'odrv1': self.current_device,
                'dev0': self.current_device,
                'dev1': self.current_device,
                'my_drive': self.current_device,
                'odrive': self.current_device,
            }
            
            logger.info(f"Executing command: {command} -> {normalized_command}")
            
            # Special handling for reboot-related commands
            if 'erase_configuration' in normalized_command or 'reboot' in normalized_command:
                # Mark as rebooting before executing
                self.is_rebooting = True
                self.reboot_start_time = time.time()
                self.connection_lost = True
                self.reconnection_attempts = 0
            
            # Check if this is an assignment or function call
            if '=' in normalized_command:
                # Handle assignments
                parts = normalized_command.split('=', 1)
                if len(parts) == 2:
                    path = parts[0].strip()
                    value_str = parts[1].strip()
                    
                    # Skip commands with undefined values
                    if value_str.lower() in ['undefined', 'null', 'none']:
                        logger.warning(f"Skipping command with undefined value: {command}")
                        return {'result': f'Skipped {path} (undefined value)'}
                    
                    try:
                        # Sanitize and convert the value
                        value = self._sanitize_value(value_str)
                        
                        if value is None:
                            logger.warning(f"Skipping command with null value: {command}")
                            return {'result': f'Skipped {path} (null value)'}
                        
                        # Execute the assignment
                        exec(f"{path} = {repr(value)}", {}, local_context)
                        return {'result': f'Set {path} = {value}'}
                    except Exception as e:
                        logger.error(f"Error in assignment execution: {e}")
                        return {'error': str(e)}
            else:
                # Handle function calls
                try:
                    result = eval(normalized_command, {}, local_context)
                    
                    # If this was a reboot command and it succeeded, expect disconnection
                    if 'erase_configuration' in normalized_command or 'reboot' in normalized_command:
                        return {'result': 'Command executed successfully - device will reboot'}
                    
                    return {'result': str(result) if result is not None else 'Command executed successfully'}
                except Exception as e:
                    # If eval fails, try exec for commands that don't return values
                    try:
                        exec(normalized_command, {}, local_context)
                        
                        # If this was a reboot command and it succeeded, expect disconnection
                        if 'erase_configuration' in normalized_command or 'reboot' in normalized_command:
                            return {'result': 'Command executed successfully - device will reboot'}
                        
                        return {'result': 'Command executed successfully'}
                    except Exception as e2:
                        # For reboot commands, disconnection errors are expected
                        if ('erase_configuration' in normalized_command or 'reboot' in normalized_command) and 'disconnected' in str(e2).lower():
                            logger.info(f"Reboot command executed, device disconnected as expected: {e2}")
                            return {'result': 'Command executed successfully - device rebooted'}
                        
                        logger.error(f"Error in command execution: {e2}")
                        return {'error': str(e2)}
                
        except Exception as e:
            # For reboot commands, disconnection errors are expected
            if ('erase_configuration' in command or 'reboot' in command) and 'disconnected' in str(e).lower():
                logger.info(f"Reboot command executed, device disconnected as expected: {e}")
                return {'result': 'Command executed successfully - device rebooted'}
            
            logger.error(f"Error executing command '{command}': {e}")
            # Check if this was a connection error
            if "disconnected" in str(e).lower() or "connection" in str(e).lower():
                self.connection_lost = True
            return {'error': str(e)}

    def set_property(self, path: str, value: Any) -> Dict[str, Any]:
        """Set a property on the ODrive"""
        if not self.current_device:
            return {'error': 'No device connected'}
        
        # Check connection and try to reconnect if needed
        if not self.check_connection():
            if not self.try_reconnect():
                return {'error': 'Device disconnected and could not reconnect'}
        
        try:
            # Normalize the path
            normalized_path = self._normalize_command(path)
            
            # Create a local context with the current device
            local_context = {
                'device': self.current_device,
                'odrv0': self.current_device,
                'odrv1': self.current_device,
                'dev0': self.current_device,
                'dev1': self.current_device,
                'my_drive': self.current_device,
                'odrive': self.current_device,
            }
            
            # Set the property
            exec(f"{normalized_path} = {repr(value)}", {}, local_context)
            
            return {'result': f'Set {normalized_path} = {value}'}
        except Exception as e:
            logger.error(f"Error setting property '{path}' to '{value}': {e}")
            if "disconnected" in str(e).lower() or "connection" in str(e).lower():
                self.connection_lost = True
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

@app.route('/api/odrive/erase_config', methods=['POST'])
def erase_config():
    """Erase configuration and reboot"""
    try:
        # Mark as rebooting before sending erase command since it will disconnect immediately
        odrive_manager.is_rebooting = True
        odrive_manager.reboot_start_time = time.time()
        odrive_manager.connection_lost = True
        odrive_manager.reconnection_attempts = 0
        
        # Execute erase configuration - this will disconnect the device immediately
        try:
            # Direct call without going through execute_command to avoid reconnection attempts
            if odrive_manager.current_device:
                odrive_manager.current_device.erase_configuration()
                logger.info("Erase configuration command sent successfully")
        except Exception as e:
            # Expected to fail as device disconnects immediately
            logger.info(f"Erase command completed, device disconnected as expected: {e}")
        
        # Wait a moment before attempting reboot (if device is still responsive)
        time.sleep(1.0)
        
        # Try to send reboot command, but don't worry if it fails
        try:
            if odrive_manager.current_device:
                odrive_manager.current_device.reboot()
        except:
            # Expected to fail as device may already be rebooting
            logger.info("Reboot command sent or device already rebooting")
        
        return jsonify({
            'message': 'Configuration erased and device rebooted. Device will reconnect automatically.',
            'reconnect_required': True
        })
    except Exception as e:
        logger.error(f"Error in erase_config: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/save_and_reboot', methods=['POST'])
def save_and_reboot():
    """Save configuration and reboot"""
    try:
        # Save configuration first
        try:
            if odrive_manager.current_device:
                odrive_manager.current_device.save_configuration()
                logger.info("Save configuration command sent successfully")
            else:
                return jsonify({'error': 'No device connected'}), 400
        except Exception as e:
            logger.error(f"Error saving configuration: {e}")
            return jsonify({'error': f'Failed to save configuration: {str(e)}'}), 400
            
        # Wait a moment for the save to complete
        time.sleep(1.0)
        
        # Mark as rebooting before sending reboot command
        odrive_manager.is_rebooting = True
        odrive_manager.reboot_start_time = time.time()
        odrive_manager.connection_lost = True
        odrive_manager.reconnection_attempts = 0
        
        # Reboot the device - this will cause disconnection
        try:
            if odrive_manager.current_device:
                odrive_manager.current_device.reboot()
                logger.info("Reboot command sent successfully")
        except Exception as e:
            # Expected to fail as device disconnects immediately
            logger.info(f"Reboot command completed, device disconnected as expected: {e}")
        
        return jsonify({
            'message': 'Configuration saved and device rebooted. Device will reconnect automatically.',
            'reconnect_required': True
        })
    except Exception as e:
        logger.error(f"Error in save_and_reboot: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/calibrate', methods=['POST'])
def calibrate():
    """Start calibration sequence"""
    try:
        result = odrive_manager.execute_command('device.axis0.requested_state = 3')  # FULL_CALIBRATION_SEQUENCE
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
        result = odrive_manager.execute_command('device.save_configuration()')
        if 'error' not in result:
            return jsonify({'message': 'Configuration saved to non-volatile memory'})
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"Error in save_config: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/odrive/connection_status', methods=['GET'])
def connection_status():
    """Get connection status"""
    try:
        is_connected = odrive_manager.check_connection()
        return jsonify({
            'connected': is_connected,
            'connection_lost': odrive_manager.connection_lost,
            'device_serial': odrive_manager.current_device_serial
        })
    except Exception as e:
        logger.error(f"Error in connection_status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'version': '0.5.6'})

if __name__ == '__main__':
    logger.info("Starting ODrive GUI Backend v0.5.6")
    app.run(host='0.0.0.0', port=5000, debug=True)