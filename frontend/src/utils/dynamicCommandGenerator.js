/**
 * ODrive Command Generator
 * 
 * Dynamic, version-aware command generation using the path resolver system.
 * Eliminates hardcoded device names, axis references, and firmware-specific logic.
 */

import { generateCommand, getPathResolver, isPropertySupported, getCompatiblePath } from './odrivePathResolver'
import { convertKvToTorqueConstant } from './valueHelpers'

/**
 * Generate configuration commands for a category
 * @param {string} category - Configuration category (power, motor, encoder, control, interface)
 * @param {Object} config - Configuration object
 * @param {Object} categoryParams - Parameter definitions for the category  
 * @param {number} axisNumber - Target axis number (0 or 1)
 * @returns {Array<string>} Array of ODrive command strings
 */
export const generateCategoryCommands = (category, config, categoryParams, axisNumber = 0) => {
  const commands = []
  
  if (!config || !categoryParams) return commands
  
  // Remove axisNumber from config to avoid treating it as a parameter
  const { axisNumber: _, ...configWithoutAxis } = config
  
  categoryParams.forEach(param => {
    const value = configWithoutAxis[param.configKey]
    if (value !== undefined && value !== null) {
      
      // Skip non-config parameters
      const skip = ['calib_anticogging', 'anticogging_valid', 'autotuning_phase', 'endstop_state', 'temperature']
      if (skip.some(skipItem => param.path.includes(skipItem))) return

      // Check if property is supported in current firmware version
      if (!isPropertySupported(param.path)) {
        console.warn(`Property ${param.path} not supported in current firmware version, skipping`)
        return
      }

      let commandValue = value
      
      // Handle special value conversions
      if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
        commandValue = convertKvToTorqueConstant(value)
      } else if (param.property.type === 'boolean') {
        commandValue = value ? 'True' : 'False'
      } else if (param.configKey === 'torque_lim' && (value === 'inf' || value === Infinity)) {
        commandValue = 1000000
      }

      // Use path resolver to generate command with correct axis
      const logicalPath = getCompatiblePath(param.path)
      const command = generateCommand(logicalPath, commandValue, axisNumber)
      commands.push(command)
    }
  })
  
  return commands
}

/**
 * Generate commands for all configuration categories
 * @param {Object} deviceConfig - Complete device configuration object
 * @param {Object} categoryParams - All category parameter definitions
 * @returns {Object} Commands organized by category
 */
export const generateAllCategoryCommands = (deviceConfig, categoryParams) => {
  const allCommands = {
    power: [],
    motor: [],
    encoder: [],
    control: [],
    interface: []
  }

  Object.entries(deviceConfig).forEach(([category, categoryConfig]) => {
    if (categoryConfig && Object.keys(categoryConfig).length > 0 && categoryParams[category]) {
      // Handle axis-specific configs
      if (categoryConfig.axis0 || categoryConfig.axis1) {
        // Generate commands for each axis
        if (categoryConfig.axis0) {
          const axisCommands = generateCategoryCommands(category, categoryConfig.axis0, categoryParams[category], 0)
          allCommands[category].push(...axisCommands)
        }
        if (categoryConfig.axis1) {
          const axisCommands = generateCategoryCommands(category, categoryConfig.axis1, categoryParams[category], 1)
          allCommands[category].push(...axisCommands)
        }
      } else {
        // Generate commands for default axis or device-level config
        const defaultAxis = categoryConfig.axisNumber || 0
        const commands = generateCategoryCommands(category, categoryConfig, categoryParams[category], defaultAxis)
        allCommands[category].push(...commands)
      }
    }
  })

  return allCommands
}

/**
 * Generate system-level commands (reboot, save config, etc.)
 * @returns {Array<string>} Array of system command strings
 */
export const generateSystemCommands = () => {
  const pathResolver = getPathResolver()
  const deviceName = pathResolver.config.deviceName

  return [
    `${deviceName}.reboot()`,
    `${deviceName}.save_configuration()`,
    `${deviceName}.erase_configuration()`,
    `${deviceName}.clear_errors()`
  ]
}

