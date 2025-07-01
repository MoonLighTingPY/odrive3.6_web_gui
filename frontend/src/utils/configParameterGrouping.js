// Power parameter groups
export const POWER_PARAM_GROUPS = {
  // DC Bus Voltage Protection (including ramp)
  dc_bus_overvoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  dc_bus_undervoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  enable_dc_bus_overvoltage_ramp: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'advanced' },
  dc_bus_overvoltage_ramp_start: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'advanced' },
  dc_bus_overvoltage_ramp_end: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'advanced' },

  // Current Limits & Brake Resistor
  dc_max_positive_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  dc_max_negative_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  max_regen_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  enable_brake_resistor: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor', importance: 'essential' },
  brake_resistance: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor', importance: 'essential' },

  // FET Thermistor
  fet_thermistor_enabled: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_lower: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_upper: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },

  // Everything else goes to advanced (no more miscellaneous)
  usb_cdc_protocol: { group: 'System', subgroup: 'Communication', importance: 'advanced' },
}

// Motor parameter groups with simplified importance levels
export const MOTOR_PARAM_GROUPS = {
  // Essential Motor Settings (critical + important merged)
  motor_type: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  pole_pairs: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  motor_kv: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  current_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },
  calibration_current: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'essential' },
  phase_resistance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  phase_inductance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  torque_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },

  // Advanced parameters (everything else)
  resistance_calib_max_voltage: { group: 'Motor', subgroup: 'Electrical', importance: 'advanced' },
  motor_thermistor_enabled: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  gpio_pin: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  motor_temp_limit_lower: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  motor_temp_limit_upper: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  requested_current_range: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'advanced' },
  current_control_bandwidth: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'advanced' },
  pre_calibrated: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'advanced' },

  // Lock-in Parameters
  lock_in_spin_current: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  ramp_time: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  ramp_distance: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  accel: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  vel: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },

  // AC Induction Motor (ACIM) Parameters
  acim_gain_min_flux: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_enable: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_min_Id: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_attack_gain: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_decay_gain: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
}

export function getParameterGroup(param, groupMap) {
  if (param.uiGroup) return param.uiGroup;
  if (groupMap[param.configKey]) return groupMap[param.configKey].group;
  // Fallbacks for special cases
  if (param.path && param.path.includes('fet_thermistor')) return 'FET Thermistor';
  if (param.path && param.path.includes('brake')) return 'Current Limits & Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'DC Bus Voltage Protection';
  if (param.path && param.path.includes('voltage')) return 'DC Bus Voltage Protection';
  return 'System'; // No more "Miscellaneous"
}

export function getParameterSubgroup(param, groupMap) {
  if (param.uiSubgroup) return param.uiSubgroup;
  if (groupMap[param.configKey]) return groupMap[param.configKey].subgroup;
  // Fallbacks for special cases
  if (param.path && param.path.includes('fet_thermistor')) return 'Thermistor';
  if (param.path && param.path.includes('brake')) return 'Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'Ramp';
  if (param.path && param.path.includes('voltage')) return 'Trip Levels';
  return 'Other';
}

export function getParameterImportance(param, groupMap) {
  if (param.importance) return param.importance;
  if (groupMap[param.configKey]) return groupMap[param.configKey].importance;
  return 'advanced'; // Default to advanced instead of optional
}

// Updated function with new importance levels
export function getParametersByImportance(params, groupMap, importance = 'essential') {
  const importanceLevels = {
    essential: ['essential'],
    advanced: ['essential', 'advanced'],
    all: ['essential', 'advanced']
  }
  
  const targetLevels = importanceLevels[importance] || importanceLevels.all
  
  return params.filter(param => {
    const paramImportance = getParameterImportance(param, groupMap)
    return targetLevels.includes(paramImportance)
  })
}

// Enhanced function for organized advanced parameters
export function getGroupedAdvancedParameters(params, groupMap) {
  const advancedParams = getParametersByImportance(params, groupMap, 'all')
    .filter(param => getParameterImportance(param, groupMap) === 'advanced')

  const grouped = {}
  advancedParams.forEach(param => {
    const group = getParameterGroup(param, groupMap)
    const subgroup = getParameterSubgroup(param, groupMap)
    
    if (!grouped[group]) grouped[group] = {}
    if (!grouped[group][subgroup]) grouped[group][subgroup] = []
    grouped[group][subgroup].push(param)
  })

  return grouped
}

export function getOrderedGroupedParameters(params, groupMap, importance = 'all') {
  const filteredParams = getParametersByImportance(params, groupMap, importance)
  
  const groupOrder = []
  const subgroupOrder = {}
  Object.values(groupMap).forEach(({ group, subgroup }) => {
    if (!groupOrder.includes(group)) groupOrder.push(group)
    if (!subgroupOrder[group]) subgroupOrder[group] = []
    if (!subgroupOrder[group].includes(subgroup)) subgroupOrder[group].push(subgroup)
  })

  const grouped = {}
  groupOrder.forEach(group => {
    grouped[group] = {}
    subgroupOrder[group].forEach(subgroup => {
      grouped[group][subgroup] = filteredParams.filter(
        param =>
          getParameterGroup(param, groupMap) === group &&
          getParameterSubgroup(param, groupMap) === subgroup
      )
    })
  })

  return { groupOrder, subgroupOrder, grouped }
}