import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  pushBatch,
  setStatus,
  setError,
  setIntervalMs
} from '../store/slices/telemetrySlice'

export function useTelemetry(serial) {
  const dispatch = useDispatch()
  const { selectedProperties, intervalMs, status } = useSelector(s => s.telemetry)
  const wsRef = useRef(null)
  const retryRef = useRef(0)

  // Open / manage WebSocket
  useEffect(() => {
    if (!serial || selectedProperties.length === 0) {
      // Close if open
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
        dispatch(setStatus('disconnected'))
      }
      return
    }

    if (status === 'connecting' || status === 'connected') {
      // Will handle subscription update below
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const base = `${protocol}//${window.location.host}`
      const url = `${base}/api/devices/${encodeURIComponent(serial)}/telemetry`
      dispatch(setStatus('connecting'))
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        retryRef.current = 0
        dispatch(setStatus('connected'))
        // Initial subscribe
        ws.send(JSON.stringify({
          action: 'subscribe',
            paths: selectedProperties,
            interval_ms: intervalMs
        }))
      }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.timestamp && msg.data) {
            dispatch(pushBatch(msg))
          } else if (msg.ack && msg.interval_ms) {
            dispatch(setIntervalMs(msg.interval_ms))
          } else if (msg.error) {
            dispatch(setError(msg.error))
          }
        } catch {
          // ignore parse errors
        }
      }
      ws.onerror = () => {
        dispatch(setError('ws_error'))
      }
      ws.onclose = () => {
        dispatch(setStatus('disconnected'))
        // simple retry
        if (selectedProperties.length > 0) {
          const delay = Math.min(5000, 500 * (retryRef.current + 1))
            retryRef.current += 1
          setTimeout(() => {
            // Trigger re-open by resetting status
            if (wsRef.current === ws) {
              wsRef.current = null
              dispatch(setStatus('idle'))
            }
          }, delay)
        }
      }
    }
  }, [serial, selectedProperties, intervalMs, dispatch, status])

  // Update subscription when property set changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'update',
        paths: selectedProperties
      }))
    }
  }, [selectedProperties])

  // Update interval
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'interval',
        interval_ms: intervalMs
      }))
    }
  }, [intervalMs])

  return null
}