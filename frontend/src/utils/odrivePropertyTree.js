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
      test_property: { name: 'Test Property', description: 'Test property for debugging', writable: true, type: 'number', decimals: 3 },
      
      // System config properties
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'DC bus overvoltage protection level (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1 },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'DC bus undervoltage protection level (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1 },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Maximum positive DC current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Maximum negative DC current (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1 },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable brake resistor', writable: true, type: 'boolean' },
      brake_resistance: { name: 'Brake Resistance', description: 'Brake resistor resistance (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2 },
      max_regen_current: { name: 'Max Regen Current', description: 'Maximum regenerative braking current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      enable_uart_a: { name: 'Enable UART A', description: 'Enable UART A interface', writable: true, type: 'boolean' },
      uart_a_baudrate: { name: 'UART A Baudrate', description: 'UART A communication baudrate', writable: true, type: 'number' },
      uart0_protocol: { name: 'UART0 Protocol', description: 'UART0 protocol selection', writable: true, type: 'number' },
      enable_uart_b: { name: 'Enable UART B', description: 'Enable UART B interface', writable: true, type: 'boolean' },
      uart_b_baudrate: { name: 'UART B Baudrate', description: 'UART B communication baudrate', writable: true, type: 'number' },
      uart1_protocol: { name: 'UART1 Protocol', description: 'UART1 protocol selection', writable: true, type: 'number' },
      enable_i2c_instead_of_can: { name: 'Enable I2C Instead of CAN', description: 'Use I2C interface instead of CAN', writable: true, type: 'boolean' },
      enable_ascii_protocol_on_usb: { name: 'Enable ASCII on USB', description: 'Enable ASCII protocol on USB', writable: true, type: 'boolean' },
      gpio1_mode: { name: 'GPIO1 Mode', description: 'GPIO pin 1 mode configuration', writable: true, type: 'number' },
      gpio2_mode: { name: 'GPIO2 Mode', description: 'GPIO pin 2 mode configuration', writable: true, type: 'number' },
      gpio3_mode: { name: 'GPIO3 Mode', description: 'GPIO pin 3 mode configuration', writable: true, type: 'number' },
      gpio4_mode: { name: 'GPIO4 Mode', description: 'GPIO pin 4 mode configuration', writable: true, type: 'number' },
      gpio5_mode: { name: 'GPIO5 Mode', description: 'GPIO pin 5 mode configuration', writable: true, type: 'number' },
      gpio6_mode: { name: 'GPIO6 Mode', description: 'GPIO pin 6 mode configuration', writable: true, type: 'number' },
      gpio7_mode: { name: 'GPIO7 Mode', description: 'GPIO pin 7 mode configuration', writable: true, type: 'number' },
      gpio8_mode: { name: 'GPIO8 Mode', description: 'GPIO pin 8 mode configuration', writable: true, type: 'number' },
      gpio1_pwm_mapping: { name: 'GPIO1 PWM Mapping', description: 'GPIO1 PWM endpoint mapping', writable: true, type: 'number' },
      gpio2_pwm_mapping: { name: 'GPIO2 PWM Mapping', description: 'GPIO2 PWM endpoint mapping', writable: true, type: 'number' },
      gpio3_pwm_mapping: { name: 'GPIO3 PWM Mapping', description: 'GPIO3 PWM endpoint mapping', writable: true, type: 'number' },
      gpio4_pwm_mapping: { name: 'GPIO4 PWM Mapping', description: 'GPIO4 PWM endpoint mapping', writable: true, type: 'number' },
      gpio5_pwm_mapping: { name: 'GPIO5 PWM Mapping', description: 'GPIO5 PWM endpoint mapping', writable: true, type: 'number' },
      gpio6_pwm_mapping: { name: 'GPIO6 PWM Mapping', description: 'GPIO6 PWM endpoint mapping', writable: true, type: 'number' },
      gpio7_pwm_mapping: { name: 'GPIO7 PWM Mapping', description: 'GPIO7 PWM endpoint mapping', writable: true, type: 'number' },
      gpio8_pwm_mapping: { name: 'GPIO8 PWM Mapping', description: 'GPIO8 PWM endpoint mapping', writable: true, type: 'number' },
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

  // Axis 0 tree structure
  axis0: {
    name: 'Axis 0',
    description: 'Motor axis 0 configuration and status',
    properties: {
      error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number' },
      current_state: { name: 'Current State', description: 'Current axis state', writable: false, type: 'number' },
      requested_state: { name: 'Requested State', description: 'Requested axis state', writable: true, type: 'number' },
      task_timer_armed: { name: 'Task Timer Armed', description: 'Whether task timer is armed', writable: false, type: 'boolean' },
      motor_thermistor_temp: { name: 'Motor Thermistor Temp', description: 'Motor thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
      fet_thermistor_temp: { name: 'FET Thermistor Temp', description: 'FET thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
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
          startup_sensorless_control: { name: 'Startup Sensorless Control', description: 'Enter sensorless control on startup', writable: true, type: 'boolean' },
          enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean' },
          step_dir_always_on: { name: 'Step/Dir Always On', description: 'Keep step/direction interface always enabled', writable: true, type: 'boolean' },
          turns_per_step: { name: 'Turns per Step', description: 'Motor turns per step input', writable: true, type: 'number', decimals: 6 },
          watchdog_timeout: { name: 'Watchdog Timeout', description: 'Watchdog timeout period (s)', writable: true, type: 'number', decimals: 3 },
          enable_watchdog: { name: 'Enable Watchdog', description: 'Enable watchdog timer', writable: true, type: 'boolean' },
          step_gpio_pin: { name: 'Step GPIO Pin', description: 'GPIO pin for step input', writable: true, type: 'number' },
          dir_gpio_pin: { name: 'Dir GPIO Pin', description: 'GPIO pin for direction input', writable: true, type: 'number' },
        },
        children: {
          can: {
            name: 'CAN Configuration',
            description: 'Axis-specific CAN settings',
            properties: {
              node_id: { name: 'Node ID', description: 'CAN node identifier', writable: true, type: 'number', min: 0, max: 63 },
              is_extended: { name: 'Extended ID', description: 'Use 29-bit extended CAN IDs', writable: true, type: 'boolean' },
              heartbeat_rate_ms: { name: 'Heartbeat Rate', description: 'CAN heartbeat transmission rate (ms)', writable: true, type: 'number' },
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
              finish_on_enc_count: { name: 'Finish on Encoder Count', description: 'Finish sensorless ramp based on encoder count', writable: true, type: 'boolean' },
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
              finish_on_enc_count: { name: 'General Finish on Encoder Count', description: 'Finish general lock-in based on encoder count', writable: true, type: 'boolean' },
            }
          }
        }
      },
      motor: {
        name: 'Motor',
        description: 'Motor status and measurements',
        properties: {
          error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number' },
          armed_state: { name: 'Armed State', description: 'Motor armed state', writable: false, type: 'number' },
          is_calibrated: { name: 'Is Calibrated', description: 'Motor calibration status', writable: false, type: 'boolean' },
          current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3 },
          current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3 },
          DC_calib_phB: { name: 'DC Calibration Phase B', description: 'DC calibration value for phase B', writable: false, type: 'number', decimals: 3 },
          DC_calib_phC: { name: 'DC Calibration Phase C', description: 'DC calibration value for phase C', writable: false, type: 'number', decimals: 3 },
          phase_current_rev_gain: { name: 'Phase Current Rev Gain', description: 'Phase current reverse gain', writable: false, type: 'number', decimals: 6 },
          effective_current_lim: { name: 'Effective Current Limit', description: 'Effective current limit (A)', writable: false, type: 'number', decimals: 3 },
          current_control_bandwidth: { name: 'Current Control Bandwidth', description: 'Current control bandwidth (Hz)', writable: false, type: 'number', decimals: 1 },
        },
        children: {
          current_control: {
            name: 'Current Control',
            description: 'Motor current control loop parameters',
            properties: {
              p_gain: { name: 'P Gain', description: 'Current controller proportional gain', writable: true, type: 'number', decimals: 6 },
              i_gain: { name: 'I Gain', description: 'Current controller integral gain', writable: true, type: 'number', decimals: 6 },
              v_current_control_integral_d: { name: 'Integral D', description: 'Current control integral D component', writable: false, type: 'number', decimals: 6 },
              v_current_control_integral_q: { name: 'Integral Q', description: 'Current control integral Q component', writable: false, type: 'number', decimals: 6 },
              Iq_setpoint: { name: 'Iq Setpoint', description: 'Quadrature current setpoint (A)', writable: false, type: 'number', decimals: 3 },
              Iq_measured: { name: 'Iq Measured', description: 'Measured quadrature current (A)', writable: false, type: 'number', decimals: 3 },
              Id_setpoint: { name: 'Id Setpoint', description: 'Direct current setpoint (A)', writable: false, type: 'number', decimals: 3 },
              Id_measured: { name: 'Id Measured', description: 'Measured direct current (A)', writable: false, type: 'number', decimals: 3 },
              I_bus: { name: 'Bus Current', description: 'DC bus current (A)', writable: false, type: 'number', decimals: 3 },
              power: { name: 'Power', description: 'Motor power consumption (W)', writable: false, type: 'number', decimals: 1 },
              Vq_setpoint: { name: 'Vq Setpoint', description: 'Quadrature voltage setpoint (V)', writable: false, type: 'number', decimals: 3 },
              Vd_setpoint: { name: 'Vd Setpoint', description: 'Direct voltage setpoint (V)', writable: false, type: 'number', decimals: 3 },
              mod_to_V: { name: 'Modulation to Voltage', description: 'Modulation to voltage conversion factor', writable: false, type: 'number', decimals: 6 },
              mod_d: { name: 'Modulation D', description: 'D-axis modulation', writable: false, type: 'number', decimals: 6 },
              mod_q: { name: 'Modulation Q', description: 'Q-axis modulation', writable: false, type: 'number', decimals: 6 },
            }
          },
          gate_driver: {
            name: 'Gate Driver',
            description: 'Motor gate driver status and configuration',
            properties: {
              drv_fault: { name: 'DRV Fault', description: 'Gate driver fault status', writable: false, type: 'number' },
              status_reg_1: { name: 'Status Register 1', description: 'Gate driver status register 1', writable: false, type: 'number' },
              status_reg_2: { name: 'Status Register 2', description: 'Gate driver status register 2', writable: false, type: 'number' },
              ctrl_reg_1: { name: 'Control Register 1', description: 'Gate driver control register 1', writable: true, type: 'number' },
              ctrl_reg_2: { name: 'Control Register 2', description: 'Gate driver control register 2', writable: true, type: 'number' },
            }
          },
          timing_log: {
            name: 'Timing Log',
            description: 'Motor timing measurements',
            properties: {
              current_meas: { name: 'Current Measurement Time', description: 'Time for current measurement (μs)', writable: false, type: 'number', decimals: 3 },
              FOC_voltage: { name: 'FOC Voltage Time', description: 'Time for FOC voltage calculation (μs)', writable: false, type: 'number', decimals: 3 },
              FOC_current: { name: 'FOC Current Time', description: 'Time for FOC current calculation (μs)', writable: false, type: 'number', decimals: 3 },
              SVM: { name: 'SVM Time', description: 'Time for space vector modulation (μs)', writable: false, type: 'number', decimals: 3 },
              sample_now: { name: 'Sample Now Time', description: 'Time for sampling (μs)', writable: false, type: 'number', decimals: 3 },
            }
          },
          config: {
            name: 'Motor Configuration',
            description: 'Motor configuration and calibration parameters',
            properties: {
              pre_calibrated: { name: 'Pre-calibrated', description: 'Motor marked as pre-calibrated', writable: true, type: 'boolean' },
              motor_type: { name: 'Motor Type', description: 'Motor type (0=HIGH_CURRENT, 1=GIMBAL)', writable: true, type: 'number' },
              pole_pairs: { name: 'Pole Pairs', description: 'Number of motor pole pairs', writable: true, type: 'number', step: 1 },
              calibration_current: { name: 'Calibration Current', description: 'Current used for motor calibration (A)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Maximum voltage for resistance calibration (V)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', min: 0, max: 0.01, step: 0.000001, decimals: 6 },
              phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 3 },
              torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
              direction: { name: 'Direction', description: 'Motor direction (1 or -1)', writable: true, type: 'number', min: -1, max: 1, step: 2 },
              motor_kv: { name: 'Motor Kv', description: 'Motor Kv rating (RPM/V)', writable: true, type: 'number', decimals: 1 },
              current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              current_lim_margin: { name: 'Current Limit Margin', description: 'Current limit safety margin (A)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', step: 0.1, decimals: 3 },
              inverter_temp_limit_lower: { name: 'Inverter Temp Limit Lower', description: 'Lower inverter temperature limit (°C)', writable: true, type: 'number', decimals: 1 },
              inverter_temp_limit_upper: { name: 'Inverter Temp Limit Upper', description: 'Upper inverter temperature limit (°C)', writable: true, type: 'number', decimals: 1 },
              requested_current_range: { name: 'Requested Current Range', description: 'Requested current measurement range (A)', writable: true, type: 'number', decimals: 1 },
              current_control_bandwidth: { name: 'Current Control Bandwidth', description: 'Current control loop bandwidth (Hz)', writable: true, type: 'number', decimals: 1 },
            }
          }
        }
      },
      encoder: {
        name: 'Encoder',
        description: 'Encoder settings and status',
        properties: {
          error: { name: 'Encoder Error', description: 'Current encoder error flags', writable: false, type: 'number' },
          pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (counts)', writable: false, type: 'number', decimals: 3 },
          pos_estimate_counts: { name: 'Position Estimate Counts', description: 'Position estimate in encoder counts', writable: false, type: 'number', decimals: 0 },
          pos_cpr_counts: { name: 'Position CPR Counts', description: 'Position in CPR counts', writable: false, type: 'number', decimals: 0 },
          vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3 },
          vel_estimate_counts: { name: 'Velocity Estimate Counts', description: 'Velocity estimate in encoder counts/s', writable: false, type: 'number', decimals: 1 },
          calib_scan_response: { name: 'Calibration Scan Response', description: 'Encoder calibration scan response', writable: false, type: 'number', decimals: 6 },
          pos_abs: { name: 'Absolute Position', description: 'Absolute encoder position', writable: false, type: 'number', decimals: 6 },
          pos_abs_multi: { name: 'Absolute Position Multi', description: 'Multi-turn absolute position', writable: false, type: 'number', decimals: 6 },
          pos_circular: { name: 'Circular Position', description: 'Circular position (0-1)', writable: false, type: 'number', decimals: 6 },
          hall_state: { name: 'Hall State', description: 'Current Hall sensor state', writable: false, type: 'number' },
          vel_estimate_valid: { name: 'Velocity Estimate Valid', description: 'Whether velocity estimate is valid', writable: false, type: 'boolean' },
          pos_estimate_valid: { name: 'Position Estimate Valid', description: 'Whether position estimate is valid', writable: false, type: 'boolean' },
          is_ready: { name: 'Is Ready', description: 'Whether encoder is ready for use', writable: false, type: 'boolean' },
          index_found: { name: 'Index Found', description: 'Whether encoder index was found', writable: false, type: 'boolean' },
          shadow_count: { name: 'Shadow Count', description: 'Encoder shadow count', writable: false, type: 'number' },
          count_in_cpr: { name: 'Count in CPR', description: 'Count within one CPR', writable: false, type: 'number' },
          interpolation: { name: 'Interpolation', description: 'Encoder interpolation value', writable: false, type: 'number', decimals: 6 },
          phase: { name: 'Phase', description: 'Current electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
          pos_estimate_linear_counts: { name: 'Position Linear Counts', description: 'Linear position estimate in counts', writable: false, type: 'number', decimals: 3 },
          pos_wrap_count: { name: 'Position Wrap Count', description: 'Number of position wraps', writable: false, type: 'number' },
          timing_log_sample_now: { name: 'Timing Log Sample Now', description: 'Encoder timing log sample now', writable: false, type: 'number', decimals: 3 },
        },
        children: {
          config: {
            name: 'Encoder Configuration',
            description: 'Encoder configuration and calibration parameters',
            properties: {
              mode: { name: 'Encoder Mode', description: 'Encoder mode (0=INCREMENTAL, 1=HALL, 2=SINCOS, 3=SPI_ABS_CUI, 4=SPI_ABS_AMS, 5=SPI_ABS_AEAT)', writable: true, type: 'number' },
              use_index: { name: 'Use Index', description: 'Use encoder index signal', writable: true, type: 'boolean' },
              find_idx_on_lockin_only: { name: 'Find Index on Lock-in Only', description: 'Only find index during lock-in phase', writable: true, type: 'boolean' },
              abs_spi_cs_gpio_pin: { name: 'Absolute SPI CS GPIO Pin', description: 'GPIO pin for absolute SPI chip select', writable: true, type: 'number' },
              zero_count_on_find_idx: { name: 'Zero Count on Find Index', description: 'Reset count to zero when index is found', writable: true, type: 'boolean' },
              cpr: { name: 'CPR', description: 'Counts per revolution', writable: true, type: 'number', step: 1 },
              offset: { name: 'Offset', description: 'Encoder offset (counts)', writable: true, type: 'number', decimals: 3 },
              pre_calibrated: { name: 'Pre-calibrated', description: 'Mark encoder as pre-calibrated', writable: true, type: 'boolean' },
              offset_float: { name: 'Offset Float', description: 'Floating point encoder offset', writable: true, type: 'number', decimals: 6 },
              enable_phase_interpolation: { name: 'Enable Phase Interpolation', description: 'Enable encoder phase interpolation', writable: true, type: 'boolean' },
              bandwidth: { name: 'Bandwidth', description: 'Encoder bandwidth (Hz)', writable: true, type: 'number', step: 10 },
              calib_range: { name: 'Calib Range', description: 'Encoder calibration range tolerance', writable: true, type: 'number', step: 0.001, decimals: 6 },
              calib_scan_distance: { name: 'Scan Distance', description: 'Encoder calibration scan distance', writable: true, type: 'number', step: 1000 },
              calib_scan_omega: { name: 'Scan Omega', description: 'Encoder calibration scan speed (rad/s)', writable: true, type: 'number', step: 0.1, decimals: 3 },
              idx_search_unidirectional: { name: 'Index Search Unidirectional', description: 'Search for index in one direction only', writable: true, type: 'boolean' },
              ignore_illegal_hall_state: { name: 'Ignore Illegal Hall State', description: 'Ignore illegal Hall sensor states', writable: true, type: 'boolean' },
              sincos_gpio_pin_sin: { name: 'Sin/Cos GPIO Pin Sin', description: 'GPIO pin for sine signal', writable: true, type: 'number' },
              sincos_gpio_pin_cos: { name: 'Sin/Cos GPIO Pin Cos', description: 'GPIO pin for cosine signal', writable: true, type: 'number' },
              hall_polarity_calibrated: { name: 'Hall Polarity Calibrated', description: 'Hall sensor polarity calibration status', writable: false, type: 'number' },
              hall_polarity: { name: 'Hall Polarity', description: 'Hall sensor polarity', writable: true, type: 'number' },
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
          vel_estimate: { name: 'Velocity Estimate', description: 'Sensorless velocity estimate (electrical rad/s)', writable: false, type: 'number', decimals: 3 },
          pos_estimate: { name: 'Position Estimate', description: 'Sensorless position estimate (electrical rad)', writable: false, type: 'number', decimals: 6 },
          flux_state_d: { name: 'Flux State D', description: 'D-axis flux state', writable: false, type: 'number', decimals: 6 },
          flux_state_q: { name: 'Flux State Q', description: 'Q-axis flux state', writable: false, type: 'number', decimals: 6 },
        },
        children: {
          config: {
            name: 'Sensorless Configuration',
            description: 'Sensorless estimator configuration',
            properties: {
              observer_gain: { name: 'Observer Gain', description: 'Sensorless observer gain', writable: true, type: 'number', decimals: 6 },
              pll_bandwidth: { name: 'PLL Bandwidth', description: 'PLL bandwidth (Hz)', writable: true, type: 'number', decimals: 1 },
              pm_flux_linkage: { name: 'PM Flux Linkage', description: 'Permanent magnet flux linkage (Wb)', writable: true, type: 'number', decimals: 6 },
            }
          }
        }
      },
      controller: {
        name: 'Controller',
        description: 'Control loop parameters and settings',
        properties: {
          error: { name: 'Controller Error', description: 'Current controller error flags', writable: false, type: 'number' },
          pos_setpoint: { name: 'Position Setpoint', description: 'Current position setpoint (counts)', writable: false, type: 'number', decimals: 3 },
          vel_setpoint: { name: 'Velocity Setpoint', description: 'Current velocity setpoint (counts/s)', writable: false, type: 'number', decimals: 3 },
          vel_integrator_torque: { name: 'Velocity Integrator Torque', description: 'Torque from velocity integrator (Nm)', writable: false, type: 'number', decimals: 6 },
          anticogging_valid: { name: 'Anticogging Valid', description: 'Whether anticogging calibration is valid', writable: false, type: 'boolean' },
          torque_setpoint: { name: 'Torque Setpoint', description: 'Current torque setpoint (Nm)', writable: false, type: 'number', decimals: 3 },
          trajectory_done: { name: 'Trajectory Done', description: 'Whether trajectory is complete', writable: false, type: 'boolean' },
          input_pos: { name: 'Position Input', description: 'Position command input (turns)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.1, isSetpoint: true },
          input_vel: { name: 'Velocity Input', description: 'Velocity command input (turns/s)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.5, isSetpoint: true },
          input_torque: { name: 'Torque Input', description: 'Torque command input (Nm)', writable: true, type: 'number', decimals: 3, min: -10, max: 10, step: 0.1, isSetpoint: true },
          pos_vel_setpoint: { name: 'Position Velocity Setpoint', description: 'Velocity setpoint from position controller (counts/s)', writable: false, type: 'number', decimals: 3 },
          electrical_power: { name: 'Electrical Power', description: 'Electrical power consumption (W)', writable: false, type: 'number', decimals: 1 },
          mechanical_power: { name: 'Mechanical Power', description: 'Mechanical power output (W)', writable: false, type: 'number', decimals: 1 },
        },
        children: {
          config: {
            name: 'Controller Configuration',
            description: 'Controller configuration parameters',
            properties: {
              control_mode: { name: 'Control Mode', description: 'Control mode (0=VOLTAGE, 1=TORQUE, 2=VELOCITY, 3=POSITION)', writable: true, type: 'number', min: 0, max: 3 },
              input_mode: { name: 'Input Mode', description: 'Input mode (0=INACTIVE, 1=PASSTHROUGH, 2=VEL_RAMP, 3=POS_FILTER, 4=MIX_CHANNELS, 5=TRAP_TRAJ, 6=TORQUE_RAMP, 7=MIRROR)', writable: true, type: 'number', min: 0, max: 7 },
              pos_gain: { name: 'Position Gain', description: 'Position controller proportional gain', writable: true, type: 'number', step: 0.1, decimals: 3 },
              vel_gain: { name: 'Velocity Gain', description: 'Velocity controller proportional gain', writable: true, type: 'number', step: 0.001, decimals: 6 },
              vel_integrator_gain: { name: 'Velocity Integrator Gain', description: 'Velocity controller integral gain', writable: true, type: 'number', step: 0.001, decimals: 6 },
              vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity (counts/s)', writable: true, type: 'number', step: 1 },
              vel_limit_tolerance: { name: 'Velocity Limit Tolerance', description: 'Velocity limit tolerance factor', writable: true, type: 'number', step: 0.01, decimals: 3 },
              vel_ramp_rate: { name: 'Velocity Ramp Rate', description: 'Velocity ramp rate (counts/s²)', writable: true, type: 'number', step: 1 },
              torque_ramp_rate: { name: 'Torque Ramp Rate', description: 'Torque ramp rate (Nm/s)', writable: true, type: 'number', step: 0.001, decimals: 6 },
              circular_setpoints: { name: 'Circular Setpoints', description: 'Enable circular position setpoints', writable: true, type: 'boolean' },
              circular_setpoint_range: { name: 'Circular Setpoint Range', description: 'Range for circular setpoints (turns)', writable: true, type: 'number', decimals: 3 },
              homing_speed: { name: 'Homing Speed', description: 'Speed for homing operations (counts/s)', writable: true, type: 'number', decimals: 1 },
              inertia: { name: 'Inertia', description: 'System inertia (kg⋅m²)', writable: true, type: 'number', step: 0.001, decimals: 6 },
              axis_to_mirror: { name: 'Axis to Mirror', description: 'Axis number to mirror in mirror mode', writable: true, type: 'number' },
              mirror_ratio: { name: 'Mirror Ratio', description: 'Ratio for mirror mode', writable: true, type: 'number', decimals: 6 },
              load_encoder_axis: { name: 'Load Encoder Axis', description: 'Axis number for load encoder', writable: true, type: 'number' },
              input_filter_bandwidth: { name: 'Input Filter Bandwidth', description: 'Input filter bandwidth (Hz)', writable: true, type: 'number', step: 0.1, decimals: 3 },
              spinout_electrical_power_threshold: { name: 'Spinout Electrical Power Threshold', description: 'Electrical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1 },
              spinout_mechanical_power_threshold: { name: 'Spinout Mechanical Power Threshold', description: 'Mechanical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1 },
              enable_overspeed_error: { name: 'Enable Overspeed Error', description: 'Enable overspeed error detection', writable: true, type: 'boolean' },
              enable_torque_mode_vel_limit: { name: 'Enable Torque Mode Vel Limit', description: 'Enable velocity limit in torque mode', writable: true, type: 'boolean' },
              enable_current_mode_vel_limit: { name: 'Enable Current Mode Vel Limit', description: 'Enable velocity limit in current mode', writable: true, type: 'boolean' },
              enable_gain_scheduling: { name: 'Enable Gain Scheduling', description: 'Enable controller gain scheduling', writable: true, type: 'boolean' },
              gain_scheduling_width: { name: 'Gain Scheduling Width', description: 'Width for gain scheduling (counts/s)', writable: true, type: 'number', decimals: 1 },
              enable_vel_limit: { name: 'Enable Velocity Limit', description: 'Enable velocity limiting', writable: true, type: 'boolean' },
            },
            children: {
              anticogging: {
                name: 'Anticogging',
                description: 'Anticogging compensation parameters',
                properties: {
                  index: { name: 'Anticogging Index', description: 'Current anticogging table index', writable: false, type: 'number' },
                  pre_calibrated: { name: 'Pre-calibrated', description: 'Anticogging table pre-calibrated', writable: true, type: 'boolean' },
                  anticogging_enabled: { name: 'Anticogging Enabled', description: 'Enable anticogging compensation', writable: true, type: 'boolean' },
                  calib_anticogging: { name: 'Calibrate Anticogging', description: 'Start anticogging calibration', writable: true, type: 'boolean' },
                  calib_pos_threshold: { name: 'Calibration Position Threshold', description: 'Position threshold for anticogging calibration', writable: true, type: 'number', decimals: 6 },
                  calib_vel_threshold: { name: 'Calibration Velocity Threshold', description: 'Velocity threshold for anticogging calibration', writable: true, type: 'number', decimals: 3 },
                }
              }
            }
          }
        }
      },
      trap_traj: {
        name: 'Trapezoidal Trajectory',
        description: 'Trapezoidal trajectory generator',
        properties: {
          pos_setpoint: { name: 'Position Setpoint', description: 'Trajectory position setpoint (counts)', writable: false, type: 'number', decimals: 3 },
          vel_setpoint: { name: 'Velocity Setpoint', description: 'Trajectory velocity setpoint (counts/s)', writable: false, type: 'number', decimals: 3 },
          accel_setpoint: { name: 'Acceleration Setpoint', description: 'Trajectory acceleration setpoint (counts/s²)', writable: false, type: 'number', decimals: 3 },
        },
        children: {
          config: {
            name: 'Trajectory Configuration',
            description: 'Trapezoidal trajectory configuration',
            properties: {
              vel_limit: { name: 'Velocity Limit', description: 'Maximum trajectory velocity (counts/s)', writable: true, type: 'number', step: 1 },
              accel_limit: { name: 'Acceleration Limit', description: 'Maximum trajectory acceleration (counts/s²)', writable: true, type: 'number', step: 1 },
              decel_limit: { name: 'Deceleration Limit', description: 'Maximum trajectory deceleration (counts/s²)', writable: true, type: 'number', step: 1 },
              A_per_css: { name: 'A per CSS', description: 'Acceleration per counts per second squared', writable: true, type: 'number', decimals: 6 },
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
              pullup: { name: 'Pullup', description: 'Enable GPIO pullup', writable: true, type: 'boolean' },
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
              pullup: { name: 'Pullup', description: 'Enable GPIO pullup', writable: true, type: 'boolean' },
              debounce_ms: { name: 'Debounce Time', description: 'Endstop debounce time (ms)', writable: true, type: 'number' },
            }
          }
        }
      },
      mechanical_brake: {
        name: 'Mechanical Brake',
        description: 'Mechanical brake control',
        properties: {
          is_armed: { name: 'Is Armed', description: 'Whether mechanical brake is armed', writable: false, type: 'boolean' },
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
      }
    }
  },

  // Axis 1 (copy of axis0 structure)
  axis1: {
    name: 'Axis 1',
    description: 'Motor axis 1 configuration and status',
    properties: {
      error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number' },
      current_state: { name: 'Current State', description: 'Current axis state', writable: false, type: 'number' },
      requested_state: { name: 'Requested State', description: 'Requested axis state', writable: true, type: 'number' },
      task_timer_armed: { name: 'Task Timer Armed', description: 'Whether task timer is armed', writable: false, type: 'boolean' },
      motor_thermistor_temp: { name: 'Motor Thermistor Temp', description: 'Motor thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
      fet_thermistor_temp: { name: 'FET Thermistor Temp', description: 'FET thermistor temperature (°C)', writable: false, type: 'number', decimals: 1 },
    },
    children: {
      // Same structure as axis0 - motor, encoder, controller, etc.
      // (truncated for brevity, but would include all the same nested structures)
      config: {
        name: 'Axis Configuration',
        description: 'Axis-level configuration parameters',
        properties: {
          startup_motor_calibration: { name: 'Startup Motor Calibration', description: 'Run motor calibration on startup', writable: true, type: 'boolean' },
          startup_encoder_index_search: { name: 'Startup Encoder Index Search', description: 'Run encoder index search on startup', writable: true, type: 'boolean' },
          startup_encoder_offset_calibration: { name: 'Startup Encoder Offset Cal', description: 'Run encoder offset calibration on startup', writable: true, type: 'boolean' },
          startup_closed_loop_control: { name: 'Startup Closed Loop Control', description: 'Enter closed loop control on startup', writable: true, type: 'boolean' },
          startup_sensorless_control: { name: 'Startup Sensorless Control', description: 'Enter sensorless control on startup', writable: true, type: 'boolean' },
          enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean' },
          step_dir_always_on: { name: 'Step/Dir Always On', description: 'Keep step/direction interface always enabled', writable: true, type: 'boolean' },
          turns_per_step: { name: 'Turns per Step', description: 'Motor turns per step input', writable: true, type: 'number', decimals: 6 },
          watchdog_timeout: { name: 'Watchdog Timeout', description: 'Watchdog timeout period (s)', writable: true, type: 'number', decimals: 3 },
          enable_watchdog: { name: 'Enable Watchdog', description: 'Enable watchdog timer', writable: true, type: 'boolean' },
          step_gpio_pin: { name: 'Step GPIO Pin', description: 'GPIO pin for step input', writable: true, type: 'number' },
          dir_gpio_pin: { name: 'Dir GPIO Pin', description: 'GPIO pin for direction input', writable: true, type: 'number' },
        }
      },
      motor: {
        name: 'Motor',
        description: 'Motor status and measurements',
        properties: {
          error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number' },
          armed_state: { name: 'Armed State', description: 'Motor armed state', writable: false, type: 'number' },
          is_calibrated: { name: 'Is Calibrated', description: 'Motor calibration status', writable: false, type: 'boolean' },
          current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3 },
          current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3 },
          DC_calib_phB: { name: 'DC Calibration Phase B', description: 'DC calibration value for phase B', writable: false, type: 'number', decimals: 3 },
          DC_calib_phC: { name: 'DC Calibration Phase C', description: 'DC calibration value for phase C', writable: false, type: 'number', decimals: 3 },
        },
        children: {
          config: {
            name: 'Motor Configuration',
            description: 'Motor configuration and calibration parameters',
            properties: {
              pre_calibrated: { name: 'Pre-calibrated', description: 'Motor marked as pre-calibrated', writable: true, type: 'boolean' },
              motor_type: { name: 'Motor Type', description: 'Motor type (0=HIGH_CURRENT, 1=GIMBAL)', writable: true, type: 'number' },
              pole_pairs: { name: 'Pole Pairs', description: 'Number of motor pole pairs', writable: true, type: 'number', step: 1 },
              calibration_current: { name: 'Calibration Current', description: 'Current used for motor calibration (A)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Maximum voltage for resistance calibration (V)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', min: 0, max: 0.01, step: 0.000001, decimals: 6 },
              phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 3 },
              torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
              direction: { name: 'Direction', description: 'Motor direction (1 or -1)', writable: true, type: 'number', min: -1, max: 1, step: 2 },
              current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', step: 0.1, decimals: 3 },
            }
          }
        }
      }
      // Additional axis1 subsections would follow the same pattern as axis0
    }
  }
}