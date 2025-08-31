/**
 * Unified ODrive Registry for 0.6.x - Single Source of Truth
 * 
 * This system uses odrivePropertyTree06 as the master source and automatically
 * generates all other data structures (commands, batch paths, mappings, etc.)
 * for ODrive firmware 0.6.x
 */

import { odrivePropertyTree06 } from './odrivePropertyTree_0_6.js'

class ODriveUnifiedRegistry06 {
  constructor(propertyTree = odrivePropertyTree06) {
    this.propertyTree = propertyTree
    this.configCategories = this._generateConfigCategories()
    this.batchPaths = this._generateBatchPaths()
    this.propertyMappings = this._generatePropertyMappings()
    this.commandGenerators = this._generateCommandGenerators()
    this.commands = this._generateCommands()

    console.log('ODrive Unified Registry 0.6.x initialized:', {
      categories: Object.keys(this.configCategories),
      totalParams: Object.values(this.configCategories).reduce((sum, params) => sum + params.length, 0),
      batchPathsCount: this.batchPaths.length,
      commandsCount: Object.values(this.commands).reduce((sum, cmds) => sum + cmds.length, 0)
    })
  }

  _generateConfigCategories() {
    const categories = { power: [], motor: [], encoder: [], control: [], interface: [] }

    this._traversePropertyTree((path, property) => {
      if (property.writable) {
        const category = this._inferCategory(path)
        if (category) {
          categories[category].push({
            path,
            property,
            configKey: this._pathToConfigKey(path),
            odriveCommand: this._pathToODriveCommand(path)
          })
        }
      }
    })

    return categories
  }

  _generateBatchPaths() {
    const paths = []

    this._traversePropertyTree((path, property) => {
      if (this._isConfigParameter(path) || !property.writable) {
        paths.push(path)
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
        mappings[category][param.configKey] = param.path
      })
    })

