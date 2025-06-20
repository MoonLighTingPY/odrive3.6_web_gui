/**
 * Configuration Actions Utility
 * Handles API calls for ODrive configuration operations
 */


import { generateConfigCommands } from './configCommandGenerator'


/**
 * Execute configuration action via API
 * @param {string} action - The action to execute ('erase', 'apply', 'save_and_reboot', 'calibrate', 'save', 'clear_errors')
 * @param {Object} options - Action options
 * @param {Array<string>} options.commands - Array of commands (for apply action)
 * @param {string} options.calibrationType - Type of calibration ('full', 'motor', 'encoder_sequence')
 * @returns {Promise<Object>} Response from the API
 */
export const executeConfigAction = async (action, options = {}) => {
  let endpoint = ''
  let payload = {}

  switch (action) {
    case 'erase':
      endpoint = '/api/odrive/erase_config'
      break
    case 'apply':
      endpoint = '/api/odrive/apply_config'
      payload = { commands: options.commands || [] }
      break
    case 'save_and_reboot':
      endpoint = '/api/odrive/save_and_reboot'
      break
    case 'calibrate':
      endpoint = '/api/odrive/calibrate'
      payload = { type: options.calibrationType || 'full' }
      break
    case 'calibrate_motor':
      endpoint = '/api/odrive/calibrate'
      payload = { type: 'motor' }
      break
    case 'calibrate_encoder':
      endpoint = '/api/odrive/calibrate'
      payload = { type: 'encoder_sequence' }
      break
    case 'save':
      endpoint = '/api/odrive/save_config'
      break
    case 'clear_errors':
      endpoint = '/api/odrive/command'
      payload = { command: 'odrv0.clear_errors()' }
      break
    default:
      throw new Error(`Unknown action: ${action}`)
  }

  console.log(`Executing action: ${action}`, { endpoint, payload }) // Add debugging

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    // Get the response text first to see what we're actually receiving
    const responseText = await response.text()
    console.log(`Response for ${action}:`, { status: response.status, text: responseText })

    if (!response.ok) {
      let errorMessage = `${action} action failed`
      
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorData.message || errorMessage
      // eslint-disable-next-line no-unused-vars
      } catch (parseError) {
        // If JSON parsing fails, use the raw response text
        errorMessage = responseText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    // Try to parse as JSON, fallback to text if it fails
    try {
      return JSON.parse(responseText)
    // eslint-disable-next-line no-unused-vars
    } catch (parseError) {
      return { message: responseText }
    }
    
  } catch (fetchError) {
    console.error(`Fetch error for ${action}:`, fetchError)
    throw fetchError
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
 * Save configuration and reboot ODrive
 * @returns {Promise<Object>} Response from the API
 */
export const saveAndReboot = async () => {
  return await executeConfigAction('save_and_reboot')
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
 * @returns {Promise<Object>} Calibration status from the API
 */
export const getCalibrationStatus = async () => {
  const response = await fetch('/api/odrive/calibration_status')
  
  if (!response.ok) {
    throw new Error('Failed to get calibration status')
  }
  
  return await response.json()
}

/**
 * Auto-continue calibration sequence
 * @param {string} step - Next calibration step
 * @returns {Promise<Object>} Response from the API
 */
export const autoContinueCalibration = async (step) => {
  const response = await fetch('/api/odrive/auto_continue_calibration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Auto-continue failed')
  }

  return await response.json()
}

/**
 * Execute ODrive command
 * @param {string} command - ODrive command to execute
 * @returns {Promise<Object>} Response from the API
 */
export const executeCommand = async (command) => {
  const response = await fetch('/api/odrive/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Command execution failed')
  }

  return await response.json()
}

/**
 * Apply configuration and save to non-volatile memory
 * @param {Object} deviceConfig - Device configuration object
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>} Resolves when both apply and save are complete
 */
/**
 * Apply configuration and save to non-volatile memory
 * @param {Object} deviceConfig - Device configuration object
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>} Resolves when both apply and save are complete
 */
export const applyAndSaveConfiguration = async (deviceConfig, toast) => {

  const commands = generateConfigCommands(deviceConfig)
  
  // Mark that we're expecting a reconnection
  sessionStorage.setItem('expectingReconnection', 'true')
  
  // Step 1: Apply configuration
  toast({
    title: 'Applying configuration...',
    description: `Sending ${commands.length} commands to ODrive`,
    status: 'info',
    duration: 2000,
  })

  await applyConfiguration(commands)

  try {
    await saveConfiguration()
    
    // Device will reboot after save - wait for reconnection
    toast({
      title: 'Device rebooting...',
      description: 'ODrive is rebooting, waiting for reconnection...',
      status: 'warning',
      duration: 5000,
    })

    // Wait for device to reconnect
    let reconnected = false
    let attempts = 0
    const maxAttempts = 15

    while (!reconnected && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++

      try {
        const statusResponse = await fetch('/api/odrive/connection_status')
        if (statusResponse.ok) {
          const status = await statusResponse.json()
          if (status.connected && !status.connection_lost) {
            reconnected = true
            break
          }
        }
      } catch (error) {
        console.log(`Reconnection attempt ${attempts} failed:`, error)
      }
    }

    if (reconnected) {
      // Clear the flag and show final success toast
      sessionStorage.removeItem('expectingReconnection')
      toast({
        title: 'Configuration Applied & Saved',
        description: 'Configuration successfully applied, saved, and device reconnected',
        status: 'success',
        duration: 5000,
      })
    } else {
      sessionStorage.removeItem('expectingReconnection')
      toast({
        title: 'Configuration Saved - Manual Reconnection Required',
        description: 'Configuration was saved but automatic reconnection failed. Please reconnect manually.',
        status: 'warning',
        duration: 8000,
      })
    }

  } catch (error) {
    sessionStorage.removeItem('expectingReconnection')
    // Handle save errors...
    if (error.message.includes('reboot') || error.message.includes('disconnect')) {
      toast({
        title: 'Configuration Saved (Device Rebooted)',
        description: 'Configuration saved successfully. Device has rebooted - it may take a moment to reconnect.',
        status: 'info',
        duration: 8000,
      })
    } else {
      throw error
    }
  }
}