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

    // Convert display paths to device paths for batch request
    const devicePaths = allPaths.map(displayPath => {
      if (displayPath.startsWith('system.')) {
        const systemProp = displayPath.replace('system.', '')
        if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
             'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
          return `config.${systemProp}`
        } else {
          return systemProp
        }
      }
      return displayPath
    })

    try {
      // Make single batch request for all properties
      console.log(`Refreshing ${allPaths.length} properties in batch request...`)
      
      const response = await fetch('/api/odrive/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: devicePaths })
      })

      if (response.ok) {
        const responseText = await response.text()
        
        try {
          // Handle potential Infinity values in batch response
          const cleanedResponse = responseText.replace(/:Infinity/g, ':"Infinity"').replace(/:-Infinity/g, ':"-Infinity"')
          const data = JSON.parse(cleanedResponse)
          
          if (data.results) {
            const newPropertyValues = {}
            
            // Map device paths back to display paths and handle values
            allPaths.forEach((displayPath, index) => {
              const devicePath = devicePaths[index]
              let value = data.results[devicePath]
              
              // Convert string Infinity back to actual Infinity
              if (value === "Infinity") {
                value = Infinity
              } else if (value === "-Infinity") {
                value = -Infinity
              }
              
              newPropertyValues[displayPath] = value
            })
            
            setPropertyValues(newPropertyValues)
            console.log(`Successfully loaded ${Object.keys(newPropertyValues).length} properties in batch!`)
          }
        } catch (cleanupError) {
          console.error('Failed to parse batch response:', cleanupError)
          // Fallback: set all to parse error
          const fallbackValues = {}
          allPaths.forEach(path => {
            fallbackValues[path] = 'Parse Error'
          })
          setPropertyValues(fallbackValues)
        }
      } else {
        console.error('Batch property request failed:', response.status)
        // Fallback: set all to error
        const errorValues = {}
        allPaths.forEach(path => {
          errorValues[path] = 'Request Failed'
        })
        setPropertyValues(errorValues)
      }
    } catch (error) {
      console.error('Batch property refresh failed:', error)
      // Fallback: set all to error
      const errorValues = {}
      allPaths.forEach(path => {
        errorValues[path] = 'Network Error'
      })
      setPropertyValues(errorValues)
    }

    // Clear refreshing state
    setRefreshingProperties(new Set())

    // Log completion status
    setTimeout(() => {
      setPropertyValues(currentValues => {
        const nullProperties = allPaths.filter(path => {
          const value = currentValues[path]
          return value === null || value === undefined
        })
        
        if (nullProperties.length > 0) {
          console.log(`Properties with null/undefined values after batch refresh: ${nullProperties.length}/${allPaths.length}`, nullProperties.slice(0, 10))
        } else {
          console.log('All properties loaded successfully in batch! 🚀')
        }
        
        return currentValues
      })
    }, 100)

  }, [collectAllProperties, odrivePropertyTree])

  // Refresh a single property (keep existing single-property logic for individual refreshes)
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