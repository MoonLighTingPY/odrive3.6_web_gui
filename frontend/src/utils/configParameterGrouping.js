// Power parameter groups
export const POWER_PARAM_GROUPS = {
  // DC Bus Voltage Protection (including ramp)
  dc_bus_overvoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels' },
  dc_bus_undervoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels' },
  enable_dc_bus_overvoltage_ramp: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp' },
  dc_bus_overvoltage_ramp_start: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp' },
  dc_bus_overvoltage_ramp_end: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp' },

  // Current Limits & Brake Resistor
  dc_max_positive_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits' },
  dc_max_negative_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits' },
  max_regen_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits' },
  enable_brake_resistor: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor' },
  brake_resistance: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor' },

  // FET Thermistor
  fet_thermistor_enabled: { group: 'FET Thermistor', subgroup: 'Thermistor' },
  fet_temp_limit_lower: { group: 'FET Thermistor', subgroup: 'Thermistor' },
  fet_temp_limit_upper: { group: 'FET Thermistor', subgroup: 'Thermistor' },

  // Miscellaneous
  usb_cdc_protocol: { group: 'Miscellaneous', subgroup: 'Miscellaneous' },
}

// Motor parameter groups with unique Lock-in subgroups
export const MOTOR_PARAM_GROUPS = {
  // Motor Basics & Electrical
  motor_type: { group: 'Motor', subgroup: 'Basics' },
  pole_pairs: { group: 'Motor', subgroup: 'Basics' },
  motor_kv: { group: 'Motor', subgroup: 'Basics' },
  phase_resistance: { group: 'Motor', subgroup: 'Electrical' },
  phase_inductance: { group: 'Motor', subgroup: 'Electrical' },
  resistance_calib_max_voltage: { group: 'Motor', subgroup: 'Electrical' },

  // Motor Thermistor & Temperature Limits
  motor_thermistor_enabled: { group: 'Motor', subgroup: 'Thermistor' },
  gpio_pin: { group: 'Motor', subgroup: 'Thermistor' },
  motor_temp_limit_lower: { group: 'Motor', subgroup: 'Thermistor' },
  motor_temp_limit_upper: { group: 'Motor', subgroup: 'Thermistor' },

  // Limits & Calibration
  current_lim: { group: 'Limits & Calibration', subgroup: 'Limits' },
  torque_lim: { group: 'Limits & Calibration', subgroup: 'Limits' },
  requested_current_range: { group: 'Limits & Calibration', subgroup: 'Limits' },
  current_control_bandwidth: { group: 'Limits & Calibration', subgroup: 'Calibration' },
  pre_calibrated: { group: 'Limits & Calibration', subgroup: 'Calibration' },
  calibration_current: { group: 'Limits & Calibration', subgroup: 'Calibration' },

// Lock-in Parameters
  lock_in_spin_current: { group: 'Lock-in', subgroup: 'Lock-in' },
  ramp_time: { group: 'Lock-in', subgroup: 'Lock-in' },
  ramp_distance: { group: 'Lock-in', subgroup: 'Lock-in' },
  accel: { group: 'Lock-in', subgroup: 'Lock-in' },
  vel: { group: 'Lock-in', subgroup: 'Lock-in' },

  // AC Induction Motor (ACIM) Parameters
  acim_gain_min_flux: { group: 'ACIM', subgroup: 'ACIM' },
  acim_autoflux_enable: { group: 'ACIM', subgroup: 'ACIM' },
  acim_autoflux_min_Id: { group: 'ACIM', subgroup: 'ACIM' },
  acim_autoflux_attack_gain: { group: 'ACIM', subgroup: 'ACIM' },
  acim_autoflux_decay_gain: { group: 'ACIM', subgroup: 'ACIM' },
}

export function getParameterGroup(param, groupMap) {
  if (param.uiGroup) return param.uiGroup;
  // Use contextual configKey for Lock-in parameters
  if (groupMap[param.configKey]) return groupMap[param.configKey].group;
  // Fallbacks for special cases
  if (param.path && param.path.includes('fet_thermistor')) return 'FET Thermistor';
  if (param.path && param.path.includes('brake')) return 'Current Limits & Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'DC Bus Overvoltage Ramp';
  if (param.path && param.path.includes('voltage')) return 'DC Bus Voltage Protection';
  return 'Miscellaneous';
}

export function getParameterSubgroup(param, groupMap) {
  if (param.uiSubgroup) return param.uiSubgroup;
  // Use contextual configKey for Lock-in parameters
  if (groupMap[param.configKey]) return groupMap[param.configKey].subgroup;
  // Fallbacks for special cases
  if (param.path && param.path.includes('fet_thermistor')) return 'Thermistor';
  if (param.path && param.path.includes('brake')) return 'Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'Ramp';
  if (param.path && param.path.includes('voltage')) return 'Trip Levels';
  return 'Miscellaneous';
}

export function getOrderedGroupedParameters(params, groupMap) {
  // Build ordered group/subgroup structure from groupMap
  const groupOrder = []
  const subgroupOrder = {}
  Object.values(groupMap).forEach(({ group, subgroup }) => {
    if (!groupOrder.includes(group)) groupOrder.push(group)
    if (!subgroupOrder[group]) subgroupOrder[group] = []
    if (!subgroupOrder[group].includes(subgroup)) subgroupOrder[group].push(subgroup)
  })

  // Map of group -> subgroup -> params (preserves order)
  const grouped = {}
  groupOrder.forEach(group => {
    grouped[group] = {}
    subgroupOrder[group].forEach(subgroup => {
      grouped[group][subgroup] = params.filter(
        param =>
          getParameterGroup(param, groupMap) === group &&
          getParameterSubgroup(param, groupMap) === subgroup
      )
    })
  })

  return { groupOrder, subgroupOrder, grouped }
}