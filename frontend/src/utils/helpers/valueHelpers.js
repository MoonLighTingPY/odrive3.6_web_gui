// Safe value formatting and comparison helpers shared across the UI.

import { torqueConstantToKv, kvToTorqueConstant } from './unitConversions'

// Re-exported under the historical names used by callers.
export const convertTorqueConstantToKv = torqueConstantToKv
export const convertKvToTorqueConstant = kvToTorqueConstant

/** True when a value is a real, finite number. */
export const isFiniteNumber = (v) =>
  typeof v === 'number' && Number.isFinite(v)

/**
 * Compare two values for equality, tolerating floating-point noise.
 * Non-numbers are compared strictly. Used by change-detection so that a value
 * read back from the device isn't flagged as "changed" due to float rounding.
 */
export const valuesEqual = (a, b, epsilon = 1e-6) => {
  if (isFiniteNumber(a) && isFiniteNumber(b)) {
    return Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(a), Math.abs(b))
  }
  return a === b
}

/** Format a number with a fixed number of decimals, leaving non-numbers untouched. */
export const formatNumber = (value, decimals = 3) =>
  isFiniteNumber(value) ? Number(value).toFixed(decimals) : String(value ?? '')
