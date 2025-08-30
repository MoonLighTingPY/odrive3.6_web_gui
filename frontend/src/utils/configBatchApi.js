/**
 * Configuration Batch API - Now powered by Unified Registry
 * 
 * This file now uses the unified registry as the single source of truth
 * for all batch loading paths and categorization logic.
 */

import { getRegistry, getBatchPaths } from './odriveUnifiedRegistry'
import { convertTorqueConstantToKv } from './valueHelpers'

// Helper function to get firmware version from Redux store
const getFirmwareVersion = () => {
  try {
    // Try to get from Redux store if available
    const state = window.__REDUX_STORE__?.getState?.();
    return state?.device?.fw_is_0_6 || false;
  } catch (e) {
    // Fallback to 0.5.x if Redux not available
    console.warn('Could not access firmware version from Redux, defaulting to 0.5.x');
    return false;
  }
}

export const loadConfigurationBatch = async (configPaths) => {
  try {
    const response = await fetch('/api/odrive/config/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: configPaths })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Batch API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response received:', responseText);
      throw new Error(`Expected JSON response but got: ${contentType || 'unknown'}. Response: ${responseText.substring(0, 200)}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object' || !data.results) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure: missing results field');
    }

    // Get firmware version
    const fw_is_0_6 = getFirmwareVersion();
    
    // Get the appropriate registry based on firmware version
    const registry = getRegistry(fw_is_0_6);

    // Clean the data to handle null/undefined values with reasonable defaults
    const cleanedResults = {};
    Object.entries(data.results).forEach(([path, value]) => {
      if (value === null || value === undefined) {
        // Use parameter metadata to set appropriate defaults
        const param = registry.findParameter(path)
        if (param && param.property) {
          if (param.property.type === 'boolean') {
            cleanedResults[path] = false
          } else if (param.property.type === 'number') {
            cleanedResults[path] = param.property.min || 0
          } else {
            cleanedResults[path] = 0
          }
        } else {
          // Fallback to old logic for unknown parameters
          if (path.includes('enable_') || path.includes('pre_calibrated') || path.includes('use_')) {
            cleanedResults[path] = false;
          } else if (path.includes('current') || path.includes('voltage') || path.includes('resistance') ||
            path.includes('gain') || path.includes('limit') || path.includes('constant')) {
            cleanedResults[path] = 0.0;
          } else if (path.includes('mode') || path.includes('type') || path.includes('pairs') ||
            path.includes('cpr') || path.includes('node_id')) {
            cleanedResults[path] = 0;
          } else if (path.includes('bandwidth') || path.includes('timeout') || path.includes('rate')) {
            cleanedResults[path] = 1000;
          } else {
            cleanedResults[path] = 0;
          }
        }
      } else {
        cleanedResults[path] = value;
      }
    });

    return cleanedResults;

  } catch (error) {
    console.error('Batch configuration load failed:', error);

    if (error.message.includes('JSON')) {
      throw new Error('Backend returned invalid JSON response. Check if ODrive is connected and backend is running properly.');
    }
    throw error;
  }
};

/**
 * Load ALL ODrive configuration parameters in a single batch request
 * Now uses unified registry for automatic path generation and firmware awareness
 * @returns {Promise<Object>} All configuration parameters organized by category
 */
export const loadAllConfigurationBatch = async () => {
  // Get firmware version
  const fw_is_0_6 = getFirmwareVersion();

  // Get all batch paths from unified registry (firmware-aware)
  const allPaths = getBatchPaths(fw_is_0_6)
  const registry = getRegistry(fw_is_0_6)

  console.log(`Loading ${allPaths.length} configuration parameters from ${fw_is_0_6 ? '0.6.x' : '0.5.x'} unified registry...`)

  // Load all parameters in one batch request
  const allResults = await loadConfigurationBatch(allPaths);

  // Organize results by category AND axis
  const categorizedResults = {
    power: {},
    motor: { axis0: {}, axis1: {} },
    encoder: { axis0: {}, axis1: {} },
    control: { axis0: {}, axis1: {} },
    interface: {}
  };

  // Use unified registry to categorize results
  Object.entries(allResults).forEach(([path, value]) => {
    // Skip error responses
    if (value && typeof value === 'object' && value.error) {
      console.warn(`Error reading ${path}:`, value.error);
      return;
    }

    if (value !== undefined && value !== null) {
      // Remove 'device.' prefix to get the property path
      const propertyPath = path.replace(/^device\./, '')

      // Find the parameter in the registry
      const param = registry.findParameter(propertyPath)

      if (param && param.category) {
        let processedValue = value

        // Handle special value conversions
        if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
          processedValue = convertTorqueConstantToKv(value)
        }

        // Determine axis number from path
        const axisMatch = propertyPath.match(/axis(\d+)/)
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
    }
  });

  console.log('Categorized configuration:', categorizedResults)
  return categorizedResults;
};

/**
 * Get batch paths for a specific category
 * @param {string} category - Configuration category
 * @param {boolean} fw_is_0_6 - Whether to use 0.6.x firmware paths
 * @returns {Array<string>} Array of batch paths for the category
 */
export const getCategoryBatchPaths = (category, fw_is_0_6 = null) => {
  if (fw_is_0_6 === null) {
    fw_is_0_6 = getFirmwareVersion();
  }
  const registry = getRegistry(fw_is_0_6)
  const categoryParams = registry.getCategoryParameters(category)
  return categoryParams.map(param => `device.${param.odriveCommand}`)
}

/**
 * Load configuration for a specific category only
 * @param {string} category - Configuration category to load
 * @param {boolean} fw_is_0_6 - Whether to use 0.6.x firmware paths
 * @returns {Promise<Object>} Configuration for the specified category
 */
export const loadCategoryConfigurationBatch = async (category, fw_is_0_6 = null) => {
  if (fw_is_0_6 === null) {
    fw_is_0_6 = getFirmwareVersion();
  }
  const categoryPaths = getCategoryBatchPaths(category, fw_is_0_6)
  const results = await loadConfigurationBatch(categoryPaths)

  const registry = getRegistry(fw_is_0_6)
  const categoryParams = registry.getCategoryParameters(category)
  const categoryConfig = {}

  categoryParams.forEach(param => {
    const path = `device.${param.odriveCommand}`
    if (results[path] !== undefined) {
      let value = results[path]

      // Handle special conversions
      if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
        value = convertTorqueConstantToKv(value)
      }

      categoryConfig[param.configKey] = value
    }
  })

  return categoryConfig
}