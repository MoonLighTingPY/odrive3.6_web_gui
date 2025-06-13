/**
 * ODrive v0.5.6 Central Registry
 * 
 * This is the single source of truth for all ODrive commands, properties, enums,
 * error codes, and configuration mappings for ODrive firmware version 0.5.6.
 * 
 * All other utilities should import from this file instead of defining their own
 * commands to avoid duplication and inconsistency.
 */

// ================================================================================================
// ENUMS - ODrive v0.5.6 Firmware Definitions
// ================================================================================================

export const ODriveEnums = {
  // Motor Types
  MotorType: {
    HIGH_CURRENT: 0,
    GIMBAL: 2,
    ACIM: 3,
  },

  // Encoder Modes
  EncoderMode: {
    INCREMENTAL: 0,
    HALL: 1,
    SINCOS: 2,
    SPI_ABS_CUI: 256,
    SPI_ABS_AMS: 257,
    SPI_ABS_AEAT: 258,
    SPI_ABS_RLS: 259,
    SPI_ABS_MA732: 260,
  },

  // Control Modes
  ControlMode: {
    VOLTAGE_CONTROL: 0,
    TORQUE_CONTROL: 1,
    VELOCITY_CONTROL: 2,
    POSITION_CONTROL: 3,
  },

  // Input Modes
  InputMode: {
    INACTIVE: 0,
    PASSTHROUGH: 1,
    VEL_RAMP: 2,
    POS_FILTER: 3,
    MIX_CHANNELS: 4,
    TRAP_TRAJ: 5,
    TORQUE_RAMP: 6,
    MIRROR: 7,
    TUNING: 8,
  },

  // Axis States
  AxisState: {
    UNDEFINED: 0,
    IDLE: 1,
    STARTUP_SEQUENCE: 2,
    FULL_CALIBRATION_SEQUENCE: 3,
    MOTOR_CALIBRATION: 4,
    SENSORLESS_CONTROL: 5,
    ENCODER_INDEX_SEARCH: 6,
    ENCODER_OFFSET_CALIBRATION: 7,
    CLOSED_LOOP_CONTROL: 8,
    LOCKIN_SPIN: 9,
    ENCODER_DIR_FIND: 10,
    HOMING: 11,
    ENCODER_HALL_POLARITY_CALIBRATION: 12,
    ENCODER_HALL_PHASE_CALIBRATION: 13,
  },

  // GPIO Modes
  GpioMode: {
    DIGITAL: 0,
    DIGITAL_PULL_UP: 1,
    DIGITAL_PULL_DOWN: 2,
    ANALOG_IN: 3,
    UART_A: 4,
    UART_B: 5,
    UART_C: 6,
    CAN_A: 7,
    I2C_A: 8,
    SPI_A: 9,
    PWM: 10,
    ENC0: 11,
    ENC1: 12,
    ENC2: 13,
    MECH_BRAKE: 14,
    STATUS: 15,
  },

  // Stream Protocol Types
  StreamProtocolType: {
    FIBRE: 0,
    ASCII: 1,
    STDOUT: 2,
    ASCII_AND_STDOUT: 3,
  },

  // CAN Protocol
  CanProtocol: {
    SIMPLE: 0x00000001,
  },
}

// ================================================================================================
// ERROR CODES - ODrive v0.5.6 Firmware Definitions
// ================================================================================================

export const ODriveErrors = {
  // ODrive System Errors
  ODriveError: {
    NONE: 0x00000000,
    CONTROL_ITERATION_MISSED: 0x00000001,
    DC_BUS_UNDER_VOLTAGE: 0x00000002,
    DC_BUS_OVER_VOLTAGE: 0x00000004,
    DC_BUS_OVER_REGEN_CURRENT: 0x00000008,
    DC_BUS_OVER_CURRENT: 0x00000010,
    BRAKE_DEADTIME_VIOLATION: 0x00000020,
    BRAKE_DUTY_CYCLE_NAN: 0x00000040,
    INVALID_BRAKE_RESISTANCE: 0x00000080,
  },

  // Axis Errors
  AxisError: {
    NONE: 0x00000000,
    INVALID_STATE: 0x00000001,
    MOTOR_FAILED: 0x00000040,
    SENSORLESS_ESTIMATOR_FAILED: 0x00000080,
    ENCODER_FAILED: 0x00000100,
    CONTROLLER_FAILED: 0x00000200,
    WATCHDOG_TIMER_EXPIRED: 0x00000800,
    MIN_ENDSTOP_PRESSED: 0x00001000,
    MAX_ENDSTOP_PRESSED: 0x00002000,
    ESTOP_REQUESTED: 0x00004000,
    HOMING_WITHOUT_ENDSTOP: 0x00020000,
    OVER_TEMP: 0x00040000,
    UNKNOWN_POSITION: 0x00080000,
  },

  // Motor Errors
  MotorError: {
    NONE: 0x00000000,
    PHASE_RESISTANCE_OUT_OF_RANGE: 0x00000001,
    PHASE_INDUCTANCE_OUT_OF_RANGE: 0x00000002,
    DRV_FAULT: 0x00000008,
    CONTROL_DEADLINE_MISSED: 0x00000010,
    MODULATION_MAGNITUDE: 0x00000080,
    BRAKE_CURRENT_OUT_OF_RANGE: 0x00000100,
    MODULATION_IS_NAN: 0x00000200,
    MOTOR_THERMISTOR_OVER_TEMP: 0x00000400,
    FET_THERMISTOR_OVER_TEMP: 0x00000800,
    TIMER_UPDATE_MISSED: 0x00001000,
    CURRENT_SENSE_SATURATION: 0x00002000,
    INVERTER_OVER_TEMP: 0x00004000,
    CURRENT_UNSTABLE: 0x00008000,
    UNBALANCED_PHASES: 0x00010000,
    UNKNOWN_CURRENT_COMMAND: 0x00020000,
    UNKNOWN_VOLTAGE_COMMAND: 0x00040000,
    UNKNOWN_GAINS: 0x00080000,
    CONTROLLER_INITIALIZING: 0x00100000,
    UNBALANCED_FORCES: 0x00200000,
  },

  // Encoder Errors
  EncoderError: {
    NONE: 0x00000000,
    UNSTABLE_GAIN: 0x00000001,
    CPR_POLEPAIRS_MISMATCH: 0x00000002,
    NO_RESPONSE: 0x00000004,
    UNSUPPORTED_ENCODER_MODE: 0x00000008,
    ILLEGAL_HALL_STATE: 0x00000010,
    INDEX_NOT_FOUND_YET: 0x00000020,
    ABS_SPI_TIMEOUT: 0x00000040,
    ABS_SPI_COM_FAIL: 0x00000080,
    ABS_SPI_NOT_READY: 0x00000100,
    HALL_NOT_CALIBRATED_YET: 0x00000200,
  },

  // Controller Errors
  ControllerError: {
    NONE: 0x00000000,
    OVERSPEED: 0x00000001,
    INVALID_INPUT_MODE: 0x00000002,
    UNSTABLE_GAIN: 0x00000004,
    INVALID_MIRROR_AXIS: 0x00000008,
    INVALID_LOAD_ENCODER: 0x00000010,
    INVALID_ESTIMATE: 0x00000020,
    INVALID_CIRCULAR_RANGE: 0x00000040,
    SPINOUT_DETECTED: 0x00000080,
  },

  // CAN Errors
  CanError: {
    NONE: 0x00000000,
    DUPLICATE_CAN_IDS: 0x00000001,
  },
}

