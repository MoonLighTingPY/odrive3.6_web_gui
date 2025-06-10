import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateOdriveState, setConnectedDevice, setConnectionLost } from '../store/slices/deviceSlice'

let globalTelemetryManager = null

class TelemetryManager {
  constructor() {
    this.subscribers = new Map()
    this.currentMode = 'default'
    this.currentPaths = []
    this.interval = null
    this.updateRate = 1000 // Default 1Hz
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

    // Charts mode takes highest priority for performance
    for (const [, config] of this.subscribers) {
      if (config.type === 'charts' && config.paths?.length > 0) {
        newMode = 'charts'
        newPaths = [...new Set([...newPaths, ...config.paths])]
        newRate = Math.min(newRate, config.updateRate || 1000) // High frequency for charts
      } else if (config.type === 'dashboard' && newMode !== 'charts') {
        newMode = 'dashboard'
        newRate = Math.min(newRate, config.updateRate || 100)
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
      
      console.log(`Telemetry mode changed to: ${newMode}, paths: ${newPaths.length}, rate: ${newRate}ms`)
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

    if (this.subscribers.size === 0) return

    this.interval = setInterval(async () => {
      try {
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
            // Notify all subscribers
            this.subscribers.forEach((config) => {
              if (config.callback) {
                config.callback(data)
              }
            })
          } else {
            console.warn('Received telemetry data with no power (vbus_voltage <= 0)')
            // Notify subscribers about disconnection
            this.subscribers.forEach((config) => {
              if (config.onDisconnected) {
                config.onDisconnected()
              }
            })
          }
        } else if (response.status === 404) {
          console.warn('ODrive disconnected - received 404 from telemetry endpoint')
          // Notify subscribers about disconnection
          this.subscribers.forEach((config) => {
            if (config.onDisconnected) {
              config.onDisconnected()
            }
          })
        } else {
          console.warn(`Telemetry request failed with status: ${response.status}`)
        }
      } catch (error) {
        console.error('Telemetry fetch error:', error)
        // Notify subscribers about connection error
        this.subscribers.forEach((config) => {
          if (config.onDisconnected) {
            config.onDisconnected()
          }
        })
      }
    }, this.updateRate)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
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
    if (!isConnected) return

    const manager = getTelemetryManager()
    const id = idRef.current

    // Subscribe with callback that updates Redux store
    manager.subscribe(id, {
      ...configRef.current,
      callback: (data) => {
        if (configRef.current.onData) {
          configRef.current.onData(data)
        } else {
          // Default: update Redux store
          dispatch(updateOdriveState(data))
        }
      },
      onDisconnected: () => {
        // Handle disconnection - update Redux state
        dispatch(setConnectedDevice(null))
        dispatch(setConnectionLost(true))
        console.log('ODrive disconnected - updating frontend state')
      }
    })

    return () => {
      manager.unsubscribe(id)
    }
  }, [isConnected, dispatch])
}