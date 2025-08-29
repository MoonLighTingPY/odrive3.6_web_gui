/**
 * Registry Manager - Manages version-specific ODrive registries
 * 
 * This system automatically creates and manages the appropriate registry
 * based on the detected firmware version of the connected ODrive.
 */

import { createRegistryForVersion } from './odriveUnifiedRegistry'
import { setPathResolverConfig } from './odrivePathResolver'

class RegistryManager {
  constructor() {
    this.currentVersion = null
    this.currentRegistry = null
  }

  /**
   * Parse version string to get major.minor format
   */
  parseVersion(versionString) {
    if (!versionString || typeof versionString !== 'string') {
      return '0.5.6'
    }
    
    // Remove 'v' prefix if present
    const cleanVersion = versionString.replace(/^v/, '')
    const parts = cleanVersion.split('.').map(Number)
    
    const major = parts[0] || 0
    const minor = parts[1] || 5
    
    // For 0.6.x versions, use 0.6.11 registry
    if (major === 0 && minor >= 6) {
      return '0.6.11'
    }
    
    // For 0.5.x and earlier versions, use 0.5.6 registry
    return '0.5.6'
  }

  getRegistryForVersion(normalizedVersion) {
    // Create a registry for the exact version to keep 0.6.10 vs 0.6.11 differences minimal
    return createRegistryForVersion(normalizedVersion)
  }

  /**
   * Set the current firmware version and switch registry
   */
  setCurrentVersion(versionString) {
    const normalizedVersion = this.parseVersion(versionString)
    if (this.currentVersion !== normalizedVersion) {
      console.log(`🔄 Registry Manager: Switching registry from ${this.currentVersion || 'none'} to ${normalizedVersion}`)
      this.currentVersion = normalizedVersion
      this.currentRegistry = this.getRegistryForVersion(normalizedVersion)

      // Also update the global path resolver configuration
      setPathResolverConfig(normalizedVersion, 'odrv0', 0)

      console.log(`📊 New registry stats:`, {
        firmwareVersion: normalizedVersion,
        totalParams: Object.values(this.currentRegistry.configCategories).reduce((sum, params) => sum + params.length, 0),
        batchPathsCount: this.currentRegistry.batchPaths.length,
      })
    }
  }

  getCurrentRegistry() {
    return this.currentRegistry || this.getRegistryForVersion('0.5.6')
  }

  clearCurrentRegistry() {
    this.currentVersion = null
    this.currentRegistry = null
  }
}

// Export singleton instance
export const registryManager = new RegistryManager()

// Export the current active registry (removing unused exports that cause lint errors)
export const getCurrentRegistry = () => registryManager.getCurrentRegistry()
export const setRegistryVersion = (version) => registryManager.setCurrentVersion(version)
export const clearRegistry = () => registryManager.clearCurrentRegistry()

// Registry proxy functions that use the current active registry
export const getBatchPaths = () => getCurrentRegistry().getBatchPaths()
export const getPropertyMappings = (category) => getCurrentRegistry().getPropertyMappings(category)
export const generateCommands = (category, config) => getCurrentRegistry().generateCommands(category, config)
export const generateAllCommands = (deviceConfig) => getCurrentRegistry().generateAllCommands(deviceConfig)
export const findParameter = (identifier) => getCurrentRegistry().findParameter(identifier)
export const getCategoryParameters = (category) => getCurrentRegistry().getCategoryParameters(category)
export const getParameterMetadata = (category, configKey) => getCurrentRegistry().getParameterMetadata(category, configKey)
export const validateConfig = (category, config) => getCurrentRegistry().validateConfig(category, config)
export const getConfigCategories = () => getCurrentRegistry().configCategories
export const getDebugInfo = () => ({
  manager: registryManager.getDebugInfo(),
  registry: getCurrentRegistry().getDebugInfo()
})

export default registryManager