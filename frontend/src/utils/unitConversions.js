// Unit conversion utilities for ODrive v0.5.6

// Convert between rad/s and RPM
export const radToRpm = (radPerSec) => radPerSec * 60 / (2 * Math.PI)
export const rpmToRad = (rpm) => rpm * 2 * Math.PI / 60

// Convert velocity gains between rad/s and RPM units
// When converting gain from A/(rad/s) to A/(RPM), we need to multiply by the conversion factor
// because 1 RPM = (2π/60) rad/s, so A/(rad/s) = A/(RPM) * (2π/60)
// Therefore: A/(RPM) = A/(rad/s) * (60/(2π))
export const velGainRadToRpm = (gainRad) => gainRad * 60 / (2 * Math.PI)
export const velGainRpmToRad = (gainRpm) => gainRpm * (2 * Math.PI) / 60

// Format display values with appropriate precision
export const formatVelocity = (value, useRpm = true, precision = 2) => {
  if (useRpm) {
    return `${radToRpm(value).toFixed(precision)} RPM`
  } else {
    return `${value.toFixed(precision)} rad/s`
  }
}

export const formatAcceleration = (value, useRpm = true, precision = 2) => {
  if (useRpm) {
    return `${radToRpm(value).toFixed(precision)} RPM/s`
  } else {
    return `${value.toFixed(precision)} rad/s²`
  }
}

export const formatVelGain = (value, useRpm = true, precision = 3) => {
  if (useRpm) {
    return `${velGainRadToRpm(value).toFixed(precision)} A/(RPM)`
  } else {
    return `${value.toFixed(precision)} A/(rad/s)`
  }
}

export const formatVelIntGain = (value, useRpm = true, precision = 3) => {
  if (useRpm) {
    return `${velGainRadToRpm(value).toFixed(precision)} A⋅s/(RPM)`
  } else {
    return `${value.toFixed(precision)} A⋅s/(rad/s)`
  }
}

// Additional helper functions for better clarity
export const convertVelGainToRpm = (gainRadPerS) => {
  // Convert A/(rad/s) to A/(RPM)
  // Since 1 RPM = (2π/60) rad/s
  // A gain of X A/(rad/s) equals X * (60/(2π)) A/(RPM)
  return gainRadPerS * 60 / (2 * Math.PI)
}

export const convertVelGainToRad = (gainRpm) => {
  // Convert A/(RPM) to A/(rad/s)
  // Since 1 RPM = (2π/60) rad/s
  // A gain of X A/(RPM) equals X * (2π/60) A/(rad/s)
  return gainRpm * (2 * Math.PI) / 60
}