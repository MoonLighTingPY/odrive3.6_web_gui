/**
 * ODrive Dynamic Path Resolver
 * 
 * This utility provides dynamic property path resolution for different 
 * ODrive firmware versions and axis configurations, eliminating hardcoded paths.
 */

/**
 * Configuration object for path resolution
 */
export class ODrivePathConfig {
  constructor(firmwareVersion = "0.5.6", deviceName = "odrv0", defaultAxis = 0) {
    this.firmwareVersion = firmwareVersion
    this.deviceName = deviceName
    this.defaultAxis = defaultAxis
    this.isV06x = this.parseVersion(firmwareVersion).major === 0 && this.parseVersion(firmwareVersion).minor >= 6
  }

  parseVersion(versionString) {
    if (!versionString || typeof versionString !== 'string') return { major: 0, minor: 5, patch: 6 }
    const cleanVersion = versionString.replace(/^v/, '')
    const parts = cleanVersion.split('.').map(Number)
    return {
      major: parts[0] || 0,
      minor: parts[1] || 5,
      patch: parts[2] || 6
    }
  }
}

/**
 * ODrive Path Resolver - Version-aware path resolution
 * Handles both 0.5.6 and 0.6.x API differences
 */
export class ODrivePathResolver {
  constructor(config) {
    this.config = config
  }

  /**
   * Resolve logical path to actual ODrive API path
   */
  resolve(logicalPath) {
    // Handle system-level properties (no axis prefix needed)
    if (logicalPath.startsWith('system.')) {
      return logicalPath.replace('system.', '')
    }

    // Handle config properties (device-level)
    if (logicalPath.startsWith('config.')) {
      return logicalPath // Keep as-is
    }

    // Handle CAN properties
    if (logicalPath.startsWith('can.')) {
      return logicalPath // Keep as-is
    }

    // Handle axis-specific properties
    const axisMatch = logicalPath.match(/^axis(\d+)\.(.+)/)
    if (axisMatch) {
      const axisNum = parseInt(axisMatch[1])
      const propertyPath = axisMatch[2]
      
      // Version-specific path handling
      if (this.config.isV06x) {
        return this.resolveV06xAxisPath(axisNum, propertyPath)
      } else {
        return this.resolveV05xAxisPath(axisNum, propertyPath)
      }
    }

    // Fallback: return path as-is
    return logicalPath
  }

  /**
   * Resolve 0.6.x axis paths with new component structure
   */
  resolveV06xAxisPath(axisNum, propertyPath) {
  // Handle new 0.6.x components
  if (propertyPath.startsWith('load_mapper.')) {
    return `axis${axisNum}.load_mapper.${propertyPath.replace('load_mapper.', '')}`
  }
  if (propertyPath.startsWith('commutation_mapper.')) {
    return `axis${axisNum}.commutation_mapper.${propertyPath.replace('commutation_mapper.', '')}`
  }
  if (propertyPath.startsWith('pos_vel_mapper.')) {
    return `axis${axisNum}.pos_vel_mapper.${propertyPath.replace('pos_vel_mapper.', '')}`
  }
  if (propertyPath.startsWith('harmonic_compensation.')) {
    return `axis${axisNum}.harmonic_compensation.${propertyPath.replace('harmonic_compensation.', '')}`
  }
  if (propertyPath.startsWith('thermal_current_limiter.')) {
    return `axis${axisNum}.thermal_current_limiter.${propertyPath.replace('thermal_current_limiter.', '')}`
  }
  if (propertyPath.startsWith('motor_thermistor_current_limiter.')) {
    return `axis${axisNum}.motor_thermistor_current_limiter.${propertyPath.replace('motor_thermistor_current_limiter.', '')}`
  }
  if (propertyPath.startsWith('sensorless_estimator.')) {
    return `axis${axisNum}.sensorless_estimator.${propertyPath.replace('sensorless_estimator.', '')}`
  }
  if (propertyPath.startsWith('inverter.')) {
    return `axis${axisNum}.inverter.${propertyPath.replace('inverter.', '')}`
  }

  // Handle 0.6.x init properties at axis level
  if (['init_pos', 'init_vel', 'init_torque'].includes(propertyPath)) {
    return `axis${axisNum}.config.${propertyPath}`
  }

  // Handle detailed_disarm_reason (0.6.x only)
  if (propertyPath === 'detailed_disarm_reason') {
    return `axis${axisNum}.detailed_disarm_reason`
  }

  // Standard axis properties
  return `axis${axisNum}.${propertyPath}`
}

