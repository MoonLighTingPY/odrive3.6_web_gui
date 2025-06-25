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
        self.telemetry_data = {}
        self.is_scanning = False
        self.connection_lost = False
        self.is_rebooting = False
        self.reboot_start_time = None
        self.reconnection_attempts = 0
        self.max_reconnection_attempts = 15
        self.request_queue = Queue()
        self.request_lock = threading.Lock()
        self.is_processing = False
        
        # New: Centralized reconnection control
        self._reconnection_thread = None
        self._stop_reconnection = threading.Event()
        self._reconnection_lock = threading.Lock()
        self._reconnection_active = False

    def _start_reconnection_thread(self):
        """Start the background reconnection thread"""
        with self._reconnection_lock:
            if not self._reconnection_active:
                self._stop_reconnection.clear()
                self._reconnection_thread = threading.Thread(target=self._reconnection_worker, daemon=True)
                self._reconnection_thread.start()
                self._reconnection_active = True
                logger.info("Started reconnection thread")

    def _stop_reconnection_thread(self):
        """Stop the background reconnection thread"""
        with self._reconnection_lock:
            if self._reconnection_active:
                self._stop_reconnection.set()
                if self._reconnection_thread and self._reconnection_thread.is_alive():
                    self._reconnection_thread.join(timeout=3)
                self._reconnection_active = False
                logger.info("Stopped reconnection thread")

    def _reconnection_worker(self):
        """Background thread worker for handling reconnection"""
        while not self._stop_reconnection.is_set() and self.current_device_serial:
            try:
                if self.connection_lost and not self.is_connected():
                    # Wait appropriate time based on reboot status
                    if self.is_rebooting:
                        if self.reboot_start_time and (time.time() - self.reboot_start_time) < 5:
                            time.sleep(1)
                            continue
                    
                    # Attempt reconnection
                    if self._attempt_reconnection():
                        logger.info(f"Successfully reconnected to device {self.current_device_serial}")
                        self.connection_lost = False
                        self.is_rebooting = False
                        self.reboot_start_time = None
                        self.reconnection_attempts = 0
                        break
                    else:
                        # Wait before next attempt, longer if rebooting
                        wait_time = 3 if self.is_rebooting else 2
                        time.sleep(wait_time)
                else:
                    # Connection is good, exit thread
                    break
                    
            except Exception as e:
                logger.error(f"Error in reconnection worker: {e}")
                time.sleep(2)
        
        # Mark thread as inactive when exiting
        with self._reconnection_lock:
            self._reconnection_active = False
        logger.info("Reconnection worker thread exiting")

    def _attempt_reconnection(self) -> bool:
        """Single reconnection attempt"""
        if not self.current_device_serial:
            return False
            
        if self.reconnection_attempts >= self.max_reconnection_attempts:
            logger.warning(f"Max reconnection attempts reached for device {self.current_device_serial}")
            return False
        
        self.reconnection_attempts += 1
        
        try:
            logger.info(f"Attempting to reconnect to device {self.current_device_serial} (attempt {self.reconnection_attempts})")
            
            # Use longer timeout for reconnection attempts
            timeout = 8 if self.is_rebooting else 5
            odrv = odrive.find_any(timeout=timeout)
            
            if odrv:
                # Check if this is the same device
                device_serial = hex(odrv.serial_number) if hasattr(odrv, 'serial_number') else None
                if device_serial == self.current_device_serial:
                    self.current_device = odrv
                    return True
                else:
                    logger.warning(f"Found different device: {device_serial}, expected: {self.current_device_serial}")
            else:
                logger.debug(f"No ODrive found during reconnection attempt {self.reconnection_attempts}")
                    
        except Exception as e:
            if not self.is_rebooting or self.reconnection_attempts % 3 == 0:
                logger.warning(f"Reconnection attempt {self.reconnection_attempts} failed: {e}")
            
        return False

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
            # Stop any existing reconnection
            self._stop_reconnection_thread()
            
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
            # Stop reconnection thread
            self._stop_reconnection_thread()
            
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
            
            # If we were reconnecting and now we're connected, stop reconnection
            if self.connection_lost:
                self.connection_lost = False
                self.is_rebooting = False
                self.reboot_start_time = None
                self.reconnection_attempts = 0
                self._stop_reconnection_thread()
                logger.info("Device connection restored")
            
            return True
        except Exception as e:
            if not self.connection_lost:
                logger.warning(f"Device connection lost: {e}")
                self.connection_lost = True
                # Start reconnection thread
                self._start_reconnection_thread()
            return False
    
    def is_connected(self) -> bool:
        """Check if a device is currently connected"""
        return self.current_device is not None and not self.connection_lost

    @property  
    def odrv(self):
        """Get the current ODrive device for telemetry functions"""
        return self.current_device

    def try_reconnect(self) -> bool:
        """Try to reconnect to the same device - simplified for status checks"""
        if not self.current_device_serial:
            return False
        
        # For status checks, just do a quick single attempt
        if hasattr(self, '_reconnecting') and self._reconnecting:
            return False
            
        self._reconnecting = True
        
        try:
            logger.info(f"Quick reconnection check for device {self.current_device_serial}")
            
            odrv = odrive.find_any(timeout=3)  # Short timeout for quick checks
            
            if odrv:
                # Check if this is the same device
                device_serial = hex(odrv.serial_number) if hasattr(odrv, 'serial_number') else None
                if device_serial == self.current_device_serial:
                    self.current_device = odrv
                    self.connection_lost = False
                    self.reconnection_attempts = 0
                    self._reconnecting = False
                    logger.info(f"Quick reconnection successful: {self.current_device_serial}")
                    
                    if self.is_rebooting:
                        self.is_rebooting = False
                        self.reboot_start_time = None
                        logger.info("Device reconnected successfully after reboot")
                    
                    return True
                else:
                    logger.debug(f"Found different device: {device_serial}, expected: {self.current_device_serial}")
            else:
                logger.debug(f"No ODrive found during quick reconnection check")
                    
        except Exception as e:
            logger.debug(f"Quick reconnection failed: {e}")
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

        # Check connection first
        if not self.check_connection():
            return {'error': 'Device disconnected'}
        
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
                # Start reconnection thread
                self._start_reconnection_thread()
            
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
                self._start_reconnection_thread()
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
            if "disconnected" in str(e).lower() or "connection" in str(e).lower():
                self.connection_lost = True
                self._start_reconnection_thread()
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
            parts = path.split('.')
            current = self.odrv
            for part in parts:
                current = getattr(current, part, None)
                if current is None:
                    return None
            return current
        
        return self.execute_with_lock(_get_property)
    
    def safe_set_property(self, path, value):
        """Thread-safe property setting"""
        def _set_property():
            parts = path.split('.')
            obj = self.odrv
            for part in parts[:-1]:
                obj = getattr(obj, part)
            setattr(obj, parts[-1], value)
        
        return self.execute_with_lock(_set_property)