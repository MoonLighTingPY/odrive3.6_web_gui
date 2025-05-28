import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Power Configuration
  powerConfig: {
    dc_bus_overvoltage_trip_level: 56.0,
    dc_bus_undervoltage_trip_level: 8.0,
    dc_max_positive_current: 10.0,
    dc_max_negative_current: -3.0,
    brake_resistor_enabled: false,
    brake_resistance: 2.0,
  },
  
  // Motor Configuration
  motorConfig: {
    motor_type: 0, // HIGH_CURRENT
    pole_pairs: 7,
    motor_kv: 100,
    current_lim: 10.0,
    current_lim_margin: 8.0,
    torque_lim: 30.0,
    calibration_current: 10.0,
    resistance_calib_max_voltage: 2.0,
    phase_inductance: 0.0,
    phase_resistance: 0.0,
    direction: 1,
    lock_in_spin_current: 10.0,
    // Gimbal motor specific
    phase_resistance_override: 0.0,
  },
  
  // Encoder Configuration
  encoderConfig: {
    encoder_type: 1, // INCREMENTAL
    cpr: 4000,
    bandwidth: 1000,
    use_index: false,
    use_separate_commutation_encoder: false,
    calib_range: 0.02,
    calib_scan_distance: 16.0,
    calib_scan_omega: 12.566,
    // Hall encoder
    hall_polarity: 0,
    // SPI encoder
    abs_spi_cs_gpio_pin: 1,
  },
  
  // Control Configuration
  controlConfig: {
    control_mode: 2, // VELOCITY_CONTROL
    input_mode: 1, // VEL_RAMP
    pos_gain: 20.0,
    vel_gain: 0.16,
    vel_integrator_gain: 0.32,
    vel_limit: 10.0,
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
  },
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    updatePowerConfig: (state, action) => {
      state.powerConfig = { ...state.powerConfig, ...action.payload }
    },
    updateMotorConfig: (state, action) => {
      state.motorConfig = { ...state.motorConfig, ...action.payload }
    },
    updateEncoderConfig: (state, action) => {
      state.encoderConfig = { ...state.encoderConfig, ...action.payload }
    },
    updateControlConfig: (state, action) => {
      state.controlConfig = { ...state.controlConfig, ...action.payload }
    },
    updateInterfaceConfig: (state, action) => {
      state.interfaceConfig = { ...state.interfaceConfig, ...action.payload }
    },
    resetConfig: (state) => {
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
  resetConfig,
} = configSlice.actions

export default configSlice.reducer