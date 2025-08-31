export function getParameterGroup06(param, groupMap) {
  if (param.uiGroup) return param.uiGroup;
  if (groupMap[param.configKey]) return groupMap[param.configKey].group;
  
  // 0.6.x specific fallbacks for new properties
  if (param.path && param.path.includes('fet_thermistor')) return 'FET Thermistor';
  if (param.path && param.path.includes('brake_resistor')) return 'Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'DC Bus Voltage Protection';
  if (param.path && param.path.includes('voltage')) return 'DC Bus Voltage Protection';
  if (param.path && param.path.includes('lockin')) return 'Lock-in Configuration';
  if (param.path && param.path.includes('sensorless')) return 'Sensorless Ramp';
  if (param.path && param.path.includes('thermistor')) return 'Thermistor';
  if (param.path && param.path.includes('harmonic')) return 'Harmonic Compensation'; // 0.6.x specific
  if (param.path && param.path.includes('anticogging')) return 'Anticogging'; // Enhanced in 0.6.x
  if (param.path && param.path.includes('max_regen_current')) return 'Regenerative Braking'; // 0.6.x specific
  if (param.path && param.path.includes('rs485_encoder')) return 'RS485 Encoder'; // 0.6.x specific
  if (param.path && param.path.includes('can') && param.path.includes('data_baud_rate')) return 'CAN-FD'; // 0.6.x specific
  if (param.path && param.path.includes('homing')) return 'Homing'; // 0.6.x specific
  if (param.path && param.path.includes('identify')) return 'Identification'; // 0.6.x specific
  
  return 'System'; // No more "Miscellaneous"
}

export function getParameterSubgroup06(param, groupMap) {
  if (param.uiSubgroup) return param.uiSubgroup;
  if (groupMap[param.configKey]) return groupMap[param.configKey].subgroup;
  
  // 0.6.x specific fallbacks for new properties
  if (param.path && param.path.includes('fet_thermistor')) return 'Thermistor';
  if (param.path && param.path.includes('brake_resistor')) return 'Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'Ramp';
  if (param.path && param.path.includes('voltage')) return 'Trip Levels';
  if (param.path && param.path.includes('lockin')) return 'Lock-in';
  if (param.path && param.path.includes('sensorless')) return 'Sensorless Ramp';
  if (param.path && param.path.includes('thermistor')) return 'Motor Thermistor';
  if (param.path && param.path.includes('harmonic_compensation')) return 'Harmonic'; // 0.6.x
  if (param.path && param.path.includes('anticogging_cal')) return 'Calibration'; // 0.6.x
  if (param.path && param.path.includes('max_regen_current')) return 'Current Limits'; // 0.6.x
  if (param.path && param.path.includes('rs485_encoder_group')) return 'RS485 Group'; // 0.6.x
  if (param.path && param.path.includes('can') && param.path.includes('fd')) return 'CAN-FD Settings'; // 0.6.x
  if (param.path && param.path.includes('homing_speed')) return 'Speed Settings'; // 0.6.x
  if (param.path && param.path.includes('identify_once')) return 'LED Control'; // 0.6.x
  if (param.path && param.path.includes('init_pos') || param.path && param.path.includes('init_vel')) return 'Initialization'; // 0.6.x
  if (param.path && param.path.includes('detailed_disarm_reason')) return 'Error Reporting'; // 0.6.x
  if (param.path && param.path.includes('active_errors')) return 'Error Status'; // 0.6.x vs error in 0.5.x
  if (param.path && param.path.includes('disarm_reason')) return 'Disarm Status'; // 0.6.x specific
  if (param.path && param.path.includes('procedure_result')) return 'Procedure Status'; // Enhanced in 0.6.x
  
  return 'Other';
}

export function getParameterImportance06(param, groupMap) {
  if (param.importance) return param.importance;
  if (groupMap[param.configKey]) return groupMap[param.configKey].importance;
  
  // 0.6.x specific importance levels for new features
  if (param.path && param.path.includes('harmonic_compensation')) return 'advanced'; // New in 0.6.x
  if (param.path && param.path.includes('max_regen_current')) return 'essential'; // Important in 0.6.x
  if (param.path && param.path.includes('rs485_encoder')) return 'advanced'; // New encoder support
  if (param.path && param.path.includes('can') && param.path.includes('fd')) return 'advanced'; // CAN-FD
  if (param.path && param.path.includes('homing')) return 'advanced'; // Homing features
  if (param.path && param.path.includes('active_errors')) return 'essential'; // Critical for 0.6.x
  if (param.path && param.path.includes('detailed_disarm_reason')) return 'advanced'; // Debugging
  if (param.path && param.path.includes('init_pos') || param.path && param.path.includes('init_vel')) return 'advanced';
  
  return 'advanced'; // Default to advanced instead of optional
}

// Updated function with new importance levels for 0.6.x
export function getParametersByImportance06(params, groupMap, importance = 'essential') {
  const importanceLevels = {
    essential: ['essential'],
    advanced: ['essential', 'advanced'],
    all: ['essential', 'advanced']
  }
  
  const targetLevels = importanceLevels[importance] || importanceLevels.all
  
  return params.filter(param => {
    const paramImportance = getParameterImportance06(param, groupMap)
    return targetLevels.includes(paramImportance)
  })
}

// Group advanced parameters by category and subcategory for 0.6.x
export function getGroupedAdvancedParameters06(params, groupMap) {
  const advancedParams = getParametersByImportance06(params, groupMap, 'advanced')
    .filter(param => getParameterImportance06(param, groupMap) === 'advanced')

  const grouped = {}
  advancedParams.forEach(param => {
    const group = getParameterGroup06(param, groupMap)
    const subgroup = getParameterSubgroup06(param, groupMap)
    
    if (!grouped[group]) grouped[group] = {}
    if (!grouped[group][subgroup]) grouped[group][subgroup] = []
    grouped[group][subgroup].push(param)
  })
  
  return grouped
}

// Legacy exports for compatibility
export const getParameterGroup = getParameterGroup06
export const getParameterSubgroup = getParameterSubgroup06
export const getParameterImportance = getParameterImportance06
export const getParametersByImportance = getParametersByImportance06
export const getGroupedAdvancedParameters = getGroupedAdvancedParameters06