import { odriveRegistry } from './odriveUnifiedRegistry'

/**
 * Generate a complete preset configuration using all available parameters.
 * This version is robust to missing metadata and always fills in baseConfig values.
 * @param {Object} baseConfig - Base configuration values to override defaults
 * @returns {Object} Complete configuration object with all writable parameters
 */
export const generateFullConfig = (baseConfig = {}) => {
  const config = {
    power: {},
    motor: {},
    encoder: {},
    control: {},
    interface: {}
  }

  // Get all categories and their parameters from the unified registry
  const categories = odriveRegistry.getConfigCategories()

  Object.entries(categories).forEach(([category, parameters]) => {
    parameters.forEach(param => {
      // Always use the configKey from the registry
      const configKey = param.configKey
      const metadata = odriveRegistry.getParameterMetadata(category, configKey)
      const categoryConfig = baseConfig[category] || {}

      // Prefer baseConfig value if present, otherwise use default
      if (categoryConfig[configKey] !== undefined) {
        config[category][configKey] = categoryConfig[configKey]
      } else if (metadata && metadata.writable) {
        config[category][configKey] = getDefaultValue(metadata)
      }
      // If not writable or no metadata, skip
    })
  })

  // Also copy any extra keys from baseConfig that are not in the registry (for forward compatibility)
  Object.entries(baseConfig).forEach(([category, values]) => {
    if (!config[category]) config[category] = {}
    Object.entries(values).forEach(([key, value]) => {
      if (config[category][key] === undefined) {
        config[category][key] = value
      }
    })
  })

  return config
}

/**
 * Get appropriate default value based on parameter metadata
 * @param {Object} metadata - Parameter metadata from property tree
 * @returns {*} Default value
 */
const getDefaultValue = (metadata) => {
  if (metadata.defaultValue !== undefined) {
    return metadata.defaultValue
  }
  switch (metadata.type) {
    case 'boolean':
      return false
    case 'number':
      return metadata.min !== undefined ? metadata.min : 0
    case 'string':
      return ''
    default:
      return 0
  }
}

/**
 * Factory presets for common motor configurations
 */
