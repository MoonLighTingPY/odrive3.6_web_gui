import logging
from flask import Blueprint, request, jsonify
from ..utils.calibration_utils import check_calibration_prerequisites

logger = logging.getLogger(__name__)
calibration_bp = Blueprint('calibration', __name__, url_prefix='/api/odrive')

# Global ODrive manager (will be set by init_routes)
odrive_manager = None

def init_routes(manager):
    """Initialize routes with ODrive manager"""
    global odrive_manager
    odrive_manager = manager

@calibration_bp.route('/calibration_prerequisites', methods=['GET']) 
def calibration_prerequisites():
    try:
        result = check_calibration_prerequisites(odrive_manager)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in calibration_prerequisites: {e}")
        return jsonify({'error': str(e)}), 500

@calibration_bp.route('/calibrate', methods=['POST'])
def calibrate():
    try:
        data = request.get_json() or {}
        calibration_type = data.get('type', 'full')
        axis_number = data.get('axis', 0)  # Default to axis 0
        
        logger.info(f"Starting {calibration_type} calibration on axis{axis_number}...")
        
        # Check prerequisites first
        prerequisites = check_calibration_prerequisites(odrive_manager)
        if not prerequisites.get('ready', False):
            return jsonify({'error': f"Calibration prerequisites not met: {prerequisites.get('reason', 'Unknown error')}"})
        
        if calibration_type == 'full':
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 3')
            if 'error' not in result:
                logger.info(f"Full calibration sequence started successfully on axis{axis_number}")
                return jsonify({
                    'message': f'Full calibration started on axis{axis_number} (Motor -> Encoder Polarity -> Encoder Offset)',
                    'sequence': ['motor', 'encoder_polarity', 'encoder_offset'],
                    'next_state': 'full_calibration',
                    'axis': axis_number
                })
        elif calibration_type == 'motor':
            # For motor-only calibration, we need to ensure it doesn't auto-continue
            # First, disable any startup sequences that might interfere
            logger.info("Preparing motor-only calibration...")
            
            # Temporarily disable encoder startup sequences to prevent auto-continuation
            odrive_manager.execute_command(f'device.{axis_number}.config.startup_encoder_index_search = False')
            odrive_manager.execute_command(f'device.{axis_number}.config.startup_encoder_offset_calibration = False')

            # Start motor calibration only
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 4')
            if 'error' not in result:
                logger.info("Motor-only calibration started successfully")
                return jsonify({
                    'message': 'Motor calibration started (motor parameters only)',
                    'sequence': ['motor'],
                    'next_state': 'motor_calibration',
                    'axis': axis_number
                })
        elif calibration_type == 'encoder_polarity':
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 10')
            if 'error' not in result:
                logger.info("Encoder polarity calibration started successfully")
                return jsonify({
                    'message': 'Encoder polarity calibration started',
                    'sequence': ['encoder_polarity'],
                    'next_state': 'encoder_dir_find',
                    'axis': axis_number
                })
        elif calibration_type == 'encoder_offset':
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 7')
            if 'error' not in result:
                logger.info("Encoder offset calibration started successfully")
                return jsonify({
                    'message': 'Encoder offset calibration started',
                    'sequence': ['encoder_offset'],
                    'next_state': 'encoder_offset_calibration',
                    'axis': axis_number
                })
        elif calibration_type == 'encoder_sequence':
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 10')
            if 'error' not in result:
                logger.info("Encoder sequence calibration started successfully")
                return jsonify({
                    'message': 'Encoder calibration started (Polarity -> Offset)',
                    'sequence': ['encoder_polarity', 'encoder_offset'],
                    'next_state': 'encoder_dir_find',
                    'axis': axis_number
                })
        elif calibration_type == 'encoder_index_search':
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 6')
            if 'error' not in result:
                logger.info("Encoder index search started successfully")
                return jsonify({
                    'message': 'Encoder index search started',
                    'sequence': ['encoder_index_search'],
                    'next_state': 'encoder_index_search',
                    'axis': axis_number
                })
        else:
            return jsonify({'error': f'Unknown calibration type: {calibration_type}'}), 400
            
        if 'error' in result:
            return jsonify(result), 400
            
        return jsonify({'error': 'Failed to start calibration'}), 500
        
    except Exception as e:
        logger.error(f"Error in calibrate: {e}")
        return jsonify({'error': str(e)}), 500