  /**
   * Resolve 0.5.x axis paths with legacy structure
   */
  resolveV05xAxisPath(axisNum, propertyPath) {
    // 0.5.x doesn't have new mapper components - filter them out
    const newV06xComponents = [
      'load_mapper', 'commutation_mapper', 'pos_vel_mapper',
      'harmonic_compensation', 'thermal_current_limiter',
      'motor_thermistor_current_limiter', 'sensorless_estimator',
      'detailed_disarm_reason'
    ]
    
    if (newV06xComponents.some(comp => propertyPath.startsWith(comp))) {
      throw new Error(`Component ${propertyPath.split('.')[0]} not supported in firmware ${this.config.firmwareVersion}`)
    }

    // Standard 0.5.x axis properties
    return `axis${axisNum}.${propertyPath}`
  }

  /**
   * Check if property is supported in current firmware version
   */
  isPropertySupported(logicalPath) {
    if (this.config.isV06x) {
      // All properties supported in 0.6.x
      return true
    } else {
      // Check if it's a 0.6.x-only property
      const v06xOnlyPatterns = [
        'load_mapper', 'commutation_mapper', 'pos_vel_mapper',
        'harmonic_compensation', 'thermal_current_limiter',
        'motor_thermistor_current_limiter', 'sensorless_estimator',
        'detailed_disarm_reason', 'brake_resistor0',
        'init_pos', 'init_vel', 'init_torque'
      ]
      
      return !v06xOnlyPatterns.some(pattern => logicalPath.includes(pattern))
    }
  }
}

// Global path resolver instance
let globalPathResolver = new ODrivePathResolver(new ODrivePathConfig())

export const setPathResolverConfig = (firmwareVersion, deviceName = "odrv0", defaultAxis = 0) => {
  globalPathResolver = new ODrivePathResolver(new ODrivePathConfig(firmwareVersion, deviceName, defaultAxis))
}

export const getPathResolver = () => globalPathResolver

// Helper functions for backward compatibility
export const resolveToApiPath = (logicalPath, axis = 0) => {
  return globalPathResolver.resolve(logicalPath.replace(/^axis\d+\./, `axis${axis}.`))
}

export const resolveToPropertyPath = (logicalPath) => {
  const resolved = globalPathResolver.resolve(logicalPath)
  return `device.${resolved}`
}

export const isPropertySupported = (logicalPath) => {
  return globalPathResolver.isPropertySupported(logicalPath)
}

/**
 * Get compatible path for current firmware version
 * @param {string} logicalPath - Logical property path
 * @returns {string} Compatible path for current firmware
 */
export const getCompatiblePath = (logicalPath) => {
  return globalPathResolver.resolve(logicalPath)
}

/**
 * Generate command for a property
 * @param {string} logicalPath - Logical property path  
 * @param {any} value - Value to set
 * @param {number} axisNumber - Target axis (optional)
 * @returns {string} Command string
 */
export const generateCommand = (logicalPath, value, axisNumber = null) => {
  const pathResolver = getPathResolver()
  const deviceName = pathResolver.config.deviceName
  
  // Handle axis-specific paths
  let resolvedPath = logicalPath
  if (axisNumber !== null && !logicalPath.startsWith('axis') && !logicalPath.startsWith('system.') && !logicalPath.startsWith('config.') && !logicalPath.startsWith('can.')) {
    resolvedPath = `axis${axisNumber}.${logicalPath}`
  }
  
  const apiPath = pathResolver.resolve(resolvedPath)
  return `${deviceName}.${apiPath} = ${typeof value === 'string' && !value.includes(' ') ? value : JSON.stringify(value)}`
}