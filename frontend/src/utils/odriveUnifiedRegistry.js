/**
 * Unified ODrive Registry - Single Source of Truth
 * 
 * This system uses odrivePropertyTree as the master source and automatically
 * generates all other data structures (commands, batch paths, mappings, etc.)
 */

import { odrivePropertyTree } from './odrivePropertyTree'

class ODriveUnifiedRegistry {
  constructor() {
    this.propertyTree = odrivePropertyTree
    this.configCategories = this._generateConfigCategories()
    this.batchPaths = this._generateBatchPaths()
    this.propertyMappings = this._generatePropertyMappings()
    this.commandGenerators = this._generateCommandGenerators()
    
    console.log('ODrive Unified Registry initialized:', {
      categories: Object.keys(this.configCategories),
      totalParams: Object.values(this.configCategories).reduce((sum, params) => sum + params.length, 0),
      batchPathsCount: this.batchPaths.length
    })
  }

  // Auto-generate configuration categories from property tree
  _generateConfigCategories() {
    const categories = { power: [], motor: [], encoder: [], control: [], interface: [] }
    
    this._traversePropertyTree((path, property) => {
      if (property.writable) {
        const category = this._inferCategory(path)
        if (category) {
          const param = {
            path,
            property,
            odriveCommand: this._pathToODriveCommand(path),
            configKey: this._pathToConfigKey(path),
            name: property.name,
            description: property.description,
            type: property.type,
            min: property.min,
            max: property.max,
            step: property.step,
            decimals: property.decimals,
            hasSlider: property.hasSlider,
            isSetpoint: property.isSetpoint
          }
          categories[category].push(param)
        }
      }
    })
    
    return categories
  }

  // Auto-generate batch loading paths
  _generateBatchPaths() {
    const paths = []
    
    this._traversePropertyTree((path, property) => {
      if (property.writable && this._isConfigParameter(path)) {
        const odriveCommand = this._pathToODriveCommand(path)
        const fullPath = `device.${odriveCommand}`
        paths.push(fullPath)
      }
    })
    
    return paths
  }

  // Helper method to traverse property tree
  _traversePropertyTree(callback, node = this.propertyTree, basePath = '') {
    if (!node) return
    
    // Handle the ROOT LEVEL specially - it contains the main sections as direct properties
    if (basePath === '' && !node.properties && !node.children) {
      Object.entries(node).forEach(([sectionName, sectionNode]) => {
        if (typeof sectionNode === 'object' && sectionNode !== null) {
          this._traversePropertyTree(callback, sectionNode, sectionName)
        }
      })
      return
    }
    
    // Process direct properties
    if (node.properties) {
      Object.entries(node.properties).forEach(([propName, prop]) => {
        const fullPath = basePath ? `${basePath}.${propName}` : propName
        callback(fullPath, prop)
      })
    }
    
    // Recursively process children
    if (node.children) {
      Object.entries(node.children).forEach(([childName, childNode]) => {
        const childPath = basePath ? `${basePath}.${childName}` : childName
        this._traversePropertyTree(callback, childNode, childPath)
      })
    }
  }

  _generatePropertyMappings() {
    const mappings = { power: {}, motor: {}, encoder: {}, control: {}, interface: {} }
    
    Object.entries(this.configCategories).forEach(([category, params]) => {
      params.forEach(param => {
        mappings[category][param.configKey] = param.odriveCommand
      })
    })
    
    return mappings
  }

  _generateCommandGenerators() {
    const generators = {}
    
    Object.entries(this.configCategories).forEach(([category, params]) => {
      generators[category] = (config) => {
        const commands = []
        params.forEach(param => {
          const value = config[param.configKey]
          if (value !== undefined && value !== null) {
            // Skip problematic parameters that might be read-only or require special handling
            const skipParameters = [
              'calib_anticogging',           // Anticogging calibration trigger
              'anticogging_valid',           // Read-only status
              'autotuning_phase',            // Read-only status
              'endstop_state',               // Read-only status
              'temperature'                  // Read-only sensor value
            ]
            
            const paramKey = param.path.split('.').pop()
            if (skipParameters.includes(paramKey)) {
              return
            }
            
            // Handle boolean values
            if (param.property.type === 'boolean') {
              commands.push(`odrv0.${param.odriveCommand} = ${value ? 'True' : 'False'}`)
            } else {
              commands.push(`odrv0.${param.odriveCommand} = ${value}`)
            }
          }
        })
        return commands
      }
    })
    
    return generators
  }

