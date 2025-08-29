/**
 * Configuration Batch API
 * Unified batch loading system using centralized API handling
 */

import { getBatchPaths, findParameter, getCategoryParameters } from './registryManager'
import { convertTorqueConstantToKv } from './valueHelpers'
import { makeApiRequest } from './apiResponseHandler'

/**
 * Load configuration paths in batch
 * @param {Array<string>} configPaths - Array of configuration paths to load
 * @returns {Promise<Object>} Batch results
 */
export const loadConfigurationBatch = async (configPaths) => {
  try {
    const data = await makeApiRequest('/api/odrive/config/batch', {
      method: 'POST',
      body: { paths: configPaths }
    }, {
      expectJson: true,
      handleInfinity: true
    })

    // Validate response structure
    if (!data || typeof data !== 'object' || !data.results) {
      console.error('Invalid response structure:', data)
      throw new Error('Invalid response structure: missing results field')
    }

    // Clean the data to handle null/undefined values with reasonable defaults
    const cleanedResults = {}
    Object.entries(data.results).forEach(([path, value]) => {
      if (value === null || value === undefined) {
        // Use parameter metadata to set appropriate defaults
        const param = findParameter(path)
        cleanedResults[path] = getDefaultValue(param)
      } else {
        cleanedResults[path] = value
      }
    })

    return cleanedResults

  } catch (error) {
    console.error('Batch configuration load failed:', error)

    if (error.message.includes('JSON')) {
      throw new Error('Backend returned invalid JSON response. Check if ODrive is connected and backend is running properly.')
    }
    throw error
  }
}

/**
 * Get default value for parameter based on metadata
 * @param {Object} param - Parameter metadata
 * @returns {*} Default value
 */
const getDefaultValue = (param) => {
  if (!param) return null
  
  if (param.property && param.property.type === 'boolean') return false
  if (param.property && param.property.type === 'number') return param.property.min || 0
  if (param.property && param.property.type === 'string') return ''
  
  return null
}

/**
 * Load ALL configuration parameters in a single batch request
 * @returns {Promise<Object>} All configuration parameters organized by category
 */
export const loadAllConfigurationBatch = async () => {
  // Get all batch paths from registry
  const allPaths = getBatchPaths()

  console.log(`Loading ${allPaths.length} configuration parameters from unified registry...`)

  // Load all parameters in one batch request
  const allResults = await loadConfigurationBatch(allPaths)

  // Organize results by category AND axis
  const categorizedResults = {
    power: {},
    motor: { axis0: {}, axis1: {} },
    encoder: { axis0: {}, axis1: {} },
    control: { axis0: {}, axis1: {} },
    interface: {}
  }

  // Process each result and categorize it
  Object.entries(allResults).forEach(([path, value]) => {
    const param = findParameter(path)
    if (param) {
      let processedValue = value
      
      // Special value processing for torque constant
      if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
        processedValue = convertTorqueConstantToKv(value)
      }
      
      // Categorize by axis if applicable
      const axisMatch = param.path.match(/axis(\d)/)
      const axisNumber = axisMatch ? parseInt(axisMatch[1]) : null

      if (param.category === 'motor' || param.category === 'encoder' || param.category === 'control') {
        if (axisNumber !== null) {
          if (!categorizedResults[param.category][`axis${axisNumber}`]) {
            categorizedResults[param.category][`axis${axisNumber}`] = {}
          }
          categorizedResults[param.category][`axis${axisNumber}`][param.configKey] = processedValue
        }
      } else {
        // Power and interface are global
        categorizedResults[param.category][param.configKey] = processedValue
      }
    }
  })

  console.log('Categorized configuration:', categorizedResults)
  return categorizedResults
}

/**
 * Get batch paths for a specific category
 * @param {string} category - Configuration category
 * @returns {Array<string>} Array of batch paths for the category
 */
export const getCategoryBatchPaths = (category) => {
  const categoryParams = getCategoryParameters(category)
  return categoryParams.map(param => param.batchPath).filter(Boolean)
}

/**
 * Load configuration for specific category
 * @param {string} category - Configuration category to load
 * @returns {Promise<Object>} Category configuration data
 */
export const loadCategoryConfiguration = async (category) => {
  const paths = getCategoryBatchPaths(category)
  return await loadConfigurationBatch(paths)
}