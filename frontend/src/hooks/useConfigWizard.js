import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import * as backend from '../api/backend'
import { buildDeviceSnapshot, diffConfig, toCommandStrings } from '../utils/configDiff'
import { expandAxisPath } from '../utils/odriveRegistry'
import { parseConsoleCommand } from '../utils/consoleCommand'
import { STEPS, resolvePath, stepFields } from '../utils/configSchema'
import { validateConfig } from '../utils/configValidation'

/**
 * Engine for the configuration wizard.
 *
 * Holds a clean device snapshot (only successfully-read scalars), the desired
 * form values, and the set of user-edited paths. Change detection runs through
 * configDiff so the Apply list only ever contains real, intended changes — the
 * fix for the phantom-command bug. Values are keyed by concrete (axis-expanded)
 * path.
 */
export function useConfigWizard() {
  const { connectedDevice, fw_line, isConnected } = useSelector((s) => s.device)
  const selectedAxis = useSelector((s) => s.ui.selectedAxis)
  const serial = connectedDevice?.serial_number
  const fwLine = fw_line || 5

  const [snapshot, setSnapshot] = useState({})
  const [desired, setDesired] = useState({})
  const [editedPaths, setEditedPaths] = useState(() => new Set())
  const [unreadable, setUnreadable] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPaths, setLoadingPaths] = useState(() => new Set())

  // Resolve a schema field to its concrete device path for the current axis/line.
  const concretePath = useCallback(
    (field) => {
      const resolved = resolvePath(field.path, fwLine)
      // Axis-scoped paths carry the `{n}` placeholder; everything else is global.
      return resolved.includes('{n}') ? expandAxisPath(resolved, selectedAxis) : resolved
    },
    [fwLine, selectedAxis]
  )

  const allPaths = useMemo(() => {
    const paths = new Set()
    for (const step of STEPS) {
      if (step.id === 'apply') continue
      for (const field of stepFields(step.id)) paths.add(concretePath(field))
    }
    return [...paths]
  }, [concretePath])

  const pullConfig = useCallback(async () => {
    if (!serial) return
    setLoading(true)
    try {
      const results = await backend.readProperties(serial, allPaths)
      const { snapshot: snap, unreadable: bad } = buildDeviceSnapshot(results)
      setSnapshot(snap)
      setUnreadable(bad)
      setDesired(snap) // start from real device values; never fabricate
      setEditedPaths(new Set())
    } finally {
      setLoading(false)
    }
  }, [serial, allPaths])

  // Auto-pull on connect / axis change.
  useEffect(() => {
    if (serial) pullConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serial, selectedAxis, fwLine])

  const setValue = useCallback(
    (field, value) => {
      const path = concretePath(field)
      setDesired((prev) => ({ ...prev, [path]: value }))
      setEditedPaths((prev) => new Set(prev).add(path))
    },
    [concretePath]
  )

  // Directly set a value by concrete path (used by "Use Calculated", unit toggles).
  const setValueByPath = useCallback((path, value) => {
    setDesired((prev) => ({ ...prev, [path]: value }))
    setEditedPaths((prev) => new Set(prev).add(path))
  }, [])

  const refreshField = useCallback(
    async (field) => {
      if (!serial) return
      const path = concretePath(field)
      setLoadingPaths((prev) => new Set(prev).add(path))
      try {
        const results = await backend.readProperties(serial, [path])
        const { snapshot: snap } = buildDeviceSnapshot(results)
        if (Object.prototype.hasOwnProperty.call(snap, path)) {
          setSnapshot((prev) => ({ ...prev, [path]: snap[path] }))
          setDesired((prev) => ({ ...prev, [path]: snap[path] }))
          setEditedPaths((prev) => {
            const next = new Set(prev)
            next.delete(path) // refreshed to real value -> no longer a pending edit
            return next
          })
          setUnreadable((prev) => prev.filter((p) => p !== path))
        }
      } finally {
        setLoadingPaths((prev) => {
          const next = new Set(prev)
          next.delete(path)
          return next
        })
      }
    },
    [serial, concretePath]
  )

  const fieldState = useCallback(
    (field) => {
      const path = concretePath(field)
      return {
        path,
        value: desired[path],
        known: Object.prototype.hasOwnProperty.call(snapshot, path),
        edited: editedPaths.has(path),
        isLoading: loadingPaths.has(path),
      }
    },
    [concretePath, desired, snapshot, editedPaths, loadingPaths]
  )

  const valueOf = useCallback((path) => desired[path], [desired])

  const validation = useMemo(
    () => validateConfig({ valueOf, axis: selectedAxis, fwLine }),
    [valueOf, selectedAxis, fwLine]
  )

  const changes = useMemo(
    () => diffConfig({ snapshot, desired, editedPaths }),
    [snapshot, desired, editedPaths]
  )

  // Write the pending changes, save to NVM, then re-pull the clean snapshot.
  const applyChanges = useCallback(async () => {
    if (!serial || changes.length === 0) return { written: 0, failed: [] }
    const writes = changes.map(({ path, value }) => ({ path, value }))
    const results = await backend.writeProperties(serial, writes)
    const failed = (results || []).filter((r) => r.status !== 'ok')
    await backend.invokeCommand(serial, 'save_configuration', [])
    await pullConfig()
    return { written: writes.length - failed.length, failed }
  }, [serial, changes, pullConfig])

  // Build odrivetool-style command strings for the Apply tab.
  // onlyChanged: only diff vs device (default). bothAxes: duplicate axis-scoped
  // commands for axis0 and axis1.
  const buildCommandStrings = useCallback(
    ({ onlyChanged = true, bothAxes = false } = {}) => {
      let items
      if (onlyChanged) {
        items = changes.map((c) => ({ path: c.path, value: c.value }))
      } else {
        items = []
        for (const step of STEPS) {
          if (step.id === 'apply') continue
          for (const field of stepFields(step.id)) {
            const path = concretePath(field)
            const value = desired[path]
            if (value !== undefined && value !== null) items.push({ path, value })
          }
        }
      }
      if (bothAxes) {
        const seen = new Set()
        const expanded = []
        for (const it of items) {
          if (/axis\d+/.test(it.path)) {
            for (const ax of [0, 1]) {
              const p = it.path.replace(/axis\d+/, `axis${ax}`)
              if (!seen.has(p)) { seen.add(p); expanded.push({ path: p, value: it.value }) }
            }
          } else if (!seen.has(it.path)) {
            seen.add(it.path)
            expanded.push(it)
          }
        }
        items = expanded
      }
      return toCommandStrings(items)
    },
    [changes, desired, concretePath]
  )

  // Parse and execute a list of command strings (incl. user-edited/custom ones),
  // then save and re-pull.
  const applyCommandStrings = useCallback(
    async (commandStrings) => {
      if (!serial) return { written: 0, failed: [] }
      const writes = []
      const calls = []
      for (const line of commandStrings) {
        const trimmed = String(line).trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const parsed = parseConsoleCommand(trimmed)
        if (parsed.error) continue
        if (parsed.type === 'write') writes.push({ path: parsed.path, value: parsed.value })
        else if (parsed.type === 'command') calls.push(parsed)
      }
      const failed = []
      if (writes.length) {
        const results = await backend.writeProperties(serial, writes)
        failed.push(...(results || []).filter((r) => r.status !== 'ok'))
      }
      for (const c of calls) {
        try {
          await backend.invokeCommand(serial, c.path, c.args)
        } catch (err) {
          failed.push({ path: c.path, error: String(err.message || err) })
        }
      }
      await backend.invokeCommand(serial, 'save_configuration', [])
      await pullConfig()
      return { written: writes.length + calls.length - failed.length, failed }
    },
    [serial, pullConfig]
  )

  return {
    serial,
    fwLine,
    selectedAxis,
    isConnected,
    loading,
    unreadable,
    changes,
    validation,
    pullConfig,
    applyChanges,
    buildCommandStrings,
    applyCommandStrings,
    setValue,
    setValueByPath,
    refreshField,
    fieldState,
    valueOf,
    concretePath,
  }
}
