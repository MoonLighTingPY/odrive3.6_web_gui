// ODrive v0.5.6 Error Codes. UPDATE FOR 0.6.X

// ODrive System Errors
export const ODriveError = {
  NONE: 0x00000000,
  CONTROL_ITERATION_MISSED: 0x00000001,
  DC_BUS_UNDER_VOLTAGE: 0x00000002,
  DC_BUS_OVER_VOLTAGE: 0x00000004,
  DC_BUS_OVER_REGEN_CURRENT: 0x00000008,
  DC_BUS_OVER_CURRENT: 0x00000010,
  BRAKE_DEADTIME_VIOLATION: 0x00000020,
  BRAKE_DUTY_CYCLE_NAN: 0x00000040,
  INVALID_BRAKE_RESISTANCE: 0x00000080,
}

// Axis Errors - Fixed to match official values
export const AxisError = {
  NONE: 0x00000000,
  INVALID_STATE: 0x00000001,
  // Note: 0x00000002-0x00000020 missing in official firmware
  MOTOR_FAILED: 0x00000040,
  SENSORLESS_ESTIMATOR_FAILED: 0x00000080,
  ENCODER_FAILED: 0x00000100,
  CONTROLLER_FAILED: 0x00000200,
  // Note: 0x00000400 missing
  WATCHDOG_TIMER_EXPIRED: 0x00000800,
  MIN_ENDSTOP_PRESSED: 0x00001000,
  MAX_ENDSTOP_PRESSED: 0x00002000,
  ESTOP_REQUESTED: 0x00004000,
  // Note: 0x00008000-0x00010000 missing
  HOMING_WITHOUT_ENDSTOP: 0x00020000,
  OVER_TEMP: 0x00040000,
  UNKNOWN_POSITION: 0x00080000,
}

// Motor Errors
export const MotorError = {
  NONE: 0x00000000,
  PHASE_RESISTANCE_OUT_OF_RANGE: 0x00000001,
  PHASE_INDUCTANCE_OUT_OF_RANGE: 0x00000002,
  // 0x00000004 missing
  DRV_FAULT: 0x00000008,
  CONTROL_DEADLINE_MISSED: 0x00000010,
  // 0x00000020, 0x00000040 missing
  MODULATION_MAGNITUDE: 0x00000080,
  // 0x00000100, 0x00000200 missing
  CURRENT_SENSE_SATURATION: 0x00000400,
  // 0x00000800 missing
  CURRENT_LIMIT_VIOLATION: 0x00001000,
  // 0x00002000-0x00008000 missing
  MODULATION_IS_NAN: 0x00010000,
  MOTOR_THERMISTOR_OVER_TEMP: 0x00020000,
  FET_THERMISTOR_OVER_TEMP: 0x00040000,
  TIMER_UPDATE_MISSED: 0x00080000,
  CURRENT_MEASUREMENT_UNAVAILABLE: 0x00100000,
  CONTROLLER_FAILED: 0x00200000,
  I_BUS_OUT_OF_RANGE: 0x00400000,
  BRAKE_RESISTOR_DISARMED: 0x00800000,
  SYSTEM_LEVEL: 0x01000000,
  BAD_TIMING: 0x02000000,
  UNKNOWN_PHASE_ESTIMATE: 0x04000000,
  UNKNOWN_PHASE_VEL: 0x08000000,
  UNKNOWN_TORQUE: 0x10000000,
  UNKNOWN_CURRENT_COMMAND: 0x20000000,
  UNKNOWN_CURRENT_MEASUREMENT: 0x40000000,
  UNKNOWN_VBUS_VOLTAGE: 0x80000000,
  UNKNOWN_VOLTAGE_COMMAND: 0x100000000,
  UNKNOWN_GAINS: 0x200000000,
  CONTROLLER_INITIALIZING: 0x400000000,
  UNBALANCED_PHASES: 0x800000000,
}

// Controller Errors
export const ControllerError = {
  NONE: 0x00000000,
  OVERSPEED: 0x00000001,
  INVALID_INPUT_MODE: 0x00000002,
  UNSTABLE_GAIN: 0x00000004,
  INVALID_MIRROR_AXIS: 0x00000008,
  INVALID_LOAD_ENCODER: 0x00000010,
  INVALID_ESTIMATE: 0x00000020,
  INVALID_CIRCULAR_RANGE: 0x00000040,
  SPINOUT_DETECTED: 0x00000080,
}

// Encoder Errors
export const EncoderError = {
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
}

// Sensorless Estimator Errors - Fixed name
export const SensorlessEstimatorError = {
  NONE: 0x00000000,
  UNSTABLE_GAIN: 0x00000001,
  UNKNOWN_CURRENT_MEASUREMENT: 0x00000002,
}

// CAN Errors
export const CanError = {
  NONE: 0x00000000,
  DUPLICATE_CAN_IDS: 0x00000001,
}

// Error description mappings
const axisErrorDescriptions = {
  [AxisError.NONE]: "No error",
  [AxisError.INVALID_STATE]: "Invalid state transition requested",
  [AxisError.MOTOR_FAILED]: "Motor subsystem failure detected",
  [AxisError.SENSORLESS_ESTIMATOR_FAILED]: "Sensorless position estimator failed",
  [AxisError.ENCODER_FAILED]: "Encoder subsystem failure detected",
  [AxisError.CONTROLLER_FAILED]: "Control loop subsystem failure",
  [AxisError.WATCHDOG_TIMER_EXPIRED]: "Safety watchdog timer expired",
  [AxisError.MIN_ENDSTOP_PRESSED]: "Minimum endstop limit switch activated",
  [AxisError.MAX_ENDSTOP_PRESSED]: "Maximum endstop limit switch activated",
  [AxisError.ESTOP_REQUESTED]: "Emergency stop has been triggered",
  [AxisError.HOMING_WITHOUT_ENDSTOP]: "Homing attempted without endstop configured",
  [AxisError.OVER_TEMP]: "Temperature protection activated",
  [AxisError.UNKNOWN_POSITION]: "Position estimate is not reliable",
}

