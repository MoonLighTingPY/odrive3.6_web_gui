/**
 * Value Helper Utilities
 * Unified value processing system to eliminate repetitive parsing logic
 */

/**
 * Parse and validate any input value with intelligent type detection
 * @param {*} value - The raw input value
 * @param {Object} options - Parsing options
 * @param {string} options.type - Expected type ('number', 'boolean', 'string', 'auto')
 * @param {*} options.defaultValue - Default value for invalid input
 * @param {boolean} options.allowInfinity - Whether to allow Infinity values
 * @returns {*} Parsed and validated value
 */
export const parseValue = (value, options = {}) => {
  const { type = 'auto', defaultValue = null, allowInfinity = true } = options
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return defaultValue
  }

  // Handle string inputs
  if (typeof value === 'string') {
    const trimmed = value.trim()
    
    // Empty string
    if (trimmed === '') {
      return defaultValue
    }
    
    // Boolean strings
    if (type === 'boolean' || type === 'auto') {
      if (trimmed.toLowerCase() === 'true') return true
      if (trimmed.toLowerCase() === 'false') return false
    }
    
    // Number strings
    if (type === 'number' || type === 'auto') {
      if (!isNaN(trimmed) && trimmed !== '') {
        const parsed = parseFloat(trimmed)
        if (!allowInfinity && !isFinite(parsed)) {
          return defaultValue
        }
        return parsed
      }
    }
    
    // Return as string if type is string or couldn't parse as anything else
    return trimmed
  }
  
  // Handle number inputs
  if (typeof value === 'number') {
    if (!allowInfinity && !isFinite(value)) {
      return defaultValue
    }
    return type === 'boolean' ? Boolean(value) : value
  }
  
  // Handle boolean inputs
  if (typeof value === 'boolean') {
    return type === 'number' ? (value ? 1 : 0) : value
  }
  
  return value
}

/**
 * Safely format numbers and handle undefined values
 * @param {*} value - The value to format
 * @param {number} defaultValue - Default value if input is invalid
 * @returns {number} The safe value or default
 */
export const safeValue = (value, defaultValue = 0) => {
  return parseValue(value, { type: 'number', defaultValue, allowInfinity: false })
}

/**
 * Extract numeric value safely
 * @param {*} value - The value to extract number from
 * @param {number} defaultValue - Default if extraction fails
 * @returns {number} The numeric value
 */
export const safeNumber = (value, defaultValue = 0) => {
  return parseValue(value, { type: 'number', defaultValue })
}

/**
 * Format boolean values safely
 * @param {*} value - The value to format as boolean
 * @param {boolean} defaultValue - Default value if input is invalid
 * @returns {boolean} The safe boolean value or default
 */
export const safeBool = (value, defaultValue = false) => {
  return parseValue(value, { type: 'boolean', defaultValue })
}

/**
 * Safe string conversion
 * @param {*} value - The value to convert to string
 * @param {string} defaultValue - Default if conversion fails
 * @returns {string} The string value
 */
export const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) {
    return defaultValue
  }
  return String(value)
}

/**
 * Convert torque constant to Kv rating
 * @param {number} torqueConstant - The torque constant value
 * @returns {number} The Kv rating
 */
export const convertTorqueConstantToKv = (torqueConstant) => {
  if (torqueConstant > 0) {
    return 8.27 / torqueConstant
  }
  return 0
}

/**
 * Convert Kv rating to torque constant
 * @param {number} motorKv - The Kv rating
 * @returns {number} The torque constant
 */
export const convertKvToTorqueConstant = (motorKv) => {
  if (motorKv > 0) {
    return 8.27 / motorKv
  }
  return 0.0
}
