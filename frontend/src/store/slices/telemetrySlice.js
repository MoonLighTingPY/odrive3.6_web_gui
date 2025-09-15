import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedProperties: [],
  samples: {},          // { path: [{ t, v }, ...] }
  maxSamples: 1000,
  status: 'disconnected', // disconnected | connecting | connected | error
  error: null,
  intervalMs: 200,
  lastTimestamp: null,
}

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    setSelectedProperties(state, action) {
      state.selectedProperties = action.payload
    },
    addProperty(state, action) {
      const p = action.payload
      if (!state.selectedProperties.includes(p)) {
        state.selectedProperties.push(p)
      }
    },
    removeProperty(state, action) {
      const p = action.payload
      state.selectedProperties = state.selectedProperties.filter(x => x !== p)
      delete state.samples[p]
    },
    pushBatch(state, action) {
      const { timestamp, data } = action.payload
      state.lastTimestamp = timestamp
      Object.entries(data).forEach(([path, value]) => {
        if (!state.selectedProperties.includes(path)) return
        if (!state.samples[path]) state.samples[path] = []
        const arr = state.samples[path]
        arr.push({ t: timestamp, v: value })
        if (arr.length > state.maxSamples) {
          arr.splice(0, arr.length - state.maxSamples)
        }
      })
    },
    setStatus(state, action) {
      state.status = action.payload
      if (action.payload !== 'error') state.error = null
    },
    setError(state, action) {
      state.status = 'error'
      state.error = action.payload
    },
    setIntervalMs(state, action) {
      state.intervalMs = action.payload
    },
    clearAll(state) {
      state.samples = {}
      state.lastTimestamp = null
    }
  }
})

export const {
  setSelectedProperties,
  addProperty,
  removeProperty,
  pushBatch,
  setStatus,
  setError,
  setIntervalMs,
  clearAll
} = telemetrySlice.actions

export default telemetrySlice.reducer