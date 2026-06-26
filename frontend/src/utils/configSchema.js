// Curated presentation schema for the configuration wizard.
//
// This is the *presentation* layer that gives the data-driven registry friendly
// labels, units, tooltips, and an essential/advanced split — without
// reintroducing hardcoded command generation or fabricated defaults. Each field
// references a REAL property path (template form, `axis{n}...`); the value type
// and enum options come from the data-driven registry at runtime, and reads /
// writes / change-detection go through the thin backend + configDiff.
//
// Paths here are for the 0.5.x line (the fully-curated firmware). 0.6.x nests
// motor config differently; `resolvePath` maps the few that moved.

export const STEPS = [
  { id: 'power', label: 'Power', description: 'DC bus protection and current limits' },
  { id: 'motor', label: 'Motor', description: 'Motor type and electrical parameters' },
  { id: 'encoder', label: 'Encoder', description: 'Encoder type and calibration' },
  { id: 'control', label: 'Control', description: 'Control mode, gains and limits' },
  { id: 'interface', label: 'Interface', description: 'CAN, UART, step/dir and safety' },
  { id: 'apply', label: 'Apply', description: 'Review and write changes' },
]

// f = field helper. importance defaults to 'essential'.
const f = (path, label, opts = {}) => ({
  path,
  label,
  importance: 'essential',
  decimals: 2,
  step: 0.1,
  ...opts,
})

/**
 * Per-step field definitions. `axisScoped` marks steps whose paths use `axis{n}`
 * (expanded to the selected axis); others are global device config.
 */