// ================================================================================================
// COMMAND DEFINITIONS - Organized by Category
// ================================================================================================

export const ODriveCommands = {
  // System commands
  system: [
    { name: "Get Firmware Version", command: "odrv0.fw_version_major", description: "Get major firmware version number" },
    { name: "Get Hardware Version", command: "odrv0.hw_version_major", description: "Get hardware version major number" },
    { name: "Get Serial Number", command: "odrv0.serial_number", description: "Get device serial number" },
    { name: "Reboot Device", command: "odrv0.reboot()", description: "Reboot the ODrive device" },
    { name: "Save Configuration", command: "odrv0.save_configuration()", description: "Save current configuration to non-volatile memory" },
    { name: "Erase Configuration", command: "odrv0.erase_configuration()", description: "Erase configuration and restore factory defaults" },
    { name: "Clear Errors", command: "odrv0.clear_errors()", description: "Clear all error flags on the device" },
  ],
  
  // Power system commands
  power: [
    { name: "Get Bus Voltage", command: "odrv0.vbus_voltage", description: "Read DC bus voltage in volts" },
    { name: "Get Bus Current", command: "odrv0.ibus", description: "Read DC bus current in amperes" },
    { name: "Set Overvoltage Trip", command: "odrv0.config.dc_bus_overvoltage_trip_level = 56", description: "Set DC bus overvoltage protection level" },
    { name: "Set Undervoltage Trip", command: "odrv0.config.dc_bus_undervoltage_trip_level = 10", description: "Set DC bus undervoltage protection level" },
    { name: "Set Max Positive Current", command: "odrv0.config.dc_max_positive_current = 10", description: "Set maximum positive DC bus current" },
    { name: "Set Max Negative Current", command: "odrv0.config.dc_max_negative_current = -10", description: "Set maximum negative DC bus current (regenerative)" },
    { name: "Enable Brake Resistor", command: "odrv0.config.enable_brake_resistor = True", description: "Enable brake resistor for regenerative braking" },
    { name: "Set Brake Resistance", command: "odrv0.config.brake_resistance = 2", description: "Set brake resistor resistance value in ohms" },
  ],

  // Axis control commands
  axis_control: [
    { name: "Set Axis State - Idle", command: "odrv0.axis0.requested_state = 1", description: "Set axis to idle state" },
    { name: "Set Axis State - Full Calibration", command: "odrv0.axis0.requested_state = 3", description: "Start full calibration sequence" },
    { name: "Set Axis State - Motor Calibration", command: "odrv0.axis0.requested_state = 4", description: "Start motor calibration only" },
    { name: "Set Axis State - Sensorless Control", command: "odrv0.axis0.requested_state = 5", description: "Enter sensorless control mode" },
    { name: "Set Axis State - Encoder Index Search", command: "odrv0.axis0.requested_state = 6", description: "Search for encoder index pulse" },
    { name: "Set Axis State - Encoder Offset Calibration", command: "odrv0.axis0.requested_state = 7", description: "Calibrate encoder offset" },
    { name: "Set Axis State - Closed Loop Control", command: "odrv0.axis0.requested_state = 8", description: "Enter closed loop control mode" },
    { name: "Set Axis State - Encoder Dir Find", command: "odrv0.axis0.requested_state = 10", description: "Start encoder direction finding" },
    { name: "Get Current Axis State", command: "odrv0.axis0.current_state", description: "Read current axis state" },
    { name: "Check Axis Error", command: "odrv0.axis0.error", description: "Read axis error flags" },
    { name: "Clear Axis Errors", command: "odrv0.clear_errors()", description: "Clear all axis error flags" },
  ],

  // Motor configuration commands
  motor_config: [
    { name: "Set Motor Type - High Current", command: "odrv0.axis0.motor.config.motor_type = 0", description: "Set motor type to high current motor" },
    { name: "Set Motor Type - Gimbal", command: "odrv0.axis0.motor.config.motor_type = 2", description: "Set motor type to gimbal motor" },
    { name: "Set Motor Type - ACIM", command: "odrv0.axis0.motor.config.motor_type = 3", description: "Set motor type to ACIM motor" },
    { name: "Set Pole Pairs", command: "odrv0.axis0.motor.config.pole_pairs = 7", description: "Set number of motor pole pairs" },
    { name: "Set Current Limit", command: "odrv0.axis0.motor.config.current_lim = 10", description: "Set motor current limit in amperes" },
    { name: "Set Calibration Current", command: "odrv0.axis0.motor.config.calibration_current = 10", description: "Set current used for motor calibration" },
    { name: "Set Resistance Calib Voltage", command: "odrv0.axis0.motor.config.resistance_calib_max_voltage = 4", description: "Set maximum voltage for resistance calibration" },
    { name: "Set Torque Constant", command: "odrv0.axis0.motor.config.torque_constant = 0.04", description: "Set motor torque constant (Nm/A)" },
    { name: "Get Phase Resistance", command: "odrv0.axis0.motor.config.phase_resistance", description: "Read measured motor phase resistance" },
    { name: "Get Phase Inductance", command: "odrv0.axis0.motor.config.phase_inductance", description: "Read measured motor phase inductance" },
    { name: "Set Phase Resistance", command: "odrv0.axis0.motor.config.phase_resistance = 0.1", description: "Set motor phase resistance manually (gimbal only)" },
    { name: "Set Phase Inductance", command: "odrv0.axis0.motor.config.phase_inductance = 0.0001", description: "Set motor phase inductance manually (gimbal only)" },
  ],

  // Motor status commands
  motor_status: [
    { name: "Get Motor Error", command: "odrv0.axis0.motor.error", description: "Read motor error flags" },
    { name: "Get Motor Current (Iq)", command: "odrv0.axis0.motor.current_control.Iq_measured", description: "Read motor quadrature current" },
    { name: "Get Motor Current (Id)", command: "odrv0.axis0.motor.current_control.Id_measured", description: "Read motor direct current" },
    { name: "Get Motor Voltage (Vq)", command: "odrv0.axis0.motor.current_control.Vq_setpoint", description: "Read motor quadrature voltage setpoint" },
    { name: "Get Motor Voltage (Vd)", command: "odrv0.axis0.motor.current_control.Vd_setpoint", description: "Read motor direct voltage setpoint" },
    { name: "Get Motor Temperature", command: "odrv0.axis0.motor.motor_thermistor.temperature", description: "Read motor temperature from thermistor" },
    { name: "Get FET Temperature", command: "odrv0.axis0.motor.fet_thermistor.temperature", description: "Read FET temperature from thermistor" },
    { name: "Check Motor Calibrated", command: "odrv0.axis0.motor.is_calibrated", description: "Check if motor is calibrated" },
  ],

  // Encoder configuration commands
  encoder_config: [
    { name: "Set Encoder Mode - Incremental", command: "odrv0.axis0.encoder.config.mode = 0", description: "Set encoder to incremental mode" },
    { name: "Set Encoder Mode - Hall", command: "odrv0.axis0.encoder.config.mode = 1", description: "Set encoder to Hall effect mode" },
    { name: "Set Encoder Mode - SinCos", command: "odrv0.axis0.encoder.config.mode = 2", description: "Set encoder to SinCos mode" },
    { name: "Set Encoder Mode - SPI ABS CUI", command: "odrv0.axis0.encoder.config.mode = 256", description: "Set encoder to SPI Absolute CUI mode" },
    { name: "Set Encoder Mode - SPI ABS AMS", command: "odrv0.axis0.encoder.config.mode = 257", description: "Set encoder to SPI Absolute AMS mode" },
    { name: "Set Encoder CPR", command: "odrv0.axis0.encoder.config.cpr = 4000", description: "Set encoder counts per revolution" },
    { name: "Set Encoder Bandwidth", command: "odrv0.axis0.encoder.config.bandwidth = 1000", description: "Set encoder filter bandwidth in Hz" },
    { name: "Enable Index Search", command: "odrv0.axis0.encoder.config.use_index = True", description: "Enable encoder index pulse usage" },
    { name: "Set Calib Range", command: "odrv0.axis0.encoder.config.calib_range = 0.02", description: "Set encoder calibration range" },
    { name: "Set Calib Scan Distance", command: "odrv0.axis0.encoder.config.calib_scan_distance = 16384", description: "Set encoder calibration scan distance" },
    { name: "Set Calib Scan Omega", command: "odrv0.axis0.encoder.config.calib_scan_omega = 4", description: "Set encoder calibration scan frequency" },
    { name: "Set Pre-calibrated", command: "odrv0.axis0.encoder.config.pre_calibrated = True", description: "Mark encoder as pre-calibrated" },
    { name: "Set Direction", command: "odrv0.axis0.encoder.config.direction = 1", description: "Set encoder counting direction (1 or -1)" },
  ],

  // Encoder status commands
  encoder_status: [
    { name: "Get Encoder Error", command: "odrv0.axis0.encoder.error", description: "Read encoder error flags" },
    { name: "Get Encoder Position", command: "odrv0.axis0.encoder.pos_estimate", description: "Read encoder position estimate in turns" },
    { name: "Get Encoder Velocity", command: "odrv0.axis0.encoder.vel_estimate", description: "Read encoder velocity estimate in turns/s" },
    { name: "Get Encoder Count", command: "odrv0.axis0.encoder.count_in_cpr", description: "Read raw encoder count within CPR" },
    { name: "Get Encoder Shadow Count", command: "odrv0.axis0.encoder.shadow_count", description: "Read encoder shadow count" },
    { name: "Get Encoder Phase", command: "odrv0.axis0.encoder.phase", description: "Read encoder electrical phase" },
    { name: "Check Index Found", command: "odrv0.axis0.encoder.index_found", description: "Check if encoder index was found" },
    { name: "Check Encoder Ready", command: "odrv0.axis0.encoder.is_ready", description: "Check if encoder is calibrated and ready" },
  ],

  // Controller configuration commands
  controller_config: [
    { name: "Set Control Mode - Voltage", command: "odrv0.axis0.controller.config.control_mode = 0", description: "Set controller to voltage control mode" },
    { name: "Set Control Mode - Torque", command: "odrv0.axis0.controller.config.control_mode = 1", description: "Set controller to torque control mode" },
    { name: "Set Control Mode - Velocity", command: "odrv0.axis0.controller.config.control_mode = 2", description: "Set controller to velocity control mode" },
    { name: "Set Control Mode - Position", command: "odrv0.axis0.controller.config.control_mode = 3", description: "Set controller to position control mode" },
    { name: "Set Input Mode - Inactive", command: "odrv0.axis0.controller.config.input_mode = 0", description: "Set input mode to inactive" },
    { name: "Set Input Mode - Passthrough", command: "odrv0.axis0.controller.config.input_mode = 1", description: "Set input mode to passthrough" },
    { name: "Set Input Mode - Velocity Ramp", command: "odrv0.axis0.controller.config.input_mode = 2", description: "Set input mode to velocity ramp" },
    { name: "Set Input Mode - Pos Filter", command: "odrv0.axis0.controller.config.input_mode = 3", description: "Set input mode to position filter" },
    { name: "Set Input Mode - Trap Traj", command: "odrv0.axis0.controller.config.input_mode = 5", description: "Set input mode to trapezoidal trajectory" },
    { name: "Set Velocity Limit", command: "odrv0.axis0.controller.config.vel_limit = 20", description: "Set velocity limit in turns/s" },
    { name: "Set Position Gain", command: "odrv0.axis0.controller.config.pos_gain = 1", description: "Set position controller gain" },
    { name: "Set Velocity Gain", command: "odrv0.axis0.controller.config.vel_gain = 0.228", description: "Set velocity controller gain" },
    { name: "Set Velocity Integrator Gain", command: "odrv0.axis0.controller.config.vel_integrator_gain = 0.228", description: "Set velocity integrator gain" },
    { name: "Set Velocity Ramp Rate", command: "odrv0.axis0.controller.config.vel_ramp_rate = 0.5", description: "Set velocity ramp rate in turns/s²" },
    { name: "Set Torque Ramp Rate", command: "odrv0.axis0.controller.config.torque_ramp_rate = 0.01", description: "Set torque ramp rate in Nm/s" },
  ],

  // Controller input/output commands
  controller_input: [
    { name: "Set Position Setpoint", command: "odrv0.axis0.controller.input_pos = 0", description: "Set position setpoint in turns" },
    { name: "Set Velocity Setpoint", command: "odrv0.axis0.controller.input_vel = 0", description: "Set velocity setpoint in turns/s" },
    { name: "Set Torque Setpoint", command: "odrv0.axis0.controller.input_torque = 0", description: "Set torque setpoint in Nm" },
    { name: "Get Position Setpoint", command: "odrv0.axis0.controller.pos_setpoint", description: "Read current position setpoint" },
    { name: "Get Velocity Setpoint", command: "odrv0.axis0.controller.vel_setpoint", description: "Read current velocity setpoint" },
    { name: "Get Torque Setpoint", command: "odrv0.axis0.controller.torque_setpoint", description: "Read current torque setpoint" },
  ],

  // Controller status commands
  controller_status: [
    { name: "Get Controller Error", command: "odrv0.axis0.controller.error", description: "Read controller error flags" },
    { name: "Get Position Estimate", command: "odrv0.axis0.controller.pos_estimate", description: "Read position estimate from controller" },
    { name: "Get Velocity Estimate", command: "odrv0.axis0.controller.vel_estimate", description: "Read velocity estimate from controller" },
    { name: "Get Trajectory Done", command: "odrv0.axis0.controller.trajectory_done", description: "Check if trajectory is complete" },
  ],

  // GPIO and interface commands
  gpio_interface: [
    { name: "Set GPIO1 Mode", command: "odrv0.config.gpio1_mode = 0", description: "Set GPIO1 pin mode" },
    { name: "Set GPIO2 Mode", command: "odrv0.config.gpio2_mode = 0", description: "Set GPIO2 pin mode" },
    { name: "Set GPIO3 Mode", command: "odrv0.config.gpio3_mode = 0", description: "Set GPIO3 pin mode" },
    { name: "Set GPIO4 Mode", command: "odrv0.config.gpio4_mode = 0", description: "Set GPIO4 pin mode" },
    { name: "Get GPIO1 State", command: "odrv0.get_gpio_states()[0]", description: "Read GPIO1 pin state" },
    { name: "Get GPIO2 State", command: "odrv0.get_gpio_states()[1]", description: "Read GPIO2 pin state" },
    { name: "Enable UART A", command: "odrv0.config.enable_uart_a = True", description: "Enable UART A interface" },
    { name: "Set UART A Baudrate", command: "odrv0.config.uart_a_baudrate = 115200", description: "Set UART A baudrate" },
    { name: "Enable CAN A", command: "odrv0.config.enable_can_a = True", description: "Enable CAN A interface" },
    { name: "Set CAN Baudrate", command: "odrv0.can.config.baud_rate = 250000", description: "Set CAN bus baudrate" },
  ],

  // CAN specific commands
  can_config: [
    { name: "Set CAN Node ID", command: "odrv0.axis0.config.can.node_id = 0", description: "Set CAN bus node ID" },
    { name: "Set CAN Heartbeat Rate", command: "odrv0.axis0.config.can.heartbeat_rate_ms = 100", description: "Set CAN heartbeat rate in ms" },
    { name: "Set CAN Protocol", command: "odrv0.can.config.protocol = 1", description: "Set CAN protocol type" },
    { name: "Enable CAN Node ID Extended", command: "odrv0.axis0.config.can.is_extended = True", description: "Enable extended CAN node ID" },
  ],

  // Calibration specific commands
  calibration: [
    { name: "Start Motor Calibration", command: "odrv0.axis0.requested_state = 4", description: "Start motor resistance and inductance calibration" },
    { name: "Start Encoder Dir Find", command: "odrv0.axis0.requested_state = 10", description: "Start encoder direction finding (polarity)" },
    { name: "Start Encoder Offset Calib", command: "odrv0.axis0.requested_state = 7", description: "Start encoder offset calibration" },
    { name: "Start Index Search", command: "odrv0.axis0.requested_state = 6", description: "Search for encoder index pulse" },
    { name: "Start Full Calibration", command: "odrv0.axis0.requested_state = 3", description: "Start full calibration sequence" },
    { name: "Set Lockin Spin Current", command: "odrv0.axis0.config.calibration_lockin.current = 10", description: "Set calibration lockin spin current" },
    { name: "Set Lockin Spin Ramp Time", command: "odrv0.axis0.config.calibration_lockin.ramp_time = 0.4", description: "Set calibration lockin ramp time" },
    { name: "Set Lockin Spin Ramp Distance", command: "odrv0.axis0.config.calibration_lockin.ramp_distance = 3.14159", description: "Set calibration lockin ramp distance" },
    { name: "Set Lockin Spin Accel", command: "odrv0.axis0.config.calibration_lockin.accel = 20", description: "Set calibration lockin acceleration" },
    { name: "Set Lockin Spin Vel", command: "odrv0.axis0.config.calibration_lockin.vel = 40", description: "Set calibration lockin velocity" },
  ],

  // Watchdog commands
  watchdog: [
    { name: "Set Watchdog Timeout", command: "odrv0.axis0.config.watchdog_timeout = 0", description: "Set watchdog timeout in seconds (0 = disabled)" },
    { name: "Feed Watchdog", command: "odrv0.axis0.watchdog_feed()", description: "Reset watchdog timer" },
    { name: "Enable Watchdog", command: "odrv0.axis0.config.enable_watchdog = True", description: "Enable watchdog protection" },
  ],

  // Step/Direction commands
  step_dir: [
    { name: "Enable Step/Dir", command: "odrv0.axis0.config.enable_step_dir = True", description: "Enable step/direction interface" },
    { name: "Set Step GPIO Pin", command: "odrv0.axis0.config.step_gpio_pin = 1", description: "Set step signal GPIO pin" },
    { name: "Set Dir GPIO Pin", command: "odrv0.axis0.config.dir_gpio_pin = 2", description: "Set direction signal GPIO pin" },
    { name: "Set Step Dir Always On", command: "odrv0.axis0.config.step_dir_always_on = True", description: "Keep step/dir interface always active" },
  ],
}

