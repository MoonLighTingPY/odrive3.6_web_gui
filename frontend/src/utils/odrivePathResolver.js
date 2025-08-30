/**
 * ODrive Dynamic Path Resolver
 * 
 * This utility provides dynamic property path resolution for different 
 * ODrive firmware versions and axis configurations, eliminating hardcoded paths.
 */

/**
 * Configuration object for path resolution
 */
class ODrivePathConfig {
  constructor(firmwareVersion = "0.5.6", deviceName = "odrv0", defaultAxis = 0) {
    this.firmwareVersion = firmwareVersion
    this.deviceName = deviceName
    this.defaultAxis = defaultAxis
    
    // Parse version
    this.version = this._parseVersion(firmwareVersion)
    this.is06x = this.version.major === 0 && this.version.minor >= 6
  }

  _parseVersion(versionString) {
    if (!versionString || typeof versionString !== 'string') return { major: 0, minor: 5, patch: 6 };
    const parts = versionString.replace('v', '').split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 5,
      patch: parts[2] || 6
    };
  }
}

/**
 * ODrive Path Resolver - Dynamically resolves property paths based on firmware version and config
 */
class ODrivePathResolver {
  constructor(config = new ODrivePathConfig()) {
    this.config = config
    
    // Common system properties for all versions
    this.systemProperties = new Set([
      'hw_version_major', 'hw_version_minor', 'hw_version_variant', 'hw_version_revision',
      'fw_version_major', 'fw_version_minor', 'fw_version_revision', 'fw_version_unreleased',
      'serial_number', 'vbus_voltage', 'ibus', 'ibus_report_filter_k',
      'n_evt_sampling', 'n_evt_control_loop', 'task_timers_armed',
      'system_stats', 'task_times', 'user_config_loaded', 'misconfigured',
      'test_property'
    ])
    
    // Version-specific system properties
    if (this.config.is06x) {
      // 0.6.x specific system properties (0.6.11 API Reference, top-level ODrive)
      this.systemProperties.add('commit_hash')
      this.systemProperties.add('bootloader_version')
      this.systemProperties.add('control_loop_hz')
      this.systemProperties.add('identify')
      this.systemProperties.add('reboot_required')
      // Note: no 'error' and no 'otp_valid' on 0.6.x (Changelog 0.6.1 migration)
    } else {
      // 0.5.x specific
      this.systemProperties.add('error')
      this.systemProperties.add('otp_valid')
      this.systemProperties.add('brake_resistor_armed')
      this.systemProperties.add('brake_resistor_saturated')
      this.systemProperties.add('brake_resistor_current')
    }
  }

  /**
   * Update configuration for new firmware version or device
   */
  updateConfig(firmwareVersion, deviceName, defaultAxis) {
    this.config = new ODrivePathConfig(firmwareVersion, deviceName, defaultAxis)
    
    // Base props common across versions
    this.systemProperties = new Set([
      'hw_version_major', 'hw_version_minor', 'hw_version_variant', 'hw_version_revision',
      'fw_version_major', 'fw_version_minor', 'fw_version_revision', 'fw_version_unreleased',
      'serial_number', 'vbus_voltage', 'ibus', 'ibus_report_filter_k',
      'n_evt_sampling', 'n_evt_control_loop', 'task_timers_armed',
      'system_stats', 'task_times', 'user_config_loaded', 'misconfigured',
      'test_property'
    ])

    if (this.config.is06x) {
      // 0.6.x specific system properties (0.6.11 API Reference, top-level ODrive)
      this.systemProperties.add('commit_hash')
      this.systemProperties.add('bootloader_version')
      this.systemProperties.add('control_loop_hz')
      this.systemProperties.add('identify')
      this.systemProperties.add('reboot_required')
      // Note: no 'error' and no 'otp_valid' on 0.6.x (Changelog 0.6.1 migration)
    } else {
      // 0.5.x specific
      this.systemProperties.add('error')
      this.systemProperties.add('otp_valid')
      this.systemProperties.add('brake_resistor_armed')
      this.systemProperties.add('brake_resistor_saturated')
      this.systemProperties.add('brake_resistor_current')
    }
  }

