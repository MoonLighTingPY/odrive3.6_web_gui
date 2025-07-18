"""
ODrive Telemetry Configuration for v0.5.6 firmware
This module handles the mapping and collection of ODrive properties
"""

import odrive
import logging
import time

logger = logging.getLogger(__name__)

def safe_get_property(odrv, property_path):
    """Safely get a property from the ODrive, returning None if it doesn't exist or fails"""
    try:
        # Handle special function calls
        if 'get_adc_voltage(' in property_path:
            # Extract the GPIO number from get_adc_voltage(3)
            gpio_num = int(property_path.split('(')[1].split(')')[0])
            result = odrv.get_adc_voltage(gpio_num)
            # Convert to basic Python type
            return float(result) if result is not None else None
        
        # Navigate through the property path
        obj = odrv
        parts = property_path.split('.')
        
        for part in parts:
            if hasattr(obj, part):
                obj = getattr(obj, part)
            else:
                logger.debug(f"Property {part} not found in path {property_path}")
                return None
        
        # Convert ODrive objects to basic Python types with more robust handling
        if obj is None:
            return None
        
        # Handle different object types more carefully
        try:
            # First try direct type conversion
            if isinstance(obj, (int, float, bool, str)):
                return obj
            elif hasattr(obj, '__float__'):
                return float(obj)
            elif hasattr(obj, '__int__'):
                return int(obj)
            elif hasattr(obj, '__bool__'):
                return bool(obj)
            else:
                # For any other type, try to convert to string, then parse
                str_val = str(obj)
                
                # Skip obvious non-numeric strings
                if str_val in ['True', 'False']:
                    return str_val == 'True'
                elif str_val == 'None':
                    return None
                elif str_val.startswith('<') or str_val.startswith('0x'):
                    # Skip object representations and hex addresses
                    return None
                
                # Try to parse as number
                try:
                    if '.' in str_val:
                        return float(str_val)
                    else:
                        return int(str_val)
                except ValueError:
                    # If it can't be parsed as number, return as string
                    return str_val
                    
        except (ValueError, TypeError, AttributeError) as e:
            logger.debug(f"Error converting value for {property_path}: {e}")
            return None
                
    except Exception as e:
        logger.debug(f"Error getting property {property_path}: {e}")
        return None

# Update the get_high_frequency_telemetry function to also include some config data:


def get_configuration_data(odrv):
    """Get configuration data (medium + low frequency properties)"""
    if not odrv:
        return {'device': {}}
    
    data = {'device': {}}
    
    # Configuration properties that change less frequently
    config_properties = [
        # System information
        ('hw_version_major', 'hw_version_major'),
        ('hw_version_minor', 'hw_version_minor'),
        ('hw_version_variant', 'hw_version_variant'),
        ('fw_version_major', 'fw_version_major'),
        ('fw_version_minor', 'fw_version_minor'),
        ('fw_version_revision', 'fw_version_revision'),
        ('fw_version_unreleased', 'fw_version_unreleased'),
        ('serial_number', 'serial_number'),
        ('user_config_loaded', 'user_config_loaded'),
        
        # Power configuration
        ('config.dc_bus_overvoltage_trip_level', 'config.dc_bus_overvoltage_trip_level'),
        ('config.dc_bus_undervoltage_trip_level', 'config.dc_bus_undervoltage_trip_level'),
        ('config.dc_max_positive_current', 'config.dc_max_positive_current'),
        ('config.dc_max_negative_current', 'config.dc_max_negative_current'),
        ('config.enable_brake_resistor', 'config.enable_brake_resistor'),
        ('config.brake_resistance', 'config.brake_resistance'),
        ('config.ibus_report_filter_k', 'config.ibus_report_filter_k'),
    ]
    
    # Add configuration for both axes dynamically
    for axis_num in [0, 1]:  # ODrive 3.6 has 2 axes
        try:
            axis = getattr(odrv, f'axis{axis_num}', None)
            if axis is not None:
                axis_config_properties = [
                    # Motor configuration
                    (f'axis{axis_num}.motor.config.motor_type', f'axis{axis_num}.motor.config.motor_type'),
                    (f'axis{axis_num}.motor.config.pole_pairs', f'axis{axis_num}.motor.config.pole_pairs'),
                    (f'axis{axis_num}.motor.config.calibration_current', f'axis{axis_num}.motor.config.calibration_current'),
                    (f'axis{axis_num}.motor.config.resistance_calib_max_voltage', f'axis{axis_num}.motor.config.resistance_calib_max_voltage'),
                    (f'axis{axis_num}.motor.config.phase_inductance', f'axis{axis_num}.motor.config.phase_inductance'),
                    (f'axis{axis_num}.motor.config.phase_resistance', f'axis{axis_num}.motor.config.phase_resistance'),
                    (f'axis{axis_num}.motor.config.torque_constant', f'axis{axis_num}.motor.config.torque_constant'),
                    (f'axis{axis_num}.motor.config.current_lim', f'axis{axis_num}.motor.config.current_lim'),
                    (f'axis{axis_num}.motor.config.current_lim_margin', f'axis{axis_num}.motor.config.current_lim_margin'),
                    (f'axis{axis_num}.motor.config.torque_lim', f'axis{axis_num}.motor.config.torque_lim'),
                    
                    # Encoder configuration
                    (f'axis{axis_num}.encoder.config.mode', f'axis{axis_num}.encoder.config.mode'),
                    (f'axis{axis_num}.encoder.config.use_index', f'axis{axis_num}.encoder.config.use_index'),
                    (f'axis{axis_num}.encoder.config.cpr', f'axis{axis_num}.encoder.config.cpr'),
                    (f'axis{axis_num}.encoder.config.pre_calibrated', f'axis{axis_num}.encoder.config.pre_calibrated'),
                    (f'axis{axis_num}.encoder.config.bandwidth', f'axis{axis_num}.encoder.config.bandwidth'),
                    
                    # Controller configuration
                    (f'axis{axis_num}.controller.config.control_mode', f'axis{axis_num}.controller.config.control_mode'),
                    (f'axis{axis_num}.controller.config.input_mode', f'axis{axis_num}.controller.config.input_mode'),
                    (f'axis{axis_num}.controller.config.pos_gain', f'axis{axis_num}.controller.config.pos_gain'),
                    (f'axis{axis_num}.controller.config.vel_gain', f'axis{axis_num}.controller.config.vel_gain'),
                    (f'axis{axis_num}.controller.config.vel_integrator_gain', f'axis{axis_num}.controller.config.vel_integrator_gain'),
                    (f'axis{axis_num}.controller.config.vel_limit', f'axis{axis_num}.controller.config.vel_limit'),
                    
                    # Axis configuration
                    (f'axis{axis_num}.config.startup_motor_calibration', f'axis{axis_num}.config.startup_motor_calibration'),
                    (f'axis{axis_num}.config.startup_encoder_index_search', f'axis{axis_num}.config.startup_encoder_index_search'),
                    (f'axis{axis_num}.config.startup_encoder_offset_calibration', f'axis{axis_num}.config.startup_encoder_offset_calibration'),
                    (f'axis{axis_num}.config.startup_closed_loop_control', f'axis{axis_num}.config.startup_closed_loop_control'),
                    (f'axis{axis_num}.config.enable_step_dir', f'axis{axis_num}.config.enable_step_dir'),
                    (f'axis{axis_num}.config.enable_watchdog', f'axis{axis_num}.config.enable_watchdog'),
                ]
                config_properties.extend(axis_config_properties)
        except Exception as e:
            logger.debug(f"Could not access axis{axis_num}: {e}")
            continue
    
    for odrv_path, data_path in config_properties:
        value = safe_get_property(odrv, odrv_path)
        if value is not None:
            set_nested_property(data['device'], data_path, value)
    
    return data



