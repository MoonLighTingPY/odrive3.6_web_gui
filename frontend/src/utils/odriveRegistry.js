// Data-driven ODrive registry.
//
// Single source of truth for the property/command surface, built directly from
// the API-reference JSON (one file per firmware line). This replaces the old
// hand-maintained, duplicated property trees and per-version registry classes.
//
// Firmware line: ODrive 0.5.x and 0.6.x both report fw_version_major === 0, so
// the "line" is the minor (5 or 6).

import ref05x from './odriveApiReference05x.json'
import ref06x from './odriveApiReference06x.json'

const REFERENCE_BY_LINE = { 5: ref05x, 6: ref06x }

/** Normalise a reported firmware version to a supported line (5 or 6). */
export function firmwareLine(fwMajor, fwMinor) {
  const major = Number(fwMajor)
  const minor = Number(fwMinor)
  if (major === 0) return minor >= 6 ? 6 : 5
  return 6
}

function kindForType(type = '') {
  if (type.includes('Bool')) return 'boolean'
  if (type.includes('Float')) return 'float'
  if (type.includes('Uint') || type.includes('Int')) return 'integer'
  if (type.startsWith('Property[')) return 'enum'
  return 'unknown'
}

function buildRegistry(json) {
  const properties = new Map() // template path -> meta
  for (const group of Object.values(json.properties || {})) {
    for (const prop of Object.values(group)) {
      const path = prop.path
      if (!path) continue
      properties.set(path, {
        name: prop.name,
        path,
        type: prop.type,
        kind: kindForType(prop.type),
        access: prop.access,
        writable: prop.access === 'rw',
        category: prop.category,
        description: prop.description || '',
      })
    }
  }

  const commands = new Map()
  for (const group of Object.values(json.commands || {})) {
    for (const cmd of Object.values(group)) {
      if (cmd.path) commands.set(cmd.path, cmd)
    }
  }

  return {
    version: json.version,
    properties,
    commands,
    enums: json.enums || {},
  }
}

const cache = new Map()

/** Get the (memoised) registry for a firmware line. */
export function getRegistry(fwLine) {
  const line = REFERENCE_BY_LINE[fwLine] ? fwLine : 5
  if (!cache.has(line)) cache.set(line, buildRegistry(REFERENCE_BY_LINE[line]))
  return cache.get(line)
}

/** Substitute the axis index into a template path (`axis{n}....`). */
export function expandAxisPath(templatePath, axis = 0) {
  return templatePath.replace('{n}', String(axis))
}

/** Collapse a concrete path back to its template form (`axis0...` -> `axis{n}...`). */
export function templatizePath(path) {
  return path.replace(/axis\d+/, 'axis{n}')
}

/** Look up metadata for a concrete or template path. */
export function getParamMeta(fwLine, path) {
  const reg = getRegistry(fwLine)
  return reg.properties.get(path) || reg.properties.get(templatizePath(path)) || null
}

/**
 * All writable scalar property paths, expanded for the requested axes.
 * Used to build the config batch-read path list.
 */
export function writableConfigPaths(fwLine, axes = [0, 1]) {
  const reg = getRegistry(fwLine)
  const out = []
  for (const meta of reg.properties.values()) {
    if (!meta.writable) continue
    if (meta.path.includes('{n}')) {
      for (const axis of axes) out.push(expandAxisPath(meta.path, axis))
    } else {
      out.push(meta.path)
    }
  }
  return out
}

/**
 * Every property path the device exposes (writable + read-only), expanded for
 * the requested axes. Used to snapshot the full device state for a preset so it
 * can be restored exactly later; read-only values are also captured for info.
 */
export function allReadablePaths(fwLine, axes = [0, 1]) {
  const reg = getRegistry(fwLine)
  const out = []
  for (const meta of reg.properties.values()) {
    if (meta.path.includes('{n}')) {
      for (const axis of axes) out.push(expandAxisPath(meta.path, axis))
    } else {
      out.push(meta.path)
    }
  }
  return out
}

/**
 * Resolve an enum integer value to its symbolic name.
 * @returns {string} the enum member name, or the raw value as a string if unknown.
 */
export function enumName(fwLine, enumTypeName, value) {
  const reg = getRegistry(fwLine)
  const en = reg.enums[enumTypeName]
  if (en?.values) {
    for (const [name, info] of Object.entries(en.values)) {
      const v = typeof info?.value === 'number' ? info.value : Number(info?.value ?? NaN)
      if (v === Number(value)) return name
    }
  }
  return String(value)
}

/** Extract the enum type name from a `Property[Enum.Name]` type string, else null. */
export function enumTypeOf(meta) {
  const m = /Property\[(.+)\]/.exec(meta?.type || '')
  return m ? m[1] : null
}

