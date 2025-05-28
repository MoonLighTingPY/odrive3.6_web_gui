import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // UI Preferences
  uiPreferences: {
    useRpmUnits: true, // Global setting for RPM vs rad/s
  },

  // Power Configuration
  powerConfig: {
    dc_bus_overvoltage_trip_level: 56.0,
    dc_bus_undervoltage_trip_level: 10.0,
    dc_max_positive_current: 10.0,
    dc_max_negative_current: -10.0,
    brake_resistance: 2.0,
    brake_resistor_enabled: false,
  },
  
  // Motor Configuration
  motorConfig: {
    motor_type: 0, // HIGH_CURRENT
    pole_pairs: 7,
    motor_kv: 230,
    current_lim: 10.0,
    calibration_current: 10.0,
    resistance_calib_max_voltage: 4.0,
    lock_in_spin_current: 10.0,
    phase_resistance: 0.0,
    phase_inductance: 0.0,
  },
  
  // Encoder Configuration
  encoderConfig: {
    encoder_type: 1, // INCREMENTAL
    cpr: 4000,
    bandwidth: 1000.0,
    use_index: false,
    calib_range: 0.02,
    calib_scan_distance: 16384.0,
    calib_scan_omega: 12.566,
    use_separate_encoder: false,
  },
  
  // Control Configuration
  controlConfig: {
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
    axis_to_mirror: 255,
    mirror_ratio: 1.0,
    load_encoder_axis: 0,
    input_filter_bandwidth: 2.0,
  },
  
  // Interface Configuration
  interfaceConfig: {
    // CAN
    can_node_id: 0,
    can_node_id_extended: false,
    can_baudrate: 250000,
    can_heartbeat_rate_ms: 100,
    enable_can: false,
    // UART
    uart_baudrate: 115200,
    enable_uart: false,
    // GPIO
    gpio1_mode: 0, // GpioMode.DIGITAL
    gpio2_mode: 0,
    gpio3_mode: 0,
    gpio4_mode: 0,
    // Watchdog
    enable_watchdog: false,
    watchdog_timeout: 0.0,
    enable_step_dir: false,
    step_dir_always_on: false,
    enable_sensorless: false,
  },
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    updateUiPreferences: (state, action) => {
      // Ensure uiPreferences exists
      if (!state.uiPreferences) {
        state.uiPreferences = { useRpmUnits: true }
      }
      state.uiPreferences = { ...state.uiPreferences, ...action.payload }
    },
    updatePowerConfig: (state, action) => {
      Object.keys(action.payload).forEach(key => {
        const value = action.payload[key]
        if (typeof value === 'number' && !isNaN(value)) {
          state.powerConfig[key] = value
        } else if (typeof value === 'boolean') {
          state.powerConfig[key] = value
        } else if (typeof value === 'string' && value.trim() !== '') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            state.powerConfig[key] = numValue
          } else {
            state.powerConfig[key] = value
          }
        }
      })
    },
    updateMotorConfig: (state, action) => {
      Object.keys(action.payload).forEach(key => {
        const value = action.payload[key]
        if (typeof value === 'number' && !isNaN(value)) {
          state.motorConfig[key] = value
        } else if (typeof value === 'boolean') {
          state.motorConfig[key] = value
        } else if (typeof value === 'string' && value.trim() !== '') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            state.motorConfig[key] = numValue
          } else {
            state.motorConfig[key] = value
          }
        }
      })
    },
    updateEncoderConfig: (state, action) => {
      Object.keys(action.payload).forEach(key => {
        const value = action.payload[key]
        if (typeof value === 'number' && !isNaN(value)) {
          state.encoderConfig[key] = value
        } else if (typeof value === 'boolean') {
          state.encoderConfig[key] = value
        } else if (typeof value === 'string' && value.trim() !== '') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            state.encoderConfig[key] = numValue
          } else {
            state.encoderConfig[key] = value
          }
        }
      })
    },
    updateControlConfig: (state, action) => {
      Object.keys(action.payload).forEach(key => {
        const value = action.payload[key]
        if (typeof value === 'number' && !isNaN(value)) {
          state.controlConfig[key] = value
        } else if (typeof value === 'boolean') {
          state.controlConfig[key] = value
        } else if (typeof value === 'string' && value.trim() !== '') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            state.controlConfig[key] = numValue
          } else {
            state.controlConfig[key] = value
          }
        }
      })
    },
    updateInterfaceConfig: (state, action) => {
      Object.keys(action.payload).forEach(key => {
        const value = action.payload[key]
        if (typeof value === 'number' && !isNaN(value)) {
          state.interfaceConfig[key] = value
        } else if (typeof value === 'boolean') {
          state.interfaceConfig[key] = value
        } else if (typeof value === 'string' && value.trim() !== '') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            state.interfaceConfig[key] = numValue
          } else {
            state.interfaceConfig[key] = value
          }
        }
      })
    },
    resetConfig: (state) => {
      return initialState
    },
  },
})

export const {
  updateUiPreferences,
  updatePowerConfig,
  updateMotorConfig,
  updateEncoderConfig,
  updateControlConfig,
  updateInterfaceConfig,
  resetConfig,
} = configSlice.actions

export default configSlice.reducer