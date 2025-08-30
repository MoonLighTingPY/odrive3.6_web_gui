/**
 * Unified ODrive Registry - Single Source of Truth
 * 
 * This system uses odrivePropertyTree as the master source and automatically
 * generates all other data structures (commands, batch paths, mappings, etc.)
 * Now uses dynamic path resolution instead of hardcoded mappings.
 */

import { generateOdrivePropertyTree } from './odrivePropertyTree'
import { convertKvToTorqueConstant } from './valueHelpers'
import { 
  ODrivePathResolver, 
  ODrivePathConfig, 
  setPathResolverConfig,
  isPropertySupported,
  getCompatiblePath
} from './odrivePathResolver'

class ODriveUnifiedRegistry {
  constructor(firmwareVersion = "0.5.6", deviceName = "odrv0", defaultAxis = 0) {
    this.firmwareVersion = firmwareVersion
    this.deviceName = deviceName  
    this.defaultAxis = defaultAxis
    this.pathResolver = new ODrivePathResolver(new ODrivePathConfig(firmwareVersion, deviceName, defaultAxis))
    
    // Initialize property tree and derived data structures
    this.propertyTree = generateOdrivePropertyTree(firmwareVersion)
    this.configCategories = this._generateConfigCategories()
    this.batchPaths = this._generateBatchPaths()
    this.propertyMappings = this._generatePropertyMappings()
    this.commandGenerators = this._generateCommandGenerators()
    this.commands = this._generateCommands()

    console.log('🏗️ ODrive Unified Registry initialized:', {
      firmwareVersion: this.firmwareVersion,
      deviceName: this.deviceName,
      defaultAxis: this.defaultAxis,
      categories: Object.keys(this.configCategories),
      totalParams: Object.values(this.configCategories).reduce((sum, params) => sum + params.length, 0),
      batchPathsCount: this.batchPaths.length,
      commandsCount: Object.values(this.commands).reduce((sum, cmds) => sum + cmds.length, 0)
    })
  }

  /**
   * Update registry for new firmware version/device configuration  
   */
  updateConfiguration(firmwareVersion, deviceName = "odrv0", defaultAxis = 0) {
    this.firmwareVersion = firmwareVersion
    this.deviceName = deviceName
    this.defaultAxis = defaultAxis
    this.pathResolver = new ODrivePathResolver(new ODrivePathConfig(firmwareVersion, deviceName, defaultAxis))
    
    // Regenerate all derived structures
    this.propertyTree = generateOdrivePropertyTree(firmwareVersion)
    this.configCategories = this._generateConfigCategories()
    this.batchPaths = this._generateBatchPaths()
    this.propertyMappings = this._generatePropertyMappings() 
    this.commandGenerators = this._generateCommandGenerators()
    this.commands = this._generateCommands()
    
    console.log('ODrive Unified Registry updated:', {
      firmwareVersion: this.firmwareVersion,
      deviceName: this.deviceName,
      defaultAxis: this.defaultAxis
    })
  }