  /**
   * Resolve a logical path to an ODrive API path
   * @param {string} logicalPath - Logical path like "axis0.motor.config.pole_pairs" or "system.vbus_voltage"
   * @param {number} axis - Override axis number (optional)
   * @returns {string} ODrive API path like "odrv0.axis0.motor.config.pole_pairs"
   */
  resolveToApiPath(logicalPath, axis = null) {
    const effectiveAxis = axis !== null ? axis : this.config.defaultAxis

    // Handle system properties (device-level, no axis prefix)
    if (logicalPath.startsWith('system.')) {
      const systemProp = logicalPath.replace('system.', '')
      if (this.systemProperties.has(systemProp)) {
        return `${this.config.deviceName}.${systemProp}`
      }
    }

    // Handle device-level config properties  
    if (logicalPath.startsWith('config.')) {
      return `${this.config.deviceName}.${logicalPath}`
    }

    // Handle CAN properties (device-level)
    if (logicalPath.startsWith('can.')) {
      return `${this.config.deviceName}.${logicalPath}`
    }

    // Handle system_stats properties (device-level)
    if (logicalPath.startsWith('system_stats.')) {
      return `${this.config.deviceName}.${logicalPath}`
    }

    // Handle axis properties
    if (logicalPath.startsWith('axis0.') || logicalPath.startsWith('axis1.')) {
      // IMPORTANT: Do NOT replace axis numbers! Each axis should keep its own path
      // Only override if explicitly requested via axis parameter
      if (axis !== null) {
        const pathWithoutAxis = logicalPath.replace(/^axis[01]\./, '')
        return `${this.config.deviceName}.axis${axis}.${pathWithoutAxis}`
      }
      // Keep original axis in path
      return `${this.config.deviceName}.${logicalPath}`
    }

    // For unspecified axis-level properties, prefix with effective axis
    if (this.isAxisProperty(logicalPath)) {
      return `${this.config.deviceName}.axis${effectiveAxis}.${logicalPath}`
    }

    // Default: assume it's a device property
    return `${this.config.deviceName}.${logicalPath}`
  }

  /**
   * Resolve a logical path to a property read path (for batch API)
   * @param {string} logicalPath - Logical path  
   * @param {number} axis - Override axis number (optional)
   * @returns {string} Property read path like "device.axis0.motor.config.pole_pairs"
   */
  resolveToPropertyPath(logicalPath, axis = null) {
    const apiPath = this.resolveToApiPath(logicalPath, axis)
    // Convert from API path (odrv0.xxx) to property path (device.xxx) 
    return apiPath.replace(`${this.config.deviceName}.`, 'device.')
  }

  /**
   * Convert an API path back to logical path
   * @param {string} apiPath - API path like "odrv0.axis0.motor.config.pole_pairs"
   * @returns {string} Logical path like "axis0.motor.config.pole_pairs"
   */
  apiPathToLogical(apiPath) {
    // Remove device prefix
    const devicePrefix = `${this.config.deviceName}.`
    if (apiPath.startsWith(devicePrefix)) {
      return apiPath.replace(devicePrefix, '')
    }
    return apiPath
  }

  /**
   * Generate a command string for setting a property
   * @param {string} logicalPath - Logical path
   * @param {any} value - Value to set
   * @param {number} axis - Override axis number (optional)
   * @returns {string} Command string like "odrv0.axis0.motor.config.pole_pairs = 7"
   */
  generateCommand(logicalPath, value, axis = null) {
    const apiPath = this.resolveToApiPath(logicalPath, axis)
    
    // Handle special value formatting
    let formattedValue = value
    if (typeof value === 'boolean') {
      formattedValue = value ? 'True' : 'False'
    } else if (value === 'inf' || value === Infinity) {
      formattedValue = 1000000
    }
    
    return `${apiPath} = ${formattedValue}`
  }

  /**
   * Determine if a property is axis-specific
   * @param {string} logicalPath - Logical path
   * @returns {boolean} True if property belongs to an axis
   */
  isAxisProperty(logicalPath) {
    const axisKeywords = [
      'motor', 'encoder', 'controller', 'trap_traj', 'sensorless_estimator',
      'endstop', 'mechanical_brake', 'pos_vel_mapper', 'commutation_mapper',
      'interpolator', 'enable_pin', 'requested_state', 'current_state',
      'pos_estimate', 'vel_estimate', 'is_calibrated', 'load_mapper',
      'harmonic_compensation', 'thermal_current_limiter', 'motor_thermistor_current_limiter',
      'detailed_disarm_reason', 'active_errors', 'disarm_reason',
      'procedure_result', 'observed_encoder_scale_factor'
    ]
    
    return axisKeywords.some(keyword => logicalPath.includes(keyword))
  }

