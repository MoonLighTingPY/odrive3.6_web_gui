import { useEffect, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce } from 'lodash'
import { updateOdriveState, setConnectedDevice } from '../store/slices/deviceSlice'
import { updateTelemetry, setTelemetryConnectionHealth } from '../store/slices/telemetrySlice'


export const useDashboardTelemetry = () => {
  const { isConnected, connectedDevice, firmwareVersion } = useSelector(state => state.device)
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  const dispatch = useDispatch()
  let updateRate
  // for dev mode, update every 5000ms
  // for prod mode, update every 50ms
  if (import.meta.env.DEV) {
    updateRate = 500
  } else {
    updateRate = 50
  }
  const lastSerialRef = useRef(null)

  // Determine firmware family
  const is06x = (() => {
    if (typeof firmwareVersion !== 'string') return false
    const m = firmwareVersion.match(/(\d+)\.(\d+)/)
    if (!m) return false
    const major = parseInt(m[1], 10) || 0
    const minor = parseInt(m[2], 10) || 5
    return major === 0 && minor >= 6
  })()

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

    // Version-aware telemetry paths
    const axis = selectedAxis
    const telemetryPaths = is06x
      ? [
          'vbus_voltage',
          `axis${axis}.foc.Iq_measured`,
          `axis${axis}.load_mapper.pos_rel`,
          `axis${axis}.load_mapper.vel`,
          `axis${axis}.motor.motor_thermistor.temperature`,
          `axis${axis}.motor.fet_thermistor.temperature`,
          `axis${axis}.current_state`,
          // Errors/status (0.6.x)
          `axis${axis}.active_errors`,
          `axis${axis}.controller.status`,
          // Keep sensorless for 0.5.x only
        ]
      : [
          'vbus_voltage',
          `axis${axis}.motor.current_control.Iq_measured`,
          `axis${axis}.encoder.pos_estimate`,
          `axis${axis}.encoder.vel_estimate`,
          `axis${axis}.motor.motor_thermistor.temperature`,
          `axis${axis}.motor.fet_thermistor.temperature`,
          `axis${axis}.current_state`,
          // Errors (0.5.x)
          `axis${axis}.error`,
          `axis${axis}.motor.error`,
          `axis${axis}.encoder.error`,
          `axis${axis}.controller.error`,
          `axis${axis}.sensorless_estimator.error`
        ]

    const fetchTelemetry = async () => {
      try {
        const response = await fetch('/api/telemetry/get-telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: telemetryPaths })
        })

        if (response.ok) {
          // Robust JSON parsing with fallback for special numbers
          const responseText = await response.text()
          let data
          try {
            data = JSON.parse(responseText)
          // eslint-disable-next-line no-unused-vars
          } catch (e) {
            // eslint-disable-next-line no-useless-catch
            try {
              const cleaned = responseText
                .replace(/:NaN/g, ':null')
                .replace(/:Infinity/g, ':10000000000')
                .replace(/:-Infinity/g, ':-10000000000')
            data = JSON.parse(cleaned)
            } catch (e2) {
              throw e2
            }
          }

          // Heartbeat: check connection status from backend
          if (data.connected === false) {
            dispatch(setConnectedDevice(null))
            dispatch(setTelemetryConnectionHealth(false))
            return
          }

          if (data && typeof data === 'object') {
            // Version-aware mapping
            const mapping = is06x
              ? {
                  vbus_voltage: 'vbus_voltage',
                  motor_current: `axis${axis}.foc.Iq_measured`,
                  encoder_pos: `axis${axis}.load_mapper.pos_rel`,
                  encoder_vel: `axis${axis}.load_mapper.vel`,
                  motor_temp: `axis${axis}.motor.motor_thermistor.temperature`,
                  fet_temp: `axis${axis}.motor.fet_thermistor.temperature`,
                  axis_state: `axis${axis}.current_state`,
                  axis_error: `axis${axis}.active_errors`,
                  controller_status: `axis${axis}.controller.status`,
                }
              : {
                  vbus_voltage: 'vbus_voltage',
                  motor_current: `axis${axis}.motor.current_control.Iq_measured`,
                  encoder_pos: `axis${axis}.encoder.pos_estimate`,
                  encoder_vel: `axis${axis}.encoder.vel_estimate`,
                  motor_temp: `axis${axis}.motor.motor_thermistor.temperature`,
                  fet_temp: `axis${axis}.motor.fet_thermistor.temperature`,
                  axis_state: `axis${axis}.current_state`,
                  axis_error: `axis${axis}.error`,
                  motor_error: `axis${axis}.motor.error`,
                  encoder_error: `axis${axis}.encoder.error`,
                  controller_error: `axis${axis}.controller.error`,
                  sensorless_error: `axis${axis}.sensorless_estimator.error`,
                }

            const telemetryData = {}
            Object.entries(mapping).forEach(([key, path]) => {
              const val = data[path]
              if (val !== undefined) {
                telemetryData[key] = val
              }
            })

            // Dispatch to telemetry slice for immediate updates
            dispatch(updateTelemetry(telemetryData))

            // Compose dashboard device state (keep structure stable)
            const dashboardData = {
              device: {
                vbus_voltage: telemetryData.vbus_voltage,
                [`axis${axis}`]: {
                  current_state: telemetryData.axis_state,
                  // Errors
                  error: is06x ? (data[`axis${axis}.active_errors`] || 0) : (data[`axis${axis}.error`] || 0),
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
                    error: is06x ? 0 : (data[`axis${axis}.motor.error`] || 0)
                  },
                  encoder: is06x
                    ? {
                        pos_estimate: telemetryData.encoder_pos,
                        vel_estimate: telemetryData.encoder_vel,
                        error: 0,
                      }
                    : {
                        pos_estimate: telemetryData.encoder_pos,
                        vel_estimate: telemetryData.encoder_vel,
                        error: data[`axis${axis}.encoder.error`] || 0,
                      },
                  controller: is06x
                    ? { status: data[`axis${axis}.controller.status`] || 0 }
                    : { error: data[`axis${axis}.controller.error`] || 0 },
                  sensorless_estimator: is06x
                    ? {}
                    : { error: data[`axis${axis}.sensorless_estimator.error`] || 0 }
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
  }, [isConnected, selectedAxis, dispatch, updateRate, debouncedDeviceDispatch, firmwareVersion, is06x])
}