  // Helper methods
  _inferCategory(path) {
    // Smart category inference based on path patterns
    if (path.includes('motor.config') || 
        path.includes('motor_thermistor') ||
        path.includes('calibration_lockin') ||
        path.includes('general_lockin') ||
        path.includes('sensorless_ramp')) {
      return 'motor'
    }
    
    if (path.includes('encoder.config')) {
      return 'encoder'
    }
    
    if (path.includes('controller.config') || 
        path.includes('trap_traj.config') ||
        path.includes('autotuning.')) {
      return 'control'
    }
    
    if (path.includes('can.') || 
        path.includes('uart') || 
        path.includes('gpio') ||
        path.includes('enable_watchdog') ||
        path.includes('watchdog_timeout') ||
        path.includes('enable_step_dir') ||
        path.includes('step_dir_') ||
        path.includes('enable_sensorless_mode') ||
        path.includes('startup_') ||
        path.includes('endstop.config') ||
        path.includes('mechanical_brake.config') ||
        path.includes('sensorless_estimator.config') ||
        path.includes('enable_can_') ||
        path.includes('enable_i2c_')) {
      return 'interface'
    }
    
    if (path.includes('config.dc_') || 
        path.includes('config.brake_') || 
        path.includes('config.enable_brake_') ||
        path.includes('config.max_regen_current') ||
        path.includes('config.enable_dc_bus_') ||
        path.includes('config.test_') ||
        path.includes('config.usb_') ||
        path.includes('fet_thermistor')) {
      return 'power'
    }
    
    // Special case for requested_state - this is a control parameter
    if (path.includes('requested_state')) {
      return 'control'
    }
    
    return null
  }

  _pathToODriveCommand(path) {
    // Convert property tree path to ODrive command path
    if (path.startsWith('config.')) {
      return path
    }
    
    if (path.startsWith('system.')) {
      return path.replace(/^system\./, 'config.')
    }
    
    if (path.startsWith('can.')) {
      return path
    }
    
    if (path.startsWith('axis0.')) {
      return path
    }
    
    return path
  }

  _pathToConfigKey(path) {
    // Convert path to config key used in UI
    const parts = path.split('.')
    const lastPart = parts[parts.length - 1]
    
    // Handle special mappings for UI consistency
    const specialMappings = {
      'mode': path.includes('encoder') ? 'encoder_type' : 'mode',
      'enable_brake_resistor': 'brake_resistor_enabled',
      'torque_constant': 'motor_kv',
      'current': path.includes('calibration_lockin') ? 'lock_in_spin_current' : 'current',
      'node_id': 'can_node_id',
      'is_extended': 'can_node_id_extended',
      'baud_rate': 'can_baudrate',
      'enable_sensorless_mode': 'enable_sensorless',
      
      // Thermistor mappings
      'temp_limit_lower': path.includes('fet_thermistor') ? 'fet_temp_limit_lower' : 
                          path.includes('motor_thermistor') ? 'motor_temp_limit_lower' : 'temp_limit_lower',
      'temp_limit_upper': path.includes('fet_thermistor') ? 'fet_temp_limit_upper' : 
                          path.includes('motor_thermistor') ? 'motor_temp_limit_upper' : 'temp_limit_upper',
      'enabled': path.includes('fet_thermistor') ? 'fet_thermistor_enabled' :
                 path.includes('motor_thermistor') ? 'motor_thermistor_enabled' : 'enabled',
      'gpio_pin': path.includes('motor_thermistor') ? 'motor_thermistor_gpio_pin' : 'gpio_pin'
    }
    
    return specialMappings[lastPart] || lastPart
  }

  _isConfigParameter(path) {
    // Determine if this is a configuration parameter (not just status/telemetry)
    const nonConfigPaths = [
      'error', 'current_state', 'pos_estimate', 'vel_estimate', 'temperature',
      'is_ready', 'index_found', 'shadow_count', 'count_in_cpr', 'interpolation',
      'phase', 'pos_estimate_counts', 'pos_circular', 'pos_cpr_counts',
      'delta_pos_cpr_counts', 'hall_state', 'vel_estimate_counts',
      'calib_scan_response', 'pos_abs', 'spi_error_rate', 'is_armed',
      'is_calibrated', 'current_meas_', 'DC_calib_', 'I_bus', 'phase_current_rev_gain',
      'effective_current_lim', 'max_allowed_current', 'max_dc_calib',
      'n_evt_', 'last_error_time', 'input_pos', 'input_vel', 'input_torque',
      'pos_setpoint', 'vel_setpoint', 'torque_setpoint', 'trajectory_done',
      'vel_integrator_torque', 'anticogging_valid', 'autotuning_phase',
      'mechanical_power', 'electrical_power', 'endstop_state',
      'calib_anticogging', 'calib_pos_threshold', 'calib_vel_threshold'
    ]
    
    return !nonConfigPaths.some(pattern => path.includes(pattern))
  }

