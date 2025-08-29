/**
 * Unified API Response Handler
 * Centralized response processing to eliminate duplicate parsing logic
 */

/**
 * Process API response with unified error handling and JSON parsing
 * @param {Response} response - Fetch response object
 * @param {Object} options - Processing options
 * @param {boolean} options.expectJson - Whether to expect JSON response
 * @param {boolean} options.handleInfinity - Whether to handle Infinity values in JSON
 * @param {*} options.defaultValue - Default value for failed parsing
 * @returns {Promise<*>} Processed response data
 */
export const processApiResponse = async (response, options = {}) => {
  const { expectJson = true, handleInfinity = true, defaultValue = null } = options
  
  try {
    // Get response text first to handle edge cases
    const responseText = await response.text()
    
    // Handle empty responses
    if (!responseText.trim()) {
      return expectJson ? {} : responseText
    }
    
    // Handle non-JSON responses
    if (!expectJson) {
      return responseText
    }
    
    // Check content type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      console.warn('API response is not JSON:', contentType)
      return responseText
    }
    
    // Parse JSON with Infinity handling
    return parseJson(responseText, { handleInfinity, defaultValue })
    
  } catch (error) {
    console.error('API response processing failed:', error)
    return defaultValue
  }
}

/**
 * Parse JSON string with intelligent Infinity handling
 * @param {string} jsonString - JSON string to parse
 * @param {Object} options - Parsing options
 * @param {boolean} options.handleInfinity - Handle Infinity values
 * @param {*} options.defaultValue - Default for parse failures
 * @returns {*} Parsed JSON object
 */
export const parseJson = (jsonString, options = {}) => {
  const { handleInfinity = true, defaultValue = null } = options
  
  try {
    // Try standard JSON parsing first
    return JSON.parse(jsonString)
  } catch (firstError) {
    // If handling Infinity values, try replacing them
    if (handleInfinity) {
      try {
        const cleanedJson = jsonString
          .replace(/:Infinity/g, ':9e999')
          .replace(/:-Infinity/g, ':-9e999')
        
        const parsed = JSON.parse(cleanedJson)
        return convertLargeNumbers(parsed)
      } catch (secondError) {
        console.error('JSON parsing failed even with Infinity handling:', secondError)
      }
    }
    
    console.error('JSON parsing failed:', firstError)
    return defaultValue
  }
}

/**
 * Convert large numbers back to Infinity for proper handling
 * @param {*} obj - Object to process
 * @returns {*} Object with large numbers converted to Infinity
 */
const convertLargeNumbers = (obj) => {
  if (typeof obj === 'number') {
    if (obj > 1e100) return Infinity
    if (obj < -1e100) return -Infinity
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertLargeNumbers)
  }
  
  if (obj && typeof obj === 'object') {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertLargeNumbers(value)
    }
    return result
  }
  
  return obj
}

/**
 * Execute API request with unified error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {Object} responseOptions - Response processing options
 * @returns {Promise<*>} API response data
 */
export const makeApiRequest = async (endpoint, options = {}, responseOptions = {}) => {
  const { method = 'GET', headers = {}, body = null, ...fetchOptions } = options
  
  const requestConfig = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...fetchOptions
  }
  
  // Add body if provided
  if (body !== null) {
    requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body)
  }
  
  try {
    const response = await fetch(endpoint, requestConfig)
    
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      // Try to extract error message from response
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }
    
    return processApiResponse(response, responseOptions)
    
  } catch (error) {
    console.error(`API request failed: ${method} ${endpoint}`, error)
    throw error
  }
}

/**
 * Batch API request processor
 * @param {Array} requests - Array of request configurations
 * @returns {Promise<Array>} Array of response data
 */
export const makeBatchApiRequests = async (requests) => {
  const promises = requests.map(({ endpoint, options = {}, responseOptions = {} }) =>
    makeApiRequest(endpoint, options, responseOptions)
      .catch(error => ({ error: error.message }))
  )
  
  return Promise.all(promises)
}