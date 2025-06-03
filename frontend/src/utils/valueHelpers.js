/**
 * Value Helper Utilities
 * Shared helper functions for safely handling values and conversions
 */

/**
 * Safely format numbers and handle undefined values
 * @param {*} value - The value to format
 * @param {number} defaultValue - Default value if input is invalid
 * @returns {number} The safe value or default
 */
export const safeValue = (value, defaultValue = 0) => {
  if (value === undefined || value === null || isNaN(value)) {
    return defaultValue
  }
  return value
}

/**
 * Format boolean values safely
 * @param {*} value - The value to format as boolean
 * @param {boolean} defaultValue - Default value if input is invalid
 * @returns {boolean} The safe boolean value or default
 */
export const safeBool = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue
  }
  return Boolean(value)
}

/**
 * Convert torque constant to Kv rating
 * @param {number} torqueConstant - The torque constant value
 * @returns {number} The Kv rating
 */
export const convertTorqueConstantToKv = (torqueConstant) => {
  if (torqueConstant > 0) {
    return 60 / (2 * Math.PI * torqueConstant)
  }
  return 230
}

/**
 * Convert Kv rating to torque constant
 * @param {number} motorKv - The Kv rating
 * @returns {number} The torque constant
 */
export const convertKvToTorqueConstant = (motorKv) => {
  if (motorKv > 0) {
    return 60 / (2 * Math.PI * motorKv)
  }
  return 0.04
}
