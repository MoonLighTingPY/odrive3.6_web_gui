import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  activeModal: null,
  sidebarCollapsed: false,
  theme: 'dark',
  activeConfigStep: 1, // Changed from configurationStep to activeConfigStep to match usage
  commandHistory: [],
  selectedAxis: 0, // NEW: Global axis selection
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
      }
      state.notifications.push(notification)

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(-50)
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    setConfigStep: (state, action) => {
      state.activeConfigStep = action.payload
    },
    nextConfigStep: (state) => {
      const maxSteps = import.meta.env.DEV ? 7 : 6 // 7 steps in dev mode, 6 in production
      if (state.activeConfigStep < maxSteps) {
        state.activeConfigStep += 1
      }
    },
    prevConfigStep: (state) => {
      if (state.activeConfigStep > 1) { // Minimum step 1
        state.activeConfigStep -= 1
      }
    },
    resetConfigStep: (state) => {
      state.activeConfigStep = 1
    },
    addCommandToHistory: (state, action) => {
      const command = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      }
      state.commandHistory.push(command)

      // Keep only last 100 commands
      if (state.commandHistory.length > 100) {
        state.commandHistory = state.commandHistory.slice(-100)
      }
    },
    clearCommandHistory: (state) => {
      state.commandHistory = []
    },
    setSelectedAxis: (state, action) => {
      state.selectedAxis = action.payload
    },
    validateSelectedAxis: (state, action) => {
      const { availableAxes } = action.payload
      if (!availableAxes.includes(state.selectedAxis)) {
        state.selectedAxis = availableAxes[0] || 0
      }
    },
  },
})

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  setActiveModal,
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setConfigStep,
  nextConfigStep,
  prevConfigStep,
  resetConfigStep,
  addCommandToHistory,
  clearCommandHistory,
  setSelectedAxis,
  validateSelectedAxis,
} = uiSlice.actions

export default uiSlice.reducer