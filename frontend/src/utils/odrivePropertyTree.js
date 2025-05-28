export const odrivePropertyTree = {
  system: {
    name: 'System Configuration',
    description: 'Top-level ODrive system settings and information',
    properties: {
      hw_version_major: { name: 'Hardware Version Major', description: 'Major hardware version', writable: false, type: 'number' },
      hw_version_minor: { name: 'Hardware Version Minor', description: 'Minor hardware version', writable: false, type: 'number' },
      hw_version_variant: { name: 'Hardware Variant', description: 'Hardware variant identifier', writable: false, type: 'number' },
      fw_version_major: { name: 'Firmware Version Major', description: 'Major firmware version', writable: false, type: 'number' },
      fw_version_minor: { name: 'Firmware Version Minor', description: 'Minor firmware version', writable: false, type: 'number' },
      fw_version_revision: { name: 'Firmware Revision', description: 'Firmware revision number', writable: false, type: 'number' },
      serial_number: { name: 'Serial Number', description: 'Device serial number', writable: false, type: 'number' },
      user_config_loaded: { name: 'User Config Loaded', description: 'Whether user configuration is loaded', writable: false, type: 'boolean' },
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'DC bus overvoltage protection level (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1 },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'DC bus undervoltage protection level (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1 },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Maximum positive DC current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Maximum negative DC current (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1 },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable brake resistor', writable: true, type: 'boolean' },
      brake_resistance: { name: 'Brake Resistance', description: 'Brake resistor resistance (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2 },
      gpio1_mode: { name: 'GPIO1 Mode', description: 'GPIO1 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio2_mode: { name: 'GPIO2 Mode', description: 'GPIO2 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio3_mode: { name: 'GPIO3 Mode', description: 'GPIO3 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio4_mode: { name: 'GPIO4 Mode', description: 'GPIO4 pin mode', writable: true, type: 'number', min: 0, max: 11 },
    }
  },

  axis0: {
    name: 'Axis 0',
    description: 'Motor axis 0 configuration and status',
    properties: {
      error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number' },
      current_state: { name: 'Current State', description: 'Current axis state', writable: false, type: 'number' },
      requested_state: { name: 'Requested State', description: 'Requested axis state', writable: true, type: 'number', min: 0, max: 11 },
      procedure_result: { name: 'Procedure Result', description: 'Last calibration/procedure result', writable: false, type: 'number' },
      watchdog_timeout: { name: 'Watchdog Timeout', description: 'Watchdog timeout (s)', writable: true, type: 'number', min: 0, max: 10, step: 0.1, decimals: 1 },
      step_dir_always_on: { name: 'Step/Dir Always On', description: 'Keep step/direction interface always active', writable: true, type: 'boolean' },
      startup_motor_calibration: { name: 'Startup Motor Calibration', description: 'Run motor calibration on startup', writable: true, type: 'boolean' },
      startup_encoder_index_search: { name: 'Startup Encoder Index Search', description: 'Search for encoder index on startup', writable: true, type: 'boolean' },
      startup_encoder_offset_calibration: { name: 'Startup Encoder Offset Calibration', description: 'Run encoder offset calibration on startup', writable: true, type: 'boolean' },
      startup_closed_loop_control: { name: 'Startup Closed Loop Control', description: 'Enable closed loop control on startup', writable: true, type: 'boolean' },
      startup_sensorless_control: { name: 'Startup Sensorless Control', description: 'Enable sensorless control on startup', writable: true, type: 'boolean' },
      enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean' },
      counts_per_step: { name: 'Counts Per Step', description: 'Encoder counts per step pulse', writable: true, type: 'number', min: 1, max: 1000, step: 1 },
    }
  },

  'axis0.motor': {
    name: 'Motor Configuration',
    description: 'Motor parameters and calibration settings',
    properties: {
      error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number' },
      current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3 },
      current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3 },
      DC_calib_phB: { name: 'DC Calibration Phase B', description: 'DC calibration value for phase B', writable: false, type: 'number', decimals: 3 },
      DC_calib_phC: { name: 'DC Calibration Phase C', description: 'DC calibration value for phase C', writable: false, type: 'number', decimals: 3 },
      phase_current_rev_gain: { name: 'Phase Current Reverse Gain', description: 'Reverse gain for phase current measurement', writable: false, type: 'number', decimals: 6 },
      thermal_current_lim: { name: 'Thermal Current Limit', description: 'Current limit due to thermal constraints (A)', writable: false, type: 'number', decimals: 3 },
      motor_type: { name: 'Motor Type', description: 'Motor type (0=HIGH_CURRENT, 1=GIMBAL)', writable: true, type: 'number', min: 0, max: 1 },
      pole_pairs: { name: 'Pole Pairs', description: 'Number of motor pole pairs', writable: true, type: 'number', min: 1, max: 50 },
      calibration_current: { name: 'Calibration Current', description: 'Current used for motor calibration (A)', writable: true, type: 'number', min: 1, max: 60, step: 0.1, decimals: 1 },
      resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Maximum voltage for resistance calibration (V)', writable: true, type: 'number', min: 1, max: 12, step: 0.1, decimals: 1 },
      phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', min: 0, max: 0.01, step: 0.000001, decimals: 6 },
      phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 3 },
      torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
      direction: { name: 'Direction', description: 'Motor direction (1 or -1)', writable: true, type: 'number', min: -1, max: 1 },
      motor_type: { name: 'Motor Type', description: 'Motor type configuration', writable: true, type: 'number', min: 0, max: 1 },
      current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      current_lim_margin: { name: 'Current Limit Margin', description: 'Current limit safety margin (A)', writable: true, type: 'number', min: 0, max: 10, step: 0.1, decimals: 1 },
      torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', min: 0, max: 100, step: 0.1, decimals: 3 },
      inverter_temp_limit_lower: { name: 'Inverter Temp Limit Lower', description: 'Lower inverter temperature limit (°C)', writable: true, type: 'number', min: 40, max: 120, step: 1 },
      inverter_temp_limit_upper: { name: 'Inverter Temp Limit Upper', description: 'Upper inverter temperature limit (°C)', writable: true, type: 'number', min: 60, max: 140, step: 1 },
    }
  },

  'axis0.controller': {
    name: 'Controller Configuration',
    description: 'Control loop parameters and settings',
    properties: {
      error: { name: 'Controller Error', description: 'Current controller error flags', writable: false, type: 'number' },
      pos_setpoint: { name: 'Position Setpoint', description: 'Current position setpoint (counts)', writable: false, type: 'number', decimals: 3 },
      vel_setpoint: { name: 'Velocity Setpoint', description: 'Current velocity setpoint (counts/s)', writable: false, type: 'number', decimals: 3 },
      torque_setpoint: { name: 'Torque Setpoint', description: 'Current torque setpoint (Nm)', writable: false, type: 'number', decimals: 3 },
      trajectory_done: { name: 'Trajectory Done', description: 'Whether trajectory execution is complete', writable: false, type: 'boolean' },
      control_mode: { name: 'Control Mode', description: 'Control mode (0=VOLTAGE, 1=TORQUE, 2=VELOCITY, 3=POSITION)', writable: true, type: 'number', min: 0, max: 3 },
      input_mode: { name: 'Input Mode', description: 'Input mode (0=INACTIVE, 1=PASSTHROUGH, 2=VEL_RAMP, 3=POS_FILTER, 4=MIX_CHANNELS, 5=TRAP_TRAJ, 6=TORQUE_RAMP, 7=MIRROR)', writable: true, type: 'number', min: 0, max: 7 },
      pos_gain: { name: 'Position Gain', description: 'Position controller proportional gain', writable: true, type: 'number', min: 0, max: 1000, step: 0.1, decimals: 3 },
      vel_gain: { name: 'Velocity Gain', description: 'Velocity controller proportional gain', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 6 },
      vel_integrator_gain: { name: 'Velocity Integrator Gain', description: 'Velocity controller integral gain', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 6 },
      vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity (counts/s)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      vel_limit_tolerance: { name: 'Velocity Limit Tolerance', description: 'Velocity limit tolerance factor', writable: true, type: 'number', min: 1, max: 2, step: 0.01, decimals: 2 },
      vel_ramp_rate: { name: 'Velocity Ramp Rate', description: 'Velocity ramp rate (counts/s²)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      torque_ramp_rate: { name: 'Torque Ramp Rate', description: 'Torque ramp rate (Nm/s)', writable: true, type: 'number', min: 0, max: 1000, step: 0.01, decimals: 3 },
      circular_setpoints: { name: 'Circular Setpoints', description: 'Enable circular position setpoints', writable: true, type: 'boolean' },
      circular_setpoint_range: { name: 'Circular Setpoint Range', description: 'Range for circular setpoints (counts)', writable: true, type: 'number', min: 1, max: 1000000, step: 1 },
      inertia: { name: 'Inertia', description: 'Load inertia estimate (kg⋅m²)', writable: true, type: 'number', min: 0, max: 1, step: 0.000001, decimals: 6 },
      input_filter_bandwidth: { name: 'Input Filter Bandwidth', description: 'Input filter bandwidth (Hz)', writable: true, type: 'number', min: 0, max: 1000, step: 0.1, decimals: 1 },
    }
  },

  'axis0.encoder': {
    name: 'Encoder Configuration',
    description: 'Encoder settings and calibration data',
    properties: {
      error: { name: 'Encoder Error', description: 'Current encoder error flags', writable: false, type: 'number' },
      pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (counts)', writable: false, type: 'number', decimals: 3 },
      vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3 },
      pos_cpr: { name: 'Position CPR', description: 'Position in counts per revolution', writable: false, type: 'number', decimals: 3 },
      hall_state: { name: 'Hall State', description: 'Current Hall sensor state', writable: false, type: 'number' },
      vel_estimate_counts: { name: 'Velocity Estimate Counts', description: 'Velocity estimate in raw counts', writable: false, type: 'number', decimals: 3 },
      pos_estimate_counts: { name: 'Position Estimate Counts', description: 'Position estimate in raw counts', writable: false, type: 'number', decimals: 3 },
      pos_circular: { name: 'Position Circular', description: 'Circular position estimate (counts)', writable: false, type: 'number', decimals: 3 },
      phase: { name: 'Phase', description: 'Current electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
      phase_vel: { name: 'Phase Velocity', description: 'Phase velocity (rad/s)', writable: false, type: 'number', decimals: 3 },
      shadow_count: { name: 'Shadow Count', description: 'Shadow count register', writable: false, type: 'number' },
      count_in_cpr: { name: 'Count in CPR', description: 'Count within one CPR cycle', writable: false, type: 'number' },
      interpolation: { name: 'Interpolation', description: 'Encoder interpolation value', writable: false, type: 'number', decimals: 6 },
      index_found: { name: 'Index Found', description: 'Whether encoder index was found', writable: false, type: 'boolean' },
      is_ready: { name: 'Is Ready', description: 'Whether encoder is ready for use', writable: false, type: 'boolean' },
      mode: { name: 'Encoder Mode', description: 'Encoder mode (0=HALL, 1=INCREMENTAL, 2=SINCOS)', writable: true, type: 'number', min: 0, max: 2 },
      use_index: { name: 'Use Index', description: 'Use encoder index signal', writable: true, type: 'boolean' },
      find_idx_on_lockin_only: { name: 'Find Index on Lockin Only', description: 'Only find index during lockin', writable: true, type: 'boolean' },
      abs_spi_cs_gpio_pin: { name: 'Absolute SPI CS GPIO Pin', description: 'GPIO pin for absolute encoder SPI CS', writable: true, type: 'number', min: 0, max: 16 },
      zero_count_on_find_idx: { name: 'Zero Count on Find Index', description: 'Reset count to zero when index found', writable: true, type: 'boolean' },
      cpr: { name: 'CPR', description: 'Counts per revolution', writable: true, type: 'number', min: 1, max: 1000000, step: 1 },
      offset: { name: 'Offset', description: 'Encoder offset (counts)', writable: true, type: 'number', min: -1000000, max: 1000000, step: 1 },
      pre_calibrated: { name: 'Pre-calibrated', description: 'Encoder is pre-calibrated', writable: true, type: 'boolean' },
      offset_float: { name: 'Offset Float', description: 'Floating point encoder offset', writable: true, type: 'number', min: -1000000, max: 1000000, step: 0.001, decimals: 6 },
      enable_phase_interpolation: { name: 'Enable Phase Interpolation', description: 'Enable phase interpolation', writable: true, type: 'boolean' },
      bandwidth: { name: 'Bandwidth', description: 'Encoder bandwidth (Hz)', writable: true, type: 'number', min: 100, max: 10000, step: 10 },
      calib_range: { name: 'Calibration Range', description: 'Range for calibration (fraction of full range)', writable: true, type: 'number', min: 0.01, max: 1, step: 0.01, decimals: 3 },
      calib_scan_distance: { name: 'Calibration Scan Distance', description: 'Distance to scan during calibration (counts)', writable: true, type: 'number', min: 1000, max: 100000, step: 100 },
      calib_scan_omega: { name: 'Calibration Scan Omega', description: 'Angular velocity during calibration scan (rad/s)', writable: true, type: 'number', min: 1, max: 50, step: 0.1, decimals: 3 },
      idx_search_unidirectional: { name: 'Index Search Unidirectional', description: 'Search for index in one direction only', writable: true, type: 'boolean' },
      ignore_illegal_hall_state: { name: 'Ignore Illegal Hall State', description: 'Ignore illegal Hall sensor states', writable: true, type: 'boolean' },
    }
  },

  'axis0.sensorless_estimator': {
    name: 'Sensorless Estimator',
    description: 'Sensorless control estimator parameters',
    properties: {
      error: { name: 'Sensorless Error', description: 'Current sensorless estimator error flags', writable: false, type: 'number' },
      phase: { name: 'Phase', description: 'Estimated electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
      pll_pos: { name: 'PLL Position', description: 'PLL position estimate (rad)', writable: false, type: 'number', decimals: 6 },
      vel_estimate: { name: 'Velocity Estimate', description: 'Estimated velocity (counts/s)', writable: false, type: 'number', decimals: 3 },
      pm_flux_linkage: { name: 'PM Flux Linkage', description: 'Permanent magnet flux linkage (Wb)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
      observer_gain: { name: 'Observer Gain', description: 'Sensorless observer gain', writable: true, type: 'number', min: 0, max: 10000, step: 1 },
      pll_bandwidth: { name: 'PLL Bandwidth', description: 'PLL bandwidth (Hz)', writable: true, type: 'number', min: 10, max: 1000, step: 1 },
      pm_flux_linkage: { name: 'PM Flux Linkage', description: 'Permanent magnet flux linkage', writable: true, type: 'number', min: 0, max: 1, step: 0.000001, decimals: 6 },
    }
  },

  'axis0.trap_traj': {
    name: 'Trapezoidal Trajectory',
    description: 'Trapezoidal trajectory planner settings',
    properties: {
      vel_limit: { name: 'Velocity Limit', description: 'Trajectory velocity limit (counts/s)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      accel_limit: { name: 'Acceleration Limit', description: 'Trajectory acceleration limit (counts/s²)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      decel_limit: { name: 'Deceleration Limit', description: 'Trajectory deceleration limit (counts/s²)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      A_per_css: { name: 'A per CSS', description: 'A per CSS parameter', writable: true, type: 'number', min: 0, max: 1000, step: 0.1, decimals: 3 },
    }
  },

  'axis0.min_endstop': {
    name: 'Minimum Endstop',
    description: 'Minimum endstop configuration',
    properties: {
      gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for minimum endstop', writable: true, type: 'number', min: 0, max: 16 },
      enabled: { name: 'Enabled', description: 'Enable minimum endstop', writable: true, type: 'boolean' },
      offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', min: -1000000, max: 1000000, step: 1 },
      is_pressed: { name: 'Is Pressed', description: 'Current endstop state', writable: false, type: 'boolean' },
    }
  },

  'axis0.max_endstop': {
    name: 'Maximum Endstop',
    description: 'Maximum endstop configuration',
    properties: {
      gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for maximum endstop', writable: true, type: 'number', min: 0, max: 16 },
      enabled: { name: 'Enabled', description: 'Enable maximum endstop', writable: true, type: 'boolean' },
      offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', min: -1000000, max: 1000000, step: 1 },
      is_pressed: { name: 'Is Pressed', description: 'Current endstop state', writable: false, type: 'boolean' },
    }
  },

  'axis0.mechanical_brake': {
    name: 'Mechanical Brake',
    description: 'Mechanical brake control settings',
    properties: {
      gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for brake control', writable: true, type: 'number', min: 0, max: 16 },
      is_armed: { name: 'Is Armed', description: 'Whether brake is armed', writable: false, type: 'boolean' },
    }
  },

  can: {
    name: 'CAN Bus Configuration',
    description: 'CAN bus communication settings',
    properties: {
      node_id: { name: 'Node ID', description: 'CAN node ID for axis0', writable: true, type: 'number', min: 0, max: 63 },
      node_id_extended: { name: 'Extended Node ID', description: 'Extended CAN node ID', writable: true, type: 'boolean' },
      is_extended: { name: 'Is Extended', description: 'Use extended CAN frames', writable: true, type: 'boolean' },
      heartbeat_rate_ms: { name: 'Heartbeat Rate', description: 'CAN heartbeat rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
    }
  },

  test_property: {
    name: 'Test Property',
    description: 'Test property for debugging',
    properties: {
      flt: { name: 'Float Test', description: 'Test floating point property', writable: true, type: 'number', min: -1000, max: 1000, step: 0.1, decimals: 3 },
    }
  }
}