def set_nested_property(obj, path, value):
    """Set a nested property in a dictionary structure"""
    try:
        # Handle special cases for analog readings
        if path.startswith('get_adc_voltage(3)'):
            if 'config' not in obj:
                obj['config'] = {}
            obj['config']['analog_reading_gpio3'] = value
            return
        elif path.startswith('get_adc_voltage(4)'):
            if 'config' not in obj:
                obj['config'] = {}
            obj['config']['analog_reading_gpio4'] = value
            return
        
        parts = path.split('.')
        current = obj
        
        # Navigate to the parent object, creating dictionaries as needed
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        
        # Set the final value
        current[parts[-1]] = value
        
    except Exception as e:
        logger.debug(f"Error setting nested property {path}: {e}")

def get_dashboard_telemetry(odrv):
    """Get minimal telemetry data specifically for dashboard display"""
    try:
        # Quick connection test
        vbus = odrv.vbus_voltage
        if vbus <= 0:
            raise Exception("Device appears disconnected - no power detected")
        
        result = {
            'device': {
                'vbus_voltage': vbus,
                'ibus': getattr(odrv, 'ibus', 0),
                'hw_version_major': odrv.hw_version_major,
                'hw_version_minor': odrv.hw_version_minor,
                'fw_version_major': odrv.fw_version_major,
                'fw_version_minor': odrv.fw_version_minor,
                'serial_number': odrv.serial_number,
            },
            'timestamp': time.time() * 1000
        }
        
        # Dynamically detect available axes (ODrive 3.6 typically has axis0 and axis1)
        for axis_num in [0, 1]:  # ODrive 3.6 has 2 axes
            try:
                axis = getattr(odrv, f'axis{axis_num}', None)
                if axis is not None:
                    result['device'][f'axis{axis_num}'] = {
                        'current_state': axis.current_state,
                        'error': axis.error,
                        'motor': {
                            'error': axis.motor.error,
                            'is_calibrated': axis.motor.is_calibrated,
                            'current_control': {
                                'Iq_measured': axis.motor.current_control.Iq_measured,
                            }
                        },
                        'encoder': {
                            'error': axis.encoder.error,
                            'pos_estimate': axis.encoder.pos_estimate,
                            'vel_estimate': axis.encoder.vel_estimate,
                            'is_ready': axis.encoder.is_ready,
                        },
                        'controller': {
                            'error': axis.controller.error,
                            'pos_setpoint': axis.controller.pos_setpoint,
                            'vel_setpoint': axis.controller.vel_setpoint,
                            'torque_setpoint': getattr(axis.controller, 'torque_setpoint', 0),
                        }
                    }
            except Exception as e:
                logger.debug(f"Could not get telemetry for axis{axis_num}: {e}")
                continue
                
        return result
    except Exception as e:
        logger.error(f"Error getting dashboard telemetry: {e}")
        return {'device': {}}