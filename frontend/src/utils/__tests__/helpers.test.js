import { describe, it, expect } from 'vitest'
import {
  turnsPerSecToRpm,
  rpmToTurnsPerSec,
  torqueConstantToKv,
  kvToTorqueConstant,
} from '../helpers/unitConversions'
import { valuesEqual, isFiniteNumber, formatNumber } from '../helpers/valueHelpers'

describe('unitConversions', () => {
  it('converts turns/s <-> RPM', () => {
    expect(turnsPerSecToRpm(10)).toBe(600)
    expect(rpmToTurnsPerSec(600)).toBe(10)
  })

  it('converts torque_constant <-> Kv', () => {
    // ~207 KV motor from the bug report: torque_constant 0.03995 -> ~207 Kv
    expect(torqueConstantToKv(0.03995)).toBeCloseTo(207, 0)
    expect(kvToTorqueConstant(207)).toBeCloseTo(0.03995, 4)
  })

  it('guards against non-positive input', () => {
    expect(torqueConstantToKv(0)).toBe(0)
    expect(kvToTorqueConstant(-5)).toBe(0)
  })
})

describe('valueHelpers', () => {
  it('detects finite numbers', () => {
    expect(isFiniteNumber(1.5)).toBe(true)
    expect(isFiniteNumber(NaN)).toBe(false)
    expect(isFiniteNumber('1')).toBe(false)
  })

  it('compares values with float tolerance', () => {
    expect(valuesEqual(1.0000001, 1.0)).toBe(true)
    expect(valuesEqual(1.1, 1.0)).toBe(false)
    expect(valuesEqual(true, true)).toBe(true)
    expect(valuesEqual('a', 'b')).toBe(false)
  })

  it('formats numbers safely', () => {
    expect(formatNumber(3.14159, 2)).toBe('3.14')
    expect(formatNumber('n/a')).toBe('n/a')
  })
})
