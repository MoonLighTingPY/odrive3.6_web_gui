/**
 * Generate all configuration commands for ODrive v0.5.6
 * @param {Object} config - Configuration object containing all sections
 * @param {Object} config.power - Power configuration
 * @param {Object} config.motor - Motor configuration  
 * @param {Object} config.encoder - Encoder configuration
 * @param {Object} config.control - Control configuration
 * @param {Object} config.interface - Interface configuration
 * @returns {Array<string>} Array of ODrive commands
 */

import { odriveRegistry } from './odriveUnifiedRegistry'

export const generatePowerCommands = (powerConfig = {}) => {
  const commands = []

  // DC Bus voltage settings (using underscore_case property names)
  if (powerConfig.dc_bus_overvoltage_trip_level !== undefined) {
    commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${powerConfig.dc_bus_overvoltage_trip_level}`)
  }

  if (powerConfig.dc_bus_undervoltage_trip_level !== undefined) {
    commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${powerConfig.dc_bus_undervoltage_trip_level}`)
  }

  // Enable/disable brake resistor
  if (powerConfig.enable_brake_resistor !== undefined) {
    commands.push(`odrv0.config.enable_brake_resistor = ${powerConfig.enable_brake_resistor}`)
  }

  // Brake resistance
  if (powerConfig.brake_resistance !== undefined) {
    commands.push(`odrv0.config.brake_resistance = ${powerConfig.brake_resistance}`)
  }

  // Current limits
  if (powerConfig.dc_max_positive_current !== undefined) {
    commands.push(`odrv0.config.dc_max_positive_current = ${powerConfig.dc_max_positive_current}`)
  }

  if (powerConfig.dc_max_negative_current !== undefined) {
    commands.push(`odrv0.config.dc_max_negative_current = ${powerConfig.dc_max_negative_current}`)
  }

  // FET Thermistor configuration
  if (powerConfig.fet_temp_limit_lower !== undefined) {
    commands.push(`odrv0.axis0.motor.fet_thermistor.config.temp_limit_lower = ${powerConfig.fet_temp_limit_lower}`)
  }

  if (powerConfig.fet_temp_limit_upper !== undefined) {
    commands.push(`odrv0.axis0.motor.fet_thermistor.config.temp_limit_upper = ${powerConfig.fet_temp_limit_upper}`)
  }

  return commands
}

/**
 * Generate motor configuration commands
 * @param {Object} motorConfig - Motor configuration object
 * @returns {Array<string>} Array of motor-related ODrive commands
 */
