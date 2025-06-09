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
  const commands = []
  
  const { power = {}, motor = {}, encoder = {}, control = {}, interface: interfaceConfig = {} } = config

  // Power configuration commands
  commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${safeValue(power.dc_bus_overvoltage_trip_level, 56)}`)
  commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${safeValue(power.dc_bus_undervoltage_trip_level, 10)}`)
  commands.push(`odrv0.config.dc_max_positive_current = ${safeValue(power.dc_max_positive_current, 10)}`)
  commands.push(`odrv0.config.dc_max_negative_current = ${safeValue(power.dc_max_negative_current, -10)}`)
  commands.push(`odrv0.config.brake_resistance = ${safeValue(power.brake_resistance, 2)}`)
  commands.push(`odrv0.config.enable_brake_resistor = ${safeBool(power.brake_resistor_enabled) ? 'True' : 'False'}`)

  // Motor configuration commands
  commands.push(`odrv0.axis0.motor.config.motor_type = ${safeValue(motor.motor_type, 0)}`)
  commands.push(`odrv0.axis0.motor.config.pole_pairs = ${safeValue(motor.pole_pairs, 7)}`)
  commands.push(`odrv0.axis0.motor.config.current_lim = ${safeValue(motor.current_lim, 10)}`)
  commands.push(`odrv0.axis0.motor.config.calibration_current = ${safeValue(motor.calibration_current, 10)}`)
  commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${safeValue(motor.resistance_calib_max_voltage, 12)}`)
  
  // Convert motor KV to torque constant if needed
  if (motor.motor_kv !== undefined && motor.motor_kv !== null) {
    const torqueConstant = convertKvToTorqueConstant(motor.motor_kv)
    commands.push(`odrv0.axis0.motor.config.torque_constant = ${torqueConstant}`)
  }
  
  // Lock-in spin current (calibration_lockin.current)
  commands.push(`odrv0.axis0.config.calibration_lockin.current = ${safeValue(motor.lock_in_spin_current, 10)}`)
  
  // Phase resistance (for gimbal motors)
  if (motor.phase_resistance !== undefined && motor.phase_resistance !== null && motor.phase_resistance > 0) {
    commands.push(`odrv0.axis0.motor.config.phase_resistance = ${motor.phase_resistance}`)
  }

  // Encoder configuration commands
  commands.push(`odrv0.axis0.encoder.config.mode = ${safeValue(encoder.encoder_type, 1)}`)
  commands.push(`odrv0.axis0.encoder.config.cpr = ${safeValue(encoder.cpr, 4000)}`)
  commands.push(`odrv0.axis0.encoder.config.bandwidth = ${safeValue(encoder.bandwidth, 1000)}`)
  commands.push(`odrv0.axis0.encoder.config.use_index = ${safeBool(encoder.use_index) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.calib_range = ${safeValue(encoder.calib_range, 0.02)}`)
  commands.push(`odrv0.axis0.encoder.config.calib_scan_distance = ${safeValue(encoder.calib_scan_distance, 16384)}`)
  commands.push(`odrv0.axis0.encoder.config.calib_scan_omega = ${safeValue(encoder.calib_scan_omega, 12.566)}`)
  commands.push(`odrv0.axis0.encoder.config.pre_calibrated = ${safeBool(encoder.pre_calibrated) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.use_index_offset = ${safeBool(encoder.use_index_offset) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.find_idx_on_lockin_only = ${safeBool(encoder.find_idx_on_lockin_only) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.direction = ${safeValue(encoder.direction, 1)}`)
  commands.push(`odrv0.axis0.encoder.config.abs_spi_cs_gpio_pin = ${safeValue(encoder.abs_spi_cs_gpio_pin, 1)}`)
  commands.push(`odrv0.axis0.encoder.config.enable_phase_interpolation = ${safeBool(encoder.enable_phase_interpolation) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.hall_polarity = ${safeValue(encoder.hall_polarity, 0)}`)
  commands.push(`odrv0.axis0.encoder.config.hall_polarity_calibrated = ${safeBool(encoder.hall_polarity_calibrated) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.use_separate_commutation_encoder = ${safeBool(encoder.use_separate_commutation_encoder) ? 'True' : 'False'}`)
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
  commands.push(`odrv0.axis0.controller.config.homing_speed = ${safeValue(control.homing_speed, 0.25)}`)

  // Interface configuration commands
  // CAN settings
  commands.push(`odrv0.axis0.config.can.node_id = ${safeValue(interfaceConfig.can_node_id, 0)}`)
  commands.push(`odrv0.axis0.config.can.is_extended = ${safeBool(interfaceConfig.can_node_id_extended) ? 'True' : 'False'}`)
  commands.push(`odrv0.can.config.baud_rate = ${safeValue(interfaceConfig.can_baudrate, 250000)}`)
  commands.push(`odrv0.axis0.config.can.heartbeat_rate_ms = ${safeValue(interfaceConfig.heartbeat_rate_ms, 100)}`)
  
  // UART settings
  commands.push(`odrv0.config.enable_uart_a = ${safeBool(interfaceConfig.enable_uart_a) ? 'True' : 'False'}`)
  commands.push(`odrv0.config.uart_a_baudrate = ${safeValue(interfaceConfig.uart_a_baudrate, 115200)}`)
  commands.push(`odrv0.config.enable_uart_b = ${safeBool(interfaceConfig.enable_uart_b) ? 'True' : 'False'}`)
  commands.push(`odrv0.config.uart_b_baudrate = ${safeValue(interfaceConfig.uart_b_baudrate, 115200)}`)
  
  // UART Protocols (if available)
  if (interfaceConfig.uart0_protocol !== undefined) {
    commands.push(`odrv0.config.uart0_protocol = ${safeValue(interfaceConfig.uart0_protocol, 3)}`)
  }
  if (interfaceConfig.uart1_protocol !== undefined) {
    commands.push(`odrv0.config.uart1_protocol = ${safeValue(interfaceConfig.uart1_protocol, 3)}`)
  }
  
  // GPIO settings
  commands.push(`odrv0.config.gpio1_mode = ${safeValue(interfaceConfig.gpio1_mode, 0)}`)
  commands.push(`odrv0.config.gpio2_mode = ${safeValue(interfaceConfig.gpio2_mode, 0)}`)
  commands.push(`odrv0.config.gpio3_mode = ${safeValue(interfaceConfig.gpio3_mode, 0)}`)
  commands.push(`odrv0.config.gpio4_mode = ${safeValue(interfaceConfig.gpio4_mode, 0)}`)
  
  // Watchdog settings
  commands.push(`odrv0.axis0.config.enable_watchdog = ${safeBool(interfaceConfig.enable_watchdog) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.config.watchdog_timeout = ${safeValue(interfaceConfig.watchdog_timeout, 0)}`)
  
  // Step/Dir settings
  commands.push(`odrv0.axis0.config.enable_step_dir = ${safeBool(interfaceConfig.enable_step_dir) ? 'True' : 'False'}`)
  if (interfaceConfig.step_dir_always_on !== undefined) {
    commands.push(`odrv0.axis0.config.step_dir_always_on = ${safeBool(interfaceConfig.step_dir_always_on) ? 'True' : 'False'}`)
  }
  
  // Sensorless mode
  commands.push(`odrv0.axis0.config.enable_sensorless_mode = ${safeBool(interfaceConfig.enable_sensorless) ? 'True' : 'False'}`)

  return commands
}

export const generateSaveAndRebootCommands = () => {
  return [
    'odrv0.save_configuration()',
    'odrv0.reboot()'
  ]
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
  commands.push(`odrv0.axis0.motor.config.current_lim = ${safeValue(motorConfig.current_lim, 10)}`)
  commands.push(`odrv0.axis0.motor.config.calibration_current = ${safeValue(motorConfig.calibration_current, 10)}`)
  commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${safeValue(motorConfig.resistance_calib_max_voltage, 12)}`)
  
  // Convert motor KV to torque constant if needed
  if (motorConfig.motor_kv !== undefined && motorConfig.motor_kv !== null) {
    const torqueConstant = 8.27 / motorConfig.motor_kv
    commands.push(`odrv0.axis0.motor.config.torque_constant = ${torqueConstant}`)
  }
  
  // Lock-in spin current (calibration_lockin.current)
  commands.push(`odrv0.axis0.config.calibration_lockin.current = ${safeValue(motorConfig.lock_in_spin_current, 10)}`)
  
  // Phase resistance and inductance (for gimbal motors)
  if (motorConfig.phase_resistance !== undefined && motorConfig.phase_resistance !== null && motorConfig.phase_resistance > 0) {
    commands.push(`odrv0.axis0.motor.config.phase_resistance = ${motorConfig.phase_resistance}`)
  }
  if (motorConfig.phase_inductance !== undefined && motorConfig.phase_inductance !== null && motorConfig.phase_inductance > 0) {
    commands.push(`odrv0.axis0.motor.config.phase_inductance = ${motorConfig.phase_inductance}`)
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
  commands.push(`odrv0.axis0.encoder.config.cpr = ${safeValue(encoderConfig.cpr, 4000)}`)
  commands.push(`odrv0.axis0.encoder.config.bandwidth = ${safeValue(encoderConfig.bandwidth, 1000)}`)
  commands.push(`odrv0.axis0.encoder.config.use_index = ${safeBool(encoderConfig.use_index) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.calib_range = ${safeValue(encoderConfig.calib_range, 0.02)}`)
  commands.push(`odrv0.axis0.encoder.config.calib_scan_distance = ${safeValue(encoderConfig.calib_scan_distance, 16384)}`)
  commands.push(`odrv0.axis0.encoder.config.calib_scan_omega = ${safeValue(encoderConfig.calib_scan_omega, 12.566)}`)
  commands.push(`odrv0.axis0.encoder.config.pre_calibrated = ${safeBool(encoderConfig.pre_calibrated) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.use_index_offset = ${safeBool(encoderConfig.use_index_offset) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.find_idx_on_lockin_only = ${safeBool(encoderConfig.find_idx_on_lockin_only) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.direction = ${safeValue(encoderConfig.direction, 1)}`)
  commands.push(`odrv0.axis0.encoder.config.abs_spi_cs_gpio_pin = ${safeValue(encoderConfig.abs_spi_cs_gpio_pin, 1)}`)
  commands.push(`odrv0.axis0.encoder.config.enable_phase_interpolation = ${safeBool(encoderConfig.enable_phase_interpolation) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.encoder.config.hall_polarity = ${safeValue(encoderConfig.hall_polarity, 0)}`)
  commands.push(`odrv0.axis0.encoder.config.hall_polarity_calibrated = ${safeBool(encoderConfig.hall_polarity_calibrated) ? 'True' : 'False'}`)

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
    `odrv0.axis0.controller.config.input_filter_bandwidth = ${safeValue(controlConfig.input_filter_bandwidth, 2)}`,
    `odrv0.axis0.controller.config.homing_speed = ${safeValue(controlConfig.homing_speed, 0.25)}`
  ]
}

/**
 * Generate interface configuration commands only
 * @param {Object} interfaceConfig - Interface configuration object
 * @returns {Array<string>} Array of interface-related ODrive commands
 */
export const generateInterfaceCommands = (interfaceConfig = {}) => {
  const commands = []
  
  // CAN settings
  commands.push(`odrv0.axis0.config.can.node_id = ${safeValue(interfaceConfig.can_node_id, 0)}`)
  commands.push(`odrv0.axis0.config.can.is_extended = ${safeBool(interfaceConfig.can_node_id_extended) ? 'True' : 'False'}`)
  commands.push(`odrv0.can.config.baud_rate = ${safeValue(interfaceConfig.can_baudrate, 250000)}`)
  commands.push(`odrv0.axis0.config.can.heartbeat_rate_ms = ${safeValue(interfaceConfig.can_heartbeat_rate_ms, 100)}`)
  
  // UART settings
  commands.push(`odrv0.config.enable_uart_a = ${safeBool(interfaceConfig.enable_uart_a) ? 'True' : 'False'}`)
  commands.push(`odrv0.config.uart_a_baudrate = ${safeValue(interfaceConfig.uart_a_baudrate, 115200)}`)
  commands.push(`odrv0.config.enable_uart_b = ${safeBool(interfaceConfig.enable_uart_b) ? 'True' : 'False'}`)
  commands.push(`odrv0.config.uart_b_baudrate = ${safeValue(interfaceConfig.uart_b_baudrate, 115200)}`)
  
  // UART Protocols (if available)
  if (interfaceConfig.uart0_protocol !== undefined) {
    commands.push(`odrv0.config.uart0_protocol = ${safeValue(interfaceConfig.uart0_protocol, 3)}`)
  }
  if (interfaceConfig.uart1_protocol !== undefined) {
    commands.push(`odrv0.config.uart1_protocol = ${safeValue(interfaceConfig.uart1_protocol, 3)}`)
  }
  
  // GPIO settings
  commands.push(`odrv0.config.gpio1_mode = ${safeValue(interfaceConfig.gpio1_mode, 0)}`)
  commands.push(`odrv0.config.gpio2_mode = ${safeValue(interfaceConfig.gpio2_mode, 0)}`)
  commands.push(`odrv0.config.gpio3_mode = ${safeValue(interfaceConfig.gpio3_mode, 0)}`)
  commands.push(`odrv0.config.gpio4_mode = ${safeValue(interfaceConfig.gpio4_mode, 0)}`)
  
  // Watchdog settings
  commands.push(`odrv0.axis0.config.enable_watchdog = ${safeBool(interfaceConfig.enable_watchdog) ? 'True' : 'False'}`)
  commands.push(`odrv0.axis0.config.watchdog_timeout = ${safeValue(interfaceConfig.watchdog_timeout, 0)}`)
  
  // Step/Dir settings
  commands.push(`odrv0.axis0.config.enable_step_dir = ${safeBool(interfaceConfig.enable_step_dir) ? 'True' : 'False'}`)
  if (interfaceConfig.step_dir_always_on !== undefined) {
    commands.push(`odrv0.axis0.config.step_dir_always_on = ${safeBool(interfaceConfig.step_dir_always_on) ? 'True' : 'False'}`)
  }
  
  // Sensorless mode
  commands.push(`odrv0.axis0.config.enable_sensorless_mode = ${safeBool(interfaceConfig.enable_sensorless) ? 'True' : 'False'}`)

  return commands
}