    return mappings
  }

  _generateCommandGenerators() {
    const generators = {}

    Object.entries(this.configCategories).forEach(([category, params]) => {
      generators[category] = (config = {}, axisNumber = 0) => {
        const commands = []
        params.forEach(param => {
          const value = config[param.configKey]
          if (value !== undefined) {
            let command = param.odriveCommand
            if (command.includes('axis0')) {
              command = command.replace('axis0', `axis${axisNumber}`)
            } else if (command.includes('axis1')) {
              command = command.replace('axis1', `axis${axisNumber}`)
            }
            commands.push(`odrv0.${command} = ${value}`)
          }
        })
        return commands
      }
    })

    return generators
  }

  _generateCommands() {
    const commands = { power: [], motor: [], encoder: [], control: [], interface: [], system: [], calibration: [] }
    
    this._addSpecialCommands(commands)
    return commands
  }

  _inferCategory(path) {
    // 0.6.x specific category inference
    if (path.startsWith('config.dc_bus_') || path.startsWith('config.max_regen_current') || 
        path.includes('brake_resistor') || path.includes('power')) {
      return 'power'
    }
    if (path.includes('motor') || path.includes('current_lim') || path.includes('pole_pairs') ||
        path.includes('torque') || path.includes('motor_kv') || path.includes('resistance') ||
        path.includes('inductance') || path.includes('thermistor')) {
      return 'motor'
    }
    if (path.includes('encoder') || path.includes('cpr') || path.includes('bandwidth') ||
        path.includes('index') || path.includes('hall') || path.includes('inc_encoder') ||
        path.includes('spi_encoder') || path.includes('rs485_encoder')) {
      return 'encoder'
    }
    if (path.includes('controller') || path.includes('control') || path.includes('pos_gain') ||
        path.includes('vel_gain') || path.includes('vel_integrator_gain') || 
        path.includes('input_mode') || path.includes('control_mode') || 
        path.includes('circular_setpoints') || path.includes('inertia') ||
        path.includes('anticogging') || path.includes('filter')) {
      return 'control'
    }
    if (path.includes('can') || path.includes('uart') || path.includes('step_dir') ||
        path.includes('watchdog') || path.includes('gpio') || path.includes('sensorless') ||
        path.includes('enable_')) {
      return 'interface'
    }
    return null
  }

  _pathToConfigKey(path) {
    // Convert property paths to config keys for 0.6.x
    return path.replace(/^(system\.|config\.|axis[01]\.)/, '').replace(/\./g, '_')
  }

  _pathToODriveCommand(path) {
    // Updated mappings for 0.6.x API structure
    const specialMappings = {
      // 0.6.x system mappings
      'system.dc_bus_overvoltage_trip_level': 'config.dc_bus_overvoltage_trip_level',
      'system.dc_bus_undervoltage_trip_level': 'config.dc_bus_undervoltage_trip_level', 
      'system.dc_max_positive_current': 'config.dc_max_positive_current',
      'system.dc_max_negative_current': 'config.dc_max_negative_current',
      'system.max_regen_current': 'config.max_regen_current',
      
      // Calibration lockin properties remain similar
      'axis0.config.calibration_lockin.ramp_time': 'axis0.config.calibration_lockin.ramp_time',
      'axis0.config.calibration_lockin.ramp_distance': 'axis0.config.calibration_lockin.ramp_distance',
      'axis0.config.calibration_lockin.accel': 'axis0.config.calibration_lockin.accel',
      'axis0.config.calibration_lockin.vel': 'axis0.config.calibration_lockin.vel',
    }

    // Check for exact match first
    if (specialMappings[path]) {
      return specialMappings[path]
    }

    // Handle system properties that start with 'system.'
    if (path.startsWith('system.')) {
      const systemProp = path.replace('system.', '')
      return systemProp // Map directly to device root (no axis0 prefix)
    }

    // Handle config properties
    if (path.startsWith('config.')) {
      return path // Keep as-is for device root config
    }

    // Handle axis properties (0.6.x structure is similar to 0.5.x for axis properties)
    return path
  }

  _isConfigParameter(path) {
    return path.includes('config') || path.startsWith('axis') || path.startsWith('system')
  }

  _addSpecialCommands(commands) {
    // Add system commands that don't map directly to properties (updated for 0.6.x)
    commands.system.push(
      { name: "Reboot Device", command: "odrv0.reboot()", description: "Reboot the ODrive device" },
      { name: "Save Configuration", command: "odrv0.save_configuration()", description: "Save current configuration to non-volatile memory" },
      { name: "Erase Configuration", command: "odrv0.erase_configuration()", description: "Erase configuration and restore factory defaults" },
      { name: "Clear Errors", command: "odrv0.clear_errors()", description: "Clear all error flags on the device" },
      { name: "Identify Once", command: "odrv0.identify_once()", description: "Blink LED once for identification (0.6.x)" }
    )

    // Add calibration state commands (0.6.x state values may be different)
    commands.calibration.push(
      { name: "Set Axis State - Idle", command: "odrv0.axis0.requested_state = 1", description: "Set axis to idle state" },
      { name: "Set Axis State - Full Calibration", command: "odrv0.axis0.requested_state = 3", description: "Start full calibration sequence" },
      { name: "Set Axis State - Motor Calibration", command: "odrv0.axis0.requested_state = 4", description: "Start motor calibration" },
      { name: "Set Axis State - Encoder Index Search", command: "odrv0.axis0.requested_state = 6", description: "Start encoder index search" },
      { name: "Set Axis State - Encoder Offset Cal", command: "odrv0.axis0.requested_state = 7", description: "Start encoder offset calibration" },
      { name: "Set Axis State - Closed Loop", command: "odrv0.axis0.requested_state = 8", description: "Enter closed loop control" },
      { name: "Set Axis State - Lockin Spin", command: "odrv0.axis0.requested_state = 9", description: "Start lockin spin calibration" },
      { name: "Set Axis State - Encoder Dir Find", command: "odrv0.axis0.requested_state = 10", description: "Start encoder direction finding" },
      { name: "Set Axis State - Homing", command: "odrv0.axis0.requested_state = 11", description: "Start homing sequence (0.6.x)" },
      { name: "Set Axis State - Anticogging Cal", command: "odrv0.axis0.requested_state = 14", description: "Start anticogging calibration (0.6.x)" }
    )
  }

  // Public API methods
  getBatchPaths() {
    return this.batchPaths
  }

  getConfigCategories() {
    return this.configCategories
  }

  getPropertyMappings() {
    return this.propertyMappings
  }

  getCommands() {
    return this.commands
  }

  generateAllCommands(config = {}, axisNumber = 0) {
    const allCommands = []
    Object.entries(this.commandGenerators).forEach(([category, generator]) => {
      const categoryCommands = generator(config[category] || config, axisNumber)
      allCommands.push(...categoryCommands)
    })
    return allCommands
  }

  validateConfig(category, config) {
    const categoryParams = this.configCategories[category] || []
    const errors = []
    const warnings = []

    categoryParams.forEach(param => {
      const value = config[param.configKey]
      if (value !== undefined && param.property.type === 'number') {
        if (isNaN(value)) {
          errors.push(`${param.property.name}: Value must be a number`)
        }
      }
    })

    return { valid: errors.length === 0, errors, warnings }
  }

  getDebugInfo() {
    return {
      version: '0.6.x',
      totalCategories: Object.keys(this.configCategories).length,
      totalParameters: Object.values(this.configCategories).reduce((sum, params) => sum + params.length, 0),
      totalBatchPaths: this.batchPaths.length,
      totalCommands: Object.values(this.commands).reduce((sum, cmds) => sum + cmds.length, 0),
      categories: Object.fromEntries(
        Object.entries(this.configCategories).map(([cat, params]) => [cat, params.length])
      )
    }
  }
}

// Create singleton instance for 0.6.x
const odriveRegistry06 = new ODriveUnifiedRegistry06()

// Export functions that components expect
export const getBatchPaths = () => odriveRegistry06.getBatchPaths()
export const getConfigCategories = () => odriveRegistry06.getConfigCategories()
export const generateAllCommands = (config, axisNumber) => odriveRegistry06.generateAllCommands(config, axisNumber)
export const validateConfig = (category, config) => odriveRegistry06.validateConfig(category, config)
export const getDebugInfo = () => odriveRegistry06.getDebugInfo()

// Add the missing export that the components expect
export const ODrivePropertyMappings = odriveRegistry06.getPropertyMappings()

export { odriveRegistry06 }
export const ODriveUnifiedCommands = odriveRegistry06.configCategories
export const ODriveUnifiedMappings = odriveRegistry06.propertyMappings

export const ODriveCommands = odriveRegistry06.getCommands()