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
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response received:', responseText);
      throw new Error(`Expected JSON response but got: ${contentType || 'unknown'}. Response: ${responseText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object' || !data.results) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure: missing results field');
    }
    
    // Clean the data to handle null/undefined values with reasonable defaults
    const cleanedResults = {};
    Object.entries(data.results).forEach(([path, value]) => {
      if (value === null || value === undefined) {
        // Set reasonable defaults based on parameter name patterns
        if (path.includes('enable_') || path.includes('pre_calibrated') || path.includes('use_')) {
          cleanedResults[path] = false;
        } else if (path.includes('current') || path.includes('voltage') || path.includes('resistance') || 
                   path.includes('gain') || path.includes('limit') || path.includes('constant')) {
          cleanedResults[path] = 0.0;
        } else if (path.includes('mode') || path.includes('type') || path.includes('pairs') || 
                   path.includes('cpr') || path.includes('node_id')) {
          cleanedResults[path] = 0;
        } else if (path.includes('bandwidth') || path.includes('timeout') || path.includes('rate')) {
          cleanedResults[path] = 1000; // Reasonable default for frequencies/rates
        } else {
          cleanedResults[path] = 0;
        }
      } else {
        cleanedResults[path] = value;
      }
    });
    
    return cleanedResults;
    
  } catch (error) {
    console.error('Batch configuration load failed:', error);
    
    if (error.message.includes('JSON')) {
      throw new Error('Backend returned invalid JSON response. Check if ODrive is connected and backend is running properly.');
    }
    throw error;
  }
};

/**
 * Load ALL ODrive v0.5.6 configuration parameters in a single batch request
 * @returns {Promise<Object>} All configuration parameters organized by category
 */
export const loadAllConfigurationBatch = async () => {
  // ALL ODrive v0.5.6 configuration paths in one array - Updated to match configurationMappings
  const allPaths = [
    // Power configuration (8 parameters) - Added FET thermistor
    'device.config.dc_bus_overvoltage_trip_level',
    'device.config.dc_bus_undervoltage_trip_level', 
    'device.config.dc_max_positive_current',
    'device.config.dc_max_negative_current',
    'device.config.enable_brake_resistor',
    'device.config.brake_resistance',
    'device.axis0.motor.fet_thermistor.config.temp_limit_lower',
    'device.axis0.motor.fet_thermistor.config.temp_limit_upper',
    
    // Motor configuration (17 parameters) - Added motor thermistor parameters
    'device.axis0.motor.config.motor_type',
    'device.axis0.motor.config.pole_pairs',
    'device.axis0.motor.config.current_lim',
    'device.axis0.motor.config.calibration_current',
    'device.axis0.motor.config.resistance_calib_max_voltage',
    'device.axis0.motor.config.torque_constant',
    'device.axis0.motor.config.phase_resistance',
    'device.axis0.motor.config.phase_inductance',
    'device.axis0.config.calibration_lockin.current', // This is lock_in_spin_current
    'device.axis0.motor.config.pre_calibrated',
    // Motor thermistor configuration parameters
    'device.axis0.motor.motor_thermistor.config.enabled',
    'device.axis0.motor.motor_thermistor.config.gpio_pin',
    'device.axis0.motor.motor_thermistor.config.temp_limit_lower',
    'device.axis0.motor.motor_thermistor.config.temp_limit_upper',
    'device.axis0.motor.motor_thermistor.config.poly_coefficient_0',
    'device.axis0.motor.motor_thermistor.config.poly_coefficient_1',
    'device.axis0.motor.motor_thermistor.config.poly_coefficient_2',
    'device.axis0.motor.motor_thermistor.config.poly_coefficient_3',
      
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
    
    // Control configuration (13 parameters)
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
    'device.axis0.controller.config.homing_speed',
    
    // Interface configuration (20 parameters)
    'device.axis0.config.can.node_id',
    'device.axis0.config.can.is_extended',
    'device.can.config.baud_rate',
    'device.axis0.config.can.heartbeat_rate_ms',
    'device.config.enable_uart_a',
    'device.config.uart0_protocol',
    'device.config.uart_a_baudrate',
    'device.config.enable_uart_b',
    'device.config.uart1_protocol',
    'device.config.uart_b_baudrate',
    'device.config.gpio1_mode',
    'device.config.gpio2_mode',
    'device.config.gpio3_mode',
    'device.config.gpio4_mode',
    'device.axis0.config.enable_watchdog',
    'device.axis0.config.watchdog_timeout',
    'device.axis0.config.enable_step_dir',
    'device.axis0.config.step_dir_always_on',
    'device.axis0.config.enable_sensorless_mode',
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
        // Handle power configuration mappings
        if (configKey === 'enable_brake_resistor') {
          categorizedResults.power['brake_resistor_enabled'] = value;
        } else {
          categorizedResults.power[configKey] = value;
        }
      } else if (path.includes('.motor.motor_thermistor.config.')) {
        // Motor thermistor parameters should be categorized under motor configuration
        // THIS NEEDS TO COME BEFORE THE INTERFACE CHECK!
        if (configKey === 'enabled') {
          categorizedResults.motor['motor_thermistor_enabled'] = value;
        } else if (configKey === 'gpio_pin') {
          categorizedResults.motor['motor_thermistor_gpio_pin'] = value;
        } else if (configKey === 'temp_limit_lower') {
          categorizedResults.motor['motor_temp_limit_lower'] = value;
        } else if (configKey === 'temp_limit_upper') {
          categorizedResults.motor['motor_temp_limit_upper'] = value;
        } else if (configKey.startsWith('poly_coefficient_')) {
          // Handle polynomial coefficients
          const coeffNum = configKey.split('_').pop();
          categorizedResults.motor[`motor_thermistor_poly_coeff_${coeffNum}`] = value;
        } else {
          categorizedResults.motor[configKey] = value;
        }
      } else if (path.includes('.motor.fet_thermistor.config.')) {
        // FET thermistor should go to power config with proper key mapping
        if (configKey === 'temp_limit_lower') {
          categorizedResults.power['fet_temp_limit_lower'] = value;
        } else if (configKey === 'temp_limit_upper') {
          categorizedResults.power['fet_temp_limit_upper'] = value;
        } else {
          categorizedResults.power[configKey] = value;
        }
      } else if (path.includes('.motor.config.') || path.includes('.calibration_lockin.')) {
        // Handle special motor parameter mappings
        if (configKey === 'torque_constant') {
          // Convert torque constant to motor KV for display AND store original
          categorizedResults.motor['motor_kv'] = convertTorqueConstantToKv(value);
          categorizedResults.motor[configKey] = value; // Store original too
        } else if (configKey === 'current' && path.includes('calibration_lockin')) {
          // Map calibration_lockin.current to lock_in_spin_current
          categorizedResults.motor['lock_in_spin_current'] = value;
        } else {
          categorizedResults.motor[configKey] = value;
        }
      } else if (path.includes('.encoder.config.')) {
        // Handle encoder configuration mappings
        if (configKey === 'mode') {
          categorizedResults.encoder['encoder_type'] = value;
        } else {
          categorizedResults.encoder[configKey] = value;
        }
      } else if (path.includes('.controller.config.')) {
        categorizedResults.control[configKey] = value;
      } else if (path.includes('.can.') || path.includes('.config.enable_uart') || 
                 path.includes('.config.uart_') || path.includes('.config.gpio') ||
                 path.includes('.config.enable_watchdog') || path.includes('.config.watchdog_') ||
                 path.includes('.config.enable_step_dir') || path.includes('.config.step_dir_') ||
                 path.includes('.config.enable_sensorless_mode') || path.includes('.config.uart0_protocol') || 
                 path.includes('.config.uart1_protocol')) {
        // Handle interface configuration mappings
        if (configKey === 'baud_rate') {
          categorizedResults.interface['can_baudrate'] = value;
        } else if (configKey === 'node_id') {
          categorizedResults.interface['can_node_id'] = value;
        } else if (configKey === 'is_extended') {
          categorizedResults.interface['can_node_id_extended'] = value;
        } else if (configKey === 'heartbeat_rate_ms') {
          categorizedResults.interface['heartbeat_rate_ms'] = value;
        } else if (configKey === 'enable_sensorless_mode') {
          categorizedResults.interface['enable_sensorless'] = value;
        } else if (configKey === 'uart0_protocol') {
          categorizedResults.interface['uart0_protocol'] = value;
        } else if (configKey === 'uart1_protocol') {
          categorizedResults.interface['uart1_protocol'] = value;
        } else {
          categorizedResults.interface[configKey] = value;
        }
      } else {
        // Catch any uncategorized parameters
        console.warn(`Uncategorized parameter: ${path} = ${value}`);
        categorizedResults.interface[configKey] = value; // Default to interface
      }
    }
  }

  return categorizedResults;
};