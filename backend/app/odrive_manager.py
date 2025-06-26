import time
import logging
import odrive
from typing import Dict, Any, List, Optional
import threading
from queue import Queue

logger = logging.getLogger(__name__)

class ODriveManager:
    def __init__(self):
        self.odrives = {}
        self.current_device = None
        self.current_device_serial = None
        self.expecting_reconnection = False  # Only set by save operations
        self.request_lock = threading.Lock()

    @property
    def odrv(self):
        """Compatibility property for safe_get_property method"""
        return self.current_device

    def is_connected(self) -> bool:
        """Check if there's a connected device"""
        return self.current_device is not None

    def check_connection(self) -> bool:
        """Check if the current connection is still valid"""
        if not self.current_device:
            return False
        
        try:
            # Try to access a basic property to test connection
            _ = self.current_device.vbus_voltage
            return True
        except Exception as e:
            logger.debug(f"Connection check failed: {e}")
            return False

    def connect_to_device(self, device_info: Dict[str, Any]) -> bool:
        """Connect to a specific ODrive device"""
        try:
            self.expecting_reconnection = False  # Clear on manual connect
            
            # Find the specific device
            odrv = odrive.find_any(timeout=10)
            
            if odrv:
                # Verify it's the right device if we have a serial
                expected_serial = device_info.get('serial', '')
                if expected_serial and expected_serial != 'unknown_0':
                    try:
                        actual_serial = hex(odrv.serial_number)
                        if actual_serial != expected_serial:
                            logger.warning(f"Serial mismatch: expected {expected_serial}, got {actual_serial}")
                            # Still connect, but log the mismatch
                    except:
                        pass  # Continue anyway if we can't get serial
                
                self.current_device = odrv
                self.current_device_serial = device_info.get('serial', 'unknown')
                logger.info(f"Connected to ODrive: {self.current_device_serial}")
                return True
            else:
                logger.error("No ODrive found during connection attempt")
                return False
                
        except Exception as e:
            logger.error(f"Failed to connect to device: {e}")
            return False
    
    def disconnect_device(self) -> bool:
        """Disconnect from current device"""
        self.expecting_reconnection = False  # Clear on manual disconnect
        try:
            if self.current_device:
                self.current_device = None
                self.current_device_serial = None
                logger.info("Disconnected from ODrive")
            return True
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
            return False

    def scan_for_devices(self) -> List[Dict[str, Any]]:
        """Scan for ODrive devices"""
        devices = []
        try:
            logger.info("Scanning for ODrive devices...")
            
            # Find all connected ODrives
            odrv = odrive.find_any(timeout=5)
            if odrv:
                try:
                    device_info = {
                        'path': 'USB:0',
                        'serial': hex(odrv.serial_number) if hasattr(odrv, 'serial_number') else 'unknown_0',
                        'fw_version': f"v{odrv.fw_version_major}.{odrv.fw_version_minor}.{odrv.fw_version_revision}" if hasattr(odrv, 'fw_version_major') else 'v0.5.6',
                        'hw_version': f"v{odrv.hw_version_major}.{odrv.hw_version_minor}" if hasattr(odrv, 'hw_version_major') else 'v3.6-56V',
                        'index': 0
                    }
                    devices.append(device_info)
                    logger.info(f"Found ODrive: {device_info}")
                except Exception as e:
                    logger.error(f"Error getting device info: {e}")
                    # Add a basic entry even if we can't get details
                    devices.append({
                        'path': 'USB:0',
                        'serial': 'unknown_0',
                        'fw_version': 'v0.5.6',
                        'hw_version': 'v3.6-56V',
                        'index': 0
                    })
            else:
                logger.info("No ODrive devices found")
                
        except Exception as e:
            logger.error(f"Error during device scan: {e}")
        
        return devices

    def save_configuration(self) -> Dict[str, Any]:
        """Save configuration to non-volatile memory"""
        if not self.current_device:
            raise Exception("No device connected")
            
        try:
            self.expecting_reconnection = True  # Expect device to disconnect/reconnect
            result = self.current_device.save_configuration()
            return {"success": True, "message": "Configuration saved"}
        except Exception as e:
            # Only attempt reconnection if we were expecting it
            if self.expecting_reconnection:
                logger.info("Device disconnected after save - attempting single reconnection...")
                if self._attempt_single_reconnection():
                    return {"success": True, "message": "Configuration saved, device reconnected"}
            raise e
    
    def _attempt_single_reconnection(self) -> bool:
        """Attempt a single reconnection after save operation"""
        if not self.current_device_serial:
            return False
            
        try:
            # Wait a moment for device to reboot
            time.sleep(3)
            
            # Try to reconnect to the same device
            devices = self.scan_for_devices()
            for device in devices:
                if device.get('serial') == self.current_device_serial:
                    if self.connect_to_device(device):
                        self.expecting_reconnection = False
                        logger.info("Successfully reconnected after save operation")
                        return True
            
            logger.warning("Could not reconnect to device after save operation")
            return False
        except Exception as e:
            logger.error(f"Reconnection attempt failed: {e}")
            return False

    def _normalize_command(self, command: str) -> str:
        """Normalize command to use 'device' reference instead of odrv0, odrv1, etc."""
        try:
            # Replace common ODrive variable names with 'device'
            normalized = command
            
            # List of common ODrive variable names to replace
            odrive_vars = ['odrv', 'odrv0', 'odrv1', 'dev0', 'dev1', 'my_drive', 'odrive']
            
            for var in odrive_vars:
                # Replace at the beginning of the command
                if normalized.startswith(var + '.'):
                    normalized = normalized.replace(var + '.', 'device.', 1)
                    break
                # Also handle cases where the variable is used without a dot (standalone)
                elif normalized == var:
                    normalized = 'device'
                    break
            
            return normalized
            
        except Exception as e:
            logger.warning(f"Error normalizing command '{command}': {e}")
            return command

    def execute_command(self, command: str) -> Dict[str, Any]:
        """Execute a command on the ODrive"""
        if not self.current_device:
            return {'error': 'No device connected'}
        
        try:
            # Normalize the command to use 'device' reference
            normalized_command = self._normalize_command(command)
            
            # Create a local context with the current device
            local_context = {
                'device': self.current_device,
                'True': True,
                'False': False,
            }
            
            logger.debug(f"Executing command: {command} -> {normalized_command}")
            
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
                    
                    # Sanitize and convert the value
                    value = self._sanitize_value(value_str)
                    
                    try:
                        # Execute the assignment
                        exec(f"{path} = {repr(value)}", {}, local_context)
                        return {'result': f'Set {path} = {value}'}
                    except Exception as e:
                        logger.error(f"Error in assignment execution: {e}")
                        return {'error': str(e)}
            else:
                # Handle function calls and property reads
                try:
                    result = eval(normalized_command, {}, local_context)
                    
                    # Convert result to a JSON-serializable format
                    if result is None:
                        return {'result': None}
                    elif isinstance(result, (int, float, str, bool)):
                        return {'result': result}
                    else:
                        return {'result': str(result)}
                        
                except Exception as e:
                    # If eval fails, try exec for commands that don't return values
                    try:
                        exec(normalized_command, {}, local_context)
                        return {'result': 'Command executed successfully'}
                    except Exception as e2:
                        logger.error(f"Error in command execution: {e2}")
                        return {'error': str(e2)}
        
        except Exception as e:
            logger.error(f"Error executing command '{command}': {e}")
            return {'error': str(e)}

    def set_property(self, path: str, value: Any) -> Dict[str, Any]:
        """Set a property on the ODrive"""
        if not self.current_device:
            return {'error': 'No device connected'}
        
        # Check connection first
        if not self.check_connection():
            return {'error': 'Device disconnected'}
        
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
            return {'error': str(e)}

    def execute_with_lock(self, func, *args, **kwargs):
        """Execute a function with exclusive ODrive access"""
        with self.request_lock:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"ODrive operation failed: {e}")
                raise
    
    def safe_get_property(self, path):
        """Thread-safe property access"""
        def _get_property():
            if not self.current_device:
                return None
                
            parts = path.split('.')
            current = self.current_device
            for part in parts:
                current = getattr(current, part, None)
                if current is None:
                    return None
            return current
        
        return self.execute_with_lock(_get_property)
    
    def safe_set_property(self, path, value):
        """Thread-safe property setting"""
        def _set_property():
            if not self.current_device:
                raise Exception("No device connected")
            
            parts = path.split('.')
            obj = self.current_device
            for part in parts[:-1]:
                obj = getattr(obj, part)
            setattr(obj, parts[-1], value)
        
        return self.execute_with_lock(_set_property)

    def _sanitize_value(self, value_str: str):
        """Sanitize and convert a string value to appropriate type"""
        try:
            # Handle boolean values
            if value_str.lower() in ['true', 'false']:
                return value_str.lower() == 'true'
            
            # Handle None/null
            if value_str.lower() in ['none', 'null']:
                return None
            
            # Try to convert to number
            if '.' in value_str:
                return float(value_str)
            else:
                return int(value_str)
                
        except ValueError:
            # Return as string if conversion fails
            return value_str