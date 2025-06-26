import { useEffect, useRef } from 'react'

export const useChartsTelemetry = (properties, onData) => {
  const intervalRef = useRef(null)
  const lastRequestTime = useRef(0)
  const updateRate = 1 // milliseconmds

  useEffect(() => {
    if (!properties.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const fetchData = async () => {
      try {
        // Add small random delay to stagger requests
        const now = Date.now()
        const minInterval = 1
        const timeSinceLastRequest = now - lastRequestTime.current
        
        if (timeSinceLastRequest < minInterval) {
          await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest))
        }

        lastRequestTime.current = Date.now()

        const response = await fetch('/api/telemetry/get-telemetry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paths: properties }),
        })

        if (response.ok) {
          const data = await response.json()
          // Fix: Check if we have data and pass it correctly
          if (data && Object.keys(data).length > 0) {
            onData({
              data: data,  // Pass data directly, not nested
              timestamp: Date.now()
            })
          }
        }
      } catch (error) {
        // Just log errors, don't handle connection state
        console.warn('Charts telemetry error:', error)
      }
    }

    intervalRef.current = setInterval(fetchData, updateRate)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [properties, onData, updateRate])
}
