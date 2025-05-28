import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeConfigStep: 1,
  commandPreviewVisible: false,
  isLoading: false,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setConfigStep(state, action) {
      state.activeConfigStep = action.payload
    },
    nextConfigStep(state) {
      if (state.activeConfigStep < 6) {
        state.activeConfigStep += 1
      }
    },
    prevConfigStep(state) {
      if (state.activeConfigStep > 1) {
        state.activeConfigStep -= 1
      }
    },
    toggleCommandPreview(state) {
      state.commandPreviewVisible = !state.commandPreviewVisible
    },
    setLoading(state, action) {
      state.isLoading = action.payload
    },
    addNotification(state, action) {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      })
    },
    removeNotification(state, action) {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
  },
})

export const { 
  setConfigStep, 
  nextConfigStep, 
  prevConfigStep, 
  toggleCommandPreview,
  setLoading,
  addNotification,
  removeNotification
} = uiSlice.actions
export default uiSlice.reducer