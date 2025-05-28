import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  availableDevices: [],
  connectedDevice: null,
  isConnected: false,
  isScanning: false,
  connectionError: null,
  odriveState: {},
  lastUpdateTime: 0,
  telemetryEnabled: true,
  telemetryRate: 10, // Hz
  connectionLost: false,
  reconnecting: false,
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
      state.connectionError = null
      state.connectionLost = false
      state.reconnecting = false
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload
      state.isConnected = false
      state.connectedDevice = null
    },
    setConnectionLost: (state, action) => {
      state.connectionLost = action.payload
      if (action.payload) {
        state.isConnected = false
      }
    },
    setReconnecting: (state, action) => {
      state.reconnecting = action.payload
    },
    updateOdriveState: (state, action) => {
      state.odriveState = action.payload
      state.lastUpdateTime = Date.now()
      // If we successfully got state, connection is restored
      if (Object.keys(action.payload).length > 0 && state.connectionLost) {
        state.connectionLost = false
        state.reconnecting = false
        state.isConnected = true
      }
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
      state.connectionLost = false
      state.reconnecting = false
    },
  },
})

export const {
  setScanning,
  setAvailableDevices,
  setConnectedDevice,
  setConnectionError,
  setConnectionLost,
  setReconnecting,
  updateOdriveState,
  updateDeviceProperty,
  setTelemetryEnabled,
  setTelemetryRate,
  clearDeviceState,
} = deviceSlice.actions

export default deviceSlice.reducer