// ================================================================================================
// CONFIGURATION PROPERTY MAPPINGS
// ================================================================================================

export const ODrivePropertyMappings = {
  power: {
    name: 'Power Configuration',
    dc_bus_overvoltage_trip_level: 'config.dc_bus_overvoltage_trip_level',
    dc_bus_undervoltage_trip_level: 'config.dc_bus_undervoltage_trip_level',
    dc_max_positive_current: 'config.dc_max_positive_current',
    dc_max_negative_current: 'config.dc_max_negative_current',
    brake_resistance: 'config.brake_resistance',
    brake_resistor_enabled: 'config.enable_brake_resistor',
    // Fix FET thermistor mappings to match actual ODrive v0.5.6 API
    fet_temp_limit_lower: 'axis0.motor.fet_thermistor.config.temp_limit_lower',
    fet_temp_limit_upper: 'axis0.motor.fet_thermistor.config.temp_limit_upper',
  },

  motor: {
    name: 'Motor Configuration',
    motor_type: 'axis0.motor.config.motor_type',
    pole_pairs: 'axis0.motor.config.pole_pairs',
    motor_kv: 'axis0.motor.config.torque_constant', // Will convert from Kt to Kv
    current_lim: 'axis0.motor.config.current_lim',
    calibration_current: 'axis0.motor.config.calibration_current',
    resistance_calib_max_voltage: 'axis0.motor.config.resistance_calib_max_voltage',
    lock_in_spin_current: 'axis0.config.calibration_lockin.current',
    phase_resistance: 'axis0.motor.config.phase_resistance',
    phase_inductance: 'axis0.motor.config.phase_inductance',
    torque_constant: 'axis0.motor.config.torque_constant',
    pre_calibrated: 'axis0.motor.config.pre_calibrated',
    // Fix the motor thermistor mappings - these were incorrect
    motor_thermistor_enabled: 'axis0.motor.motor_thermistor.config.enabled',
    motor_thermistor_gpio_pin: 'axis0.motor.motor_thermistor.config.gpio_pin',
    motor_temp_limit_lower: 'axis0.motor.motor_thermistor.config.temp_limit_lower',
    motor_temp_limit_upper: 'axis0.motor.motor_thermistor.config.temp_limit_upper',
    // Add polynomial coefficients for thermistor calculations
    motor_thermistor_poly_coeff_0: 'axis0.motor.motor_thermistor.config.poly_coefficient_0',
    motor_thermistor_poly_coeff_1: 'axis0.motor.motor_thermistor.config.poly_coefficient_1',
    motor_thermistor_poly_coeff_2: 'axis0.motor.motor_thermistor.config.poly_coefficient_2',
    motor_thermistor_poly_coeff_3: 'axis0.motor.motor_thermistor.config.poly_coefficient_3',
  },

  encoder: {
    name: 'Encoder Configuration',
    encoder_type: 'axis0.encoder.config.mode',
    cpr: 'axis0.encoder.config.cpr',
    bandwidth: 'axis0.encoder.config.bandwidth',
    use_index: 'axis0.encoder.config.use_index',
    calib_range: 'axis0.encoder.config.calib_range',
    calib_scan_distance: 'axis0.encoder.config.calib_scan_distance',
    calib_scan_omega: 'axis0.encoder.config.calib_scan_omega',
    pre_calibrated: 'axis0.encoder.config.pre_calibrated',
    use_index_offset: 'axis0.encoder.config.use_index_offset',
    find_idx_on_lockin_only: 'axis0.encoder.config.find_idx_on_lockin_only',
    abs_spi_cs_gpio_pin: 'axis0.encoder.config.abs_spi_cs_gpio_pin',
    direction: 'axis0.encoder.config.direction',
    enable_phase_interpolation: 'axis0.encoder.config.enable_phase_interpolation',
    hall_polarity: 'axis0.encoder.config.hall_polarity',
    hall_polarity_calibrated: 'axis0.encoder.config.hall_polarity_calibrated',
  },

  control: {
    name: 'Control Configuration',
    control_mode: 'axis0.controller.config.control_mode',
    input_mode: 'axis0.controller.config.input_mode',
    vel_limit: 'axis0.controller.config.vel_limit',
    pos_gain: 'axis0.controller.config.pos_gain',
    vel_gain: 'axis0.controller.config.vel_gain',
    vel_integrator_gain: 'axis0.controller.config.vel_integrator_gain',
    vel_limit_tolerance: 'axis0.controller.config.vel_limit_tolerance',
    vel_ramp_rate: 'axis0.controller.config.vel_ramp_rate',
    torque_ramp_rate: 'axis0.controller.config.torque_ramp_rate',
    circular_setpoints: 'axis0.controller.config.circular_setpoints',
    inertia: 'axis0.controller.config.inertia',
    input_filter_bandwidth: 'axis0.controller.config.input_filter_bandwidth',
    homing_speed: 'axis0.controller.config.homing_speed',
    anticogging_enabled: 'axis0.controller.config.anticogging.anticogging_enabled',
  },

  interface: {
    name: 'Interface Configuration',
    can_node_id: 'axis0.config.can.node_id',
    can_node_id_extended: 'axis0.config.can.is_extended',
    can_baudrate: 'can.config.baud_rate',
    heartbeat_rate_ms: 'axis0.config.can.heartbeat_rate_ms',
    enable_uart_a: 'config.enable_uart_a',
    uart_a_baudrate: 'config.uart_a_baudrate',
    uart0_protocol: 'config.uart0_protocol',
    enable_uart_b: 'config.enable_uart_b',
    uart_b_baudrate: 'config.uart_b_baudrate',
    uart1_protocol: 'config.uart1_protocol',
    gpio1_mode: 'config.gpio1_mode',
    gpio2_mode: 'config.gpio2_mode',
    gpio3_mode: 'config.gpio3_mode',
    gpio4_mode: 'config.gpio4_mode',
    enable_watchdog: 'axis0.config.enable_watchdog',
    watchdog_timeout: 'axis0.config.watchdog_timeout',
    enable_step_dir: 'axis0.config.enable_step_dir',
    step_dir_always_on: 'axis0.config.step_dir_always_on',
    step_gpio_pin: 'axis0.config.step_gpio_pin',
    dir_gpio_pin: 'axis0.config.dir_gpio_pin',
    enable_sensorless: 'axis0.config.enable_sensorless_mode',
  },
}

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

