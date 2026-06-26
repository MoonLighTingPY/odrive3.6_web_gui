// Curated troubleshooting guidance for the most common ODrive errors.
// Keyed by "<group>:<FLAG>" so the UI can look up help for a decoded flag.

export const TROUBLESHOOTING = {
  'encoder:CPR_POLEPAIRS_MISMATCH': {
    title: 'Encoder CPR / Pole Pairs Mismatch',
    description: "The encoder counts per revolution don't agree with the motor pole pairs.",
    causes: [
      'Incorrect CPR value for your encoder',
      'Wrong motor pole pairs setting',
      'Encoder mode set incorrectly (Hall vs Incremental)',
    ],
    solutions: [
      "Verify your encoder's CPR from its datasheet",
      'For Hall encoders set mode = Hall (CPR is pole_pairs × 6)',
      'Recalibrate the encoder after correcting CPR',
    ],
    commands: [
      'axis0.encoder.config.cpr',
      'axis0.motor.config.pole_pairs',
      'axis0.encoder.config.mode',
    ],
  },
  'encoder:NO_RESPONSE': {
    title: 'Encoder Not Responding',
    description: 'The ODrive received no usable signal from the encoder.',
    causes: ['Loose or miswired encoder', 'Wrong encoder mode', 'Insufficient encoder power'],
    solutions: [
      'Check A/B/Z (and power) wiring',
      'Confirm encoder supply voltage (3.3V/5V)',
      'Select the correct encoder mode',
    ],
    commands: ['axis0.encoder.config.mode', 'axis0.encoder.error'],
  },
  'motor:PHASE_RESISTANCE_OUT_OF_RANGE': {
    title: 'Motor Phase Resistance Out of Range',
    description: 'Measured phase resistance is outside the expected window.',
    causes: ['Loose motor phase wiring', 'Wrong motor type', 'Calibration current too low/high'],
    solutions: [
      'Check the three motor phase connections',
      'Verify motor type (High Current vs Gimbal)',
      'Adjust calibration current for your motor',
    ],
    commands: ['axis0.motor.config.motor_type', 'axis0.motor.config.calibration_current'],
  },
  'controller:SPINOUT_DETECTED': {
    title: 'Spinout Detected',
    description: 'The controller detected a loss of motor control (possible runaway).',
    causes: ['Incorrect encoder direction/offset', 'Encoder slip', 'Aggressive gains'],
    solutions: ['Recalibrate the encoder', 'Check encoder mounting', 'Reduce control gains'],
    commands: ['axis0.encoder.config.direction', 'axis0.clear_errors()'],
  },
}

/** Look up a guide for a decoded error flag, or null. */
export function troubleshootingFor(group, flag) {
  return TROUBLESHOOTING[`${group}:${flag}`] || null
}
