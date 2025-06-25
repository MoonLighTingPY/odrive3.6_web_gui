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
  isRebooting: false,
  reconnectionAttempts: 0,
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
      if (action.payload) {
        state.connectedDevice = action.payload
        state.isConnected = true
        state.connectionLost = false
        state.connectionError = null
        state.isRebooting = false
        state.reconnectionAttempts = 0
      } else {
        state.isConnected = false
        state.connectedDevice = null
        state.connectionLost = false
        state.isRebooting = false
        state.reconnectionAttempts = 0
      }
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload
      state.isConnected = false
      state.connectedDevice = null
      state.connectionLost = false
      state.isRebooting = false
    },
    // New: Single action to update all connection status from backend
    setConnectionStatus: (state, action) => {
      const { connected, connectionLost, isRebooting, deviceSerial, reconnectionAttempts } = action.payload
      
      state.isConnected = connected
      state.connectionLost = connectionLost || false
      state.isRebooting = isRebooting || false
      state.reconnectionAttempts = reconnectionAttempts || 0
      
      // Only update device info if we have a serial and are connected
      if (connected && deviceSerial) {
        if (!state.connectedDevice || state.connectedDevice.serial !== deviceSerial) {
          state.connectedDevice = {
            serial: deviceSerial,
            path: `ODrive ${deviceSerial}`
          }
        }
      }
      
      // Clear error if we're connected
      if (connected) {
        state.connectionError = null
      }
    },
    updateOdriveState: (state, action) => {
      // Completely replace the state to prevent partial updates causing flicker
      state.odriveState = action.payload
      state.lastUpdateTime = Date.now()
      
      // If we successfully got state, we're definitely connected
      if (Object.keys(action.payload).length > 0) {
        if (state.connectionLost) {
          state.connectionLost = false
          state.isRebooting = false
          state.reconnectionAttempts = 0
        }
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
      state.isRebooting = false
      state.reconnectionAttempts = 0
    },
  },
})

export const {
  setScanning,
  setAvailableDevices,
  setConnectedDevice,
  setConnectionError,
  setConnectionStatus,
  updateOdriveState,
  updateDeviceProperty,
  setTelemetryEnabled,
  setTelemetryRate,
  clearDeviceState,
} = deviceSlice.actions

export default deviceSlice.reducer