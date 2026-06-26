import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import * as backend from '../api/backend'
import { AXIS_STATE } from './useMotorControl'
import { describeErrors } from '../utils/odriveErrors'
import { resolvePath } from '../utils/configSchema'

const PHASE_BY_STATE = {
  [AXIS_STATE.FULL_CALIBRATION_SEQUENCE]: 'Running full calibration sequence…',
  [AXIS_STATE.MOTOR_CALIBRATION]: 'Measuring motor resistance and inductance…',
  [AXIS_STATE.ENCODER_INDEX_SEARCH]: 'Searching for encoder index pulse…',
  [AXIS_STATE.ENCODER_OFFSET_CALIBRATION]: 'Calibrating encoder offset…',
  [AXIS_STATE.ENCODER_DIR_FIND]: 'Finding encoder direction…',
  [AXIS_STATE.ENCODER_HALL_POLARITY_CALIBRATION]: 'Calibrating Hall polarity…',
}

export const CALIBRATION_TYPES = {
  full: { state: AXIS_STATE.FULL_CALIBRATION_SEQUENCE, label: 'Full Calibration', groups: ['motor', 'encoder'] },
  motor: { state: AXIS_STATE.MOTOR_CALIBRATION, label: 'Motor Calibration', groups: ['motor'] },
  encoder_offset: { state: AXIS_STATE.ENCODER_OFFSET_CALIBRATION, label: 'Encoder Offset Calibration', groups: ['encoder'] },
  encoder_index: { state: AXIS_STATE.ENCODER_INDEX_SEARCH, label: 'Encoder Index Search', groups: ['encoder'] },
  hall_polarity: { state: AXIS_STATE.ENCODER_HALL_POLARITY_CALIBRATION, label: 'Hall Polarity Calibration', groups: ['encoder'] },
}

// Measured values worth reviewing/saving after each calibration group.
const RESULT_FIELDS = {
  motor: [
    { tmpl: 'axis{n}.motor.config.phase_resistance', label: 'Phase Resistance', unit: 'Ω', decimals: 4 },
    { tmpl: 'axis{n}.motor.config.phase_inductance', label: 'Phase Inductance', unit: 'H', decimals: 6 },
  ],
  encoder: [
    { tmpl: 'axis{n}.encoder.config.direction', label: 'Encoder Direction', decimals: 0 },
    { tmpl: 'axis{n}.encoder.config.phase_offset', label: 'Phase Offset', decimals: 0 },
  ],
}
const PRE_CAL = {
  motor: 'axis{n}.motor.config.pre_calibrated',
  encoder: 'axis{n}.encoder.config.pre_calibrated',
}

/**
 * Drive a calibration entirely from the client against the thin backend:
 * write `requested_state`, poll `current_state` until the axis returns to IDLE,
 * then read the measured values so the user can review/edit them and persist
 * them (setting the matching `pre_calibrated` flags + save_configuration).
 */