export const SCHEMA = {
  power: {
    axisScoped: false,
    groups: [
      {
        title: 'DC Bus Voltage Protection',
        fields: [
          f('config.dc_bus_overvoltage_trip_level', 'Overvoltage Trip Level', { unit: 'V', decimals: 1, step: 0.5, tooltip: 'Bus voltage above which the ODrive disconnects to protect itself.' }),
          f('config.dc_bus_undervoltage_trip_level', 'Undervoltage Trip Level', { unit: 'V', decimals: 1, step: 0.5, tooltip: 'Bus voltage below which the ODrive disconnects (e.g. battery protection).' }),
        ],
      },
      {
        title: 'Current Limits & Brake',
        fields: [
          f('config.dc_max_positive_current', 'Max Positive DC Current', { unit: 'A', decimals: 1, step: 1, tooltip: 'Maximum current drawn from the power supply. Typically your PSU/battery rating (e.g. 10–40 A).' }),
          f('config.dc_max_negative_current', 'Max Negative DC Current', { unit: 'A', decimals: 1, step: 0.1, tooltip: 'Maximum regenerative current returned to the supply. Must be negative (e.g. -1). With a brake resistor this can be small.' }),
          f('config.max_regen_current', 'Max Regen Current', { unit: 'A', decimals: 1, step: 0.5, tooltip: 'Limit on regenerative braking current. Start at 0 if unsure.' }),
          f('config.brake_resistance', 'Brake Resistance', { unit: 'Ω', decimals: 2, step: 0.1, tooltip: 'Resistance of the connected brake resistor (ODrive ships with 2Ω). Set 0 to disable.' }),
        ],
      },
    ],
    advanced: [
      {
        group: 'Overvoltage Ramp',
        fields: [
          f('config.dc_bus_overvoltage_ramp_start', 'OV Ramp Start', { unit: 'V', decimals: 1, importance: 'advanced', tooltip: 'Voltage at which current ramp-down begins.' }),
          f('config.dc_bus_overvoltage_ramp_end', 'OV Ramp End', { unit: 'V', decimals: 1, importance: 'advanced', tooltip: 'Voltage at which the motor is fully disabled.' }),
        ],
      },
    ],
  },

  motor: {
    axisScoped: true,
    groups: [
      {
        title: 'Motor',
        fields: [
          f('axis{n}.motor.config.motor_type', 'Motor Type', { kind: 'enum', enumName: 'ODrive.Motor.MotorType', tooltip: 'High Current for most BLDC/PMSM motors, Gimbal for high-resistance gimbal motors.' }),
          f('axis{n}.motor.config.pole_pairs', 'Pole Pairs', { unit: 'pairs', decimals: 0, step: 1, tooltip: 'Number of magnet pole pairs (magnets ÷ 2).' }),
          f('axis{n}.motor.config.torque_constant', 'Torque Constant (Kt)', { unit: 'Nm/A', decimals: 4, step: 0.001, derivedFromKv: true, tooltip: 'Nm per amp. Computed from motor Kv: Kt = 8.27 / Kv.' }),
          f('axis{n}.motor.config.current_lim', 'Current Limit', { unit: 'A', decimals: 1, step: 1, tooltip: 'Maximum phase current. Gimbal motors ~10 A; hobby/high-current motors 20–100 A. Keep below your PSU and motor rating.' }),
        ],
      },
      {
        title: 'Calibration',
        fields: [
          f('axis{n}.motor.config.calibration_current', 'Calibration Current', { unit: 'A', decimals: 2, step: 0.1, tooltip: 'Current applied while measuring motor resistance/inductance.' }),
          f('axis{n}.motor.config.phase_resistance', 'Phase Resistance', { unit: 'Ω', decimals: 4, step: 0.001, tooltip: 'Motor winding resistance (measured by calibration).' }),
          f('axis{n}.motor.config.phase_inductance', 'Phase Inductance', { unit: 'H', decimals: 6, step: 0.00001, tooltip: 'Motor winding inductance (measured by calibration).' }),
          f('axis{n}.motor.config.torque_lim', 'Torque Limit', { unit: 'Nm', decimals: 2, step: 0.1, tooltip: 'Maximum commanded torque. Leave at Inf to be bounded only by the current limit; set ~2–5× your load torque to cap it.' }),
          f('axis{n}.motor.config.pre_calibrated', 'Pre-Calibrated', { kind: 'boolean', tooltip: 'Skip motor calibration on startup using stored resistance/inductance. Set after a successful calibration.' }),
        ],
      },
    ],
    advanced: [
      {
        group: 'Current Control',
        fields: [
          f('axis{n}.motor.config.current_control_bandwidth', 'Current Control Bandwidth', { unit: 'rad/s', decimals: 0, step: 10, importance: 'advanced', tooltip: 'Speed of the current control loop. Higher tracks faster but is noisier; 1000 rad/s is a safe default.' }),
          f('axis{n}.motor.config.requested_current_range', 'Requested Current Range', { unit: 'A', decimals: 1, importance: 'advanced', tooltip: 'Full-scale current the sensors are configured for. Set somewhat above your current limit; lower ranges give finer resolution.' }),
          f('axis{n}.motor.config.current_lim_margin', 'Current Limit Margin', { unit: 'A', decimals: 1, importance: 'advanced', tooltip: 'Headroom above the current limit before a hard over-current trip. Default 8 A is fine for most setups.' }),
          f('axis{n}.motor.config.resistance_calib_max_voltage', 'Resistance Calib Max Voltage', { unit: 'V', decimals: 1, importance: 'advanced', tooltip: 'Maximum voltage used while measuring phase resistance. Must be below ~half the bus voltage.' }),
        ],
      },
      {
        group: 'Inverter Thermal',
        fields: [
          f('axis{n}.motor.config.inverter_temp_limit_lower', 'Inverter Temp Limit Lower', { unit: '°C', decimals: 0, importance: 'advanced', tooltip: 'Temperature where current starts derating to protect the FETs (default ~100 °C).' }),
          f('axis{n}.motor.config.inverter_temp_limit_upper', 'Inverter Temp Limit Upper', { unit: '°C', decimals: 0, importance: 'advanced', tooltip: 'Temperature where the inverter shuts down completely (default ~120 °C).' }),
        ],
      },
    ],
  },

  encoder: {
    axisScoped: true,
    groups: [
      {
        title: 'Encoder',
        fields: [
          f('axis{n}.encoder.config.mode', 'Encoder Type', { kind: 'enum', enumName: 'ODrive.Encoder.Mode', tooltip: 'Incremental (ABZ), Hall, SinCos or SPI absolute.' }),
          f('axis{n}.encoder.config.cpr', 'CPR (Counts per Rev)', { unit: 'counts', decimals: 0, step: 1, tooltip: 'Encoder counts per mechanical revolution. Hall: pole_pairs × 6.' }),
          f('axis{n}.encoder.config.bandwidth', 'Bandwidth', { unit: 'Hz', decimals: 0, step: 10, tooltip: 'Encoder estimator bandwidth.' }),
          f('axis{n}.encoder.config.direction', 'Direction', { kind: 'integer', decimals: 0, step: 1, tooltip: '+1 or -1; set by calibration.' }),
        ],
      },
      {
        title: 'Calibration',
        fields: [
          f('axis{n}.encoder.config.use_index', 'Use Index', { kind: 'boolean', tooltip: 'Enable if your encoder has a Z/index pulse.' }),
          f('axis{n}.encoder.config.calib_range', 'Calibration Range', { unit: 'rad', decimals: 4, step: 0.001, importance: 'advanced', tooltip: 'Allowed CPR error during encoder calibration. Increase if calibration reports CPR-mismatch errors.' }),
          f('axis{n}.encoder.config.calib_scan_distance', 'Calib Scan Distance', { decimals: 0, step: 1, importance: 'advanced', tooltip: 'Electrical distance (rad) the motor turns while scanning for direction/offset. Default 16π.' }),
          f('axis{n}.encoder.config.calib_scan_omega', 'Calib Scan Omega', { unit: 'rad/s', decimals: 3, importance: 'advanced', tooltip: 'Speed of the encoder calibration scan. Lower if the motor jerks during calibration.' }),
          f('axis{n}.encoder.config.pre_calibrated', 'Pre-Calibrated', { kind: 'boolean', tooltip: 'Skip encoder offset calibration on startup. Set after a successful calibration.' }),
        ],
      },
    ],
    advanced: [
      {
        group: 'Quick Settings',
        fields: [
          f('axis{n}.encoder.config.enable_phase_interpolation', 'Phase Interpolation', { kind: 'boolean', importance: 'advanced', tooltip: 'Improve resolution using motor phase information.' }),
          f('axis{n}.encoder.config.ignore_illegal_hall_state', 'Ignore Illegal Hall State', { kind: 'boolean', importance: 'advanced', tooltip: 'Tolerate invalid Hall states (noisy sensors).' }),
          f('axis{n}.encoder.config.hall_polarity', 'Hall Polarity', { kind: 'integer', decimals: 0, importance: 'advanced', tooltip: 'Hall sensor wiring polarity; set automatically by Hall polarity calibration.' }),
        ],
      },
      {
        group: 'Index',
        fields: [
          f('axis{n}.encoder.config.use_index_offset', 'Use Index Offset', { kind: 'boolean', importance: 'advanced', tooltip: 'Apply a fixed offset to the index pulse position.' }),
          f('axis{n}.encoder.config.find_idx_on_lockin_only', 'Find Index on Lock-in Only', { kind: 'boolean', importance: 'advanced', tooltip: 'Only search for the index pulse during the lock-in spin, not during normal operation.' }),
          f('axis{n}.encoder.config.index_offset', 'Index Offset', { decimals: 4, importance: 'advanced', tooltip: 'Angle (rad) between the index pulse and the rotor zero, when Use Index Offset is enabled.' }),
        ],
      },
    ],
  },

  control: {
    axisScoped: true,
    groups: [
      {
        title: 'Control Mode',
        fields: [
          f('axis{n}.controller.config.control_mode', 'Control Mode', { kind: 'enum', enumName: 'ODrive.Controller.ControlMode', tooltip: 'What the controller regulates: voltage, torque, velocity or position.' }),
          f('axis{n}.controller.config.input_mode', 'Input Mode', { kind: 'enum', enumName: 'ODrive.Controller.InputMode', tooltip: 'How input commands are shaped before reaching the controller.' }),
        ],
      },
      {
        title: 'PID Gains',
        fields: [
          f('axis{n}.controller.config.pos_gain', 'Position Gain', { unit: '(turns/s)/turn', decimals: 3, step: 0.1, gain: 'posGain', tooltip: 'Proportional gain for position control.' }),
          f('axis{n}.controller.config.vel_gain', 'Velocity Gain', { unit: 'Nm/(turns/s)', decimals: 6, step: 0.001, gain: 'velGain', tooltip: 'Torque per velocity error.' }),
          f('axis{n}.controller.config.vel_integrator_gain', 'Velocity Integrator Gain', { unit: 'Nm·s/(turns/s)', decimals: 6, step: 0.001, gain: 'velIntegratorGain', tooltip: 'Integral gain; removes steady-state velocity error.' }),
        ],
      },
      {
        title: 'Limits',
        fields: [
          f('axis{n}.controller.config.vel_limit', 'Velocity Limit', { unit: 'turns/s', decimals: 2, step: 1, velocity: true, tooltip: 'Maximum allowed velocity. Start conservative (e.g. 5–20 turns/s) and raise once tuned.' }),
          f('axis{n}.controller.config.vel_ramp_rate', 'Velocity Ramp Rate', { unit: 'turns/s²', decimals: 2, step: 1, velocity: true, tooltip: 'Maximum rate of change of velocity setpoint.' }),
          f('axis{n}.controller.config.torque_ramp_rate', 'Torque Ramp Rate', { unit: 'Nm/s', decimals: 4, step: 0.01, tooltip: 'Maximum rate of change of torque setpoint.' }),
        ],
      },
    ],
    advanced: [
      {
        group: 'Behaviour',
        fields: [
          f('axis{n}.controller.config.circular_setpoints', 'Circular Setpoints', { kind: 'boolean', importance: 'advanced', tooltip: 'For continuous-rotation position control.' }),
          f('axis{n}.controller.config.inertia', 'System Inertia', { unit: 'Nm/(turns/s²)', decimals: 4, importance: 'advanced', tooltip: 'Feed-forward torque per unit acceleration. Leave 0 unless tuning aggressive motion.' }),
          f('axis{n}.controller.config.input_filter_bandwidth', 'Input Filter Bandwidth', { unit: 'Hz', decimals: 1, importance: 'advanced', tooltip: 'Smoothing of position/velocity setpoints (used by filtered input modes). Higher = snappier.' }),
          f('axis{n}.controller.config.vel_integrator_limit', 'Velocity Integrator Limit', { decimals: 2, importance: 'advanced', tooltip: 'Clamp on the velocity integrator to prevent wind-up. 0 = unlimited.' }),
        ],
      },
      {
        group: 'Error Detection',
        fields: [
          f('axis{n}.controller.config.enable_overspeed_error', 'Enable Overspeed Error', { kind: 'boolean', importance: 'advanced', tooltip: 'Fault if velocity exceeds 1.2× the velocity limit. Recommended on.' }),
          f('axis{n}.controller.config.enable_vel_limit', 'Enforce Velocity Limit', { kind: 'boolean', importance: 'advanced', tooltip: 'Actively clamp velocity to the limit instead of only faulting.' }),
        ],
      },
    ],
  },

  interface: {
    axisScoped: true,
    groups: [
      {
        title: 'CAN Bus',
        fields: [
          f('axis{n}.config.can.node_id', 'CAN Node ID', { kind: 'integer', decimals: 0, step: 1, min: 0, max: 127, tooltip: 'Unique node ID for this axis on the CAN bus.' }),
          f('axis{n}.config.can.heartbeat_rate_ms', 'Heartbeat Rate', { kind: 'integer', unit: 'ms', decimals: 0, step: 10, min: 0, tooltip: 'How often the axis broadcasts a heartbeat (0 to disable).' }),
        ],
      },
      {
        title: 'Safety',
        fields: [
          f('axis{n}.config.enable_watchdog', 'Enable Watchdog', { kind: 'boolean', tooltip: 'Disable the motor if no command is received within the timeout.' }),
          f('axis{n}.config.watchdog_timeout', 'Watchdog Timeout', { unit: 's', decimals: 1, step: 0.1, tooltip: 'Timeout before the watchdog trips.' }),
          f('axis{n}.config.enable_step_dir', 'Enable Step/Dir', { kind: 'boolean', tooltip: 'Use GPIO step/direction input (stepper replacement). Conflicts with UART A.' }),
          f('axis{n}.config.enable_sensorless_mode', 'Enable Sensorless', { kind: 'boolean', tooltip: 'Run without an encoder (requires good motor parameters).' }),
        ],
      },
    ],
    advanced: [
      {
        group: 'UART',
        fields: [
          f('config.enable_uart_a', 'Enable UART A (GPIO1/2)', { kind: 'boolean', importance: 'advanced', global: true, tooltip: 'Enable the UART serial interface on GPIO1/2. Conflicts with step/dir on those pins.' }),
          f('config.uart_a_baudrate', 'UART A Baudrate', { kind: 'integer', decimals: 0, importance: 'advanced', global: true, tooltip: 'Serial speed for UART A (e.g. 115200). Must match the connected host.' }),
        ],
      },
      {
        group: 'Step/Direction',
        fields: [
          f('axis{n}.config.step_dir_always_on', 'Step/Dir Always On', { kind: 'boolean', importance: 'advanced', tooltip: 'Keep step/direction input active even when the axis is idle.' }),
        ],
      },
    ],
  },
}

/**
 * Map a 0.5.x template path to the equivalent for the given firmware line.
 * 0.6.x moved motor config under `axis{n}.config.motor.*`.
 */
export function resolvePath(path, fwLine) {
  if (fwLine === 6) {
    return path.replace('axis{n}.motor.config.', 'axis{n}.config.motor.')
  }
  return path
}

/** Flatten all fields of a step (groups + advanced) into one list. */
export function stepFields(stepId) {
  const def = SCHEMA[stepId]
  if (!def) return []
  const fromGroups = def.groups.flatMap((g) => g.fields)
  const fromAdvanced = (def.advanced || []).flatMap((g) => g.fields)
  return [...fromGroups, ...fromAdvanced]
}

/** All template paths referenced by a step, mapped for the firmware line. */
export function stepPaths(stepId, fwLine) {
  return stepFields(stepId).map((field) => resolvePath(field.path, fwLine))
}
