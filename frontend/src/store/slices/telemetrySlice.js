import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // High-frequency telemetry data
  vbus_voltage: 0,
  motor_current: 0,
  encoder_pos: 0,
  encoder_vel: 0,
  motor_temp: 0,
  fet_temp: 0,
  axis_state: 0,

  // Error codes for immediate error detection
  axis_error: 0,
  motor_error: 0,
  encoder_error: 0,
  controller_error: 0,
  sensorless_error: 0,

  // Metadata
  lastUpdate: 0,
  updateCount: 0,
  connectionHealth: true,
}

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    updateTelemetry: (state, action) => {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== undefined) {
          state[key] = value
        }
      })
      state.lastUpdate = Date.now()
      state.updateCount += 1
      state.connectionHealth = true
    },
    setTelemetryConnectionHealth: (state, action) => {
      state.connectionHealth = action.payload
    },
    resetTelemetry: () => {
      return initialState
    }
  },
})

export const {
  updateTelemetry,
  setTelemetryConnectionHealth,
  resetTelemetry,
} = telemetrySlice.actions

export default telemetrySlice.reducer