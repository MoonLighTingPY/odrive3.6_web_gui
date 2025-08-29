/**
 * Simplified ODrive Registry
 * Streamlined registry system focused on essential functionality
 */

import { generateOdrivePropertyTree } from './odrivePropertyTree'
import { ODrivePathResolver, ODrivePathConfig } from './odrivePathResolver'

/**
 * Simplified ODrive Registry class
 * Eliminates complex mappings and redundant data structures
 */
class SimplifiedODriveRegistry {
  constructor(firmwareVersion = "0.5.6", deviceName = "odrv0", defaultAxis = 0) {
    this.firmwareVersion = firmwareVersion
    this.deviceName = deviceName  
    this.defaultAxis = defaultAxis
    this.pathResolver = new ODrivePathResolver(new ODrivePathConfig(firmwareVersion, deviceName, defaultAxis))
    
    // Initialize property tree as single source of truth
    this.propertyTree = generateOdrivePropertyTree(firmwareVersion)
    
    console.log('📝 Simplified ODrive Registry initialized:', {
      firmwareVersion: this.firmwareVersion,
      deviceName: this.deviceName,
      defaultAxis: this.defaultAxis
    })
  }

  /**
   * Update registry configuration
   */
  updateConfiguration(firmwareVersion, deviceName = "odrv0", defaultAxis = 0) {
    this.firmwareVersion = firmwareVersion
    this.deviceName = deviceName
    this.defaultAxis = defaultAxis
    this.pathResolver = new ODrivePathResolver(new ODrivePathConfig(firmwareVersion, deviceName, defaultAxis))
    
    // Regenerate property tree
    this.propertyTree = generateOdrivePropertyTree(firmwareVersion)
    
    console.log('📝 Registry updated:', { firmwareVersion, deviceName, defaultAxis })
  }

  /**
   * Get parameters for a specific category
   * @param {string} category - Category name
   * @returns {Array} Parameters for the category
   */
  getCategoryParameters(category) {
    const parameters = []
    
    this._traversePropertyTree((path, property) => {
      if (property.writable && this._inferCategory(path) === category) {
        parameters.push({
          path,
          property,
          configKey: this._pathToConfigKey(path),
          category
        })
      }
    })
    
    return parameters
  }

  /**
   * Get all batch paths for loading configuration
   * @returns {Array<string>} Array of paths for batch loading
   */
  getBatchPaths() {
    const paths = []
    
    this._traversePropertyTree((path, property) => {
      if (property.writable) {
        const apiPath = this.pathResolver.resolveToApiPath(path)
        if (apiPath) {
          paths.push(apiPath)
        }
      }
    })
    
    return paths
  }

  /**
   * Generate command for a path and value
   * @param {string} path - Property path
   * @param {*} value - Value to set
   * @param {number} axisNumber - Target axis
   * @returns {string} ODrive command
   */
  generateCommand(path, value, axisNumber = 0) {
    const apiPath = this.pathResolver.resolveToApiPath(path, axisNumber)
    return `${apiPath} = ${value}`
  }

  /**
   * Traverse property tree with callback
   * @param {Function} callback - Callback function (path, property)
   */
  _traversePropertyTree(callback) {
    const traverse = (node, currentPath = '') => {
      Object.entries(node).forEach(([key, value]) => {
        const fullPath = currentPath ? `${currentPath}.${key}` : key
        
        if (value && typeof value === 'object') {
          if (value.type !== undefined) {
            // This is a property
            callback(fullPath, value)
          } else {
            // This is a category, recurse
            traverse(value, fullPath)
          }
        }
      })
    }
    
    traverse(this.propertyTree)
  }

  /**
   * Infer category from path
   * @param {string} path - Property path
   * @returns {string} Category name
   */
  _inferCategory(path) {
    // System properties
    if (path.startsWith('system.') || path.includes('hw_version') || path.includes('fw_version')) {
      return 'system'
    }
    
    // Power/config properties  
    if (path.includes('config.') && (
        path.includes('voltage') || 
        path.includes('current') || 
        path.includes('brake_resistance') ||
        path.includes('enable_brake')
      )) {
      return 'power'
    }
    
    // Motor properties
    if (path.includes('motor') || path.includes('torque') || path.includes('pole_pairs')) {
      return 'motor'
    }
    
    // Encoder properties
    if (path.includes('encoder') || path.includes('cpr') || path.includes('offset')) {
      return 'encoder'
    }
    
    // Controller properties
    if (path.includes('controller') || path.includes('vel_') || path.includes('pos_')) {
      return 'control'
    }
    
    // Interface properties
    if (path.includes('can') || path.includes('gpio') || path.includes('uart')) {
      return 'interface'
    }
    
    return null
  }

  /**
   * Convert path to config key
   * @param {string} path - Property path
   * @returns {string} Config key
   */
  _pathToConfigKey(path) {
    const parts = path.split('.')
    return parts[parts.length - 1]
  }
}

// Singleton instance
let registryInstance = null

/**
 * Get the current registry instance
 * @returns {SimplifiedODriveRegistry}
 */
export const getCurrentRegistry = () => {
  if (!registryInstance) {
    registryInstance = new SimplifiedODriveRegistry()
  }
  return registryInstance
}

/**
 * Update the global registry configuration
 * @param {string} firmwareVersion - Firmware version
 * @param {string} deviceName - Device name  
 * @param {number} defaultAxis - Default axis
 */
export const updateRegistryConfiguration = (firmwareVersion, deviceName, defaultAxis) => {
  if (!registryInstance) {
    registryInstance = new SimplifiedODriveRegistry(firmwareVersion, deviceName, defaultAxis)
  } else {
    registryInstance.updateConfiguration(firmwareVersion, deviceName, defaultAxis)
  }
}

// Export legacy functions for compatibility
export const getBatchPaths = () => getCurrentRegistry().getBatchPaths()
export const getCategoryParameters = (category) => getCurrentRegistry().getCategoryParameters(category)
export const generateCommand = (path, value, axis) => getCurrentRegistry().generateCommand(path, value, axis)