/**
 * Chart statistics calculation utilities
 */

/**
 * Calculate basic statistics for a data array
 * @param {Array} data - Array of numeric values
 * @returns {Object} Statistics object with min, max, average, count
 */
export const calculateBasicStats = (data) => {
  if (!data || data.length === 0) {
    return {
      min: null,
      max: null,
      average: null,
      count: 0
    }
  }

  // Filter out non-numeric values
  const numericData = data.filter(value => 
    typeof value === 'number' && !isNaN(value) && isFinite(value)
  )

  if (numericData.length === 0) {
    return {
      min: null,
      max: null,
      average: null,
      count: 0
    }
  }

  const min = Math.min(...numericData)
  const max = Math.max(...numericData)
  const sum = numericData.reduce((acc, val) => acc + val, 0)
  const average = sum / numericData.length

  return {
    min,
    max,
    average,
    count: numericData.length
  }
}

/**
 * Calculate statistics for chart data within a time window
 * @param {Array} chartData - Array of chart data objects
 * @param {string} property - Property name to calculate stats for
 * @param {number} timeWindowMs - Time window in milliseconds
 * @returns {Object} Statistics object
 */
export const calculatePropertyStats = (chartData, property, timeWindowMs) => {
  if (!chartData || chartData.length === 0) {
    return calculateBasicStats([])
  }

  // Get current time and filter data within time window
  const currentTime = Date.now()
  const cutoffTime = currentTime - timeWindowMs
  
  const recentData = chartData.filter(item => item.time > cutoffTime)
  const propertyValues = recentData.map(item => item[property])

  return calculateBasicStats(propertyValues)
}

/**
 * Format statistic value for display
 * @param {number|null} value - The statistic value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export const formatStatValue = (value, decimals = 3) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  // Handle very large or very small numbers
  if (Math.abs(value) >= 1000000) {
    return value.toExponential(2)
  } else if (Math.abs(value) < 0.001 && value !== 0) {
    return value.toExponential(2)
  } else {
    return value.toFixed(decimals)
  }
}

/**
 * Get appropriate decimal places based on value range
 * @param {number} value - The value to analyze
 * @returns {number} Recommended decimal places
 */
export const getRecommendedDecimals = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 3
  }

  const absValue = Math.abs(value)
  
  if (absValue >= 1000) return 1
  if (absValue >= 100) return 2
  if (absValue >= 1) return 3
  if (absValue >= 0.1) return 4
  if (absValue >= 0.01) return 5
  return 6
}

/**
 * Calculate statistics for all properties in chart data
 * @param {Array} chartData - Array of chart data objects
 * @param {Array} properties - Array of property names
 * @param {number} timeWindowMs - Time window in milliseconds
 * @returns {Object} Object with statistics for each property
 */
export const calculateAllPropertiesStats = (chartData, properties, timeWindowMs) => {
  const stats = {}
  
  properties.forEach(property => {
    stats[property] = calculatePropertyStats(chartData, property, timeWindowMs)
  })
  
  return stats
}