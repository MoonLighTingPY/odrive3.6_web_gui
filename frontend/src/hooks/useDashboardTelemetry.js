import { useEffect, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce } from 'lodash'
import { updateOdriveState, setConnectedDevice } from '../store/slices/deviceSlice'
import { updateTelemetry, setTelemetryConnectionHealth } from '../store/slices/telemetrySlice'

export const useDashboardTelemetry = () => {
  const { isConnected, connectedDevice } = useSelector(state => state.device)
  const selectedAxis = useSelector(state => state.ui.selectedAxis) // ADD THIS
  const dispatch = useDispatch()
  const updateRate = 50
  const lastSerialRef = useRef(null)

  // Track last connected serial
  useEffect(() => {
    if (connectedDevice?.serial) {
      lastSerialRef.current = connectedDevice.serial
    }
  }, [connectedDevice])

  // Debounced dispatcher for device state (updates every 500ms max)
  const debouncedDeviceDispatch = useMemo(
    () => debounce((data) => dispatch(updateOdriveState(data)), 500),
    [dispatch]
  )

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedDeviceDispatch.cancel()
    }
  }, [debouncedDeviceDispatch])

  useEffect(() => {
    if (!isConnected) {
      // Clear telemetry when disconnected
      dispatch(setTelemetryConnectionHealth(false))
      return
    }

    // Dynamic telemetry paths based on selected axis
    const telemetryPaths = [
      'vbus_voltage',
      `axis${selectedAxis}.motor.current_control.Iq_measured`,
      `axis${selectedAxis}.encoder.pos_estimate`,
      `axis${selectedAxis}.encoder.vel_estimate`,
      `axis${selectedAxis}.motor.motor_thermistor.temperature`,
      `axis${selectedAxis}.motor.fet_thermistor.temperature`,
      `axis${selectedAxis}.current_state`,
      // Add error codes to telemetry for real-time error detection
      `axis${selectedAxis}.error`,
      `axis${selectedAxis}.motor.error`,
      `axis${selectedAxis}.encoder.error`,
      `axis${selectedAxis}.controller.error`,
      `axis${selectedAxis}.sensorless_estimator.error`
    ]

    const fetchTelemetry = async () => {
      try {
        const response = await fetch('/api/telemetry/get-telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: telemetryPaths })
        })

        if (response.ok) {
          const data = await response.json()

          // Heartbeat: check connection status from backend
          if (data.connected === false) {
            dispatch(setConnectedDevice(null))
            dispatch(setTelemetryConnectionHealth(false))
            return
          }

          // Fix: The telemetry API returns data directly, not nested in data.data
          // Check if we have the expected structure
          if (data && typeof data === 'object') {
            // Dynamic mapping based on selected axis
            const mapping = {
              vbus_voltage: 'vbus_voltage',
              motor_current: `axis${selectedAxis}.motor.current_control.Iq_measured`,
              encoder_pos: `axis${selectedAxis}.encoder.pos_estimate`,
              encoder_vel: `axis${selectedAxis}.encoder.vel_estimate`,
              motor_temp: `axis${selectedAxis}.motor.motor_thermistor.temperature`,
              fet_temp: `axis${selectedAxis}.motor.fet_thermistor.temperature`,
              axis_state: `axis${selectedAxis}.current_state`,
              axis_error: `axis${selectedAxis}.error`,
              motor_error: `axis${selectedAxis}.motor.error`,
              encoder_error: `axis${selectedAxis}.encoder.error`,
              controller_error: `axis${selectedAxis}.controller.error`,
              sensorless_error: `axis${selectedAxis}.sensorless_estimator.error`,
            }

            const telemetryData = {}
            Object.entries(mapping).forEach(([key, path]) => {
              const val = data[path]  // Changed from data.data[path] to data[path]
              if (val !== undefined) {
                telemetryData[key] = val
              }
            })

            // Dispatch to telemetry slice for immediate updates
            dispatch(updateTelemetry(telemetryData))

            // Debounced update to main device state (for compatibility and error codes)
            const dashboardData = {
              device: {
                vbus_voltage: telemetryData.vbus_voltage,
                [`axis${selectedAxis}`]: {
                  current_state: telemetryData.axis_state,
                  error: data[`axis${selectedAxis}.error`] || 0,  // Changed from data.data to data
                  motor: {
                    current_control: {
                      Iq_measured: telemetryData.motor_current
                    },
                    motor_thermistor: {
                      temperature: telemetryData.motor_temp
                    },
                    fet_thermistor: {
                      temperature: telemetryData.fet_temp
                    },
                    error: data[`axis${selectedAxis}.motor.error`] || 0  // Changed from data.data to data
                  },
                  encoder: {
                    pos_estimate: telemetryData.encoder_pos,
                    vel_estimate: telemetryData.encoder_vel,
                    error: data[`axis${selectedAxis}.encoder.error`] || 0  // Changed from data.data to data
                  },
                  controller: {
                    error: data[`axis${selectedAxis}.controller.error`] || 0  // Changed from data.data to data
                  },
                  sensorless_estimator: {
                    error: data[`axis${selectedAxis}.sensorless_estimator.error`] || 0  // Changed from data.data to data
                  }
                }
              },
              timestamp: Date.now()  // Generate timestamp if not provided
            }

            // Debounced dispatch to main device state
            debouncedDeviceDispatch(dashboardData)

            // Set connection health to true when we successfully get data
            dispatch(setTelemetryConnectionHealth(true))

          } else {
            console.warn('Unexpected telemetry response structure:', data)
          }
        } else if (response.status === 404 || response.status === 400) {
          // Device disconnected
          dispatch(setTelemetryConnectionHealth(false))
        }
      } catch (error) {
        console.warn('Dashboard telemetry error:', error)
        dispatch(setTelemetryConnectionHealth(false))
      }
    }

    // Fetch immediately when connected
    fetchTelemetry()

    // Then set up interval for regular updates
    const interval = setInterval(fetchTelemetry, updateRate)

    return () => {
      clearInterval(interval)
    }
  }, [isConnected, selectedAxis, dispatch, updateRate, debouncedDeviceDispatch]) // ADD selectedAxis to dependencies
}