// Helper functions for enum lookups
export const getEnumName = (enumObj, value) => {
  const entry = Object.entries(enumObj).find(([, val]) => val === value)
  return entry ? entry[0] : 'Unknown'
}

export const getEnumValue = (enumObj, name) => {
  return enumObj[name] !== undefined ? enumObj[name] : null
}

// Enum helper functions - detailed implementations below replace these simple ones

// Error decoding helpers
export const decodeODriveError = (errorCode) => {
  const errors = []
  Object.entries(ODriveErrors.ODriveError).forEach(([name, value]) => {
    if (value !== 0 && (errorCode & value) === value) {
      errors.push(name)
    }
  })
  return errors
}

export const decodeAxisError = (errorCode) => {
  const errors = []
  Object.entries(ODriveErrors.AxisError).forEach(([name, value]) => {
    if (value !== 0 && (errorCode & value) === value) {
      errors.push(name)
    }
  })
  return errors
}

export const decodeMotorError = (errorCode) => {
  const errors = []
  Object.entries(ODriveErrors.MotorError).forEach(([name, value]) => {
    if (value !== 0 && (errorCode & value) === value) {
      errors.push(name)
    }
  })
  return errors
}

export const decodeEncoderError = (errorCode) => {
  const errors = []
  Object.entries(ODriveErrors.EncoderError).forEach(([name, value]) => {
    if (value !== 0 && (errorCode & value) === value) {
      errors.push(name)
    }
  })
  return errors
}

