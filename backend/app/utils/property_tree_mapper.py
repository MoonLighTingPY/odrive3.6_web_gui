def map_frontend_path_to_odrive_path(frontend_path):
    """Map frontend property tree paths to actual ODrive paths"""
    
    # Handle calculated properties (these don't map to real ODrive paths)
    if frontend_path.startswith('calculated.'):
        return None
    
    # Handle featured properties
    if frontend_path.startswith('featured.'):
        path_mapping = {
            'featured.telemetry.vbus_voltage': 'vbus_voltage',
            'featured.telemetry.ibus': 'ibus',
            'featured.telemetry.axis0_error': 'axis0.error',
            'featured.telemetry.axis0_current_state': 'axis0.current_state',
            'featured.telemetry.motor_error': 'axis0.motor.error',
            'featured.telemetry.encoder_error': 'axis0.encoder.error',
            'featured.telemetry.controller_error': 'axis0.controller.error',
            'featured.telemetry.pos_estimate': 'axis0.encoder.pos_estimate',
            'featured.telemetry.vel_estimate': 'axis0.encoder.vel_estimate',
            'featured.telemetry.Iq_setpoint': 'axis0.motor.current_control.Iq_setpoint',
            'featured.telemetry.Iq_measured': 'axis0.motor.current_control.Iq_measured',
            'featured.telemetry.pos_setpoint': 'axis0.controller.pos_setpoint',
            'featured.telemetry.vel_setpoint': 'axis0.controller.vel_setpoint',
            'featured.telemetry.torque_setpoint': 'axis0.controller.torque_setpoint',
        }
        return path_mapping.get(frontend_path)
    
    # Handle system properties
    if frontend_path.startswith('system.'):
        system_prop = frontend_path.replace('system.', '')
        # Handle properties that are under config.*
        if system_prop in ['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 
                          'dc_max_positive_current', 'dc_max_negative_current', 
                          'enable_brake_resistor', 'brake_resistance']:
            return f'config.{system_prop}'
        else:
            return system_prop
    
    # Handle direct axis paths
    if frontend_path.startswith('axis0.') or frontend_path.startswith('axis1.'):
        return frontend_path
    
    # Handle config paths
    if frontend_path.startswith('config.'):
        return frontend_path
    
    # For any other path, return as-is
    return frontend_path