/**
 * Unified ODrive Registry - Single Source of Truth
 * 
 * This system uses odrivePropertyTree as the master source and automatically
 * generates all other data structures (commands, batch paths, mappings, etc.)
 */

import { odrivePropertyTree } from './odrivePropertyTree'

class ODriveUnifiedRegistry {
  constructor() {
    // Debug: Check what we're getting from property tree
    console.log('Raw odrivePropertyTree:', odrivePropertyTree)
    console.log('Property tree type:', typeof odrivePropertyTree)
    console.log('Property tree keys:', Object.keys(odrivePropertyTree || {}))
    
    this.propertyTree = odrivePropertyTree
    this.usingLegacyFallback = false
    
    // Check if property tree is valid before proceeding
    if (!this.propertyTree || Object.keys(this.propertyTree).length === 0) {
      console.warn('Property tree is empty or undefined, falling back to legacy paths')
      this.usingLegacyFallback = true
      this.batchPaths = this._generateLegacyBatchPaths()
      this.configCategories = this._generateLegacyConfigCategories()
    } else {
      console.log('Property tree is valid, attempting to traverse...')
      this.configCategories = this._generateConfigCategories()
      this.batchPaths = this._generateBatchPaths()
    }
    
    this.propertyMappings = this._generatePropertyMappings()
    this.commandGenerators = this._generateCommandGenerators()
    
    // Debug output
    console.log('ODrive Unified Registry initialized:', {
      usingLegacyFallback: this.usingLegacyFallback,
      categories: Object.keys(this.configCategories),
      totalParams: Object.values(this.configCategories).reduce((sum, params) => sum + params.length, 0),
      batchPathsCount: this.batchPaths.length,
      sampleBatchPaths: this.batchPaths.slice(0, 5),
      actualBatchPaths: this.batchPaths
    })
  }

  // ADD BETTER LOGGING TO THIS METHOD
  _generateLegacyBatchPaths() {
    console.log('Generating legacy batch paths...')
    
    // Based on the existing codebase, here are the common configuration paths
    const legacyPaths = [
      // Power configuration
      'device.config.dc_bus_overvoltage_trip_level',
      'device.config.dc_bus_undervoltage_trip_level',
      'device.config.dc_max_positive_current',
      'device.config.dc_max_negative_current',
      'device.config.brake_resistance',
      'device.config.enable_brake_resistor',
      'device.config.max_regen_current',
      
      // Motor configuration  
      'device.axis0.motor.config.motor_type',
      'device.axis0.motor.config.pole_pairs',
      'device.axis0.motor.config.current_lim',
      'device.axis0.motor.config.current_lim_margin',
      'device.axis0.motor.config.torque_constant',
      'device.axis0.motor.config.phase_resistance',
      'device.axis0.motor.config.phase_inductance',
      'device.axis0.motor.config.resistance_calib_max_voltage',
      'device.axis0.config.calibration_lockin.current',
      
      // Encoder configuration
      'device.axis0.encoder.config.mode',
      'device.axis0.encoder.config.cpr',
      'device.axis0.encoder.config.use_index',
      'device.axis0.encoder.config.pre_calibrated',
      'device.axis0.encoder.config.calib_scan_distance',
      'device.axis0.encoder.config.bandwidth',
      
      // Controller configuration
      'device.axis0.controller.config.control_mode',
      'device.axis0.controller.config.input_mode',
      'device.axis0.controller.config.pos_gain',
      'device.axis0.controller.config.vel_gain',
      'device.axis0.controller.config.vel_integrator_gain',
      'device.axis0.controller.config.vel_limit',
      'device.axis0.controller.config.vel_limit_tolerance',
      'device.axis0.controller.config.vel_ramp_rate',
      'device.axis0.controller.config.torque_ramp_rate',
      'device.axis0.controller.config.circular_setpoints',
      'device.axis0.controller.config.inertia',
      'device.axis0.controller.config.input_filter_bandwidth',
      
      // Interface configuration
      'device.axis0.config.can.node_id',
      'device.axis0.config.can.is_extended',
      'device.can.config.baud_rate',
      'device.axis0.config.can.heartbeat_rate_ms',
      'device.config.enable_uart_a',
      'device.config.uart_a_baudrate',
      'device.config.uart0_protocol',
      'device.axis0.config.enable_step_dir',
      'device.axis0.config.step_gpio_pin',
      'device.axis0.config.dir_gpio_pin'
    ]
    
    console.log(`Generated ${legacyPaths.length} legacy batch paths:`, legacyPaths)
    return legacyPaths
  }

