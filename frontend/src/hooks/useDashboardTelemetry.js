import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce } from 'lodash'
import { updateOdriveState } from '../store/slices/deviceSlice'
import { updateTelemetry, setTelemetryConnectionHealth } from '../store/slices/telemetrySlice'

export const useDashboardTelemetry = () => {
  const { isConnected } = useSelector(state => state.device)
  const dispatch = useDispatch()
  const updateRate = 50 // Update rate in milliseconds

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

    // Expanded telemetry paths for dashboard - INCLUDING ERROR CODES
    const telemetryPaths = [
      'vbus_voltage',
      'axis0.motor.current_control.Iq_measured',
      'axis0.encoder.pos_estimate',
      'axis0.encoder.vel_estimate',
      'axis0.motor.motor_thermistor.temperature',
      'axis0.motor.fet_thermistor.temperature',
      'axis0.current_state',
      // Add error codes to telemetry for real-time error detection
      'axis0.error',
      'axis0.motor.error',
      'axis0.encoder.error',
      'axis0.controller.error',
      'axis0.sensorless_estimator.error'
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

          // Fix: The telemetry API returns data directly, not nested in data.data
          // Check if we have the expected structure
          if (data && typeof data === 'object') {
            const mapping = {
              vbus_voltage:                         'vbus_voltage',
              motor_current:                        'axis0.motor.current_control.Iq_measured',
              encoder_pos:                          'axis0.encoder.pos_estimate',
              encoder_vel:                          'axis0.encoder.vel_estimate',
              motor_temp:                           'axis0.motor.motor_thermistor.temperature',
              fet_temp:                             'axis0.motor.fet_thermistor.temperature',
              axis_state:                           'axis0.current_state',
              axis_error:                           'axis0.error',
              motor_error:                          'axis0.motor.error',
              encoder_error:                        'axis0.encoder.error',
              controller_error:                     'axis0.controller.error',
              sensorless_error:                     'axis0.sensorless_estimator.error',
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
                axis0: {
                  current_state: telemetryData.axis_state,
                  error: data['axis0.error'] || 0,  // Changed from data.data to data
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
                    error: data['axis0.motor.error'] || 0  // Changed from data.data to data
                  },
                  encoder: {
                    pos_estimate: telemetryData.encoder_pos,
                    vel_estimate: telemetryData.encoder_vel,
                    error: data['axis0.encoder.error'] || 0  // Changed from data.data to data
                  },
                  controller: {
                    error: data['axis0.controller.error'] || 0  // Changed from data.data to data
                  },
                  sensorless_estimator: {
                    error: data['axis0.sensorless_estimator.error'] || 0  // Changed from data.data to data
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
  }, [isConnected, dispatch, updateRate, debouncedDeviceDispatch])
}