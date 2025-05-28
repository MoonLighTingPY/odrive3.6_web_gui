import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Step 1: Power Configuration
  powerConfig: {
    dc_bus_overvoltage_trip_level: 56.0,
    dc_bus_undervoltage_trip_level: 10.0,
    dc_max_positive_current: 10.0,
    dc_max_negative_current: -10.0,
    brake_resistance: 2.0,
    enable_brake_resistor: true,
  },
  
  // Step 2: Motor Configuration
  motorConfig: {
    motor_type: 0, // HIGH_CURRENT
    pole_pairs: 7,
    motor_kv: 270,
    current_lim: 10.0,
    calibration_current: 10.0,
    resistance_calib_max_voltage: 4.0,
    lock_in_spin_current: 10.0,
    phase_resistance: 0.0, // Only for gimbal motors
    phase_inductance: 0.0,
  },
  
  // Step 3: Encoder Configuration
  encoderConfig: {
    encoder_type: 0, // INCREMENTAL
    cpr: 4000,
    use_index: true,
    bandwidth: 1000,
    calib_range: 0.019635,
    use_separate_commutation_encoder: false,
    hall_polarity: 0,
    abs_spi_cs_gpio_pin: 1,
  },
  
  // Step 4: Control Configuration
  controlConfig: {
    control_mode: 3, // POSITION_CONTROL
    input_mode: 1, // PASSTHROUGH
    vel_limit: 20.0,
    pos_gain: 20.0,
    vel_gain: 0.1667,
    vel_integrator_gain: 0.3333,
    vel_ramp_rate: 10000.0,
    inertia: 0.0,
    traj_vel_limit: 20.0,
    traj_accel_limit: 5000.0,
    traj_decel_limit: 5000.0,
  },
  
  // Step 5: Interface Configuration
  interfaceConfig: {
    enable_can: false,
    can_node_id: 0,
    can_baudrate: 250000,
    enable_uart: false,
    uart_baudrate: 115200,
    enable_step_dir: false,
    enable_sensorless: false,
    enable_watchdog: false,
    watchdog_timeout: 1.0,
    gpio1_mode: 0,
    gpio2_mode: 0,
    gpio3_mode: 0,
    gpio4_mode: 0,
  },
  
  // Generated commands for preview
  pendingCommands: [],
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    updatePowerConfig(state, action) {
      state.powerConfig = { ...state.powerConfig, ...action.payload }
    },
    updateMotorConfig(state, action) {
      state.motorConfig = { ...state.motorConfig, ...action.payload }
    },
    updateEncoderConfig(state, action) {
      state.encoderConfig = { ...state.encoderConfig, ...action.payload }
    },
    updateControlConfig(state, action) {
      state.controlConfig = { ...state.controlConfig, ...action.payload }
    },
    updateInterfaceConfig(state, action) {
      state.interfaceConfig = { ...state.interfaceConfig, ...action.payload }
    },
    setPendingCommands(state, action) {
      state.pendingCommands = action.payload
    },
    resetConfig(state) {
      return initialState
    },
  },
})

export const { 
  updatePowerConfig,
  updateMotorConfig, 
  updateEncoderConfig,
  updateControlConfig,
  updateInterfaceConfig,
  setPendingCommands,
  resetConfig
} = configSlice.actions
export default configSlice.reducer