  // Fallback method for generating config categories when property tree is not available
  _generateLegacyConfigCategories() {
    console.log('Generating legacy config categories...')
    
    const categories = {
      power: [
        { path: 'config.dc_bus_overvoltage_trip_level', configKey: 'dc_bus_overvoltage_trip_level', odriveCommand: 'config.dc_bus_overvoltage_trip_level', property: { type: 'number', writable: true } },
        { path: 'config.dc_bus_undervoltage_trip_level', configKey: 'dc_bus_undervoltage_trip_level', odriveCommand: 'config.dc_bus_undervoltage_trip_level', property: { type: 'number', writable: true } },
        { path: 'config.dc_max_positive_current', configKey: 'dc_max_positive_current', odriveCommand: 'config.dc_max_positive_current', property: { type: 'number', writable: true } },
        { path: 'config.dc_max_negative_current', configKey: 'dc_max_negative_current', odriveCommand: 'config.dc_max_negative_current', property: { type: 'number', writable: true } },
        { path: 'config.brake_resistance', configKey: 'brake_resistance', odriveCommand: 'config.brake_resistance', property: { type: 'number', writable: true } },
        { path: 'config.enable_brake_resistor', configKey: 'brake_resistor_enabled', odriveCommand: 'config.enable_brake_resistor', property: { type: 'boolean', writable: true } },
        { path: 'config.max_regen_current', configKey: 'max_regen_current', odriveCommand: 'config.max_regen_current', property: { type: 'number', writable: true } }
      ],
      motor: [
        { path: 'axis0.motor.config.motor_type', configKey: 'motor_type', odriveCommand: 'axis0.motor.config.motor_type', property: { type: 'number', writable: true } },
        { path: 'axis0.motor.config.pole_pairs', configKey: 'pole_pairs', odriveCommand: 'axis0.motor.config.pole_pairs', property: { type: 'number', writable: true } },
        { path: 'axis0.motor.config.current_lim', configKey: 'current_lim', odriveCommand: 'axis0.motor.config.current_lim', property: { type: 'number', writable: true } },
        { path: 'axis0.motor.config.current_lim_margin', configKey: 'current_lim_margin', odriveCommand: 'axis0.motor.config.current_lim_margin', property: { type: 'number', writable: true } },
        { path: 'axis0.motor.config.torque_constant', configKey: 'motor_kv', odriveCommand: 'axis0.motor.config.torque_constant', property: { type: 'number', writable: true } },
        { path: 'axis0.motor.config.phase_resistance', configKey: 'phase_resistance', odriveCommand: 'axis0.motor.config.phase_resistance', property: { type: 'number', writable: true } },
        { path: 'axis0.motor.config.phase_inductance', configKey: 'phase_inductance', odriveCommand: 'axis0.motor.config.phase_inductance', property: { type: 'number', writable: true } },
        { path: 'axis0.motor.config.resistance_calib_max_voltage', configKey: 'resistance_calib_max_voltage', odriveCommand: 'axis0.motor.config.resistance_calib_max_voltage', property: { type: 'number', writable: true } },
        { path: 'axis0.config.calibration_lockin.current', configKey: 'lock_in_spin_current', odriveCommand: 'axis0.config.calibration_lockin.current', property: { type: 'number', writable: true } }
      ],
      encoder: [
        { path: 'axis0.encoder.config.mode', configKey: 'encoder_type', odriveCommand: 'axis0.encoder.config.mode', property: { type: 'number', writable: true } },
        { path: 'axis0.encoder.config.cpr', configKey: 'cpr', odriveCommand: 'axis0.encoder.config.cpr', property: { type: 'number', writable: true } },
        { path: 'axis0.encoder.config.use_index', configKey: 'use_index', odriveCommand: 'axis0.encoder.config.use_index', property: { type: 'boolean', writable: true } },
        { path: 'axis0.encoder.config.pre_calibrated', configKey: 'pre_calibrated', odriveCommand: 'axis0.encoder.config.pre_calibrated', property: { type: 'boolean', writable: true } },
        { path: 'axis0.encoder.config.calib_scan_distance', configKey: 'calib_scan_distance', odriveCommand: 'axis0.encoder.config.calib_scan_distance', property: { type: 'number', writable: true } },
        { path: 'axis0.encoder.config.bandwidth', configKey: 'bandwidth', odriveCommand: 'axis0.encoder.config.bandwidth', property: { type: 'number', writable: true } }
      ],
      control: [
        { path: 'axis0.controller.config.control_mode', configKey: 'control_mode', odriveCommand: 'axis0.controller.config.control_mode', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.input_mode', configKey: 'input_mode', odriveCommand: 'axis0.controller.config.input_mode', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.pos_gain', configKey: 'pos_gain', odriveCommand: 'axis0.controller.config.pos_gain', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.vel_gain', configKey: 'vel_gain', odriveCommand: 'axis0.controller.config.vel_gain', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.vel_integrator_gain', configKey: 'vel_integrator_gain', odriveCommand: 'axis0.controller.config.vel_integrator_gain', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.vel_limit', configKey: 'vel_limit', odriveCommand: 'axis0.controller.config.vel_limit', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.vel_limit_tolerance', configKey: 'vel_limit_tolerance', odriveCommand: 'axis0.controller.config.vel_limit_tolerance', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.vel_ramp_rate', configKey: 'vel_ramp_rate', odriveCommand: 'axis0.controller.config.vel_ramp_rate', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.torque_ramp_rate', configKey: 'torque_ramp_rate', odriveCommand: 'axis0.controller.config.torque_ramp_rate', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.circular_setpoints', configKey: 'circular_setpoints', odriveCommand: 'axis0.controller.config.circular_setpoints', property: { type: 'boolean', writable: true } },
        { path: 'axis0.controller.config.inertia', configKey: 'inertia', odriveCommand: 'axis0.controller.config.inertia', property: { type: 'number', writable: true } },
        { path: 'axis0.controller.config.input_filter_bandwidth', configKey: 'input_filter_bandwidth', odriveCommand: 'axis0.controller.config.input_filter_bandwidth', property: { type: 'number', writable: true } }
      ],
      interface: [
        { path: 'axis0.config.can.node_id', configKey: 'can_node_id', odriveCommand: 'axis0.config.can.node_id', property: { type: 'number', writable: true } },
        { path: 'axis0.config.can.is_extended', configKey: 'can_node_id_extended', odriveCommand: 'axis0.config.can.is_extended', property: { type: 'boolean', writable: true } },
        { path: 'can.config.baud_rate', configKey: 'can_baudrate', odriveCommand: 'can.config.baud_rate', property: { type: 'number', writable: true } },
        { path: 'axis0.config.can.heartbeat_rate_ms', configKey: 'heartbeat_rate_ms', odriveCommand: 'axis0.config.can.heartbeat_rate_ms', property: { type: 'number', writable: true } },
        { path: 'config.enable_uart_a', configKey: 'enable_uart_a', odriveCommand: 'config.enable_uart_a', property: { type: 'boolean', writable: true } },
        { path: 'config.uart_a_baudrate', configKey: 'uart_a_baudrate', odriveCommand: 'config.uart_a_baudrate', property: { type: 'number', writable: true } },
        { path: 'config.uart0_protocol', configKey: 'uart0_protocol', odriveCommand: 'config.uart0_protocol', property: { type: 'number', writable: true } },
        { path: 'axis0.config.enable_step_dir', configKey: 'enable_step_dir', odriveCommand: 'axis0.config.enable_step_dir', property: { type: 'boolean', writable: true } },
        { path: 'axis0.config.step_gpio_pin', configKey: 'step_gpio_pin', odriveCommand: 'axis0.config.step_gpio_pin', property: { type: 'number', writable: true } },
        { path: 'axis0.config.dir_gpio_pin', configKey: 'dir_gpio_pin', odriveCommand: 'axis0.config.dir_gpio_pin', property: { type: 'number', writable: true } }
      ]
    }
    
    console.log('Generated legacy config categories:', Object.keys(categories).map(cat => `${cat}: ${categories[cat].length} params`))
    return categories
  }

  // Auto-generate configuration categories from property tree
  _generateConfigCategories() {
    console.log('_generateConfigCategories() called')
    
    // Only use this method if we have a valid property tree
    if (!this.propertyTree || Object.keys(this.propertyTree).length === 0) {
      console.warn('Property tree empty in _generateConfigCategories, returning empty categories')
      return { power: [], motor: [], encoder: [], control: [], interface: [] }
    }

    const categories = { power: [], motor: [], encoder: [], control: [], interface: [] }
    let totalPropertiesFound = 0
    let writablePropertiesFound = 0
    let categorizedPropertiesFound = 0
    
    this._traversePropertyTree((path, property) => {
      totalPropertiesFound++
      console.log(`Found property: ${path}`, property)
      
      if (property.writable) {
        writablePropertiesFound++
        console.log(`  -> Writable property: ${path}`)
        
        const category = this._inferCategory(path)
        if (category) {
          categorizedPropertiesFound++
          console.log(`  -> Categorized as: ${category}`)
          
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
        } else {
          console.log(`  -> No category found for: ${path}`)
        }
      } else {
        console.log(`  -> Not writable: ${path}`)
      }
    })
    
    console.log('Property tree traversal summary:', {
      totalPropertiesFound,
      writablePropertiesFound,
      categorizedPropertiesFound,
      categoriesWithParams: Object.fromEntries(
        Object.entries(categories).map(([cat, params]) => [cat, params.length])
      )
    })
    
    return categories
  }

  // Auto-generate batch loading paths
  _generateBatchPaths() {
    console.log('_generateBatchPaths() called')
    
    // Only use this method if we have a valid property tree
    if (!this.propertyTree || Object.keys(this.propertyTree).length === 0) {
      console.warn('Property tree empty in _generateBatchPaths, returning empty array')
      return []
    }

    const paths = []
    let totalPropertiesChecked = 0
    let writablePropertiesFound = 0
    let configParametersFound = 0
    
    this._traversePropertyTree((path, property) => {
      totalPropertiesChecked++
      
      if (property.writable) {
        writablePropertiesFound++
        
        if (this._isConfigParameter(path)) {
          configParametersFound++
          const odriveCommand = this._pathToODriveCommand(path)
          const fullPath = `device.${odriveCommand}`
          paths.push(fullPath)
          console.log(`Added batch path: ${fullPath} (from ${path})`)
        }
      }
    })
    
    console.log('Batch paths generation summary:', {
      totalPropertiesChecked,
      writablePropertiesFound,
      configParametersFound,
      generatedPaths: paths.length,
      samplePaths: paths.slice(0, 5)
    })
    
    return paths
  }

  // Helper method to traverse property tree with detailed logging
  _traversePropertyTree(callback, node = this.propertyTree, basePath = '') {
    if (!node) {
      console.log(`Traversal stopped: node is null/undefined at path: ${basePath}`)
      return
    }
    
    // Handle the ROOT LEVEL specially - it contains the main sections as direct properties
    if (basePath === '' && !node.properties && !node.children) {
      console.log('Handling root level with sections as direct properties')
      // The root level contains sections like 'system', 'config', 'can', 'axis0' as direct properties
      Object.entries(node).forEach(([sectionName, sectionNode]) => {
        if (typeof sectionNode === 'object' && sectionNode !== null) {
          console.log(`Processing root section: ${sectionName}`)
          this._traversePropertyTree(callback, sectionNode, sectionName)
        }
      })
      return
    }
    
    // Process direct properties
    if (node.properties) {
      console.log(`Found properties object at: ${basePath || 'root'}`, Object.keys(node.properties))
      Object.entries(node.properties).forEach(([propName, prop]) => {
        const fullPath = basePath ? `${basePath}.${propName}` : propName
        callback(fullPath, prop)
      })
    }
    
    // Recursively process children
    if (node.children) {
      console.log(`Found children object at: ${basePath || 'root'}`, Object.keys(node.children))
      Object.entries(node.children).forEach(([childName, childNode]) => {
        const childPath = basePath ? `${basePath}.${childName}` : childName
        this._traversePropertyTree(callback, childNode, childPath)
      })
    }
    
    // If neither properties nor children, and not root level, this might be a leaf node
    if (!node.properties && !node.children && basePath !== '') {
      console.log(`Leaf node (no properties/children) at: ${basePath}`, node)
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
        path.includes('motor_thermistor') ||   // Keep motor thermistor in motor
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
        path.includes('fet_thermistor')) {    // ← Move FET thermistor to power
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
    // Handle special cases first
    if (path.startsWith('config.')) {
      return path // config.* maps directly
    }
    
    if (path.startsWith('system.')) {
      return path.replace(/^system\./, 'config.')
    }
    
    if (path.startsWith('can.')) {
      return path // can.* maps directly
    }
    
    // axis0.* maps directly
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
      'torque_constant': 'motor_kv', // Will need conversion in UI
      'current': path.includes('calibration_lockin') ? 'lock_in_spin_current' : 'current',
      'node_id': 'can_node_id',
      'is_extended': 'can_node_id_extended',
      'baud_rate': 'can_baudrate',
      'enable_sensorless_mode': 'enable_sensorless'
    }
    
    return specialMappings[lastPart] || lastPart
  }

  _pathToODrivePath(path) {
    // Convert property tree path to ODrive API path for batch loading
    return this._pathToODriveCommand(path)
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
      'mechanical_power', 'electrical_power', 'endstop_state'
    ]
    
    return !nonConfigPaths.some(pattern => path.includes(pattern))
  }

  // Public API methods
  getBatchPaths() {
    console.log('getBatchPaths() called, returning:', {
      length: this.batchPaths?.length || 0,
      usingLegacyFallback: this.usingLegacyFallback,
      firstFew: this.batchPaths?.slice(0, 3) || []
    })
    
    // Return the pre-generated batch paths (either legacy or property tree based)
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
      usingLegacyFallback: this.usingLegacyFallback,
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