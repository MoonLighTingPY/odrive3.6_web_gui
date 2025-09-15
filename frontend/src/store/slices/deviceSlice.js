// ...existing code...
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as backend from '../../api/backend'

// Async thunk to query backend for attached devices
export const fetchDevices = createAsyncThunk('device/fetchDevices', async () => {
  const data = await backend.listDevices()
  return data || []
})

const initialState = {
  availableDevices: [],
  connectedDevice: null,
  isLoading: false,
  error: null,
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    connectDevice: (state, action) => {
      state.connectedDevice = action.payload
    },
    disconnectDevice: (state) => {
      state.connectedDevice = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.isLoading = false
        state.availableDevices = action.payload
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error?.message || 'Failed to fetch devices'
      })
  },
})

export const { connectDevice, disconnectDevice } = deviceSlice.actions
export default deviceSlice.reducer
// ...existing code...