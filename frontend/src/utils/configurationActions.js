/**
 * Configuration Actions Utility
 * Handles API calls for ODrive configuration operations
 */

/**
 * Execute configuration action via API
 * @param {string} action - The action to execute ('erase', 'apply', 'save_and_reboot', 'calibrate', 'save')
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
    default:
      throw new Error(`Unknown action: ${action}`)
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `${action} action failed`)
  }

  return await response.json()
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
 * @param {Array<string>} commands - Array of ODrive commands
 * @returns {Promise<void>} Resolves when both apply and save are complete
 */
export const applyAndSaveConfiguration = async (commands) => {
  // First apply the configuration
  await applyConfiguration(commands)
  
  // Then save to non-volatile memory
  await saveConfiguration()
}
