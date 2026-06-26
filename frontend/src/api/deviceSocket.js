// Single WebSocket per device, shared by telemetry streaming and the
// request/response read/write/command operations. One connection keeps the
// charts, sidebar and config tabs in sync and serializes USB access on the
// backend, so config reads no longer contend with the stream.
import { telemetryUrl } from './backend'

const REQUEST_TIMEOUT_MS = 8000

const sockets = new Map() // serial -> DeviceSocket

class DeviceSocket {
  constructor(serial) {
    this.serial = serial
    this.ws = null
    this.connected = false
    this.retry = 0
    this.reconnectTimer = null
    this.cancelled = false
    this.nextId = 1
    this.pending = new Map() // id -> { resolve, reject, timer }
    this.telemetryListeners = new Set()
    this.statusListeners = new Set()
    this.sub = null // { paths, intervalMs }
    this._connect()
  }

  _connect() {
    this._emitStatus('connecting')
    const ws = new WebSocket(telemetryUrl(this.serial))
    this.ws = ws
    ws.onopen = () => {
      this.retry = 0
      this.connected = true
      this._emitStatus('connected')
      if (this.sub) this.subscribe(this.sub.paths, this.sub.intervalMs)
    }
    ws.onmessage = (ev) => {
      let msg
      try { msg = JSON.parse(ev.data) } catch { return }
      if (msg.id != null && this.pending.has(msg.id)) {
        const { resolve, reject, timer } = this.pending.get(msg.id)
        clearTimeout(timer)
        this.pending.delete(msg.id)
        if (msg.ok) resolve(msg.result)
        else reject(new Error(msg.error || 'request failed'))
        return
      }
      if (msg.timestamp && msg.data) {
        for (const fn of this.telemetryListeners) fn(msg)
      }
    }
    ws.onerror = () => { /* onclose handles reconnect */ }
    ws.onclose = () => {
      this.connected = false
      this._emitStatus('disconnected')
      this._failPending('socket closed')
      if (this.cancelled) return
      const delay = Math.min(5000, 500 * (this.retry + 1))
      this.retry += 1
      this.reconnectTimer = setTimeout(() => this._connect(), delay)
    }
  }

  _emitStatus(s) { for (const fn of this.statusListeners) fn(s) }

  _failPending(reason) {
    for (const [, p] of this.pending) {
      clearTimeout(p.timer)
      p.reject(new Error(reason))
    }
    this.pending.clear()
  }

  onTelemetry(fn) { this.telemetryListeners.add(fn); return () => this.telemetryListeners.delete(fn) }
  onStatus(fn) { this.statusListeners.add(fn); return () => this.statusListeners.delete(fn) }

  subscribe(paths, intervalMs) {
    this.sub = { paths, intervalMs }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', paths, interval_ms: intervalMs }))
    }
  }

  request(action, payload) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('socket not connected'))
        return
      }
      const id = this.nextId++
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${action} timed out`))
      }, REQUEST_TIMEOUT_MS)
      this.pending.set(id, { resolve, reject, timer })
      this.ws.send(JSON.stringify({ action, id, ...payload }))
    })
  }

  close() {
    this.cancelled = true
    clearTimeout(this.reconnectTimer)
    this._failPending('socket closed')
    if (this.ws) { this.ws.close(); this.ws = null }
  }
}

export function getDeviceSocket(serial) {
  if (!serial) return null
  let s = sockets.get(serial)
  if (!s) { s = new DeviceSocket(serial); sockets.set(serial, s) }
  return s
}

export function closeDeviceSocket(serial) {
  const s = sockets.get(serial)
  if (s) { s.close(); sockets.delete(serial) }
}

export function isSocketConnected(serial) {
  const s = sockets.get(serial)
  return !!(s && s.connected)
}
