import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  initialConfig: {
  },
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setInitialConfig: (state) => {
      state.initialConfig = {
      }
    },
    resetConfig: () => {
      return initialState
    },
  },
})

export const {
  setInitialConfig,
  resetConfig,
} = configSlice.actions

export default configSlice.reducer