/**
 * Simplified Command Generator
 * Core command generation functionality without bloat
 */

import { getPathResolver } from './odrivePathResolver'
import { parseValue } from './valueHelpers'

/**
 * Command Builder - simplified interface for generating ODrive commands
 */
export class CommandBuilder {
  constructor() {
    this.pathResolver = getPathResolver()
  }

  /**
   * Generate single command
   * @param {string} path - Property path
   * @param {*} value - Value to set
   * @param {number} axis - Target axis
   * @returns {string} ODrive command
   */
  single(path, value, axis = 0) {
    const processedValue = this._processValue(value)
    const apiPath = this.pathResolver.resolveToApiPath(path, axis)
    return `${apiPath} = ${processedValue}`
  }

  /**
   * Generate multiple commands from config object
   * @param {Object} config - Configuration object
   * @param {Array} parameters - Parameter definitions
   * @param {number} axis - Target axis
   * @returns {Array<string>} Array of commands
   */
  batch(config, parameters, axis = 0) {
    const commands = []
    
    parameters.forEach(param => {
      const value = config[param.configKey]
      if (value !== undefined && value !== null) {
        try {
          const command = this.single(param.path, value, axis)
          commands.push(command)
        } catch (error) {
          console.warn(`Skipping command for ${param.path}:`, error.message)
        }
      }
    })
    
    return commands
  }

  /**
   * Generate system commands
   * @returns {Array<string>} System commands
   */
  system() {
    const deviceName = this.pathResolver.config.deviceName
    return [
      `${deviceName}.clear_errors()`,
      `${deviceName}.save_configuration()`,
      `${deviceName}.reboot()`
    ]
  }

  /**
   * Generate calibration commands for axis
   * @param {number} axis - Target axis
   * @returns {Array<string>} Calibration commands  
   */
  calibration(axis = 0) {
    return [
      this.single('requested_state', 1, axis),  // Idle
      this.single('requested_state', 3, axis),  // Full calibration
      this.single('requested_state', 4, axis),  // Motor calibration
      this.single('requested_state', 8, axis),  // Closed loop control
    ]
  }

  /**
   * Process value for command generation
   * @param {*} value - Raw value
   * @returns {*} Processed value
   * @private
   */
  _processValue(value) {
    // Handle special cases
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False'
    }
    
    if (value === 'inf' || value === Infinity) {
      return 1000000 // Large number instead of infinity
    }
    
    if (typeof value === 'string') {
      return parseValue(value, { type: 'auto' })
    }
    
    return value
  }
}

// Singleton instance
let builderInstance = null

/**
 * Get command builder instance
 * @returns {CommandBuilder}
 */
export const getCommandBuilder = () => {
  if (!builderInstance) {
    builderInstance = new CommandBuilder()
  }
  return builderInstance
}

/**
 * Generate commands for a configuration category
 * @param {string} category - Configuration category
 * @param {Object} config - Configuration object  
 * @param {Array} parameters - Parameter definitions
 * @param {number} axis - Target axis
 * @returns {Array<string>} Generated commands
 */
export const generateCategoryCommands = (category, config, parameters, axis = 0) => {
  const builder = getCommandBuilder()
  return builder.batch(config, parameters, axis)
}

/**
 * Generate all commands from device configuration
 * @param {Object} deviceConfig - Complete device configuration
 * @param {Object} categoryParams - Parameter definitions by category
 * @returns {Object} Commands organized by category
 */
export const generateAllCommands = (deviceConfig, categoryParams) => {
  const builder = getCommandBuilder()
  const allCommands = {}

  // Generate category commands
  Object.entries(deviceConfig).forEach(([category, categoryConfig]) => {
    if (categoryConfig && categoryParams[category]) {
      // Handle axis-specific configurations
      if (categoryConfig.axis0 || categoryConfig.axis1) {
        allCommands[category] = []
        
        if (categoryConfig.axis0) {
          const axisCommands = builder.batch(categoryConfig.axis0, categoryParams[category], 0)
          allCommands[category].push(...axisCommands)
        }
        
        if (categoryConfig.axis1) {
          const axisCommands = builder.batch(categoryConfig.axis1, categoryParams[category], 1)
          allCommands[category].push(...axisCommands)
        }
      } else {
        // Non-axis specific configuration
        allCommands[category] = builder.batch(categoryConfig, categoryParams[category])
      }
    }
  })

  return allCommands
}

/**
 * Generate system commands
 * @returns {Array<string>} System commands
 */
export const generateSystemCommands = () => {
  const builder = getCommandBuilder()
  return builder.system()
}

/**
 * Generate calibration commands
 * @param {number} axis - Target axis
 * @returns {Array<string>} Calibration commands
 */
export const generateCalibrationCommands = (axis = 0) => {
  const builder = getCommandBuilder()
  return builder.calibration(axis)
}

/**
 * Generate single command
 * @param {string} path - Property path
 * @param {*} value - Value to set
 * @param {number} axis - Target axis
 * @returns {string} ODrive command
 */
export const generateSingleCommand = (path, value, axis = 0) => {
  const builder = getCommandBuilder()
  return builder.single(path, value, axis)
}

// Legacy exports for compatibility
export const generateCommand = generateSingleCommand
export const generatePowerCommands = (config, axis = 0) => generateCategoryCommands('power', config, null, axis)
export const generateMotorCommands = (config, axis = 0) => generateCategoryCommands('motor', config, null, axis)
export const generateEncoderCommands = (config, axis = 0) => generateCategoryCommands('encoder', config, null, axis)
export const generateControlCommands = (config, axis = 0) => generateCategoryCommands('control', config, null, axis)
export const generateInterfaceCommands = (config, axis = 0) => generateCategoryCommands('interface', config, null, axis)