import { describe, it, expect } from 'vitest'
import { validateConfig } from '../configValidation'

// Build a valueOf from a concrete-path map (axis already expanded to 0).
const makeValueOf = (vals) => (path) => vals[path]

const base = {
  'axis0.motor.config.motor_type': 0,
  'axis0.motor.config.pole_pairs': 7,
  'axis0.motor.config.torque_constant': 0.04,
  'axis0.motor.config.current_lim': 20,
  'axis0.motor.config.calibration_current': 10,
  'axis0.encoder.config.mode': 0,
  'axis0.encoder.config.cpr': 8192,
  'axis0.controller.config.control_mode': 3,
  'axis0.controller.config.pos_gain': 20,
  'axis0.controller.config.vel_gain': 0.16,
  'axis0.controller.config.vel_limit': 10,
}

describe('validateConfig', () => {
  it('passes a complete sensible config', () => {
    const { errors } = validateConfig({ valueOf: makeValueOf(base), axis: 0, fwLine: 5 })
    expect(errors).toEqual([])
  })

  it('errors when essential params are unset', () => {
    const { errors } = validateConfig({ valueOf: makeValueOf({}), axis: 0, fwLine: 5 })
    expect(errors.length).toBeGreaterThan(0)
  })

  it('allows missing CPR when sensorless', () => {
    const v = { ...base, 'axis0.encoder.config.cpr': 0, 'axis0.config.enable_sensorless_mode': true }
    const { errors } = validateConfig({ valueOf: makeValueOf(v), axis: 0, fwLine: 5 })
    expect(errors.some((e) => e.includes('CPR'))).toBe(false)
  })

  it('warns on Hall CPR mismatch', () => {
    const v = { ...base, 'axis0.encoder.config.mode': 1, 'axis0.encoder.config.cpr': 100 }
    const { warnings } = validateConfig({ valueOf: makeValueOf(v), axis: 0, fwLine: 5 })
    expect(warnings.some((w) => w.includes('pole_pairs × 6'))).toBe(true)
  })
})
