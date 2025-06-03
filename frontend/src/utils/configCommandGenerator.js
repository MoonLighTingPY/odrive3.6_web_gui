/**
 * Configuration Command Generator
 * Generates ODrive v0.5.6 configuration commands from configuration objects
 */

import { safeValue, safeBool, convertKvToTorqueConstant } from './valueHelpers'

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
export const generateConfigCommands = (config) => {
  const { power = {}, motor = {}, encoder = {}, control = {}, interface: interfaceConfig = {} } = config
  const commands = []

  // Power configuration commands (ODrive v0.5.6 syntax)
  commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${safeValue(power.dc_bus_overvoltage_trip_level, 56)}`)
  commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${safeValue(power.dc_bus_undervoltage_trip_level, 10)}`)
  commands.push(`odrv0.config.dc_max_positive_current = ${safeValue(power.dc_max_positive_current, 10)}`)
  commands.push(`odrv0.config.dc_max_negative_current = ${safeValue(power.dc_max_negative_current, -10)}`)
  commands.push(`odrv0.config.brake_resistance = ${safeValue(power.brake_resistance, 2)}`)
  commands.push(`odrv0.config.enable_brake_resistor = ${safeBool(power.brake_resistor_enabled) ? 'True' : 'False'}`)

  // Motor configuration commands
  commands.push(`odrv0.axis0.motor.config.motor_type = ${safeValue(motor.motor_type, 0)}`)
  commands.push(`odrv0.axis0.motor.config.pole_pairs = ${safeValue(motor.pole_pairs, 7)}`)
  
  // Calculate torque constant safely
  const motorKv = safeValue(motor.motor_kv, 230)
  const torqueConstant = convertKvToTorqueConstant(motorKv)
  commands.push(`odrv0.axis0.motor.config.torque_constant = ${torqueConstant.toFixed(6)}`)
  
  commands.push(`odrv0.axis0.motor.config.current_lim = ${safeValue(motor.current_lim, 10)}`)
  commands.push(`odrv0.axis0.motor.config.calibration_current = ${safeValue(motor.calibration_current, 10)}`)
  commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${safeValue(motor.resistance_calib_max_voltage, 4)}`)
  
  // Add lock-in spin current
  const lockInCurrent = safeValue(motor.lock_in_spin_current, 10)
  commands.push(`odrv0.axis0.config.calibration_lockin.current = ${lockInCurrent}`)

  // GIMBAL motor type specific settings
  if (safeValue(motor.motor_type, 0) === 1) { // GIMBAL motor type
    commands.push(`odrv0.axis0.motor.config.phase_resistance = ${safeValue(motor.phase_resistance, 0)}`)
    commands.push(`odrv0.axis0.motor.config.phase_inductance = ${safeValue(motor.phase_inductance, 0)}`)
  }

  // Encoder configuration commands
  commands.push(`odrv0.axis0.encoder.config.mode = ${safeValue(encoder.encoder_type, 1)}`)
  if (safeValue(encoder.encoder_type, 1) === 1) { // INCREMENTAL
    commands.push(`odrv0.axis0.encoder.config.cpr = ${safeValue(encoder.cpr, 4000)}`)
    commands.push(`odrv0.axis0.encoder.config.bandwidth = ${safeValue(encoder.bandwidth, 1000)}`)
    commands.push(`odrv0.axis0.encoder.config.use_index = ${safeBool(encoder.use_index) ? 'True' : 'False'}`)
    commands.push(`odrv0.axis0.encoder.config.calib_range = ${safeValue(encoder.calib_range, 0.02)}`)
    commands.push(`odrv0.axis0.encoder.config.calib_scan_distance = ${safeValue(encoder.calib_scan_distance, 16384)}`)
    commands.push(`odrv0.axis0.encoder.config.calib_scan_omega = ${safeValue(encoder.calib_scan_omega, 12.566)}`)
  }

  // Control configuration commands
  commands.push(`odrv0.axis0.controller.config.control_mode = ${safeValue(control.control_mode, 3)}`)
  commands.push(`odrv0.axis0.controller.config.input_mode = ${safeValue(control.input_mode, 1)}`)
  commands.push(`odrv0.axis0.controller.config.vel_limit = ${safeValue(control.vel_limit, 20)}`)
  commands.push(`odrv0.axis0.controller.config.pos_gain = ${safeValue(control.pos_gain, 1)}`)
  commands.push(`odrv0.axis0.controller.config.vel_gain = ${safeValue(control.vel_gain, 0.228)}`)
  commands.push(`odrv0.axis0.controller.config.vel_integrator_gain = ${safeValue(control.vel_integrator_gain, 0.228)}`)
  commands.push(`odrv0.axis0.controller.config.vel_limit_tolerance = ${safeValue(control.vel_limit_tolerance, 1.2)}`)
  commands.push(`odrv0.axis0.controller.config.vel_ramp_rate = ${safeValue(control.vel_ramp_rate, 10)}`)
  commands.push(`odrv0.axis0.controller.config.torque_ramp_rate = ${safeValue(control.torque_ramp_rate, 0.01)}`)
  commands.push(`odrv0.axis0.controller.config.circular_setpoints = ${safeBool(control.circular_setpoints) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.controller.config.inertia = ${safeValue(control.inertia, 0)}`)
  commands.push(`odrv0.axis0.controller.config.input_filter_bandwidth = ${safeValue(control.input_filter_bandwidth, 2)}`)

  // Interface configuration commands (ODrive v0.5.6 specific)
  
  // CAN configuration (v0.5.6 syntax)
  if (safeBool(interfaceConfig.enable_can)) {
    commands.push(`odrv0.axis0.config.can.node_id = ${safeValue(interfaceConfig.can_node_id, 0)}`)
  }
  
  // Watchdog configuration
  if (safeBool(interfaceConfig.enable_watchdog)) {
    commands.push(`odrv0.axis0.config.watchdog_timeout = ${safeValue(interfaceConfig.watchdog_timeout, 0)}`)
  }

  // GPIO configuration (v0.5.6 syntax)
  for (let i = 1; i <= 4; i++) {
    const gpioMode = safeValue(interfaceConfig[`gpio${i}_mode`], 0)
    commands.push(`odrv0.config.gpio${i}_mode = ${gpioMode}`)
  }

  // Step/Direction interface (if enabled)
  if (safeBool(interfaceConfig.enable_step_dir)) {
    commands.push(`odrv0.axis0.config.step_dir_always_on = ${safeBool(interfaceConfig.step_dir_always_on) ? 'True' : 'False'}`)
  }

  return commands
}

/**
 * Generate power configuration commands only
 * @param {Object} powerConfig - Power configuration object
 * @returns {Array<string>} Array of power-related ODrive commands
 */
export const generatePowerCommands = (powerConfig = {}) => {
  return [
    `odrv0.config.dc_bus_overvoltage_trip_level = ${safeValue(powerConfig.dc_bus_overvoltage_trip_level, 56)}`,
    `odrv0.config.dc_bus_undervoltage_trip_level = ${safeValue(powerConfig.dc_bus_undervoltage_trip_level, 10)}`,
    `odrv0.config.dc_max_positive_current = ${safeValue(powerConfig.dc_max_positive_current, 10)}`,
    `odrv0.config.dc_max_negative_current = ${safeValue(powerConfig.dc_max_negative_current, -10)}`,
    `odrv0.config.brake_resistance = ${safeValue(powerConfig.brake_resistance, 2)}`,
    `odrv0.config.enable_brake_resistor = ${safeBool(powerConfig.brake_resistor_enabled) ? 'True' : 'False'}`
  ]
}

/**
 * Generate motor configuration commands only
 * @param {Object} motorConfig - Motor configuration object
 * @returns {Array<string>} Array of motor-related ODrive commands
 */
export const generateMotorCommands = (motorConfig = {}) => {
  const commands = []
  
  commands.push(`odrv0.axis0.motor.config.motor_type = ${safeValue(motorConfig.motor_type, 0)}`)
  commands.push(`odrv0.axis0.motor.config.pole_pairs = ${safeValue(motorConfig.pole_pairs, 7)}`)
  
  const motorKv = safeValue(motorConfig.motor_kv, 230)
  const torqueConstant = convertKvToTorqueConstant(motorKv)
  commands.push(`odrv0.axis0.motor.config.torque_constant = ${torqueConstant.toFixed(6)}`)
  
  commands.push(`odrv0.axis0.motor.config.current_lim = ${safeValue(motorConfig.current_lim, 10)}`)
  commands.push(`odrv0.axis0.motor.config.calibration_current = ${safeValue(motorConfig.calibration_current, 10)}`)
  commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${safeValue(motorConfig.resistance_calib_max_voltage, 4)}`)
  commands.push(`odrv0.axis0.config.calibration_lockin.current = ${safeValue(motorConfig.lock_in_spin_current, 10)}`)

  if (safeValue(motorConfig.motor_type, 0) === 1) { // GIMBAL motor type
    commands.push(`odrv0.axis0.motor.config.phase_resistance = ${safeValue(motorConfig.phase_resistance, 0)}`)
    commands.push(`odrv0.axis0.motor.config.phase_inductance = ${safeValue(motorConfig.phase_inductance, 0)}`)
  }

  return commands
}

