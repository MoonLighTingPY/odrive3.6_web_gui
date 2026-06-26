// Configuration change detection.
//
// This is the fix for the long-standing "phantom command" bug: the Apply tab
// used to emit write commands for parameters the user never touched (e.g.
// torque_constant, current_lim, control_mode) because failed reads were
// back-filled with fabricated defaults and every known value was treated as a
// change.
//
// The rules here are deliberately strict:
//   1. The device snapshot contains ONLY values that were actually read back as
//      scalars. Failed/objects/missing reads are recorded as "unreadable" and
//      never given a fabricated value.
//   2. A write is generated only when it represents a real change:
//        - a parameter the user explicitly edited whose desired value differs
//          from the device value (or whose device value is unknown), or
//        - any parameter whose desired value genuinely differs from a known
//          device value.
//      An un-edited parameter with no known device value is never written.

import { valuesEqual } from './helpers/valueHelpers'

/**
 * Build a clean device snapshot from a raw `/read` response.
 * @param {Object} readResults map of path -> value | { error }
 * @returns {{ snapshot: Object, unreadable: string[] }}
 */
export function buildDeviceSnapshot(readResults = {}) {
  const snapshot = {}
  const unreadable = []
  for (const [path, value] of Object.entries(readResults)) {
    const isScalar =
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'string'
    if (isScalar) {
      snapshot[path] = value
    } else {
      // { error: ... }, null, undefined, or an object marker -> unknown.
      unreadable.push(path)
    }
  }
  return { snapshot, unreadable }
}

/**
 * Compute the set of writes needed to make the device match the desired config.
 * @param {Object} params
 * @param {Object} params.snapshot   clean device values (path -> value)
 * @param {Object} params.desired    current desired values (path -> value)
 * @param {Set<string>|string[]} [params.editedPaths] paths the user explicitly changed
 * @returns {Array<{path:string, value:*, from:* }>}
 */
export function diffConfig({ snapshot = {}, desired = {}, editedPaths = [] }) {
  const edited = editedPaths instanceof Set ? editedPaths : new Set(editedPaths)
  const changes = []

  for (const [path, value] of Object.entries(desired)) {
    if (value === undefined || value === null) continue
    const known = Object.prototype.hasOwnProperty.call(snapshot, path)

    if (known) {
      if (!valuesEqual(value, snapshot[path])) {
        changes.push({ path, value, from: snapshot[path] })
      }
    } else if (edited.has(path)) {
      // Device value unknown but the user explicitly set this -> honour intent.
      changes.push({ path, value, from: undefined })
    }
    // else: un-edited and unknown device value -> never auto-write (the bug fix).
  }

  return changes
}

/** Convert a diff into the `/write` payload. */
export function toWrites(changes) {
  return changes.map(({ path, value }) => ({ path, value }))
}

/** Convert a diff into human-readable preview strings (e.g. for the Apply tab). */
export function toCommandStrings(changes, deviceLabel = 'odrv0') {
  return changes.map(({ path, value }) => `${deviceLabel}.${path} = ${formatValue(value)}`)
}

function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  return String(value)
}
