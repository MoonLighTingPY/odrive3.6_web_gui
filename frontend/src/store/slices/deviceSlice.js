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

  // Added: firmware info
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
        const dev = action.payload
        state.connectedDevice = dev
        state.isConnected = true
        state.connectionError = null

        // Parse firmware version (try device.fw_version first, fallback to odriveState fields)
        const parseVersion = (s) => {
          if (!s || typeof s !== 'string') return null
          const m = s.match(/(\d+)\.(\d+)(?:\.(\d+))?/)
          if (!m) return null
          return { major: parseInt(m[1], 10), minor: parseInt(m[2], 10), revision: m[3] ? parseInt(m[3], 10) : 0 }
        }

        let parsed = parseVersion(dev.fw_version || dev.fw_version_string || dev.firmware_version)

        if (!parsed && state.odriveState) {
          // try fields exposed by the property tree
          const major = state.odriveState.fw_version_major ?? state.odriveState.device?.fw_version_major
          const minor = state.odriveState.fw_version_minor ?? state.odriveState.device?.fw_version_minor
          const rev = state.odriveState.fw_version_revision ?? state.odriveState.device?.fw_version_revision
          if (typeof major === 'number' && typeof minor === 'number') {
            parsed = { major, minor, revision: rev || 0 }
          }
        }

        if (parsed) {
          state.fw_version_string = dev.fw_version || `${parsed.major}.${parsed.minor}.${parsed.revision}`
          state.fw_version_major = parsed.major
          state.fw_version_minor = parsed.minor
          state.fw_version_revision = parsed.revision
          state.fw_is_0_6 = parsed.major === 0 && parsed.minor === 6
          state.fw_is_0_5 = parsed.major === 0 && parsed.minor === 5
        } else {
          state.fw_version_string = null
          state.fw_version_major = null
          state.fw_version_minor = null
          state.fw_version_revision = null
          state.fw_is_0_6 = false
          state.fw_is_0_5 = false
        }
      } else {
        // Clear all device state on disconnect
        state.connectedDevice = null
        state.isConnected = false
        state.odriveState = {}
        state.connectionError = null

        // Clear firmware info
        state.fw_version_string = null
        state.fw_version_major = null
        state.fw_version_minor = null
        state.fw_version_revision = null
        state.fw_is_0_6 = false
        state.fw_is_0_5 = false
      }
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload
      state.isConnected = false
      state.connectedDevice = null
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