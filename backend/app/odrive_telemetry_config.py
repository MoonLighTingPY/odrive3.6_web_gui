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
        
        # Motor configuration for both axes
        ('axis0.motor.config.motor_type', 'axis0.motor.config.motor_type'),
        ('axis0.motor.config.pole_pairs', 'axis0.motor.config.pole_pairs'),
        ('axis0.motor.config.calibration_current', 'axis0.motor.config.calibration_current'),
        ('axis0.motor.config.resistance_calib_max_voltage', 'axis0.motor.config.resistance_calib_max_voltage'),
        ('axis0.motor.config.phase_inductance', 'axis0.motor.config.phase_inductance'),
        ('axis0.motor.config.phase_resistance', 'axis0.motor.config.phase_resistance'),
        ('axis0.motor.config.torque_constant', 'axis0.motor.config.torque_constant'),
        ('axis0.motor.config.direction', 'axis0.motor.config.direction'),
        ('axis0.motor.config.current_lim', 'axis0.motor.config.current_lim'),
        ('axis0.motor.config.current_lim_margin', 'axis0.motor.config.current_lim_margin'),
        ('axis0.motor.config.torque_lim', 'axis0.motor.config.torque_lim'),
        ('axis0.motor.config.inverter_temp_limit_lower', 'axis0.motor.config.inverter_temp_limit_lower'),
        ('axis0.motor.config.inverter_temp_limit_upper', 'axis0.motor.config.inverter_temp_limit_upper'),
        ('axis0.motor.config.requested_current_range', 'axis0.motor.config.requested_current_range'),
        ('axis0.motor.config.current_control_bandwidth', 'axis0.motor.config.current_control_bandwidth'),
        
        # Encoder configuration
        ('axis0.encoder.config.mode', 'axis0.encoder.config.mode'),
        ('axis0.encoder.config.use_index', 'axis0.encoder.config.use_index'),
        ('axis0.encoder.config.find_idx_on_lockin_only', 'axis0.encoder.config.find_idx_on_lockin_only'),
        ('axis0.encoder.config.abs_spi_cs_gpio_pin', 'axis0.encoder.config.abs_spi_cs_gpio_pin'),
        ('axis0.encoder.config.zero_count_on_find_idx', 'axis0.encoder.config.zero_count_on_find_idx'),
        ('axis0.encoder.config.cpr', 'axis0.encoder.config.cpr'),
        ('axis0.encoder.config.offset', 'axis0.encoder.config.offset'),
        ('axis0.encoder.config.pre_calibrated', 'axis0.encoder.config.pre_calibrated'),
        ('axis0.encoder.config.offset_float', 'axis0.encoder.config.offset_float'),
        ('axis0.encoder.config.enable_phase_interpolation', 'axis0.encoder.config.enable_phase_interpolation'),
        ('axis0.encoder.config.bandwidth', 'axis0.encoder.config.bandwidth'),
        
        # Controller configuration
        ('axis0.controller.config.control_mode', 'axis0.controller.config.control_mode'),
        ('axis0.controller.config.input_mode', 'axis0.controller.config.input_mode'),
        ('axis0.controller.config.pos_gain', 'axis0.controller.config.pos_gain'),
        ('axis0.controller.config.vel_gain', 'axis0.controller.config.vel_gain'),
        ('axis0.controller.config.vel_integrator_gain', 'axis0.controller.config.vel_integrator_gain'),
        ('axis0.controller.config.vel_limit', 'axis0.controller.config.vel_limit'),
        ('axis0.controller.config.vel_limit_tolerance', 'axis0.controller.config.vel_limit_tolerance'),
        ('axis0.controller.config.vel_ramp_rate', 'axis0.controller.config.vel_ramp_rate'),
        ('axis0.controller.config.torque_ramp_rate', 'axis0.controller.config.torque_ramp_rate'),
        ('axis0.controller.config.circular_setpoints', 'axis0.controller.config.circular_setpoints'),
        ('axis0.controller.config.circular_setpoint_range', 'axis0.controller.config.circular_setpoint_range'),
        ('axis0.controller.config.inertia', 'axis0.controller.config.inertia'),
        ('axis0.controller.config.input_filter_bandwidth', 'axis0.controller.config.input_filter_bandwidth'),
        ('axis0.controller.config.homing_speed', 'axis0.controller.config.homing_speed'),
        
        # Axis configuration
        ('axis0.config.watchdog_timeout', 'axis0.config.watchdog_timeout'),
        ('axis0.config.step_dir_always_on', 'axis0.config.step_dir_always_on'),
        ('axis0.config.startup_motor_calibration', 'axis0.config.startup_motor_calibration'),
        ('axis0.config.startup_encoder_index_search', 'axis0.config.startup_encoder_index_search'),
        ('axis0.config.startup_encoder_offset_calibration', 'axis0.config.startup_encoder_offset_calibration'),
        ('axis0.config.startup_closed_loop_control', 'axis0.config.startup_closed_loop_control'),
        ('axis0.config.startup_sensorless_control', 'axis0.config.startup_sensorless_control'),
        ('axis0.config.startup_homing', 'axis0.config.startup_homing'),
        ('axis0.config.enable_step_dir', 'axis0.config.enable_step_dir'),
        ('axis0.config.step_gpio_pin', 'axis0.config.step_gpio_pin'),
        ('axis0.config.dir_gpio_pin', 'axis0.config.dir_gpio_pin'),
        ('axis0.config.counts_per_step', 'axis0.config.counts_per_step'),
        ('axis0.config.enable_sensorless_mode', 'axis0.config.enable_sensorless_mode'),
        ('axis0.config.enable_watchdog', 'axis0.config.enable_watchdog'),
        ('axis0.config.can.node_id', 'axis0.config.can.node_id'),
        ('axis0.config.can.is_extended', 'axis0.config.can.is_extended'),
        ('axis0.config.can.heartbeat_rate_ms', 'axis0.config.can.heartbeat_rate_ms')
    ]
    
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
            
        return {
            'device': {
                'vbus_voltage': vbus,
                'ibus': getattr(odrv, 'ibus', 0),
                'hw_version_major': odrv.hw_version_major,
                'hw_version_minor': odrv.hw_version_minor,
                'fw_version_major': odrv.fw_version_major,
                'fw_version_minor': odrv.fw_version_minor,
                'serial_number': odrv.serial_number,
                'axis0': {
                    'current_state': odrv.axis0.current_state,
                    'error': odrv.axis0.error,
                    'motor': {
                        'error': odrv.axis0.motor.error,
                        'is_calibrated': odrv.axis0.motor.is_calibrated,
                        'current_control': {
                            'Iq_measured': odrv.axis0.motor.current_control.Iq_measured,
                        }
                    },
                    'encoder': {
                        'error': odrv.axis0.encoder.error,
                        'pos_estimate': odrv.axis0.encoder.pos_estimate,
                        'vel_estimate': odrv.axis0.encoder.vel_estimate,
                        'is_ready': odrv.axis0.encoder.is_ready,
                    },
                    'controller': {
                        'error': odrv.axis0.controller.error,
                        'pos_setpoint': odrv.axis0.controller.pos_setpoint,
                        'vel_setpoint': odrv.axis0.controller.vel_setpoint,
                        'torque_setpoint': getattr(odrv.axis0.controller, 'torque_setpoint', 0),
                    }
                }
            },
            'timestamp': time.time() * 1000
        }
    except Exception as e:
        logger.error(f"Error getting dashboard telemetry: {e}")
        return {'device': {}}