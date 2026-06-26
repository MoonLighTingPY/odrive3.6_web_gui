// Configuration presets: save/load named snapshots of writable config.
//
// A preset is a plain { path: value } map of writable scalars plus light
// metadata. Stored in localStorage; importable/exportable as JSON so users can
// share motor profiles. Kept framework-free so it is unit-testable.
//
// Axis paths are stored in template form (`axis{n}...`) so a preset is
// axis-agnostic; it is expanded to a concrete axis when applied.

import { FACTORY_PRESETS } from './factoryPresets'

const STORAGE_KEY = 'odrive.presets.v1'
export const PRESET_FORMAT = 'odrive-gui-preset'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(presets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

/** Collapse a concrete axis path to template form (`axis0...` -> `axis{n}...`). */
export function templatizeValues(values) {
  const out = {}
  for (const [path, value] of Object.entries(values)) {
    out[path.replace(/axis\d+/, 'axis{n}')] = value
  }
  return out
}

/** Expand template axis paths to a concrete axis (`axis{n}...` -> `axisN...`). */
export function expandValues(values, axis) {
  const out = {}
  for (const [path, value] of Object.entries(values)) {
    out[path.replace('axis{n}', `axis${axis}`)] = value
  }
  return out
}

/** User presets from localStorage. */
export function listPresets() {
  return readStore()
}

/** Factory presets followed by user presets (both shaped the same). */
export function listAllPresets() {
  return [...FACTORY_PRESETS, ...readStore()]
}

/** Build a preset object from a config map. Does not persist. */
export function makePreset(name, config, meta = {}) {
  return {
    format: PRESET_FORMAT,
    version: 1,
    name: name || 'Untitled',
    createdAt: new Date().toISOString(),
    fwLine: meta.fwLine ?? null,
    description: meta.description ?? '',
    values: templatizeValues(config),
  }
}

/** Save (or overwrite by name) a preset and return the updated list. */
export function savePreset(preset) {
  const presets = readStore().filter((p) => p.name !== preset.name)
  presets.push(preset)
  writeStore(presets)
  return presets
}

export function deletePreset(name) {
  const presets = readStore().filter((p) => p.name !== name)
  writeStore(presets)
  return presets
}

/** Rename a user preset and/or update its description. */
export function updatePreset(oldName, { name, description }) {
  const presets = readStore()
  const idx = presets.findIndex((p) => p.name === oldName)
  if (idx === -1) return presets
  presets[idx] = {
    ...presets[idx],
    name: name || presets[idx].name,
    description: description ?? presets[idx].description,
  }
  writeStore(presets)
  return presets
}

/** Serialize a preset to a downloadable JSON string. */
export function exportPreset(preset) {
  return JSON.stringify(preset, null, 2)
}

/** Parse and validate an imported preset JSON string. Throws on invalid input. */
export function importPreset(jsonText) {
  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('File is not valid JSON')
  }
  if (parsed?.format !== PRESET_FORMAT || typeof parsed.values !== 'object' || parsed.values === null) {
    throw new Error('Not a valid ODrive preset file')
  }
  return {
    format: PRESET_FORMAT,
    version: parsed.version ?? 1,
    name: parsed.name || 'Imported',
    createdAt: parsed.createdAt || new Date().toISOString(),
    fwLine: parsed.fwLine ?? null,
    description: parsed.description ?? '',
    values: templatizeValues(parsed.values),
  }
}
