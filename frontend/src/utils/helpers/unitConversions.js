// Unit conversions for ODrive values.
//
// ODrive works in SI-ish units (turns, turns/s, A, V). The UI often prefers
// more familiar units (RPM, Kv). These helpers centralise the math so the same
// conversion is never re-derived inline in components.

/** Motor Kv constant relating torque_constant (Nm/A) and Kv (RPM/V): Kv = 8.27 / torque_constant. */
export const KV_TORQUE_CONSTANT = 8.27

/** turns/s -> RPM */
export const turnsPerSecToRpm = (turnsPerSec) => Number(turnsPerSec) * 60

/** RPM -> turns/s */
export const rpmToTurnsPerSec = (rpm) => Number(rpm) / 60

/** torque_constant (Nm/A) -> Kv (RPM/V). Returns 0 for non-positive input. */
export const torqueConstantToKv = (torqueConstant) => {
  const tc = Number(torqueConstant)
  return tc > 0 ? KV_TORQUE_CONSTANT / tc : 0
}

/** Kv (RPM/V) -> torque_constant (Nm/A). Returns 0 for non-positive input. */
export const kvToTorqueConstant = (kv) => {
  const v = Number(kv)
  return v > 0 ? KV_TORQUE_CONSTANT / v : 0
}

/**
 * Suggested control gains derived from motor/encoder parameters.
 * Mirrors the formulas the official tuning guide / odrivetool use as a starting
 * point. All inputs are plain numbers; returns 0s when inputs are unusable.
 *
 * @param {{ motorKv:number, cpr:number }} p
 * @returns {{ posGain:number, velGain:number, velIntegratorGain:number }}
 */
export const calculateGains = ({ motorKv, cpr }) => {
  const kv = Number(motorKv)
  const counts = Number(cpr)
  if (!(kv > 0) || !(counts > 0)) {
    return { posGain: 0, velGain: 0, velIntegratorGain: 0 }
  }
  const torqueConstant = KV_TORQUE_CONSTANT / kv
  const posGain = (kv / 10) / counts * 60
  const velGain = (torqueConstant * counts) / 10
  const velIntegratorGain = 0.1 * velGain
  return { posGain, velGain, velIntegratorGain }
}

/** Torque constant Kt (Nm/A) from Kv. */
export const torqueConstant = (motorKv) => kvToTorqueConstant(motorKv)

/** Approximate maximum torque (Nm) = Kt * current limit. */
export const maxTorque = (motorKv, currentLim) =>
  kvToTorqueConstant(motorKv) * (Number(currentLim) || 0)