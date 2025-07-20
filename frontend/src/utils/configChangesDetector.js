/**
 * Utility to detect configuration changes between initial and current values
 */

import { odriveRegistry } from './odriveUnifiedRegistry'

/**
 * Compare two values with tolerance for floating point numbers
 * @param {any} value1 - First value
 * @param {any} value2 - Second value
 * @param {number} tolerance - Tolerance for floating point comparison
 * @returns {boolean} True if values are considered equal
 */
const valuesEqual = (value1, value2, tolerance = 1e-6) => {
  if (value1 === value2) return true
  
  // Handle null/undefined cases
  if (value1 == null && value2 == null) return true
  if (value1 == null || value2 == null) return false
  
  // For numbers, use tolerance-based comparison
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    return Math.abs(value1 - value2) < tolerance
  }
  
  return false
}

/**
 * Get changed parameters between initial and current configuration
 */
export const getChangedParameters = (initialConfig, currentConfig) => {
  const changes = {
    power: {},
    motor: {},
    encoder: {},
    control: {},
    interface: {}
  }

  Object.keys(changes).forEach(category => {
    const initial = initialConfig[category] || {}
    const current = currentConfig[category] || {}
    
    if (category === 'motor' || category === 'encoder' || category === 'control') {
      // For axis-specific categories, handle structure differences
      const currentHasFlatStructure = Object.keys(current).some(key => 
        !['axis0', 'axis1', 'axisNumber'].includes(key)
      )
      
      if (currentHasFlatStructure) {
        // Current config is flat (Redux), initial config is nested (device)
        const axisNumber = current.axisNumber || 0
        const axisKey = `axis${axisNumber}`
        const initialAxis = initial[axisKey] || {}
        
        // Only compare flat properties that exist in BOTH configs
        Object.keys(current).forEach(key => {
          if (key === 'axisNumber' || key === 'axis0' || key === 'axis1') return
          
          const initialValue = initialAxis[key]
          const currentValue = current[key]
          
          // Only mark as changed if values are different
          if (initialValue !== undefined && currentValue !== undefined && 
              !valuesEqual(initialValue, currentValue)) {
            changes[category][key] = currentValue
          }
        })
        
        // IMPORTANT: Don't process the nested axis structures when we have flat structure
        // This prevents generating commands for both axes when only one axis is selected
      } else {
        // Both configs use nested structure
        ['axis0', 'axis1'].forEach(axis => {
          const initialAxis = initial[axis] || {}
          const currentAxis = current[axis] || {}
          
          Object.keys(currentAxis).forEach(key => {
            const initialValue = initialAxis[key]
            const currentValue = currentAxis[key]
            
            if (initialValue !== undefined && currentValue !== undefined && 
                !valuesEqual(initialValue, currentValue)) {
              if (!changes[category][axis]) changes[category][axis] = {}
              changes[category][axis][key] = currentValue
            }
          })
        })
      }
    } else {
      // For global categories (power, interface)
      Object.keys(current).forEach(key => {
        if (key === 'axisNumber') return
        
        const initialValue = initial[key]
        const currentValue = current[key]
        
        if (initialValue !== undefined && currentValue !== undefined && 
            !valuesEqual(initialValue, currentValue)) {
          changes[category][key] = currentValue
        }
      })
    }
  })
  
  return changes
}

/**
 * Generate commands only for changed parameters
 * @param {Object} initialConfig - Initial configuration
 * @param {Object} currentConfig - Current configuration
 * @param {number|null} selectedAxis - Axis to apply (0, 1, or null)
 * @param {boolean} applyToBothAxes - Whether to apply to both axes
 */
export const generateChangedCommands = (
  initialConfig,
  currentConfig,
  selectedAxis = 0,
  applyToBothAxes = false
) => {
  const changedParams = getChangedParameters(initialConfig, currentConfig);
  let allCommands = [];

  // Always generate commands for both axes and global categories
  Object.entries(changedParams).forEach(([category, params]) => {
    if (!params || Object.keys(params).length === 0) return;
    try {
      const commands = odriveRegistry.generateCommands(category, params);
      allCommands.push(...commands);
    } catch (err) {
      console.error(`Error generating commands for ${category}:`, err);
    }
  });

  // If not applying to both axes, filter out commands for the other axis
  if (!applyToBothAxes && selectedAxis !== null && selectedAxis !== undefined) {
    allCommands = allCommands.filter(cmd => {
      // Only filter out axis commands for the other axis, keep global and selected axis
      if (/\.axis\d+\./.test(cmd)) {
        return cmd.includes(`.axis${selectedAxis}.`);
      }
      return true; // keep global commands
    });
  }

  return allCommands;
}


/**
 * Get statistics about configuration changes
 * @param {Object} initialConfig - Initial configuration
 * @param {Object} currentConfig - Current configuration
 * @returns {Object} Statistics about changes
 */
export const getChangeStatistics = (initialConfig, currentConfig) => {
  const changedParams = getChangedParameters(initialConfig, currentConfig)
  
  const stats = {
    totalChanged: 0,
    changesByCategory: {},
    changedParameters: {}
  }
  
  Object.entries(changedParams).forEach(([category, params]) => {
    const count = Object.keys(params).length
    stats.changesByCategory[category] = count
    stats.totalChanged += count
    
    if (count > 0) {
      stats.changedParameters[category] = Object.keys(params)
    }
  })
  
  return stats
}