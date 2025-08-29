import { useSelector } from 'react-redux'
import { generateCommand } from './odrivePathResolver'

/**
 * Utility to check if axes are in idle state
 */

// Axis state constants (from ODrive documentation)
export const AXIS_STATES = {
  UNDEFINED: 0,
  IDLE: 1,
  STARTUP_SEQUENCE: 2,
  FULL_CALIBRATION_SEQUENCE: 3,
  MOTOR_CALIBRATION: 4,
  SENSORLESS_CONTROL: 5,
  ENCODER_INDEX_SEARCH: 6,
  ENCODER_OFFSET_CALIBRATION: 7,
  CLOSED_LOOP_CONTROL: 8,
  LOCKIN_SPIN: 9,
  ENCODER_DIR_FIND: 10,
  HOMING: 11,
  ENCODER_HALL_POLARITY_CALIBRATION: 12,
  ENCODER_HALL_PHASE_CALIBRATION: 13
}

/**
 * Get human-readable state name
 */
export const getAxisStateName = (state) => {
  const stateNames = {
    [AXIS_STATES.UNDEFINED]: 'Undefined',
    [AXIS_STATES.IDLE]: 'Idle',
    [AXIS_STATES.STARTUP_SEQUENCE]: 'Startup Sequence',
    [AXIS_STATES.FULL_CALIBRATION_SEQUENCE]: 'Full Calibration',
    [AXIS_STATES.MOTOR_CALIBRATION]: 'Motor Calibration',
    [AXIS_STATES.SENSORLESS_CONTROL]: 'Sensorless Control',
    [AXIS_STATES.ENCODER_INDEX_SEARCH]: 'Encoder Index Search',
    [AXIS_STATES.ENCODER_OFFSET_CALIBRATION]: 'Encoder Offset Calibration',
    [AXIS_STATES.CLOSED_LOOP_CONTROL]: 'Closed Loop Control',
    [AXIS_STATES.LOCKIN_SPIN]: 'Lockin Spin',
    [AXIS_STATES.ENCODER_DIR_FIND]: 'Encoder Direction Find',
    [AXIS_STATES.HOMING]: 'Homing',
    [AXIS_STATES.ENCODER_HALL_POLARITY_CALIBRATION]: 'Hall Polarity Calibration',
    [AXIS_STATES.ENCODER_HALL_PHASE_CALIBRATION]: 'Hall Phase Calibration'
  }
  return stateNames[state] || `Unknown (${state})`
}

/**
 * Hook to check axis states
 */
export const useAxisStates = () => {
  const telemetry = useSelector(state => state.telemetry)
  const { odriveState } = useSelector(state => state.device)

  // Get axis states from telemetry first (real-time), fallback to odriveState
  const getAxisState = (axisNumber) => {
    if (axisNumber === 0) {
      return telemetry?.axis_state ?? odriveState.device?.[`axis${axisNumber}`]?.current_state ?? AXIS_STATES.UNDEFINED
    } else {
      // For axis1, use odriveState as telemetry typically only has axis0
      return odriveState.device?.[`axis${axisNumber}`]?.current_state ?? AXIS_STATES.UNDEFINED
    }
  }

  const axis0State = getAxisState(0)
  const axis1State = getAxisState(1)

  // FIXED: Treat UNDEFINED same as IDLE since undefined axes don't need to be set to idle
  const isAxis0Idle = axis0State === AXIS_STATES.IDLE || axis0State === AXIS_STATES.UNDEFINED
  const isAxis1Idle = axis1State === AXIS_STATES.IDLE || axis1State === AXIS_STATES.UNDEFINED
  const areBothAxesIdle = isAxis0Idle && isAxis1Idle

  const nonIdleAxes = []
  // Only add axes to nonIdleAxes if they're actually in a non-idle, non-undefined state
  if (!isAxis0Idle) nonIdleAxes.push({ axis: 0, state: axis0State, stateName: getAxisStateName(axis0State) })
  if (!isAxis1Idle) nonIdleAxes.push({ axis: 1, state: axis1State, stateName: getAxisStateName(axis1State) })

  return {
    axis0State,
    axis1State,
    isAxis0Idle,
    isAxis1Idle,
    areBothAxesIdle,
    nonIdleAxes,
    getAxisStateName
  }
}

/**
 * Send command to set axis to idle using dynamic path resolution
 */
export const setAxisToIdle = async (axisNumber) => {
  // Use path resolver to generate the correct command for any firmware version/device
  const command = generateCommand('requested_state', AXIS_STATES.IDLE, axisNumber)
  
  const response = await fetch('/api/odrive/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Failed to set axis ${axisNumber} to idle`)
  }

  return await response.json()
}

/**
 * Set both axes to idle
 */
export const setBothAxesToIdle = async () => {
  await Promise.all([
    setAxisToIdle(0),
    setAxisToIdle(1)
  ])
}