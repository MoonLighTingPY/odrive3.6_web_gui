/**
 * Configuration Batch API - Now powered by Unified Registry
 * 
 * This file now uses the unified registry as the single source of truth
 * for all batch loading paths and categorization logic.
 */

import { odriveRegistry, getBatchPaths } from './odriveUnifiedRegistry'
import { convertTorqueConstantToKv } from './valueHelpers'

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
    
    // Clean the data to handle null/undefined values with reasonable defaults
    const cleanedResults = {};
    Object.entries(data.results).forEach(([path, value]) => {
      if (value === null || value === undefined) {
        // Use parameter metadata to set appropriate defaults
        const param = odriveRegistry.findParameter(path)
        if (param) {
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
 * Load ALL ODrive v0.5.6 configuration parameters in a single batch request
 * Now uses unified registry for automatic path generation
 * @returns {Promise<Object>} All configuration parameters organized by category
 */
export const loadAllConfigurationBatch = async () => {
  // Get all batch paths from unified registry
  const allPaths = getBatchPaths()
  
  console.log(`Loading ${allPaths.length} configuration parameters from unified registry...`)
  
  // Load all parameters in one batch request
  const allResults = await loadConfigurationBatch(allPaths);
  
  // Organize results by category using unified registry logic
  const categorizedResults = {
    power: {},
    motor: {},
    encoder: {},
    control: {},
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
      const param = odriveRegistry.findParameter(propertyPath)
      
      if (param) {
        let processedValue = value
        
        // Handle special value conversions
        if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
          processedValue = convertTorqueConstantToKv(value)
        }
        
        // Store in the appropriate category
        categorizedResults[param.category][param.configKey] = processedValue
        
        // Also store original torque constant if we converted it
        if (param.configKey === 'motor_kv') {
          categorizedResults[param.category]['motor_kv'] = convertTorqueConstantToKv(value)
        }
      } else {
        // Fallback: try to categorize unknown parameters using old logic
        console.warn(`Parameter not found in unified registry: ${propertyPath}, using fallback categorization`)
        
        const configKey = propertyPath.split('.').pop()
        
        if (propertyPath.includes('.config.dc_') || propertyPath.includes('.config.brake_') || propertyPath.includes('.config.enable_brake_')) {
          categorizedResults.power[configKey === 'enable_brake_resistor' ? 'brake_resistor_enabled' : configKey] = value
        } else if (propertyPath.includes('.motor.config.') || propertyPath.includes('.calibration_lockin.')) {
          if (configKey === 'current' && propertyPath.includes('calibration_lockin')) {
            categorizedResults.motor['lock_in_spin_current'] = value
          } else {
            categorizedResults.motor[configKey] = value
          }
        } else if (propertyPath.includes('.encoder.config.')) {
          categorizedResults.encoder[configKey === 'mode' ? 'encoder_type' : configKey] = value
        } else if (propertyPath.includes('.controller.config.')) {
          categorizedResults.control[configKey] = value
        } else {
          categorizedResults.interface[configKey] = value
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
 * @returns {Array<string>} Array of batch paths for the category
 */
export const getCategoryBatchPaths = (category) => {
  const categoryParams = odriveRegistry.getCategoryParameters(category)
  return categoryParams.map(param => `device.${param.odriveCommand}`)
}

/**
 * Load configuration for a specific category only
 * @param {string} category - Configuration category to load
 * @returns {Promise<Object>} Configuration for the specified category
 */
export const loadCategoryConfigurationBatch = async (category) => {
  const categoryPaths = getCategoryBatchPaths(category)
  const results = await loadConfigurationBatch(categoryPaths)
  
  const categoryConfig = {}
  const categoryParams = odriveRegistry.getCategoryParameters(category)
  
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