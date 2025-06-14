import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce } from 'lodash'
import { updateOdriveState, setConnectionLost } from '../store/slices/deviceSlice'
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

    // Expanded telemetry paths for dashboard
    const telemetryPaths = [
      'vbus_voltage',
      'axis0.motor.current_control.Iq_setpoint',
      'axis0.encoder.pos_estimate',
      'axis0.encoder.vel_estimate',
      'axis0.motor.motor_thermistor.temperature',
      'axis0.motor.fet_thermistor.temperature',
      'axis0.current_state'
    ]

    const fetchTelemetry = async () => {
      try {
        const response = await fetch('/api/charts/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: telemetryPaths })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Update high-frequency telemetry slice immediately
          const telemetryData = {
            vbus_voltage: data.data['vbus_voltage'] || 0,
            motor_current: data.data['axis0.motor.current_control.Iq_setpoint'] || 0,
            encoder_pos: data.data['axis0.encoder.pos_estimate'] || 0,
            encoder_vel: data.data['axis0.encoder.vel_estimate'] || 0,
            motor_temp: data.data['axis0.motor.motor_thermistor.temperature'] || 0,
            fet_temp: data.data['axis0.motor.fet_thermistor.temperature'] || 0,
            axis_state: data.data['axis0.current_state'] || 0,
          }
          
          // Immediate update to telemetry slice (no debouncing)
          dispatch(updateTelemetry(telemetryData))
          
          // Debounced update to main device state (for compatibility)
          const dashboardData = {
            device: {
              vbus_voltage: telemetryData.vbus_voltage,
              axis0: {
                current_state: telemetryData.axis_state,
                motor: {
                  current_control: {
                    Iq_measured: telemetryData.motor_current
                  },
                  motor_thermistor: {
                    temperature: telemetryData.motor_temp
                  },
                  fet_thermistor: {
                    temperature: telemetryData.fet_temp
                  }
                },
                encoder: {
                  pos_estimate: telemetryData.encoder_pos,
                  vel_estimate: telemetryData.encoder_vel
                }
              }
            },
            timestamp: data.timestamp
          }
          
          // Debounced dispatch to main device state
          debouncedDeviceDispatch(dashboardData)
          
        } else if (response.status === 404) {
          dispatch(setConnectionLost(true))
          dispatch(setTelemetryConnectionHealth(false))
        }
      } catch (error) {
        console.error('Dashboard telemetry error:', error)
        dispatch(setConnectionLost(true))
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