import { describe, it, expect } from 'vitest'
import {
  buildDeviceSnapshot,
  diffConfig,
  toWrites,
  toCommandStrings,
} from '../configDiff'

describe('buildDeviceSnapshot', () => {
  it('keeps only successfully-read scalars and records the rest as unreadable', () => {
    const { snapshot, unreadable } = buildDeviceSnapshot({
      'axis0.motor.config.pole_pairs': 7,
      'axis0.motor.config.current_lim': 10,
      'axis0.motor.config.torque_constant': { error: 'read failed' },
      'axis0.config.enable_uart_a': true,
      'axis0.encoder.config.mode': null,
    })
    expect(snapshot).toEqual({
      'axis0.motor.config.pole_pairs': 7,
      'axis0.motor.config.current_lim': 10,
      'axis0.config.enable_uart_a': true,
    })
    expect(unreadable.sort()).toEqual([
      'axis0.encoder.config.mode',
      'axis0.motor.config.torque_constant',
    ])
  })
})

describe('diffConfig (the phantom-command bug fix)', () => {
  it('emits no writes when desired matches the device snapshot', () => {
    const snapshot = { 'axis0.motor.config.pole_pairs': 7, 'axis0.motor.config.current_lim': 10 }
    const desired = { ...snapshot }
    expect(diffConfig({ snapshot, desired })).toEqual([])
  })

  it('NEVER writes an un-edited parameter whose device value could not be read', () => {
    // Reproduces the reported bug: torque_constant/current_lim failed to read,
    // the form fell back to defaults, but the user never touched them.
    const snapshot = { 'axis0.motor.config.pole_pairs': 7 } // torque_constant unreadable
    const desired = {
      'axis0.motor.config.pole_pairs': 7,
      'axis0.motor.config.torque_constant': 0.04, // fallback default, not user-set
      'axis0.motor.config.current_lim': 10, // fallback default, not user-set
    }
    expect(diffConfig({ snapshot, desired, editedPaths: [] })).toEqual([])
  })

  it('writes a parameter the user explicitly changed', () => {
    const snapshot = { 'axis0.motor.config.pole_pairs': 7 }
    const desired = { 'axis0.motor.config.pole_pairs': 20 }
    const changes = diffConfig({ snapshot, desired, editedPaths: ['axis0.motor.config.pole_pairs'] })
    expect(changes).toEqual([{ path: 'axis0.motor.config.pole_pairs', value: 20, from: 7 }])
  })

  it('honours a user edit even when the device value is unknown', () => {
    const snapshot = {}
    const desired = { 'axis0.motor.config.torque_constant': 0.027 }
    const changes = diffConfig({
      snapshot,
      desired,
      editedPaths: ['axis0.motor.config.torque_constant'],
    })
    expect(changes).toEqual([{ path: 'axis0.motor.config.torque_constant', value: 0.027, from: undefined }])
  })

  it('ignores floating-point noise', () => {
    const snapshot = { 'axis0.motor.config.torque_constant': 0.039951 }
    const desired = { 'axis0.motor.config.torque_constant': 0.039951000001 }
    expect(diffConfig({ snapshot, desired })).toEqual([])
  })

  it('formats writes and preview strings', () => {
    const changes = [
      { path: 'axis0.motor.config.pole_pairs', value: 20 },
      { path: 'axis0.config.enable_uart_a', value: false },
    ]
    expect(toWrites(changes)).toEqual([
      { path: 'axis0.motor.config.pole_pairs', value: 20 },
      { path: 'axis0.config.enable_uart_a', value: false },
    ])
    expect(toCommandStrings(changes)).toEqual([
      'odrv0.axis0.motor.config.pole_pairs = 20',
      'odrv0.axis0.config.enable_uart_a = False',
    ])
  })
})
