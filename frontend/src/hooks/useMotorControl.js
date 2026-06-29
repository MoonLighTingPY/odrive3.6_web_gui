import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import * as backend from '../api/backend'

// ODrive axis states (0.5.x / 0.6.x share these values).
export const AXIS_STATE = {
  UNDEFINED: 0,
  IDLE: 1,
  FULL_CALIBRATION_SEQUENCE: 3,
  MOTOR_CALIBRATION: 4,
  ENCODER_INDEX_SEARCH: 6,
  ENCODER_OFFSET_CALIBRATION: 7,
  CLOSED_LOOP_CONTROL: 8,
  ENCODER_DIR_FIND: 10,
  ENCODER_HALL_POLARITY_CALIBRATION: 12,
}

/**
 * Action helpers for controlling an axis through the thin backend. All device
 * interaction is read/write/command by dotted path — there is no special
 * calibration endpoint.
 */
export function useMotorControl() {
  const toast = useToast()
  const { connectedDevice } = useSelector((s) => s.device)
  const axis = useSelector((s) => s.ui.selectedAxis)
  const serial = connectedDevice?.serial_number

  const requestState = useCallback(
    async (state) => {
      if (!serial) return
      await backend.writeProperties(serial, [{ path: `axis${axis}.requested_state`, value: state }])
    },
    [serial, axis]
  )

  const run = useCallback(
    async (fn, okTitle) => {
      try {
        await fn()
        if (okTitle) toast({ title: okTitle, status: 'success', duration: 2000 })
      } catch (err) {
        toast({ title: 'Command failed', description: String(err.message || err), status: 'error' })
      }
    },
    [toast]
  )

  const enable = useCallback(
    () => run(() => requestState(AXIS_STATE.CLOSED_LOOP_CONTROL), 'Motor enabled (closed loop)'),
    [run, requestState]
  )
  const disable = useCallback(
    () => run(() => requestState(AXIS_STATE.IDLE), 'Motor disabled (idle)'),
    [run, requestState]
  )

  const clearErrors = useCallback(
    () =>
      run(async () => {
        // 0.6.x exposes a per-axis clear_errors; 0.5.x only a top-level one.
        try {
          await backend.invokeCommand(serial, `axis${axis}.clear_errors`, [])
        } catch {
          await backend.invokeCommand(serial, 'clear_errors', [])
        }
      }, 'Errors cleared'),
    [run, serial, axis]
  )

  const saveAndReboot = useCallback(
    () =>
      run(async () => {
        // Both axes must be idle before save_configuration; otherwise the call
        // errors (or hangs) while the motor state machine is active.
        await backend.writeProperties(serial, [
          { path: 'axis0.requested_state', value: AXIS_STATE.IDLE },
          { path: 'axis1.requested_state', value: AXIS_STATE.IDLE },
        ])
        await backend.invokeCommand(serial, 'save_configuration', [])
        try {
          await backend.invokeCommand(serial, 'reboot', [])
        } catch {
          // reboot drops the USB connection; the error is expected.
        }
      }, 'Configuration saved, rebooting…'),
    [run, serial]
  )

  return { serial, axis, requestState, enable, disable, clearErrors, saveAndReboot }
}
