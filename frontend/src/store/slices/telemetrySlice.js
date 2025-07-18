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
      // The issue is that telemetryData is passed directly instead of with path
      // We need to handle both formats: {path, value} and direct telemetry object
      
      if (action.payload.path !== undefined) {
        // Handle individual property updates with path
        const { path, value, timestamp } = action.payload
        
        if (!path) {
          console.warn('Telemetry update received undefined path:', action.payload)
          return
        }
        
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
      } else {
        // Handle bulk telemetry update (direct object)
        Object.keys(action.payload).forEach(key => {
          if (key !== 'timestamp') {
            // Map telemetry keys to global state
            state[key] = action.payload[key]
          }
        })
        
        state.lastUpdate = action.payload.timestamp || Date.now()
        state.updateCount += 1
        state.connectionHealth = true
      }
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