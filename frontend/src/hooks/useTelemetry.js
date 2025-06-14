import { useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateOdriveState, setConnectionLost } from '../store/slices/deviceSlice'

export const useTelemetry = ({
  dashboardPaths = [],
  chartPaths = [],
  onChartData = null,
  dashboardUpdateRate = 2000,
  chartUpdateRate = 100,
  isActive = true
} = {}) => {
  
  const { isConnected } = useSelector(state => state.device)
  const dispatch = useDispatch()
  const intervalRef = useRef(null)
  const lastRequestTime = useRef(0)
  
  // Determine if we need charts data
  const hasCharts = chartPaths.length > 0
  const hasDashboard = dashboardPaths.length > 0
  
  // Determine update rate based on active charts (charts get priority)
  const updateRate = hasCharts ? chartUpdateRate : dashboardUpdateRate
  
  const fetchTelemetry = useCallback(async () => {
    if (!isConnected || (!hasCharts && !hasDashboard)) return
    
    try {
      // Rate limiting for chart requests
      if (hasCharts) {
        const now = Date.now()
        const minInterval = 50 // Minimum 50ms between any requests
        const timeSinceLastRequest = now - lastRequestTime.current
        
        if (timeSinceLastRequest < minInterval) {
          await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest))
        }
        
        lastRequestTime.current = Date.now()
      }
      
      // Build request payload
      const requestPayload = {
        type: 'unified',
        dashboard_paths: dashboardPaths,
        chart_paths: chartPaths
      }
      
      const response = await fetch('/api/odrive/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle dashboard data - convert flat data to nested structure expected by Redux
        if (data.dashboard && hasDashboard) {
          const dashboardData = _convertToNestedStructure(data.dashboard)
          dispatch(updateOdriveState(dashboardData))
        }
        
        // Handle charts data
        if (data.charts && onChartData) {
          onChartData({
            data: data.charts,
            timestamp: data.timestamp
          })
        }
        
      } else if (response.status === 404) {
        dispatch(setConnectionLost(true))
      }
      
    } catch (error) {
      console.error('Telemetry error:', error)
      dispatch(setConnectionLost(true))
    }
  }, [isConnected, hasCharts, hasDashboard, dashboardPaths, chartPaths, onChartData, dispatch])
  
  // Convert flat telemetry data to nested structure expected by Redux store
  const _convertToNestedStructure = useCallback((flatData) => {
    const result = { device: {}, timestamp: Date.now() }
    
    // Initialize nested structure
    result.device.axis0 = {
      motor: { current_control: {}, motor_thermistor: {}, fet_thermistor: {} },
      encoder: {},
      controller: {}
    }
    
    // Map flat data to nested structure
    Object.entries(flatData).forEach(([path, value]) => {
      if (path === 'vbus_voltage') result.device.vbus_voltage = value
      else if (path === 'ibus') result.device.ibus = value
      else if (path === 'hw_version_major') result.device.hw_version_major = value
      else if (path === 'hw_version_minor') result.device.hw_version_minor = value
      else if (path === 'fw_version_major') result.device.fw_version_major = value
      else if (path === 'fw_version_minor') result.device.fw_version_minor = value
      else if (path === 'serial_number') result.device.serial_number = value
      else if (path === 'axis0.current_state') result.device.axis0.current_state = value
      else if (path === 'axis0.error') result.device.axis0.error = value
      else if (path === 'axis0.motor.error') result.device.axis0.motor.error = value
      else if (path === 'axis0.motor.is_calibrated') result.device.axis0.motor.is_calibrated = value
      else if (path === 'axis0.motor.current_control.Iq_measured') result.device.axis0.motor.current_control.Iq_measured = value
      else if (path === 'axis0.motor.motor_thermistor.temperature') result.device.axis0.motor.motor_thermistor.temperature = value
      else if (path === 'axis0.motor.fet_thermistor.temperature') result.device.axis0.motor.fet_thermistor.temperature = value
      else if (path === 'axis0.encoder.error') result.device.axis0.encoder.error = value
      else if (path === 'axis0.encoder.pos_estimate') result.device.axis0.encoder.pos_estimate = value
      else if (path === 'axis0.encoder.vel_estimate') result.device.axis0.encoder.vel_estimate = value
      else if (path === 'axis0.encoder.is_ready') result.device.axis0.encoder.is_ready = value
      else if (path === 'axis0.controller.error') result.device.axis0.controller.error = value
      else if (path === 'axis0.controller.pos_setpoint') result.device.axis0.controller.pos_setpoint = value
      else if (path === 'axis0.controller.vel_setpoint') result.device.axis0.controller.vel_setpoint = value
      else if (path === 'axis0.controller.torque_setpoint') result.device.axis0.controller.torque_setpoint = value
    })
    
    return result
  }, [])
  
  useEffect(() => {
    if (!isConnected || !isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    
    // Fetch immediately when connected
    fetchTelemetry()
    
    // Set up interval for regular updates
    intervalRef.current = setInterval(fetchTelemetry, updateRate)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fetchTelemetry, updateRate, isConnected, isActive])
  
  return { fetchTelemetry }
}

// Legacy hooks for backward compatibility
export const useDashboardTelemetry = (updateRate = 2000, isActive = true) => {
  // Define the dashboard paths that we want to fetch
  const dashboardPaths = [
    'vbus_voltage',
    'ibus', 
    'hw_version_major',
    'hw_version_minor',
    'fw_version_major',
    'fw_version_minor',
    'serial_number',
    'axis0.current_state',
    'axis0.error',
    'axis0.motor.error',
    'axis0.motor.is_calibrated',
    'axis0.motor.current_control.Iq_measured',
    'axis0.motor.motor_thermistor.temperature',
    'axis0.motor.fet_thermistor.temperature',
    'axis0.encoder.error',
    'axis0.encoder.pos_estimate',
    'axis0.encoder.vel_estimate',
    'axis0.encoder.is_ready',
    'axis0.controller.error',
    'axis0.controller.pos_setpoint',
    'axis0.controller.vel_setpoint',
    'axis0.controller.torque_setpoint'
  ]
  
  return useTelemetry({
    dashboardPaths,
    dashboardUpdateRate: updateRate,
    isActive
  })
}

export const useChartsTelemetry = (properties, onData, updateRate = 100) => {
  return useTelemetry({
    chartPaths: properties,
    onChartData: onData,
    chartUpdateRate: updateRate,
    isActive: true
  })
}