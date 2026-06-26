// Pre-apply validation for the configuration wizard.
//
// Returns plain-language errors (block apply) and warnings (proceed with care)
// derived from the desired values, so a novice can't silently push a half-set
// or self-contradicting config to the device. Pure functions: pass in a getter
// from concrete path -> value and the current axis.

import { resolvePath } from './configSchema'
import { expandAxisPath } from './odriveRegistry'

const SENSORLESS_CONTROL_MODES = new Set([2, 3]) // velocity, position need feedback
const HALL_MODE = 1 // ODrive.Encoder.Mode.HALL

/**
 * @param {object} p
 * @param {(path:string)=>*} p.valueOf  concrete-path getter (desired values)
 * @param {number} p.axis  selected axis index
 * @param {number} p.fwLine  5 or 6
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateConfig({ valueOf, axis, fwLine }) {
  const errors = []
  const warnings = []
  const v = (template) => valueOf(expandAxisPath(resolvePath(template, fwLine), axis))
  const num = (template) => {
    const x = Number(v(template))
    return Number.isFinite(x) ? x : null
  }

  const motorType = num('axis{n}.motor.config.motor_type')
  const polePairs = num('axis{n}.motor.config.pole_pairs')
  const kt = num('axis{n}.motor.config.torque_constant')
  const currentLim = num('axis{n}.motor.config.current_lim')
  const calibCurrent = num('axis{n}.motor.config.calibration_current')
  const sensorless = v('axis{n}.config.enable_sensorless_mode') === true
  const mode = num('axis{n}.encoder.config.mode')
  const cpr = num('axis{n}.encoder.config.cpr')
  const controlMode = num('axis{n}.controller.config.control_mode')
  const posGain = num('axis{n}.controller.config.pos_gain')
  const velGain = num('axis{n}.controller.config.vel_gain')
  const velLimit = num('axis{n}.controller.config.vel_limit')
  const regen = num('config.max_regen_current')
  const brake = num('config.brake_resistance')

  // --- Blocking checks: essential params must be set ---
  if (motorType == null) errors.push('Motor type is not set.')
  if (!polePairs || polePairs <= 0) errors.push('Pole pairs must be greater than 0.')
  if (!kt || kt <= 0) errors.push('Torque constant (Kt) must be greater than 0 — set the motor Kv.')
  if (!currentLim || currentLim <= 0) errors.push('Current limit must be greater than 0.')
  if (controlMode == null) errors.push('Control mode is not set.')
  if (!sensorless && (!cpr || cpr <= 0)) errors.push('Encoder CPR must be greater than 0 (or enable sensorless mode).')

  // --- Warnings: contradictions and footguns ---
  if (calibCurrent != null && currentLim != null && calibCurrent > currentLim) {
    warnings.push('Calibration current is higher than the current limit; calibration may trip.')
  }
  if (mode === HALL_MODE && polePairs && cpr && cpr !== polePairs * 6) {
    warnings.push(`Hall encoder usually needs CPR = pole_pairs × 6 = ${polePairs * 6} (currently ${cpr}).`)
  }
  if (!sensorless && (!velGain || velGain <= 0)) {
    warnings.push('Velocity gain is 0 — the motor will not hold velocity. Use the suggested gains.')
  }
  if (controlMode === 3 && (!posGain || posGain <= 0)) {
    warnings.push('Position control selected but position gain is 0.')
  }
  if (sensorless && SENSORLESS_CONTROL_MODES.has(controlMode) && (!kt || kt <= 0)) {
    warnings.push('Sensorless control needs accurate motor parameters (Kt, pole pairs).')
  }
  if (!velLimit || velLimit <= 0) {
    warnings.push('Velocity limit is 0 — the motor will not move under velocity/position control.')
  }
  if (regen != null && regen > 0 && (!brake || brake <= 0)) {
    warnings.push('Regen current allowed but no brake resistor set — the bus voltage may spike when decelerating.')
  }

  return { errors, warnings }
}
