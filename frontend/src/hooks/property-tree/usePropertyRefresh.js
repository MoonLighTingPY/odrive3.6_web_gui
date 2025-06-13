import { useState, useCallback,} from 'react'

export const usePropertyRefresh = (odrivePropertyTree, collectAllProperties, isConnected) => {
  const [refreshingProperties, setRefreshingProperties] = useState(new Set())
  const [propertyValues, setPropertyValues] = useState({})

  const refreshAllProperties = useCallback(async () => {
    const allPaths = []
    
    // Collect all property paths from the tree recursively
    Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
      const sectionProperties = collectAllProperties(section, sectionName)
      allPaths.push(...sectionProperties.map(p => p.path))
    })

    // Set all as refreshing
    setRefreshingProperties(new Set(allPaths))

    // Refresh each property
    const refreshPromises = allPaths.map(async (displayPath) => {
      try {
        // Build device path
        let devicePath = displayPath
        if (displayPath.startsWith('system.')) {
          const systemProp = displayPath.replace('system.', '')
          if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
               'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
            devicePath = `config.${systemProp}`
          } else {
            devicePath = systemProp
          }
        }

        const response = await fetch('/api/odrive/property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: devicePath })
        })

        if (response.ok) {
          const responseText = await response.text()
          
          try {
            // Try to parse as normal JSON first
            const data = JSON.parse(responseText)
            setPropertyValues(prev => ({
              ...prev,
              [displayPath]: data.value
            }))
          // eslint-disable-next-line no-unused-vars
          } catch (jsonError) {
            // If JSON parsing fails, try to handle Infinity values
            console.warn(`Invalid JSON response for property ${displayPath}:`, responseText)
            
            try {
              // Replace Infinity with a string representation for display
              const cleanedResponse = responseText.replace(/:Infinity/g, ':"Infinity"').replace(/:-Infinity/g, ':"-Infinity"')
              const data = JSON.parse(cleanedResponse)
              
              // Convert string back to actual Infinity for proper handling
              let value = data.value
              if (value === "Infinity") {
                value = Infinity
              } else if (value === "-Infinity") {
                value = -Infinity
              }
              
              setPropertyValues(prev => ({
                ...prev,
                [displayPath]: value
              }))
            } catch (cleanupError) {
              console.error(`Cleaned response also failed to parse:`, cleanupError)
              // Set a fallback value
              setPropertyValues(prev => ({
                ...prev,
                [displayPath]: 'Parse Error'
              }))
            }
          }
        }
      } catch (error) {
        console.error(`Failed to refresh property ${displayPath}:`, error)
      }
    })

    // Wait for all refreshes to complete
    await Promise.all(refreshPromises)
    
    // Clear refreshing state
    setRefreshingProperties(new Set())
  }, [collectAllProperties, odrivePropertyTree])

  // Refresh a single property
  const refreshProperty = async (displayPath) => {
    if (!isConnected) return
    
    setRefreshingProperties(prev => new Set([...prev, displayPath]))
    
    try {
      // Build device path
      let devicePath = displayPath
      if (displayPath.startsWith('system.')) {
        const systemProp = displayPath.replace('system.', '')
        if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
             'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
          devicePath = `config.${systemProp}`
        } else {
          devicePath = systemProp
        }
      }
      
      const response = await fetch('/api/odrive/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: devicePath })
      })
      
      if (response.ok) {
        const responseText = await response.text()
        
        try {
          // Try to parse as normal JSON first
          const data = JSON.parse(responseText)
          setPropertyValues(prev => ({
            ...prev,
            [displayPath]: data.value
          }))
        // eslint-disable-next-line no-unused-vars
        } catch (jsonError) {
          // If JSON parsing fails, try to handle Infinity values
          
          try {
            // Replace Infinity with a string representation for parsing
            const cleanedResponse = responseText.replace(/:Infinity/g, ':"Infinity"').replace(/:-Infinity/g, ':"-Infinity"')
            const data = JSON.parse(cleanedResponse)
            
            // Convert string back to actual Infinity for proper handling
            let value = data.value
            if (value === "Infinity") {
              value = Infinity
            } else if (value === "-Infinity") {
              value = -Infinity
            }
            
            setPropertyValues(prev => ({
              ...prev,
              [displayPath]: value
            }))
          } catch (cleanupError) {
            console.error(`Cleaned response also failed to parse:`, cleanupError)
            // Set a fallback value
            setPropertyValues(prev => ({
              ...prev,
              [displayPath]: 'Parse Error'
            }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh property:', error)
    } finally {
      setRefreshingProperties(prev => {
        const newSet = new Set(prev)
        newSet.delete(displayPath)
        return newSet
      })
    }
  }

  return {
    refreshingProperties,
    propertyValues,
    refreshAllProperties,
    refreshProperty,
    setPropertyValues
  }
}