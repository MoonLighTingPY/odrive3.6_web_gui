/**
 * Configuration Command Generator
 * Generates ODrive v0.5.6 configuration commands from configuration objects
 * 
 * NOTE: This file now imports from the central odriveRegistry.js to avoid duplication
 */

import { 
  generateConfigCommands as generateAllConfigCommands,
  generatePowerCommands as generatePowerCmds,
  generateMotorCommands as generateMotorCmds,
  generateEncoderCommands as generateEncoderCmds,
  generateControlCommands as generateControlCmds,
  generateInterfaceCommands as generateInterfaceCmds
} from './odriveRegistry'

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
  return generateAllConfigCommands(config)
}

/**
 * Generate power configuration commands only
 * @param {Object} powerConfig - Power configuration object
 * @returns {Array<string>} Array of power-related ODrive commands
 */
export const generatePowerCommands = (powerConfig = {}) => {
  return generatePowerCmds(powerConfig)
}

/**
 * Generate motor configuration commands only
 * @param {Object} motorConfig - Motor configuration object
 * @returns {Array<string>} Array of motor-related ODrive commands
 */
export const generateMotorCommands = (motorConfig = {}) => {
  return generateMotorCmds(motorConfig)
}

/**
 * Generate encoder configuration commands only
 * @param {Object} encoderConfig - Encoder configuration object
 * @returns {Array<string>} Array of encoder-related ODrive commands
 */
export const generateEncoderCommands = (encoderConfig = {}) => {
  return generateEncoderCmds(encoderConfig)
}

/**
 * Generate control configuration commands only
 * @param {Object} controlConfig - Control configuration object
 * @returns {Array<string>} Array of control-related ODrive commands
 */
export const generateControlCommands = (controlConfig = {}) => {
  return generateControlCmds(controlConfig)
}

/**
 * Generate interface configuration commands only
 * @param {Object} interfaceConfig - Interface configuration object
 * @returns {Array<string>} Array of interface-related ODrive commands
 */
export const generateInterfaceCommands = (interfaceConfig = {}) => {
  return generateInterfaceCmds(interfaceConfig)
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