  /**
   * Check if a property exists in the current firmware version
   * @param {string} logicalPath - Logical path to check
   * @returns {boolean} True if property exists in current firmware
   */
  isPropertySupported(logicalPath) {
    const p = logicalPath

    if (!this.config.is06x) {
      // 0.5.x: hide 0.6.x-only bits from 0.5.x UI
      const v06xOnlyProps = [
        'commit_hash', 'bootloader_version', 'control_loop_hz',
        'reboot_required', 'identify', 'pos_vel_mapper', 'commutation_mapper',
        'interpolator', 'mechanical_brake', 'user_config_0', 'user_config_1',
        'user_config_2', 'user_config_3', 'user_config_4', 'user_config_5',
        'user_config_6', 'user_config_7', 'dc_max_positive_current',
        'dc_max_negative_current', 'load_mapper', 'harmonic_compensation',
        'thermal_current_limiter', 'motor_thermistor_current_limiter',
        'detailed_disarm_reason', 'active_errors', 'observed_encoder_scale_factor',
        'brake_resistor0', 'effective_baudrate', 'n_restarts', 'n_rx', 'identify_once'
      ]
      if (v06xOnlyProps.some(x => p.includes(x))) return false
    } else {
      // 0.6.x: hide 0.5.x-only/removed/moved props
      const removedOrMoved = [
        // Top-level removed in 0.6.x
        'system.error', 'otp_valid',
        'brake_resistor_armed', 'brake_resistor_saturated', 'brake_resistor_current',

        // 0.5.x root config flags not present in 0.6.x
        'config.enable_can_a', 'config.enable_i2c_a',
        'config.enable_brake_resistor', 'config.brake_resistance',
        'config.enable_dc_bus_overvoltage_ramp',
        'config.dc_bus_overvoltage_ramp_start',
        'config.dc_bus_overvoltage_ramp_end',

        // CAN field moved/removed
        'can.config.is_extended',

        // UART/I2C variants not present on 0.6.x API
        'config.enable_uart_b', 'config.enable_uart_c',
        'config.uart1_protocol', 'config.uart2_protocol',
        'config.uart_b_baudrate', 'config.uart_c_baudrate',

        // error GPIO pin moved to axis.config.error_gpio_pin
        'config.error_gpio_pin',
        
        // 0.5.x encoder properties not in 0.6.x mappers
        'is_ready', 'shadow_count', 'count_in_cpr', 'pos_estimate_counts', 
        'pos_circular', 'vel_estimate_counts', 'delta_pos_cpr_counts',
        'hall_state', 'calib_scan_response', 'pos_abs', 'spi_error_rate',
        
        // Motor properties that changed structure in 0.6.x
        'current_meas_phA', 'current_meas_phB', 'current_meas_phC',
        'DC_calib_phA', 'DC_calib_phB', 'DC_calib_phC', 'I_bus',
        'phase_current_rev_gain', 'max_allowed_current', 'max_dc_calib',
        'n_evt_current_measurement', 'n_evt_pwm_update', 'current_meas_status',
        
        // Current control structure changes
        'current_control.p_gain', 'current_control.i_gain',
        'current_control.v_current_control_integral_d', 'current_control.v_current_control_integral_q',
        'current_control.Iq_setpoint', 'current_control.Id_setpoint', 'current_control.power',
        'current_control.Vq_setpoint', 'current_control.Vd_setpoint',
        
        // GPIO analog mapping that may not exist in 0.6.x
        'config.gpio3_analog_mapping', 'config.gpio4_analog_mapping',
        
        // System stats that may not exist
        'system_stats.max_stack_usage_usb', 'system_stats.max_stack_usage_can', 
        'system_stats.max_stack_usage_analog', 'system_stats.stack_size_usb',
        'system_stats.stack_size_can', 'system_stats.stack_size_analog',
        'system_stats.prio_usb', 'system_stats.prio_can', 'system_stats.prio_analog'
      ]
      if (removedOrMoved.some(x => p.includes(x))) return false
    }

    return true
  }

  /**
   * Get corrected property path for firmware differences
   * @param {string} logicalPath - Original logical path
   * @returns {string} Corrected path for current firmware
   */
  getCompatiblePath(logicalPath) {
    if (this.config.is06x) {
      // Handle renamed properties in 0.6.x
      return logicalPath
        .replace('.endstop_state', '.state')
        .replace('.is_saturated', '.was_saturated')
        .replace('amt21_encoder_group0', 'rs485_encoder_group0')
    }
    
    return logicalPath
  }

  /**
   * Get debug info about current configuration
   * @returns {object} Debug information
   */
  getDebugInfo() {
    return {
      firmwareVersion: this.config.firmwareVersion,
      deviceName: this.config.deviceName,
      defaultAxis: this.config.defaultAxis,
      is06x: this.config.is06x,
      systemPropertiesCount: this.systemProperties.size,
      version: this.config.version
    }
  }
}

// Global path resolver instance
let globalPathResolver = new ODrivePathResolver()

/**
 * Set global ODrive path resolver configuration
 * @param {string} firmwareVersion - Firmware version like "0.6.10"  
 * @param {string} deviceName - Device name like "odrv0"
 * @param {number} defaultAxis - Default axis number (0 or 1)
 */
export const setPathResolverConfig = (firmwareVersion, deviceName = "odrv0", defaultAxis = 0) => {
  globalPathResolver.updateConfig(firmwareVersion, deviceName, defaultAxis)
}

/**
 * Get the global path resolver instance
 * @returns {ODrivePathResolver} Global path resolver
 */
export const getPathResolver = () => globalPathResolver

/**
 * Convenience functions using global resolver
 */
export const resolveToApiPath = (logicalPath, axis = null) => 
  globalPathResolver.resolveToApiPath(logicalPath, axis)

export const resolveToPropertyPath = (logicalPath, axis = null) =>
  globalPathResolver.resolveToPropertyPath(logicalPath, axis)

export const generateCommand = (logicalPath, value, axis = null) =>
  globalPathResolver.generateCommand(logicalPath, value, axis)

export const isPropertySupported = (logicalPath) =>
  globalPathResolver.isPropertySupported(logicalPath)

export const getCompatiblePath = (logicalPath) =>
  globalPathResolver.getCompatiblePath(logicalPath)

export const getPathResolverDebugInfo = () =>
  globalPathResolver.getDebugInfo()

export { ODrivePathResolver, ODrivePathConfig }