export const generateMotorCommands = (motorConfig = {}) => {
  const commands = []
  const axisNum = motorConfig.axisNumber || 0

  // Motor type
  if (motorConfig.motor_type !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.motor_type = ${motorConfig.motor_type}`)
  }

  // Pole pairs
  if (motorConfig.pole_pairs !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.pole_pairs = ${motorConfig.pole_pairs}`)
  }

  // Current limits
  if (motorConfig.current_lim !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.current_lim = ${motorConfig.current_lim}`)
  }

  // Calibration settings
  if (motorConfig.calibration_current !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.calibration_current = ${motorConfig.calibration_current}`)
  }

  if (motorConfig.resistance_calib_max_voltage !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.resistance_calib_max_voltage = ${motorConfig.resistance_calib_max_voltage}`)
  }

  // Lock-in spin current
  if (motorConfig.lock_in_spin_current !== undefined) {
    commands.push(`odrv0.axis${axisNum}.config.calibration_lockin.current = ${motorConfig.lock_in_spin_current}`)
  }

  // Phase resistance (for gimbal motors)
  if (motorConfig.phase_resistance !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.phase_resistance = ${motorConfig.phase_resistance}`)
  }

  // Phase inductance  
  if (motorConfig.phase_inductance !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.phase_inductance = ${motorConfig.phase_inductance}`)
  }

  // Handle motor_kv to torque_constant conversion
  if (motorConfig.motor_kv !== undefined) {

    const torqueConstant = 8.27 / motorConfig.motor_kv
    commands.push(`odrv0.axis${axisNum}.motor.config.torque_constant = ${torqueConstant}`)
  }

  // Direct torque constant setting (takes precedence over motor_kv)
  if (motorConfig.torque_constant !== undefined) {
    // Round to reasonable precision to avoid floating point issues
    const roundedTorqueConstant = parseFloat(motorConfig.torque_constant.toFixed(6))
    commands.push(`odrv0.axis${axisNum}.motor.config.torque_constant = ${roundedTorqueConstant}`)
  }

  // Pre-calibrated flag
  if (motorConfig.pre_calibrated !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.config.pre_calibrated = ${motorConfig.pre_calibrated}`)
  }

  // Motor thermistor configuration
  if (motorConfig.motor_thermistor_enabled !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.enabled = ${motorConfig.motor_thermistor_enabled ? 'True' : 'False'}`)
  }

  if (motorConfig.motor_thermistor_gpio_pin !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.gpio_pin = ${motorConfig.motor_thermistor_gpio_pin}`)
  }

  if (motorConfig.motor_temp_limit_lower !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.temp_limit_lower = ${motorConfig.motor_temp_limit_lower}`)
  }

  if (motorConfig.motor_temp_limit_upper !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.temp_limit_upper = ${motorConfig.motor_temp_limit_upper}`)
  }

  // Polynomial coefficients (if needed for custom thermistors)
  if (motorConfig.motor_thermistor_poly_coeff_0 !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.poly_coefficient_0 = ${motorConfig.motor_thermistor_poly_coeff_0}`)
  }

  if (motorConfig.motor_thermistor_poly_coeff_1 !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.poly_coefficient_1 = ${motorConfig.motor_thermistor_poly_coeff_1}`)
  }

  if (motorConfig.motor_thermistor_poly_coeff_2 !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.poly_coefficient_2 = ${motorConfig.motor_thermistor_poly_coeff_2}`)
  }

  if (motorConfig.motor_thermistor_poly_coeff_3 !== undefined) {
    commands.push(`odrv0.axis${axisNum}.motor.motor_thermistor.config.poly_coefficient_3 = ${motorConfig.motor_thermistor_poly_coeff_3}`)
  }

  return commands
}

/**
 * Generate encoder configuration commands
 * @param {Object} encoderConfig - Encoder configuration object
 * @returns {Array<string>} Array of encoder-related ODrive commands
 */
export const generateEncoderCommands = (encoderConfig = {}) => {
  const commands = []
  const axisNum = encoderConfig.axisNumber || 0

  // Encoder mode/type
  if (encoderConfig.encoder_type !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.mode = ${encoderConfig.encoder_type}`)
  }

  // Counts per revolution
  if (encoderConfig.cpr !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.cpr = ${encoderConfig.cpr}`)
  }

  // Use index
  if (encoderConfig.use_index !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.use_index = ${encoderConfig.use_index}`)
  }

  // Direction
  if (encoderConfig.direction !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.direction = ${encoderConfig.direction}`)
  }

  // Bandwidth
  if (encoderConfig.bandwidth !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.bandwidth = ${encoderConfig.bandwidth}`)
  }

  // Calib range
  if (encoderConfig.calib_range !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.calib_range = ${encoderConfig.calib_range}`)
  }

  // Calib scan distance
  if (encoderConfig.calib_scan_distance !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.calib_scan_distance = ${encoderConfig.calib_scan_distance}`)
  }

  // Calib scan omega
  if (encoderConfig.calib_scan_omega !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.calib_scan_omega = ${encoderConfig.calib_scan_omega}`)
  }

  // Pre-calibrated flag
  if (encoderConfig.pre_calibrated !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.pre_calibrated = ${encoderConfig.pre_calibrated}`)
  }

  // Use index offset
  if (encoderConfig.use_index_offset !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.use_index_offset = ${encoderConfig.use_index_offset}`)
  }

  // Find index on lockin only
  if (encoderConfig.find_idx_on_lockin_only !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.find_idx_on_lockin_only = ${encoderConfig.find_idx_on_lockin_only}`)
  }

  // Absolute SPI CS GPIO pin
  if (encoderConfig.abs_spi_cs_gpio_pin !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.abs_spi_cs_gpio_pin = ${encoderConfig.abs_spi_cs_gpio_pin}`)
  }

  // Enable phase interpolation
  if (encoderConfig.enable_phase_interpolation !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.enable_phase_interpolation = ${encoderConfig.enable_phase_interpolation}`)
  }

  // Hall polarity
  if (encoderConfig.hall_polarity !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.hall_polarity = ${encoderConfig.hall_polarity}`)
  }

  // Hall polarity calibrated
  if (encoderConfig.hall_polarity_calibrated !== undefined) {
    commands.push(`odrv0.axis${axisNum}.encoder.config.hall_polarity_calibrated = ${encoderConfig.hall_polarity_calibrated}`)
  }

  return commands
}

/**
 * Generate control configuration commands
 * @param {Object} controlConfig - Control configuration object
 * @returns {Array<string>} Array of control-related ODrive commands
 */
export const generateControlCommands = (controlConfig = {}) => {
  const commands = []
  const axisNum = controlConfig.axisNumber || 0

  // Control mode
  if (controlConfig.control_mode !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.control_mode = ${controlConfig.control_mode}`)
  }

  // Input mode
  if (controlConfig.input_mode !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.input_mode = ${controlConfig.input_mode}`)
  }

  // Velocity limit
  if (controlConfig.vel_limit !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.vel_limit = ${controlConfig.vel_limit}`)
  }

  // Position gain
  if (controlConfig.pos_gain !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.pos_gain = ${controlConfig.pos_gain}`)
  }

  // Velocity gain and integrator gain
  if (controlConfig.vel_gain !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.vel_gain = ${controlConfig.vel_gain}`)
  }

  if (controlConfig.vel_integrator_gain !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.vel_integrator_gain = ${controlConfig.vel_integrator_gain}`)
  }

  // Velocity limit tolerance
  if (controlConfig.vel_limit_tolerance !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.vel_limit_tolerance = ${controlConfig.vel_limit_tolerance}`)
  }

  // Ramped velocity settings
  if (controlConfig.vel_ramp_rate !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.vel_ramp_rate = ${controlConfig.vel_ramp_rate}`)
  }

  // Torque ramp rate
  if (controlConfig.torque_ramp_rate !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.torque_ramp_rate = ${controlConfig.torque_ramp_rate}`)
  }

  // Circular setpoints
  if (controlConfig.circular_setpoints !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.circular_setpoints = ${controlConfig.circular_setpoints}`)
  }

  // Inertia
  if (controlConfig.inertia !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.inertia = ${controlConfig.inertia}`)
  }

  // Input filter bandwidth
  if (controlConfig.input_filter_bandwidth !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.input_filter_bandwidth = ${controlConfig.input_filter_bandwidth}`)
  }

  // Homing speed
  if (controlConfig.homing_speed !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.homing_speed = ${controlConfig.homing_speed}`)
  }

  // Anticogging enabled
  if (controlConfig.anticogging_enabled !== undefined) {
    commands.push(`odrv0.axis${axisNum}.controller.config.anticogging.anticogging_enabled = ${controlConfig.anticogging_enabled}`)
  }

  return commands
}

