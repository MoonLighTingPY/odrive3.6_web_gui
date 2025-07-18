import { createSlice } from '@reduxjs/toolkit'

// Update initialState to support multiple axes
const initialState = {
  // Global telemetry
  vbus_voltage: 0,
  lastUpdate: 0,
  updateCount: 0,
  connectionHealth: true,
  
  // Axis-specific telemetry (will be populated dynamically)
  axes: {
    axis0: {
      motor_current: 0,
      encoder_pos: 0,
      encoder_vel: 0,
      motor_temp: 0,
      fet_temp: 0,
      axis_state: 0,
      axis_error: 0,
      motor_error: 0,
      encoder_error: 0,
      controller_error: 0,
      sensorless_error: 0,
    },
    axis1: {
      motor_current: 0,
      encoder_pos: 0,
      encoder_vel: 0,
      motor_temp: 0,
      fet_temp: 0,
      axis_state: 0,
      axis_error: 0,
      motor_error: 0,
      encoder_error: 0,
      controller_error: 0,
      sensorless_error: 0,
    }
  }
}

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    updateTelemetry: (state, action) => {
      const { path, value, timestamp } = action.payload
      
      // Handle axis-specific paths
      const axisMatch = path.match(/^axis(\d+)\.(.+)/)
      if (axisMatch) {
        const [, axisNum, property] = axisMatch
        const axisKey = `axis${axisNum}`
        
        if (!state.axes[axisKey]) {
          state.axes[axisKey] = { ...initialState.axes.axis0 }
        }
        
        state.axes[axisKey][property] = value
      } else {
        // Global telemetry
        state[path] = value
      }
      
      state.lastUpdate = timestamp || Date.now()
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