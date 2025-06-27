export const odrivePropertyTree = {
  // Root system properties
  system: {
    name: 'System Properties',
    description: 'Top-level ODrive system settings and information',
    properties: {
      hw_version_major: { name: 'Hardware Version Major', description: 'Major hardware version', writable: false, type: 'number' },
      hw_version_minor: { name: 'Hardware Version Minor', description: 'Minor hardware version', writable: false, type: 'number' },
      hw_version_variant: { name: 'Hardware Variant', description: 'Hardware variant identifier', writable: false, type: 'number' },
      fw_version_major: { name: 'Firmware Version Major', description: 'Major firmware version', writable: false, type: 'number' },
      fw_version_minor: { name: 'Firmware Version Minor', description: 'Minor firmware version', writable: false, type: 'number' },
      fw_version_revision: { name: 'Firmware Revision', description: 'Firmware revision number', writable: false, type: 'number' },
      fw_version_unreleased: { name: 'Firmware Unreleased', description: 'Unreleased firmware flag', writable: false, type: 'number' },
      serial_number: { name: 'Serial Number', description: 'Device serial number', writable: false, type: 'number' },
      user_config_loaded: { name: 'User Config Loaded', description: 'Whether user configuration is loaded', writable: false, type: 'number' },
      vbus_voltage: { name: 'VBus Voltage', description: 'VBus voltage measurement (V)', writable: false, type: 'number', decimals: 2 },
      ibus: { name: 'DC Bus Current', description: 'Current DC bus current (A)', writable: false, type: 'number', decimals: 3 },
      error: { name: 'System Error', description: 'System error flags', writable: false, type: 'number' },
      brake_resistor_armed: { name: 'Brake Resistor Armed', description: 'Brake resistor armed state', writable: false, type: 'boolean' },
      brake_resistor_saturated: { name: 'Brake Resistor Saturated', description: 'Brake resistor saturated state', writable: false, type: 'boolean' },
      brake_resistor_current: { name: 'Brake Resistor Current', description: 'Current through brake resistor (A)', writable: false, type: 'number', decimals: 3 },
      misconfigured: { name: 'Misconfigured', description: 'System misconfiguration flag', writable: false, type: 'boolean' },
      otp_valid: { name: 'OTP Valid', description: 'One-time programmable memory valid', writable: false, type: 'boolean' },
    }
  },

  // Root config properties - these map to ODrive.Config
  config: {
    name: 'System Configuration',
    description: 'Top-level ODrive configuration parameters',
    properties: {
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'DC bus overvoltage protection level (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1, hasSlider: true },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'DC bus undervoltage protection level (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1, hasSlider: true },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Maximum positive DC current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1, hasSlider: true },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Maximum negative DC current (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1, hasSlider: true },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable brake resistor', writable: true, type: 'boolean' },
      brake_resistance: { name: 'Brake Resistance', description: 'Brake resistor resistance (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2, hasSlider: true },
      max_regen_current: { name: 'Max Regen Current', description: 'Maximum regenerative braking current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1, hasSlider: true },
      enable_uart_a: { name: 'Enable UART A', description: 'Enable UART A interface', writable: true, type: 'boolean' },
      uart_a_baudrate: { name: 'UART A Baudrate', description: 'UART A communication baudrate', writable: true, type: 'number' },
      enable_uart_b: { name: 'Enable UART B', description: 'Enable UART B interface', writable: true, type: 'boolean' },
      uart_b_baudrate: { name: 'UART B Baudrate', description: 'UART B communication baudrate', writable: true, type: 'number' },
      enable_uart_c: { name: 'Enable UART C', description: 'Enable UART C interface', writable: true, type: 'boolean' },
      uart_c_baudrate: { name: 'UART C Baudrate', description: 'UART C communication baudrate', writable: true, type: 'number' },
      uart0_protocol: { name: 'UART0 Protocol', description: 'UART0 protocol selection', writable: true, type: 'number' },
      uart1_protocol: { name: 'UART1 Protocol', description: 'UART1 protocol selection', writable: true, type: 'number' },
      uart2_protocol: { name: 'UART2 Protocol', description: 'UART2 protocol selection', writable: true, type: 'number' },
      usb_cdc_protocol: { name: 'USB CDC Protocol', description: 'USB CDC protocol selection', writable: true, type: 'number' },
      enable_can_a: { name: 'Enable CAN A', description: 'Enable CAN A interface', writable: true, type: 'boolean' },
      enable_i2c_a: { name: 'Enable I2C A', description: 'Enable I2C A interface', writable: true, type: 'boolean' },
      error_gpio_pin: { name: 'Error GPIO Pin', description: 'GPIO pin for error output', writable: true, type: 'number' },
      enable_dc_bus_overvoltage_ramp: { name: 'Enable DC Bus Overvoltage Ramp', description: 'Enable DC bus overvoltage ramping', writable: true, type: 'boolean' },
      dc_bus_overvoltage_ramp_start: { name: 'DC Bus Overvoltage Ramp Start', description: 'DC bus overvoltage ramp start voltage (V)', writable: true, type: 'number', decimals: 1 },
      dc_bus_overvoltage_ramp_end: { name: 'DC Bus Overvoltage Ramp End', description: 'DC bus overvoltage ramp end voltage (V)', writable: true, type: 'number', decimals: 1 },
    }
  },

  // CAN bus interface
  can: {
    name: 'CAN Bus',
    description: 'CAN bus interface settings and status',
    properties: {
      error: { name: 'CAN Error', description: 'CAN bus error flags', writable: false, type: 'number' },
    },
    children: {
      config: {
        name: 'CAN Configuration',
        description: 'CAN bus configuration parameters',
        properties: {
          baud_rate: { name: 'Baud Rate', description: 'CAN bus communication speed', writable: true, type: 'number' },
          protocol: { name: 'Protocol', description: 'CAN protocol selection', writable: true, type: 'number' },
        }
      }
    }
  },

  // System stats
  system_stats: {
    name: 'System Statistics',
    description: 'System performance statistics',
    properties: {
      uptime: { name: 'Uptime', description: 'System uptime (ms)', writable: false, type: 'number' },
      min_heap_space: { name: 'Min Heap Space', description: 'Minimum available heap space (bytes)', writable: false, type: 'number' },
      max_stack_usage_axis: { name: 'Max Stack Usage Axis', description: 'Maximum stack usage for axis thread (bytes)', writable: false, type: 'number' },
      max_stack_usage_usb: { name: 'Max Stack Usage USB', description: 'Maximum stack usage for USB thread (bytes)', writable: false, type: 'number' },
      max_stack_usage_uart: { name: 'Max Stack Usage UART', description: 'Maximum stack usage for UART thread (bytes)', writable: false, type: 'number' },
      max_stack_usage_can: { name: 'Max Stack Usage CAN', description: 'Maximum stack usage for CAN thread (bytes)', writable: false, type: 'number' },
      max_stack_usage_startup: { name: 'Max Stack Usage Startup', description: 'Maximum stack usage for startup thread (bytes)', writable: false, type: 'number' },
      max_stack_usage_analog: { name: 'Max Stack Usage Analog', description: 'Maximum stack usage for analog thread (bytes)', writable: false, type: 'number' },
    }
  },

  // Axis 0 tree structure
  axis0: {
    name: 'Axis 0',
    description: 'Motor axis 0 configuration and status',
    properties: {
      error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number' },
      current_state: { name: 'Current State', description: 'Current axis state', writable: false, type: 'number' },
      requested_state: { name: 'Requested State', description: 'Requested axis state', writable: true, type: 'number' },
      step_dir_active: { name: 'Step/Dir Active', description: 'Whether step/direction interface is active', writable: false, type: 'boolean' },
      last_drv_fault: { name: 'Last DRV Fault', description: 'Last gate driver fault', writable: false, type: 'number' },
      steps: { name: 'Steps', description: 'Step count', writable: false, type: 'number' },
      is_homed: { name: 'Is Homed', description: 'Whether axis is homed', writable: false, type: 'boolean' },
    },
    children: {
      config: {
        name: 'Axis Configuration',
        description: 'Axis-level configuration parameters',
        properties: {
          startup_motor_calibration: { name: 'Startup Motor Calibration', description: 'Run motor calibration on startup', writable: true, type: 'boolean' },
          startup_encoder_index_search: { name: 'Startup Encoder Index Search', description: 'Run encoder index search on startup', writable: true, type: 'boolean' },
          startup_encoder_offset_calibration: { name: 'Startup Encoder Offset Cal', description: 'Run encoder offset calibration on startup', writable: true, type: 'boolean' },
          startup_closed_loop_control: { name: 'Startup Closed Loop Control', description: 'Enter closed loop control on startup', writable: true, type: 'boolean' },
          startup_homing: { name: 'Startup Homing', description: 'Run homing on startup', writable: true, type: 'boolean' },
          enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean' },
          step_dir_always_on: { name: 'Step/Dir Always On', description: 'Keep step/direction interface always enabled', writable: true, type: 'boolean' },
          step_gpio_pin: { name: 'Step GPIO Pin', description: 'GPIO pin for step input', writable: true, type: 'number' },
          dir_gpio_pin: { name: 'Dir GPIO Pin', description: 'GPIO pin for direction input', writable: true, type: 'number' },
          enable_watchdog: { name: 'Enable Watchdog', description: 'Enable watchdog timer', writable: true, type: 'boolean' },
          watchdog_timeout: { name: 'Watchdog Timeout', description: 'Watchdog timeout period (s)', writable: true, type: 'number', decimals: 3 },
          enable_sensorless_mode: { name: 'Enable Sensorless Mode', description: 'Enable sensorless mode', writable: true, type: 'boolean' },
        },
        children: {
          can: {
            name: 'CAN Configuration',
            description: 'Axis-specific CAN settings',
            properties: {
              node_id: { name: 'Node ID', description: 'CAN node identifier', writable: true, type: 'number', min: 0, max: 63 },
              is_extended: { name: 'Extended ID', description: 'Use 29-bit extended CAN IDs', writable: true, type: 'boolean' },
              heartbeat_rate_ms: { name: 'Heartbeat Rate', description: 'CAN heartbeat transmission rate (ms)', writable: true, type: 'number' },
              encoder_rate_ms: { name: 'Encoder Rate', description: 'CAN encoder message rate (ms)', writable: true, type: 'number' },
              encoder_error_rate_ms: { name: 'Encoder Error Rate', description: 'CAN encoder error message rate (ms)', writable: true, type: 'number' },
              controller_error_rate_ms: { name: 'Controller Error Rate', description: 'CAN controller error message rate (ms)', writable: true, type: 'number' },
              motor_error_rate_ms: { name: 'Motor Error Rate', description: 'CAN motor error message rate (ms)', writable: true, type: 'number' },
              sensorless_error_rate_ms: { name: 'Sensorless Error Rate', description: 'CAN sensorless error message rate (ms)', writable: true, type: 'number' },
            }
          },
          calibration_lockin: {
            name: 'Calibration Lock-in',
            description: 'Motor calibration lock-in parameters',
            properties: {
              current: { name: 'Lock-in Current', description: 'Current for motor lock-in during calibration (A)', writable: true, type: 'number', decimals: 1 },
              ramp_time: { name: 'Lock-in Ramp Time', description: 'Time to ramp to lock-in current (s)', writable: true, type: 'number', decimals: 3 },
              ramp_distance: { name: 'Lock-in Ramp Distance', description: 'Distance to ramp during lock-in', writable: true, type: 'number', decimals: 3 },
              accel: { name: 'Lock-in Acceleration', description: 'Acceleration during lock-in', writable: true, type: 'number', decimals: 3 },
              vel: { name: 'Lock-in Velocity', description: 'Velocity during lock-in', writable: true, type: 'number', decimals: 3 },
            }
          },
          sensorless_ramp: {
            name: 'Sensorless Ramp',
            description: 'Sensorless control ramp parameters',
            properties: {
              current: { name: 'Sensorless Current', description: 'Current for sensorless ramp (A)', writable: true, type: 'number', decimals: 1 },
              ramp_time: { name: 'Sensorless Ramp Time', description: 'Time for sensorless ramp (s)', writable: true, type: 'number', decimals: 3 },
              ramp_distance: { name: 'Sensorless Ramp Distance', description: 'Distance for sensorless ramp', writable: true, type: 'number', decimals: 3 },
              accel: { name: 'Sensorless Acceleration', description: 'Acceleration for sensorless ramp', writable: true, type: 'number', decimals: 3 },
              vel: { name: 'Sensorless Velocity', description: 'Velocity for sensorless ramp', writable: true, type: 'number', decimals: 3 },
              finish_distance: { name: 'Sensorless Finish Distance', description: 'Distance to finish sensorless ramp', writable: true, type: 'number', decimals: 3 },
              finish_on_vel: { name: 'Finish on Velocity', description: 'Finish sensorless ramp based on velocity', writable: true, type: 'boolean' },
              finish_on_distance: { name: 'Finish on Distance', description: 'Finish sensorless ramp based on distance', writable: true, type: 'boolean' },
            }
          },
          general_lockin: {
            name: 'General Lock-in',
            description: 'General lock-in parameters',
            properties: {
              current: { name: 'General Lock-in Current', description: 'Current for general lock-in (A)', writable: true, type: 'number', decimals: 1 },
              ramp_time: { name: 'General Lock-in Ramp Time', description: 'Time for general lock-in ramp (s)', writable: true, type: 'number', decimals: 3 },
              ramp_distance: { name: 'General Lock-in Ramp Distance', description: 'Distance for general lock-in ramp', writable: true, type: 'number', decimals: 3 },
              accel: { name: 'General Lock-in Acceleration', description: 'Acceleration for general lock-in', writable: true, type: 'number', decimals: 3 },
              vel: { name: 'General Lock-in Velocity', description: 'Velocity for general lock-in', writable: true, type: 'number', decimals: 3 },
              finish_distance: { name: 'General Finish Distance', description: 'Distance to finish general lock-in', writable: true, type: 'number', decimals: 3 },
              finish_on_vel: { name: 'General Finish on Velocity', description: 'Finish general lock-in based on velocity', writable: true, type: 'boolean' },
              finish_on_distance: { name: 'General Finish on Distance', description: 'Finish general lock-in based on distance', writable: true, type: 'boolean' },
            }
          }
        }
      },
      motor: {
        name: 'Motor',
        description: 'Motor status and measurements',
        properties: {
          last_error_time: { name: 'Last Error Time', description: 'Time of last motor error', writable: false, type: 'number' },
          error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number' },
          is_armed: { name: 'Is Armed', description: 'Motor armed state', writable: false, type: 'boolean' },
          is_calibrated: { name: 'Is Calibrated', description: 'Motor calibration status', writable: false, type: 'boolean' },
          current_meas_phA: { name: 'Phase A Current', description: 'Measured current in phase A (A)', writable: false, type: 'number', decimals: 3 },
          current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3 },
          current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3 },
          DC_calib_phA: { name: 'DC Calibration Phase A', description: 'DC calibration value for phase A', writable: false, type: 'number', decimals: 3 },
          DC_calib_phB: { name: 'DC Calibration Phase B', description: 'DC calibration value for phase B', writable: false, type: 'number', decimals: 3 },
          DC_calib_phC: { name: 'DC Calibration Phase C', description: 'DC calibration value for phase C', writable: false, type: 'number', decimals: 3 },
          I_bus: { name: 'Bus Current', description: 'DC bus current (A)', writable: false, type: 'number', decimals: 3 },
          phase_current_rev_gain: { name: 'Phase Current Rev Gain', description: 'Phase current reverse gain', writable: false, type: 'number', decimals: 6 },
          effective_current_lim: { name: 'Effective Current Limit', description: 'Effective current limit (A)', writable: false, type: 'number', decimals: 3 },
          max_allowed_current: { name: 'Max Allowed Current', description: 'Maximum allowed current (A)', writable: false, type: 'number', decimals: 3 },
          max_dc_calib: { name: 'Max DC Calibration', description: 'Maximum DC calibration value', writable: false, type: 'number', decimals: 3 },
          n_evt_current_measurement: { name: 'Current Measurement Events', description: 'Number of current measurement events', writable: false, type: 'number' },
          n_evt_pwm_update: { name: 'PWM Update Events', description: 'Number of PWM update events', writable: false, type: 'number' },
        },
        children: {
          current_control: {
            name: 'Current Control',
            description: 'Motor current control loop parameters',
            properties: {
              p_gain: { name: 'P Gain', description: 'Current controller proportional gain (auto-calculated)', writable: false, type: 'number', decimals: 6 },
              i_gain: { name: 'I Gain', description: 'Current controller integral gain (auto-calculated)', writable: false, type: 'number', decimals: 6 },
              v_current_control_integral_d: { name: 'Integral D', description: 'Current control integral D component', writable: false, type: 'number', decimals: 6 },
              v_current_control_integral_q: { name: 'Integral Q', description: 'Current control integral Q component', writable: false, type: 'number', decimals: 6 },
              Iq_setpoint: { name: 'Iq Setpoint', description: 'Quadrature current setpoint (A)', writable: false, type: 'number', decimals: 3 },
              Iq_measured: { name: 'Iq Measured', description: 'Measured quadrature current (A)', writable: false, type: 'number', decimals: 3 },
              Id_setpoint: { name: 'Id Setpoint', description: 'Direct current setpoint (A)', writable: false, type: 'number', decimals: 3 },
              Id_measured: { name: 'Id Measured', description: 'Measured direct current (A)', writable: false, type: 'number', decimals: 3 },
              power: { name: 'Power', description: 'Motor power consumption (W)', writable: false, type: 'number', decimals: 1 },
              Vq_setpoint: { name: 'Vq Setpoint', description: 'Quadrature voltage setpoint (V)', writable: false, type: 'number', decimals: 3 },
              Vd_setpoint: { name: 'Vd Setpoint', description: 'Direct voltage setpoint (V)', writable: false, type: 'number', decimals: 3 },
            }
          },
          config: {
            name: 'Motor Configuration',
            description: 'Motor configuration and calibration parameters',
            properties: {
              pre_calibrated: { name: 'Pre-calibrated', description: 'Motor marked as pre-calibrated', writable: true, type: 'boolean' },
              motor_type: { name: 'Motor Type', description: 'Motor type (0=HIGH_CURRENT, 2=GIMBAL, 3=ACIM)', writable: true, type: 'number' },
              pole_pairs: { name: 'Pole Pairs', description: 'Number of motor pole pairs', writable: true, type: 'number', step: 1 },
              calibration_current: { name: 'Calibration Current', description: 'Current used for motor calibration (A)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true },
              resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Maximum voltage for resistance calibration (V)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true },
              phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', min: 0, max: 0.01, step: 0.000001, decimals: 6, hasSlider: true },
              phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 3, hasSlider: true },
              torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6, hasSlider: true },
              current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true },
              current_lim_margin: { name: 'Current Limit Margin', description: 'Current limit safety margin (A)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true },
              torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true },
              inverter_temp_limit_lower: { name: 'Inverter Temp Limit Lower', description: 'Lower inverter temperature limit (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              inverter_temp_limit_upper: { name: 'Inverter Temp Limit Upper', description: 'Upper inverter temperature limit (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              requested_current_range: { name: 'Requested Current Range', description: 'Requested current measurement range (A)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              current_control_bandwidth: { name: 'Current Control Bandwidth', description: 'Current control loop bandwidth (Hz)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              acim_gain_min_flux: { name: 'ACIM Gain Min Flux', description: 'ACIM minimum flux gain', writable: true, type: 'number', decimals: 6, hasSlider: true },
              acim_autoflux_min_Id: { name: 'ACIM Autoflux Min Id', description: 'ACIM autoflux minimum Id current (A)', writable: true, type: 'number', decimals: 3, hasSlider: true },
              acim_autoflux_enable: { name: 'ACIM Autoflux Enable', description: 'Enable ACIM autoflux', writable: true, type: 'boolean' },
              acim_autoflux_attack_gain: { name: 'ACIM Autoflux Attack Gain', description: 'ACIM autoflux attack gain', writable: true, type: 'number', decimals: 6, hasSlider: true },
              acim_autoflux_decay_gain: { name: 'ACIM Autoflux Decay Gain', description: 'ACIM autoflux decay gain', writable: true, type: 'number', decimals: 6, hasSlider: true },
              bEMF_FF_enable: { name: 'bEMF Feed Forward Enable', description: 'Enable back-EMF feed forward', writable: true, type: 'boolean' },
            }
          },
          fet_thermistor: {
            name: 'FET Thermistor',
            description: 'FET temperature monitoring',
            properties: {
              temperature: { name: 'FET Temperature', description: 'FET thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
            },
            children: {
              config: {
                name: 'FET Thermistor Configuration',
                description: 'FET thermistor configuration parameters',
                properties: {
                  enabled: { name: 'Enable FET thermistor', description: 'Enable FET thermistor monitoring', writable: true, type: 'boolean' },
                  temp_limit_lower: { name: 'Lower Temperature Limit', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true },
                  temp_limit_upper: { name: 'Upper Temperature Limit', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true },
                }
              }
            }
          },
          motor_thermistor: {
            name: 'Motor Thermistor',
            description: 'Motor temperature monitoring',
            properties: {
              temperature: { name: 'Motor Temperature', description: 'Motor thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
            },
            children: {
              config: {
                name: 'Motor Thermistor Configuration',
                description: 'Motor thermistor configuration parameters',
                properties: {
                  enabled: { name: 'Enabled', description: 'Enable motor thermistor monitoring', writable: true, type: 'boolean' },
                  gpio_pin: { name: 'GPIO Pin', description: 'GPIO pin for motor thermistor input', writable: true, type: 'number' },
                  temp_limit_lower: { name: 'Lower Temperature Limit', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true },
                  temp_limit_upper: { name: 'Upper Temperature Limit', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true },
                }
              }
            }
          }
        }
      },
      encoder: {
        name: 'Encoder',
        description: 'Encoder settings and status',
        properties: {
          error: { name: 'Encoder Error', description: 'Current encoder error flags', writable: false, type: 'number' },
          is_ready: { name: 'Is Ready', description: 'Whether encoder is ready for use', writable: false, type: 'boolean' },
          index_found: { name: 'Index Found', description: 'Whether encoder index was found', writable: false, type: 'boolean' },
          shadow_count: { name: 'Shadow Count', description: 'Encoder shadow count', writable: false, type: 'number' },
          count_in_cpr: { name: 'Count in CPR', description: 'Count within one CPR', writable: false, type: 'number' },
          interpolation: { name: 'Interpolation', description: 'Encoder interpolation value', writable: false, type: 'number', decimals: 6 },
          phase: { name: 'Phase', description: 'Current electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
          pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (counts)', writable: false, type: 'number', decimals: 3 },
          pos_estimate_counts: { name: 'Position Estimate Counts', description: 'Position estimate in encoder counts', writable: false, type: 'number', decimals: 0 },
          pos_circular: { name: 'Circular Position', description: 'Circular position (0-1)', writable: false, type: 'number', decimals: 6 },
          pos_cpr_counts: { name: 'Position CPR Counts', description: 'Position in CPR counts', writable: false, type: 'number', decimals: 0 },
          delta_pos_cpr_counts: { name: 'Delta Position CPR Counts', description: 'Change in CPR counts', writable: false, type: 'number', decimals: 0 },
          hall_state: { name: 'Hall State', description: 'Current Hall sensor state', writable: false, type: 'number' },
          vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3 },
          vel_estimate_counts: { name: 'Velocity Estimate Counts', description: 'Velocity estimate in encoder counts/s', writable: false, type: 'number', decimals: 1 },
          calib_scan_response: { name: 'Calibration Scan Response', description: 'Encoder calibration scan response', writable: false, type: 'number', decimals: 6 },
          pos_abs: { name: 'Absolute Position', description: 'Absolute encoder position', writable: false, type: 'number', decimals: 6 },
          spi_error_rate: { name: 'SPI Error Rate', description: 'SPI communication error rate', writable: false, type: 'number', decimals: 6 },
        },
        children: {
          config: {
            name: 'Encoder Configuration',
            description: 'Encoder configuration and calibration parameters',
            properties: {
              mode: { name: 'Encoder Mode', description: 'Encoder mode (0=INCREMENTAL, 1=HALL, 2=SINCOS, 256=SPI_ABS_CUI, 257=SPI_ABS_AMS, 258=SPI_ABS_AEAT, 259=SPI_ABS_RLS, 260=SPI_ABS_MA732)', writable: true, type: 'number' },
              use_index: { name: 'Use Index', description: 'Use encoder index signal', writable: true, type: 'boolean' },
              find_idx_on_lockin_only: { name: 'Find Index on Lock-in Only', description: 'Only find index during lock-in phase', writable: true, type: 'boolean' },
              abs_spi_cs_gpio_pin: { name: 'Absolute SPI CS GPIO Pin', description: 'GPIO pin for absolute SPI chip select', writable: true, type: 'number' },
              cpr: { name: 'CPR', description: 'Counts per revolution', writable: true, type: 'number', step: 1, hasSlider: true },
              pre_calibrated: { name: 'Pre-calibrated', description: 'Mark encoder as pre-calibrated', writable: true, type: 'boolean' },
              enable_phase_interpolation: { name: 'Enable Phase Interpolation', description: 'Enable encoder phase interpolation', writable: true, type: 'boolean' },
              bandwidth: { name: 'Bandwidth', description: 'Encoder bandwidth (Hz)', writable: true, type: 'number', step: 10, hasSlider: true },
              calib_range: { name: 'Calib Range', description: 'Encoder calibration range tolerance', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true },
              calib_scan_distance: { name: 'Scan Distance', description: 'Encoder calibration scan distance', writable: true, type: 'number', step: 1000, hasSlider: true },
              calib_scan_omega: { name: 'Scan Omega', description: 'Encoder calibration scan speed (rad/s)', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true },
              ignore_illegal_hall_state: { name: 'Ignore Illegal Hall State', description: 'Ignore illegal Hall sensor states', writable: true, type: 'boolean' },
              sincos_gpio_pin_sin: { name: 'Sin/Cos GPIO Pin Sin', description: 'GPIO pin for sine signal', writable: true, type: 'number' },
              sincos_gpio_pin_cos: { name: 'Sin/Cos GPIO Pin Cos', description: 'GPIO pin for cosine signal', writable: true, type: 'number' },
              hall_polarity: {
                name: 'Hall Polarity',
                description: 'Hall sensor polarity',
                writable: true,
                type: 'number'
              },
              hall_polarity_calibrated: { name: 'Hall Polarity Calibrated', description: 'Hall sensor polarity calibration status', writable: true, type: 'number' },

              direction: { name: 'Direction', description: 'Encoder direction (1 or -1)', writable: true, type: 'number', min: -1, max: 1, step: 2 },
              use_index_offset: { name: 'Use Index Offset', description: 'Use encoder index offset', writable: true, type: 'boolean' },
              index_offset: { name: 'Index Offset', description: 'Encoder index offset', writable: true, type: 'number', decimals: 6 },
            }
          }
        }
      },
      sensorless_estimator: {
        name: 'Sensorless Estimator',
        description: 'Sensorless position estimation',
        properties: {
          error: { name: 'Sensorless Error', description: 'Sensorless estimator error flags', writable: false, type: 'number' },
          phase: { name: 'Phase', description: 'Estimated electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
          pll_pos: { name: 'PLL Position', description: 'PLL estimated position', writable: false, type: 'number', decimals: 6 },
          phase_vel: { name: 'Phase Velocity', description: 'Estimated electrical phase velocity (rad/s)', writable: false, type: 'number', decimals: 3 },
          vel_estimate: { name: 'Velocity Estimate', description: 'Sensorless velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3 },
        },
        children: {
          config: {
            name: 'Sensorless Configuration',
            description: 'Sensorless estimator configuration',
            properties: {
              observer_gain: { name: 'Observer Gain', description: 'Sensorless observer gain', writable: true, type: 'number', decimals: 6, hasSlider: true },
              pll_bandwidth: { name: 'PLL Bandwidth', description: 'PLL bandwidth (Hz)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              pm_flux_linkage: { name: 'PM Flux Linkage', description: 'Permanent magnet flux linkage (Wb)', writable: true, type: 'number', decimals: 6, hasSlider: true },
            }
          }
        }
      },
      controller: {
        name: 'Controller',
        description: 'Control loop parameters and settings',
        properties: {
          error: { name: 'Controller Error', description: 'Current controller error flags', writable: false, type: 'number' },
          last_error_time: { name: 'Last Error Time', description: 'Time of last controller error', writable: false, type: 'number' },
          input_pos: { name: 'Position Input', description: 'Position command input (turns)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.1, isSetpoint: true, hasSlider: true },
          input_vel: { name: 'Velocity Input', description: 'Velocity command input (turns/s)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.5, isSetpoint: true, hasSlider: true },
          input_torque: { name: 'Torque Input', description: 'Torque command input (Nm)', writable: true, type: 'number', decimals: 3, min: -10, max: 10, step: 0.1, isSetpoint: true, hasSlider: true },
          pos_setpoint: { name: 'Position Setpoint', description: 'Current position setpoint (counts)', writable: false, type: 'number', decimals: 3 },
          vel_setpoint: { name: 'Velocity Setpoint', description: 'Current velocity setpoint (counts/s)', writable: false, type: 'number', decimals: 3 },
          torque_setpoint: { name: 'Torque Setpoint', description: 'Current torque setpoint (Nm)', writable: false, type: 'number', decimals: 3 },
          trajectory_done: { name: 'Trajectory Done', description: 'Whether trajectory is complete', writable: false, type: 'boolean' },
          vel_integrator_torque: { name: 'Velocity Integrator Torque', description: 'Torque from velocity integrator (Nm)', writable: false, type: 'number', decimals: 6 },
          anticogging_valid: { name: 'Anticogging Valid', description: 'Whether anticogging calibration is valid', writable: false, type: 'boolean' },
          autotuning_phase: { name: 'Autotuning Phase', description: 'Current autotuning phase', writable: false, type: 'number' },
          mechanical_power: { name: 'Mechanical Power', description: 'Mechanical power output (W)', writable: false, type: 'number', decimals: 1 },
          electrical_power: { name: 'Electrical Power', description: 'Electrical power consumption (W)', writable: false, type: 'number', decimals: 1 },
        },
        children: {
          config: {
            name: 'Controller Configuration',
            description: 'Controller configuration parameters',
            properties: {
              control_mode: { name: 'Control Mode', description: 'Control mode (0=VOLTAGE, 1=TORQUE, 2=VELOCITY, 3=POSITION)', writable: true, type: 'number', min: 0, max: 3 },
              input_mode: { name: 'Input Mode', description: 'Input mode (0=INACTIVE, 1=PASSTHROUGH, 2=VEL_RAMP, 3=POS_FILTER, 4=MIX_CHANNELS, 5=TRAP_TRAJ, 6=TORQUE_RAMP, 7=MIRROR, 8=TUNING)', writable: true, type: 'number', min: 0, max: 8 },
              pos_gain: { name: 'Position Gain', description: 'Position controller proportional gain', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true },
              vel_gain: { name: 'Velocity Gain', description: 'Velocity controller proportional gain', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true },
              vel_integrator_gain: { name: 'Velocity Integrator Gain', description: 'Velocity controller integral gain', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true },
              vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity (counts/s)', writable: true, type: 'number', step: 1, hasSlider: true },
              vel_limit_tolerance: { name: 'Velocity Limit Tolerance', description: 'Velocity limit tolerance factor', writable: true, type: 'number', step: 0.01, decimals: 3, hasSlider: true },
              vel_ramp_rate: { name: 'Velocity Ramp Rate', description: 'Velocity ramp rate (counts/s²)', writable: true, type: 'number', step: 1, hasSlider: true },
              torque_ramp_rate: { name: 'Torque Ramp Rate', description: 'Torque ramp rate (Nm/s)', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true },
              circular_setpoints: { name: 'Circular Setpoints', description: 'Enable circular position setpoints', writable: true, type: 'boolean' },
              circular_setpoint_range: { name: 'Circular Setpoint Range', description: 'Range for circular setpoints (turns)', writable: true, type: 'number', decimals: 3, hasSlider: true },
              homing_speed: { name: 'Homing Speed', description: 'Speed for homing operations (counts/s)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              inertia: { name: 'Inertia', description: 'System inertia (kg⋅m²)', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true },
              axis_to_mirror: { name: 'Axis to Mirror', description: 'Axis number to mirror in mirror mode', writable: true, type: 'number' },
              mirror_ratio: { name: 'Mirror Ratio', description: 'Ratio for mirror mode', writable: true, type: 'number', decimals: 6 },
              load_encoder_axis: { name: 'Load Encoder Axis', description: 'Axis number for load encoder', writable: true, type: 'number' },
              input_filter_bandwidth: { name: 'Input Filter Bandwidth', description: 'Input filter bandwidth (Hz)', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true },
              enable_overspeed_error: { name: 'Enable Overspeed Error', description: 'Enable overspeed error detection', writable: true, type: 'boolean' },
              enable_torque_mode_vel_limit: { name: 'Enable Torque Mode Vel Limit', description: 'Enable velocity limit in torque mode', writable: true, type: 'boolean' },
              enable_gain_scheduling: { name: 'Enable Gain Scheduling', description: 'Enable controller gain scheduling', writable: true, type: 'boolean' },
              gain_scheduling_width: { name: 'Gain Scheduling Width', description: 'Width for gain scheduling (counts/s)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              enable_vel_limit: { name: 'Enable Velocity Limit', description: 'Enable velocity limiting', writable: true, type: 'boolean' },
              spinout_electrical_power_threshold: { name: 'Spinout Electrical Power Threshold', description: 'Electrical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              spinout_mechanical_power_threshold: { name: 'Spinout Mechanical Power Threshold', description: 'Mechanical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1, hasSlider: true },
            },
            children: {
              anticogging: {
                name: 'Anticogging',
                description: 'Anticogging compensation parameters',
                properties: {
                  index: { name: 'Anticogging Index', description: 'Current anticogging table index', writable: false, type: 'number' },
                  pre_calibrated: { name: 'Anticogging Pre-calibrated', description: 'Anticogging table pre-calibrated', writable: true, type: 'boolean' },
                  anticogging_enabled: { name: 'Anticogging Enabled', description: 'Enable anticogging compensation', writable: true, type: 'boolean' },
                  calib_anticogging: { name: 'Calibrate Anticogging', description: 'Start anticogging calibration', writable: false, type: 'boolean' },
                  calib_pos_threshold: { name: 'Calib Position Threshold', description: 'Position threshold for anticogging calibration', writable: true, type: 'number', decimals: 6, hasSlider: true },
                  calib_vel_threshold: { name: 'Calib Velocity Threshold', description: 'Velocity threshold for anticogging calibration', writable: true, type: 'number', decimals: 3, hasSlider: true },
                }
              }
            }
          },
          autotuning: {
            name: 'Autotuning',
            description: 'Controller autotuning parameters',
            properties: {
              frequency: { name: 'Frequency', description: 'Autotuning frequency (Hz)', writable: true, type: 'number', decimals: 1, hasSlider: true },
              torque_amplitude: { name: 'Torque Amplitude', description: 'Autotuning torque amplitude (Nm)', writable: true, type: 'number', decimals: 3, hasSlider: true },
            }
          }
        }
      },
      trap_traj: {
        name: 'Trapezoidal Trajectory',
        description: 'Trapezoidal trajectory generator',
        properties: {
          // No direct properties in TrapezoidalTrajectory per documentation
        },
        children: {
          config: {
            name: 'Trajectory Configuration',
            description: 'Trapezoidal trajectory configuration',
            properties: {
              vel_limit: { name: 'Velocity Limit', description: 'Maximum trajectory velocity (counts/s)', writable: true, type: 'number', step: 1, hasSlider: true },
              accel_limit: { name: 'Acceleration Limit', description: 'Maximum trajectory acceleration (counts/s²)', writable: true, type: 'number', step: 1, hasSlider: true },
              decel_limit: { name: 'Deceleration Limit', description: 'Maximum trajectory deceleration (counts/s²)', writable: true, type: 'number', step: 1, hasSlider: true },
            }
          }
        }
      },
      min_endstop: {
        name: 'Min Endstop',
        description: 'Minimum endstop configuration',
        properties: {
          endstop_state: { name: 'Endstop State', description: 'Current endstop state', writable: false, type: 'boolean' },
        },
        children: {
          config: {
            name: 'Min Endstop Configuration',
            description: 'Minimum endstop configuration parameters',
            properties: {
              gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for minimum endstop', writable: true, type: 'number' },
              enabled: { name: 'Enabled', description: 'Enable minimum endstop', writable: true, type: 'boolean' },
              offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', decimals: 3 },
              is_active_high: { name: 'Is Active High', description: 'Endstop is active high', writable: true, type: 'boolean' },
              debounce_ms: { name: 'Debounce Time', description: 'Endstop debounce time (ms)', writable: true, type: 'number' },
            }
          }
        }
      },
      max_endstop: {
        name: 'Max Endstop',
        description: 'Maximum endstop configuration',
        properties: {
          endstop_state: { name: 'Endstop State', description: 'Current endstop state', writable: false, type: 'boolean' },
        },
        children: {
          config: {
            name: 'Max Endstop Configuration',
            description: 'Maximum endstop configuration parameters',
            properties: {
              gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for maximum endstop', writable: true, type: 'number' },
              enabled: { name: 'Enabled', description: 'Enable maximum endstop', writable: true, type: 'boolean' },
              offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', decimals: 3 },
              is_active_high: { name: 'Is Active High', description: 'Endstop is active high', writable: true, type: 'boolean' },
              debounce_ms: { name: 'Debounce Time', description: 'Endstop debounce time (ms)', writable: true, type: 'number' },
            }
          }
        }
      },
      mechanical_brake: {
        name: 'Mechanical Brake',
        description: 'Mechanical brake control',
        properties: {
          // No direct properties in MechanicalBrake per documentation - only config
        },
        children: {
          config: {
            name: 'Mechanical Brake Configuration',
            description: 'Mechanical brake configuration parameters',
            properties: {
              gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for brake control', writable: true, type: 'number' },
              is_active_low: { name: 'Is Active Low', description: 'Brake control is active low', writable: true, type: 'boolean' },
            }
          }
        }
      },
      // REMOVED: task_times is a complex nested object structure that can't be directly accessed as individual properties
      // The errors show it's an "anonymous_interface" type which means it's a nested structure
      // Based on ODrive.Axis.TaskTimes in the documentation, these are complex objects, not simple values
    }
  }
};