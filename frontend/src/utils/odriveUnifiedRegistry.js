/**
 * Unified ODrive Registry - Single Source of Truth
 * 
 * This system uses odrivePropertyTree as the master source and automatically
 * generates all other data structures (commands, batch paths, mappings, etc.)
 */

import { odrivePropertyTree } from './odrivePropertyTree'
import { convertKvToTorqueConstant } from './valueHelpers'

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
      generators[category] = (config) => {
        const commands = []
        params.forEach(param => {
          const value = config[param.configKey]
          if (value !== undefined && value !== null) {
            const skip = ['calib_anticogging','anticogging_valid','autotuning_phase','endstop_state','temperature']
            if (skip.includes(param.path.split('.').pop())) return

            let commandValue = value
            if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
              commandValue = convertKvToTorqueConstant(value)
            } else if (param.property.type === 'boolean') {
              commandValue = value ? 'True' : 'False'
            } else if (param.configKey === 'torque_lim' && (value === 'inf' || value === Infinity)) {
              commandValue = 1000000
            }

            commands.push(`odrv0.${param.odriveCommand} = ${commandValue}`)
          }
        })
        return commands
      }
    })
    
    return generators
  }

  _inferCategory(path) {
    if (path.includes('motor.config') || 
        path.includes('motor_thermistor') ||
        path.includes('calibration_lockin') ||
        path.includes('general_lockin') ||
        path.includes('sensorless_ramp') ||
        path.includes('phase_inductance') ||
        path.includes('phase_resistance') ||
        path.includes('torque_lim') ||
        path.includes('torque_constant')) {
      return 'motor'
    }
    
    if (path.includes('encoder.config') ||
        path.includes('enable_phase_interpolation') ||
        path.includes('ignore_illegal_hall_state') ||
        path.includes('hall_polarity')) {
      return 'encoder'
    }
    
    if (path.includes('controller.config') || 
        path.includes('trap_traj.config') ||
        path.includes('autotuning.') ||
        path.includes('enable_overspeed_error') ||
        path.includes('spinout_') ||
        path.includes('anticogging.calib_pos_threshold') ||
        path.includes('anticogging.calib_vel_threshold')) {
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
        path.includes('fet_thermistor')) {
      return 'power'
    }
    
    if (path.includes('requested_state')) {
      return 'control'
    }
    
    return null
  }

  _pathToODriveCommand(path) {
    const specialMappings = {
      'config.error_gpio_pin': 'config.error_gpio_pin',
      'config.dc_bus_overvoltage_trip_level': 'config.dc_bus_overvoltage_trip_level',
      'config.dc_bus_undervoltage_trip_level': 'config.dc_bus_undervoltage_trip_level',
      'config.enable_brake_resistor': 'config.enable_brake_resistor',
      'config.brake_resistance': 'config.brake_resistance',
      'config.max_regen_current': 'config.max_regen_current',
      'config.dc_max_positive_current': 'config.dc_max_positive_current',
      'config.dc_max_negative_current': 'config.dc_max_negative_current',
      'can.config.baud_rate': 'can.config.baud_rate',
      'can.config.protocol': 'can.config.protocol',
      'axis0.requested_state': 'axis0.requested_state',
      'axis0.motor.config.phase_inductance': 'axis0.motor.config.phase_inductance',
      'axis0.motor.config.phase_resistance': 'axis0.motor.config.phase_resistance',
      'axis0.motor.config.torque_constant': 'axis0.motor.config.torque_constant',
      'axis0.motor.config.pre_calibrated': 'axis0.motor.config.pre_calibrated',
      'axis0.motor.config.motor_type': 'axis0.motor.config.motor_type',
      'axis0.motor.config.pole_pairs': 'axis0.motor.config.pole_pairs',
      'axis0.motor.config.current_lim': 'axis0.motor.config.current_lim',
      'axis0.motor.config.torque_lim': 'axis0.motor.config.torque_lim',
      'axis0.encoder.config.pre_calibrated': 'axis0.encoder.config.pre_calibrated',
      'axis0.encoder.config.mode': 'axis0.encoder.config.mode',
      'axis0.encoder.config.cpr': 'axis0.encoder.config.cpr',
      'axis0.encoder.config.enable_phase_interpolation': 'axis0.encoder.config.enable_phase_interpolation',
      'axis0.encoder.config.ignore_illegal_hall_state': 'axis0.encoder.config.ignore_illegal_hall_state',
      'axis0.encoder.config.hall_polarity': 'axis0.encoder.config.hall_polarity',
      'axis0.controller.config.enable_overspeed_error': 'axis0.controller.config.enable_overspeed_error',
      'axis0.controller.config.spinout_electrical_power_threshold': 'axis0.controller.config.spinout_electrical_power_threshold',
      'axis0.controller.config.spinout_mechanical_power_threshold': 'axis0.controller.config.spinout_mechanical_power_threshold',
      'axis0.controller.config.anticogging.calib_pos_threshold': 'axis0.controller.config.anticogging.calib_pos_threshold',
      'axis0.controller.config.anticogging.calib_vel_threshold': 'axis0.controller.config.anticogging.calib_vel_threshold',
      'axis0.config.can.node_id': 'axis0.config.can.node_id',
      'axis0.config.can.is_extended': 'axis0.config.can.is_extended',
      'axis0.config.can.heartbeat_rate_ms': 'axis0.config.can.heartbeat_rate_ms',
      'axis0.config.can.encoder_error_rate_ms': 'axis0.config.can.encoder_error_rate_ms',
      'axis0.config.can.controller_error_rate_ms': 'axis0.config.can.controller_error_rate_ms',
      'axis0.config.can.motor_error_rate_ms': 'axis0.config.can.motor_error_rate_ms',
      'axis0.config.can.sensorless_error_rate_ms': 'axis0.config.can.sensorless_error_rate_ms',
      'axis0.motor.fet_thermistor.config.temp_limit_lower': 'axis0.motor.fet_thermistor.config.temp_limit_lower',
      'axis0.motor.fet_thermistor.config.temp_limit_upper': 'axis0.motor.fet_thermistor.config.temp_limit_upper',
      'axis0.config.calibration_lockin.current': 'axis0.config.calibration_lockin.current',
      'axis0.config.calibration_lockin.ramp_time': 'axis0.config.calibration_lockin.ramp_time',
      'axis0.config.calibration_lockin.ramp_distance': 'axis0.config.calibration_lockin.ramp_distance',
      'axis0.config.calibration_lockin.accel': 'axis0.config.calibration_lockin.accel',
      'axis0.config.calibration_lockin.vel': 'axis0.config.calibration_lockin.vel',
    }

    if (specialMappings[path]) {
      return specialMappings[path]
    }
    if (path.startsWith('axis0.') || path.startsWith('config.') || path.startsWith('can.')) {
      return path
    }
    return `axis0.${path}`
  }

  _pathToConfigKey(path) {
    const parts = path.split('.')
    const lastPart = parts[parts.length - 1]
    const specialMappings = {
      'torque_constant': 'motor_kv',
      'phase_inductance': 'phase_inductance',
      'phase_resistance': 'phase_resistance',
      'pre_calibrated': path.includes('encoder') ? 'pre_calibrated' : path.includes('motor') ? 'motor_pre_calibrated' : 'pre_calibrated',
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
      'temp_limit_lower': path.includes('fet_thermistor') ? 'fet_temp_limit_lower' : path.includes('motor_thermistor') ? 'motor_temp_limit_lower' : 'temp_limit_lower',
      'temp_limit_upper': path.includes('fet_thermistor') ? 'fet_temp_limit_upper' : path.includes('motor_thermistor') ? 'motor_temp_limit_upper' : 'temp_limit_upper',
      'current': path.includes('calibration_lockin') ? 'lock_in_spin_current' : 'current',
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
      'is_armed', 'is_calibrated', 'current_meas_','DC_calib_',
      'I_bus','phase_current_rev_gain','effective_current_lim',
      'max_allowed_current','max_dc_calib','n_evt_','last_error_time',
      'input_pos','input_vel','input_torque','pos_setpoint',
      'vel_setpoint','torque_setpoint','trajectory_done',
      'vel_integrator_torque','anticogging_valid','autotuning_phase',
      'mechanical_power','electrical_power','endstop_state'
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
}

const odriveRegistry = new ODriveUnifiedRegistry()

export const getBatchPaths = () => odriveRegistry.getBatchPaths()
export const getPropertyMappings = (category) => odriveRegistry.getPropertyMappings(category)
export const generateCommands = (category, config) => odriveRegistry.generateCommands(category, config)
export const generateAllCommands = (deviceConfig) => odriveRegistry.generateAllCommands(deviceConfig)
export const findParameter = (identifier) => odriveRegistry.findParameter(identifier)
export const getCategoryParameters = (category) => odriveRegistry.getCategoryParameters(category)
export const getParameterMetadata = (category, configKey) => odriveRegistry.getParameterMetadata(category, configKey)
export const validateConfig = (category, config) => odriveRegistry.validateConfig(category, config)
export const getDebugInfo = () => odriveRegistry.getDebugInfo()

export { odriveRegistry }
export const ODriveUnifiedCommands = odriveRegistry.configCategories
export const ODriveUnifiedMappings = odriveRegistry.propertyMappingsa