// Motor parameter groups
export const MOTOR_PARAM_GROUPS = {
  // Motor Type & Parameters
  motor_type: 'Motor Type & Parameters',
  pole_pairs: 'Motor Type & Parameters',
  motor_kv: 'Motor Type & Parameters',

  // Motor Electrical Properties
  phase_resistance: 'Motor Electrical Properties',
  phase_inductance: 'Motor Electrical Properties',
  resistance_calib_max_voltage: 'Motor Electrical Properties',

  // Current & Torque Limits
  current_lim: 'Current & Torque Limits',
  torque_lim: 'Current & Torque Limits',
  current_control_bandwidth: 'Current & Torque Limits',
  requested_current_range: 'Current & Torque Limits',

  // Calibration
  pre_calibrated: 'Calibration',
  calibration_current: 'Calibration',
  lock_in_spin_current: 'Lock-in',

  // Lock-in
  ramp_time: 'Lock-in',
  ramp_distance: 'Lock-in',
  accel: 'Lock-in',
  vel: 'Lock-in',

  // ACIM
  acim_gain_min_flux: 'ACIM',
  acim_autoflux_min_Id: 'ACIM',
  acim_autoflux_enable: 'ACIM',
  acim_autoflux_attack_gain: 'ACIM',
  acim_autoflux_decay_gain: 'ACIM',

  // Motor Thermistor
  motor_thermistor_enabled: 'Motor Thermistor',
  gpio_pin: 'Motor Thermistor',
  motor_temp_limit_lower: 'Motor Thermistor',
  motor_temp_limit_upper: 'Motor Thermistor',
};

// Power parameter groups
export const POWER_PARAM_GROUPS = {
  // DC Bus Voltage Protection (including ramp)
  dc_bus_overvoltage_trip_level: 'DC Bus Voltage Protection',
  dc_bus_undervoltage_trip_level: 'DC Bus Voltage Protection',
  enable_dc_bus_overvoltage_ramp: 'DC Bus Voltage Protection',
  dc_bus_overvoltage_ramp_start: 'DC Bus Voltage Protection',
  dc_bus_overvoltage_ramp_end: 'DC Bus Voltage Protection',

  // Current Limits & Brake Resistor
  dc_max_positive_current: 'Current Limits & Brake Resistor',
  dc_max_negative_current: 'Current Limits & Brake Resistor',
  max_regen_current: 'Current Limits & Brake Resistor',
  enable_brake_resistor: 'Current Limits & Brake Resistor',
  brake_resistance: 'Current Limits & Brake Resistor',

  // FET Thermistor
  fet_thermistor_enabled: 'FET Thermistor',
  fet_temp_limit_lower: 'FET Thermistor',
  fet_temp_limit_upper: 'FET Thermistor',

  // Miscellaneous
  usb_cdc_protocol: 'Miscellaneous',
}

export function getParameterGroup(param, groupMap) {
  if (param.uiGroup) return param.uiGroup;
  if (groupMap[param.configKey]) return groupMap[param.configKey];
  // Fallbacks for special cases
  if (param.path && param.path.includes('fet_thermistor')) return 'FET Thermistor';
  if (param.path && param.path.includes('brake')) return 'Current Limits & Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'DC Bus Overvoltage Ramp';
  if (param.path && param.path.includes('voltage')) return 'DC Bus Voltage Protection';
  return 'Miscellaneous';
}