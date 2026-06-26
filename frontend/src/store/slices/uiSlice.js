import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedAxis: 0,
  activeTab: 0,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedAxis(state, action) {
      state.selectedAxis = action.payload
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload
    },
  },
})

export const { setSelectedAxis, setActiveTab } = uiSlice.actions

export default uiSlice.reducer