export const decodeControllerError = (errorCode) => {
  const errors = []
  Object.entries(ODriveErrors.ControllerError).forEach(([name, value]) => {
    if (value !== 0 && (errorCode & value) === value) {
      errors.push(name)
    }
  })
  return errors
}

/**
 * Get error description for display
 * @param {number} errorCode - Error code value
 * @param {string} errorType - Type of error (axis, motor, encoder, controller, etc.)
 * @returns {string} Human-readable error description
 */
export const getErrorDescription = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) return 'No error'
  
  // Get the appropriate error object based on type
  let errorObj
  switch (errorType.toLowerCase()) {
    case 'axis':
      errorObj = ODriveErrors.AxisError
      break
    case 'motor':
      errorObj = ODriveErrors.MotorError
      break
    case 'encoder':
      errorObj = ODriveErrors.EncoderError
      break
    case 'controller':
      errorObj = ODriveErrors.ControllerError
      break
    case 'sensorless':
      errorObj = ODriveErrors.SensorlessEstimatorError
      break
    case 'can':
      errorObj = ODriveErrors.CanError
      break
    default:
      errorObj = ODriveErrors.AxisError
  }
  
  // Find matching error flag
  for (const [key, value] of Object.entries(errorObj)) {
    if (value === errorCode) {
      // Convert enum name to readable description
      return key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }
  }
  
  return `Unknown error: 0x${errorCode.toString(16).toUpperCase()}`
}

/**
 * Check if error is critical (requires immediate attention)
 * @param {number} errorCode - Error code value
 * @param {string} errorType - Type of error
 * @returns {boolean} True if error is critical
 */
