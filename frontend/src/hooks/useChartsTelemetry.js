import { useEffect, useRef } from 'react'

export const useChartsTelemetry = (properties, onData, updateRate = 1) => {
  const intervalRef = useRef(null)

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
        const response = await fetch('/api/charts/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: properties })
        })

        if (response.ok) {
          const data = await response.json()
          onData(data)
        }
      } catch (error) {
        console.error('Charts telemetry error:', error)
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
