/**
 * Configuration Presets Management
 * Handles saving, loading, importing, and exporting ODrive configuration presets
 */

import { FACTORY_PRESET_BASES, getFactoryPreset, generateFullConfig } from './factoryPresets'
import { odriveRegistry } from './odriveUnifiedRegistry'

/**
 * Save current device configuration as a preset with all writable parameters
 * @param {Object} deviceConfig - Current device configuration
 * @param {string} presetName - Name for the preset
 * @param {string} description - Optional description
 * @returns {Object} The saved preset
 */
export const saveCurrentConfigAsPreset = (deviceConfig, presetName, description = '') => {
  // Use the actual device config, but ensure all categories exist
  const fullConfig = {
    power: deviceConfig.power || {},
    motor: deviceConfig.motor || {},
    encoder: deviceConfig.encoder || {},
    control: deviceConfig.control || {},
    interface: deviceConfig.interface || {}
  }

  // Only add missing parameters with defaults if we have some real data
  const hasRealData = Object.values(fullConfig).some(category =>
    Object.keys(category).length > 0
  )

  if (hasRealData) {
    // Merge with full parameter set but keep existing values
    const completeConfig = generateFullConfig(deviceConfig)

    // Preserve actual values over defaults
    Object.keys(fullConfig).forEach(category => {
      if (fullConfig[category] && Object.keys(fullConfig[category]).length > 0) {
        fullConfig[category] = {
          ...completeConfig[category], // defaults first
          ...fullConfig[category]      // actual values override
        }
      } else {
        fullConfig[category] = completeConfig[category]
      }
    })
  }

  const preset = {
    name: presetName,
    description,
    timestamp: new Date().toISOString(),
    version: '0.5.6',
    config: fullConfig
  }

  // Get existing presets from localStorage
  const existingPresets = getStoredPresets()

  // Add new preset (or overwrite existing one with same name)
  const updatedPresets = {
    ...existingPresets,
    [presetName]: preset
  }

  // Save to localStorage
  localStorage.setItem('odrive_config_presets', JSON.stringify(updatedPresets))

  return preset
}

/**
 * Get all stored presets from localStorage
 * @returns {Object} All stored presets
 */
export const getStoredPresets = () => {
  try {
    const stored = localStorage.getItem('odrive_config_presets')
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading presets from localStorage:', error)
    return {}
  }
}

/**
 * Get a specific preset by name (includes factory presets)
 * @param {string} presetName - Name of the preset
 * @returns {Object|null} The preset or null if not found
 */
export const getPreset = (presetName) => {
  // First check factory presets
  if (FACTORY_PRESET_BASES[presetName]) {
    return getFactoryPreset(presetName)
  }
  // Then check user presets
  const userPresets = getStoredPresets()
  return userPresets[presetName] || null
}

/**
 * Delete a preset from localStorage (cannot delete factory presets)
 * @param {string} presetName - Name of the preset to delete
 * @returns {boolean} Success status
 */
export const deletePreset = (presetName) => {
  // Cannot delete factory presets
  if (isFactoryPreset(presetName)) {
    throw new Error('Cannot delete factory presets')
  }

  try {
    const presets = getStoredPresets()
    delete presets[presetName]
    localStorage.setItem('odrive_config_presets', JSON.stringify(presets))
    return true
  } catch (error) {
    console.error('Error deleting preset:', error)
    return false
  }
}

/**
 * Update/edit an existing preset
 * @param {string} oldName - Current name of the preset
 * @param {string} newName - New name for the preset
 * @param {string} description - New description
 * @returns {Object} Updated preset
 */
export const updatePreset = (oldName, newName, description = '') => {
  // Cannot edit factory presets
  if (isFactoryPreset(oldName)) {
    throw new Error('Cannot edit factory presets')
  }

  try {
    const presets = getStoredPresets()
    const originalPreset = presets[oldName]

    if (!originalPreset) {
      throw new Error(`Preset "${oldName}" not found`)
    }

    // Create updated preset
    const updatedPreset = {
      ...originalPreset,
      name: newName.trim(),
      description: description.trim(),
      timestamp: new Date().toISOString() // Update timestamp
    }

    // If name changed, remove old entry
    if (oldName !== newName.trim()) {
      delete presets[oldName]
    }

    // Add updated preset
    presets[newName.trim()] = updatedPreset

    // Save to localStorage
    localStorage.setItem('odrive_config_presets', JSON.stringify(presets))

    return updatedPreset
  } catch (error) {
    console.error('Error updating preset:', error)
    throw error
  }
}