export const isErrorCritical = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) return false
  
  const criticalErrors = {
    axis: [
      ODriveErrors.AxisError.MOTOR_FAILED,
      ODriveErrors.AxisError.ENCODER_FAILED,
      ODriveErrors.AxisError.CONTROLLER_FAILED,
      ODriveErrors.AxisError.ESTOP_REQUESTED,
      ODriveErrors.AxisError.OVER_TEMP
    ],
    motor: [
      ODriveErrors.MotorError.DRV_FAULT,
      ODriveErrors.MotorError.MOTOR_THERMISTOR_OVER_TEMP,
      ODriveErrors.MotorError.FET_THERMISTOR_OVER_TEMP,
      ODriveErrors.MotorError.BRAKE_RESISTOR_DISARMED
    ],
    encoder: [
      ODriveErrors.EncoderError.NO_RESPONSE,
      ODriveErrors.EncoderError.ABS_SPI_COM_FAIL
    ],
    controller: [
      ODriveErrors.ControllerError.OVERSPEED,
      ODriveErrors.ControllerError.SPINOUT_DETECTED
    ]
  }
  
  const criticalList = criticalErrors[errorType.toLowerCase()] || []
  return criticalList.some(criticalError => (errorCode & criticalError) === criticalError)
}

/**
 * Get color scheme for error display
 * @param {number} errorCode - Error code value
 * @param {string} errorType - Type of error
 * @returns {string} Chakra UI color scheme
 */
export const getErrorColor = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) return 'green'
  
  if (isErrorCritical(errorCode, errorType)) {
    return 'red'
  }
  
  // Non-critical errors get different colors based on type
  const colorMap = {
    axis: 'red',
    motor: 'orange',
    encoder: 'yellow',
    controller: 'purple',
    sensorless: 'blue',
    can: 'cyan'
  }
  
  return colorMap[errorType.toLowerCase()] || 'red'
}

/**
 * Get troubleshooting guide for an error
 * @param {number} errorCode - Error code value
 * @param {string} errorType - Type of error
 * @returns {Object} Troubleshooting guide object
 */
export const getErrorTroubleshootingGuide = (errorCode, errorType = 'encoder') => {
  if (!errorCode || errorCode === 0) return null
  
  // Encoder error guides
  if (errorType === 'encoder') {
    if ((errorCode & ODriveErrors.EncoderError.CPR_POLEPAIRS_MISMATCH) === ODriveErrors.EncoderError.CPR_POLEPAIRS_MISMATCH) {
      return {
        title: 'Encoder CPR/Pole Pairs Mismatch',
        description: 'The encoder counts per revolution (CPR) must be evenly divisible by the motor pole pairs.',
        causes: [
          'Incorrect CPR setting for your encoder',
          'Wrong pole pairs setting for your motor',
          'Using Hall encoder mode with incremental encoder settings'
        ],
        solutions: [
          'Set encoder CPR to a multiple of motor pole pairs',
          'For Hall encoders, ensure encoder mode is set to Hall (1) not Incremental (0)',
          'Check encoder and motor specifications',
          'Use encoder.config.cpr = pole_pairs × N where N is a whole number'
        ],
        commands: [
          'odrv0.axis0.motor.config.pole_pairs',
          'odrv0.axis0.encoder.config.cpr',
          'odrv0.axis0.encoder.config.mode'
        ]
      }
    }
    
    if ((errorCode & ODriveErrors.EncoderError.NO_RESPONSE) === ODriveErrors.EncoderError.NO_RESPONSE) {
      return {
        title: 'Encoder No Response',
        description: 'The encoder is not responding to communication attempts.',
        causes: [
          'Encoder not connected properly',
          'Wrong encoder type selected',
          'Encoder power supply issues',
          'Damaged encoder or wiring'
        ],
        solutions: [
          'Check all encoder connections',
          'Verify encoder type setting matches physical encoder',
          'Check encoder power supply voltage',
          'Test encoder with multimeter',
          'Replace encoder if damaged'
        ],
        commands: [
          'odrv0.axis0.encoder.config.mode',
          'odrv0.axis0.encoder.shadow_count',
          'odrv0.axis0.encoder.count_in_cpr'
        ]
      }
    }
  }
  
  // Motor error guides
  if (errorType === 'motor') {
    if ((errorCode & ODriveErrors.MotorError.PHASE_RESISTANCE_OUT_OF_RANGE) === ODriveErrors.MotorError.PHASE_RESISTANCE_OUT_OF_RANGE) {
      return {
        title: 'Motor Phase Resistance Out of Range',
        description: 'Measured motor resistance is outside expected range.',
        causes: [
          'Motor not connected properly',
          'Motor winding damage',
          'Incorrect motor type setting',
          'Poor motor connections'
        ],
        solutions: [
          'Check all motor phase connections',
          'Verify motor is correct type (high current vs gimbal)',
          'Test motor resistance with multimeter',
          'Clean motor connection terminals',
          'Replace motor if damaged'
        ],
        commands: [
          'odrv0.axis0.motor.config.motor_type',
          'odrv0.axis0.motor.config.phase_resistance',
          'odrv0.axis0.motor.config.phase_inductance'
        ]
      }
    }
  }
  
  // Generic error guide
  return {
    title: 'ODrive Error',
    description: getErrorDescription(errorCode, errorType),
    causes: [
      'Check ODrive documentation for specific error details',
      'Verify all connections and settings',
      'Check for hardware issues'
    ],
    solutions: [
      'Clear errors and retry operation',
      'Check ODrive configuration',
      'Consult ODrive documentation',
      'Contact support if issue persists'
    ],
    commands: [
      'odrv0.clear_errors()',
      'dump_errors(odrv0)'
    ]
  }
}

// Enum helper functions
/**
 * Get human-readable name for motor type value
 * @param {number} value - Motor type enum value
 * @returns {string} Human-readable motor type name
 */
export const getMotorTypeName = (value) => {
  const motorTypeNames = {
    [ODriveEnums.MotorType.HIGH_CURRENT]: 'High Current',
    [ODriveEnums.MotorType.GIMBAL]: 'Gimbal'
  }
  return motorTypeNames[value] || 'Unknown'
}

/**
 * Get motor type value from name
 * @param {string} name - Motor type name
 * @returns {number} Motor type enum value
 */
export const getMotorTypeValue = (name) => {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '')
  const nameMapping = {
    'highcurrent': ODriveEnums.MotorType.HIGH_CURRENT,
    'gimbal': ODriveEnums.MotorType.GIMBAL
  }
  return nameMapping[normalizedName] || ODriveEnums.MotorType.HIGH_CURRENT
}

/**
 * Get human-readable name for encoder mode value
 * @param {number} value - Encoder mode enum value
 * @returns {string} Human-readable encoder mode name
 */
export const getEncoderModeName = (value) => {
  const encoderModeNames = {
    [ODriveEnums.EncoderMode.INCREMENTAL]: 'Incremental',
    [ODriveEnums.EncoderMode.HALL]: 'Hall Effect',
    [ODriveEnums.EncoderMode.SINCOS]: 'SinCos',
    [ODriveEnums.EncoderMode.SPI_ABS_CUI]: 'SPI Absolute CUI',
    [ODriveEnums.EncoderMode.SPI_ABS_AMS]: 'SPI Absolute AMS',
    [ODriveEnums.EncoderMode.SPI_ABS_AEAT]: 'SPI Absolute AEAT'
  }
  return encoderModeNames[value] || 'Unknown'
}

/**
 * Get encoder mode value from name
 * @param {string} name - Encoder mode name
 * @returns {number} Encoder mode enum value
 */
