import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  devices: [],
  connectedDevice: null,
  isConnected: false,
  isScanning: false,
  odriveState: {},
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDevices(state, action) {
      state.devices = action.payload
    },
    setConnectedDevice(state, action) {
      state.connectedDevice = action.payload
      state.isConnected = !!action.payload
    },
    setOdriveState(state, action) {
      state.odriveState = action.payload
    },
    setScanning(state, action) {
      state.isScanning = action.payload
    },
    updateDeviceProperty(state, action) {
      const { path, value } = action.payload
      // Update nested property in odriveState
      const keys = path.split('.')
      let current = state.odriveState
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
    },
  },
})

export const { 
  setDevices, 
  setConnectedDevice, 
  setOdriveState, 
  setScanning,
  updateDeviceProperty 
} = deviceSlice.actions
export default deviceSlice.reducer