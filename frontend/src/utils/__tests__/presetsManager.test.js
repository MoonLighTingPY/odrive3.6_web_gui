import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  listPresets,
  makePreset,
  savePreset,
  deletePreset,
  exportPreset,
  importPreset,
  expandValues,
  templatizeValues,
  PRESET_FORMAT,
} from '../presets/presetsManager'

// Minimal localStorage shim for the Node test environment.
beforeEach(() => {
  const store = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  })
})

describe('presetsManager', () => {
  it('saves, lists, and overwrites by name', () => {
    const a = makePreset('Hoverboard', { 'axis0.motor.config.pole_pairs': 15 }, { fwLine: 5 })
    savePreset(a)
    expect(listPresets()).toHaveLength(1)

    const a2 = makePreset('Hoverboard', { 'axis0.motor.config.pole_pairs': 7 }, { fwLine: 5 })
    savePreset(a2)
    const list = listPresets()
    expect(list).toHaveLength(1) // overwritten, not duplicated
    // axis paths are stored in template form
    expect(list[0].values['axis{n}.motor.config.pole_pairs']).toBe(7)
  })

  it('deletes by name', () => {
    savePreset(makePreset('A', { x: 1 }))
    savePreset(makePreset('B', { y: 2 }))
    deletePreset('A')
    expect(listPresets().map((p) => p.name)).toEqual(['B'])
  })

  it('round-trips through export/import', () => {
    const preset = makePreset('Spin', { 'axis0.motor.config.current_lim': 20 }, { fwLine: 5 })
    const json = exportPreset(preset)
    const back = importPreset(json)
    expect(back.format).toBe(PRESET_FORMAT)
    expect(back.values).toEqual(preset.values)
    expect(back.name).toBe('Spin')
  })

  it('rejects invalid import payloads', () => {
    expect(() => importPreset('not json')).toThrow(/valid JSON/)
    expect(() => importPreset(JSON.stringify({ foo: 'bar' }))).toThrow(/valid ODrive preset/)
  })

  it('templatizes and expands axis paths', () => {
    expect(templatizeValues({ 'axis1.motor.config.pole_pairs': 7 })).toEqual({
      'axis{n}.motor.config.pole_pairs': 7,
    })
    expect(expandValues({ 'axis{n}.motor.config.pole_pairs': 7 }, 1)).toEqual({
      'axis1.motor.config.pole_pairs': 7,
    })
  })
})
