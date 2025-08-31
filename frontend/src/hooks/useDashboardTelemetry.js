import { useEffect, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce } from 'lodash'
import { updateOdriveState, setConnectedDevice } from '../store/slices/deviceSlice'
import { updateTelemetry, setTelemetryConnectionHealth } from '../store/slices/telemetrySlice'


export const useDashboardTelemetry = () => {
  const { isConnected, connectedDevice, fw_is_0_6, fw_is_0_5 } = useSelector(state => state.device)
  const selectedAxis = useSelector(state => state.ui.selectedAxis) // ADD THIS
  const dispatch = useDispatch()
  let updateRate
  // for dev mode, update every 5000ms
  // for prod mode, update every 50ms
  if (import.meta.env.DEV) {
    updateRate = 5000
  } else {
    updateRate = 50
  }
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

    // Dynamic telemetry paths based on firmware version and selected axis
    const getTelemetryPaths = () => {
      const basePaths = ['vbus_voltage', `axis${selectedAxis}.current_state`]
      
      if (fw_is_0_6) {
        // 0.6.x paths
        return [
          ...basePaths,
          `axis${selectedAxis}.motor.foc.Iq_measured`,
          `axis${selectedAxis}.pos_estimate`,
          `axis${selectedAxis}.vel_estimate`,
          `axis${selectedAxis}.motor.fet_thermistor.temperature`,
          // 0.6.x uses active_errors instead of individual error fields
          `axis${selectedAxis}.active_errors`,
          `axis${selectedAxis}.disarm_reason`,
          // Motor thermistor path for 0.6.x (if available)
          `axis${selectedAxis}.motor.motor_thermistor.temperature`
        ]
      } else if (fw_is_0_5) {
        // 0.5.x paths (original)
        return [
          ...basePaths,
          `axis${selectedAxis}.motor.current_control.Iq_measured`,
          `axis${selectedAxis}.encoder.pos_estimate`,
          `axis${selectedAxis}.encoder.vel_estimate`,
          `axis${selectedAxis}.motor.motor_thermistor.temperature`,
          `axis${selectedAxis}.motor.fet_thermistor.temperature`,
          `axis${selectedAxis}.error`,
          `axis${selectedAxis}.motor.error`,
          `axis${selectedAxis}.encoder.error`,
          `axis${selectedAxis}.controller.error`,
          `axis${selectedAxis}.sensorless_estimator.error`
        ]
      }
    }

    const telemetryPaths = getTelemetryPaths()

    const fetchTelemetry = async () => {
      try {
        const response = await fetch('/api/telemetry/get-telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: telemetryPaths })
        })

        if (response.ok) {
          // Read raw text first so we can log / clean NaN or invalid tokens
          const responseText = await response.text()
          let data
          let rawHadInvalidToken = false

          try {
            data = JSON.parse(responseText)
          } catch (parseErr) {
            // If the backend sent bare NaN/Infinity tokens (invalid JSON), try to clean them
            if (/\bNaN\b/.test(responseText) || /\bInfinity\b/.test(responseText) || /\b-Infinity\b/.test(responseText)) {
              rawHadInvalidToken = true
              // Log the raw response once (requested)
              console.warn('Telemetry raw response contained invalid tokens (NaN/Infinity). Raw response:', responseText)
              // Replace invalid tokens with null / large sentinel so JSON.parse succeeds
              const cleaned = responseText
                .replace(/\bNaN\b/g, 'null')
                .replace(/\bInfinity\b/g, '1e10')
                .replace(/\b-Infinity\b/g, '-1e10')
              try {
                data = JSON.parse(cleaned)
              } catch (cleanErr) {
                console.warn('Failed to parse cleaned telemetry response:', cleaned)
                throw cleanErr
              }
            } else {
              // Not a NaN/Infinity case — bubble up so outer catch logs
              console.warn('Failed to parse telemetry response. Raw response:', responseText)
              throw parseErr
            }
          }

          // Heartbeat: check connection status from backend
          if (data.connected === false) {
            dispatch(setConnectedDevice(null))
            dispatch(setTelemetryConnectionHealth(false))
            return
          }

          if (data && typeof data === 'object') {
            // Create version-aware mapping
            const getMapping = () => {
              if (fw_is_0_6) {
                return {
                  vbus_voltage: 'vbus_voltage',
                  motor_current: `axis${selectedAxis}.motor.foc.Iq_measured`,
                  encoder_pos: `axis${selectedAxis}.pos_estimate`,
                  encoder_vel: `axis${selectedAxis}.vel_estimate`,
                  motor_temp: `axis${selectedAxis}.motor.motor_thermistor.temperature`,
                  fet_temp: `axis${selectedAxis}.motor.fet_thermistor.temperature`,
                  axis_state: `axis${selectedAxis}.current_state`,
                  axis_error: `axis${selectedAxis}.active_errors`,
                  disarm_reason: `axis${selectedAxis}.disarm_reason`
                }
              } else {
                // 0.5.x mapping (original)
                return {
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
                  sensorless_error: `axis${selectedAxis}.sensorless_estimator.error`
                }
              }
            }

            const mapping = getMapping()
            const telemetryData = {}
            let sanitizedAny = false

            const sanitizeValue = (val) => {
              // Replace NaN or non-finite numbers with safe defaults
              if (typeof val === 'number') {
                if (!isFinite(val) || Number.isNaN(val)) {
                  sanitizedAny = true
                  return 0
                }
                return val
              }
              // If backend used string tokens for Infinity (unlikely after clean) handle them
              if (val === 'Infinity') {
                sanitizedAny = true
                return 1e10
              }
              if (val === '-Infinity') {
                sanitizedAny = true
                return -1e10
              }
              return val
            }

            Object.entries(mapping).forEach(([key, path]) => {
              const val = data[path]
              if (val !== undefined) {
                telemetryData[key] = sanitizeValue(val)
              }
            })

            // If we sanitized anything but haven't logged raw yet, log the raw response once
            if ((sanitizedAny || rawHadInvalidToken) && responseText) {
              console.warn('Telemetry response contained NaN/non-finite values; sanitized before updating state. Raw response:', responseText)
            }

            // Dispatch to telemetry slice for immediate updates
            dispatch(updateTelemetry(telemetryData))

            // Create version-aware dashboard data structure
            const getDashboardData = () => {
              const baseData = {
                device: {
                  vbus_voltage: telemetryData.vbus_voltage,
                  [`axis${selectedAxis}`]: {
                    current_state: telemetryData.axis_state
                  }
                },
                timestamp: Date.now()
              }

              if (fw_is_0_6) {
                // 0.6.x structure
                baseData.device[`axis${selectedAxis}`] = {
                  ...baseData.device[`axis${selectedAxis}`],
                  active_errors: data[`axis${selectedAxis}.active_errors`] || 0,
                  disarm_reason: data[`axis${selectedAxis}.disarm_reason`] || 0,
                  pos_estimate: telemetryData.encoder_pos,
                  vel_estimate: telemetryData.encoder_vel,
                  motor: {
                    foc: {
                      Iq_measured: telemetryData.motor_current
                    },
                    fet_thermistor: {
                      temperature: telemetryData.fet_temp
                    },
                    motor_thermistor: {
                      temperature: telemetryData.motor_temp
                    }
                  }
                }
              } else {
                // 0.5.x structure (original)
                baseData.device[`axis${selectedAxis}`] = {
                  ...baseData.device[`axis${selectedAxis}`],
                  error: data[`axis${selectedAxis}.error`] || 0,
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
                    error: data[`axis${selectedAxis}.motor.error`] || 0
                  },
                  encoder: {
                    pos_estimate: telemetryData.encoder_pos,
                    vel_estimate: telemetryData.encoder_vel,
                    error: data[`axis${selectedAxis}.encoder.error`] || 0
                  },
                  controller: {
                    error: data[`axis${selectedAxis}.controller.error`] || 0
                  },
                  sensorless_estimator: {
                    error: data[`axis${selectedAxis}.sensorless_estimator.error`] || 0
                  }
                }
              }

              return baseData
            }

            // Debounced dispatch to main device state
            debouncedDeviceDispatch(getDashboardData())

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
  }, [isConnected, selectedAxis, dispatch, updateRate, debouncedDeviceDispatch, fw_is_0_6, fw_is_0_5]) // ADD selectedAxis to dependencies
}