export function useCalibration() {
  const { connectedDevice, fw_line } = useSelector((s) => s.device)
  const axis = useSelector((s) => s.ui.selectedAxis)
  const serial = connectedDevice?.serial_number
  const fwLine = fw_line || 5
  const toast = useToast()

  const [isCalibrating, setIsCalibrating] = useState(false)
  const [phase, setPhase] = useState('')
  const [currentState, setCurrentState] = useState(null)
  const [result, setResult] = useState(null) // { ok, errors:[{flag,description}] }
  const [resultFields, setResultFields] = useState([]) // [{path,label,unit,decimals}]
  const [resultValues, setResultValues] = useState({}) // { path: value }
  const [preCalPaths, setPreCalPaths] = useState([])
  const [saving, setSaving] = useState(false)

  const pollRef = useRef(null)
  const startedRef = useRef(false)
  const typeRef = useRef('full')

  const cp = useCallback((tmpl) => resolvePath(tmpl, fwLine).replace('{n}', String(axis)), [fwLine, axis])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const readErrors = useCallback(async () => {
    const paths = [`axis${axis}.error`, `axis${axis}.motor.error`, `axis${axis}.encoder.error`]
    const r = await backend.readProperties(serial, paths)
    const num = (p) => (typeof r[p] === 'number' ? r[p] : 0)
    return [
      ...describeErrors('axis', num(`axis${axis}.error`)),
      ...describeErrors('motor', num(`axis${axis}.motor.error`)),
      ...describeErrors('encoder', num(`axis${axis}.encoder.error`)),
    ]
  }, [serial, axis])

  // After a successful run, read measured values for the calibrated groups.
  const readResults = useCallback(
    async (type) => {
      const groups = CALIBRATION_TYPES[type]?.groups || []
      const fields = groups.flatMap((g) =>
        (RESULT_FIELDS[g] || []).map((f) => ({ ...f, path: cp(f.tmpl) }))
      )
      const preCal = groups.map((g) => cp(PRE_CAL[g]))
      const paths = fields.map((f) => f.path)
      const values = {}
      if (paths.length) {
        const r = await backend.readProperties(serial, paths)
        for (const f of fields) {
          if (typeof r[f.path] === 'number') values[f.path] = r[f.path]
        }
      }
      setResultFields(fields)
      setResultValues(values)
      setPreCalPaths(preCal)
    },
    [serial, cp]
  )

  const start = useCallback(
    async (type = 'full') => {
      if (!serial || isCalibrating) return
      const def = CALIBRATION_TYPES[type] || CALIBRATION_TYPES.full
      typeRef.current = type
      setResult(null)
      setResultFields([])
      setResultValues({})
      setIsCalibrating(true)
      setPhase('Starting…')
      startedRef.current = false

      try {
        try {
          await backend.invokeCommand(serial, `axis${axis}.clear_errors`, [])
        } catch {
          try { await backend.invokeCommand(serial, 'clear_errors', []) } catch { /* ignore */ }
        }
        await backend.writeProperties(serial, [{ path: `axis${axis}.requested_state`, value: def.state }])
      } catch (err) {
        setIsCalibrating(false)
        setResult({ ok: false, errors: [{ flag: 'REQUEST_FAILED', description: String(err.message || err) }] })
        return
      }

      pollRef.current = setInterval(async () => {
        try {
          const r = await backend.readProperties(serial, [`axis${axis}.current_state`])
          const state = r[`axis${axis}.current_state`]
          setCurrentState(state)
          if (typeof state === 'number') {
            if (state !== AXIS_STATE.IDLE) {
              startedRef.current = true
              setPhase(PHASE_BY_STATE[state] || `Axis state ${state}…`)
            } else if (startedRef.current) {
              stopPolling()
              const errors = await readErrors()
              const ok = errors.length === 0
              setIsCalibrating(false)
              setResult({ ok, errors })
              toast({
                title: ok ? 'Calibration complete' : 'Calibration failed',
                description: ok ? undefined : errors[0]?.description,
                status: ok ? 'success' : 'error',
                duration: 3500,
              })
              if (ok) await readResults(typeRef.current)
            }
          }
        } catch {
          // transient read error during calibration; keep polling
        }
      }, 500)
    },
    [serial, axis, isCalibrating, stopPolling, readErrors, readResults, toast]
  )

  const setResultValue = useCallback((p, v) => {
    setResultValues((prev) => ({ ...prev, [p]: v }))
  }, [])

  // Write the (possibly edited) measured values, set pre_calibrated, save to NVM.
  const saveResults = useCallback(async () => {
    if (!serial) return
    setSaving(true)
    try {
      const writes = [
        ...Object.entries(resultValues).map(([p, value]) => ({ path: p, value })),
        ...preCalPaths.map((p) => ({ path: p, value: true })),
      ]
      if (writes.length) await backend.writeProperties(serial, writes)
      await backend.invokeCommand(serial, 'save_configuration', [])
      toast({ title: 'Calibration saved', status: 'success', duration: 2500 })
    } catch (err) {
      toast({ title: 'Save failed', description: String(err.message || err), status: 'error', duration: 4000 })
      throw err
    } finally {
      setSaving(false)
    }
  }, [serial, resultValues, preCalPaths, toast])

  const cancel = useCallback(async () => {
    stopPolling()
    setIsCalibrating(false)
    try {
      await backend.writeProperties(serial, [{ path: `axis${axis}.requested_state`, value: AXIS_STATE.IDLE }])
    } catch { /* ignore */ }
  }, [serial, axis, stopPolling])

  const reset = useCallback(() => {
    setResult(null)
    setResultFields([])
    setResultValues({})
    setPhase('')
    setCurrentState(null)
  }, [])

  useEffect(() => stopPolling, [stopPolling])

  return {
    isCalibrating,
    phase,
    currentState,
    result,
    resultFields,
    resultValues,
    setResultValue,
    saveResults,
    saving,
    start,
    cancel,
    reset,
  }
}
