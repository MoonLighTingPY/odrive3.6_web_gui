/**
 * Generate all configuration commands for ODrive v0.6.x
 * @param {Object} config - Configuration object containing all sections
 * @param {Object} config.power - Power configuration
 * @param {Object} config.motor - Motor configuration  
 * @param {Object} config.encoder - Encoder configuration
 * @param {Object} config.control - Control configuration
 * @param {Object} config.interface - Interface configuration
 * @returns {Array<string>} Array of ODrive commands
 */

import { odriveRegistry06 } from './odriveUnifiedRegistry_0_6'

export const generatePowerCommands06 = (powerConfig = {}) => {
  const commands = []

  // DC Bus voltage settings (0.6.x structure)
  if (powerConfig.dc_bus_overvoltage_trip_level !== undefined) {
    commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${powerConfig.dc_bus_overvoltage_trip_level}`)
  }

  if (powerConfig.dc_bus_undervoltage_trip_level !== undefined) {
    commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${powerConfig.dc_bus_undervoltage_trip_level}`)
  }

  if (powerConfig.dc_max_positive_current !== undefined) {
    commands.push(`odrv0.config.dc_max_positive_current = ${powerConfig.dc_max_positive_current}`)
  }

  if (powerConfig.dc_max_negative_current !== undefined) {
    commands.push(`odrv0.config.dc_max_negative_current = ${powerConfig.dc_max_negative_current}`)
  }

  // 0.6.x: max_regen_current replaces brake resistor settings in some contexts
  if (powerConfig.max_regen_current !== undefined) {
    commands.push(`odrv0.config.max_regen_current = ${powerConfig.max_regen_current}`)
  }

  // Brake resistor settings (if still applicable in 0.6.x)
  if (powerConfig.brake_resistance !== undefined) {
    commands.push(`odrv0.config.brake_resistance = ${powerConfig.brake_resistance}`)
  }

  if (powerConfig.enable_brake_resistor !== undefined) {
    commands.push(`odrv0.config.enable_brake_resistor = ${powerConfig.enable_brake_resistor}`)
  }

  return commands
}

export const generateMotorCommands06 = (motorConfig = {}, axisNumber = 0) => {
  const commands = []

  // Motor type and basic parameters
  if (motorConfig.motor_type !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.motor_type = ${motorConfig.motor_type}`)
  }

  if (motorConfig.pole_pairs !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.pole_pairs = ${motorConfig.pole_pairs}`)
  }

  if (motorConfig.motor_kv !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.motor_kv = ${motorConfig.motor_kv}`)
  }

  // Current limits
  if (motorConfig.current_lim !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.current_lim = ${motorConfig.current_lim}`)
  }

  if (motorConfig.calibration_current !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.calibration_current = ${motorConfig.calibration_current}`)
  }

  // Motor resistance and inductance
  if (motorConfig.resistance_calib_max_voltage !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.resistance_calib_max_voltage = ${motorConfig.resistance_calib_max_voltage}`)
  }

  if (motorConfig.phase_inductance !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.phase_inductance = ${motorConfig.phase_inductance}`)
  }

  if (motorConfig.phase_resistance !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.phase_resistance = ${motorConfig.phase_resistance}`)
  }

  // 0.6.x: Torque constant might be handled differently
  if (motorConfig.torque_constant !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.torque_constant = ${motorConfig.torque_constant}`)
  }

  // Pre-calibrated settings
  if (motorConfig.pre_calibrated !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.pre_calibrated = ${motorConfig.pre_calibrated}`)
  }

  // Thermistor settings
  if (motorConfig.motor_thermistor_temp_limit_lower !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.motor_thermistor.temp_limit_lower = ${motorConfig.motor_thermistor_temp_limit_lower}`)
  }

  if (motorConfig.motor_thermistor_temp_limit_upper !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.motor_thermistor.temp_limit_upper = ${motorConfig.motor_thermistor_temp_limit_upper}`)
  }

  if (motorConfig.motor_thermistor_enabled !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.motor.motor_thermistor.enabled = ${motorConfig.motor_thermistor_enabled}`)
  }

  return commands
}

export const generateEncoderCommands06 = (encoderConfig = {}, axisNumber = 0) => {
  const commands = []

  // Incremental encoder settings (0.6.x may have different structure)
  if (encoderConfig.cpr !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.encoder.cpr = ${encoderConfig.cpr}`)
  }

  if (encoderConfig.use_index !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.encoder.use_index = ${encoderConfig.use_index}`)
  }

  if (encoderConfig.pre_calibrated !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.encoder.pre_calibrated = ${encoderConfig.pre_calibrated}`)
  }

  // Bandwidth settings
  if (encoderConfig.bandwidth !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.encoder.bandwidth = ${encoderConfig.bandwidth}`)
  }

  // 0.6.x may have additional encoder types and settings
  if (encoderConfig.mode !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.encoder.mode = ${encoderConfig.mode}`)
  }

  // Index search settings
  if (encoderConfig.idx_search_unidirectional !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.encoder.idx_search_unidirectional = ${encoderConfig.idx_search_unidirectional}`)
  }

  if (encoderConfig.find_idx_on_lockin_only !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.encoder.find_idx_on_lockin_only = ${encoderConfig.find_idx_on_lockin_only}`)
  }

  return commands
}

