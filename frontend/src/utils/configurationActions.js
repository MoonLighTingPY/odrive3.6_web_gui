/**
 * Configuration Actions Utility
 * Handles API calls for ODrive configuration operations
 */

import { generateConfigCommands } from './configCommandGenerator'
import { setConnectedDevice } from '../store/slices/deviceSlice'
import { getPathResolver } from './odrivePathResolver'
import { makeApiRequest } from './apiResponseHandler'

/**
 * Action to endpoint mapping - eliminates hardcoded endpoint logic
 */
const ACTION_CONFIG = {
  erase: { endpoint: '/api/odrive/erase_config', method: 'POST' },
  apply: { endpoint: '/api/odrive/apply_config', method: 'POST' },
  calibrate: { endpoint: '/api/odrive/calibrate', method: 'POST' },
  calibrate_motor: { endpoint: '/api/odrive/calibrate', method: 'POST' },
  calibrate_encoder: { endpoint: '/api/odrive/calibrate', method: 'POST' },
  save: { endpoint: '/api/odrive/save_config', method: 'POST' },
  clear_errors: { endpoint: '/api/odrive/command', method: 'POST' }
}

/**
 * Build payload for configuration action
 * @param {string} action - The action to execute  
 * @param {Object} options - Action options
 * @returns {Object} Payload for the action
 */
const buildActionPayload = (action, options = {}) => {
  switch (action) {
    case 'apply':
      return { commands: options.commands || [] }
    case 'calibrate':
      return { type: options.calibrationType || 'full' }
    case 'calibrate_motor':
      return { type: 'motor' }
    case 'calibrate_encoder':
      return { type: 'encoder_sequence' }
    case 'clear_errors': {
      // Use dynamic device name instead of hardcoded "odrv0"
      const pathResolver = getPathResolver()
      return { command: `${pathResolver.config.deviceName}.clear_errors()` }
    }
    default:
      return {}
  }
}

/**
 * Execute configuration action via API
 * @param {string} action - The action to execute
 * @param {Object} options - Action options
 * @returns {Promise<Object>} Response from the API
 */
export const executeConfigAction = async (action, options = {}) => {
  const actionConfig = ACTION_CONFIG[action]
  if (!actionConfig) {
    throw new Error(`Unknown action: ${action}`)
  }

  const payload = buildActionPayload(action, options)
  
  console.log(`Executing action: ${action}`, { endpoint: actionConfig.endpoint, payload })

  try {
    const data = await makeApiRequest(
      actionConfig.endpoint,
      {
        method: actionConfig.method,
        body: payload
      },
      {
        expectJson: true,
        handleInfinity: false
      }
    )
    
    return data || { message: 'Success' }
    
  } catch (error) {
    console.error(`Action ${action} failed:`, error)
    throw error
  }
}

/**
 * Apply configuration commands to ODrive
 * @param {Array<string>} commands - Array of ODrive commands
 * @returns {Promise<Object>} Response from the API
 */
export const applyConfiguration = async (commands) => {
  return await executeConfigAction('apply', { commands })
}

/**
 * Save configuration to non-volatile memory
 * @returns {Promise<Object>} Response from the API
 */
export const saveConfiguration = async () => {
  return await executeConfigAction('save')
}

/**
 * Erase configuration and reboot ODrive
 * @returns {Promise<Object>} Response from the API
 */
export const eraseConfiguration = async () => {
  return await executeConfigAction('erase')
}

/**
 * Clear all ODrive errors
 * @returns {Promise<Object>} Response from the API
 */
export const clearErrors = async () => {
  return await executeConfigAction('clear_errors')
}

/**
 * Start calibration process
 * @param {string} type - Type of calibration ('full', 'motor', 'encoder_sequence')
 * @returns {Promise<Object>} Response from the API
 */
export const startCalibration = async (type = 'full') => {
  return await executeConfigAction('calibrate', { calibrationType: type })
}

/**
 * Get calibration status
 * @param {number} selectedAxis - Axis number to query
 * @returns {Promise<Object>} Calibration status from the API
 */
