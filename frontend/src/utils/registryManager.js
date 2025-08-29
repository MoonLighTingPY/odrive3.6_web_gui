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
    this.registries = new Map() // Cache registries by version
    this.currentVersion = null
    this.currentRegistry = null
    
    // Create default 0.5.6 registry and initialize path resolver
    this.getRegistryForVersion('0.5.6')
    setPathResolverConfig('0.5.6', 'odrv0', 0)
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

  /**
   * Get or create registry for specific version
   */
  getRegistryForVersion(versionString) {
    const normalizedVersion = this.parseVersion(versionString)
    
    if (!this.registries.has(normalizedVersion)) {
      console.log(`Creating new registry for version ${normalizedVersion}`)
      const registry = createRegistryForVersion(normalizedVersion)
      this.registries.set(normalizedVersion, registry)
    }
    
    return this.registries.get(normalizedVersion)
  }

  /**
   * Set the current firmware version and switch registry
   */
  setCurrentVersion(versionString) {
    const normalizedVersion = this.parseVersion(versionString)
    
    if (this.currentVersion !== normalizedVersion) {
      console.log(`Switching registry from ${this.currentVersion} to ${normalizedVersion}`)
      this.currentVersion = normalizedVersion
      this.currentRegistry = this.getRegistryForVersion(normalizedVersion)
      
      // Also update the global path resolver configuration
      setPathResolverConfig(normalizedVersion, 'odrv0', 0)
    }
  }

  /**
   * Get the current active registry
   */
  getCurrentRegistry() {
    // Return default 0.5.6 registry if no version set
    if (!this.currentRegistry) {
      this.currentRegistry = this.getRegistryForVersion('0.5.6')
      this.currentVersion = '0.5.6'
    }
    
    return this.currentRegistry
  }

  /**
   * Get current version string
   */
  getCurrentVersion() {
    return this.currentVersion || '0.5.6'
  }

  /**
   * Clear current registry (on disconnect)
   */
  clearCurrentRegistry() {
    this.currentVersion = null
    this.currentRegistry = null
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      currentVersion: this.currentVersion,
      availableRegistries: Array.from(this.registries.keys()),
      registryCacheSize: this.registries.size,
      hasCurrentRegistry: !!this.currentRegistry
    }
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