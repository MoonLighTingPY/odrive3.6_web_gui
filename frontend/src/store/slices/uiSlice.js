import { createSlice } from '@reduxjs/toolkit'

const initialState = {
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
  }
})

export const {
} = uiSlice.actions

export default uiSlice.reducer