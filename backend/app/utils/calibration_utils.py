import logging

logger = logging.getLogger(__name__)

def check_calibration_prerequisites(odrive_manager, axis_number=0):
    """Check if system is ready for calibration"""
    try:
        # Check bus voltage
        vbus_result = odrive_manager.execute_command('device.vbus_voltage')
        if 'result' in vbus_result:
            vbus = float(vbus_result['result'])
            if vbus < 12.0:  # Minimum voltage for calibration
                return {'ready': False, 'reason': f'Bus voltage too low: {vbus:.1f}V (minimum 12V required)'}
        
        # Check for existing errors
        axis_error_result = odrive_manager.execute_command(f'device.axis{axis_number}.error')
        if 'result' in axis_error_result:
            axis_error = int(float(axis_error_result['result']))
            if axis_error != 0:
                return {'ready': False, 'reason': f'Axis {axis_number} has errors: 0x{axis_error:08x} - clear errors first'}
        
        # Check motor configuration
        motor_type_result = odrive_manager.execute_command(f'device.axis{axis_number}.motor.config.motor_type')
        if 'result' in motor_type_result:
            motor_type = int(float(motor_type_result['result']))
            if motor_type not in [0, 2, 3]:  # HIGH_CURRENT, GIMBAL, ACIM
                return {'ready': False, 'reason': f'Invalid motor type: {motor_type}'}
        
        return {'ready': True}
        
    except Exception as e:
        return {'ready': False, 'reason': f'Error checking prerequisites: {str(e)}'}