/**
 * Generate calibration commands for an axis
 * @param {number} axisNumber - Target axis (0 or 1)
 * @returns {Array<string>} Array of calibration command strings
 */
export const generateCalibrationCommands = (axisNumber = 0) => {
  // Use path resolver to generate axis-specific commands
  return [
    generateCommand('requested_state', 1, axisNumber),  // Idle
    generateCommand('requested_state', 3, axisNumber),  // Full calibration
    generateCommand('requested_state', 4, axisNumber),  // Motor calibration 
    generateCommand('requested_state', 6, axisNumber),  // Encoder index search
    generateCommand('requested_state', 7, axisNumber),  // Encoder offset calibration
    generateCommand('requested_state', 8, axisNumber),  // Closed loop control
    generateCommand('requested_state', 10, axisNumber), // Encoder direction find
  ]
}

/**
 * Generate save and reboot commands
 * @returns {Array<string>} Array of save/reboot command strings  
 */
export const generateSaveAndRebootCommands = () => {
  const pathResolver = getPathResolver()
  const deviceName = pathResolver.config.deviceName

  return [
    `${deviceName}.save_configuration()`,
    `${deviceName}.reboot()`
  ]
}

/**
 * Generate a single command for a property
 * @param {string} logicalPath - Logical property path
 * @param {any} value - Value to set
 * @param {number} axisNumber - Target axis (optional)
 * @returns {string} Command string
 */
export const generateSingleCommand = (logicalPath, value, axisNumber = null) => {
  if (!isPropertySupported(logicalPath)) {
    throw new Error(`Property ${logicalPath} not supported in current firmware version`)
  }
  
  const compatiblePath = getCompatiblePath(logicalPath)
  return generateCommand(compatiblePath, value, axisNumber)
}

/**
 * Preview all commands that would be generated
 * @param {Object} deviceConfig - Complete device configuration
 * @param {Object} categoryParams - Category parameter definitions  
 * @returns {Object} Preview with commands organized by category
 */
export const previewAllCommands = (deviceConfig, categoryParams) => {
  const categoryCommands = generateAllCategoryCommands(deviceConfig, categoryParams)
  const systemCommands = generateSystemCommands()
  const saveAndRebootCommands = generateSaveAndRebootCommands()
  
  const preview = {
    ...categoryCommands,
    system: systemCommands,
    saveAndReboot: saveAndRebootCommands
  }

  const totalCommands = Object.values(preview).reduce((sum, commands) => sum + commands.length, 0)

  return {
    ...preview,
    summary: {
      totalCommands,
      categoryCounts: Object.fromEntries(
        Object.entries(preview).map(([category, commands]) => [category, commands.length])
      )
    }
  }
}

/**
 * Validate that all properties in a configuration are supported
 * @param {Object} config - Configuration object to validate
 * @param {Object} categoryParams - Parameter definitions
 * @returns {Array<string>} Array of validation warning messages
 */
export const validateConfigurationSupport = (config, categoryParams) => {
  const warnings = []
  
  Object.entries(config).forEach(([category, categoryConfig]) => {
    if (categoryConfig && categoryParams[category]) {
      categoryParams[category].forEach(param => {
        if (!isPropertySupported(param.path)) {
          warnings.push(`Property ${param.path} in ${category} category is not supported in current firmware version`)
        }
      })
    }
  })
  
  return warnings
}

// Legacy compatibility exports (maintain existing API)
export const generatePowerCommands = (config, axisNumber = 0) => 
  generateCategoryCommands('power', config, null, axisNumber)

export const generateMotorCommands = (config, axisNumber = 0) =>
  generateCategoryCommands('motor', config, null, axisNumber)

export const generateEncoderCommands = (config, axisNumber = 0) =>
  generateCategoryCommands('encoder', config, null, axisNumber)

export const generateControlCommands = (config, axisNumber = 0) =>
  generateCategoryCommands('control', config, null, axisNumber)

export const generateInterfaceCommands = (config, axisNumber = 0) =>
  generateCategoryCommands('interface', config, null, axisNumber)