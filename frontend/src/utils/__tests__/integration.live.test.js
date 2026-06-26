// Live integration test against a running mock backend.
// Skipped unless LIVE_BACKEND=1 (so normal `npm test` stays hermetic).
// Run with:  ODRIVE_MOCK backend up, then  LIVE_BACKEND=1 npx vitest run integration.live
import { describe, it, expect, beforeAll } from 'vitest'
import { writableConfigPaths } from '../odriveRegistry'
import { buildDeviceSnapshot, diffConfig, toWrites } from '../configDiff'

const BASE = process.env.BACKEND_URL || 'http://127.0.0.1:5000'
const run = process.env.LIVE_BACKEND ? describe : describe.skip

async function read(serial, paths) {
  const res = await fetch(`${BASE}/api/devices/${serial}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  })
  return res.json()
}

run('live config flow (the phantom-command bug fix)', () => {
  let serial

  beforeAll(async () => {
    const devs = await (await fetch(`${BASE}/api/devices`)).json()
    serial = devs[0].serial_number
  })

  it('produces ZERO writes when nothing is edited (no phantom commands)', async () => {
    const paths = writableConfigPaths(5, [0])
    const results = await read(serial, paths)
    const { snapshot } = buildDeviceSnapshot(results)
    // desired == snapshot, no edits -> the Apply list must be empty.
    const changes = diffConfig({ snapshot, desired: snapshot, editedPaths: [] })
    expect(changes).toEqual([])
  })

  it('writes only the parameter the user changed, then persists it', async () => {
    const path = 'axis0.motor.config.pole_pairs'
    const before = await read(serial, [path])
    const { snapshot } = buildDeviceSnapshot(before)

    const desired = { ...snapshot, [path]: 14 }
    const changes = diffConfig({ snapshot, desired, editedPaths: [path] })
    expect(changes).toEqual([{ path, value: 14, from: snapshot[path] }])

    await fetch(`${BASE}/api/devices/${serial}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: toWrites(changes) }),
    })
    await fetch(`${BASE}/api/devices/${serial}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'save_configuration', args: [] }),
    })

    const after = await read(serial, [path])
    expect(after[path]).toBe(14)

    // Re-pull: with the new value as the snapshot, a fresh no-edit diff is empty again.
    const { snapshot: snap2 } = buildDeviceSnapshot(after)
    expect(diffConfig({ snapshot: snap2, desired: snap2, editedPaths: [] })).toEqual([])
  })
})