/**
 * Generate interface configuration commands
 * @param {Object} interfaceConfig - Interface configuration object
 * @returns {Array<string>} Array of interface-related ODrive commands
 */
export const generateInterfaceCommands = (interfaceConfig = {}) => {
  const commands = []

  // CAN interface
  if (interfaceConfig.can_node_id !== undefined) {
    commands.push(`odrv0.axis0.config.can.node_id = ${interfaceConfig.can_node_id}`)
  }

  if (interfaceConfig.can_node_id_extended !== undefined) {
    commands.push(`odrv0.axis0.config.can.is_extended = ${interfaceConfig.can_node_id_extended}`)
  }

  if (interfaceConfig.can_baudrate !== undefined) {
    commands.push(`odrv0.can.config.baud_rate = ${interfaceConfig.can_baudrate}`)
  }

  if (interfaceConfig.heartbeat_rate_ms !== undefined) {
    commands.push(`odrv0.axis0.config.can.heartbeat_rate_ms = ${interfaceConfig.heartbeat_rate_ms}`)
  }

  // UART A interface
  if (interfaceConfig.enable_uart_a !== undefined) {
    commands.push(`odrv0.config.enable_uart_a = ${interfaceConfig.enable_uart_a}`)
  }

  if (interfaceConfig.uart_a_baudrate !== undefined) {
    commands.push(`odrv0.config.uart_a_baudrate = ${interfaceConfig.uart_a_baudrate}`)
  }

  if (interfaceConfig.uart0_protocol !== undefined) {
    commands.push(`odrv0.config.uart0_protocol = ${interfaceConfig.uart0_protocol}`)
  }

  // UART B interface
  if (interfaceConfig.enable_uart_b !== undefined) {
    commands.push(`odrv0.config.enable_uart_b = ${interfaceConfig.enable_uart_b}`)
  }

  if (interfaceConfig.uart_b_baudrate !== undefined) {
    commands.push(`odrv0.config.uart_b_baudrate = ${interfaceConfig.uart_b_baudrate}`)
  }

  if (interfaceConfig.uart1_protocol !== undefined) {
    commands.push(`odrv0.config.uart1_protocol = ${interfaceConfig.uart1_protocol}`)
  }

  // GPIO settings
  if (interfaceConfig.gpio1_mode !== undefined) {
    commands.push(`odrv0.config.gpio1_mode = ${interfaceConfig.gpio1_mode}`)
  }

  if (interfaceConfig.gpio2_mode !== undefined) {
    commands.push(`odrv0.config.gpio2_mode = ${interfaceConfig.gpio2_mode}`)
  }

  if (interfaceConfig.gpio3_mode !== undefined) {
    commands.push(`odrv0.config.gpio3_mode = ${interfaceConfig.gpio3_mode}`)
  }

  if (interfaceConfig.gpio4_mode !== undefined) {
    commands.push(`odrv0.config.gpio4_mode = ${interfaceConfig.gpio4_mode}`)
  }

  // Watchdog timer
  if (interfaceConfig.enable_watchdog !== undefined) {
    commands.push(`odrv0.axis0.config.enable_watchdog = ${interfaceConfig.enable_watchdog}`)
    commands.push(`odrv0.axis1.config.enable_watchdog = ${interfaceConfig.enable_watchdog}`)
  }

  if (interfaceConfig.watchdog_timeout !== undefined) {
    commands.push(`odrv0.axis0.config.watchdog_timeout = ${interfaceConfig.watchdog_timeout}`)
    commands.push(`odrv0.axis1.config.watchdog_timeout = ${interfaceConfig.watchdog_timeout}`)
  }

  // Step/Direction interface
  if (interfaceConfig.enable_step_dir !== undefined) {
    commands.push(`odrv0.axis0.config.enable_step_dir = ${interfaceConfig.enable_step_dir}`)
  }

  if (interfaceConfig.step_dir_always_on !== undefined) {
    commands.push(`odrv0.axis0.config.step_dir_always_on = ${interfaceConfig.step_dir_always_on}`)
  }

  if (interfaceConfig.step_gpio_pin !== undefined) {
    commands.push(`odrv0.axis0.config.step_gpio_pin = ${interfaceConfig.step_gpio_pin}`)
  }

  if (interfaceConfig.dir_gpio_pin !== undefined) {
    commands.push(`odrv0.axis0.config.dir_gpio_pin = ${interfaceConfig.dir_gpio_pin}`)
  }

  // Sensorless mode
  if (interfaceConfig.enable_sensorless !== undefined) {
    commands.push(`odrv0.axis0.config.enable_sensorless_mode = ${interfaceConfig.enable_sensorless}`)
  }

  return commands
}