export const getEncoderModeValue = (name) => {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '')
  const nameMapping = {
    'incremental': ODriveEnums.EncoderMode.INCREMENTAL,
    'hall': ODriveEnums.EncoderMode.HALL,
    'halleffect': ODriveEnums.EncoderMode.HALL,
    'sincos': ODriveEnums.EncoderMode.SINCOS,
    'spiabscui': ODriveEnums.EncoderMode.SPI_ABS_CUI,
    'spiabsolutecui': ODriveEnums.EncoderMode.SPI_ABS_CUI,
    'spiabsams': ODriveEnums.EncoderMode.SPI_ABS_AMS,
    'spiabsoluteams': ODriveEnums.EncoderMode.SPI_ABS_AMS,
    'spiabsaeat': ODriveEnums.EncoderMode.SPI_ABS_AEAT,
    'spiabsoluteaeat': ODriveEnums.EncoderMode.SPI_ABS_AEAT
  }
  return nameMapping[normalizedName] || ODriveEnums.EncoderMode.INCREMENTAL
}

/**
 * Get human-readable name for control mode value
 * @param {number} value - Control mode enum value
 * @returns {string} Human-readable control mode name
 */
export const getControlModeName = (value) => {
  const controlModeNames = {
    [ODriveEnums.ControlMode.VOLTAGE_CONTROL]: 'Voltage Control',
    [ODriveEnums.ControlMode.TORQUE_CONTROL]: 'Torque Control', 
    [ODriveEnums.ControlMode.VELOCITY_CONTROL]: 'Velocity Control',
    [ODriveEnums.ControlMode.POSITION_CONTROL]: 'Position Control'
  }
  return controlModeNames[value] || 'Unknown'
}

/**
 * Get control mode value from name
 * @param {string} name - Control mode name
 * @returns {number} Control mode enum value
 */
export const getControlModeValue = (name) => {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '')
  const nameMapping = {
    'voltage': ODriveEnums.ControlMode.VOLTAGE_CONTROL,
    'voltagecontrol': ODriveEnums.ControlMode.VOLTAGE_CONTROL,
    'torque': ODriveEnums.ControlMode.TORQUE_CONTROL,
    'torquecontrol': ODriveEnums.ControlMode.TORQUE_CONTROL,
    'velocity': ODriveEnums.ControlMode.VELOCITY_CONTROL,
    'velocitycontrol': ODriveEnums.ControlMode.VELOCITY_CONTROL,
    'position': ODriveEnums.ControlMode.POSITION_CONTROL,
    'positioncontrol': ODriveEnums.ControlMode.POSITION_CONTROL
  }
  return nameMapping[normalizedName] || ODriveEnums.ControlMode.POSITION_CONTROL
}

/**
 * Get human-readable name for input mode value
 * @param {number} value - Input mode enum value
 * @returns {string} Human-readable input mode name
 */
export const getInputModeName = (value) => {
  const inputModeNames = {
    [ODriveEnums.InputMode.INACTIVE]: 'Inactive',
    [ODriveEnums.InputMode.PASSTHROUGH]: 'Passthrough',
    [ODriveEnums.InputMode.VEL_RAMP]: 'Velocity Ramp',
    [ODriveEnums.InputMode.POS_FILTER]: 'Position Filter',
    [ODriveEnums.InputMode.MIX_CHANNELS]: 'Mix Channels',
    [ODriveEnums.InputMode.TRAP_TRAJ]: 'Trapezoidal Trajectory',
    [ODriveEnums.InputMode.TORQUE_RAMP]: 'Torque Ramp',
    [ODriveEnums.InputMode.MIRROR]: 'Mirror'
  }
  return inputModeNames[value] || 'Unknown'
}

/**
 * Get input mode value from name
 * @param {string} name - Input mode name
 * @returns {number} Input mode enum value
 */
export const getInputModeValue = (name) => {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '')
  const nameMapping = {
    'inactive': ODriveEnums.InputMode.INACTIVE,
    'passthrough': ODriveEnums.InputMode.PASSTHROUGH,
    'velramp': ODriveEnums.InputMode.VEL_RAMP,
    'velocityramp': ODriveEnums.InputMode.VEL_RAMP,
    'posfilter': ODriveEnums.InputMode.POS_FILTER,
    'positionfilter': ODriveEnums.InputMode.POS_FILTER,
    'mixchannels': ODriveEnums.InputMode.MIX_CHANNELS,
    'traptraj': ODriveEnums.InputMode.TRAP_TRAJ,
    'trapezoidaltrajectory': ODriveEnums.InputMode.TRAP_TRAJ,
    'torqueramp': ODriveEnums.InputMode.TORQUE_RAMP,
    'mirror': ODriveEnums.InputMode.MIRROR
  }
  return nameMapping[normalizedName] || ODriveEnums.InputMode.INACTIVE
}

/**
 * Get human-readable name for axis state value
 * @param {number} value - Axis state enum value
 * @returns {string} Human-readable axis state name
 */
export const getAxisStateName = (value) => {
  const axisStateNames = {
    [ODriveEnums.AxisState.UNDEFINED]: 'Undefined',
    [ODriveEnums.AxisState.IDLE]: 'Idle',
    [ODriveEnums.AxisState.STARTUP_SEQUENCE]: 'Startup Sequence',
    [ODriveEnums.AxisState.FULL_CALIBRATION_SEQUENCE]: 'Full Calibration',
    [ODriveEnums.AxisState.MOTOR_CALIBRATION]: 'Motor Calibration',
    [ODriveEnums.AxisState.SENSORLESS_CONTROL]: 'Sensorless Control',
    [ODriveEnums.AxisState.ENCODER_INDEX_SEARCH]: 'Encoder Index Search',
    [ODriveEnums.AxisState.ENCODER_OFFSET_CALIBRATION]: 'Encoder Offset Calibration',
    [ODriveEnums.AxisState.CLOSED_LOOP_CONTROL]: 'Closed Loop Control',
    [ODriveEnums.AxisState.LOCKIN_SPIN]: 'Lockin Spin',
    [ODriveEnums.AxisState.ENCODER_DIR_FIND]: 'Encoder Direction Find',
    [ODriveEnums.AxisState.HOMING]: 'Homing',
    [ODriveEnums.AxisState.ENCODER_HALL_POLARITY_CALIBRATION]: 'Hall Polarity Calibration',
    [ODriveEnums.AxisState.ENCODER_HALL_PHASE_CALIBRATION]: 'Hall Phase Calibration'
  }
  return axisStateNames[value] || 'Unknown'
}

/**
 * Get axis state value from name
 * @param {string} name - Axis state name
 * @returns {number} Axis state enum value
 */
