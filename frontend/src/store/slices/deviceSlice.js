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
  telemetryRate: 10,
  
  // Firmware info - simplified
  fw_version_string: null,
  fw_version_major: null,
  fw_version_minor: null, 
  fw_version_revision: null,
  fw_is_0_6: false,
  fw_is_0_5: false,
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
        const device = action.payload
        state.connectedDevice = device
        state.isConnected = true
        state.connectionError = null

        // Simple firmware version parsing
        const versionStr = device.fw_version || device.fw_version_string || device.firmware_version
        
        if (versionStr && typeof versionStr === 'string') {
          state.fw_version_string = versionStr
          
          // Parse version components
          const match = versionStr.match(/(\d+)\.(\d+)\.?(\d+)?/)
          if (match) {
            state.fw_version_major = parseInt(match[1])
            state.fw_version_minor = parseInt(match[2]) 
            state.fw_version_revision = match[3] ? parseInt(match[3]) : 0
            
            // Set boolean flags
            state.fw_is_0_6 = state.fw_version_major === 0 && state.fw_version_minor === 6
            state.fw_is_0_5 = state.fw_version_major === 0 && state.fw_version_minor === 5
          }
        }
        
      } else {
        // Clear everything on disconnect
        Object.assign(state, initialState)
      }
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload
      state.isConnected = false
      state.connectedDevice = null
    },
    setConnectionStatus: (state, action) => {
      const { connected } = action.payload
      state.isConnected = connected
      if (connected) {
        state.connectionError = null
      } else {
        state.connectedDevice = null
      }
    },
    updateOdriveState: (state, action) => {
      state.odriveState = action.payload
      state.lastUpdateTime = Date.now()
    },
    updateDeviceProperty: (state, action) => {
      const { path, value } = action.payload
      const pathParts = path.split('.')
      let current = state.odriveState

      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {}
        }
        current = current[pathParts[i]]
      }

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
  setConnectionStatus,
  updateOdriveState,
  updateDeviceProperty,
  setTelemetryEnabled,
  setTelemetryRate,
  clearDeviceState,
} = deviceSlice.actions

export default deviceSlice.reducer