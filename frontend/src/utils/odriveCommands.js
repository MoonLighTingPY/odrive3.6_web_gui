// ODrive v0.5.6 Commands organized by category

export const odriveCommands = {
  system: [
    {
      name: "Get Firmware Version",
      command: "odrv0.fw_version_major",
      description: "Get major firmware version number"
    },
    {
      name: "Get Hardware Version", 
      command: "odrv0.hw_version_major",
      description: "Get hardware version major number"
    },
    {
      name: "Get Serial Number",
      command: "odrv0.serial_number",
      description: "Get device serial number"
    },
    {
      name: "Reboot Device",
      command: "odrv0.reboot()",
      description: "Reboot the ODrive device"
    },
    {
      name: "Save Configuration",
      command: "odrv0.save_configuration()",
      description: "Save current configuration to non-volatile memory"
    },
    {
      name: "Erase Configuration",
      command: "odrv0.erase_configuration()",
      description: "Erase configuration and restore factory defaults"
    },
    {
      name: "Clear Errors",
      command: "odrv0.clear_errors()",
      description: "Clear all error flags on the device"
    }
  ],
  
  power: [
    {
      name: "Get Bus Voltage",
      command: "odrv0.vbus_voltage",
      description: "Read DC bus voltage in volts"
    },
    {
      name: "Get Bus Current",
      command: "odrv0.ibus",
      description: "Read DC bus current in amperes"
    },
    {
      name: "Set Overvoltage Trip",
      command: "odrv0.config.dc_bus_overvoltage_trip_level = 56",
      description: "Set DC bus overvoltage protection level"
    },
    {
      name: "Set Undervoltage Trip",
      command: "odrv0.config.dc_bus_undervoltage_trip_level = 10",
      description: "Set DC bus undervoltage protection level"
    },
    {
      name: "Set Max Positive Current",
      command: "odrv0.config.dc_max_positive_current = 10",
      description: "Set maximum positive DC bus current"
    },
    {
      name: "Set Max Negative Current",
      command: "odrv0.config.dc_max_negative_current = -10",
      description: "Set maximum negative DC bus current (regenerative)"
    },
    {
      name: "Enable Brake Resistor",
      command: "odrv0.config.enable_brake_resistor = True",
      description: "Enable brake resistor for regenerative braking"
    },
    {
      name: "Set Brake Resistance",
      command: "odrv0.config.brake_resistance = 2",
      description: "Set brake resistor resistance value in ohms"
    }
  ],

  axis_control: [
    {
      name: "Set Axis State - Idle",
      command: "odrv0.axis0.requested_state = 1",
      description: "Set axis to idle state"
    },
    {
      name: "Set Axis State - Full Calibration",
      command: "odrv0.axis0.requested_state = 3",
      description: "Start full calibration sequence"
    },
    {
      name: "Set Axis State - Motor Calibration",
      command: "odrv0.axis0.requested_state = 4",
      description: "Start motor calibration only"
    },
    {
      name: "Set Axis State - Sensorless Control",
      command: "odrv0.axis0.requested_state = 5",
      description: "Enter sensorless control mode"
    },
    {
      name: "Set Axis State - Encoder Index Search",
      command: "odrv0.axis0.requested_state = 6",
      description: "Search for encoder index pulse"
    },
    {
      name: "Set Axis State - Encoder Offset Calibration",
      command: "odrv0.axis0.requested_state = 7",
      description: "Calibrate encoder offset"
    },
    {
      name: "Set Axis State - Closed Loop Control",
      command: "odrv0.axis0.requested_state = 8",
      description: "Enter closed loop control mode"
    },
    {
      name: "Get Current Axis State",
      command: "odrv0.axis0.current_state",
      description: "Read current axis state"
    },
    {
      name: "Check Axis Error",
      command: "odrv0.axis0.error",
      description: "Read axis error flags"
    },
    {
      name: "Clear Axis Errors",
      command: "odrv0.clear_errors()",
      description: "Clear all axis error flags"
    }
  ],

  motor_config: [
    {
      name: "Set Motor Type - High Current",
      command: "odrv0.axis0.motor.config.motor_type = 0",
      description: "Set motor type to high current motor"
    },
    {
      name: "Set Motor Type - Gimbal",
      command: "odrv0.axis0.motor.config.motor_type = 2",
      description: "Set motor type to gimbal motor"
    },
    {
      name: "Set Pole Pairs",
      command: "odrv0.axis0.motor.config.pole_pairs = 7",
      description: "Set number of motor pole pairs"
    },
    {
      name: "Set Current Limit",
      command: "odrv0.axis0.motor.config.current_lim = 10",
      description: "Set motor current limit in amperes"
    },
    {
      name: "Set Calibration Current",
      command: "odrv0.axis0.motor.config.calibration_current = 10",
      description: "Set current used for motor calibration"
    },
    {
      name: "Set Resistance Calib Voltage",
      command: "odrv0.axis0.motor.config.resistance_calib_max_voltage = 4",
      description: "Set maximum voltage for resistance calibration"
    },
    {
      name: "Set Torque Constant",
      command: "odrv0.axis0.motor.config.torque_constant = 0.04",
      description: "Set motor torque constant (Nm/A)"
    },
    {
      name: "Get Phase Resistance",
      command: "odrv0.axis0.motor.config.phase_resistance",
      description: "Read measured motor phase resistance"
    },
    {
      name: "Get Phase Inductance",
      command: "odrv0.axis0.motor.config.phase_inductance",
      description: "Read measured motor phase inductance"
    }
  ],

  motor_status: [
    {
      name: "Get Motor Error",
      command: "odrv0.axis0.motor.error",
      description: "Read motor error flags"
    },
    {
      name: "Get Motor Current (Iq)",
      command: "odrv0.axis0.motor.current_control.Iq_measured",
      description: "Read motor quadrature current"
    },
    {
      name: "Get Motor Current (Id)",
      command: "odrv0.axis0.motor.current_control.Id_measured",
      description: "Read motor direct current"
    },
    {
      name: "Get Motor Voltage (Vq)",
      command: "odrv0.axis0.motor.current_control.Vq_setpoint",
      description: "Read motor quadrature voltage setpoint"
    },
    {
      name: "Get Motor Voltage (Vd)",
      command: "odrv0.axis0.motor.current_control.Vd_setpoint",
      description: "Read motor direct voltage setpoint"
    },
    {
      name: "Get Motor Temperature",
      command: "odrv0.axis0.motor.motor_thermistor.temperature",
      description: "Read motor temperature from thermistor"
    },
    {
      name: "Get FET Temperature",
      command: "odrv0.axis0.motor.fet_thermistor.temperature",
      description: "Read FET temperature from thermistor"
    }
  ],

  encoder_config: [
    {
      name: "Set Encoder Mode - Incremental",
      command: "odrv0.axis0.encoder.config.mode = 1",
      description: "Set encoder to incremental mode"
    },
    {
      name: "Set Encoder Mode - Hall",
      command: "odrv0.axis0.encoder.config.mode = 2", 
      description: "Set encoder to Hall effect mode"
    },
    {
      name: "Set Encoder CPR",
      command: "odrv0.axis0.encoder.config.cpr = 4000",
      description: "Set encoder counts per revolution"
    },
    {
      name: "Set Encoder Bandwidth",
      command: "odrv0.axis0.encoder.config.bandwidth = 1000",
      description: "Set encoder filter bandwidth in Hz"
    },
    {
      name: "Enable Index Search",
      command: "odrv0.axis0.encoder.config.use_index = True",
      description: "Enable encoder index pulse usage"
    },
    {
      name: "Set Calib Range",
      command: "odrv0.axis0.encoder.config.calib_range = 0.02",
      description: "Set encoder calibration range"
    },
    {
      name: "Set Calib Scan Distance",
      command: "odrv0.axis0.encoder.config.calib_scan_distance = 16384",
      description: "Set encoder calibration scan distance"
    }
  ],

  encoder_status: [
    {
      name: "Get Encoder Error",
      command: "odrv0.axis0.encoder.error",
      description: "Read encoder error flags"
    },
    {
      name: "Get Encoder Position",
      command: "odrv0.axis0.encoder.pos_estimate",
      description: "Read encoder position estimate in turns"
    },
    {
      name: "Get Encoder Velocity",
      command: "odrv0.axis0.encoder.vel_estimate",
      description: "Read encoder velocity estimate in turns/s"
    },
    {
      name: "Get Encoder Count",
      command: "odrv0.axis0.encoder.count_in_cpr",
      description: "Read raw encoder count within CPR"
    },
    {
      name: "Get Encoder Shadow Count",
      command: "odrv0.axis0.encoder.shadow_count",
      description: "Read encoder shadow count"
    },
    {
      name: "Get Encoder Phase",
      command: "odrv0.axis0.encoder.phase",
      description: "Read encoder electrical phase"
    },
    {
      name: "Check Index Found",
      command: "odrv0.axis0.encoder.index_found",
      description: "Check if encoder index was found"
    }
  ],

  controller_config: [
    {
      name: "Set Control Mode - Voltage",
      command: "odrv0.axis0.controller.config.control_mode = 0",
      description: "Set controller to voltage control mode"
    },
    {
      name: "Set Control Mode - Current",
      command: "odrv0.axis0.controller.config.control_mode = 1",
      description: "Set controller to current control mode"
    },
    {
      name: "Set Control Mode - Velocity",
      command: "odrv0.axis0.controller.config.control_mode = 2",
      description: "Set controller to velocity control mode"
    },
    {
      name: "Set Control Mode - Position",
      command: "odrv0.axis0.controller.config.control_mode = 3",
      description: "Set controller to position control mode"
    },
    {
      name: "Set Input Mode - Inactive",
      command: "odrv0.axis0.controller.config.input_mode = 0",
      description: "Set input mode to inactive"
    },
    {
      name: "Set Input Mode - Passthrough",
      command: "odrv0.axis0.controller.config.input_mode = 1",
      description: "Set input mode to passthrough"
    },
    {
      name: "Set Input Mode - Velocity Ramp",
      command: "odrv0.axis0.controller.config.input_mode = 2",
      description: "Set input mode to velocity ramp"
    },
    {
      name: "Set Input Mode - Pos Filter",
      command: "odrv0.axis0.controller.config.input_mode = 3",
      description: "Set input mode to position filter"
    },
    {
      name: "Set Input Mode - Trap Traj",
      command: "odrv0.axis0.controller.config.input_mode = 5",
      description: "Set input mode to trapezoidal trajectory"
    },
    {
      name: "Set Velocity Limit",
      command: "odrv0.axis0.controller.config.vel_limit = 20",
      description: "Set velocity limit in turns/s"
    },
    {
      name: "Set Position Gain",
      command: "odrv0.axis0.controller.config.pos_gain = 1",
      description: "Set position controller gain"
    },
    {
      name: "Set Velocity Gain",
      command: "odrv0.axis0.controller.config.vel_gain = 0.228",
      description: "Set velocity controller gain"
    },
    {
      name: "Set Velocity Integrator Gain",
      command: "odrv0.axis0.controller.config.vel_integrator_gain = 0.228",
      description: "Set velocity integrator gain"
    }
  ],

  controller_input: [
    {
      name: "Set Position Setpoint",
      command: "odrv0.axis0.controller.input_pos = 0",
      description: "Set position setpoint in turns"
    },
    {
      name: "Set Velocity Setpoint",
      command: "odrv0.axis0.controller.input_vel = 0",
      description: "Set velocity setpoint in turns/s"
    },
    {
      name: "Set Current Setpoint",
      command: "odrv0.axis0.controller.input_current = 0",
      description: "Set current setpoint in amperes"
    },
    {
      name: "Get Position Setpoint",
      command: "odrv0.axis0.controller.pos_setpoint",
      description: "Read current position setpoint"
    },
    {
      name: "Get Velocity Setpoint",
      command: "odrv0.axis0.controller.vel_setpoint",
      description: "Read current velocity setpoint"
    },
    {
      name: "Get Current Setpoint",
      command: "odrv0.axis0.controller.current_setpoint",
      description: "Read current setpoint"
    }
  ],

  controller_status: [
    {
      name: "Get Controller Error",
      command: "odrv0.axis0.controller.error",
      description: "Read controller error flags"
    },
    {
      name: "Get Position Estimate",
      command: "odrv0.axis0.controller.pos_estimate",
      description: "Read position estimate from controller"
    },
    {
      name: "Get Velocity Estimate", 
      command: "odrv0.axis0.controller.vel_estimate",
      description: "Read velocity estimate from controller"
    },
    {
      name: "Get Trajectory Done",
      command: "odrv0.axis0.controller.trajectory_done",
      description: "Check if trajectory is complete"
    }
  ],

  gpio_can: [
    {
      name: "Set GPIO1 Mode",
      command: "odrv0.config.gpio1_mode = 0",
      description: "Set GPIO1 pin mode (0=Digital)"
    },
    {
      name: "Set GPIO2 Mode",
      command: "odrv0.config.gpio2_mode = 0", 
      description: "Set GPIO2 pin mode (0=Digital)"
    },
    {
      name: "Set GPIO3 Mode",
      command: "odrv0.config.gpio3_mode = 0",
      description: "Set GPIO3 pin mode (0=Digital)"
    },
    {
      name: "Set GPIO4 Mode",
      command: "odrv0.config.gpio4_mode = 0",
      description: "Set GPIO4 pin mode (0=Digital)"
    },
    {
      name: "Set CAN Node ID",
      command: "odrv0.axis0.config.can.node_id = 0",
      description: "Set CAN bus node ID"
    },
    {
      name: "Get GPIO1 State",
      command: "odrv0.get_gpio_state(1)",
      description: "Read GPIO1 pin state"
    },
    {
      name: "Get GPIO2 State",
      command: "odrv0.get_gpio_state(2)",
      description: "Read GPIO2 pin state"
    }
  ],

  calibration: [
    {
      name: "Start Motor Calibration",
      command: "odrv0.axis0.requested_state = 4",
      description: "Start motor resistance and inductance calibration"
    },
    {
      name: "Start Encoder Dir Find",
      command: "odrv0.axis0.requested_state = 10",
      description: "Start encoder direction finding (polarity)"
    },
    {
      name: "Start Encoder Offset Calib",
      command: "odrv0.axis0.requested_state = 7", 
      description: "Start encoder offset calibration"
    },
    {
      name: "Start Index Search",
      command: "odrv0.axis0.requested_state = 6",
      description: "Search for encoder index pulse"
    },
    {
      name: "Check Motor Calibrated",
      command: "odrv0.axis0.motor.is_calibrated",
      description: "Check if motor is calibrated"
    },
    {
      name: "Check Encoder Calibrated",
      command: "odrv0.axis0.encoder.is_ready",
      description: "Check if encoder is calibrated and ready"
    }
  ],

  watchdog: [
    {
      name: "Set Watchdog Timeout",
      command: "odrv0.axis0.config.watchdog_timeout = 0",
      description: "Set watchdog timeout in seconds (0 = disabled)"
    },
    {
      name: "Feed Watchdog",
      command: "odrv0.axis0.watchdog_feed()",
      description: "Reset watchdog timer"
    }
  ]
}

