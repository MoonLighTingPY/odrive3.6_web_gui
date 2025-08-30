/**
 * Configuration Batch API - Now powered by Unified Registry
 * 
 * This file now uses the unified registry as the single source of truth
 * for all batch loading paths and categorization logic.
 */

import { getRegistry, getBatchPaths } from './odriveUnifiedRegistry'
import { convertTorqueConstantToKv } from './valueHelpers'
import { store } from '../store'  // Changed to named import

// Simple, reliable firmware version detection
const getFirmwareVersion = () => {
  try {
    // 1. Check manual override first (for testing)
    if (typeof window !== 'undefined' && window.__FW_IS_0_6 !== undefined) {
      return !!window.__FW_IS_0_6
    }

    // 2. Check Redux store for firmware info
    const state = store?.getState()?.device
    if (state?.fw_is_0_6 === true) return true
    if (state?.fw_is_0_5 === true) return false

    // 3. Parse version string if available
    const versionStr = state?.fw_version_string || state?.connectedDevice?.fw_version
    if (typeof versionStr === 'string') {
      return versionStr.startsWith('0.6')
    }

    // 4. Default to 0.5.x (most common case)
    return false

  } catch (err) {
    console.warn('getFirmwareVersion error, defaulting to 0.5.x:', err)
    return false
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
      throw new Error(`Expected JSON response but got: ${contentType || 'unknown'}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object' || !data.results) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure: missing results field');
    }

    // Get firmware version and registry
    const fw_is_0_6 = getFirmwareVersion();
    const registry = getRegistry(fw_is_0_6);

    console.log(`Using ${fw_is_0_6 ? '0.6.x' : '0.5.x'} registry for batch processing`);

    // Clean the data with smart defaults
    const cleanedResults = {};
    Object.entries(data.results).forEach(([path, value]) => {
      if (value === null || value === undefined) {
        // Try to get parameter info for smart defaults
        const param = registry.findParameter(path.replace(/^device\./, ''));
        
        if (param?.property) {
          // Use property metadata for defaults
          if (param.property.type === 'boolean') {
            cleanedResults[path] = false;
          } else if (param.property.type === 'number') {
            cleanedResults[path] = param.property.min || 0;
          } else {
            cleanedResults[path] = 0;
          }
        } else {
          // Simple fallback based on path patterns
          if (path.includes('enable_') || path.includes('pre_calibrated')) {
            cleanedResults[path] = false;
          } else if (path.includes('bandwidth') || path.includes('rate')) {
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
    throw error;
  }
};

/**
 * Load ALL ODrive configuration parameters in a single batch request
 * @returns {Promise<Object>} All configuration parameters organized by category
 */
export const loadAllConfigurationBatch = async () => {
  const fw_is_0_6 = getFirmwareVersion();
  const allPaths = getBatchPaths(fw_is_0_6);
  const registry = getRegistry(fw_is_0_6);

  console.log(`Loading ${allPaths.length} parameters using ${fw_is_0_6 ? '0.6.x' : '0.5.x'} registry`);

  // Load all parameters
  const allResults = await loadConfigurationBatch(allPaths);

  // Organize by category and axis
  const categorizedResults = {
    power: {},
    motor: { axis0: {}, axis1: {} },
    encoder: { axis0: {}, axis1: {} },
    control: { axis0: {}, axis1: {} },
    interface: {}
  };

  // Categorize results using registry
  Object.entries(allResults).forEach(([path, value]) => {
    if (value !== undefined && value !== null) {
      const propertyPath = path.replace(/^device\./, '');
      const param = registry.findParameter(propertyPath);

      if (param?.category) {
        let processedValue = value;

        // Handle special conversions
        if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
          processedValue = convertTorqueConstantToKv(value);
        }

        // Determine axis
        const axisMatch = propertyPath.match(/axis(\d+)/);
        const axisNumber = axisMatch ? parseInt(axisMatch[1]) : null;

        // Store in appropriate category/axis
        if (['motor', 'encoder', 'control'].includes(param.category) && axisNumber !== null) {
          categorizedResults[param.category][`axis${axisNumber}`][param.configKey] = processedValue;
        } else {
          categorizedResults[param.category][param.configKey] = processedValue;
        }
      }
    }
  });

  return categorizedResults;
};

/**
 * Get batch paths for a specific category
 */
export const getCategoryBatchPaths = (category, fw_is_0_6 = null) => {
  if (fw_is_0_6 === null) fw_is_0_6 = getFirmwareVersion();
  const registry = getRegistry(fw_is_0_6);
  const categoryParams = registry.getCategoryParameters(category);
  return categoryParams.map(param => `device.${param.odriveCommand}`);
};

/**
 * Load configuration for a specific category only
 */
export const loadCategoryConfigurationBatch = async (category, fw_is_0_6 = null) => {
  if (fw_is_0_6 === null) fw_is_0_6 = getFirmwareVersion();
  const categoryPaths = getCategoryBatchPaths(category, fw_is_0_6);
  const results = await loadConfigurationBatch(categoryPaths);
  const registry = getRegistry(fw_is_0_6);
  const categoryParams = registry.getCategoryParameters(category);
  const categoryConfig = {};

  categoryParams.forEach(param => {
    const path = `device.${param.odriveCommand}`;
    if (results[path] !== undefined) {
      let value = results[path];
      
      if (param.configKey === 'motor_kv' && param.path.includes('torque_constant')) {
        value = convertTorqueConstantToKv(value);
      }
      
      categoryConfig[param.configKey] = value;
    }
  });

  return categoryConfig;
};