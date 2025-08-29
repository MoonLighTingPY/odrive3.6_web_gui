import { createSlice } from '@reduxjs/toolkit'

// Update initialState - remove complex reconnection states
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
  firmwareVersion: null, // Current device firmware version
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
        state.connectionError = null
        // Extract firmware version from device info if available
        if (action.payload.fw_version) {
          state.firmwareVersion = action.payload.fw_version
        }
      } else {
        // Clear all device state on disconnect
        state.connectedDevice = null
        state.isConnected = false
        state.odriveState = {}
        state.connectionError = null
        state.firmwareVersion = null
      }
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload
      state.isConnected = false
      state.connectedDevice = null
      state.firmwareVersion = null
    },
    // New: Single action to update all connection status from backend
    setConnectionStatus: (state, action) => {
      const { connected } = action.payload

      state.isConnected = connected

      // Clear error if we're connected
      if (connected) {
        state.connectionError = null
      } else {
        state.connectedDevice = null
        state.firmwareVersion = null
      }
    },
    updateOdriveState: (state, action) => {
      // Completely replace the state to prevent partial updates causing flicker
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
      state.firmwareVersion = null
    },
    setFirmwareVersion: (state, action) => {
      state.firmwareVersion = action.payload
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
  setFirmwareVersion,
} = deviceSlice.actions

export default deviceSlice.reducer