export const getAxisStateValue = (name) => {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '')
  const nameMapping = {
    'undefined': ODriveEnums.AxisState.UNDEFINED,
    'idle': ODriveEnums.AxisState.IDLE,
    'startupsequence': ODriveEnums.AxisState.STARTUP_SEQUENCE,
    'fullcalibration': ODriveEnums.AxisState.FULL_CALIBRATION_SEQUENCE,
    'fullcalibrationsequence': ODriveEnums.AxisState.FULL_CALIBRATION_SEQUENCE,
    'motorcalibration': ODriveEnums.AxisState.MOTOR_CALIBRATION,
    'sensorlesscontrol': ODriveEnums.AxisState.SENSORLESS_CONTROL,
    'encoderindexsearch': ODriveEnums.AxisState.ENCODER_INDEX_SEARCH,
    'encoderoffsetcalibration': ODriveEnums.AxisState.ENCODER_OFFSET_CALIBRATION,
    'closedloopcontrol': ODriveEnums.AxisState.CLOSED_LOOP_CONTROL,
    'lockinspin': ODriveEnums.AxisState.LOCKIN_SPIN,
    'encoderdirfind': ODriveEnums.AxisState.ENCODER_DIR_FIND,
    'encoderdirectionfind': ODriveEnums.AxisState.ENCODER_DIR_FIND,
    'homing': ODriveEnums.AxisState.HOMING,
    'encoderhallpolaritycalibration': ODriveEnums.AxisState.ENCODER_HALL_POLARITY_CALIBRATION,
    'encoderhallphasecalibration': ODriveEnums.AxisState.ENCODER_HALL_PHASE_CALIBRATION
  }
  return nameMapping[normalizedName] || ODriveEnums.AxisState.IDLE
}

/**
 * Get human-readable name for GPIO mode value
 * @param {number} value - GPIO mode enum value
 * @returns {string} Human-readable GPIO mode name
 */
export const getGpioModeName = (value) => {
  const gpioModeNames = {
    [ODriveEnums.GpioMode.DIGITAL]: 'Digital',
    [ODriveEnums.GpioMode.DIGITAL_PULL_UP]: 'Digital Pull-up',
    [ODriveEnums.GpioMode.DIGITAL_PULL_DOWN]: 'Digital Pull-down',
    [ODriveEnums.GpioMode.ANALOG_IN]: 'Analog Input',
    [ODriveEnums.GpioMode.UART_A]: 'UART A',
    [ODriveEnums.GpioMode.UART_B]: 'UART B',
    [ODriveEnums.GpioMode.UART_C]: 'UART C',
    [ODriveEnums.GpioMode.CAN_A]: 'CAN A',
    [ODriveEnums.GpioMode.I2C_A]: 'I2C A',
    [ODriveEnums.GpioMode.SPI_A]: 'SPI A',
    [ODriveEnums.GpioMode.PWM]: 'PWM',
    [ODriveEnums.GpioMode.ENC0]: 'Encoder 0',
    [ODriveEnums.GpioMode.ENC1]: 'Encoder 1',
    [ODriveEnums.GpioMode.ENC2]: 'Encoder 2',
    [ODriveEnums.GpioMode.MECH_BRAKE]: 'Mechanical Brake',
    [ODriveEnums.GpioMode.STATUS]: 'Status'
  }
  return gpioModeNames[value] || 'Unknown'
}

/**
 * Get GPIO mode value from name
 * @param {string} name - GPIO mode name
 * @returns {number} GPIO mode enum value
 */
export const getGpioModeValue = (name) => {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '')
  const nameMapping = {
    'digital': ODriveEnums.GpioMode.DIGITAL,
    'digitalpullup': ODriveEnums.GpioMode.DIGITAL_PULL_UP,
    'digitalpulldown': ODriveEnums.GpioMode.DIGITAL_PULL_DOWN,
    'analogin': ODriveEnums.GpioMode.ANALOG_IN,
    'analoginput': ODriveEnums.GpioMode.ANALOG_IN,
    'uarta': ODriveEnums.GpioMode.UART_A,
    'uartb': ODriveEnums.GpioMode.UART_B,
    'uartc': ODriveEnums.GpioMode.UART_C,
    'cana': ODriveEnums.GpioMode.CAN_A,
    'i2ca': ODriveEnums.GpioMode.I2C_A,
    'spia': ODriveEnums.GpioMode.SPI_A,
    'pwm': ODriveEnums.GpioMode.PWM,
    'enc0': ODriveEnums.GpioMode.ENC0,
    'encoder0': ODriveEnums.GpioMode.ENC0,
    'enc1': ODriveEnums.GpioMode.ENC1,
    'encoder1': ODriveEnums.GpioMode.ENC1,
    'enc2': ODriveEnums.GpioMode.ENC2,
    'encoder2': ODriveEnums.GpioMode.ENC2,
    'mechbrake': ODriveEnums.GpioMode.MECH_BRAKE,
    'mechanicalbrake': ODriveEnums.GpioMode.MECH_BRAKE,
    'status': ODriveEnums.GpioMode.STATUS
  }
  return nameMapping[normalizedName] || ODriveEnums.GpioMode.DIGITAL
}

/**
 * Get commands by category
 * @param {string} category - Category name
 * @returns {Array} Array of commands in the category
 */
export const getCommandsByCategory = (category) => {
  return ODriveCommands[category] || []
}

/**
 * Get all commands flattened into a single array
 * @returns {Array} Array of all commands
 */
export const getAllCommands = () => {
  const allCommands = []
  Object.values(ODriveCommands).forEach(categoryCommands => {
    if (Array.isArray(categoryCommands)) {
      allCommands.push(...categoryCommands)
    }
  })
  return allCommands
}

/**
 * Search commands by name or description
 * @param {string} query - Search query
 * @returns {Array} Array of matching commands
 */
export const searchCommands = (query) => {
  const allCommands = getAllCommands()
  const lowerQuery = query.toLowerCase()
  
  return allCommands.filter(command => 
    command.name.toLowerCase().includes(lowerQuery) ||
    (command.description && command.description.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get configuration parameters for a specific category
 * @param {string} category - Configuration category
 * @returns {Object} Configuration parameters mapping
 */
export const getConfigurationParams = (category) => {
  return ODrivePropertyMappings[category] || {}
}

/**
 * Get all configuration parameters flattened
 * @returns {Object} All configuration parameters
 */
export const getAllConfigurationParams = () => {
  const allParams = {}
  Object.entries(ODrivePropertyMappings).forEach(([category, params]) => {
    Object.entries(params).forEach(([key, value]) => {
      allParams[`${category}.${key}`] = value
    })
  })
  return allParams
}

/**
 * Command Generation Functions
 * Generate ODrive v0.5.6 configuration commands from configuration objects
 */

/**
 * Generate power configuration commands
 * @param {Object} powerConfig - Power configuration object
 * @returns {Array<string>} Array of power-related ODrive commands
 */
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
    commands.push(`odrv0.axis${axisNum}.motor.config.torque_constant = ${motorConfig.torque_constant}`)
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
export const generateConfigCommands = (config = {}) => {
  const allCommands = []
  
  // Generate commands for each configuration section
  if (config.power) {
    allCommands.push(...generatePowerCommands(config.power))
  }
  
  if (config.motor) {
    allCommands.push(...generateMotorCommands(config.motor))
  }
  
  if (config.encoder) {
    allCommands.push(...generateEncoderCommands(config.encoder))
  }
  
  if (config.control) {
    allCommands.push(...generateControlCommands(config.control))
  }
  
  if (config.interface) {
    allCommands.push(...generateInterfaceCommands(config.interface))
  }
  
  return allCommands
}