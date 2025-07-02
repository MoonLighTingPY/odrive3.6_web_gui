/**
 * Chart data filtering utilities
 */

/**
 * Simple moving average filter
 * @param {Array} data - Array of data points
 * @param {number} windowSize - Number of points to average
 * @returns {Array} Filtered data
 */
export const movingAverageFilter = (data, windowSize = 5) => {
  if (!data || data.length === 0) return data
  
  const filtered = []
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2))
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2))
    
    let sum = 0
    let count = 0
    
    for (let j = start; j < end; j++) {
      const value = data[j]
      if (typeof value === 'number' && !isNaN(value)) {
        sum += value
        count++
      }
    }
    
    filtered[i] = count > 0 ? sum / count : data[i]
  }
  
  return filtered
}

/**
 * Low-pass filter (simple exponential smoothing)
 * @param {Array} data - Array of data points
 * @param {number} alpha - Smoothing factor (0-1, lower = more smoothing)
 * @returns {Array} Filtered data
 */
export const lowPassFilter = (data, alpha = 0.3) => {
  if (!data || data.length === 0) return data
  
  const filtered = [data[0]] // Start with first value
  
  for (let i = 1; i < data.length; i++) {
    const currentValue = data[i]
    const previousFiltered = filtered[i - 1]
    
    if (typeof currentValue === 'number' && !isNaN(currentValue) &&
        typeof previousFiltered === 'number' && !isNaN(previousFiltered)) {
      filtered[i] = alpha * currentValue + (1 - alpha) * previousFiltered
    } else {
      filtered[i] = currentValue
    }
  }
  
  return filtered
}

/**
 * Apply filter to chart data for a specific property
 * @param {Array} chartData - Array of chart data objects
 * @param {string} property - Property name to filter
 * @param {string} filterType - Type of filter ('moving_average' | 'low_pass')
 * @param {Object} filterOptions - Filter options (windowSize, alpha, etc.)
 * @returns {Array} Chart data with filtered property
 */
export const applyChartFilter = (chartData, property, filterType = 'moving_average', filterOptions = {}) => {
  if (!chartData || chartData.length === 0) return chartData
  
  // Extract values for the property
  const values = chartData.map(item => item[property])
  
  let filteredValues
  
  switch (filterType) {
    case 'moving_average':
      filteredValues = movingAverageFilter(values, filterOptions.windowSize || 5)
      break
    case 'low_pass':
      filteredValues = lowPassFilter(values, filterOptions.alpha || 0.3)
      break
    default:
      filteredValues = values
  }
  
  // Return new chart data with filtered values
  return chartData.map((item, index) => ({
    ...item,
    [property]: filteredValues[index]
  }))
}

/**
 * Available filter types with their display names and default options
 */
export const FILTER_TYPES = {
  moving_average: {
    name: 'Moving Average',
    defaultOptions: { windowSize: 5 }
  },
  low_pass: {
    name: 'Low Pass',
    defaultOptions: { alpha: 0.3 }
  }
}