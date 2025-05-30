// Unit conversion utilities for ODrive v0.5.6
// ODrive v0.5.6 uses turns/s internally for all velocity calculations

// Convert between turns/s and RPM
export const turnsToRpm = (turnsPerSec) => turnsPerSec * 60
export const rpmToTurns = (rpm) => rpm / 60

// Legacy function names for backward compatibility
export const radToRpm = (turnsPerSec) => turnsPerSec * 60  // Actually turns/s to RPM
export const rpmToRad = (rpm) => rpm / 60  // Actually RPM to turns/s

// Convert velocity gains between turns/s and RPM units
// ODrive v0.5.6 stores gains as A/(turns/s) internally
// When displaying in RPM units: A/(RPM) = A/(turns/s) * 60
// When converting back: A/(turns/s) = A/(RPM) / 60
export const velGainTurnsToRpm = (gainTurns) => gainTurns * 60
export const velGainRpmToTurns = (gainRpm) => gainRpm / 60

// Legacy function names for backward compatibility
export const velGainRadToRpm = (gainTurns) => gainTurns * 60  // Actually turns to RPM
export const velGainRpmToRad = (gainRpm) => gainRpm / 60  // Actually RPM to turns

// Format display values with appropriate precision
export const formatVelocity = (value, useRpm = true, precision = 2) => {
  if (useRpm) {
    return `${turnsToRpm(value).toFixed(precision)} RPM`
  } else {
    return `${value.toFixed(precision)} turns/s`
  }
}

export const formatAcceleration = (value, useRpm = true, precision = 2) => {
  if (useRpm) {
    return `${turnsToRpm(value).toFixed(precision)} RPM/s`
  } else {
    return `${value.toFixed(precision)} turns/s²`
  }
}

export const formatVelGain = (value, useRpm = true, precision = 3) => {
  if (useRpm) {
    return `${velGainTurnsToRpm(value).toFixed(precision)} A/(RPM)`
  } else {
    return `${value.toFixed(precision + 3)} A/(turns/s)`  // More precision for small numbers
  }
}

export const formatVelIntGain = (value, useRpm = true, precision = 3) => {
  if (useRpm) {
    return `${velGainTurnsToRpm(value).toFixed(precision)} A⋅s/(RPM)`
  } else {
    return `${value.toFixed(precision + 3)} A⋅s/(turns/s)`  // More precision for small numbers
  }
}

// ODrive v0.5.6 specific conversions - more explicit naming
export const odriveVelToRpm = (odriveVel) => {
  // ODrive v0.5.6 uses turns/s internally
  return odriveVel * 60
}

export const rpmToOdriveVel = (rpm) => {
  // Convert RPM to ODrive v0.5.6 turns/s
  return rpm / 60
}

export const odriveVelGainToRpm = (odriveGain) => {
  // Convert ODrive gain from A/(turns/s) to A/(RPM)
  return odriveGain * 60
}

export const rpmVelGainToOdrive = (rpmGain) => {
  // Convert gain from A/(RPM) to ODrive A/(turns/s)
  return rpmGain / 60
}