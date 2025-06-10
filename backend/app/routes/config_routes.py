import time
import logging
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)
config_bp = Blueprint('config', __name__, url_prefix='/api/odrive')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

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
                            results[path] = {'error': 'Cannot read method values'}
                        else:
                            # Convert to basic Python types for JSON serialization
                            value = current_obj
                            if hasattr(value, 'value'):  # Enum handling
                                value = value.value
                            elif hasattr(value, '__float__'):
                                value = float(value)
                            elif hasattr(value, '__int__'):
                                value = int(value)
                            elif hasattr(value, '__bool__'):
                                value = bool(value)
                            
                            results[path] = value
                    else:
                        results[path] = {'error': f'Path not found: {clean_path}'}
                        
                except Exception as e:
                    logger.error(f"Error reading path {path}: {e}")
                    results[path] = {'error': f'Read error: {str(e)}'}
                    
            except Exception as e:
                logger.error(f"Error processing path {path}: {e}")
                results[path] = {'error': f'Processing error: {str(e)}'}
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error(f"Error in get_config_batch: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

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
    try:
        # Mark as rebooting before sending erase command since it will disconnect immediately
        odrive_manager.is_rebooting = True
        odrive_manager.reboot_start_time = time.time()
        odrive_manager.connection_lost = True
        odrive_manager.reconnection_attempts = 0
        
        # Execute erase configuration - this will disconnect the device immediately
        try:
            if odrive_manager.current_device:
                odrive_manager.current_device.erase_configuration()
                logger.info("Erase configuration command sent successfully")
        except Exception as e:
            logger.info(f"Erase command completed, device disconnected as expected: {e}")
        
        time.sleep(1.0)
        
        try:
            if odrive_manager.current_device:
                odrive_manager.current_device.reboot()
        except:
            logger.info("Reboot command sent or device already rebooting")
        
        return jsonify({
            'message': 'Configuration erased and device rebooted. Device will reconnect automatically.',
            'reconnect_required': True
        })
    except Exception as e:
        logger.error(f"Error in erase_config: {e}")
        return jsonify({'error': str(e)}), 500

@config_bp.route('/save_and_reboot', methods=['POST'])
def save_and_reboot():
    try:
        save_successful = False
        
        if not odrive_manager.current_device:
            return jsonify({'error': 'No device connected'}), 400
        
        logger.info("Starting save configuration operation")
        
        try:
            odrive_manager.current_device.save_configuration()
            logger.info("Save configuration command sent successfully")
            save_successful = True
            
            time.sleep(0.5)
            
            if odrive_manager.check_connection():
                logger.info("Device remained connected after save operation")
            else:
                logger.info("Device disconnected during save, this is normal for some devices")
                
        except Exception as e:
            if "disconnected" in str(e).lower():
                logger.warning(f"Device disconnected during save operation: {e}")
                save_successful = True
            else:
                logger.error(f"Error saving configuration: {e}")
                return jsonify({'error': f'Failed to save configuration: {str(e)}'}), 400
        
        if save_successful and odrive_manager.connection_lost:
            logger.info("Waiting for device reconnection after save operation")
            
            for attempt in range(10):
                time.sleep(1.0)
                
                if not odrive_manager.connection_lost and odrive_manager.current_device:
                    logger.info(f"Device reconnected after save operation (detected on attempt {attempt + 1})")
                    break
        
        if save_successful:
            if odrive_manager.current_device and not odrive_manager.connection_lost:
                logger.info("Device is connected, proceeding with reboot sequence")
            else:
                logger.info("Device not available for reboot, but save was successful")
                return jsonify({
                    'message': 'Configuration saved successfully. Device may have already rebooted during save operation.',
                    'save_successful': True,
                    'reboot_not_needed': True
                })
            
            odrive_manager.is_rebooting = True
            odrive_manager.reboot_start_time = time.time()
            odrive_manager.connection_lost = True
            odrive_manager.reconnection_attempts = 0
            
            try:
                if odrive_manager.current_device:
                    odrive_manager.current_device.reboot()
                    logger.info("Reboot command sent successfully")
                else:
                    logger.info("Device not available for reboot command")
            except Exception as e:
                logger.info(f"Reboot command completed, device disconnected as expected: {e}")
        
        return jsonify({
            'message': 'Configuration saved and device rebooted. Device will reconnect automatically.',
            'reconnect_required': True,
            'save_successful': save_successful
        })
        
    except Exception as e:
        logger.error(f"Error in save_and_reboot: {e}")
        return jsonify({'error': str(e)}), 500

@config_bp.route('/save_config', methods=['POST'])
def save_config():
    try:
        save_successful = False
        
        if not odrive_manager.current_device:
            return jsonify({'error': 'No device connected'}), 400
        
        logger.info("Starting save configuration operation")
        
        try:
            odrive_manager.current_device.save_configuration()
            logger.info("Save configuration command sent successfully")
            save_successful = True
            
            time.sleep(0.5)
            
            if odrive_manager.check_connection():
                logger.info("Device remained connected after save operation")
                return jsonify({'message': 'Configuration saved to non-volatile memory'})
            else:
                logger.info("Device disconnected during save, marking for reconnection")
                odrive_manager.connection_lost = True
                
        except Exception as e:
            if "disconnected" in str(e).lower():
                logger.warning(f"Device disconnected during save operation: {e}")
                save_successful = True
                odrive_manager.connection_lost = True
            else:
                logger.error(f"Error saving configuration: {e}")
                return jsonify({'error': f'Failed to save configuration: {str(e)}'}), 400
        
        if save_successful and odrive_manager.connection_lost:
            logger.info("Attempting immediate reconnection after save operation")
            
            for attempt in range(8):
                time.sleep(1.5)
                
                if odrive_manager.try_reconnect():
                    logger.info(f"Reconnected after save operation on attempt {attempt + 1}")
                    return jsonify({
                        'message': 'Configuration saved to non-volatile memory (device reconnected after temporary disconnection)',
                        'reconnected': True
                    })
            
            logger.info("Immediate reconnection failed, but save was successful")
            return jsonify({
                'message': 'Configuration saved successfully. Device will reconnect automatically.',
                'save_successful': True,
                'reconnection_in_progress': True
            })
        
        return jsonify({'message': 'Configuration saved to non-volatile memory'})
            
    except Exception as e:
        logger.error(f"Error in save_config: {e}")
        return jsonify({'error': str(e)}), 500