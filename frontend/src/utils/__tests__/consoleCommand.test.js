import { describe, it, expect } from 'vitest'
import { parseConsoleCommand } from '../consoleCommand'

describe('parseConsoleCommand', () => {
  it('parses a read', () => {
    expect(parseConsoleCommand('vbus_voltage')).toEqual({ type: 'read', path: 'vbus_voltage' })
  })

  it('strips the optional odrv0. prefix', () => {
    expect(parseConsoleCommand('odrv0.axis0.error')).toEqual({ type: 'read', path: 'axis0.error' })
    expect(parseConsoleCommand('odrv1.vbus_voltage')).toEqual({ type: 'read', path: 'vbus_voltage' })
  })

  it('parses integer / float / bool writes', () => {
    expect(parseConsoleCommand('axis0.requested_state = 8')).toEqual({
      type: 'write', path: 'axis0.requested_state', value: 8,
    })
    expect(parseConsoleCommand('axis0.motor.config.torque_constant = 0.04')).toEqual({
      type: 'write', path: 'axis0.motor.config.torque_constant', value: 0.04,
    })
    expect(parseConsoleCommand('axis0.config.startup_motor_calibration = true')).toEqual({
      type: 'write', path: 'axis0.config.startup_motor_calibration', value: true,
    })
    expect(parseConsoleCommand('axis0.config.startup_motor_calibration = False')).toEqual({
      type: 'write', path: 'axis0.config.startup_motor_calibration', value: false,
    })
  })

  it('parses a no-arg command', () => {
    expect(parseConsoleCommand('save_configuration()')).toEqual({
      type: 'command', path: 'save_configuration', args: [],
    })
  })

  it('parses a command with args', () => {
    expect(parseConsoleCommand('axis0.controller.move_incremental(1.0, true)')).toEqual({
      type: 'command', path: 'axis0.controller.move_incremental', args: [1.0, true],
    })
  })

  it('rejects empty input', () => {
    expect(parseConsoleCommand('   ')).toEqual({ error: 'empty command' })
  })

  it('parses scientific notation', () => {
    expect(parseConsoleCommand('x = 1e-3')).toEqual({ type: 'write', path: 'x', value: 0.001 })
  })
})
