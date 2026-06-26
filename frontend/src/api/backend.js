// Typed client for the thin generic backend.
//
// Backend contract (see backend/app/app.py):
//   GET  /api/backend/version
//   GET  /api/devices
//   GET  /api/devices/<serial>/api-metadata[?section=]
//   POST /api/devices/<serial>/read     { paths: [...] }      -> { path: value | {error} }
//   POST /api/devices/<serial>/write    { writes: [{path,value}] } -> [{path,status,error?}]
//   POST /api/devices/<serial>/command  { path, args }        -> { path, result }
//   WS   /api/devices/<serial>/telemetry

async function getJson(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.error || JSON.stringify(body)
    } catch {
      detail = await res.text().catch(() => '')
    }
    throw new Error(`${options?.method || 'GET'} ${url} failed (${res.status})${detail ? `: ${detail}` : ''}`)
  }
  return res.json()
}

function postJson(url, body) {
  return getJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const enc = encodeURIComponent

// Lazy import to avoid a static cycle (deviceSocket imports telemetryUrl below).
async function trySocket(serial, action, payload) {
  if (!serial) return undefined
  const { getDeviceSocket } = await import('./deviceSocket')
  const sock = getDeviceSocket(serial)
  if (!sock || !sock.connected) return undefined
  try {
    return await sock.request(action, payload)
  } catch {
    return undefined // fall back to REST
  }
}

export function getBackendVersion() {
  return getJson('/api/backend/version')
}

export function listDevices() {
  return getJson('/api/devices')
}

export function getDeviceApiMetadata(serial, section) {
  const q = section ? `?section=${enc(section)}` : ''
  return getJson(`/api/devices/${enc(serial)}/api-metadata${q}`)
}

/**
 * Batch-read property paths.
 * @returns {Promise<Object>} map of path -> value, or path -> { error } for failed reads.
 */
export async function readProperties(serial, paths) {
  const viaSocket = await trySocket(serial, 'read', { paths })
  if (viaSocket !== undefined) return viaSocket
  return postJson(`/api/devices/${enc(serial)}/read`, { paths })
}

/**
 * Batch-write properties.
 * @param {Array<{path:string,value:*}>} writes
 * @returns {Promise<Array<{path:string,status:string,error?:string}>>}
 */
export async function writeProperties(serial, writes) {
  const viaSocket = await trySocket(serial, 'write', { writes })
  if (viaSocket !== undefined) return viaSocket
  return postJson(`/api/devices/${enc(serial)}/write`, { writes })
}

/**
 * Invoke a device method (e.g. save_configuration, clear_errors).
 */
export async function invokeCommand(serial, path, args = []) {
  const viaSocket = await trySocket(serial, 'command', { path, args })
  if (viaSocket !== undefined) return { path, result: viaSocket }
  return postJson(`/api/devices/${enc(serial)}/command`, { path, args })
}

/** Build the WebSocket URL for telemetry streaming. */
export function telemetryUrl(serial) {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/api/devices/${enc(serial)}/telemetry`
}

/** True when served by the standalone app (not the Vite dev server on :3000). */
export function isStandalone() {
  return window.location.port !== '3000'
}

/** Tell the standalone backend the UI is still open. No-op in dev. */
export function heartbeat() {
  return fetch('/api/heartbeat', { method: 'POST' }).catch(() => {})
}

/** Ask the standalone backend to shut down. No-op in dev. */
export function shutdownApp() {
  return fetch('/api/shutdown', { method: 'POST' }).catch(() => {})
}