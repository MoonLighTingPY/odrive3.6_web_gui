export const loadConfigurationBatch = async (configPaths) => {
  try {
    const response = await fetch('/api/odrive/config/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: configPaths })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Batch API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert string values to proper types
    const results = {};
    Object.entries(data.results).forEach(([path, value]) => {
      if (typeof value === 'string') {
        // Try to convert numeric strings to numbers
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          results[path] = numValue;
        } else if (value.toLowerCase() === 'true') {
          results[path] = true;
        } else if (value.toLowerCase() === 'false') {
          results[path] = false;
        } else {
          results[path] = value;
        }
      } else {
        results[path] = value;
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error loading configuration batch:', error);
    throw error;
  }
};

/**
 * Load ALL ODrive v0.5.6 configuration parameters in a single batch request
 * @returns {Promise<Object>} All configuration parameters organized by category
 */
eexport const loadAllConfigurationBatch = async () => {
  // ALL ODrive v0.5.6 configuration paths in one array
  const allPaths = [
    // Power configuration (6 parameters)
    'device.config.dc_bus_overvoltage_trip_level',
    'device.config.dc_bus_undervoltage_trip_level', 
    'device.config.dc_max_positive_current',
    'device.config.dc_max_negative_current',
    'device.config.enable_brake_resistor',
    'device.config.brake_resistance',
    
    // Motor configuration (9 parameters) - Added missing lock_in_spin_current
    'device.axis0.motor.config.motor_type',
    'device.axis0.motor.config.pole_pairs',
    'device.axis0.motor.config.current_lim',
    'device.axis0.motor.config.calibration_current',
    'device.axis0.motor.config.resistance_calib_max_voltage',
    'device.axis0.motor.config.torque_constant',
    'device.axis0.motor.config.phase_resistance',
    'device.axis0.motor.config.phase_inductance',
    'device.axis0.config.calibration_lockin.current', // This is lock_in_spin_current
    
    // Encoder configuration (15 parameters)
    'device.axis0.encoder.config.mode',
    'device.axis0.encoder.config.cpr',
    'device.axis0.encoder.config.bandwidth',
    'device.axis0.encoder.config.calib_range',
    'device.axis0.encoder.config.use_index',
    'device.axis0.encoder.config.calib_scan_distance',
    'device.axis0.encoder.config.calib_scan_omega',
    'device.axis0.encoder.config.pre_calibrated',
    'device.axis0.encoder.config.use_index_offset',
    'device.axis0.encoder.config.find_idx_on_lockin_only',
    'device.axis0.encoder.config.direction',
    'device.axis0.encoder.config.abs_spi_cs_gpio_pin',
    'device.axis0.encoder.config.enable_phase_interpolation',
    'device.axis0.encoder.config.hall_polarity',
    'device.axis0.encoder.config.hall_polarity_calibrated',
    
    // Control configuration (13 parameters) - Added missing homing_speed
    'device.axis0.controller.config.input_mode',
    'device.axis0.controller.config.control_mode',
    'device.axis0.controller.config.pos_gain',
    'device.axis0.controller.config.vel_limit',
    'device.axis0.controller.config.vel_gain',
    'device.axis0.controller.config.vel_integrator_gain',
    'device.axis0.controller.config.vel_limit_tolerance',
    'device.axis0.controller.config.vel_ramp_rate',
    'device.axis0.controller.config.circular_setpoints',
    'device.axis0.controller.config.torque_ramp_rate',
    'device.axis0.controller.config.input_filter_bandwidth',
    'device.axis0.controller.config.inertia',
    'device.axis0.controller.config.homing_speed', // Added missing parameter
    
    // Interface configuration (18 parameters) - Added missing UART protocol parameters
    'device.axis0.config.can.node_id',
    'device.axis0.config.can.is_extended',
    'device.can.config.baud_rate',
    'device.axis0.config.can.heartbeat_rate_ms',
    'device.config.enable_uart_a',
    'device.config.uart_a_baudrate',
    'device.config.uart0_protocol',        // Added missing UART A protocol
    'device.config.enable_uart_b',
    'device.config.uart_b_baudrate',
    'device.config.uart1_protocol',        // Added missing UART B protocol
    'device.config.gpio1_mode',
    'device.config.gpio2_mode',
    'device.config.gpio3_mode',
    'device.config.gpio4_mode',
    'device.axis0.config.enable_watchdog',
    'device.axis0.config.watchdog_timeout',
    'device.axis0.config.enable_step_dir',
    'device.axis0.config.step_dir_always_on'
  ];
  
  // Load all parameters in one batch request
  const allResults = await loadConfigurationBatch(allPaths);
  
  // Import the conversion function at the top level
  const { convertTorqueConstantToKv } = await import('../utils/valueHelpers');
  
  // Organize results by category
  const categorizedResults = {
    power: {},
    motor: {},
    encoder: {},
    control: {},
    interface: {}
  };
  
  // Use for...of instead of forEach to handle async operations
  for (const [path, value] of Object.entries(allResults)) {
    // Skip error responses
    if (value && typeof value === 'object' && value.error) {
      console.warn(`Error reading ${path}:`, value.error);
      continue;
    }
    
    if (value !== undefined && value !== null) {
      const configKey = path.split('.').pop();
      
      // Categorize by path pattern with special handling for specific parameters
      if (path.includes('.config.dc_') || path.includes('.config.brake_') || path.includes('.config.enable_brake_')) {
        categorizedResults.power[configKey] = value;
      } else if (path.includes('.motor.config.') || path.includes('.calibration_lockin.')) {
        // Handle special motor parameter mappings
        if (configKey === 'torque_constant') {
          // Convert torque constant to motor KV for display
          categorizedResults.motor['motor_kv'] = convertTorqueConstantToKv(value);
        }
        if (configKey === 'current' && path.includes('calibration_lockin')) {
          // Map calibration_lockin.current to lock_in_spin_current
          categorizedResults.motor['lock_in_spin_current'] = value;
        } else {
          categorizedResults.motor[configKey] = value;
        }
      } else if (path.includes('.encoder.config.')) {
        categorizedResults.encoder[configKey] = value;
      } else if (path.includes('.controller.config.')) {
        categorizedResults.control[configKey] = value;
      } else if (path.includes('.can.') || path.includes('.config.enable_uart') || 
                 path.includes('.config.uart_') || path.includes('.config.gpio') ||
                 path.includes('.config.enable_watchdog') || path.includes('.config.watchdog_') ||
                 path.includes('.config.enable_step_dir') || path.includes('.config.step_dir_')) {
        categorizedResults.interface[configKey] = value;
      }
    }
  }
  
  return categorizedResults;
};