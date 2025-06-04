/**
 * Configuration Presets Management
 * Handles saving, loading, importing, and exporting ODrive configuration presets
 */

/**
 * Save current device configuration as a preset
 * @param {Object} deviceConfig - Current device configuration
 * @param {string} presetName - Name for the preset
 * @param {string} description - Optional description
 * @returns {Object} The saved preset
 */
export const saveCurrentConfigAsPreset = (deviceConfig, presetName, description = '') => {
  const preset = {
    name: presetName,
    description,
    timestamp: new Date().toISOString(),
    version: '0.5.6',
    config: {
      power: { ...deviceConfig.power },
      motor: { ...deviceConfig.motor },
      encoder: { ...deviceConfig.encoder },
      control: { ...deviceConfig.control },
      interface: { ...deviceConfig.interface }
    }
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
  if (FACTORY_PRESETS[presetName]) {
    return FACTORY_PRESETS[presetName]
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
  const preset = getPreset(presetName) // This now includes factory presets
  return preset ? preset.config : null
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
 * Create a backup of current device configuration
 * This is called automatically when ODrive connects to ensure we have a safe fallback
 * @param {Object} deviceConfig - Current device configuration
 * @returns {Object} The backup preset
 */
export const createAutoBackup = (deviceConfig) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')
  const backupName = `auto_backup_${timestamp[0]}_${timestamp[1].split('.')[0]}`
  
  return saveCurrentConfigAsPreset(
    deviceConfig, 
    backupName, 
    'Automatic backup created when ODrive connected'
  )
}

/**
 * Clean up old auto backups (keep only last 10)
 * @returns {number} Number of backups cleaned up
 */
export const cleanupAutoBackups = () => {
  const presets = getStoredPresets()
  const autoBackups = Object.entries(presets)
    .filter(([name]) => name.startsWith('auto_backup_'))
    .sort(([, a], [, b]) => new Date(b.timestamp) - new Date(a.timestamp))

  let cleanedUp = 0
  
  // Keep only the 10 most recent auto backups
  autoBackups.slice(10).forEach(([name]) => {
    delete presets[name]
    cleanedUp++
  })

  if (cleanedUp > 0) {
    localStorage.setItem('odrive_config_presets', JSON.stringify(presets))
  }

  return cleanedUp
}

/**
 * Factory presets for common motor configurations
 * These are built-in presets that users can access
 */
export const FACTORY_PRESETS = {
  'High Current Motor - D6374 150KV': {
    name: 'High Current Motor - D6374 150KV',
    description: 'Preset for D6374 high current motor with 150KV rating',
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '0.5.6',
    isFactory: true,
    config: {
      power: {
        dc_bus_overvoltage_trip_level: 56.0,
        dc_bus_undervoltage_trip_level: 10.0,
        dc_max_positive_current: 10.0,
        dc_max_negative_current: -10.0,
        brake_resistance: 2.0,
        brake_resistor_enabled: true
      },
      motor: {
        motor_type: 0, // HIGH_CURRENT
        pole_pairs: 7,
        motor_kv: 150,
        current_lim: 40.0,
        calibration_current: 10.0,
        resistance_calib_max_voltage: 12.0,
        lock_in_spin_current: 10.0,
        phase_resistance: 0.0,
        phase_inductance: 0.0
      },
      encoder: {
        encoder_type: 1, // INCREMENTAL
        cpr: 4000,
        bandwidth: 1000,
        use_index: false,
        calib_range: 0.02,
        calib_scan_distance: 16384,
        calib_scan_omega: 12.566
      },
      control: {
        control_mode: 3, // POSITION_CONTROL
        input_mode: 1, // PASSTHROUGH
        vel_limit: 10.0,
        pos_gain: 1.0,
        vel_gain: 0.1,
        vel_integrator_gain: 0.01,
        vel_limit_tolerance: 1.2,
        vel_ramp_rate: 10.0,
        torque_ramp_rate: 0.01,
        circular_setpoints: false,
        inertia: 0.0,
        input_filter_bandwidth: 2.0
      },
      interface: {
        can_node_id: 0,
        can_node_id_extended: false,
        can_baudrate: 250000,
        can_heartbeat_rate_ms: 100,
        enable_can: false,
        uart_baudrate: 115200,
        enable_uart: false,
        gpio1_mode: 0,
        gpio2_mode: 0,
        gpio3_mode: 0,
        gpio4_mode: 0,
        enable_watchdog: false,
        watchdog_timeout: 0.0,
        enable_step_dir: false,
        step_dir_always_on: false,
        enable_sensorless: false
      }
    }
  },
  'Gimbal Motor - GBM2804 100KV': {
    name: 'Gimbal Motor - GBM2804 100KV',
    description: 'Preset for GBM2804 gimbal motor with 100KV rating',
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '0.5.6',
    isFactory: true,
    config: {
      power: {
        dc_bus_overvoltage_trip_level: 56.0,
        dc_bus_undervoltage_trip_level: 10.0,
        dc_max_positive_current: 10.0,
        dc_max_negative_current: -10.0,
        brake_resistance: 2.0,
        brake_resistor_enabled: false
      },
      motor: {
        motor_type: 1, // GIMBAL
        pole_pairs: 7,
        motor_kv: 100,
        current_lim: 5.0,
        calibration_current: 1.0,
        resistance_calib_max_voltage: 4.0,
        lock_in_spin_current: 1.0,
        phase_resistance: 12.0,
        phase_inductance: 0.0
      },
      encoder: {
        encoder_type: 1, // INCREMENTAL
        cpr: 4000,
        bandwidth: 1000,
        use_index: false,
        calib_range: 0.02,
        calib_scan_distance: 16384,
        calib_scan_omega: 12.566
      },
      control: {
        control_mode: 3, // POSITION_CONTROL
        input_mode: 1, // PASSTHROUGH
        vel_limit: 20.0,
        pos_gain: 1.0,
        vel_gain: 0.228,
        vel_integrator_gain: 0.228,
        vel_limit_tolerance: 1.2,
        vel_ramp_rate: 10.0,
        torque_ramp_rate: 0.01,
        circular_setpoints: false,
        inertia: 0.0,
        input_filter_bandwidth: 2.0
      },
      interface: {
        can_node_id: 0,
        can_node_id_extended: false,
        can_baudrate: 250000,
        can_heartbeat_rate_ms: 100,
        enable_can: false,
        uart_baudrate: 115200,
        enable_uart: false,
        gpio1_mode: 0,
        gpio2_mode: 0,
        gpio3_mode: 0,
        gpio4_mode: 0,
        enable_watchdog: false,
        watchdog_timeout: 0.0,
        enable_step_dir: false,
        step_dir_always_on: false,
        enable_sensorless: false
      }
    }
  }
}

/**
 * Get factory presets combined with user presets
 * @returns {Object} All available presets
 */
export const getAllAvailablePresets = () => {
  const userPresets = getStoredPresets()
  return { ...FACTORY_PRESETS, ...userPresets }
}

/**
 * Check if a preset is a factory preset
 * @param {string} presetName - Name of preset to check
 * @returns {boolean} Whether it's a factory preset
 */
export const isFactoryPreset = (presetName) => {
  return Object.prototype.hasOwnProperty.call(FACTORY_PRESETS, presetName)
}

/**
 * Check if presets should be available (dev mode or connected)
 * @returns {boolean} Whether presets functionality should be enabled
 */
export const shouldShowPresets = () => {
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
  return isDevelopment // Always show in dev mode, regardless of connection
}