/**
 * Generate encoder configuration commands only
 * @param {Object} encoderConfig - Encoder configuration object
 * @returns {Array<string>} Array of encoder-related ODrive commands
 */
export const generateEncoderCommands = (encoderConfig = {}) => {
  const commands = []
  
  commands.push(`odrv0.axis0.encoder.config.mode = ${safeValue(encoderConfig.encoder_type, 1)}`)
  if (safeValue(encoderConfig.encoder_type, 1) === 1) { // INCREMENTAL
    commands.push(`odrv0.axis0.encoder.config.cpr = ${safeValue(encoderConfig.cpr, 4000)}`)
    commands.push(`odrv0.axis0.encoder.config.bandwidth = ${safeValue(encoderConfig.bandwidth, 1000)}`)
    commands.push(`odrv0.axis0.encoder.config.use_index = ${safeBool(encoderConfig.use_index) ? 'True' : 'False'}`)
    commands.push(`odrv0.axis0.encoder.config.calib_range = ${safeValue(encoderConfig.calib_range, 0.02)}`)
    commands.push(`odrv0.axis0.encoder.config.calib_scan_distance = ${safeValue(encoderConfig.calib_scan_distance, 16384)}`)
    commands.push(`odrv0.axis0.encoder.config.calib_scan_omega = ${safeValue(encoderConfig.calib_scan_omega, 12.566)}`)
  }

  return commands
}

