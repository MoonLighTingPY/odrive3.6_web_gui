import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDeviceSocket, closeDeviceSocket } from '../api/deviceSocket'
import { pushBatch, setStatus } from '../store/slices/telemetrySlice'
import { setLiveStatus, resetLiveStatus } from '../store/slices/liveSlice'

// How long after the last frame we still consider the stream "alive". A brief
// gap (re-subscribe, slow read) must not flip the badge to disconnected.
const STALE_AFTER_MS = 1500

// Coalesce live-status UI updates to this cadence. The WebSocket may push at a
// much higher rate (intervalMs, e.g. 10 Hz) which charts consume in full, but
// the sidebar/dashboard gauges only need a human-readable refresh rate. This
// decouples the heavy React tree from the raw message rate.
const LIVE_UI_INTERVAL_MS = 150

// Shallow value-equality over the flat live-status payload so we skip dispatch
// (and the re-render it causes) when nothing actually changed.
function sameLiveStatus(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  for (const k of keys) {
    if (a[k] !== b[k]) return false
  }
  return true
}

// Fixed live-status paths (per axis) the sidebar + dashboard always need.
function statusPaths(axis) {
  return [
    'vbus_voltage',
    'ibus',
    `axis${axis}.current_state`,
    `axis${axis}.error`,
    `axis${axis}.motor.error`,
    `axis${axis}.encoder.error`,
    `axis${axis}.controller.error`,
    `axis${axis}.sensorless_estimator.error`,
    `axis${axis}.motor.current_control.Iq_measured`,
    `axis${axis}.encoder.pos_estimate`,
    `axis${axis}.encoder.vel_estimate`,
    `axis${axis}.motor.motor_thermistor.temperature`,
    `axis${axis}.motor.fet_thermistor.temperature`,
  ]
}

/**
 * Single WebSocket per device that streams BOTH the always-on live status and
 * the user-selected chart properties. This replaces the old per-component HTTP
 * polling (250 ms `read` loop) and the separate chart socket — one push stream
 * keeps the sidebar, dashboard, and charts in sync with minimal overhead.
 *
 * The socket subscribes to the union of `statusPaths(axis)` and the telemetry
 * slice's `selectedProperties`; each message updates the `live` slice (status)
 * and the `telemetry` slice (chart samples).
 */
export function useDeviceTelemetry(serial) {
  const dispatch = useDispatch()
  const axis = useSelector((s) => s.ui.selectedAxis)
  const selectedProperties = useSelector((s) => s.telemetry.selectedProperties)
  const intervalMs = useSelector((s) => s.telemetry.intervalMs)

  const wsRef = useRef(null)
  const axisRef = useRef(axis)
  axisRef.current = axis
  // Latest live-status payload (updated every message) and the last one we
  // actually dispatched. A timer flushes pending -> store at LIVE_UI_INTERVAL_MS.
  const pendingLiveRef = useRef(null)
  const lastSentLiveRef = useRef(null)
  // Timestamp of the most recent telemetry frame; used to derive a stable
  // connected/disconnected badge that tolerates brief gaps.
  const lastFrameRef = useRef(0)

  const allPaths = Array.from(new Set([...statusPaths(axis), ...selectedProperties]))
  const subscriptionKey = `${allPaths.slice().sort().join('|')}@${intervalMs}`
  const subRef = useRef({ paths: allPaths, intervalMs })
  subRef.current = { paths: allPaths, intervalMs }
  // Latest selected chart properties; used to skip the (heavy) pushBatch dispatch
  // entirely when nothing is being charted, so the telemetry slice doesn't churn
  // and re-render chart consumers at the raw message rate for no reason.
  const selectedRef = useRef(selectedProperties)
  selectedRef.current = selectedProperties

  // Open (or reuse) the shared device socket; subscribe and wire listeners.
  useEffect(() => {
    if (!serial) {
      dispatch(resetLiveStatus())
      wsRef.current = null
      return undefined
    }

    const sock = getDeviceSocket(serial)
    wsRef.current = sock

    const offStatus = sock.onStatus((s) => dispatch(setStatus(s)))
    const offTelemetry = sock.onTelemetry((msg) => {
      lastFrameRef.current = Date.now()
      const d = msg.data
      const a = axisRef.current
      const num = (p) => (typeof d[p] === 'number' ? d[p] : 0)
      const temp = (p) => (typeof d[p] === 'number' ? d[p] : null)

      // Chart samples (filtered by selectedProperties), full rate — but only
      // when something is actually being charted.
      if (selectedRef.current.length) dispatch(pushBatch(msg))
      // Stash the latest status; the flush timer dispatches it at UI cadence.
      pendingLiveRef.current = {
        connected: true,
        axis: a,
        vbus_voltage: num('vbus_voltage'),
        ibus: num('ibus'),
        axis_state: num(`axis${a}.current_state`),
        axis_error: num(`axis${a}.error`),
        motor_error: num(`axis${a}.motor.error`),
        encoder_error: num(`axis${a}.encoder.error`),
        controller_error: num(`axis${a}.controller.error`),
        sensorless_error: num(`axis${a}.sensorless_estimator.error`),
        motor_current: num(`axis${a}.motor.current_control.Iq_measured`),
        encoder_pos: num(`axis${a}.encoder.pos_estimate`),
        encoder_vel: num(`axis${a}.encoder.vel_estimate`),
        motor_temp: temp(`axis${a}.motor.motor_thermistor.temperature`),
        fet_temp: temp(`axis${a}.motor.fet_thermistor.temperature`),
      }
    })

    sock.subscribe(subRef.current.paths, subRef.current.intervalMs)

    return () => {
      offStatus()
      offTelemetry()
      closeDeviceSocket(serial)
      wsRef.current = null
      pendingLiveRef.current = null
      lastSentLiveRef.current = null
      lastFrameRef.current = 0
      dispatch(resetLiveStatus())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serial])

  // Flush the latest live status into the store at a steady UI cadence, and only
  // when it actually changed. This is what keeps the always-mounted sidebar and
  // dashboard from re-rendering on every single WebSocket message. Also flips
  // `connected` false once frames stop arriving for STALE_AFTER_MS.
  useEffect(() => {
    const id = setInterval(() => {
      const next = pendingLiveRef.current
      if (!next) return
      const fresh = Date.now() - lastFrameRef.current < STALE_AFTER_MS
      const payload = fresh ? next : { ...next, connected: false }
      if (sameLiveStatus(payload, lastSentLiveRef.current)) return
      lastSentLiveRef.current = payload
      dispatch(setLiveStatus(payload))
    }, LIVE_UI_INTERVAL_MS)
    return () => clearInterval(id)
  }, [dispatch])

  // Re-subscribe in place when the path set or interval changes (no reconnect),
  // covering axis switches and chart property toggles.
  useEffect(() => {
    const sock = wsRef.current
    if (sock) sock.subscribe(subRef.current.paths, subRef.current.intervalMs)
  }, [subscriptionKey])
}