export const getCalibrationStatus = async (selectedAxis) => {
  try {
    return await makeApiRequest(`/api/odrive/calibration_status?axis=${selectedAxis}`, {
      method: 'GET'
    }, {
      expectJson: true,
      handleInfinity: false
    })
  } catch (error) {
    throw new Error(`Failed to get calibration status: ${error.message}`)
  }
}

/**
 * Execute ODrive command
 * @param {string} command - ODrive command to execute
 * @returns {Promise<Object>} Response from the API
 */
export const executeCommand = async (command) => {
  try {
    return await makeApiRequest('/api/odrive/command', {
      method: 'POST',
      body: { command }
    }, {
      expectJson: true,
      handleInfinity: false
    })
  } catch (error) {
    throw new Error(`Command execution failed: ${error.message}`)
  }
}

/**
 * Apply configuration and save to non-volatile memory
 * @param {Object} deviceConfig - Device configuration object
 * @param {Function} toast - Toast notification function
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} connectedDevice - Connected device info
 * @returns {Promise<void>} Resolves when both apply and save are complete
 */
export const applyAndSaveConfiguration = async (deviceConfig, toast, dispatch, connectedDevice) => {
  const commands = generateConfigCommands(deviceConfig)

  // Step 1: Apply configuration
  toast({
    title: 'Applying configuration...',
    description: `Sending ${commands.length} commands to ODrive`,
    status: 'info',
    duration: 2000,
  })

  await applyConfiguration(commands)

  // Step 2: Save configuration
  toast({
    title: 'Saving configuration...',
    description: 'Saving to non-volatile memory. Device will reboot.',
    status: 'warning',
    duration: 3000,
  })

  await handleSaveWithReconnect(connectedDevice, dispatch, toast)
}

/**
 * Handle save configuration with automatic reconnect
 * @param {Object} connectedDevice - Connected device info
 * @param {Function} dispatch - Redux dispatch function  
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>}
 */
const handleSaveWithReconnect = async (connectedDevice, dispatch, toast) => {
  try {
    await saveConfiguration()
    
    toast({
      title: 'Configuration Saved',
      description: 'Configuration saved to non-volatile memory successfully.',
      status: 'success',
      duration: 5000,
    })

    // Attempt reconnect
    await attemptReconnect(connectedDevice, dispatch)

  } catch (error) {
    // Handle expected disconnect during reboot
    if (error.message.includes('reboot') || error.message.includes('disconnect')) {
      toast({
        title: 'Configuration Saved',
        description: 'Configuration saved to non-volatile memory successfully.',
        status: 'success',
        duration: 5000,
      })
      await attemptReconnect(connectedDevice, dispatch)
    } else {
      throw error
    }
  }
}

/**
 * Attempt to reconnect to ODrive device
 * @param {Object} connectedDevice - Device to reconnect to
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<void>}
 */
const attemptReconnect = async (connectedDevice, dispatch) => {
  if (connectedDevice && dispatch) {
    try {
      const data = await makeApiRequest('/api/odrive/connect', {
        method: 'POST',
        body: { device: connectedDevice }
      }, {
        expectJson: true,
        handleInfinity: false
      })
      
      if (data) {
        dispatch(setConnectedDevice(connectedDevice))
      }
    } catch (error) {
      console.warn('Auto-reconnect failed:', error)
    }
  }
}

/**
 * Save configuration and reboot ODrive, then reconnect frontend
 * @param {Function} toast - Toast notification function
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} connectedDevice - Device object from Redux
 */
export const saveAndRebootWithReconnect = async (toast, dispatch, connectedDevice) => {
  try {
    await handleSaveWithReconnect(connectedDevice, dispatch, toast)
    
    toast({
      title: 'Configuration Saved',
      description: 'Configuration saved and device reconnected successfully.',
      status: 'success',
      duration: 5000,
    })
  } catch (error) {
    toast({
      title: 'Save & Reboot Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    throw error
  }
}