const motorErrorDescriptions = {
  [MotorError.NONE]: "No error",
  [MotorError.PHASE_RESISTANCE_OUT_OF_RANGE]: "Measured phase resistance outside expected range",
  [MotorError.PHASE_INDUCTANCE_OUT_OF_RANGE]: "Measured phase inductance outside expected range",
  [MotorError.DRV_FAULT]: "Gate driver fault detected",
  [MotorError.CONTROL_DEADLINE_MISSED]: "Motor control loop timing violation",
  [MotorError.MODULATION_MAGNITUDE]: "PWM modulation magnitude error",
  [MotorError.CURRENT_SENSE_SATURATION]: "Current sense amplifier saturated",
  [MotorError.CURRENT_LIMIT_VIOLATION]: "Motor current exceeded safety limit",
  [MotorError.MODULATION_IS_NAN]: "PWM modulation calculation error (NaN)",
  [MotorError.MOTOR_THERMISTOR_OVER_TEMP]: "Motor temperature exceeded limit",
  [MotorError.FET_THERMISTOR_OVER_TEMP]: "FET temperature exceeded limit",
  [MotorError.TIMER_UPDATE_MISSED]: "Motor timer update missed",
  [MotorError.CURRENT_MEASUREMENT_UNAVAILABLE]: "Current measurement not available",
  [MotorError.CONTROLLER_FAILED]: "Motor controller subsystem failed",
  [MotorError.I_BUS_OUT_OF_RANGE]: "DC bus current out of range",
  [MotorError.BRAKE_RESISTOR_DISARMED]: "Brake resistor is disabled but required",
  [MotorError.SYSTEM_LEVEL]: "System level motor error",
  [MotorError.BAD_TIMING]: "Motor timing error",
  [MotorError.UNKNOWN_PHASE_ESTIMATE]: "Motor phase estimate unknown",
  [MotorError.UNKNOWN_PHASE_VEL]: "Motor phase velocity unknown",
  [MotorError.UNKNOWN_TORQUE]: "Motor torque estimate unknown",
  [MotorError.UNKNOWN_CURRENT_COMMAND]: "Motor current command unknown",
  [MotorError.UNKNOWN_CURRENT_MEASUREMENT]: "Motor current measurement unknown",
  [MotorError.UNKNOWN_VBUS_VOLTAGE]: "DC bus voltage unknown",
  [MotorError.UNKNOWN_VOLTAGE_COMMAND]: "Motor voltage command unknown",
  [MotorError.UNKNOWN_GAINS]: "Motor control gains unknown",
  [MotorError.CONTROLLER_INITIALIZING]: "Motor controller initializing",
  [MotorError.UNBALANCED_PHASES]: "Motor phases are unbalanced",
}

const encoderErrorDescriptions = {
  [EncoderError.NONE]: "No error",
  [EncoderError.UNSTABLE_GAIN]: "Encoder gain calibration unstable",
  [EncoderError.CPR_POLEPAIRS_MISMATCH]: "Encoder CPR doesn't match motor pole pairs",
  [EncoderError.NO_RESPONSE]: "No response from encoder",
  [EncoderError.UNSUPPORTED_ENCODER_MODE]: "Selected encoder mode not supported",
  [EncoderError.ILLEGAL_HALL_STATE]: "Invalid Hall sensor state detected",
  [EncoderError.INDEX_NOT_FOUND_YET]: "Encoder index pulse not found during search",
  [EncoderError.ABS_SPI_TIMEOUT]: "SPI communication timeout with absolute encoder",
  [EncoderError.ABS_SPI_COM_FAIL]: "SPI communication failure with absolute encoder",
  [EncoderError.ABS_SPI_NOT_READY]: "Absolute encoder not ready for communication",
  [EncoderError.HALL_NOT_CALIBRATED_YET]: "Hall sensors not calibrated",
}

const controllerErrorDescriptions = {
  [ControllerError.NONE]: "No error",
  [ControllerError.OVERSPEED]: "Velocity exceeded maximum allowed speed",
  [ControllerError.INVALID_INPUT_MODE]: "Selected input mode is invalid",
  [ControllerError.UNSTABLE_GAIN]: "Control gains are causing instability",
  [ControllerError.INVALID_MIRROR_AXIS]: "Mirror axis configuration is invalid",
  [ControllerError.INVALID_LOAD_ENCODER]: "Load encoder configuration is invalid",
  [ControllerError.INVALID_ESTIMATE]: "Position/velocity estimate is invalid",
  [ControllerError.INVALID_CIRCULAR_RANGE]: "Circular setpoint range is invalid",
  [ControllerError.SPINOUT_DETECTED]: "Motor spinout condition detected",
}

const sensorlessErrorDescriptions = {
  [SensorlessEstimatorError.NONE]: "No error",
  [SensorlessEstimatorError.UNSTABLE_GAIN]: "Sensorless estimator gain is unstable",
  [SensorlessEstimatorError.UNKNOWN_CURRENT_MEASUREMENT]: "Current measurement unknown in sensorless mode",
}
