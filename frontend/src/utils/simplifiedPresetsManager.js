/**
 * Simplified Configuration Presets Management
 * Streamlined preset operations with minimal complexity
 */

import { FACTORY_PRESET_BASES, getFactoryPreset, generateFullConfig } from './factoryPresets'

const STORAGE_KEY = 'odrive_config_presets'

/**
 * Preset storage operations - unified interface
 */
class PresetStorage {
  static get() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading presets from localStorage:', error)
      return {}
    }
  }

  static set(presets) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
      return true
    } catch (error) {
      console.error('Error saving presets to localStorage:', error)
      return false
    }
  }

  static update(name, preset) {
    const presets = this.get()
    presets[name] = preset
    return this.set(presets)
  }

  static remove(name) {
    const presets = this.get()
    delete presets[name]
    return this.set(presets)
  }
}

/**
 * Create a preset from device configuration
 * @param {Object} deviceConfig - Device configuration
 * @param {string} name - Preset name
 * @param {string} description - Preset description
 * @returns {Object} Created preset
 */
export const createPreset = (deviceConfig, name, description = '') => {
  const preset = {
    name: name.trim(),
    description: description.trim(),
    timestamp: new Date().toISOString(),
    version: '0.5.6',
    config: generateFullConfig(deviceConfig)
  }

  PresetStorage.update(name, preset)
  return preset
}

/**
 * Get all presets (user + factory)
 * @returns {Object} All available presets
 */
export const getAllPresets = () => {
  const userPresets = PresetStorage.get()
  const factoryPresets = {}

  // Add factory presets
  Object.keys(FACTORY_PRESET_BASES).forEach(name => {
    factoryPresets[name] = getFactoryPreset(name)
  })

  return { ...factoryPresets, ...userPresets }
}

/**
 * Get specific preset by name
 * @param {string} name - Preset name
 * @returns {Object|null} Preset or null if not found
 */
export const getPreset = (name) => {
  // Check factory presets first
  if (FACTORY_PRESET_BASES[name]) {
    return getFactoryPreset(name)
  }
  
  // Check user presets
  const userPresets = PresetStorage.get()
  return userPresets[name] || null
}

/**
 * Delete a user preset
 * @param {string} name - Preset name
 * @returns {boolean} Success status
 */
export const deletePreset = (name) => {
  if (isFactoryPreset(name)) {
    throw new Error('Cannot delete factory presets')
  }
  
  return PresetStorage.remove(name)
}

/**
 * Update existing preset
 * @param {string} oldName - Current preset name
 * @param {string} newName - New preset name
 * @param {string} description - New description
 * @returns {Object} Updated preset
 */
export const updatePreset = (oldName, newName, description = '') => {
  if (isFactoryPreset(oldName)) {
    throw new Error('Cannot edit factory presets')
  }

  const presets = PresetStorage.get()
  const original = presets[oldName]
  
  if (!original) {
    throw new Error(`Preset "${oldName}" not found`)
  }

  const updated = {
    ...original,
    name: newName.trim(),
    description: description.trim(),
    timestamp: new Date().toISOString()
  }

  // Handle name change
  if (oldName !== newName) {
    PresetStorage.remove(oldName)
  }
  
  PresetStorage.update(newName, updated)
  return updated
}

/**
 * Export presets to JSON
 * @param {Array<string>} presetNames - Names of presets to export
 * @returns {string} JSON string of presets
 */
export const exportPresets = (presetNames) => {
  const presets = {}
  
  presetNames.forEach(name => {
    const preset = getPreset(name)
    if (preset) {
      presets[name] = preset
    }
  })

  return JSON.stringify({ 
    version: '1.0',
    exported: new Date().toISOString(),
    presets 
  }, null, 2)
}

/**
 * Import presets from JSON
 * @param {string} jsonData - JSON string of presets
 * @returns {Array<string>} Names of imported presets
 */
export const importPresets = (jsonData) => {
  try {
    const data = JSON.parse(jsonData)
    const imported = []

    if (data.presets && typeof data.presets === 'object') {
      Object.entries(data.presets).forEach(([name, preset]) => {
        if (preset && preset.config) {
          // Validate preset structure
          if (typeof preset.name === 'string' && preset.config) {
            PresetStorage.update(name, preset)
            imported.push(name)
          }
        }
      })
    }

    return imported
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`)
  }
}

/**
 * Check if preset is a factory preset
 * @param {string} name - Preset name
 * @returns {boolean} True if factory preset
 */
export const isFactoryPreset = (name) => {
  return Object.prototype.hasOwnProperty.call(FACTORY_PRESET_BASES, name)
}

/**
 * Get user presets only
 * @returns {Object} User presets
 */
export const getUserPresets = () => {
  return PresetStorage.get()
}

/**
 * Get factory presets only
 * @returns {Object} Factory presets
 */
export const getFactoryPresets = () => {
  const factoryPresets = {}
  Object.keys(FACTORY_PRESET_BASES).forEach(name => {
    factoryPresets[name] = getFactoryPreset(name)
  })
  return factoryPresets
}

// Legacy exports for compatibility  
export const saveCurrentConfigAsPreset = createPreset
export const getStoredPresets = getUserPresets