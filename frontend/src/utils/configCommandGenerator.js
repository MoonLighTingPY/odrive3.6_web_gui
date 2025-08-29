/**
 * Generate all configuration commands for ODrive (version-aware)
 * 
 * REPLACED: This file now uses the new dynamicCommandGenerator.js
 * which provides version-aware, device-configurable command generation.
 * 
 * @deprecated Use dynamicCommandGenerator.js instead
 */

import { 
  generateCategoryCommands,
  generateAllCategoryCommands,
  previewAllCommands
} from './dynamicCommandGenerator'

import { getCurrentRegistry } from './odriveUnifiedRegistry'

// Legacy compatibility exports - redirect to new dynamic system
export const generatePowerCommands = (powerConfig = {}, axisNumber = 0) => {
  const registry = getCurrentRegistry()
  const categoryParams = registry.getCategoryParameters('power')
  return generateCategoryCommands('power', powerConfig, categoryParams, axisNumber)
}

export const generateMotorCommands = (motorConfig = {}, axisNumber = 0) => {
  const registry = getCurrentRegistry()
  const categoryParams = registry.getCategoryParameters('motor') 
  return generateCategoryCommands('motor', motorConfig, categoryParams, axisNumber)
}

export const generateEncoderCommands = (encoderConfig = {}, axisNumber = 0) => {
  const registry = getCurrentRegistry()
  const categoryParams = registry.getCategoryParameters('encoder')
  return generateCategoryCommands('encoder', encoderConfig, categoryParams, axisNumber)  
}

export const generateControlCommands = (controlConfig = {}, axisNumber = 0) => {
  const registry = getCurrentRegistry()
  const categoryParams = registry.getCategoryParameters('control')
  return generateCategoryCommands('control', controlConfig, categoryParams, axisNumber)
}

export const generateInterfaceCommands = (interfaceConfig = {}, axisNumber = 0) => {
  const registry = getCurrentRegistry()
  const categoryParams = registry.getCategoryParameters('interface')
  return generateCategoryCommands('interface', interfaceConfig, categoryParams, axisNumber)
}

// Re-export all other functions from the new system
export {
  generateAllCategoryCommands,
  generateSystemCommands,
  generateCalibrationCommands, 
  generateSaveAndRebootCommands,
  generateSingleCommand,
  previewAllCommands,
  validateConfigurationSupport
} from './dynamicCommandGenerator'

// Legacy method names for compatibility
export const generateAllCommands = generateAllCategoryCommands
export const previewCommands = previewAllCommands

// Keep existing functions that don't have hardcoded device references
export const getParameterMetadata = (category, configKey) => {
  const registry = getCurrentRegistry()
  return registry.getParameterMetadata(category, configKey)
}

export const validateConfiguration = (category, config) => {
  const registry = getCurrentRegistry()
  return registry.validateConfig(category, config)
}

export const getCategoryParameters = (category) => {
  const registry = getCurrentRegistry()
  return registry.getCategoryParameters(category)
}
export const generateConfigCommands = (deviceConfig) => {
  const registry = getCurrentRegistry()
  return registry.generateAllCommands(deviceConfig)
}