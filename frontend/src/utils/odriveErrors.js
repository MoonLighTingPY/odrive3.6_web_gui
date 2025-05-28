// ODrive v0.5.6 Error Codes and Descriptions
// Based on ODrive firmware v0.5.6 documentation

export const AxisError = {
  NONE: 0x00000000,
  INVALID_STATE: 0x00000001,
  DC_BUS_UNDER_VOLTAGE: 0x00000002,
  DC_BUS_OVER_VOLTAGE: 0x00000004,
  CURRENT_MEASUREMENT_TIMEOUT: 0x00000008,
  BRAKE_RESISTOR_DISARMED: 0x00000010,
  MOTOR_DISARMED: 0x00000020,
  MOTOR_FAILED: 0x00000040,
  SENSORLESS_ESTIMATOR_FAILED: 0x00000080,
  ENCODER_FAILED: 0x00000100,
  CONTROLLER_FAILED: 0x00000200,
  POS_CTRL_DURING_SENSORLESS: 0x00000400,
  WATCHDOG_TIMER_EXPIRED: 0x00000800,
  MIN_ENDSTOP_PRESSED: 0x00001000,
  MAX_ENDSTOP_PRESSED: 0x00002000,
  ESTOP_REQUESTED: 0x00004000,
  HOMING_WITHOUT_ENDSTOP: 0x00008000,
  OVER_TEMP: 0x00010000,
  UNKNOWN_POSITION: 0x00020000,
}

export const MotorError = {
  NONE: 0x00000000,
  PHASE_RESISTANCE_OUT_OF_RANGE: 0x00000001,
  PHASE_INDUCTANCE_OUT_OF_RANGE: 0x00000002,
  ADC_FAILED: 0x00000004,
  DRV_FAULT: 0x00000008,
  CONTROL_DEADLINE_MISSED: 0x00000010,
  NOT_IMPLEMENTED_MOTOR_TYPE: 0x00000020,
  BRAKE_CURRENT_OUT_OF_RANGE: 0x00000040,
  MODULATION_MAGNITUDE: 0x00000080,
  BRAKE_DEADTIME_VIOLATION: 0x00000100,
  UNEXPECTED_TIMER_CALLBACK: 0x00000200,
  CURRENT_SENSE_SATURATION: 0x00000400,
  CURRENT_LIMIT_VIOLATION: 0x00000800,
  BRAKE_DUTY_CYCLE_NAN: 0x00001000,
  DC_BUS_OVER_REGEN_CURRENT: 0x00002000,
  DC_BUS_OVER_CURRENT: 0x00004000,
}

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

export const SensorlessEstimatorError = {
  NONE: 0x00000000,
  UNSTABLE_GAIN: 0x00000001,
  UNKNOWN_CURRENT_COMMAND: 0x00000002,
}

// Error description mappings
const axisErrorDescriptions = {
  [AxisError.NONE]: "No error",
  [AxisError.INVALID_STATE]: "Invalid state transition requested",
  [AxisError.DC_BUS_UNDER_VOLTAGE]: "DC bus voltage below minimum threshold",
  [AxisError.DC_BUS_OVER_VOLTAGE]: "DC bus voltage above maximum threshold",
  [AxisError.CURRENT_MEASUREMENT_TIMEOUT]: "Current measurement circuit failed",
  [AxisError.BRAKE_RESISTOR_DISARMED]: "Brake resistor is disabled but required",
  [AxisError.MOTOR_DISARMED]: "Motor is disarmed due to error condition",
  [AxisError.MOTOR_FAILED]: "Motor subsystem failure detected",
  [AxisError.SENSORLESS_ESTIMATOR_FAILED]: "Sensorless position estimator failed",
  [AxisError.ENCODER_FAILED]: "Encoder subsystem failure detected",
  [AxisError.CONTROLLER_FAILED]: "Control loop subsystem failure",
  [AxisError.POS_CTRL_DURING_SENSORLESS]: "Position control not available in sensorless mode",
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
  [MotorError.ADC_FAILED]: "Current measurement ADC failure",
  [MotorError.DRV_FAULT]: "Gate driver fault detected",
  [MotorError.CONTROL_DEADLINE_MISSED]: "Motor control loop timing violation",
  [MotorError.NOT_IMPLEMENTED_MOTOR_TYPE]: "Selected motor type not implemented",
  [MotorError.BRAKE_CURRENT_OUT_OF_RANGE]: "Brake current measurement out of range",
  [MotorError.MODULATION_MAGNITUDE]: "PWM modulation magnitude error",
  [MotorError.BRAKE_DEADTIME_VIOLATION]: "Brake timing deadtime violation",
  [MotorError.UNEXPECTED_TIMER_CALLBACK]: "Unexpected timer interrupt",
  [MotorError.CURRENT_SENSE_SATURATION]: "Current sense amplifier saturated",
  [MotorError.CURRENT_LIMIT_VIOLATION]: "Motor current exceeded safety limit",
  [MotorError.BRAKE_DUTY_CYCLE_NAN]: "Brake duty cycle calculation error",
  [MotorError.DC_BUS_OVER_REGEN_CURRENT]: "Regenerative current exceeded DC bus limit",
  [MotorError.DC_BUS_OVER_CURRENT]: "Motor current exceeded DC bus limit",
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
  [SensorlessEstimatorError.UNKNOWN_CURRENT_COMMAND]: "Unknown current command in sensorless mode",
}