export const FACTORY_PRESET_BASES = {
  'High Current Motor - D6374 150KV': {
    name: 'High Current Motor - D6374 150KV',
    description: 'High current motor D6374 with 150KV rating',
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '0.5.6',
    isFactory: true,
    baseConfig: {
      power: {
        dc_bus_overvoltage_trip_level: 56.0,
        dc_bus_undervoltage_trip_level: 10.0,
        dc_max_positive_current: 20.0,
        dc_max_negative_current: -20.0,
        brake_resistance: 2.0,
        enable_brake_resistor: true,
        max_regen_current: 10.0
      },
      motor: {
        motor_type: 0,
        pole_pairs: 7,
        motor_kv: 150,
        current_lim: 40.0,
        torque_lim: 8.27 / 150,
        calibration_current: 10.0,
        resistance_calib_max_voltage: 12.0,
        lock_in_spin_current: 10.0,
        phase_resistance: 0.04,
        phase_inductance: 3.5e-5,
        pre_calibrated: false,
        current_control_bandwidth: 1000.0,
        torque_constant: 8.27 / 150
      },
      encoder: {
        mode: 1,
        cpr: 4000,
        bandwidth: 1000,
        use_index: false,
        pre_calibrated: false,
        calib_range: 0.02,
        calib_scan_distance: 16384,
        calib_scan_omega: 12.566,
        direction: 1,
        use_index_offset: false,
        find_idx_on_lockin_only: false,
        ignore_illegal_hall_state: false
      },
      control: {
        control_mode: 3,
        input_mode: 1,
        vel_limit: 10.0,
        pos_gain: 20.0,
        vel_gain: 0.16,
        vel_integrator_gain: 0.32,
        vel_limit_tolerance: 1.2,
        vel_ramp_rate: 10.0,
        torque_ramp_rate: 0.01,
        circular_setpoints: false,
        inertia: 0.0,
        input_filter_bandwidth: 2.0,
        enable_overspeed_error: true,
        enable_vel_limit: true,
        enable_gain_scheduling: false,
        spinout_electrical_power_threshold: 1000.0,
        spinout_mechanical_power_threshold: 1000.0
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
    description: 'Gimbal motor GBM2804 with 100KV rating',
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '0.5.6',
    isFactory: true,
    baseConfig: {
      power: {
        dc_bus_overvoltage_trip_level: 56.0,
        dc_bus_undervoltage_trip_level: 10.0,
        dc_max_positive_current: 10.0,
        dc_max_negative_current: -10.0,
        brake_resistance: 2.0,
        enable_brake_resistor: false,
        max_regen_current: 5.0
      },
      motor: {
        motor_type: 2,
        pole_pairs: 7,
        motor_kv: 100,
        current_lim: 5.0,
        torque_lim: 8.27 / 100,
        calibration_current: 1.0,
        resistance_calib_max_voltage: 4.0,
        lock_in_spin_current: 1.0,
        phase_resistance: 12.0,
        phase_inductance: 8.5e-3,
        pre_calibrated: false,
        current_control_bandwidth: 100.0,
        torque_constant: 8.27 / 100
      },
      encoder: {
        mode: 1,
        cpr: 4000,
        bandwidth: 1000,
        use_index: false,
        pre_calibrated: false,
        calib_range: 0.02,
        calib_scan_distance: 16384,
        calib_scan_omega: 12.566,
        direction: 1,
        use_index_offset: false,
        find_idx_on_lockin_only: false,
        ignore_illegal_hall_state: false
      },
      control: {
        control_mode: 3,
        input_mode: 1,
        vel_limit: 20.0,
        pos_gain: 20.0,
        vel_gain: 0.04,
        vel_integrator_gain: 0.08,
        vel_limit_tolerance: 1.2,
        vel_ramp_rate: 10.0,
        torque_ramp_rate: 0.01,
        circular_setpoints: false,
        inertia: 0.0,
        input_filter_bandwidth: 2.0,
        enable_overspeed_error: true,
        enable_vel_limit: true,
        enable_gain_scheduling: false,
        spinout_electrical_power_threshold: 100.0,
        spinout_mechanical_power_threshold: 100.0
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

  'Hoverboard Motor - 6.5" Wheel': {
    name: 'Hoverboard Motor - 6.5" Wheel',
    description: 'Typical 6.5" hoverboard hub motor',
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '0.5.6',
    isFactory: true,
    baseConfig: {
      power: {
        dc_bus_overvoltage_trip_level: 56.0,
        dc_bus_undervoltage_trip_level: 8.0,
        dc_max_positive_current: 60.0,
        dc_max_negative_current: -60.0,
        brake_resistance: 2.0,
        enable_brake_resistor: true,
        max_regen_current: 20.0
      },
      motor: {
        motor_type: 0,
        pole_pairs: 15,
        motor_kv: 16,
        current_lim: 60.0,
        torque_lim: 8.27 / 16,
        calibration_current: 10.0,
        resistance_calib_max_voltage: 4.0,
        lock_in_spin_current: 10.0,
        phase_resistance: 0.05,
        phase_inductance: 0.000015,
        pre_calibrated: false,
        current_control_bandwidth: 1000.0,
        torque_constant: 8.27 / 16
      },
      encoder: {
        mode: 0,
        cpr: 90,
        bandwidth: 1000,
        use_index: false,
        pre_calibrated: false,
        calib_range: 0.02,
        calib_scan_distance: 50.27,
        calib_scan_omega: 12.566,
        direction: 1,
        use_index_offset: false,
        find_idx_on_lockin_only: false,
        ignore_illegal_hall_state: false,
        hall_polarity: 0
      },
      control: {
        control_mode: 2,
        input_mode: 1,
        vel_limit: 2.0,
        pos_gain: 1.0,
        vel_gain: 0.02,
        vel_integrator_gain: 0.1,
        vel_limit_tolerance: 1.2,
        vel_ramp_rate: 1.0,
        torque_ramp_rate: 0.01,
        circular_setpoints: false,
        inertia: 0.0,
        input_filter_bandwidth: 2.0,
        enable_overspeed_error: true,
        enable_vel_limit: true,
        enable_gain_scheduling: false,
        spinout_electrical_power_threshold: 2500.0,
        spinout_mechanical_power_threshold: 2500.0
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

// Map legacy baseConfig keys to unified registry config keys
function mapBaseConfigKeys(baseConfig) {
  const categories = odriveRegistry.getConfigCategories();
  const mappedConfig = {};

  Object.entries(baseConfig).forEach(([category, values]) => {
    mappedConfig[category] = {};
    const params = categories[category] || [];
    // Build a mapping from legacy keys to registry keys
    const keyMap = {};
    params.forEach(param => {
      keyMap[param.path.split('.').pop()] = param.configKey;
      keyMap[param.configKey] = param.configKey;
    });

    Object.entries(values).forEach(([key, value]) => {
      // Try to map legacy key to registry configKey
      const mappedKey = keyMap[key] || key;
      mappedConfig[category][mappedKey] = value;
    });
  });

  return mappedConfig;
}

// Helper to get a full factory preset at runtime
export function getFactoryPreset(name) {
  const base = FACTORY_PRESET_BASES[name];
  if (!base) return null;
  // Map baseConfig keys before generating full config
  const mappedBaseConfig = mapBaseConfigKeys(base.baseConfig);
  return {
    ...base,
    config: generateFullConfig(mappedBaseConfig)
  };
}