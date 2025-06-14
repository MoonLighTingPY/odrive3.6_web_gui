import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateOdriveState, setConnectionLost } from '../store/slices/deviceSlice'

export const useDashboardTelemetry = () => {
  const { isConnected } = useSelector(state => state.device)
  const dispatch = useDispatch()
  const updateRate = 50 // Update rate in milliseconds

  useEffect(() => {
    if (!isConnected) return // Only check if connected, not isActive

    // Test with just one path for now - vbus_voltage as it's critical for connection health
    const testPath = ['vbus_voltage']

    // Immediate fetch function using the faster charts endpoint
    const fetchTelemetry = async () => {
      try {
        const response = await fetch('/api/charts/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: testPath })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Transform the charts response to match the dashboard format
          const dashboardData = {
            device: {
              vbus_voltage: data.data['vbus_voltage'] || 0,
              // Add other properties as needed
            },
            timestamp: data.timestamp
          }
          
          dispatch(updateOdriveState(dashboardData))
        } else if (response.status === 404) {
          dispatch(setConnectionLost(true))
        }
      } catch (error) {
        console.error('Dashboard telemetry error:', error)
        dispatch(setConnectionLost(true))
      }
    }

    // Fetch immediately when connected
    fetchTelemetry()

    // Then set up interval for regular updates
    const interval = setInterval(fetchTelemetry, updateRate)

    return () => {
      clearInterval(interval)
    }
  }, [isConnected, dispatch, updateRate])
}