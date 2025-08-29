/**
 * ODrive Error Handling - Streamlined Version
 * Simplified error code definitions and processing
 */

import { safeNumber } from './valueHelpers'

/**
 * ODrive Error Code Definitions
 * Grouped by error type for better organization
 */
export const ErrorCodes = {
  // System Errors
  SYSTEM: {
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
  AXIS: {
    NONE: 0x00000000,
    INVALID_STATE: 0x00000001,
    MOTOR_FAILED: 0x00000040,
    SENSORLESS_ESTIMATOR_FAILED: 0x00000080,
    ENCODER_FAILED: 0x00000100,
    CONTROLLER_FAILED: 0x00000200,
    OVER_TEMP: 0x00000400,
    UNKNOWN_POSITION: 0x00000800,
    ESTOP_REQUESTED: 0x00001000,
    SPINOUT_DETECTED: 0x00002000,
    BRAKE_RESISTOR_DISARMED: 0x00004000,
    THERMISTOR_DISCONNECTED: 0x00008000,
    CALIBRATION_ERROR: 0x00010000
  },

  // Motor Errors
  MOTOR: {
    NONE: 0x00000000,
    PHASE_RESISTANCE_OUT_OF_RANGE: 0x00000001,
    PHASE_INDUCTANCE_OUT_OF_RANGE: 0x00000002,
    DRV_FAULT: 0x00000008,
    CONTROL_DEADLINE_MISSED: 0x00000010,
    NOT_IMPLEMENTED_MOTOR_TYPE: 0x00000020,
    BRAKE_CURRENT_OUT_OF_RANGE: 0x00000040,
    MODULATION_MAGNITUDE: 0x00000080,
    BRAKE_DEADTIME_VIOLATION: 0x00000100,
    CURRENT_SENSE_SATURATION: 0x00000400,
    CURRENT_LIMIT_VIOLATION: 0x00001000,
    MOTOR_THERMISTOR_OVER_TEMP: 0x00002000,
    FET_THERMISTOR_OVER_TEMP: 0x00004000,
    TIMER_UPDATE_MISSED: 0x00008000,
    CURRENT_MEASUREMENT_UNAVAILABLE: 0x00010000,
    UNKNOWN_PHASE_ESTIMATE: 0x00020000,
    UNKNOWN_PHASE_VEL: 0x00040000,
    UNKNOWN_TORQUE: 0x00080000,
    UNKNOWN_CURRENT_COMMAND: 0x00100000,
    UNKNOWN_CURRENT_MEASUREMENT: 0x00200000,
    UNKNOWN_VBUS_VOLTAGE: 0x00400000,
    UNKNOWN_VOLTAGE_COMMAND: 0x00800000,
    UNKNOWN_GAINS: 0x01000000,
    CONTROLLER_INITIALIZING: 0x02000000
  },

  // Encoder Errors
  ENCODER: {
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
    HALL_NOT_CALIBRATED_YET: 0x00000200
  }
}

/**
 * Error descriptions organized by type
 */
const ERROR_DESCRIPTIONS = {
  SYSTEM: {
    [ErrorCodes.SYSTEM.CONTROL_ITERATION_MISSED]: 'Control iteration missed',
    [ErrorCodes.SYSTEM.DC_BUS_UNDER_VOLTAGE]: 'DC bus under voltage',
    [ErrorCodes.SYSTEM.DC_BUS_OVER_VOLTAGE]: 'DC bus over voltage',
    [ErrorCodes.SYSTEM.DC_BUS_OVER_REGEN_CURRENT]: 'DC bus over regen current',
    [ErrorCodes.SYSTEM.DC_BUS_OVER_CURRENT]: 'DC bus over current',
    [ErrorCodes.SYSTEM.BRAKE_DEADTIME_VIOLATION]: 'Brake deadtime violation',
    [ErrorCodes.SYSTEM.BRAKE_DUTY_CYCLE_NAN]: 'Brake duty cycle NaN',
    [ErrorCodes.SYSTEM.INVALID_BRAKE_RESISTANCE]: 'Invalid brake resistance'
  },
  
  AXIS: {
    [ErrorCodes.AXIS.INVALID_STATE]: 'Invalid state',
    [ErrorCodes.AXIS.MOTOR_FAILED]: 'Motor failed',
    [ErrorCodes.AXIS.SENSORLESS_ESTIMATOR_FAILED]: 'Sensorless estimator failed',
    [ErrorCodes.AXIS.ENCODER_FAILED]: 'Encoder failed',
    [ErrorCodes.AXIS.CONTROLLER_FAILED]: 'Controller failed',
    [ErrorCodes.AXIS.OVER_TEMP]: 'Over temperature',
    [ErrorCodes.AXIS.UNKNOWN_POSITION]: 'Unknown position',
    [ErrorCodes.AXIS.ESTOP_REQUESTED]: 'Emergency stop requested',
    [ErrorCodes.AXIS.SPINOUT_DETECTED]: 'Spinout detected',
    [ErrorCodes.AXIS.BRAKE_RESISTOR_DISARMED]: 'Brake resistor disarmed',
    [ErrorCodes.AXIS.THERMISTOR_DISCONNECTED]: 'Thermistor disconnected',
    [ErrorCodes.AXIS.CALIBRATION_ERROR]: 'Calibration error'
  },
  
  MOTOR: {
    [ErrorCodes.MOTOR.PHASE_RESISTANCE_OUT_OF_RANGE]: 'Phase resistance out of range',
    [ErrorCodes.MOTOR.PHASE_INDUCTANCE_OUT_OF_RANGE]: 'Phase inductance out of range',
    [ErrorCodes.MOTOR.DRV_FAULT]: 'DRV fault',
    [ErrorCodes.MOTOR.CONTROL_DEADLINE_MISSED]: 'Control deadline missed',
    [ErrorCodes.MOTOR.NOT_IMPLEMENTED_MOTOR_TYPE]: 'Motor type not implemented',
    [ErrorCodes.MOTOR.BRAKE_CURRENT_OUT_OF_RANGE]: 'Brake current out of range',
    [ErrorCodes.MOTOR.MODULATION_MAGNITUDE]: 'Modulation magnitude error',
    [ErrorCodes.MOTOR.BRAKE_DEADTIME_VIOLATION]: 'Brake deadtime violation',
    [ErrorCodes.MOTOR.CURRENT_SENSE_SATURATION]: 'Current sense saturation',
    [ErrorCodes.MOTOR.CURRENT_LIMIT_VIOLATION]: 'Current limit violation',
    [ErrorCodes.MOTOR.MOTOR_THERMISTOR_OVER_TEMP]: 'Motor thermistor over temp',
    [ErrorCodes.MOTOR.FET_THERMISTOR_OVER_TEMP]: 'FET thermistor over temp',
    [ErrorCodes.MOTOR.TIMER_UPDATE_MISSED]: 'Timer update missed',
    [ErrorCodes.MOTOR.CURRENT_MEASUREMENT_UNAVAILABLE]: 'Current measurement unavailable',
    [ErrorCodes.MOTOR.CONTROLLER_INITIALIZING]: 'Controller initializing'
  },
  
  ENCODER: {
    [ErrorCodes.ENCODER.UNSTABLE_GAIN]: 'Encoder gain unstable',
    [ErrorCodes.ENCODER.CPR_POLEPAIRS_MISMATCH]: 'CPR/pole pairs mismatch',
    [ErrorCodes.ENCODER.NO_RESPONSE]: 'No encoder response',
    [ErrorCodes.ENCODER.UNSUPPORTED_ENCODER_MODE]: 'Unsupported encoder mode',
    [ErrorCodes.ENCODER.ILLEGAL_HALL_STATE]: 'Illegal hall state',
    [ErrorCodes.ENCODER.INDEX_NOT_FOUND_YET]: 'Index not found yet',
    [ErrorCodes.ENCODER.ABS_SPI_TIMEOUT]: 'Absolute encoder SPI timeout',
    [ErrorCodes.ENCODER.ABS_SPI_COM_FAIL]: 'Absolute encoder SPI communication failed',
    [ErrorCodes.ENCODER.ABS_SPI_NOT_READY]: 'Absolute encoder SPI not ready',
    [ErrorCodes.ENCODER.HALL_NOT_CALIBRATED_YET]: 'Hall sensor not calibrated yet'
  }
}

/**
 * Decode error code to human readable message
 * @param {number} errorCode - Error code to decode
 * @param {string} errorType - Type of error ('SYSTEM', 'AXIS', 'MOTOR', 'ENCODER')
 * @returns {string} Human readable error message
 */
export const decodeError = (errorCode, errorType = 'AXIS') => {
  const code = safeNumber(errorCode, 0)
  
  if (code === 0) {
    return 'No errors'
  }

  const descriptions = ERROR_DESCRIPTIONS[errorType] || ERROR_DESCRIPTIONS.AXIS
  const errorMessages = []

  // Check each bit flag
  Object.entries(descriptions).forEach(([errorValue, description]) => {
    const value = parseInt(errorValue)
    if ((code & value) === value && value !== 0) {
      errorMessages.push(description)
    }
  })

  if (errorMessages.length === 0) {
    return `Unknown error (0x${code.toString(16).toUpperCase().padStart(8, '0')})`
  }

  return errorMessages.join('; ')
}

/**
 * Check if an error is critical
 * @param {number} errorCode - Error code to check
 * @param {string} errorType - Type of error
 * @returns {boolean} True if error is critical
 */
export const isErrorCritical = (errorCode, errorType = 'AXIS') => {
  const code = safeNumber(errorCode, 0)
  if (code === 0) return false

  const criticalErrors = {
    SYSTEM: [
      ErrorCodes.SYSTEM.DC_BUS_OVER_VOLTAGE,
      ErrorCodes.SYSTEM.DC_BUS_OVER_CURRENT,
      ErrorCodes.SYSTEM.BRAKE_DEADTIME_VIOLATION
    ],
    AXIS: [
      ErrorCodes.AXIS.MOTOR_FAILED,
      ErrorCodes.AXIS.ENCODER_FAILED,
      ErrorCodes.AXIS.CONTROLLER_FAILED,
      ErrorCodes.AXIS.OVER_TEMP,
      ErrorCodes.AXIS.ESTOP_REQUESTED
    ],
    MOTOR: [
      ErrorCodes.MOTOR.DRV_FAULT,
      ErrorCodes.MOTOR.CURRENT_LIMIT_VIOLATION,
      ErrorCodes.MOTOR.MOTOR_THERMISTOR_OVER_TEMP,
      ErrorCodes.MOTOR.FET_THERMISTOR_OVER_TEMP,
      ErrorCodes.MOTOR.CURRENT_SENSE_SATURATION
    ],
    ENCODER: [
      ErrorCodes.ENCODER.CPR_POLEPAIRS_MISMATCH,
      ErrorCodes.ENCODER.NO_RESPONSE
    ]
  }

  const criticals = criticalErrors[errorType] || []
  return criticals.some(criticalError => (code & criticalError) === criticalError)
}

/**
 * Get error color for UI display
 * @param {number} errorCode - Error code
 * @param {string} errorType - Error type
 * @returns {string} Color for UI ('green', 'orange', 'red')
 */
export const getErrorColor = (errorCode, errorType = 'AXIS') => {
  const code = safeNumber(errorCode, 0)
  if (code === 0) return 'green'
  if (isErrorCritical(code, errorType)) return 'red'
  return 'orange'
}

// Legacy exports for compatibility
export const AxisError = ErrorCodes.AXIS
export const MotorError = ErrorCodes.MOTOR  
export const EncoderError = ErrorCodes.ENCODER
export const ODriveError = ErrorCodes.SYSTEM