/**
 * Export preset(s) to downloadable JSON file
 * @param {string|Array<string>|null} presetNames - Specific preset name(s) or null for all
 * @returns {void} Triggers file download
 */
export const exportPresetsToFile = (presetNames = null) => {
  const allPresets = getAllAvailablePresets() // This includes factory presets
  let presetsToExport = {}

  if (presetNames === null) {
    // Export all presets (user presets only, not factory)
    presetsToExport = getStoredPresets()
  } else if (typeof presetNames === 'string') {
    // Export single preset
    if (allPresets[presetNames]) {
      presetsToExport[presetNames] = allPresets[presetNames]
    }
  } else if (Array.isArray(presetNames)) {
    // Export multiple presets
    presetNames.forEach(name => {
      if (allPresets[name]) {
        presetsToExport[name] = allPresets[name]
      }
    })
  }

  if (Object.keys(presetsToExport).length === 0) {
    throw new Error('No presets found to export')
  }

  const exportData = {
    exportInfo: {
      exportDate: new Date().toISOString(),
      odriveVersion: '0.5.6',
      guiVersion: '1.0.0',
      presetCount: Object.keys(presetsToExport).length
    },
    presets: presetsToExport
  }

  // Create and download file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = presetNames === null
    ? `odrive_presets_all_${timestamp}.json`
    : typeof presetNames === 'string'
      ? `odrive_preset_${presetNames}_${timestamp}.json`
      : `odrive_presets_selected_${timestamp}.json`

  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import presets from JSON file
 * @param {File} file - File object from file input
 * @param {boolean} overwriteExisting - Whether to overwrite existing presets with same names
 * @returns {Promise<Object>} Import results
 */
export const importPresetsFromFile = async (file, overwriteExisting = false) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    if (!file.name.endsWith('.json')) {
      reject(new Error('File must be a JSON file'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result)

        // Validate import data structure
        if (!importData.presets || typeof importData.presets !== 'object') {
          reject(new Error('Invalid preset file format'))
          return
        }

        const existingPresets = getStoredPresets()
        const importResults = {
          imported: 0,
          skipped: 0,
          overwritten: 0,
          errors: []
        }

        // Process each preset in the import file
        Object.entries(importData.presets).forEach(([presetName, presetData]) => {
          try {
            // Validate preset structure
            if (!presetData.config || typeof presetData.config !== 'object') {
              importResults.errors.push(`Invalid preset structure: ${presetName}`)
              return
            }

            const presetExists = existingPresets[presetName]

            if (presetExists && !overwriteExisting) {
              importResults.skipped++
              return
            }

            // Import the preset
            existingPresets[presetName] = {
              ...presetData,
              importDate: new Date().toISOString(),
              originalExportDate: presetData.timestamp
            }

            if (presetExists) {
              importResults.overwritten++
            } else {
              importResults.imported++
            }

          } catch (error) {
            importResults.errors.push(`Error processing preset ${presetName}: ${error.message}`)
          }
        })

        // Save updated presets to localStorage
        localStorage.setItem('odrive_config_presets', JSON.stringify(existingPresets))

        resolve(importResults)

      } catch (error) {
        reject(new Error(`Error parsing preset file: ${error.message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Load a preset configuration (includes factory presets)
 * @param {string} presetName - Name of preset to load
 * @returns {Object|null} Preset configuration or null if not found
 */
export const loadPresetConfig = (presetName) => {
  const preset = getPreset(presetName)
  console.log('[loadPresetConfig] presetName:', presetName, 'preset:', preset)
  if (!preset) return null
  // Ensure all sections exist
  const config = preset.config || {}
  console.log('[loadPresetConfig] config:', config)
  return {
    power: config.power || {},
    motor: config.motor || {},
    encoder: config.encoder || {},
    control: config.control || {},
    interface: config.interface || {},
  }
}

/**
 * Get preset metadata (name, description, timestamp, etc.)
 * @param {string} presetName - Name of preset
 * @returns {Object|null} Preset metadata or null if not found
 */
export const getPresetMetadata = (presetName) => {
  const preset = getPreset(presetName)
  if (!preset) return null

  return {
    name: preset.name,
    description: preset.description,
    timestamp: preset.timestamp,
    version: preset.version,
    importDate: preset.importDate,
    originalExportDate: preset.originalExportDate
  }
}

/**
 * List all available presets with metadata
 * @returns {Array<Object>} Array of preset metadata
 */
export const listAllPresets = () => {
  const allPresets = getAllAvailablePresets()
  return Object.keys(allPresets).map(name => ({
    ...getPresetMetadata(name),
    hasValidConfig: validatePresetConfig(allPresets[name].config)
  }))
}

/**
 * Validate preset configuration structure
 * @param {Object} config - Configuration to validate
 * @returns {boolean} Whether config is valid
 */
export const validatePresetConfig = (config) => {
  if (!config || typeof config !== 'object') return false

  const requiredSections = ['power', 'motor', 'encoder', 'control', 'interface']
  return requiredSections.every(section =>
    config[section] && typeof config[section] === 'object'
  )
}

/**
 * Get factory presets combined with user presets
 * @returns {Object} All available presets
 */
export const getAllAvailablePresets = () => {
  const userPresets = getStoredPresets()
  return { ...FACTORY_PRESET_BASES, ...userPresets }
}

/**
 * Check if a preset is a factory preset
 * @param {string} presetName - Name of preset to check
 * @returns {boolean} Whether it's a factory preset
 */
export const isFactoryPreset = (presetName) => {
  return Object.prototype.hasOwnProperty.call(FACTORY_PRESET_BASES, presetName)
}

/**
 * Check if presets should be available (dev mode or connected)
 * @returns {boolean} Whether presets functionality should be enabled
 */
export const shouldShowPresets = () => {
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
  return isDevelopment // Always show in dev mode, regardless of connection
}

/**
 * Get statistics about preset parameter coverage
 * @param {string} presetName - Name of preset to analyze
 * @returns {Object} Coverage statistics
 */
export const getPresetCoverage = (presetName) => {
  const preset = getPreset(presetName)
  if (!preset || !preset.config) {
    return { total: 0, covered: 0, percentage: 0, missing: [] }
  }

  const categories = odriveRegistry.getConfigCategories()
  let totalParams = 0
  let coveredParams = 0
  const missing = []

  Object.entries(categories).forEach(([category, parameters]) => {
    const presetCategory = preset.config[category] || {}

    parameters.forEach(param => {
      const metadata = odriveRegistry.getParameterMetadata(category, param.configKey)

      if (metadata && metadata.writable) {
        totalParams++
        if (presetCategory[param.configKey] !== undefined) {
          coveredParams++
        } else {
          missing.push(`${category}.${param.configKey}`)
        }
      }
    })
  })

  return {
    total: totalParams,
    covered: coveredParams,
    percentage: totalParams > 0 ? Math.round((coveredParams / totalParams) * 100) : 0,
    missing
  }
}

/**
 * Upgrade an existing preset to include all available parameters
 * @param {string} presetName - Name of preset to upgrade
 * @returns {Object} Upgraded preset
 */
export const upgradePreset = (presetName) => {
  const preset = getPreset(presetName)
  if (!preset) {
    throw new Error(`Preset "${presetName}" not found`)
  }

  // Generate full config using existing values as base
  const upgradedConfig = generateFullConfig(preset.config)

  const upgradedPreset = {
    ...preset,
    config: upgradedConfig,
    timestamp: new Date().toISOString(),
    upgraded: true,
    originalTimestamp: preset.timestamp
  }

  // Save upgraded preset (only for user presets)
  if (!isFactoryPreset(presetName)) {
    const existingPresets = getStoredPresets()
    existingPresets[presetName] = upgradedPreset
    localStorage.setItem('odrive_config_presets', JSON.stringify(existingPresets))
  }

  return upgradedPreset
}