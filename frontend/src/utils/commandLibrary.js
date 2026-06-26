// Curated quick-command library for the command console, grouped by category.
// `{axis}` is substituted with the selected axis at insert time. These mirror
// the odrivetool commands users reach for most often.

export const COMMAND_LIBRARY = [
  {
    category: 'Axis State',
    commands: [
      { label: 'Idle', command: 'axis{axis}.requested_state = 1', description: 'Return the axis to idle.' },
      { label: 'Closed Loop Control', command: 'axis{axis}.requested_state = 8', description: 'Enter closed-loop control (enable motor).' },
      { label: 'Full Calibration', command: 'axis{axis}.requested_state = 3', description: 'Run the full motor + encoder calibration sequence.' },
      { label: 'Motor Calibration', command: 'axis{axis}.requested_state = 4', description: 'Measure motor resistance and inductance.' },
      { label: 'Encoder Offset Calibration', command: 'axis{axis}.requested_state = 7', description: 'Calibrate the encoder offset.' },
      { label: 'Encoder Index Search', command: 'axis{axis}.requested_state = 6', description: 'Search for the encoder index pulse.' },
    ],
  },
  {
    category: 'Errors',
    commands: [
      { label: 'Clear Errors (axis)', command: 'axis{axis}.clear_errors()', description: 'Clear errors on this axis.' },
      { label: 'Clear Errors (device)', command: 'clear_errors()', description: 'Clear all errors on the device.' },
      { label: 'Read Axis Error', command: 'axis{axis}.error', description: 'Read the axis error register.' },
      { label: 'Read Motor Error', command: 'axis{axis}.motor.error', description: 'Read the motor error register.' },
      { label: 'Read Encoder Error', command: 'axis{axis}.encoder.error', description: 'Read the encoder error register.' },
    ],
  },
  {
    category: 'Control',
    commands: [
      { label: 'Set Position', command: 'axis{axis}.controller.input_pos = 0', description: 'Command a position setpoint (turns).' },
      { label: 'Set Velocity', command: 'axis{axis}.controller.input_vel = 0', description: 'Command a velocity setpoint (turns/s).' },
      { label: 'Set Torque', command: 'axis{axis}.controller.input_torque = 0', description: 'Command a torque setpoint (Nm).' },
      { label: 'Control Mode', command: 'axis{axis}.controller.config.control_mode = 3', description: 'Set control mode (3 = position).' },
    ],
  },
  {
    category: 'Telemetry',
    commands: [
      { label: 'Bus Voltage', command: 'vbus_voltage', description: 'Read the DC bus voltage.' },
      { label: 'Position Estimate', command: 'axis{axis}.encoder.pos_estimate', description: 'Read the encoder position (turns).' },
      { label: 'Velocity Estimate', command: 'axis{axis}.encoder.vel_estimate', description: 'Read the encoder velocity (turns/s).' },
      { label: 'Iq Measured', command: 'axis{axis}.motor.current_control.Iq_measured', description: 'Read the measured q-axis current.' },
    ],
  },
  {
    category: 'System',
    commands: [
      { label: 'Save Configuration', command: 'save_configuration()', description: 'Persist configuration to non-volatile memory.' },
      { label: 'Erase Configuration', command: 'erase_configuration()', description: 'Reset all settings to defaults and reboot.' },
      { label: 'Reboot', command: 'reboot()', description: 'Reboot the device.' },
    ],
  },
]

/** Substitute the selected axis into a command template. */
export function withAxis(command, axis) {
  return command.replace(/\{axis\}/g, String(axis))
}
