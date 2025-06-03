// Unit conversion utilities for ODrive v0.5.6
// ODrive v0.5.6 uses turns/s internally for all velocity calculations

// Helper function for safe number conversion
const safeNumber = (value, fallback = 0) => {
  const num = Number(value)
  return isNaN(num) ? fallback : num
}

// Convert between turns/s and RPM
export const turnsToRpm = (turnsPerSec) => safeNumber(turnsPerSec) * 60
export const rpmToTurns = (rpm) => safeNumber(rpm) / 60

// Legacy function names for backward compatibility
export const radToRpm = (turnsPerSec) => safeNumber(turnsPerSec) * 60  // Actually turns/s to RPM
export const rpmToRad = (rpm) => safeNumber(rpm) / 60  // Actually RPM to turns/s

// Convert velocity gains between turns/s and RPM units
// ODrive v0.5.6 stores gains as A/(turns/s) internally
// When displaying in RPM units: A/(RPM) = A/(turns/s) * 60
// When converting back: A/(turns/s) = A/(RPM) / 60
export const velGainTurnsToRpm = (gainTurns) => safeNumber(gainTurns) * 60
export const velGainRpmToTurns = (gainRpm) => safeNumber(gainRpm) / 60

// Legacy function names for backward compatibility - FIXED
export const velGainRadToRpm = (radValue) => {
  const num = safeNumber(radValue)
  return num * 60  // Fixed: ODrive v0.5.6 uses turns/s, not rad/s
}

export const velGainRpmToRad = (rpmValue) => {
  const num = safeNumber(rpmValue)
  return num / 60  // Fixed: ODrive v0.5.6 uses turns/s, not rad/s
}

// Safe formatting functions with error handling
export const safeToFixed = (value, decimals = 2, fallback = 0) => {
  const num = safeNumber(value, fallback)
  return num.toFixed(decimals)
}

// Format display values with appropriate precision
export const formatVelocity = (value, useRpm = true, precision = 2) => {
  const safeValue = safeNumber(value)
  if (useRpm) {
    return `${safeToFixed(turnsToRpm(safeValue), precision)} RPM`
  } else {
    return `${safeToFixed(safeValue, precision)} turns/s`
  }
}

export const formatAcceleration = (value, useRpm = true, precision = 2) => {
  const safeValue = safeNumber(value)
  if (useRpm) {
    return `${safeToFixed(turnsToRpm(safeValue), precision)} RPM/s`
  } else {
    return `${safeToFixed(safeValue, precision)} turns/s²`
  }
}

export const formatVelGain = (value, useRpm = true, precision = 3) => {
  const safeValue = safeNumber(value)
  if (useRpm) {
    return `${safeToFixed(velGainTurnsToRpm(safeValue), precision)} A/(RPM)`
  } else {
    return `${safeToFixed(safeValue, precision + 3)} A/(turns/s)`  // More precision for small numbers
  }
}

export const formatVelIntGain = (value, useRpm = true, precision = 3) => {
  const safeValue = safeNumber(value)
  if (useRpm) {
    return `${safeToFixed(velGainTurnsToRpm(safeValue), precision)} A⋅s/(RPM)`
  } else {
    return `${safeToFixed(safeValue, precision + 3)} A⋅s/(turns/s)`  // More precision for small numbers
  }
}

// ODrive v0.5.6 specific conversions - more explicit naming
export const odriveVelToRpm = (odriveVel) => {
  // ODrive v0.5.6 uses turns/s internally
  return safeNumber(odriveVel) * 60
}

export const rpmToOdriveVel = (rpm) => {
  // Convert RPM to ODrive v0.5.6 turns/s
  return safeNumber(rpm) / 60
}

export const odriveVelGainToRpm = (odriveGain) => {
  // Convert ODrive gain from A/(turns/s) to A/(RPM)
  return safeNumber(odriveGain) * 60
}

export const rpmVelGainToOdrive = (rpmGain) => {
  // Convert gain from A/(RPM) to ODrive A/(turns/s)
  return safeNumber(rpmGain) / 60
}

// Additional safe conversion functions
export const safeTurnsToRpm = (turnsPerSec, fallback = 0) => {
  return safeNumber(turnsPerSec, fallback) * 60
}

export const safeRpmToTurns = (rpm, fallback = 0) => {
  return safeNumber(rpm, fallback) / 60
}

export const safeVelGainTurnsToRpm = (gainTurns, fallback = 0) => {
  return safeNumber(gainTurns, fallback) * 60
}

export const safeVelGainRpmToTurns = (gainRpm, fallback = 0) => {
  return safeNumber(gainRpm, fallback) / 60
}