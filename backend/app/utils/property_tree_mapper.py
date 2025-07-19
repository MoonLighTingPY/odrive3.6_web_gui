def map_frontend_path_to_odrive_path(frontend_path):
    """Map frontend property tree paths to actual ODrive paths"""
    
    # Handle calculated properties (these don't map to real ODrive paths)
    if frontend_path.startswith('calculated.'):
        return None

    
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