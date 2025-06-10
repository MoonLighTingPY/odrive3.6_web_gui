import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateOdriveState, setConnectionLost } from '../store/slices/deviceSlice'

let globalTelemetryManager = null

class TelemetryManager {
  constructor() {
    this.subscribers = new Map()
    this.currentMode = 'default'
    this.currentPaths = []
    this.interval = null
    this.updateRate = 1000
    this.isRunning = false
    this.consecutiveErrors = 0
    this.maxConsecutiveErrors = 3
  }
  subscribe(id, config) {
    this.subscribers.set(id, config)
    this.updateTelemetryMode()
  }

  unsubscribe(id) {
    this.subscribers.delete(id)
    this.updateTelemetryMode()
  }

  updateTelemetryMode() {
    // Determine the optimal telemetry mode based on active subscribers
    let newMode = 'default'
    let newPaths = []
    let newRate = 1000

    // First pass: Check if we have any charts subscribers with paths
    let hasChartsWithPaths = false
    for (const [, config] of this.subscribers) {
      if (config.type === 'charts' && config.paths?.length > 0) {
        hasChartsWithPaths = true
        break
      }
    }

    // Second pass: Set mode based on priority
    for (const [, config] of this.subscribers) {
      if (config.type === 'charts' && config.paths?.length > 0) {
        newMode = 'charts'
        newPaths = [...new Set([...newPaths, ...config.paths])]
        // Limit maximum frequency to prevent overwhelming the backend
        const requestedRate = config.updateRate || 100
        const safeRate = Math.max(requestedRate, 50) // Minimum 50ms (20Hz max)
        newRate = Math.min(newRate, safeRate)
      } else if (config.type === 'dashboard' && !hasChartsWithPaths) {
        newMode = 'dashboard'
        newRate = Math.min(newRate, config.updateRate || 1000)
      } else if (config.type === 'inspector' && newMode === 'default') {
        newMode = 'inspector'
        newRate = Math.min(newRate, config.updateRate || 2000)
      }
    }

    // Only update if mode or paths changed
    if (newMode !== this.currentMode || 
        JSON.stringify(newPaths.sort()) !== JSON.stringify(this.currentPaths.sort()) ||
        newRate !== this.updateRate) {
      
      this.currentMode = newMode
      this.currentPaths = newPaths
      this.updateRate = newRate
      
      console.log(`Telemetry mode changed to: ${newMode}, paths: ${newPaths.length}, rate: ${newRate}ms, paths: [${newPaths.join(', ')}]`)
      this.restartTelemetry()
    }
  }

  async healthCheck() {
    try {
      // Use connection status endpoint instead of command for health check
      // This is more efficient and less resource intensive
      const response = await fetch('/api/odrive/connection_status')
      
      if (response.ok) {
        const status = await response.json()
        // Check if connected and not lost, and has valid device serial
        return status.connected && !status.connection_lost && status.device_serial
      }
      return false
    } catch (error) {
      console.warn('Health check failed:', error)
      return false
    }
  }

  async restartTelemetry() {
    if (this.interval) {
      clearInterval(this.interval)
    }

    if (this.subscribers.size === 0) {
      this.isRunning = false
      return
    }

    this.isRunning = true
    this.consecutiveErrors = 0

    this.interval = setInterval(async () => {
      // Skip if we're already processing a request or have too many errors
      if (!this.isRunning) return
      
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        console.warn(`Telemetry paused due to ${this.consecutiveErrors} consecutive errors`)
        // Increase update rate to reduce load
        this.updateRate = Math.max(this.updateRate * 2, 1000)
        this.consecutiveErrors = 0
        this.restartTelemetry()
        return
      }

      try {
        this.isRunning = false // Prevent overlapping requests

        const payload = {
          mode: this.currentMode,
          paths: this.currentPaths
        }

        const response = await fetch('/api/odrive/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          const data = await response.json()
          
          // Verify we have valid data with vbus_voltage > 0
          if (data.device && data.device.vbus_voltage > 0) {
            this.consecutiveErrors = 0 // Reset error counter on success
            // Notify all subscribers
            this.subscribers.forEach((config) => {
              if (config.callback) {
                config.callback(data)
              }
            })
          } else {
            this.consecutiveErrors++
            console.warn('Received telemetry data with no power (vbus_voltage <= 0)')
            this.notifyDisconnection()
          }
        } else if (response.status === 404) {
          this.consecutiveErrors++
          console.warn('ODrive disconnected - received 404 from telemetry endpoint')
          this.notifyDisconnection()
        } else {
          this.consecutiveErrors++
          console.warn(`Telemetry request failed with status: ${response.status}`)
        }
      } catch (error) {
        this.consecutiveErrors++
        console.error('Telemetry fetch error:', error)
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          this.notifyDisconnection()
        }
      } finally {
        this.isRunning = true // Allow next request
      }
    }, this.updateRate)
  }

  notifyDisconnection() {
    this.subscribers.forEach((config) => {
      if (config.onDisconnected) {
        config.onDisconnected()
      }
    })
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isRunning = false
    this.consecutiveErrors = 0
  }
}

// Get or create global telemetry manager
const getTelemetryManager = () => {
  if (!globalTelemetryManager) {
    globalTelemetryManager = new TelemetryManager()
  }
  return globalTelemetryManager
}

export const useTelemetry = (config) => {
  const { isConnected } = useSelector(state => state.device)
  const dispatch = useDispatch()
  const configRef = useRef(config)
  const idRef = useRef(Math.random().toString(36).substr(2, 9))

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    if (!isConnected || !config) return

    const manager = getTelemetryManager()
    const id = idRef.current

    // Subscribe with callback that updates Redux store
    manager.subscribe(id, {
      ...config,
      callback: (data) => {
        // Add null check to prevent errors when component unmounts
        if (configRef.current && configRef.current.onData) {
          configRef.current.onData(data)
        } else if (configRef.current) {
          // Default: update Redux store
          dispatch(updateOdriveState(data))
        }
      },
      onDisconnected: () => {
        // Add null check here too
        if (configRef.current) {
          // Handle disconnection - update Redux state
          dispatch(setConnectionLost(true))
          console.log('ODrive disconnected - updating frontend state')
        }
      }
    })

    return () => {
      manager.unsubscribe(id)
    }
  }, [isConnected, dispatch, config]) // Add config to dependencies
}