@calibration_bp.route('/calibration_status', methods=['GET'])
def calibration_status():
    try:
        axis_number = int(request.args.get('axis', 0))  # <-- get axis from query param, default 0

        if not odrive_manager.current_device:
            return jsonify({'error': 'No device connected'}), 400

        # Use axis_number in all commands below
        axis_state_result = odrive_manager.execute_command(f'device.axis{axis_number}.current_state')
        axis_state = 1  # Default to IDLE
        if 'result' in axis_state_result and 'error' not in axis_state_result:
            try:
                axis_state = int(float(axis_state_result['result']))
            except (ValueError, TypeError):
                axis_state = 1

        motor_calibrated_result = odrive_manager.execute_command(f'device.axis{axis_number}.motor.is_calibrated')
        encoder_ready_result = odrive_manager.execute_command(f'device.axis{axis_number}.encoder.is_ready')

        motor_calibrated = False
        if 'result' in motor_calibrated_result and 'error' not in motor_calibrated_result:
            motor_calibrated = str(motor_calibrated_result['result']).lower() in ['true', '1', 'true']

        encoder_ready = False
        if 'result' in encoder_ready_result and 'error' not in encoder_ready_result:
            encoder_ready = str(encoder_ready_result['result']).lower() in ['true', '1', 'true']

        encoder_direction_result = odrive_manager.execute_command(f'device.axis{axis_number}.encoder.config.direction')
        encoder_polarity_calibrated = False
        if 'result' in encoder_direction_result and 'error' not in encoder_direction_result:
            try:
                direction_value = int(float(encoder_direction_result['result']))
                encoder_polarity_calibrated = direction_value != 0
            except (ValueError, TypeError):
                encoder_polarity_calibrated = False

        # Get error states
        axis_error_result = odrive_manager.execute_command(f'device.axis{axis_number}.error')
        motor_error_result = odrive_manager.execute_command(f'device.axis{axis_number}.motor.error')
        encoder_error_result = odrive_manager.execute_command(f'device.axis{axis_number}.encoder.error')
        
        axis_error = 0
        if 'result' in axis_error_result and 'error' not in axis_error_result:
            try:
                axis_error = int(float(axis_error_result['result']))
            except (ValueError, TypeError):
                axis_error = 0
                
        motor_error = 0
        if 'result' in motor_error_result and 'error' not in motor_error_result:
            try:
                motor_error = int(float(motor_error_result['result']))
            except (ValueError, TypeError):
                motor_error = 0
                
        encoder_error = 0
        if 'result' in encoder_error_result and 'error' not in encoder_error_result:
            try:
                encoder_error = int(float(encoder_error_result['result']))
            except (ValueError, TypeError):
                encoder_error = 0
        
        logger.info(f"Calibration flags - Motor: {motor_calibrated}, Encoder Ready: {encoder_ready}, Encoder Polarity: {encoder_polarity_calibrated}")
        logger.info(f"Errors - Axis: 0x{axis_error:08x}, Motor: 0x{motor_error:08x}, Encoder: 0x{encoder_error:08x}")
        logger.info(f"Current axis state: {axis_state}")
        
        has_errors = axis_error != 0 or motor_error != 0 or encoder_error != 0
        
        calibration_phase = 'idle'
        progress_percentage = 0
        auto_continue_action = None
        
        if axis_state == 4:  # MOTOR_CALIBRATION
            calibration_phase = 'motor_calibration'
            progress_percentage = 50
        elif axis_state == 10:  # ENCODER_DIR_FIND
            calibration_phase = 'encoder_polarity'
            progress_percentage = 50
        elif axis_state == 7:  # ENCODER_OFFSET_CALIBRATION
            calibration_phase = 'encoder_offset'
            progress_percentage = 75
        elif axis_state == 3:  # FULL_CALIBRATION_SEQUENCE
            if motor_calibrated and encoder_polarity_calibrated and encoder_ready:
                calibration_phase = 'full_calibration_complete'
                progress_percentage = 100
            elif motor_calibrated and encoder_polarity_calibrated:
                calibration_phase = 'full_calibration_encoder_offset'
                progress_percentage = 75
            elif motor_calibrated:
                calibration_phase = 'full_calibration_encoder_polarity'
                progress_percentage = 50
            else:
                calibration_phase = 'full_calibration_motor'
                progress_percentage = 25
        elif axis_state == 12:  # ENCODER_HALL_POLARITY_CALIBRATION
            calibration_phase = 'encoder_hall_polarity'
            progress_percentage = 50
        elif axis_state == 13:  # ENCODER_HALL_PHASE_CALIBRATION
            calibration_phase = 'encoder_hall_phase'
            progress_percentage = 75
        elif axis_state == 1:  # IDLE
            if has_errors:
                calibration_phase = 'failed'
                progress_percentage = 0
            elif motor_calibrated and encoder_polarity_calibrated and encoder_ready:
                calibration_phase = 'complete'
                progress_percentage = 100
            elif motor_calibrated and encoder_polarity_calibrated and not encoder_ready:
                # Don't auto-continue for motor-only calibration
                calibration_phase = 'motor_complete'
                progress_percentage = 100
            elif motor_calibrated and not encoder_polarity_calibrated:
                # Don't auto-continue for motor-only calibration  
                calibration_phase = 'motor_complete'
                progress_percentage = 100
            else:
                calibration_phase = 'idle'
                progress_percentage = 0
        elif axis_state == 8:  # CLOSED_LOOP_CONTROL
            if motor_calibrated and encoder_ready:
                calibration_phase = 'complete'
                progress_percentage = 100
            else:
                calibration_phase = 'idle'
                progress_percentage = 0
        else:
            if axis_state == 2:  # STARTUP_SEQUENCE
                calibration_phase = 'startup'
                progress_percentage = 10
            elif axis_state == 9:  # LOCKIN_SPIN
                calibration_phase = 'lockin_spin'
                progress_percentage = 40
            else:
                calibration_phase = 'unknown'
                progress_percentage = 0
        
        return jsonify({
            'axis_state': axis_state,
            'motor_calibrated': motor_calibrated,
            'encoder_ready': encoder_ready,
            'encoder_polarity_calibrated': encoder_polarity_calibrated,
            'axis_error': axis_error,
            'motor_error': motor_error,
            'encoder_error': encoder_error,
            'has_errors': has_errors,
            'calibration_phase': calibration_phase,
            'progress_percentage': progress_percentage,
            'auto_continue_action': auto_continue_action
        })
        
    except Exception as e:
        logger.error(f"Error in calibration_status: {e}")
        return jsonify({'error': str(e)}), 500

