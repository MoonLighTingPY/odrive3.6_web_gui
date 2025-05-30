// ODrive v0.5.6 Error Codes - Updated to match official firmware definitions

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

// Motor Errors - Updated with all official error codes
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
  UNKNOWN_CURRENT_MEASUREMENT: 0x00000002,  // Fixed: was UNKNOWN_CURRENT_COMMAND
}

// CAN Errors
export const CanError = {
  NONE: 0x00000000,
  DUPLICATE_CAN_IDS: 0x00000001,
}

// Error description mappings - Updated for new error codes
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

// Helper function to check if an error is critical
export const isErrorCritical = (errorCode, errorType = 'axis') => {
  if (!errorCode || errorCode === 0) return false

  const criticalAxisErrors = [
    AxisError.MOTOR_FAILED,
    AxisError.ENCODER_FAILED,
    AxisError.CONTROLLER_FAILED,
    AxisError.OVER_TEMP,
    AxisError.ESTOP_REQUESTED,
  ]

  const criticalMotorErrors = [
    MotorError.DRV_FAULT,
    MotorError.CURRENT_LIMIT_VIOLATION,
    MotorError.MOTOR_THERMISTOR_OVER_TEMP,
    MotorError.FET_THERMISTOR_OVER_TEMP,
    MotorError.CURRENT_SENSE_SATURATION,
  ]

  const criticalEncoderErrors = [
    EncoderError.CPR_POLEPAIRS_MISMATCH,
    EncoderError.NO_RESPONSE,
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

// Troubleshooting guides for specific errors
const troubleshootingGuides = {
  // Encoder Errors
  [EncoderError.CPR_POLEPAIRS_MISMATCH]: {
    title: "Encoder CPR / Pole Pairs Mismatch",
    description: "The encoder counts per revolution (CPR) setting doesn't match the motor pole pairs configuration. This can cause position estimation errors and poor performance.",
    causes: [
      "Incorrect CPR value configured for your encoder",
      "Wrong motor pole pairs setting",
      "Encoder mode set incorrectly (Hall vs Incremental)",
      "Using default values instead of actual hardware specifications"
    ],
    solutions: [
      "Verify your encoder's actual CPR from datasheet",
      "Ensure CPR is evenly divisible by motor pole pairs",
      "For 7 pole pair motors: try CPR values like 28, 35, 56, 140, 280, 2800, 4200",
      "Check encoder mode: Hall sensors (mode 1) vs Incremental (mode 0)",
      "Recalibrate encoder after correcting CPR value"
    ],
    commands: [
      "odrv0.axis0.encoder.config.cpr",
      "odrv0.axis0.motor.config.pole_pairs",
      "odrv0.axis0.encoder.config.mode",
      "odrv0.axis0.encoder.error",
      "odrv0.axis0.clear_errors()"
    ]
  },

  [EncoderError.NO_RESPONSE]: {
    title: "No Encoder Response",
    description: "The ODrive is not receiving any signals from the encoder. This indicates a hardware connection issue or encoder failure.",
    causes: [
      "Loose or disconnected encoder wiring",
      "Incorrect encoder pinout/wiring",
      "Failed encoder hardware",
      "Wrong encoder mode selected",
      "Insufficient power supply to encoder"
    ],
    solutions: [
      "Check all encoder connections (A, B, Z channels)",
      "Verify encoder power supply (3.3V or 5V as required)",
      "Test encoder with multimeter or oscilloscope",
      "Ensure correct encoder mode in configuration",
      "Try different encoder or swap with known working one"
    ],
    commands: [
      "odrv0.axis0.encoder.config.mode",
      "odrv0.axis0.encoder.shadow_count",
      "odrv0.axis0.encoder.count_in_cpr",
      "odrv0.axis0.encoder.error",
      "odrv0.axis0.clear_errors()"
    ]
  },

  [EncoderError.ILLEGAL_HALL_STATE]: {
    title: "Illegal Hall Sensor State",
    description: "The Hall sensor is reporting an invalid state combination. Hall sensors should only report states 1-6, not 0 or 7.",
    causes: [
      "Damaged or failed Hall sensor",
      "Incorrect Hall sensor wiring",
      "Hall sensors not properly aligned",
      "Electrical noise affecting Hall signals",
      "Wrong encoder mode (should be Hall mode)"
    ],
    solutions: [
      "Check Hall sensor wiring and connections",
      "Verify encoder mode is set to Hall (mode 1)",
      "Test individual Hall sensors with multimeter",
      "Check for proper Hall sensor alignment with magnets",
      "Add filtering capacitors to reduce electrical noise"
    ],
    commands: [
      "odrv0.axis0.encoder.config.mode",
      "odrv0.axis0.encoder.hall_state",
      "odrv0.axis0.encoder.error",
      "odrv0.axis0.clear_errors()"
    ]
  },

  // Motor Errors
  [MotorError.PHASE_RESISTANCE_OUT_OF_RANGE]: {
    title: "Motor Phase Resistance Out of Range",
    description: "The measured motor phase resistance is outside the expected range during calibration.",
    causes: [
      "Loose motor connections",
      "Incorrect motor type configuration",
      "Motor phase windings damaged",
      "Wrong current limit settings",
      "Poor electrical connections"
    ],
    solutions: [
      "Check all motor phase connections (A, B, C)",
      "Verify motor type setting (High Current vs Gimbal)",
      "Measure motor resistance with multimeter",
      "Ensure current limit is appropriate for motor",
      "Clean and tighten all electrical connections"
    ],
    commands: [
      "odrv0.axis0.motor.config.motor_type",
      "odrv0.axis0.motor.config.phase_resistance",
      "odrv0.axis0.motor.config.current_lim",
      "odrv0.axis0.motor.error",
      "odrv0.axis0.clear_errors()"
    ]
  },

  [MotorError.DRV_FAULT]: {
    title: "Gate Driver Fault",
    description: "The gate driver has detected a fault condition. This is a critical hardware protection feature.",
    causes: [
      "Motor short circuit",
      "Overcurrent condition",
      "Overvoltage on motor phases",
      "Gate driver overheating",
      "Hardware failure in power stage"
    ],
    solutions: [
      "Check for motor short circuits",
      "Reduce current limits",
      "Allow ODrive to cool down",
      "Check power supply voltage levels",
      "Replace ODrive if hardware failure suspected"
    ],
    commands: [
      "odrv0.axis0.motor.config.current_lim",
      "odrv0.vbus_voltage",
      "odrv0.axis0.motor.error",
      "odrv0.axis0.clear_errors()"
    ]
  },

  [MotorError.CURRENT_LIMIT_VIOLATION]: {
    title: "Motor Current Limit Exceeded",
    description: "The motor current has exceeded the configured safety limit.",
    causes: [
      "Current limit set too low",
      "Motor stalled or blocked",
      "Excessive load on motor",
      "Controller gains too aggressive",
      "Mechanical binding in system"
    ],
    solutions: [
      "Increase current limit if motor can handle it",
      "Check for mechanical obstructions",
      "Reduce controller gains (vel_gain, pos_gain)",
      "Verify motor specifications",
      "Check motor and load for binding"
    ],
    commands: [
      "odrv0.axis0.motor.config.current_lim",
      "odrv0.axis0.controller.config.vel_gain",
      "odrv0.axis0.controller.config.pos_gain",
      "odrv0.axis0.motor.current_control.Iq_measured",
      "odrv0.axis0.clear_errors()"
    ]
  },

  // Controller Errors
  [ControllerError.OVERSPEED]: {
    title: "Motor Overspeed",
    description: "The motor velocity has exceeded the configured velocity limit.",
    causes: [
      "Velocity limit set too low",
      "Controller instability causing oscillation",
      "External forces driving motor faster",
      "Incorrect velocity feedback",
      "Control gains too high"
    ],
    solutions: [
      "Increase velocity limit if safe to do so",
      "Reduce controller gains to improve stability",
      "Check for external forces on motor",
      "Verify encoder feedback is correct",
      "Add velocity ramping to smooth commands"
    ],
    commands: [
      "odrv0.axis0.controller.config.vel_limit",
      "odrv0.axis0.controller.config.vel_gain",
      "odrv0.axis0.encoder.vel_estimate",
      "odrv0.axis0.controller.error",
      "odrv0.axis0.clear_errors()"
    ]
  },

  [ControllerError.UNSTABLE_GAIN]: {
    title: "Unstable Control Gains",
    description: "The controller gains are causing system instability, resulting in oscillations or runaway behavior.",
    causes: [
      "Control gains set too high",
      "Poor system identification",
      "Mechanical resonance in system",
      "Incorrect motor parameters",
      "Insufficient filtering"
    ],
    solutions: [
      "Reduce velocity and position gains",
      "Perform proper system identification",
      "Add mechanical damping to system",
      "Verify motor inertia and resistance values",
      "Increase input filter bandwidth"
    ],
    commands: [
      "odrv0.axis0.controller.config.vel_gain",
      "odrv0.axis0.controller.config.pos_gain",
      "odrv0.axis0.controller.config.input_filter_bandwidth",
      "odrv0.axis0.motor.config.phase_resistance",
      "odrv0.axis0.clear_errors()"
    ]
  },

  // Axis Errors
  [AxisError.MOTOR_FAILED]: {
    title: "Motor Subsystem Failed",
    description: "The motor subsystem has encountered a failure. Check motor error codes for specific details.",
    causes: [
      "Motor hardware failure",
      "Motor calibration failed",
      "Power stage failure",
      "Temperature protection triggered",
      "Critical motor error occurred"
    ],
    solutions: [
      "Check motor error flags for specific issues",
      "Verify motor connections and wiring",
      "Ensure adequate cooling",
      "Recalibrate motor if possible",
      "Replace motor if hardware failure"
    ],
    commands: [
      "odrv0.axis0.motor.error",
      "odrv0.axis0.motor.is_calibrated",
      "odrv0.axis0.requested_state = 4",  // Motor calibration
      "odrv0.axis0.error",
      "odrv0.axis0.clear_errors()"
    ]
  },

  [AxisError.ENCODER_FAILED]: {
    title: "Encoder Subsystem Failed",
    description: "The encoder subsystem has encountered a failure. Check encoder error codes for specific details.",
    causes: [
      "Encoder hardware failure",
      "Encoder calibration failed",
      "Connection issues",
      "Configuration problems",
      "Critical encoder error occurred"
    ],
    solutions: [
      "Check encoder error flags for specific issues",
      "Verify encoder connections and wiring",
      "Recalibrate encoder if possible",
      "Check encoder configuration settings",
      "Replace encoder if hardware failure"
    ],
    commands: [
      "odrv0.axis0.encoder.error",
      "odrv0.axis0.encoder.is_ready",
      "odrv0.axis0.requested_state = 7",  // Encoder calibration
      "odrv0.axis0.error",
      "odrv0.axis0.clear_errors()"
    ]
  }
}

// Helper function to get troubleshooting guide for specific error
export const getErrorTroubleshootingGuide = (errorCode, errorType = 'encoder') => {
  if (!errorCode || errorCode === 0) return null

  // Find the specific error flag that matches
  let errorEnum, guides
  switch (errorType) {
    case 'encoder':
      errorEnum = EncoderError
      break
    case 'motor':
      errorEnum = MotorError
      break
    case 'controller':
      errorEnum = ControllerError
      break
    case 'axis':
      errorEnum = AxisError
      break
    default:
      return null
  }

  // Check if we have a guide for this specific error
  for (const [flagValue, guide] of Object.entries(troubleshootingGuides)) {
    const flag = parseInt(flagValue)
    if ((errorCode & flag) === flag) {
      return guide
    }
  }

  // Return generic troubleshooting info if no specific guide found
  return {
    title: `${errorType.charAt(0).toUpperCase() + errorType.slice(1)} Error`,
    description: getErrorDescription(errorCode, errorType),
    causes: [
      "Hardware connection issues",
      "Configuration problems",
      "Calibration required",
      "Environmental factors"
    ],
    solutions: [
      "Check all connections and wiring",
      "Verify configuration settings",
      "Clear errors and recalibrate",
      "Consult ODrive documentation"
    ],
    commands: [
      `odrv0.axis0.${errorType}.error`,
      "odrv0.axis0.clear_errors()",
      "odrv0.axis0.requested_state = 1"  // Return to idle
    ]
  }
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