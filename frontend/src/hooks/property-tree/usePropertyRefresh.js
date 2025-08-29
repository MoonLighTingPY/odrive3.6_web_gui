import { useState, useCallback } from 'react'
import { resolveToPropertyPath } from '../../utils/odrivePathResolver'

export const usePropertyRefresh = (odrivePropertyTree, collectAllProperties, isConnected) => {
  const [refreshingProperties, setRefreshingProperties] = useState(new Set())
  const [propertyValues, setPropertyValues] = useState({})

  const refreshAllProperties = useCallback(async () => {
    if (!isConnected) return

    const allPaths = []
    
    // Collect all property paths from the tree recursively
    Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
      const sectionProperties = collectAllProperties(section, sectionName)
      allPaths.push(...sectionProperties.map(p => p.path))
    })

    if (allPaths.length === 0) {
      setRefreshingProperties(new Set())
      return
    }

    // Set all as refreshing
    setRefreshingProperties(new Set(allPaths))

    // Convert display paths to device paths for batch request using dynamic path resolver
    const devicePaths = []
    const resolvedPaths = []
    const failedPaths = []

    allPaths.forEach(displayPath => {
      try {
        // Use path resolver to convert logical paths to property paths
        const propertyPath = resolveToPropertyPath(displayPath)
        const cleanPath = propertyPath.replace('device.', '') // Remove device. prefix for backend API
        resolvedPaths.push(`${displayPath} → ${cleanPath}`)
        devicePaths.push(cleanPath)
      } catch (error) {
        console.warn(`❌ Failed to resolve path ${displayPath}, using fallback:`, error)
        failedPaths.push(displayPath)
        // Fallback to legacy hardcoded logic for compatibility
        if (displayPath.startsWith('system.')) {
          const systemProp = displayPath.replace('system.', '')
          if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
               'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
            devicePaths.push(`config.${systemProp}`)
          } else {
            devicePaths.push(systemProp)
          }
        } else {
          devicePaths.push(displayPath)
        }
      }
    })

    // Consolidated logging for path resolution
    if (resolvedPaths.length > 0) {
      console.debug(`✓ Resolved ${resolvedPaths.length} paths:`, resolvedPaths)
    }

    if (failedPaths.length > 0) {
      console.warn(`❌ Failed to resolve ${failedPaths.length} paths:`, failedPaths)
    }

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
            const successfulPaths = []
            const nullPaths = []
            
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
              
              // Collect paths for consolidated logging
              if (value === null || value === undefined) {
                nullPaths.push(`${displayPath} → ${devicePath}`)
              } else {
                successfulPaths.push(displayPath)
              }
              
              newPropertyValues[displayPath] = value
            })
            
            // Consolidated logging
            if (successfulPaths.length > 0) {
              console.log(`✅ Successfully loaded ${successfulPaths.length} properties:`, successfulPaths)
            }
            
            if (nullPaths.length > 0) {
              // Log the full list instead of truncating
              console.debug(`🔍 Null/undefined values found for ${nullPaths.length} properties:`, nullPaths)
            }
            
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
          // Print full list so developer can see all paths (no "... and N more")
          console.log(`Properties with null/undefined values after batch refresh: ${nullProperties.length}/${allPaths.length}`, nullProperties)
        } else {
          console.log('All properties loaded successfully in batch! 🚀')
        }
        
        return currentValues
      })
    }, 100)

  }, [collectAllProperties, odrivePropertyTree, isConnected])

  // Refresh a single property using dynamic path resolution
  const refreshProperty = async (displayPath) => {
    if (!isConnected) return
    
    setRefreshingProperties(prev => new Set([...prev, displayPath]))
    
    try {
      // Use dynamic path resolver instead of hardcoded logic
      let devicePath = displayPath
      try {
        const propertyPath = resolveToPropertyPath(displayPath)
        devicePath = propertyPath.replace('device.', '') // Remove device. prefix for backend API
      } catch (error) {
        console.warn(`Failed to resolve single property path ${displayPath}, using fallback:`, error)
        // Fallback to legacy logic for compatibility
        if (displayPath.startsWith('system.')) {
          const systemProp = displayPath.replace('system.', '')
          if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
               'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
            devicePath = `config.${systemProp}`
          } else {
            devicePath = systemProp
          }
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