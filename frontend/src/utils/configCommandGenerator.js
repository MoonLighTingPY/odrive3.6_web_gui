/**
 * Configuration Command Generator - Now powered by Unified Registry
 * 
 * This file now uses the unified registry as the single source of truth
 * for all command generation, eliminating duplication.
 */

import { generateCommands, generateAllCommands, odriveRegistry } from './odriveUnifiedRegistry'

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
  return generateAllCommands(config)
}

/**
 * Generate power configuration commands only
 * @param {Object} powerConfig - Power configuration object
 * @returns {Array<string>} Array of power-related ODrive commands
 */
export const generatePowerCommands = (powerConfig = {}) => {
  return generateCommands('power', powerConfig)
}

/**
 * Generate motor configuration commands only
 * @param {Object} motorConfig - Motor configuration object
 * @returns {Array<string>} Array of motor-related ODrive commands
 */
export const generateMotorCommands = (motorConfig = {}) => {
  return generateCommands('motor', motorConfig)
}

/**
 * Generate encoder configuration commands only
 * @param {Object} encoderConfig - Encoder configuration object
 * @returns {Array<string>} Array of encoder-related ODrive commands
 */
export const generateEncoderCommands = (encoderConfig = {}) => {
  return generateCommands('encoder', encoderConfig)
}

/**
 * Generate control configuration commands only
 * @param {Object} controlConfig - Control configuration object
 * @returns {Array<string>} Array of control-related ODrive commands
 */
export const generateControlCommands = (controlConfig = {}) => {
  return generateCommands('control', controlConfig)
}

/**
 * Generate interface configuration commands only
 * @param {Object} interfaceConfig - Interface configuration object
 * @returns {Array<string>} Array of interface-related ODrive commands
 */
export const generateInterfaceCommands = (interfaceConfig = {}) => {
  return generateCommands('interface', interfaceConfig)
}

/**
 * Generate save and reboot commands
 * @returns {Array<string>} Array of save and reboot commands
 */
export const generateSaveAndRebootCommands = () => {
  return [
    'odrv0.save_configuration()',
    'odrv0.reboot()'
  ]
}

/**
 * Get parameter metadata for validation and UI rendering
 * @param {string} category - Configuration category
 * @param {string} configKey - Configuration key
 * @returns {Object|null} Parameter metadata or null if not found
 */
export const getParameterMetadata = (category, configKey) => {
  return odriveRegistry.getParameterMetadata(category, configKey)
}

/**
 * Validate configuration values against parameter constraints
 * @param {string} category - Configuration category
 * @param {Object} config - Configuration object to validate
 * @returns {Array<string>} Array of validation error messages
 */
export const validateConfiguration = (category, config) => {
  return odriveRegistry.validateConfig(category, config)
}

/**
 * Get all parameters for a category with their metadata
 * @param {string} category - Configuration category
 * @returns {Array<Object>} Array of parameter objects with metadata
 */
export const getCategoryParameters = (category) => {
  return odriveRegistry.getCategoryParameters(category)
}

/**
 * Preview commands that would be generated without executing them
 * @param {Object} config - Full configuration object
 * @returns {Object} Preview object with commands by category
 */
export const previewCommands = (config) => {
  const preview = {
    power: generatePowerCommands(config.power),
    motor: generateMotorCommands(config.motor),
    encoder: generateEncoderCommands(config.encoder),
    control: generateControlCommands(config.control),
    interface: generateInterfaceCommands(config.interface),
    saveAndReboot: generateSaveAndRebootCommands()
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