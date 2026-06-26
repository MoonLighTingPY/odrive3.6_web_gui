import { createSlice } from '@reduxjs/toolkit'

// Live device status, populated by the single device telemetry WebSocket
// read by the sidebar, dashboard and motor controls. Values are for the
// currently selected axis. Kept as flat named fields for cheap reads.
//
// Exported (frozen) so hidden tabs can subscribe to a stable constant via
// `useSelector(s => isActive ? s.live : LIVE_INITIAL_STATE)` and skip re-renders
// while they aren't visible.
export const LIVE_INITIAL_STATE = Object.freeze({
  connected: false,
  axis: 0,
  vbus_voltage: 0,
  ibus: 0,
  axis_state: 0,
  axis_error: 0,
  motor_error: 0,
  encoder_error: 0,
  controller_error: 0,
  sensorless_error: 0,
  motor_current: 0,
  encoder_pos: 0,
  encoder_vel: 0,
  motor_temp: null,
  fet_temp: null,
})

// RTK/Immer needs a mutable initial state object; clone the frozen constant.
const initialState = { ...LIVE_INITIAL_STATE }

const liveSlice = createSlice({
  name: 'live',
  initialState,
  reducers: {
    setLiveStatus(state, action) {
      Object.assign(state, action.payload)
    },
    resetLiveStatus() {
      return { ...LIVE_INITIAL_STATE }
    },
  },
})

export const { setLiveStatus, resetLiveStatus } = liveSlice.actions
export default liveSlice.reducer