@calibration_bp.route('/auto_continue_calibration', methods=['POST'])
def auto_continue_calibration():
    try:
        data = request.get_json() or {}
        next_step = data.get('step', '')
        axis_number = data.get('axis', 0)  # Get axis from request, default to 0
        
        logger.info(f"Auto-continuing calibration to step: {next_step} on axis{axis_number}")
        
        if next_step == 'encoder_polarity':
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 10')
            if 'error' not in result:
                return jsonify({
                    'message': f'Auto-continuing to encoder polarity calibration on axis{axis_number}',
                    'next_state': 'encoder_dir_find',
                    'axis': axis_number
                })
        elif next_step == 'encoder_offset':
            result = odrive_manager.execute_command(f'device.axis{axis_number}.requested_state = 7')
            if 'error' not in result:
                return jsonify({
                    'message': f'Auto-continuing to encoder offset calibration on axis{axis_number}', 
                    'next_state': 'encoder_offset_calibration',
                    'axis': axis_number
                })
        else:
            return jsonify({'error': 'Invalid auto-continue step'}), 400
            
        if 'error' in result:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error in auto_continue_calibration: {e}")
        return jsonify({'error': str(e)}), 500

@calibration_bp.route('/encoder_direction_find', methods=['POST'])
def encoder_direction_find():
    try:
        result = odrive_manager.execute_command('device.axis0.requested_state = 10')
        if 'error' not in result:
            return jsonify({'message': 'Encoder direction finding started'})
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"Error in encoder_direction_find: {e}")
        return jsonify({'error': str(e)}), 500