  _generateConfigCategories() {
    const categories = { power: [], motor: [], encoder: [], control: [], interface: [] }

    this._traversePropertyTree((path, property) => {
      if (property.writable && 
          isPropertySupported(path) &&
          !this._isMethodProperty(path, property)) {
        const category = this._inferCategory(path)
        if (category) {
          const compatiblePath = getCompatiblePath(path)
          const param = {
            path: compatiblePath,
            property,
            odriveCommand: this.pathResolver.resolveToApiPath(compatiblePath).replace(`${this.deviceName}.`, ''),
            configKey: this._pathToConfigKey(compatiblePath),
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

  _isMethodProperty(path, property) {
    // Filter out method endpoints that should not be read as properties
    // Check if the property is explicitly marked as a function
    if (property && property.type === 'function') {
      return true
    }
    
    // Fallback: check path for known method patterns
    return path.includes('methods.') || path.startsWith('methods.')
  }

  _generateBatchPaths() {
    const paths = []

    this._traversePropertyTree((path, property) => {
      if (property.writable && 
          this._isConfigParameter(path) && 
          isPropertySupported(path) &&
          !this._isMethodProperty(path, property)) {
        const compatiblePath = getCompatiblePath(path)
        const propertyPath = this.pathResolver.resolveToPropertyPath(compatiblePath)
        paths.push(propertyPath)
      }
    })

    return paths
  }

  _traversePropertyTree(callback, node = this.propertyTree, basePath = '') {
    if (!node) return

    if (basePath === '' && !node.properties && !node.children) {
      Object.entries(node).forEach(([sectionName, sectionNode]) => {
        if (typeof sectionNode === 'object' && sectionNode !== null) {
          this._traversePropertyTree(callback, sectionNode, sectionName)
        }
      })
      return
    }

    if (node.properties) {
      Object.entries(node.properties).forEach(([propName, prop]) => {
        const fullPath = basePath ? `${basePath}.${propName}` : propName
        callback(fullPath, prop)
      })
    }

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
      generators[category] = (config, axisNumber = this.defaultAxis) => {
        const commands = []
        
        // Remove axisNumber from config to avoid treating it as a parameter
        const { axisNumber: _, ...configWithoutAxis } = config
        
        params.forEach(param => {
          const value = configWithoutAxis[param.configKey]
          if (value !== undefined && value !== null) {
            // Skip non-config parameters
            const skip = ['calib_anticogging', 'anticogging_valid', 'autotuning_phase', 'endstop_state', 'temperature']
            if (skip.includes(param.path.split('.').pop())) return

            let commandValue = value
            
            // Handle special value conversions
            if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
              commandValue = convertKvToTorqueConstant(value)
            } else if (param.property.type === 'boolean') {
              commandValue = value ? 'True' : 'False'
            } else if (param.configKey === 'torque_lim' && (value === 'inf' || value === Infinity)) {
              commandValue = 1000000
            }

            // Use path resolver to generate dynamic command instead of hardcoded axis replacement
            const command = this.pathResolver.generateCommand(param.path, commandValue, axisNumber)
            commands.push(command)
          }
        })
        
        return commands
      }
    })

    return generators
  }

  _generateCommands() {
    const commands = {
      system: [],
      power: [],
      motor: [],
      encoder: [],
      controller: [],
      calibration: [],
      gpio_interface: [],
      can_config: []
    }

    // Generate read commands for all properties (both readable and writable)
    this._traversePropertyTree((path, property) => {
      if (isPropertySupported(path)) {
        const compatiblePath = getCompatiblePath(path)
        const category = this._inferCommandCategory(compatiblePath, property)
        if (category && commands[category]) {
          const apiPath = this.pathResolver.resolveToApiPath(compatiblePath)

          // Read command
          commands[category].push({
            name: `Get ${property.name}`,
            command: apiPath,
            description: `Read ${property.description}`
          })

          // Write command for writable properties
          if (property.writable) {
            let exampleValue = this._getExampleValue(property)
            commands[category].push({
              name: `Set ${property.name}`,
              command: `${apiPath} = ${exampleValue}`,
              description: `Set ${property.description}`
            })
          }
        } else if (category) {
          // Debug: log unmapped categories
          console.warn(`Unmapped command category: ${category} for path: ${compatiblePath}`)
        }
      }
    })

    // Add special commands that don't directly map to properties
    this._addSpecialCommands(commands)

    return commands
  }

  // eslint-disable-next-line no-unused-vars
  _inferCommandCategory(path, property) {
    // System-level properties (should not be prefixed with axis0)
    if (path.startsWith('system.') ||
      path.includes('hw_version') ||
      path.includes('fw_version') ||
      path.includes('serial_number') ||
      path.includes('vbus_voltage') ||
      path.includes('ibus') ||
      path.includes('test_property') ||
      path.includes('brake_resistor_') ||
      path.includes('misconfigured') ||
      path.includes('otp_valid')) {
      return 'system'
    }

    // System stats
    if (path.startsWith('system_stats.')) {
      return 'system'
    }

    // CAN properties (device level)
    if (path.startsWith('can.')) {
      return 'can_config'
    }

    // Config properties (device level)
    if (path.startsWith('config.')) {
      const configCategory = this._inferCategory(path)
      if (configCategory === 'power') {
        return 'power'
      }
      if (configCategory === 'interface') {
        return 'gpio_interface'
      }
      return 'system'
    }

    // Use existing category inference but map to command categories
    const configCategory = this._inferCategory(path)
    if (configCategory) {
      // Map config categories to command categories
      const categoryMapping = {
        'power': 'power',
        'motor': 'motor',
        'encoder': 'encoder',
        'control': 'controller',
        'interface': 'gpio_interface'
      }
      return categoryMapping[configCategory] || configCategory
    }

    // Motor status and control
    if (path.includes('motor.') && !path.includes('config')) {
      return 'motor'
    }

    // Encoder status
    if (path.includes('encoder.') && !path.includes('config')) {
      return 'encoder'
    }

    // Controller status and inputs
    if (path.includes('controller.') && !path.includes('config')) {
      return 'controller'
    }

    // Calibration-related
    if (path.includes('calibration') ||
      path.includes('requested_state') ||
      path.includes('is_calibrated')) {
      return 'calibration'
    }

    // GPIO and interface
    if (path.includes('gpio') ||
      path.includes('uart') ||
      path.includes('step_dir') ||
      path.includes('endstop') ||
      path.includes('mechanical_brake')) {
      return 'gpio_interface'
    }

    return null
  }

  _getExampleValue(property) {
    switch (property.type) {
      case 'boolean':
        return 'True'
      case 'number':
        if (property.min !== undefined) {
          return property.min
        }
        if (property.max !== undefined && property.max < 100) {
          return Math.round(property.max / 2)
        }
        return property.step || 1
      default:
        return '0'
    }
  }

  _addSpecialCommands(commands) {
    const deviceName = this.deviceName
    
    // Add system commands that don't map directly to properties
    commands.system.push(
      { name: "Reboot Device", command: `${deviceName}.reboot()`, description: "Reboot the ODrive device" },
      { name: "Save Configuration", command: `${deviceName}.save_configuration()`, description: "Save current configuration to non-volatile memory" },
      { name: "Erase Configuration", command: `${deviceName}.erase_configuration()`, description: "Erase configuration and restore factory defaults" },
      { name: "Clear Errors", command: `${deviceName}.clear_errors()`, description: "Clear all error flags on the device" }
    )

    // Add calibration state commands for default axis
    const defaultAxisCommands = [
      { state: 1, name: "Idle", description: "Set axis to idle state" },
      { state: 3, name: "Full Calibration", description: "Start full calibration sequence" },
      { state: 4, name: "Motor Calibration", description: "Start motor calibration only" },
      { state: 6, name: "Encoder Index Search", description: "Search for encoder index pulse" },
      { state: 7, name: "Encoder Offset Calibration", description: "Calibrate encoder offset" },
      { state: 8, name: "Closed Loop Control", description: "Enter closed loop control mode" },
      { state: 10, name: "Encoder Dir Find", description: "Start encoder direction finding" }
    ]
    
    defaultAxisCommands.forEach(({ state, name, description }) => {
      const command = this.pathResolver.generateCommand('requested_state', state, this.defaultAxis)
      commands.calibration.push({
        name: `Set Axis State - ${name}`,
        command,
        description
      })
    })
  }

  _generatePropertyCategories() {
    const categories = { power: [], motor: [], encoder: [], control: [], interface: [] }

    this._traversePropertyTree((path, property) => {
      if (property.writable) {
        const category = this._inferCategory(path)
        if (category) {
          const param = {
            path,
            property,
            odriveCommand: this.pathResolver.resolveToApiPath(path).replace(`${this.deviceName}.`, ''),
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

  _inferCategory(path) {

    if (path.includes('controller.config.vel_limit')) {
      return 'control'
    }

    // Then check for trapezoidal trajectory velocity limit
    if (path.includes('trap_traj.config.vel_limit')) {
      return 'control'
    }

    if (path.includes('motor.config') ||
      path.includes('motor_thermistor') ||
      path.includes('calibration_lockin') ||
      path.includes('general_lockin') ||
      path.includes('sensorless_ramp') ||
      path.includes('phase_inductance') ||
      path.includes('phase_resistance') ||
      path.includes('torque_lim') ||
      path.includes('torque_constant') ||
      path.includes('thermal_current_limiter') ||
      path.includes('motor_thermistor_current_limiter')) {
      return 'motor'
    }

    if (path.includes('encoder.config') ||
      path.includes('enable_phase_interpolation') ||
      path.includes('ignore_illegal_hall_state') ||
      path.includes('hall_polarity') ||
      path.includes('load_mapper.config') ||
      path.includes('commutation_mapper.config') ||
      path.includes('pos_vel_mapper.config') ||
      path.includes('harmonic_compensation.config')) {
      return 'encoder'
    }

    if (path.includes('controller.config') ||
      path.includes('trap_traj.config') ||
      path.includes('autotuning.') ||
      path.includes('enable_overspeed_error') ||
      path.includes('spinout_') ||
      path.includes('anticogging.calib_pos_threshold') ||
      path.includes('anticogging.calib_vel_threshold') ||
      path.includes('init_pos') ||
      path.includes('init_vel') ||
      path.includes('init_torque')) {
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
      path.includes('enable_i2c_') ||
      path.includes('error_gpio_pin') ||
      path.includes('encoder_error_rate_ms') ||
      path.includes('controller_error_rate_ms') ||
      path.includes('motor_error_rate_ms') ||
      path.includes('sensorless_error_rate_ms')) {
      return 'interface'
    }

    if (path.includes('config.dc_') ||
      path.includes('config.brake_') ||
      path.includes('config.enable_brake_') ||
      path.includes('config.max_regen_current') ||
      path.includes('config.enable_dc_bus_') ||
      path.includes('config.test_') ||
      path.includes('config.usb_') ||
      path.includes('fet_thermistor') ||
      path.includes('brake_resistor0.config')) {
      return 'power'
    }

    if (path.includes('requested_state')) {
      return 'control'
    }

    return null
  }

  // REMOVED: _pathToODriveCommand - Now using dynamic path resolver instead

  _pathToConfigKey(path) {
    const parts = path.split('.')
    const lastPart = parts[parts.length - 1]
    const specialMappings = {
      'torque_constant': 'motor_kv',
      'phase_inductance': 'phase_inductance',
      'phase_resistance': 'phase_resistance',

      // Handle vel_limit conflicts
      'vel_limit': path.includes('controller.config') ? 'vel_limit' :
        path.includes('trap_traj.config') ? 'trap_vel_limit' : 'vel_limit',

      // Handle pre_calibrated conflicts
      'pre_calibrated': path.includes('encoder') ? 'pre_calibrated' :
        path.includes('motor') ? 'motor_pre_calibrated' :
          path.includes('anticogging') ? 'anticogging_pre_calibrated' : 'pre_calibrated',

      // Handle enabled conflicts
      'enabled': path.includes('fet_thermistor') ? 'fet_thermistor_enabled' :
        path.includes('motor_thermistor') ? 'motor_thermistor_enabled' :
          path.includes('min_endstop') ? 'min_endstop_enabled' :
            path.includes('max_endstop') ? 'max_endstop_enabled' : 'enabled',

      // Handle gpio_num conflicts
      'gpio_num': path.includes('motor_thermistor') ? 'motor_thermistor_gpio_num' :
        path.includes('min_endstop') ? 'min_endstop_gpio_num' :
          path.includes('max_endstop') ? 'max_endstop_gpio_num' :
            path.includes('mechanical_brake') ? 'mechanical_brake_gpio_num' : 'gpio_num',

      // Handle temperature limit conflicts
      'temp_limit_lower': path.includes('fet_thermistor') ? 'fet_temp_limit_lower' :
        path.includes('motor_thermistor') ? 'motor_temp_limit_lower' : 'temp_limit_lower',
      'temp_limit_upper': path.includes('fet_thermistor') ? 'fet_temp_limit_upper' :
        path.includes('motor_thermistor') ? 'motor_temp_limit_upper' : 'temp_limit_upper',

      // Handle offset conflicts
      'offset': path.includes('encoder') ? 'index_offset' :
        path.includes('min_endstop') ? 'min_endstop_offset' :
          path.includes('max_endstop') ? 'max_endstop_offset' : 'offset',

      // Keep existing mappings
      'mode': path.includes('encoder') ? 'encoder_type' : 'mode',
      'enable_phase_interpolation': 'enable_phase_interpolation',
      'ignore_illegal_hall_state': 'ignore_illegal_hall_state',
      'hall_polarity': 'hall_polarity',
      'enable_overspeed_error': 'enable_overspeed_error',
      'spinout_electrical_power_threshold': 'spinout_electrical_power_threshold',
      'spinout_mechanical_power_threshold': 'spinout_mechanical_power_threshold',
      'calib_pos_threshold': 'calib_pos_threshold',
      'calib_vel_threshold': 'calib_vel_threshold',
      'error_gpio_pin': 'error_gpio_pin',
      'encoder_error_rate_ms': 'encoder_error_rate_ms',
      'controller_error_rate_ms': 'controller_error_rate_ms',
      'motor_error_rate_ms': 'motor_error_rate_ms',
      'sensorless_error_rate_ms': 'sensorless_error_rate_ms',
      'node_id': 'can_node_id',
      'is_extended': 'can_node_id_extended',
      'baud_rate': 'can_baudrate',
      'enable_brake_resistor': 'brake_resistor_enabled',
      'current': path.includes('calibration_lockin') ? 'lock_in_spin_current' : 'current',
      
      // 0.6.x specific config key mappings
      'init_pos': 'init_pos',
      'init_vel': 'init_vel', 
      'init_torque': 'init_torque',
      'observed_encoder_scale_factor': 'observed_encoder_scale_factor',
      
      // Mapper-specific config keys
      'use_index': path.includes('load_mapper') ? 'load_encoder_use_index' : 'use_index',
      'cpr': path.includes('load_mapper') ? 'load_encoder_cpr' : 
             path.includes('commutation_mapper') ? 'commutation_encoder_cpr' : 'cpr',
      'scale': path.includes('load_mapper') ? 'load_encoder_scale' :
               path.includes('commutation_mapper') ? 'commutation_encoder_scale' : 'scale',
      'bandwidth': path.includes('pos_vel_mapper') ? 'pos_vel_bandwidth' :
                   path.includes('encoder') ? 'encoder_bandwidth' : 'bandwidth',
      
      // Harmonic compensation config keys
      'calib_vel': path.includes('harmonic_compensation') ? 'harmonic_calib_vel' : 'calib_vel',
      'calib_turns': path.includes('harmonic_compensation') ? 'harmonic_calib_turns' : 'calib_turns',
      'calib_settling_delay': path.includes('harmonic_compensation') ? 'harmonic_calib_settling_delay' : 'calib_settling_delay',
    }
    return specialMappings[lastPart] || lastPart
  }

  _isConfigParameter(path) {
    if (path.endsWith('.error')) {
      return false
    }
    const nonConfigNames = [
      'current_state', 'pos_estimate', 'vel_estimate', 'temperature',
      'is_ready', 'index_found', 'shadow_count', 'count_in_cpr',
      'pos_estimate_counts', 'pos_circular', 'pos_cpr_counts',
      'delta_pos_cpr_counts', 'hall_state', 'vel_estimate_counts',
      'calib_scan_response', 'pos_abs', 'spi_error_rate',
      'is_armed', 'is_calibrated', 'current_meas_', 'DC_calib_',
      'I_bus', 'phase_current_rev_gain', 'effective_current_lim',
      'max_allowed_current', 'max_dc_calib', 'n_evt_', 'last_error_time',
      'input_pos', 'input_vel', 'input_torque', 'pos_setpoint',
      'vel_setpoint', 'torque_setpoint', 'trajectory_done',
      'vel_integrator_torque', 'anticogging_valid', 'autotuning_phase',
      'mechanical_power', 'electrical_power', 'endstop_state',
      
      // 0.6.x read-only properties
      'detailed_disarm_reason', 'active_errors', 'disarm_reason', 
      'procedure_result', 'disarm_time', 'observed_encoder_scale_factor',
      'pos_rel', 'working_offset', 'n_index_events', 'phase', 'phase_vel',
      'cosx_coef', 'sinx_coef', 'cos2x_coef', 'sin2x_coef',
      'current_lim', 'current_meas_status', 'was_saturated',
      'n_restarts', 'n_rx', 'effective_baudrate'
    ]
    const lastPart = path.split('.').pop()
    return !nonConfigNames.includes(lastPart)
  }

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
    Object.entries(deviceConfig).forEach(([category, cfg]) => {
      if (cfg && Object.keys(cfg).length > 0) {
        allCommands.push(...this.generateCommands(category, cfg))
      }
    })
    return allCommands
  }

  getConfigCategories() {
    return this.configCategories
  }

  findParameter(identifier) {
    // Try to find in config categories first
    for (const [category, params] of Object.entries(this.configCategories)) {
      const found = params.find(p =>
        p.path === identifier ||
        p.configKey === identifier ||
        p.odriveCommand.includes(identifier) ||
        p.odriveCommand === identifier
      )
      if (found) return { ...found, category }
    }
    
    // Try to find directly in property tree
    const findInTree = (node, basePath = '') => {
      if (node.properties) {
        for (const [propName, prop] of Object.entries(node.properties)) {
          const fullPath = basePath ? `${basePath}.${propName}` : propName
          if (fullPath === identifier || propName === identifier) {
            return prop
          }
        }
      }
      
      if (node.children) {
        for (const [childName, childNode] of Object.entries(node.children)) {
          const childPath = basePath ? `${basePath}.${childName}` : childName
          const found = findInTree(childNode, childPath)
          if (found) return found
        }
      }
      
      return null
    }
    
    // Search the property tree directly
    for (const [sectionName, section] of Object.entries(this.propertyTree)) {
      const found = findInTree(section, sectionName)
      if (found) return found
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
        if (param.property.type === 'number' && typeof value !== 'number') {
          errors.push(`${key}: Expected number, got ${typeof value}`)
        }
        if (param.property.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${key}: Expected boolean, got ${typeof value}`)
        }
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

  getCommands() {
    return this.commands
  }
}


const createRegistryForVersion = (firmwareVersion, deviceName = "odrv0", defaultAxis = 0) => 
  new ODriveUnifiedRegistry(firmwareVersion, deviceName, defaultAxis)

// --- ADD START: version-aware active registry and setter ---
const registryV56 = new ODriveUnifiedRegistry("0.5.6", "odrv0", 0)
const registryV611 = new ODriveUnifiedRegistry("0.6.11", "odrv0", 0)

let activeRegistry = registryV56

export const setActiveOdriveFirmwareVersion = (fw, deviceName = "odrv0", defaultAxis = 0) => {
  // Accept string like "0.6.10" or object { fw_version_major, fw_version_minor }
  let major = null
  let minor = null

  if (typeof fw === 'string') {
    const m = fw.match(/(\d+)\.(\d+)/)
    if (m) {
      major = parseInt(m[1], 10)
      minor = parseInt(m[2], 10)
    }
  } else if (fw && typeof fw === 'object') {
    major = fw.fw_version_major ?? fw.major ?? null
    minor = fw.fw_version_minor ?? fw.minor ?? null
  }

  // Determine which base registry to use
  let targetRegistry = (major === 0 && typeof minor === 'number' && minor >= 6) ? registryV611 : registryV56
  
  // If device name or axis changed, update the registry configuration
  if (targetRegistry.deviceName !== deviceName || targetRegistry.defaultAxis !== defaultAxis) {
    targetRegistry.updateConfiguration(targetRegistry.firmwareVersion, deviceName, defaultAxis)
  }
  
  // Set global path resolver configuration
  setPathResolverConfig(targetRegistry.firmwareVersion, deviceName, defaultAxis)
  
  activeRegistry = targetRegistry
  
  console.log(`Switched to ODrive registry: ${targetRegistry.firmwareVersion} (device: ${deviceName}, axis: ${defaultAxis})`)
}

export const getCurrentRegistry = () => activeRegistry
// --- ADD END ---

// Replace direct references to odriveRegistry with activeRegistry so callers get version-aware data
export const getBatchPaths = () => activeRegistry.getBatchPaths()
export const getPropertyMappings = (category) => activeRegistry.getPropertyMappings(category)
export const generateCommands = (category, config) => activeRegistry.generateCommands(category, config)
export const generateAllCommands = (deviceConfig) => activeRegistry.generateAllCommands(deviceConfig)
export const findParameter = (identifier) => activeRegistry.findParameter(identifier)
export const getCategoryParameters = (category) => activeRegistry.getCategoryParameters(category)
export const getParameterMetadata = (category, configKey) => activeRegistry.getParameterMetadata(category, configKey)
export const validateConfig = (category, config) => activeRegistry.validateConfig(category, config)
export const getDebugInfo = () => activeRegistry.getDebugInfo()

// Provide lazy-access mappings for components expecting these objects.
// Consumers should prefer helper functions above, but keep these for compatibility.
export const ODrivePropertyMappings = () => activeRegistry.getPropertyMappings()
export const ODriveUnifiedCommands = () => activeRegistry.getConfigCategories()
export const ODriveUnifiedMappings = () => activeRegistry.propertyMappings
export const ODriveCommands = () => activeRegistry.getCommands()

// Keep a reference to the default instance for rare direct use (backwards compat)
export { registryV56 as odriveRegistry, createRegistryForVersion }