import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as backend from '../../api/backend'
import { firmwareLine } from '../../utils/odriveRegistry'

// Query the backend for attached devices.
export const fetchDevices = createAsyncThunk('device/fetchDevices', async () => {
  const data = await backend.listDevices()
  return data || []
})

const initialState = {
  availableDevices: [],
  connectedDevice: null,
  isConnected: false,
  isLoading: false,
  connectionError: null,
  odriveState: {},
  lastUpdateTime: 0,

  // Firmware info derived from the connected device.
  fw_version_string: null,
  fw_version_major: null,
  fw_version_minor: null,
  fw_version_revision: null,
  fw_line: null, // 5 or 6 (single source of truth for version-specific behaviour)
}

function applyFirmware(state, device) {
  const major = device.fw_version_major ?? null
  const minor = device.fw_version_minor ?? null
  state.fw_version_major = major
  state.fw_version_minor = minor
  state.fw_version_revision = device.fw_version_revision ?? null
  state.fw_version_string =
    device.fw_version || (major != null ? `${major}.${minor}.${device.fw_version_revision ?? 0}` : null)
  state.fw_line = major != null && minor != null ? firmwareLine(major, minor) : null
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    // Thin-backend "connect": the device is discovered on the backend already,
    // so connecting is simply selecting it and recording its firmware.
    connectDevice(state, action) {
      const device = action.payload
      if (!device) return
      state.connectedDevice = device
      state.isConnected = true
      state.connectionError = null
      applyFirmware(state, device)
    },
    disconnectDevice(state) {
      state.connectedDevice = null
      state.isConnected = false
      state.odriveState = {}
      state.fw_version_string = null
      state.fw_version_major = null
      state.fw_version_minor = null
      state.fw_version_revision = null
      state.fw_line = null
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

      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {}
        }
        current = current[pathParts[i]]
      }

      current[pathParts[pathParts.length - 1]] = value
      state.lastUpdateTime = Date.now()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.isLoading = true
        state.connectionError = null
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.isLoading = false
        state.availableDevices = action.payload
        // If the connected device disappeared from the bus, drop the connection.
        if (state.connectedDevice) {
          const stillThere = action.payload.some(
            (d) => d.serial_number === state.connectedDevice.serial_number
          )
          if (!stillThere) {
            state.connectedDevice = null
            state.isConnected = false
          }
        }
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.isLoading = false
        state.connectionError = action.error?.message || 'Failed to fetch devices'
      })
  },
})

export const {
  connectDevice,
  disconnectDevice,
  setConnectionError,
  updateOdriveState,
  updateDeviceProperty,
} = deviceSlice.actions

export default deviceSlice.reducer