/**
 * Generate control configuration commands only
 * @param {Object} controlConfig - Control configuration object
 * @returns {Array<string>} Array of control-related ODrive commands
 */
export const generateControlCommands = (controlConfig = {}) => {
  return [
    `odrv0.axis0.controller.config.control_mode = ${safeValue(controlConfig.control_mode, 3)}`,
    `odrv0.axis0.controller.config.input_mode = ${safeValue(controlConfig.input_mode, 1)}`,
    `odrv0.axis0.controller.config.vel_limit = ${safeValue(controlConfig.vel_limit, 20)}`,
    `odrv0.axis0.controller.config.pos_gain = ${safeValue(controlConfig.pos_gain, 1)}`,
    `odrv0.axis0.controller.config.vel_gain = ${safeValue(controlConfig.vel_gain, 0.228)}`,
    `odrv0.axis0.controller.config.vel_integrator_gain = ${safeValue(controlConfig.vel_integrator_gain, 0.228)}`,
    `odrv0.axis0.controller.config.vel_limit_tolerance = ${safeValue(controlConfig.vel_limit_tolerance, 1.2)}`,
    `odrv0.axis0.controller.config.vel_ramp_rate = ${safeValue(controlConfig.vel_ramp_rate, 10)}`,
    `odrv0.axis0.controller.config.torque_ramp_rate = ${safeValue(controlConfig.torque_ramp_rate, 0.01)}`,
    `odrv0.axis0.controller.config.circular_setpoints = ${safeBool(controlConfig.circular_setpoints) ? 'True' : 'False'}`,
    `odrv0.axis0.controller.config.inertia = ${safeValue(controlConfig.inertia, 0)}`,
    `odrv0.axis0.controller.config.input_filter_bandwidth = ${safeValue(controlConfig.input_filter_bandwidth, 2)}`
  ]
}

/**
 * Generate interface configuration commands only
 * @param {Object} interfaceConfig - Interface configuration object
 * @returns {Array<string>} Array of interface-related ODrive commands
 */
export const generateInterfaceCommands = (interfaceConfig = {}) => {
  const commands = []
  
  // CAN configuration (v0.5.6 syntax)
  if (safeBool(interfaceConfig.enable_can)) {
    commands.push(`odrv0.axis0.config.can.node_id = ${safeValue(interfaceConfig.can_node_id, 0)}`)
  }
  
  // Watchdog configuration
  if (safeBool(interfaceConfig.enable_watchdog)) {
    commands.push(`odrv0.axis0.config.watchdog_timeout = ${safeValue(interfaceConfig.watchdog_timeout, 0)}`)
  }

  // GPIO configuration (v0.5.6 syntax)
  for (let i = 1; i <= 4; i++) {
    const gpioMode = safeValue(interfaceConfig[`gpio${i}_mode`], 0)
    commands.push(`odrv0.config.gpio${i}_mode = ${gpioMode}`)
  }

  // Step/Direction interface (if enabled)
  if (safeBool(interfaceConfig.enable_step_dir)) {
    commands.push(`odrv0.axis0.config.step_dir_always_on = ${safeBool(interfaceConfig.step_dir_always_on) ? 'True' : 'False'}`)
  }

  return commands
}