// Troubleshooting guides for specific errors
const errorTroubleshootingGuides = {
  [EncoderError.CPR_POLEPAIRS_MISMATCH]: {
    title: "CPR/Pole Pairs Mismatch",
    description: "The encoder resolution (CPR) is incompatible with the motor pole pairs",
    causes: [
      "CPR is not evenly divisible by pole pairs",
      "CPR value is too low for the motor",
      "Incorrect pole pair count configured"
    ],
    solutions: [
      "Ensure CPR is at least 4x the pole pairs (recommended: 8x or higher)",
      "For 7 pole pairs: use CPR of 2800, 4200, 5600, etc.",
      "Verify motor pole pair count with manufacturer specs",
      "Consider using a higher resolution encoder"
    ],
    commands: [
      "Check: odrv0.axis0.motor.config.pole_pairs",
      "Check: odrv0.axis0.encoder.config.cpr",
      "Set CPR: odrv0.axis0.encoder.config.cpr = [value]"
    ]
  },
  [AxisError.ENCODER_FAILED]: {
    title: "Encoder Subsystem Failure",
    description: "The encoder is not responding or configured incorrectly",
    causes: [
      "Incorrect encoder wiring (A+, A-, B+, B-, Z+, Z-)",
      "Wrong encoder type selected",
      "Encoder power supply issues (3.3V/5V)",
      "Damaged encoder or cables"
    ],
    solutions: [
      "Verify encoder wiring matches ODrive pinout",
      "Check encoder power supply voltage",
      "Ensure correct encoder mode is selected",
      "Test encoder with oscilloscope if available",
      "Try different encoder type settings"
    ],
    commands: [
      "Check: odrv0.axis0.encoder.config.mode",
      "Check: odrv0.axis0.encoder.error",
      "Clear errors: odrv0.clear_errors()"
    ]
  }
}

// Helper function to get error description for any error code
export const getErrorDescription = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) {
    return "No error"
  }

  let descriptions
  switch (errorType) {
    case 'motor':
      descriptions = motorErrorDescriptions
      break
    case 'encoder':
      descriptions = encoderErrorDescriptions
      break
    case 'controller':
      descriptions = controllerErrorDescriptions
      break
    case 'sensorless':
      descriptions = sensorlessErrorDescriptions
      break
    case 'axis':
    default:
      descriptions = axisErrorDescriptions
      break
  }

  // Handle multiple error flags (bitwise OR)
  const errorMessages = []
  for (const [errorFlag, description] of Object.entries(descriptions)) {
    const flag = parseInt(errorFlag)
    if (flag !== 0 && (errorCode & flag) === flag) {
      errorMessages.push(description)
    }
  }

  if (errorMessages.length === 0) {
    return `Unknown error (0x${errorCode.toString(16).toUpperCase().padStart(8, '0')})`
  }

  return errorMessages.join('; ')
}

// Helper function to get troubleshooting guide for specific errors
export const getErrorTroubleshootingGuide = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) return null

  // Check for specific troubleshooting guides
  for (const [errorFlag, guide] of Object.entries(errorTroubleshootingGuides)) {
    const flag = parseInt(errorFlag)
    if ((errorCode & flag) === flag) {
      return guide
    }
  }

  return null
}

// Helper function to check if an error is critical (requires immediate attention)
export const isErrorCritical = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) return false

  const criticalAxisErrors = [
    AxisError.DC_BUS_OVER_VOLTAGE,
    AxisError.CURRENT_MEASUREMENT_TIMEOUT,
    AxisError.MOTOR_FAILED,
    AxisError.OVER_TEMP,
    AxisError.ESTOP_REQUESTED,
  ]

  const criticalMotorErrors = [
    MotorError.DRV_FAULT,
    MotorError.CURRENT_LIMIT_VIOLATION,
    MotorError.DC_BUS_OVER_CURRENT,
    MotorError.DC_BUS_OVER_REGEN_CURRENT,
  ]

  const criticalEncoderErrors = [
    EncoderError.CPR_POLEPAIRS_MISMATCH, // This prevents motor operation
  ]

  if (errorType === 'axis') {
    return criticalAxisErrors.some(criticalError => (errorCode & criticalError) === criticalError)
  } else if (errorType === 'motor') {
    return criticalMotorErrors.some(criticalError => (errorCode & criticalError) === criticalError)
  } else if (errorType === 'encoder') {
    return criticalEncoderErrors.some(criticalError => (errorCode & criticalError) === criticalError)
  }

  return false
}

// Helper function to get error color for UI
export const getErrorColor = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) return 'green'
  if (isErrorCritical(errorCode, errorType)) return 'red'
  return 'orange'
}

// Helper function to validate encoder configuration
export const validateEncoderConfig = (encoderConfig, motorConfig) => {
  const warnings = []
  const errors = []

  const cpr = encoderConfig.cpr || 4000
  const polePairs = motorConfig.pole_pairs || 7

  // Check CPR vs pole pairs ratio
  const ratio = cpr / polePairs
  if (ratio < 4) {
    errors.push(`CPR (${cpr}) is too low for ${polePairs} pole pairs. Minimum recommended: ${polePairs * 4}`)
  } else if (ratio < 8) {
    warnings.push(`CPR (${cpr}) is marginal for ${polePairs} pole pairs. Recommended: ${polePairs * 8} or higher`)
  }

  // Check if CPR is divisible by pole pairs
  if (cpr % polePairs !== 0) {
    warnings.push(`CPR (${cpr}) should be evenly divisible by pole pairs (${polePairs}) for optimal performance`)
  }

  return { warnings, errors }
}