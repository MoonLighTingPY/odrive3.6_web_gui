import { useState, useCallback } from 'react'
import { resolveToPropertyPath, isPropertySupported } from '../../utils/odrivePathResolver'
import { makeApiRequest } from '../../utils/apiResponseHandler'

export const usePropertyRefresh = (odrivePropertyTree, collectAllProperties, isConnected) => {
  const [refreshingProperties, setRefreshingProperties] = useState(new Set())
  const [propertyValues, setPropertyValues] = useState({})

  const refreshAllProperties = useCallback(async () => {
    if (!isConnected) return

    // Collect all property paths from the tree recursively
    const allPaths = []
    Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
      const sectionProperties = collectAllProperties(section, sectionName)
      allPaths.push(...sectionProperties.map(p => p.path))
    })

    if (allPaths.length === 0) {
      setRefreshingProperties(new Set())
      return
    }

    // Filter out unsupported properties
    const supportedPaths = allPaths.filter(path => {
      try {
        return isPropertySupported ? isPropertySupported(path) : true
      } catch {
        return true // Include if check fails
      }
    })
    
    const unsupportedCount = allPaths.length - supportedPaths.length
    if (unsupportedCount > 0) {
      console.log(`Filtered out ${unsupportedCount} unsupported properties for current firmware version`)
    }

    setRefreshingProperties(new Set(supportedPaths))

    // Convert display paths to device paths for batch request
    const devicePaths = []
    const failedPaths = []

    supportedPaths.forEach(displayPath => {
      try {
        const propertyPath = resolveToPropertyPath(displayPath)
        const devicePath = propertyPath.replace('device.', '')
        devicePaths.push(devicePath)
      } catch (error) {
        console.warn(`Path resolution failed for ${displayPath}:`, error.message)
        failedPaths.push(displayPath)
      }
    })

    if (failedPaths.length > 0) {
      console.warn(`❌ Failed to resolve ${failedPaths.length} paths:`, failedPaths)
    }

    try {
      console.log(`Refreshing ${supportedPaths.length} supported properties in batch request...`)
      
      // Use unified API request handler
      const data = await makeApiRequest('/api/odrive/property', {
        method: 'POST',
        body: { paths: devicePaths }
      }, { 
        handleInfinity: true, 
        expectJson: true 
      })

      if (data && data.results) {
        const newPropertyValues = {}
        const successfulPaths = []
        const nullPaths = []
        
        // Map device paths back to display paths and handle values
        supportedPaths.forEach((displayPath, index) => {
          const devicePath = devicePaths[index]
          const value = data.results[devicePath]
          
          // Collect paths for logging
          if (value === null || value === undefined) {
            nullPaths.push(`${displayPath} → ${devicePath}`)
          } else {
            successfulPaths.push(displayPath)
          }
          
          newPropertyValues[displayPath] = value
        })
        
        // Consolidated logging
        if (successfulPaths.length > 0) {
          console.log(`✅ Successfully loaded ${successfulPaths.length} properties`)
        }
        
        if (nullPaths.length > 0) {
          console.debug(`🔍 Null/undefined values found for ${nullPaths.length} properties:`, nullPaths)
        }
        
        setPropertyValues(newPropertyValues)
        console.log(`Successfully loaded ${Object.keys(newPropertyValues).length} properties in batch!`)
      }
      
    } catch (error) {
      console.error('Batch property refresh failed:', error)
      // Set error fallback values
      const errorValues = {}
      supportedPaths.forEach(path => {
        errorValues[path] = 'Network Error'
      })
      setPropertyValues(errorValues)
    }

    setRefreshingProperties(new Set())

  }, [collectAllProperties, odrivePropertyTree, isConnected])

  // Refresh a single property using unified API handler
  const refreshProperty = async (displayPath) => {
    if (!isConnected) return
    
    setRefreshingProperties(prev => new Set([...prev, displayPath]))
    
    try {
      // Use dynamic path resolver
      let devicePath = displayPath
      try {
        const propertyPath = resolveToPropertyPath(displayPath)
        devicePath = propertyPath.replace('device.', '')
      } catch (error) {
        console.warn(`Failed to resolve single property path ${displayPath}, using fallback:`, error)
      }
      
      // Use unified API request handler
      const data = await makeApiRequest('/api/odrive/property', {
        method: 'POST',
        body: { path: devicePath }
      }, { 
        handleInfinity: true, 
        expectJson: true 
      })
      
      setPropertyValues(prev => ({
        ...prev,
        [displayPath]: data.value
      }))
      
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