/**
 * Generate all configuration commands for ODrive v0.5.6
 * @param {Object} config - Configuration object containing all sections
 * @param {Object} config.power - Power configuration
 * @param {Object} config.motor - Motor configuration  
 * @param {Object} config.encoder - Encoder configuration
 * @param {Object} config.control - Control configuration
 * @param {Object} config.interface - Interface configuration
 * @returns {Array<string>} Array of ODrive commands
 */
export const generateConfigCommands = (config = {}, axisNumber = 0) => { // ADD axisNumber parameter
  // Use the unified registry to generate all commands with axis support
  return odriveRegistry.generateAllCommands(config, axisNumber) // PASS axisNumber
}


/**
 * Generate save and reboot commands
 * @returns {Array<string>} Array of save and reboot commands
 */
export const generateSaveAndRebootCommands = () => {
  return [
    'odrv0.save_configuration()',
    'odrv0.reboot()'
  ]
}

/**
 * Get parameter metadata for validation and UI rendering
 * @param {string} category - Configuration category
 * @param {string} configKey - Configuration key
 * @returns {Object|null} Parameter metadata or null if not found
 */
export const getParameterMetadata = (category, configKey) => {
  return odriveRegistry.getParameterMetadata(category, configKey)
}

/**
 * Validate configuration values against parameter constraints
 * @param {string} category - Configuration category
 * @param {Object} config - Configuration object to validate
 * @returns {Array<string>} Array of validation error messages
 */
export const validateConfiguration = (category, config) => {
  return odriveRegistry.validateConfig(category, config)
}

/**
 * Get all parameters for a category with their metadata
 * @param {string} category - Configuration category
 * @returns {Array<Object>} Array of parameter objects with metadata
 */
export const getCategoryParameters = (category) => {
  return odriveRegistry.getCategoryParameters(category)
}

/**
 * Preview commands that would be generated without executing them
 * @param {Object} config - Full configuration object
 * @returns {Object} Preview object with commands by category
 */
export const previewCommands = (config) => {
  const preview = {
    power: generatePowerCommands(config.power),
    motor: generateMotorCommands(config.motor),
    encoder: generateEncoderCommands(config.encoder),
    control: generateControlCommands(config.control),
    interface: generateInterfaceCommands(config.interface),
    saveAndReboot: generateSaveAndRebootCommands()
  }

  const totalCommands = Object.values(preview).reduce((sum, commands) => sum + commands.length, 0)

  return {
    ...preview,
    summary: {
      totalCommands,
      categoryCounts: Object.fromEntries(
        Object.entries(preview).map(([category, commands]) => [category, commands.length])
      )
    }
  }
}