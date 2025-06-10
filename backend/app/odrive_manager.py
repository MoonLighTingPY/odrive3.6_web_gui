import time
import logging
import odrive
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

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

    def _normalize_command(self, command: str) -> str:
        """Normalize command to use 'device' reference instead of odrv0, odrv1, etc."""
        try:
            # Replace common ODrive variable names with 'device'
            normalized = command
            
            # List of common ODrive variable names to replace
            odrive_vars = ['odrv0', 'odrv1', 'dev0', 'dev1', 'my_drive', 'odrive']
            
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
            if self.reboot_start_time and (time.time() - self.reboot_start_time) < 8:
                return False  # Reduced from 10 to 8 seconds
            
        try:
            # Try to read a simple property to check connection
            # Use a lightweight property that's always available
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
    
    def is_connected(self) -> bool:
        """Check if a device is currently connected"""
        return self.current_device is not None and not self.connection_lost

    @property  
    def odrv(self):
        """Get the current ODrive device for telemetry functions"""
        return self.current_device

    def try_reconnect(self) -> bool:
        """Try to reconnect to the same device"""
        if not self.current_device_serial:
            return False
        
        # For physical reconnections, be more aggressive
        if not self.connection_lost:
            # This might be a physical reconnection, so force check
            pass
        elif self.is_rebooting:
            if self.reboot_start_time and (time.time() - self.reboot_start_time) < 5:
                return False  # Don't try to reconnect for first 5 seconds after reboot
            
            if self.reconnection_attempts >= self.max_reconnection_attempts:
                logger.warning(f"Max reconnection attempts reached for rebooting device")
                return False

        # Prevent multiple simultaneous reconnection attempts
        if hasattr(self, '_reconnecting') and self._reconnecting:
            return False
            
        self._reconnecting = True
        self.reconnection_attempts += 1
        
        try:
            logger.info(f"Attempting to reconnect to device {self.current_device_serial} (attempt {self.reconnection_attempts})")
            
            # Use shorter timeout for faster detection of physical reconnections
            timeout = 2 if not self.is_rebooting else 3
                
            odrv = odrive.find_any(timeout=timeout)
            
            if odrv:
                # Check if this is the same device
                device_serial = hex(odrv.serial_number) if hasattr(odrv, 'serial_number') else None
                if device_serial == self.current_device_serial:
                    self.current_device = odrv
                    self.connection_lost = False
                    self.reconnection_attempts = 0
                    self._reconnecting = False
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
            if not self.is_rebooting or self.reconnection_attempts % 2 == 0:
                logger.debug(f"Reconnection attempt {self.reconnection_attempts} failed: {e}")
        finally:
            self._reconnecting = False
            
        return False
    
    def _sanitize_value(self, value_str: str) -> Any:
        """Sanitize and convert string value to appropriate Python type"""
        try:
            # Remove whitespace
            value_str = value_str.strip()
            
            # Handle boolean values
            if value_str.lower() in ['true', 'false']:
                return value_str.lower() == 'true'
            
            # Handle None/null values
            if value_str.lower() in ['none', 'null', 'undefined']:
                return None
            
            # Try to convert to number
            try:
                # Try integer first
                if '.' not in value_str and 'e' not in value_str.lower():
                    return int(value_str)
                else:
                    return float(value_str)
            except ValueError:
                # Return as string if not a number
                return value_str
                
        except Exception as e:
            logger.warning(f"Error sanitizing value '{value_str}': {e}")
            return value_str

    def execute_command(self, command: str) -> Dict[str, Any]:
        """Execute a command on the ODrive"""
        from collections import defaultdict
        
        if not self.current_device:
            return {'error': 'No device connected'}
        
        # For batch operations, reduce rate limiting
        if not hasattr(self, '_batch_mode'):
            # Rate limiting - prevent spamming the same command
            current_time = time.time()
            if not hasattr(self, '_last_api_call'):
                self._last_api_call = defaultdict(float)
            if current_time - self._last_api_call[command] < 0.1:  # API_RATE_LIMIT
                # Return cached result if available, otherwise skip
                return {'error': 'Rate limited - too many requests'}
            
            self._last_api_call[command] = current_time

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
            
            logger.debug(f"Executing command: {command} -> {normalized_command}")
            
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
                    
                    # Sanitize and convert the value
                    value = self._sanitize_value(value_str)
                    
                    # Skip commands with undefined values - check the original string, not sanitized value
                    if value_str.lower() in ['undefined', 'null', 'none']:
                        logger.warning(f"Skipping command with undefined value: {command}")
                        return {'result': f'Skipped {path} (undefined value)'}
                    
                    # Skip if sanitized value is None and original was a null-like string
                    if value is None and value_str.lower() in ['undefined', 'null', 'none']:
                        logger.warning(f"Skipping command with null value: {command}")
                        return {'result': f'Skipped {path} (null value)'}
                    
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
                    
                    # If this was a reboot command and it succeeded, expect disconnection
                    if 'erase_configuration' in normalized_command or 'reboot' in normalized_command:
                        return {'result': 'Command executed successfully - device will reboot'}
                    
                    # Convert result to a JSON-serializable format
                    if result is None:
                        return {'result': None}
                    elif isinstance(result, (int, float, str, bool)):
                        return {'result': result}
                    else:
                        # For complex objects, convert to string
                        return {'result': str(result)}
                        
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