import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Device connection state
  isScanning: false,
  availableDevices: [],
  connectedDevice: null,
  isConnected: false,
  connectionError: null,
  
  // Device state
  odriveState: {},
  lastUpdateTime: null,
  
  // Telemetry
  telemetryEnabled: false,
  telemetryRate: 100, // ms
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setScanning: (state, action) => {
      state.isScanning = action.payload
    },
    setAvailableDevices: (state, action) => {
      state.availableDevices = action.payload
    },
    setConnectedDevice: (state, action) => {
      state.connectedDevice = action.payload
      state.isConnected = !!action.payload
      if (!action.payload) {
        state.odriveState = {}
        state.connectionError = null
      }
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload
      state.isConnected = false
      state.connectedDevice = null
    },
    updateOdriveState: (state, action) => {
      state.odriveState = action.payload
      state.lastUpdateTime = Date.now()
    },
    updateDeviceProperty: (state, action) => {
      const { path, value } = action.payload
      const pathParts = path.split('.')
      let current = state.odriveState
      
      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {}
        }
        current = current[pathParts[i]]
      }
      
      // Set the final property
      current[pathParts[pathParts.length - 1]] = value
      state.lastUpdateTime = Date.now()
    },
    setTelemetryEnabled: (state, action) => {
      state.telemetryEnabled = action.payload
    },
    setTelemetryRate: (state, action) => {
      state.telemetryRate = action.payload
    },
    clearDeviceState: (state) => {
      state.odriveState = {}
      state.connectedDevice = null
      state.isConnected = false
      state.connectionError = null
    },
  },
})

export const {
  setScanning,
  setAvailableDevices,
  setConnectedDevice,
  setConnectionError,
  updateOdriveState,
  updateDeviceProperty,
  setTelemetryEnabled,
  setTelemetryRate,
  clearDeviceState,
} = deviceSlice.actions

export default deviceSlice.reducer