  // Public API methods
  getBatchPaths() {
    return this.batchPaths || []
  }

  getPropertyMappings(category = null) {
    return category ? this.propertyMappings[category] : this.propertyMappings
  }

  generateCommands(category, config) {
    return this.commandGenerators[category]?.(config) || []
  }

  generateAllCommands(deviceConfig) {
    const allCommands = []
    Object.entries(deviceConfig).forEach(([category, config]) => {
      if (config && Object.keys(config).length > 0) {
        allCommands.push(...this.generateCommands(category, config))
      }
    })
    return allCommands
  }

  getConfigCategories() {
    return this.configCategories
  }

  findParameter(identifier) {
    // Search by path, config key, or ODrive command
    for (const [category, params] of Object.entries(this.configCategories)) {
      const found = params.find(p => 
        p.path === identifier || 
        p.configKey === identifier || 
        p.odriveCommand.includes(identifier)
      )
      if (found) return { ...found, category }
    }
    return null
  }

  getCategoryParameters(category) {
    return this.configCategories[category] || []
  }

  getParameterMetadata(category, configKey) {
    const params = this.configCategories[category] || []
    return params.find(p => p.configKey === configKey)
  }

  validateConfig(category, config) {
    const params = this.configCategories[category] || []
    const errors = []
    
    Object.entries(config).forEach(([key, value]) => {
      const param = params.find(p => p.configKey === key)
      if (param && value !== undefined && value !== null) {
        // Type validation
        if (param.property.type === 'number' && typeof value !== 'number') {
          errors.push(`${key}: Expected number, got ${typeof value}`)
        }
        if (param.property.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${key}: Expected boolean, got ${typeof value}`)
        }
        
        // Range validation
        if (param.property.type === 'number') {
          if (param.property.min !== undefined && value < param.property.min) {
            errors.push(`${key}: Value ${value} below minimum ${param.property.min}`)
          }
          if (param.property.max !== undefined && value > param.property.max) {
            errors.push(`${key}: Value ${value} above maximum ${param.property.max}`)
          }
        }
      }
    })
    
    return errors
  }

  getDebugInfo() {
    return {
      categories: Object.keys(this.configCategories),
      parameterCounts: Object.fromEntries(
        Object.entries(this.configCategories).map(([cat, params]) => [cat, params.length])
      ),
      batchPathsCount: this.batchPaths.length,
      sampleParams: Object.fromEntries(
        Object.entries(this.configCategories).map(([cat, params]) => [
          cat, 
          params.slice(0, 3).map(p => ({ key: p.configKey, path: p.path, command: p.odriveCommand }))
        ])
      ),
      sampleBatchPaths: this.batchPaths.slice(0, 10)
    }
  }
}

// Create singleton instance
const odriveRegistry = new ODriveUnifiedRegistry()

// Convenience exports
export const getBatchPaths = () => odriveRegistry.getBatchPaths()
export const getPropertyMappings = (category) => odriveRegistry.getPropertyMappings(category)
export const generateCommands = (category, config) => odriveRegistry.generateCommands(category, config)
export const generateAllCommands = (deviceConfig) => odriveRegistry.generateAllCommands(deviceConfig)
export const findParameter = (identifier) => odriveRegistry.findParameter(identifier)
export const getCategoryParameters = (category) => odriveRegistry.getCategoryParameters(category)
export const getParameterMetadata = (category, configKey) => odriveRegistry.getParameterMetadata(category, configKey)
export const validateConfig = (category, config) => odriveRegistry.validateConfig(category, config)
export const getDebugInfo = () => odriveRegistry.getDebugInfo()

// Export the registry instance for direct access
export { odriveRegistry }

// Legacy compatibility - these will be deprecated
export const ODriveUnifiedCommands = odriveRegistry.configCategories
export const ODriveUnifiedMappings = odriveRegistry.propertyMappings