export const generateControlCommands06 = (controlConfig = {}, axisNumber = 0) => {
  const commands = []

  // Control mode
  if (controlConfig.control_mode !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.control_mode = ${controlConfig.control_mode}`)
  }

  if (controlConfig.input_mode !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.input_mode = ${controlConfig.input_mode}`)
  }

  // Position gains
  if (controlConfig.pos_gain !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.pos_gain = ${controlConfig.pos_gain}`)
  }

  // Velocity gains
  if (controlConfig.vel_gain !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.vel_gain = ${controlConfig.vel_gain}`)
  }

  if (controlConfig.vel_integrator_gain !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.vel_integrator_gain = ${controlConfig.vel_integrator_gain}`)
  }

  // Velocity limits
  if (controlConfig.vel_limit !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.vel_limit = ${controlConfig.vel_limit}`)
  }

  if (controlConfig.vel_limit_tolerance !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.vel_limit_tolerance = ${controlConfig.vel_limit_tolerance}`)
  }

  // Advanced control features (0.6.x might have more)
  if (controlConfig.circular_setpoints !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.circular_setpoints = ${controlConfig.circular_setpoints}`)
  }

  if (controlConfig.circular_setpoint_range !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.circular_setpoint_range = ${controlConfig.circular_setpoint_range}`)
  }

  if (controlConfig.inertia !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.inertia = ${controlConfig.inertia}`)
  }

  // Input filter
  if (controlConfig.input_filter_bandwidth !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.input_filter_bandwidth = ${controlConfig.input_filter_bandwidth}`)
  }

  // 0.6.x specific: Harmonic compensation
  if (controlConfig.enable_overspeed_error !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.controller.config.enable_overspeed_error = ${controlConfig.enable_overspeed_error}`)
  }

  return commands
}

export const generateInterfaceCommands06 = (interfaceConfig = {}, axisNumber = 0) => {
  const commands = []

  // CAN settings (0.6.x may have enhanced CAN features)
  if (interfaceConfig.can_node_id !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.can.node_id = ${interfaceConfig.can_node_id}`)
  }

  if (interfaceConfig.can_node_id_extended !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.can.node_id_extended = ${interfaceConfig.can_node_id_extended}`)
  }

  if (interfaceConfig.can_heartbeat_rate_ms !== undefined) {
    commands.push(`odrv0.config.can.heartbeat_rate_ms = ${interfaceConfig.can_heartbeat_rate_ms}`)
  }

  // UART settings
  if (interfaceConfig.uart_baudrate !== undefined) {
    commands.push(`odrv0.config.uart_a_baudrate = ${interfaceConfig.uart_baudrate}`)
  }

  if (interfaceConfig.enable_uart !== undefined) {
    commands.push(`odrv0.config.enable_uart_a = ${interfaceConfig.enable_uart}`)
  }

  // GPIO settings (0.6.x structure)
  if (interfaceConfig.gpio1_mode !== undefined) {
    commands.push(`odrv0.config.gpio1_mode = ${interfaceConfig.gpio1_mode}`)
  }

  if (interfaceConfig.gpio2_mode !== undefined) {
    commands.push(`odrv0.config.gpio2_mode = ${interfaceConfig.gpio2_mode}`)
  }

  // Step/Dir settings
  if (interfaceConfig.enable_step_dir !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.enable_step_dir = ${interfaceConfig.enable_step_dir}`)
  }

  if (interfaceConfig.step_dir_always_on !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.step_dir_always_on = ${interfaceConfig.step_dir_always_on}`)
  }

  // Watchdog
  if (interfaceConfig.enable_watchdog !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.enable_watchdog = ${interfaceConfig.enable_watchdog}`)
  }

  if (interfaceConfig.watchdog_timeout !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.watchdog_timeout = ${interfaceConfig.watchdog_timeout}`)
  }

  // Sensorless mode
  if (interfaceConfig.enable_sensorless !== undefined) {
    commands.push(`odrv0.axis${axisNumber}.config.enable_sensorless_mode = ${interfaceConfig.enable_sensorless}`)
  }

  return commands
}

/**
 * Generate all configuration commands for ODrive v0.6.x
 * @param {Object} config - Configuration object containing all sections
 * @param {number|null} axisNumber - Target axis number (0, 1, or null for both)
 * @returns {Array<string>} Array of ODrive commands
 */
export const generateConfigCommands06 = (config = {}, axisNumber = 0) => {
  // Use the unified registry to generate all commands with axis support
  const allCommands = odriveRegistry06.generateAllCommands(config, axisNumber)
  
  // If axisNumber is null, return all commands (both axes)
  if (axisNumber === null) {
    return allCommands
  }
  
  // Filter commands to only include the specified axis
  const axisPrefix = `axis${axisNumber}`
  return allCommands.filter(cmd => 
    !cmd.includes('axis') || cmd.includes(axisPrefix)
  )
}

// Legacy function exports for compatibility
export const generatePowerCommands = generatePowerCommands06
export const generateMotorCommands = generateMotorCommands06  
export const generateEncoderCommands = generateEncoderCommands06
export const generateControlCommands = generateControlCommands06
export const generateInterfaceCommands = generateInterfaceCommands06
export const generateConfigCommands = generateConfigCommands06