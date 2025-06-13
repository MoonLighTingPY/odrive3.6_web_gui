import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateOdriveState, setConnectionLost } from '../store/slices/deviceSlice'

export const useDashboardTelemetry = (updateRate = 2000, isActive = true) => {
  const { isConnected } = useSelector(state => state.device)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isConnected) return // Only check if connected, not isActive

    // Immediate fetch function
    const fetchTelemetry = async () => {
      try {
        const response = await fetch('/api/odrive/dashboard')
        
        if (response.ok) {
          const data = await response.json()
          dispatch(updateOdriveState(data))
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
  }, [isConnected, dispatch, updateRate, isActive]) // Keep isActive in dependencies so it restarts with new rate
}
