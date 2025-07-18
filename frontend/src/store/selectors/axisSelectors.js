import { createSelector } from '@reduxjs/toolkit'

// Get selected axis number
export const getSelectedAxis = (state) => state.ui.selectedAxis

// Get axis-specific telemetry
export const getSelectedAxisTelemetry = createSelector(
  [getSelectedAxis, (state) => state.telemetry],
  (selectedAxis, telemetry) => {
    // Filter telemetry for selected axis
    return {
      ...telemetry,
      // Axis-specific paths would be dynamically generated
      axisPath: `axis${selectedAxis}`
    }
  }
)

// Get axis-specific configuration
export const getSelectedAxisConfig = createSelector(
  [getSelectedAxis, (state) => state.config],
  (selectedAxis, config) => {
    return config.axisConfigs?.[`axis${selectedAxis}`] || {}
  }
)

// Generate axis-specific command paths
export const getAxisCommandPath = createSelector(
  [getSelectedAxis],
  (selectedAxis) => (basePath) => {
    if (basePath.startsWith('axis')) {
      // Replace axis number in path
      return basePath.replace(/axis\d+/, `axis${selectedAxis}`)
    }
    return basePath
  }
)

// Get available axes (based on connected device)
export const getAvailableAxes = createSelector(
  [(state) => state.device.odriveState],
  (odriveState) => {
    const axes = []
    for (let i = 0; i < 8; i++) {
      if (odriveState[`axis${i}`]) {
        axes.push(i)
      }
    }
    return axes.length > 0 ? axes : [0, 1] // Default to axis0,1 if none detected
  }
)