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
      fw_version_unreleased: { name: 'Firmware Unreleased', description: 'Unreleased firmware flag', writable: false, type: 'boolean' },
      serial_number: { name: 'Serial Number', description: 'Device serial number', writable: false, type: 'number' },
      user_config_loaded: { name: 'User Config Loaded', description: 'Whether user configuration is loaded', writable: false, type: 'boolean' },
      otp_valid: { name: 'OTP Valid', description: 'One-time programmable memory validity', writable: false, type: 'boolean' },
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'DC bus overvoltage protection level (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1 },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'DC bus undervoltage protection level (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1 },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Maximum positive DC current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Maximum negative DC current (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1 },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable brake resistor', writable: true, type: 'boolean' },
      brake_resistance: { name: 'Brake Resistance', description: 'Brake resistor resistance (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2 },
      dc_bus_voltage: { name: 'DC Bus Voltage', description: 'Current DC bus voltage (V)', writable: false, type: 'number', decimals: 2 },
      ibus: { name: 'DC Bus Current', description: 'Current DC bus current (A)', writable: false, type: 'number', decimals: 3 },
      ibus_report_filter_k: { name: 'Ibus Report Filter K', description: 'DC bus current filter constant', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
      vbus_voltage: { name: 'VBus Voltage', description: 'VBus voltage measurement (V)', writable: false, type: 'number', decimals: 2 },
      enable_uart_a: { name: 'Enable UART A', description: 'Enable UART A interface', writable: true, type: 'boolean' },
      uart_a_baudrate: { name: 'UART A Baudrate', description: 'UART A communication speed', writable: true, type: 'number', min: 9600, max: 921600 },
      uart0_protocol: { name: 'UART0 Protocol', description: 'UART0 protocol selection', writable: true, type: 'number', min: 0, max: 3 },
      enable_uart_b: { name: 'Enable UART B', description: 'Enable UART B interface', writable: true, type: 'boolean' },
      uart_b_baudrate: { name: 'UART B Baudrate', description: 'UART B communication speed', writable: true, type: 'number', min: 9600, max: 921600 },
      uart1_protocol: { name: 'UART1 Protocol', description: 'UART1 protocol selection', writable: true, type: 'number', min: 0, max: 3 },
      gpio1_mode: { name: 'GPIO1 Mode', description: 'GPIO1 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio2_mode: { name: 'GPIO2 Mode', description: 'GPIO2 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio3_mode: { name: 'GPIO3 Mode', description: 'GPIO3 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio4_mode: { name: 'GPIO4 Mode', description: 'GPIO4 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio1_pwm_mapping: { name: 'GPIO1 PWM Mapping', description: 'GPIO1 PWM input mapping', writable: true, type: 'number', min: 0, max: 3 },
      gpio2_pwm_mapping: { name: 'GPIO2 PWM Mapping', description: 'GPIO2 PWM input mapping', writable: true, type: 'number', min: 0, max: 3 },
      gpio3_pwm_mapping: { name: 'GPIO3 PWM Mapping', description: 'GPIO3 PWM input mapping', writable: true, type: 'number', min: 0, max: 3 },
      gpio4_pwm_mapping: { name: 'GPIO4 PWM Mapping', description: 'GPIO4 PWM input mapping', writable: true, type: 'number', min: 0, max: 3 },
      analog_reading_gpio3: { name: 'Analog Reading GPIO3', description: 'Analog voltage reading on GPIO3 (V)', writable: false, type: 'number', decimals: 3 },
      analog_reading_gpio4: { name: 'Analog Reading GPIO4', description: 'Analog voltage reading on GPIO4 (V)', writable: false, type: 'number', decimals: 3 },
      gpio1_analog_mapping: { name: 'GPIO1 Analog Mapping', description: 'GPIO1 analog input mapping', writable: true, type: 'number', min: 0, max: 3 },
      gpio2_analog_mapping: { name: 'GPIO2 Analog Mapping', description: 'GPIO2 analog input mapping', writable: true, type: 'number', min: 0, max: 3 },
      gpio3_analog_mapping: { name: 'GPIO3 Analog Mapping', description: 'GPIO3 analog input mapping', writable: true, type: 'number', min: 0, max: 3 },
      gpio4_analog_mapping: { name: 'GPIO4 Analog Mapping', description: 'GPIO4 analog input mapping', writable: true, type: 'number', min: 0, max: 3 },
      usb_output_enabled: { name: 'USB Output Enabled', description: 'Enable USB output', writable: true, type: 'boolean' },
    }
  },

  axis0: {
    name: 'Axis 0',
    description: 'Motor axis 0 configuration and status',
    properties: {
      error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number' },
      step_count: { name: 'Step Count', description: 'Step/direction step count', writable: false, type: 'number' },
      pos_setpoint: { name: 'Position Setpoint', description: 'Position setpoint (counts)', writable: false, type: 'number', decimals: 3 },
      pos_vel_setpoint: { name: 'Position Velocity Setpoint', description: 'Position mode velocity setpoint (counts/s)', writable: false, type: 'number', decimals: 3 },
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
      startup_homing: { name: 'Startup Homing', description: 'Run homing sequence on startup', writable: true, type: 'boolean' },
      enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean' },
      step_gpio_pin: { name: 'Step GPIO Pin', description: 'GPIO pin for step input', writable: true, type: 'number', min: 0, max: 16 },
      dir_gpio_pin: { name: 'Direction GPIO Pin', description: 'GPIO pin for direction input', writable: true, type: 'number', min: 0, max: 16 },
      counts_per_step: { name: 'Counts Per Step', description: 'Encoder counts per step pulse', writable: true, type: 'number', min: 1, max: 1000, step: 1 },
      enable_sensorless_mode: { name: 'Enable Sensorless Mode', description: 'Enable sensorless control mode', writable: true, type: 'boolean' },
      enable_watchdog: { name: 'Enable Watchdog', description: 'Enable watchdog timer', writable: true, type: 'boolean' },
      can_node_id: { name: 'CAN Node ID', description: 'CAN bus node ID', writable: true, type: 'number', min: 0, max: 63 },
      can_node_id_extended: { name: 'CAN Extended ID', description: 'Use CAN extended frame format', writable: true, type: 'boolean' },
      can_heartbeat_rate_ms: { name: 'CAN Heartbeat Rate', description: 'CAN heartbeat rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
    }
  },

  'axis0.motor': {
    name: 'Motor Configuration',
    description: 'Motor parameters and calibration settings',
    properties: {
      error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number' },
      armed_state: { name: 'Armed State', description: 'Motor armed state', writable: false, type: 'number' },
      is_calibrated: { name: 'Is Calibrated', description: 'Motor calibration status', writable: false, type: 'boolean' },
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
      current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      current_lim_margin: { name: 'Current Limit Margin', description: 'Current limit safety margin (A)', writable: true, type: 'number', min: 0, max: 10, step: 0.1, decimals: 1 },
      torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', min: 0, max: 100, step: 0.1, decimals: 3 },
      inverter_temp_limit_lower: { name: 'Inverter Temp Limit Lower', description: 'Lower inverter temperature limit (°C)', writable: true, type: 'number', min: 40, max: 120, step: 1 },
      inverter_temp_limit_upper: { name: 'Inverter Temp Limit Upper', description: 'Upper inverter temperature limit (°C)', writable: true, type: 'number', min: 60, max: 140, step: 1 },
      requested_current_range: { name: 'Requested Current Range', description: 'Requested current measurement range (A)', writable: true, type: 'number', min: 10, max: 80, step: 1 },
      current_control_bandwidth: { name: 'Current Control Bandwidth', description: 'Current controller bandwidth (Hz)', writable: true, type: 'number', min: 100, max: 2000, step: 10 },
      acim_slip_velocity: { name: 'ACIM Slip Velocity', description: 'AC induction motor slip velocity (rad/s)', writable: true, type: 'number', min: 0, max: 100, step: 0.1, decimals: 3 },
      acim_gain_min_flux: { name: 'ACIM Gain Min Flux', description: 'AC induction motor minimum flux gain', writable: true, type: 'number', min: 0, max: 100, step: 0.1, decimals: 3 },
      acim_autoflux_min_id: { name: 'ACIM Autoflux Min Id', description: 'AC induction motor autoflux minimum Id (A)', writable: true, type: 'number', min: 0, max: 10, step: 0.1, decimals: 3 },
      acim_autoflux_enable: { name: 'ACIM Autoflux Enable', description: 'Enable AC induction motor autoflux', writable: true, type: 'boolean' },
      acim_autoflux_attack_gain: { name: 'ACIM Autoflux Attack Gain', description: 'AC induction motor autoflux attack gain', writable: true, type: 'number', min: 0, max: 100, step: 0.1, decimals: 3 },
      acim_autoflux_decay_gain: { name: 'ACIM Autoflux Decay Gain', description: 'AC induction motor autoflux decay gain', writable: true, type: 'number', min: 0, max: 100, step: 0.1, decimals: 3 },
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
      homing_speed: { name: 'Homing Speed', description: 'Homing sequence speed (counts/s)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      enable_gain_scheduling: { name: 'Enable Gain Scheduling', description: 'Enable velocity-dependent gain scheduling', writable: true, type: 'boolean' },
      gain_scheduling_width: { name: 'Gain Scheduling Width', description: 'Gain scheduling velocity width (counts/s)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      enable_vel_limit: { name: 'Enable Velocity Limit', description: 'Enable velocity limiting', writable: true, type: 'boolean' },
      enable_overspeed_error: { name: 'Enable Overspeed Error', description: 'Enable overspeed error detection', writable: true, type: 'boolean' },
      axis_to_mirror: { name: 'Axis to Mirror', description: 'Axis number to mirror (for MIRROR input mode)', writable: true, type: 'number', min: 0, max: 1 },
      mirror_ratio: { name: 'Mirror Ratio', description: 'Mirroring ratio', writable: true, type: 'number', min: -10, max: 10, step: 0.01, decimals: 3 },
      load_encoder_axis: { name: 'Load Encoder Axis', description: 'Axis number for load encoder', writable: true, type: 'number', min: 0, max: 1 },
      input_pos: { name: 'Input Position', description: 'Input position value (counts)', writable: true, type: 'number', min: -1000000, max: 1000000, step: 1 },
      input_vel: { name: 'Input Velocity', description: 'Input velocity value (counts/s)', writable: true, type: 'number', min: -1000000, max: 1000000, step: 1 },
      input_torque: { name: 'Input Torque', description: 'Input torque value (Nm)', writable: true, type: 'number', min: -100, max: 100, step: 0.01, decimals: 3 },
    }
  },

  'axis0.encoder': {
    name: 'Encoder Configuration',
    description: 'Encoder settings and calibration data',
    properties: {
      error: { name: 'Encoder Error', description: 'Current encoder error flags', writable: false, type: 'number' },
      pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (counts)', writable: false, type: 'number', decimals: 3 },
      pos_estimate_counts: { name: 'Position Estimate Counts', description: 'Position estimate in raw counts', writable: false, type: 'number', decimals: 3 },
      pos_circular: { name: 'Position Circular', description: 'Circular position estimate (counts)', writable: false, type: 'number', decimals: 3 },
      vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3 },
      vel_estimate_counts: { name: 'Velocity Estimate Counts', description: 'Velocity estimate in raw counts', writable: false, type: 'number', decimals: 3 },
      pos_cpr: { name: 'Position CPR', description: 'Position in counts per revolution', writable: false, type: 'number', decimals: 3 },
      hall_state: { name: 'Hall State', description: 'Current Hall sensor state', writable: false, type: 'number' },
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
      sincos_gpio_pin_sin: { name: 'SinCos GPIO Pin Sin', description: 'GPIO pin for Sin signal in SinCos mode', writable: true, type: 'number', min: 0, max: 16 },
      sincos_gpio_pin_cos: { name: 'SinCos GPIO Pin Cos', description: 'GPIO pin for Cos signal in SinCos mode', writable: true, type: 'number', min: 0, max: 16 },
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

  'axis0.can': {
    name: 'CAN Bus Configuration', 
    description: 'CAN bus communication settings for axis0',
    properties: {
      node_id: { name: 'Node ID', description: 'CAN node ID for axis0', writable: true, type: 'number', min: 0, max: 63 },
      is_extended: { name: 'Is Extended', description: 'Use extended CAN frames', writable: true, type: 'boolean' },
      heartbeat_rate_ms: { name: 'Heartbeat Rate', description: 'CAN heartbeat rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      encoder_rate_ms: { name: 'Encoder Rate', description: 'Encoder data broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      motor_error_rate_ms: { name: 'Motor Error Rate', description: 'Motor error broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      encoder_error_rate_ms: { name: 'Encoder Error Rate', description: 'Encoder error broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      controller_error_rate_ms: { name: 'Controller Error Rate', description: 'Controller error broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
    }
  },

  can: {
    name: 'CAN Bus Global Configuration',
    description: 'Global CAN bus settings',
    properties: {
      baud_rate: { name: 'Baud Rate', description: 'CAN bus baud rate', writable: true, type: 'number', min: 125000, max: 1000000 },
    }
  },

  'axis0.lockin': {
    name: 'Lockin Configuration',
    description: 'Motor lockin procedure settings',
    properties: {
      current: { name: 'Lockin Current', description: 'Current used during lockin (A)', writable: true, type: 'number', min: 0, max: 20, step: 0.1, decimals: 1 },
      ramp_time: { name: 'Ramp Time', description: 'Time to ramp current during lockin (s)', writable: true, type: 'number', min: 0.1, max: 10, step: 0.1, decimals: 1 },
      ramp_distance: { name: 'Ramp Distance', description: 'Distance to travel during lockin ramp (counts)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      accel: { name: 'Acceleration', description: 'Acceleration during lockin (counts/s²)', writable: true, type: 'number', min: 1, max: 100000, step: 1 },
      vel: { name: 'Velocity', description: 'Velocity during lockin (counts/s)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      finish_distance: { name: 'Finish Distance', description: 'Distance to travel at end of lockin (counts)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      finish_on_vel: { name: 'Finish on Velocity', description: 'Finish lockin based on velocity', writable: true, type: 'boolean' },
      finish_on_distance: { name: 'Finish on Distance', description: 'Finish lockin based on distance', writable: true, type: 'boolean' },
      finish_on_enc_idx: { name: 'Finish on Encoder Index', description: 'Finish lockin when encoder index found', writable: true, type: 'boolean' },
    }
  },

  'axis0.task_times': {
    name: 'Task Timing',
    description: 'Task execution timing information',
    properties: {
      thermistor_update: { name: 'Thermistor Update', description: 'Thermistor update task time (µs)', writable: false, type: 'number', decimals: 1 },
      encoder_update: { name: 'Encoder Update', description: 'Encoder update task time (µs)', writable: false, type: 'number', decimals: 1 },
      sensorless_estimator_update: { name: 'Sensorless Estimator Update', description: 'Sensorless estimator task time (µs)', writable: false, type: 'number', decimals: 1 },
      endstop_update: { name: 'Endstop Update', description: 'Endstop update task time (µs)', writable: false, type: 'number', decimals: 1 },
      can_heartbeat: { name: 'CAN Heartbeat', description: 'CAN heartbeat task time (µs)', writable: false, type: 'number', decimals: 1 },
      controller_update: { name: 'Controller Update', description: 'Controller update task time (µs)', writable: false, type: 'number', decimals: 1 },
      open_loop_controller_update: { name: 'Open Loop Controller Update', description: 'Open loop controller task time (µs)', writable: false, type: 'number', decimals: 1 },
      acim_estimator_update: { name: 'ACIM Estimator Update', description: 'AC induction motor estimator task time (µs)', writable: false, type: 'number', decimals: 1 },
      motor_update: { name: 'Motor Update', description: 'Motor update task time (µs)', writable: false, type: 'number', decimals: 1 },
      current_controller_update: { name: 'Current Controller Update', description: 'Current controller task time (µs)', writable: false, type: 'number', decimals: 1 },
      dc_calib: { name: 'DC Calibration', description: 'DC calibration task time (µs)', writable: false, type: 'number', decimals: 1 },
    }
  },

  // Axis 1 - same structure as axis 0
  axis1: {
    name: 'Axis 1',
    description: 'Motor axis 1 configuration and status',
    properties: {
      error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number' },
      step_count: { name: 'Step Count', description: 'Step/direction step count', writable: false, type: 'number' },
      pos_setpoint: { name: 'Position Setpoint', description: 'Position setpoint (counts)', writable: false, type: 'number', decimals: 3 },
      pos_vel_setpoint: { name: 'Position Velocity Setpoint', description: 'Position mode velocity setpoint (counts/s)', writable: false, type: 'number', decimals: 3 },
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
      startup_homing: { name: 'Startup Homing', description: 'Run homing sequence on startup', writable: true, type: 'boolean' },
      enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean' },
      step_gpio_pin: { name: 'Step GPIO Pin', description: 'GPIO pin for step input', writable: true, type: 'number', min: 0, max: 16 },
      dir_gpio_pin: { name: 'Direction GPIO Pin', description: 'GPIO pin for direction input', writable: true, type: 'number', min: 0, max: 16 },
      counts_per_step: { name: 'Counts Per Step', description: 'Encoder counts per step pulse', writable: true, type: 'number', min: 1, max: 1000, step: 1 },
      enable_sensorless_mode: { name: 'Enable Sensorless Mode', description: 'Enable sensorless control mode', writable: true, type: 'boolean' },
      enable_watchdog: { name: 'Enable Watchdog', description: 'Enable watchdog timer', writable: true, type: 'boolean' },
      can_node_id: { name: 'CAN Node ID', description: 'CAN bus node ID', writable: true, type: 'number', min: 0, max: 63 },
      can_node_id_extended: { name: 'CAN Extended ID', description: 'Use CAN extended frame format', writable: true, type: 'boolean' },
      can_heartbeat_rate_ms: { name: 'CAN Heartbeat Rate', description: 'CAN heartbeat rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
    }
  },

  'axis1.motor': {
    name: 'Motor Configuration (Axis 1)',
    description: 'Motor parameters and calibration settings for axis 1',
    properties: {
      error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number' },
      armed_state: { name: 'Armed State', description: 'Motor armed state', writable: false, type: 'number' },
      is_calibrated: { name: 'Is Calibrated', description: 'Motor calibration status', writable: false, type: 'boolean' },
      current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3 },
      current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3 },
      motor_type: { name: 'Motor Type', description: 'Motor type (0=HIGH_CURRENT, 1=GIMBAL)', writable: true, type: 'number', min: 0, max: 1 },
      pole_pairs: { name: 'Pole Pairs', description: 'Number of motor pole pairs', writable: true, type: 'number', min: 1, max: 50 },
      calibration_current: { name: 'Calibration Current', description: 'Current used for motor calibration (A)', writable: true, type: 'number', min: 1, max: 60, step: 0.1, decimals: 1 },
      resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Maximum voltage for resistance calibration (V)', writable: true, type: 'number', min: 1, max: 12, step: 0.1, decimals: 1 },
      phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', min: 0, max: 0.01, step: 0.000001, decimals: 6 },
      phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 3 },
      torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
      direction: { name: 'Direction', description: 'Motor direction (1 or -1)', writable: true, type: 'number', min: -1, max: 1 },
      current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      current_lim_margin: { name: 'Current Limit Margin', description: 'Current limit safety margin (A)', writable: true, type: 'number', min: 0, max: 10, step: 0.1, decimals: 1 },
      torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', min: 0, max: 100, step: 0.1, decimals: 3 },
      inverter_temp_limit_lower: { name: 'Inverter Temp Limit Lower', description: 'Lower inverter temperature limit (°C)', writable: true, type: 'number', min: 40, max: 120, step: 1 },
      inverter_temp_limit_upper: { name: 'Inverter Temp Limit Upper', description: 'Upper inverter temperature limit (°C)', writable: true, type: 'number', min: 60, max: 140, step: 1 },
      current_control_bandwidth: { name: 'Current Control Bandwidth', description: 'Current controller bandwidth (Hz)', writable: true, type: 'number', min: 100, max: 2000, step: 10 },
    }
  },


  'axis1.encoder': {
    name: 'Encoder Configuration (Axis 1)',
    description: 'Encoder settings and calibration data for axis 1',
    properties: {
      error: { name: 'Encoder Error', description: 'Current encoder error flags', writable: false, type: 'number' },
      pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (counts)', writable: false, type: 'number', decimals: 3 },
      vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3 },
      pos_cpr: { name: 'Position CPR', description: 'Position in counts per revolution', writable: false, type: 'number', decimals: 3 },
      hall_state: { name: 'Hall State', description: 'Current Hall sensor state', writable: false, type: 'number' },
      phase: { name: 'Phase', description: 'Current electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
      is_ready: { name: 'Is Ready', description: 'Whether encoder is ready for use', writable: false, type: 'boolean' },
      index_found: { name: 'Index Found', description: 'Whether encoder index was found', writable: false, type: 'boolean' },
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
      sincos_gpio_pin_sin: { name: 'SinCos GPIO Pin Sin', description: 'GPIO pin for Sin signal in SinCos mode', writable: true, type: 'number', min: 0, max: 16 },
      sincos_gpio_pin_cos: { name: 'SinCos GPIO Pin Cos', description: 'GPIO pin for Cos signal in SinCos mode', writable: true, type: 'number', min: 0, max: 16 },
    }
  },

  // Additional sections for comprehensive ODrive v0.5.6 coverage
  'axis1.sensorless_estimator': {
    name: 'Sensorless Estimator (Axis 1)',
    description: 'Sensorless control estimator parameters for axis 1',
    properties: {
      error: { name: 'Sensorless Error', description: 'Current sensorless estimator error flags', writable: false, type: 'number' },
      phase: { name: 'Phase', description: 'Estimated electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
      pll_pos: { name: 'PLL Position', description: 'PLL position estimate (rad)', writable: false, type: 'number', decimals: 6 },
      vel_estimate: { name: 'Velocity Estimate', description: 'Estimated velocity (counts/s)', writable: false, type: 'number', decimals: 3 },
      pm_flux_linkage: { name: 'PM Flux Linkage', description: 'Permanent magnet flux linkage (Wb)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
      observer_gain: { name: 'Observer Gain', description: 'Sensorless observer gain', writable: true, type: 'number', min: 0, max: 10000, step: 1 },
      pll_bandwidth: { name: 'PLL Bandwidth', description: 'PLL bandwidth (Hz)', writable: true, type: 'number', min: 10, max: 1000, step: 1 },
    }
  },

  'axis1.trap_traj': {
    name: 'Trapezoidal Trajectory (Axis 1)',
    description: 'Trapezoidal trajectory planner settings for axis 1',
    properties: {
      vel_limit: { name: 'Velocity Limit', description: 'Trajectory velocity limit (counts/s)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      accel_limit: { name: 'Acceleration Limit', description: 'Trajectory acceleration limit (counts/s²)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      decel_limit: { name: 'Deceleration Limit', description: 'Trajectory deceleration limit (counts/s²)', writable: true, type: 'number', min: 0, max: 1000000, step: 1 },
      A_per_css: { name: 'A per CSS', description: 'A per CSS parameter', writable: true, type: 'number', min: 0, max: 1000, step: 0.1, decimals: 3 },
    }
  },

  'axis1.min_endstop': {
    name: 'Minimum Endstop (Axis 1)',
    description: 'Minimum endstop configuration for axis 1',
    properties: {
      gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for minimum endstop', writable: true, type: 'number', min: 0, max: 16 },
      enabled: { name: 'Enabled', description: 'Enable minimum endstop', writable: true, type: 'boolean' },
      offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', min: -1000000, max: 1000000, step: 1 },
      is_pressed: { name: 'Is Pressed', description: 'Current endstop state', writable: false, type: 'boolean' },
    }
  },

  'axis1.max_endstop': {
    name: 'Maximum Endstop (Axis 1)',
    description: 'Maximum endstop configuration for axis 1',
    properties: {
      gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for maximum endstop', writable: true, type: 'number', min: 0, max: 16 },
      enabled: { name: 'Enabled', description: 'Enable maximum endstop', writable: true, type: 'boolean' },
      offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', min: -1000000, max: 1000000, step: 1 },
      is_pressed: { name: 'Is Pressed', description: 'Current endstop state', writable: false, type: 'boolean' },
    }
  },

  'axis1.mechanical_brake': {
    name: 'Mechanical Brake (Axis 1)',
    description: 'Mechanical brake control settings for axis 1',
    properties: {
      gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for brake control', writable: true, type: 'number', min: 0, max: 16 },
      is_armed: { name: 'Is Armed', description: 'Whether brake is armed', writable: false, type: 'boolean' },
    }
  },

  'axis1.can': {
    name: 'CAN Bus Configuration (Axis 1)', 
    description: 'CAN bus communication settings for axis1',
    properties: {
      node_id: { name: 'Node ID', description: 'CAN node ID for axis1', writable: true, type: 'number', min: 0, max: 63 },
      is_extended: { name: 'Is Extended', description: 'Use extended CAN frames', writable: true, type: 'boolean' },
      heartbeat_rate_ms: { name: 'Heartbeat Rate', description: 'CAN heartbeat rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      encoder_rate_ms: { name: 'Encoder Rate', description: 'Encoder data broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      motor_error_rate_ms: { name: 'Motor Error Rate', description: 'Motor error broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      encoder_error_rate_ms: { name: 'Encoder Error Rate', description: 'Encoder error broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
      controller_error_rate_ms: { name: 'Controller Error Rate', description: 'Controller error broadcast rate (ms)', writable: true, type: 'number', min: 0, max: 1000, step: 10 },
    }
  },

  'axis1.lockin': {
    name: 'Lockin Configuration (Axis 1)',
    description: 'Motor lockin procedure settings for axis 1',
    properties: {
      current: { name: 'Lockin Current', description: 'Current used during lockin (A)', writable: true, type: 'number', min: 0, max: 20, step: 0.1, decimals: 1 },
      ramp_time: { name: 'Ramp Time', description: 'Time to ramp current during lockin (s)', writable: true, type: 'number', min: 0.1, max: 10, step: 0.1, decimals: 1 },
      ramp_distance: { name: 'Ramp Distance', description: 'Distance to travel during lockin ramp (counts)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      accel: { name: 'Acceleration', description: 'Acceleration during lockin (counts/s²)', writable: true, type: 'number', min: 1, max: 100000, step: 1 },
      vel: { name: 'Velocity', description: 'Velocity during lockin (counts/s)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      finish_distance: { name: 'Finish Distance', description: 'Distance to travel at end of lockin (counts)', writable: true, type: 'number', min: 1, max: 10000, step: 1 },
      finish_on_vel: { name: 'Finish on Velocity', description: 'Finish lockin based on velocity', writable: true, type: 'boolean' },
      finish_on_distance: { name: 'Finish on Distance', description: 'Finish lockin based on distance', writable: true, type: 'boolean' },
      finish_on_enc_idx: { name: 'Finish on Encoder Index', description: 'Finish lockin when encoder index found', writable: true, type: 'boolean' },
    }
  },

  'axis1.task_times': {
    name: 'Task Timing (Axis 1)',
    description: 'Task execution timing information for axis 1',
    properties: {
      thermistor_update: { name: 'Thermistor Update', description: 'Thermistor update task time (µs)', writable: false, type: 'number', decimals: 1 },
      encoder_update: { name: 'Encoder Update', description: 'Encoder update task time (µs)', writable: false, type: 'number', decimals: 1 },
      sensorless_estimator_update: { name: 'Sensorless Estimator Update', description: 'Sensorless estimator task time (µs)', writable: false, type: 'number', decimals: 1 },
      endstop_update: { name: 'Endstop Update', description: 'Endstop update task time (µs)', writable: false, type: 'number', decimals: 1 },
      can_heartbeat: { name: 'CAN Heartbeat', description: 'CAN heartbeat task time (µs)', writable: false, type: 'number', decimals: 1 },
      controller_update: { name: 'Controller Update', description: 'Controller update task time (µs)', writable: false, type: 'number', decimals: 1 },
      open_loop_controller_update: { name: 'Open Loop Controller Update', description: 'Open loop controller task time (µs)', writable: false, type: 'number', decimals: 1 },
      acim_estimator_update: { name: 'ACIM Estimator Update', description: 'AC induction motor estimator task time (µs)', writable: false, type: 'number', decimals: 1 },
      motor_update: { name: 'Motor Update', description: 'Motor update task time (µs)', writable: false, type: 'number', decimals: 1 },
      current_controller_update: { name: 'Current Controller Update', description: 'Current controller task time (µs)', writable: false, type: 'number', decimals: 1 },
      dc_calib: { name: 'DC Calibration', description: 'DC calibration task time (µs)', writable: false, type: 'number', decimals: 1 },
    }
  },

  // System diagnostics and statistics
  system_stats: {
    name: 'System Statistics',
    description: 'System performance and diagnostic statistics',
    properties: {
      uptime: { name: 'Uptime', description: 'System uptime (seconds)', writable: false, type: 'number' },
      min_heap_space: { name: 'Min Heap Space', description: 'Minimum heap space remaining (bytes)', writable: false, type: 'number' },
      max_stack_usage_axis: { name: 'Max Stack Usage Axis', description: 'Maximum stack usage for axis tasks (bytes)', writable: false, type: 'number' },
      max_stack_usage_usb: { name: 'Max Stack Usage USB', description: 'Maximum stack usage for USB tasks (bytes)', writable: false, type: 'number' },
      max_stack_usage_uart: { name: 'Max Stack Usage UART', description: 'Maximum stack usage for UART tasks (bytes)', writable: false, type: 'number' },
      max_stack_usage_can: { name: 'Max Stack Usage CAN', description: 'Maximum stack usage for CAN tasks (bytes)', writable: false, type: 'number' },
      max_stack_usage_startup: { name: 'Max Stack Usage Startup', description: 'Maximum stack usage for startup tasks (bytes)', writable: false, type: 'number' },
      max_stack_usage_analog: { name: 'Max Stack Usage Analog', description: 'Maximum stack usage for analog tasks (bytes)', writable: false, type: 'number' },
      usb: {
        rx_cnt: { name: 'USB RX Count', description: 'USB receive packet count', writable: false, type: 'number' },
        tx_cnt: { name: 'USB TX Count', description: 'USB transmit packet count', writable: false, type: 'number' },
        tx_overrun_cnt: { name: 'USB TX Overrun Count', description: 'USB transmit overrun count', writable: false, type: 'number' },
      },
      i2c: {
        addr: { name: 'I2C Address', description: 'I2C slave address', writable: true, type: 'number', min: 1, max: 127 },
        address_match_cnt: { name: 'I2C Address Match Count', description: 'I2C address match count', writable: false, type: 'number' },
        rx_cnt: { name: 'I2C RX Count', description: 'I2C receive count', writable: false, type: 'number' },
        error_cnt: { name: 'I2C Error Count', description: 'I2C error count', writable: false, type: 'number' },
      }
    }
  },

  // Thermistor monitoring
  thermistors: {
    name: 'Thermistor Monitoring',
    description: 'Temperature monitoring and thermal protection',
    properties: {
      fet_thermistor: {
        temp: { name: 'FET Temperature', description: 'FET thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
        voltage: { name: 'FET Thermistor Voltage', description: 'FET thermistor voltage (V)', writable: false, type: 'number', decimals: 3 },
      },
      motor_thermistor: {
        temp: { name: 'Motor Temperature', description: 'Motor thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
        voltage: { name: 'Motor Thermistor Voltage', description: 'Motor thermistor voltage (V)', writable: false, type: 'number', decimals: 3 },
      }
    }
  },

  // Current limiters based on thermistors
  fet_thermistor_current_limiter: {
    name: 'FET Thermistor Current Limiter',
    description: 'FET temperature-based current limiting',
    properties: {
      temp_limit_lower: { name: 'Temperature Limit Lower', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', min: 20, max: 120, step: 1 },
      temp_limit_upper: { name: 'Temperature Limit Upper', description: 'Upper temperature limit for current limiting (°C)', writable: true, type: 'number', min: 40, max: 140, step: 1 },
      enabled: { name: 'Enabled', description: 'Enable FET thermal current limiting', writable: true, type: 'boolean' },
    }
  },

  motor_thermistor_current_limiter: {
    name: 'Motor Thermistor Current Limiter',
    description: 'Motor temperature-based current limiting',
    properties: {
      temp_limit_lower: { name: 'Temperature Limit Lower', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', min: 20, max: 120, step: 1 },
      temp_limit_upper: { name: 'Temperature Limit Upper', description: 'Upper temperature limit for current limiting (°C)', writable: true, type: 'number', min: 40, max: 140, step: 1 },
      enabled: { name: 'Enabled', description: 'Enable motor thermal current limiting', writable: true, type: 'boolean' },
    }
  },

  // Additional system-level properties specific to ODrive v0.5.6
  config: {
    name: 'Global Configuration',
    description: 'Global ODrive configuration settings',
    properties: {
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip Level', description: 'DC bus overvoltage protection level (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1 },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip Level', description: 'DC bus undervoltage protection level (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1 },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Maximum positive DC current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Maximum negative DC current (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1 },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable brake resistor', writable: true, type: 'boolean' },
      brake_resistance: { name: 'Brake Resistance', description: 'Brake resistor resistance (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2 },
      enable_uart_a: { name: 'Enable UART A', description: 'Enable UART A interface', writable: true, type: 'boolean' },
      uart_a_baudrate: { name: 'UART A Baudrate', description: 'UART A communication speed', writable: true, type: 'number', min: 9600, max: 921600 },
      uart0_protocol: { name: 'UART0 Protocol', description: 'UART0 protocol selection (1=ASCII, 3=ASCII+STDOUT, 4=Native)', writable: true, type: 'number', min: 0, max: 4 },
      enable_uart_b: { name: 'Enable UART B', description: 'Enable UART B interface', writable: true, type: 'boolean' },
      uart_b_baudrate: { name: 'UART B Baudrate', description: 'UART B communication speed', writable: true, type: 'number', min: 9600, max: 921600 },
      uart1_protocol: { name: 'UART1 Protocol', description: 'UART1 protocol selection (1=ASCII, 3=ASCII+STDOUT, 4=Native)', writable: true, type: 'number', min: 0, max: 4 },
      gpio1_mode: { name: 'GPIO1 Mode', description: 'GPIO1 pin mode (0=DIGITAL, 1=DIGITAL_PULL_UP, 2=DIGITAL_PULL_DOWN, 3=ANALOG_IN, 4=UART_A, 5=UART_B, 6=CAN_A, 7=PWM, 8=ENC0, 9=ENC1, 10=ENC2, 11=MECH_BRAKE)', writable: true, type: 'number', min: 0, max: 11 },
      gpio2_mode: { name: 'GPIO2 Mode', description: 'GPIO2 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio3_mode: { name: 'GPIO3 Mode', description: 'GPIO3 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio4_mode: { name: 'GPIO4 Mode', description: 'GPIO4 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio5_mode: { name: 'GPIO5 Mode', description: 'GPIO5 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio6_mode: { name: 'GPIO6 Mode', description: 'GPIO6 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio7_mode: { name: 'GPIO7 Mode', description: 'GPIO7 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio8_mode: { name: 'GPIO8 Mode', description: 'GPIO8 pin mode', writable: true, type: 'number', min: 0, max: 11 },
      gpio1_pwm_mapping: { name: 'GPIO1 PWM Mapping', description: 'GPIO1 PWM input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      gpio2_pwm_mapping: { name: 'GPIO2 PWM Mapping', description: 'GPIO2 PWM input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      gpio3_pwm_mapping: { name: 'GPIO3 PWM Mapping', description: 'GPIO3 PWM input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      gpio4_pwm_mapping: { name: 'GPIO4 PWM Mapping', description: 'GPIO4 PWM input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      gpio1_analog_mapping: { name: 'GPIO1 Analog Mapping', description: 'GPIO1 analog input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      gpio2_analog_mapping: { name: 'GPIO2 Analog Mapping', description: 'GPIO2 analog input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      gpio3_analog_mapping: { name: 'GPIO3 Analog Mapping', description: 'GPIO3 analog input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      gpio4_analog_mapping: { name: 'GPIO4 Analog Mapping', description: 'GPIO4 analog input mapping axis and input', writable: true, type: 'number', min: 0, max: 7 },
      usb_output_enabled: { name: 'USB Output Enabled', description: 'Enable USB serial output', writable: true, type: 'boolean' },
      max_regen_current: { name: 'Max Regen Current', description: 'Maximum regenerative braking current (A)', writable: true, type: 'number', min: 0, max: 10, step: 0.1, decimals: 1 },
    }
  },

  // Test properties for debugging and development
  test_property: {
    name: 'Test Properties',
    description: 'Test properties for debugging and development',
    properties: {
      flt: { name: 'Float Test', description: 'Test floating point property', writable: true, type: 'number', min: -1000, max: 1000, step: 0.1, decimals: 3 },
      uint8: { name: 'UInt8 Test', description: 'Test 8-bit unsigned integer', writable: true, type: 'number', min: 0, max: 255, step: 1 },
      bool: { name: 'Boolean Test', description: 'Test boolean property', writable: true, type: 'boolean' },
    }
  }
}