export const getCommandsByCategory = (category) => {
  return odriveCommands[category] || []
}

export const getAllCommands = () => {
  const allCommands = []
  Object.values(odriveCommands).forEach(categoryCommands => {
    allCommands.push(...categoryCommands)
  })
  return allCommands
}

export const searchCommands = (searchTerm) => {
  const allCommands = getAllCommands()
  return allCommands.filter(cmd => 
    cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

// ODrive v0.5.6 Configuration Parameter Mappings for GUI
export const configurationMappings = {
  power: {
    name: 'Power Configuration',
    dc_bus_overvoltage_trip_level: 'config.dc_bus_overvoltage_trip_level',
    dc_bus_undervoltage_trip_level: 'config.dc_bus_undervoltage_trip_level',
    dc_max_positive_current: 'config.dc_max_positive_current',
    dc_max_negative_current: 'config.dc_max_negative_current',
    brake_resistance: 'config.brake_resistance',
    brake_resistor_enabled: 'config.enable_brake_resistor',
  },
  motor: {
    name: 'Motor Configuration',
    motor_type: 'axis0.motor.config.motor_type',
    pole_pairs: 'axis0.motor.config.pole_pairs',
    motor_kv: 'axis0.motor.config.torque_constant', // Will convert from Kt to Kv
    current_lim: 'axis0.motor.config.current_lim',
    calibration_current: 'axis0.motor.config.calibration_current',
    resistance_calib_max_voltage: 'axis0.motor.config.resistance_calib_max_voltage',
    lock_in_spin_current: 'axis0.config.calibration_lockin.current',
    phase_resistance: 'axis0.motor.config.phase_resistance',
    phase_inductance: 'axis0.motor.config.phase_inductance',
  },
  encoder: {
    name: 'Encoder Configuration',
    encoder_type: 'axis0.encoder.config.mode',
    cpr: 'axis0.encoder.config.cpr',
    bandwidth: 'axis0.encoder.config.bandwidth',
    use_index: 'axis0.encoder.config.use_index',
    calib_range: 'axis0.encoder.config.calib_range',
    calib_scan_distance: 'axis0.encoder.config.calib_scan_distance',
    calib_scan_omega: 'axis0.encoder.config.calib_scan_omega',
    pre_calibrated: 'axis0.encoder.config.pre_calibrated',
    use_index_offset: 'axis0.encoder.config.use_index_offset',
    find_idx_on_lockin_only: 'axis0.encoder.config.find_idx_on_lockin_only',
    abs_spi_cs_gpio_pin: 'axis0.encoder.config.abs_spi_cs_gpio_pin',
    direction: 'axis0.encoder.config.direction',
    enable_phase_interpolation: 'axis0.encoder.config.enable_phase_interpolation',
    hall_polarity: 'axis0.encoder.config.hall_polarity',
    hall_polarity_calibrated: 'axis0.encoder.config.hall_polarity_calibrated',
  },
  control: {
    name: 'Control Configuration',
    control_mode: 'axis0.controller.config.control_mode',
    input_mode: 'axis0.controller.config.input_mode',
    vel_limit: 'axis0.controller.config.vel_limit',
    pos_gain: 'axis0.controller.config.pos_gain',
    vel_gain: 'axis0.controller.config.vel_gain',
    vel_integrator_gain: 'axis0.controller.config.vel_integrator_gain',
    vel_limit_tolerance: 'axis0.controller.config.vel_limit_tolerance',
    vel_ramp_rate: 'axis0.controller.config.vel_ramp_rate',
    torque_ramp_rate: 'axis0.controller.config.torque_ramp_rate',
    circular_setpoints: 'axis0.controller.config.circular_setpoints',
    inertia: 'axis0.controller.config.inertia',
    input_filter_bandwidth: 'axis0.controller.config.input_filter_bandwidth',
    homing_speed: 'axis0.controller.config.homing_speed',
    anticogging_enabled: 'axis0.controller.config.anticogging.anticogging_enabled',
  },
  interface: {
    name: 'Interface Configuration',
    can_node_id: 'axis0.config.can.node_id',           // Fixed path
    can_node_id_extended: 'axis0.config.can.is_extended', // Fixed path  
    can_baudrate: 'can.config.baud_rate',              // Fixed path
    can_heartbeat_rate_ms: 'axis0.config.can.heartbeat_rate_ms',
    enable_uart_a: 'config.enable_uart_a',
    uart_a_baudrate: 'config.uart_a_baudrate',
    uart0_protocol: 'config.uart0_protocol',
    enable_uart_b: 'config.enable_uart_b',
    uart_b_baudrate: 'config.uart_b_baudrate',
    uart1_protocol: 'config.uart1_protocol',
    gpio1_mode: 'config.gpio1_mode',
    gpio2_mode: 'config.gpio2_mode',
    gpio3_mode: 'config.gpio3_mode',
    gpio4_mode: 'config.gpio4_mode',
    enable_watchdog: 'axis0.config.enable_watchdog',
    watchdog_timeout: 'axis0.config.watchdog_timeout',
    enable_step_dir: 'axis0.config.enable_step_dir',
    step_dir_always_on: 'axis0.config.step_dir_always_on',
    enable_sensorless: 'axis0.config.enable_sensorless_mode',
  }
}

// Helper function to get configuration parameters for pulling
export const getConfigurationParams = (category) => {
  const categoryData = configurationMappings[category]
  if (!categoryData) return {}
  
  // Extract just the parameter mappings (exclude 'name')
  const { name, ...params } = categoryData
  return params
}

// Get all configuration parameters for pulling
export const getAllConfigurationParams = () => {
  const allParams = {}
  Object.keys(configurationMappings).forEach(category => {
    allParams[category] = {
      name: configurationMappings[category].name,
      params: getConfigurationParams(category)
    }
  })
  return allParams
}