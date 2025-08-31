/**
 * Version selection utility for dynamically choosing between 0.5.x and 0.6.x variants
 * This utility helps components select the appropriate utilities based on firmware version
 */

// Import both versions of utilities
import { odriveRegistry } from './odriveUnifiedRegistry.js'
import { odriveRegistry06 } from './odriveUnifiedRegistry_0_6.js'

import { usePropertyRefresh } from '../hooks/property-tree/usePropertyRefresh.js'
import { usePropertyRefresh06 } from '../hooks/property-tree/usePropertyRefresh_0_6.js'

import { usePropertyEditor } from '../hooks/property-tree/usePropertyEditor.js'
import { usePropertyEditor06 } from '../hooks/property-tree/usePropertyEditor_0_6.js'

import * as configCommandGenerator from './configCommandGenerator.js'
import * as configCommandGenerator06 from './configCommandGenerator_0_6.js'

import * as configParameterGrouping from './configParameterGrouping.js'
import * as configParameterGrouping06 from './configParameterGrouping_0_6.js'

import { odrivePropertyTree } from './odrivePropertyTree.js'
import { odrivePropertyTree06 } from './odrivePropertyTree_0_6.js'

import { generateAxisTree } from './odriveAxisTree.js'
import { generateAxisTree06 } from './odriveAxisTree_0_6.js'

/**
 * Get the appropriate unified registry based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Object} The appropriate registry
 */
export const getUnifiedRegistry = (is0_6 = false) => {
  return is0_6 ? odriveRegistry06 : odriveRegistry
}

/**
 * Get the appropriate property refresh hook based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Function} The appropriate hook
 */
export const getPropertyRefreshHook = (is0_6 = false) => {
  return is0_6 ? usePropertyRefresh06 : usePropertyRefresh
}

/**
 * Get the appropriate property editor hook based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Function} The appropriate hook
 */
export const getPropertyEditorHook = (is0_6 = false) => {
  return is0_6 ? usePropertyEditor06 : usePropertyEditor
}

/**
 * Get the appropriate config command generator based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Object} The appropriate command generator module
 */
export const getConfigCommandGenerator = (is0_6 = false) => {
  return is0_6 ? configCommandGenerator06 : configCommandGenerator
}

/**
 * Get the appropriate parameter grouping utilities based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Object} The appropriate parameter grouping module
 */
export const getConfigParameterGrouping = (is0_6 = false) => {
  return is0_6 ? configParameterGrouping06 : configParameterGrouping
}

/**
 * Get the appropriate property tree based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Object} The appropriate property tree
 */
export const getPropertyTree = (is0_6 = false) => {
  return is0_6 ? odrivePropertyTree06 : odrivePropertyTree
}

/**
 * Get the appropriate axis tree generator based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Function} The appropriate axis tree generator
 */
export const getAxisTreeGenerator = (is0_6 = false) => {
  return is0_6 ? generateAxisTree06 : generateAxisTree
}

/**
 * Helper function to get category parameters with version awareness
 * @param {string} category - The category name (power, motor, encoder, control, interface)
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Array} Array of parameters for the category
 */
export const getCategoryParametersVersioned = (category, is0_6 = false) => {
  const registry = getUnifiedRegistry(is0_6)
  const categories = registry.getConfigCategories()
  return categories[category] || []
}

/**
 * Helper function to generate config commands with version awareness
 * @param {Object} config - Configuration object
 * @param {number|null} axisNumber - Axis number or null for both axes
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Array<string>} Array of ODrive commands
 */
export const generateConfigCommandsVersioned = (config, axisNumber = 0, is0_6 = false) => {
  const commandGen = getConfigCommandGenerator(is0_6)
  return commandGen.generateConfigCommands(config, axisNumber)
}

/**
 * Get the appropriate parameter grouping utilities based on firmware version
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Object} Object containing grouping functions
 */
export const getParameterGroupingFunctions = (is0_6 = false) => {
  const grouping = getConfigParameterGrouping(is0_6)
  return {
    getParameterGroup: grouping.getParameterGroup,
    getParameterSubgroup: grouping.getParameterSubgroup,
    getParameterImportance: grouping.getParameterImportance,
    getParametersByImportance: grouping.getParametersByImportance,
    getGroupedAdvancedParameters: grouping.getGroupedAdvancedParameters
  }
}

/**
 * Get version-specific debug info
 * @param {boolean} is0_6 - Whether the firmware is 0.6.x
 * @returns {Object} Debug information
 */
export const getVersionDebugInfo = (is0_6 = false) => {
  const registry = getUnifiedRegistry(is0_6)
  return registry.getDebugInfo()
}

/**
 * Helper to detect firmware version from device state
 * @param {Object} deviceState - Redux device state
 * @returns {Object} Version info object
 */
export const getVersionInfo = (deviceState) => {
  const { fw_is_0_6, fw_is_0_5, fw_version_string, fw_version_major, fw_version_minor } = deviceState
  
  return {
    is0_6: fw_is_0_6,
    is0_5: fw_is_0_5,
    versionString: fw_version_string,
    major: fw_version_major,
    minor: fw_version_minor,
    displayName: fw_is_0_6 ? '0.6.x' : (fw_is_0_5 ? '0.5.x' : 'Unknown')
  }
}

/**
 * React hook to get version-aware utilities
 * Usage: const { registry, commandGen, grouping, propertyTree } = useVersionedUtils()
 */
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export const useVersionedUtils = () => {
  const { fw_is_0_6 } = useSelector(state => state.device)
  
  return useMemo(() => {
    const registry = getUnifiedRegistry(fw_is_0_6)
    const commandGen = getConfigCommandGenerator(fw_is_0_6)
    const grouping = getConfigParameterGrouping(fw_is_0_6)
    const propertyTree = getPropertyTree(fw_is_0_6)
    const axisTreeGen = getAxisTreeGenerator(fw_is_0_6)
    
    return {
      is0_6: fw_is_0_6,
      registry,
      commandGen,
      grouping,
      propertyTree,
      axisTreeGen,
      versionName: fw_is_0_6 ? '0.6.x' : '0.5.x'
    }
  }, [fw_is_0_6])
}