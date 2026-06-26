import { describe, it, expect } from 'vitest'
import {
  firmwareLine,
  getRegistry,
  expandAxisPath,
  templatizePath,
  getParamMeta,
  writableConfigPaths,
} from '../odriveRegistry'

describe('firmwareLine', () => {
  it('discriminates 0.5.x vs 0.6.x by minor (both report major 0)', () => {
    expect(firmwareLine(0, 5)).toBe(5)
    expect(firmwareLine(0, 6)).toBe(6)
  })
})

describe('registry (0.5.x)', () => {
  const reg = getRegistry(5)

  it('builds a non-empty property map with normalised metadata', () => {
    expect(reg.properties.size).toBeGreaterThan(50)
    const meta = reg.properties.get('axis{n}.motor.config.pole_pairs')
    expect(meta).toMatchObject({
      name: 'pole_pairs',
      writable: true,
      kind: 'integer',
      category: 'motor',
    })
  })

  it('looks up metadata by concrete or template path', () => {
    expect(getParamMeta(5, 'axis0.motor.config.current_lim')?.name).toBe('current_lim')
    expect(getParamMeta(5, 'axis{n}.motor.config.current_lim')?.name).toBe('current_lim')
  })

  it('expands and templatizes axis paths', () => {
    expect(expandAxisPath('axis{n}.motor.config.pole_pairs', 1)).toBe('axis1.motor.config.pole_pairs')
    expect(templatizePath('axis1.motor.config.pole_pairs')).toBe('axis{n}.motor.config.pole_pairs')
  })

  it('lists writable config paths expanded per axis', () => {
    const paths = writableConfigPaths(5, [0, 1])
    expect(paths).toContain('axis0.motor.config.pole_pairs')
    expect(paths).toContain('axis1.motor.config.pole_pairs')
    // read-only properties must not appear
    expect(paths.every((p) => !p.endsWith('.vbus_voltage'))).toBe(true)
  })
})

describe('registry (0.6.x)', () => {
  const reg = getRegistry(6)

  it('loads the complete 0.6.x surface (regenerated reference)', () => {
    // The old hand-made 0.6.x JSON had ~107 props; the generated one is far richer.
    expect(reg.properties.size).toBeGreaterThan(300)
  })

  it('exposes the motor config params that previously went missing', () => {
    // 0.6.x nests motor config under axis.config.motor.* (vs 0.5.x axis.motor.config.*).
    const polePairs = getParamMeta(6, 'axis0.config.motor.pole_pairs')
    expect(polePairs).toMatchObject({ name: 'pole_pairs', writable: true, kind: 'integer' })
    const torque = getParamMeta(6, 'axis0.config.motor.torque_constant')
    expect(torque).toMatchObject({ name: 'torque_constant', writable: true, kind: 'float' })
    const controlMode = getParamMeta(6, 'axis0.controller.config.control_mode')
    expect(controlMode?.kind).toBe('enum')
  })

  it('has the ControlMode enum', () => {
    expect(reg.enums['ODrive.Controller.ControlMode']?.values?.POSITION_CONTROL?.value).toBe(3)
  })
})

