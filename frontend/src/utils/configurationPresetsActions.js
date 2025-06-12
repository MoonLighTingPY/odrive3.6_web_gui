/**
 * Configuration Preset Actions
 * API actions for applying presets and managing preset operations with ODrive
 */

import { 
  saveCurrentConfigAsPreset, 
  loadPresetConfig, 
  exportPresetsToFile,
  importPresetsFromFile 
} from './configurationPresetsManager'
import { executeConfigAction } from './configurationActions'
import { generateConfigCommands } from './configCommandGenerator'

/**
 * Save current ODrive configuration as a preset
 * @param {Object} deviceConfig - Current device configuration from ODrive
 * @param {string} presetName - Name for the new preset
 * @param {string} description - Optional description
 * @param {Function} toast - Toast notification function
 * @returns {Promise<Object>} The saved preset
 */
export const saveCurrentConfigAsPresetAction = async (deviceConfig, presetName, description = '', toast) => {
  try {
    if (!presetName || presetName.trim() === '') {
      throw new Error('Preset name is required')
    }

    if (Object.keys(deviceConfig).length === 0 || 
        !deviceConfig.power || !deviceConfig.motor || !deviceConfig.encoder) {
      throw new Error('Device configuration is incomplete. Please ensure ODrive is connected and configuration is loaded.')
    }

    const preset = saveCurrentConfigAsPreset(deviceConfig, presetName.trim(), description)

    toast({
      title: 'Preset Saved',
      description: `Configuration saved as "${presetName}"`,
      status: 'success',
      duration: 3000,
    })

    return preset
  } catch (error) {
    toast({
      title: 'Save Preset Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    throw error
  }
}

/**
 * Load and apply a preset configuration to ODrive
 * @param {string} presetName - Name of preset to load
 * @param {boolean} applyToDevice - Whether to apply to ODrive device immediately
 * @param {Function} toast - Toast notification function
 * @returns {Promise<Object>} The loaded configuration
 */
export const loadPresetConfigAction = async (presetName, applyToDevice = false, toast) => {
  try {
    const config = loadPresetConfig(presetName)
    
    if (!config) {
      throw new Error(`Preset "${presetName}" not found`)
    }

    if (applyToDevice) {
      // Generate commands and apply to ODrive
      const commands = generateConfigCommands(config)
      
      toast({
        title: 'Applying Preset',
        description: `Loading "${presetName}" configuration to ODrive...`,
        status: 'info',
        duration: 2000,
      })

      await executeConfigAction('apply', { commands })

      toast({
        title: 'Preset Applied',
        description: `Configuration "${presetName}" applied to ODrive`,
        status: 'success',
        duration: 3000,
      })
    } else {
      toast({
        title: 'Preset Loaded',
        description: `Configuration "${presetName}" loaded (not yet applied to ODrive)`,
        status: 'info',
        duration: 3000,
      })
    }

    return config
  } catch (error) {
    toast({
      title: 'Load Preset Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    throw error
  }
}

/**
 * Apply preset configuration and save to ODrive non-volatile memory
 * @param {string} presetName - Name of preset to apply
 * @param {Function} toast - Toast notification function
 * @returns {Promise<Object>} The applied configuration
 */
export const applyPresetAndSaveAction = async (presetName, toast) => {
  try {
    const config = loadPresetConfig(presetName)
    
    if (!config) {
      throw new Error(`Preset "${presetName}" not found`)
    }

    // Generate commands and apply to ODrive
    const commands = generateConfigCommands(config)
    
    toast({
      title: 'Applying Preset',
      description: `Applying "${presetName}" configuration...`,
      status: 'info',
      duration: 2000,
    })

    // Apply configuration
    await executeConfigAction('apply', { commands })

    toast({
      title: 'Saving Configuration',
      description: 'Saving to non-volatile memory...',
      status: 'info',
      duration: 2000,
    })

    // Save to non-volatile memory
    await executeConfigAction('save')

    toast({
      title: 'Preset Applied & Saved',
      description: `Configuration "${presetName}" applied and saved to ODrive`,
      status: 'success',
      duration: 5000,
    })

    return config
  } catch (error) {
    toast({
      title: 'Apply Preset Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    throw error
  }
}

/**
 * Export presets to file
 * @param {string|Array<string>|null} presetNames - Preset name(s) to export or null for all
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>}
 */
export const exportPresetsAction = async (presetNames, toast) => {
  try {
    exportPresetsToFile(presetNames)

    const exportDescription = presetNames === null 
      ? 'All presets exported'
      : typeof presetNames === 'string'
      ? `Preset "${presetNames}" exported`
      : `${presetNames.length} presets exported`

    toast({
      title: 'Export Successful',
      description: exportDescription,
      status: 'success',
      duration: 3000,
    })
  } catch (error) {
    toast({
      title: 'Export Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    throw error
  }
}

/**
 * Import presets from file
 * @param {File} file - File to import
 * @param {boolean} overwriteExisting - Whether to overwrite existing presets
 * @param {Function} toast - Toast notification function
 * @returns {Promise<Object>} Import results
 */
export const importPresetsAction = async (file, overwriteExisting = false, toast) => {
  try {
    toast({
      title: 'Importing Presets',
      description: 'Processing preset file...',
      status: 'info',
      duration: 2000,
    })

    const results = await importPresetsFromFile(file, overwriteExisting)

    let resultMessage = `Imported: ${results.imported}`
    if (results.overwritten > 0) {
      resultMessage += `, Overwritten: ${results.overwritten}`
    }
    if (results.skipped > 0) {
      resultMessage += `, Skipped: ${results.skipped}`
    }
    if (results.errors.length > 0) {
      resultMessage += `, Errors: ${results.errors.length}`
    }

    toast({
      title: 'Import Complete',
      description: resultMessage,
      status: results.errors.length > 0 ? 'warning' : 'success',
      duration: 5000,
    })

    return results
  } catch (error) {
    toast({
      title: 'Import Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    throw error
  }
}

/**
 * Compare current device configuration with a preset
 * @param {Object} deviceConfig - Current device configuration
 * @param {string} presetName - Preset to compare with
 * @returns {Object} Comparison results showing differences
 */
export const compareConfigWithPreset = (deviceConfig, presetName) => {
  const presetConfig = loadPresetConfig(presetName)
  
  if (!presetConfig) {
    throw new Error(`Preset "${presetName}" not found`)
  }

  const differences = {}
  const sections = ['power', 'motor', 'encoder', 'control', 'interface']

  sections.forEach(section => {
    const deviceSection = deviceConfig[section] || {}
    const presetSection = presetConfig[section] || {}
    
    const sectionDiffs = {}
    
    // Check all keys from both configs
    const allKeys = new Set([
      ...Object.keys(deviceSection),
      ...Object.keys(presetSection)
    ])

    allKeys.forEach(key => {
      const deviceValue = deviceSection[key]
      const presetValue = presetSection[key]
      
      if (deviceValue !== presetValue) {
        sectionDiffs[key] = {
          current: deviceValue,
          preset: presetValue,
          changed: deviceValue !== undefined && presetValue !== undefined,
          added: deviceValue === undefined && presetValue !== undefined,
          removed: deviceValue !== undefined && presetValue === undefined
        }
      }
    })

    if (Object.keys(sectionDiffs).length > 0) {
      differences[section] = sectionDiffs
    }
  })

  return {
    presetName,
    hasDifferences: Object.keys(differences).length > 0,
    differences,
    totalChanges: Object.values(differences).reduce((total, section) => 
      total + Object.keys(section).length, 0)
  }
}