export const odrivePropertyTree = {
  // Root system properties
  system: {
    name: 'System Properties',
    description: 'Top-level ODrive system settings and information',
    properties: {
      hw_version_major: { name: 'Hardware Version Major', description: 'Major hardware version', writable: false, type: 'number' },
      hw_version_minor: { name: 'Hardware Version Minor', description: 'Minor hardware version', writable: false, type: 'number' },
      fw_version_major: { name: 'Firmware Version Major', description: 'Major firmware version', writable: false, type: 'number' },
      fw_version_minor: { name: 'Firmware Version Minor', description: 'Minor firmware version', writable: false, type: 'number' },
      fw_version_revision: { name: 'Firmware Revision', description: 'Firmware revision number', writable: false, type: 'number' },
      fw_version_unreleased: { name: 'Firmware Unreleased', description: 'Unreleased firmware flag', writable: false, type: 'number' },
      serial_number: { name: 'Serial Number', description: 'Device serial number', writable: false, type: 'number' },
      user_config_loaded: { name: 'User Config Loaded', description: 'Whether user configuration is loaded', writable: false, type: 'number' },
      vbus_voltage: { name: 'VBus Voltage', description: 'VBus voltage measurement (V)', writable: false, type: 'number', decimals: 2 },
      ibus: { name: 'DC Bus Current', description: 'Current DC bus current (A)', writable: false, type: 'number', decimals: 3 },
      
      // System config properties
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'DC bus overvoltage protection level (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1 },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'DC bus undervoltage protection level (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1 },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Maximum positive DC current (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1 },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Maximum negative DC current (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1 },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable brake resistor', writable: true, type: 'boolean' },
      brake_resistance: { name: 'Brake Resistance', description: 'Brake resistor resistance (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2 },
    }
  },

  // Axis 0 tree structure
  axis0: {
    name: 'Axis 0',
    description: 'Motor axis 0 configuration and status',
    properties: {
      error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number' },
      current_state: { name: 'Current State', description: 'Current axis state', writable: false, type: 'number' },
    },
    children: {
      motor: {
        name: 'Motor',
        description: 'Motor status and measurements',
        properties: {
          error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number' },
          is_calibrated: { name: 'Is Calibrated', description: 'Motor calibration status', writable: false, type: 'boolean' },
          current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3 },
          current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3 },
          DC_calib_phB: { name: 'DC Calibration Phase B', description: 'DC calibration value for phase B', writable: false, type: 'number', decimals: 3 },
          DC_calib_phC: { name: 'DC Calibration Phase C', description: 'DC calibration value for phase C', writable: false, type: 'number', decimals: 3 },
        },
        children: {
          current_control: {
            name: 'Current Control',
            description: 'Motor current control loop parameters',
            properties: {
              Iq_measured: { name: 'Iq Measured', description: 'Measured quadrature current (A)', writable: false, type: 'number', decimals: 3 },
              Iq_setpoint: { name: 'Iq Setpoint', description: 'Quadrature current setpoint (A)', writable: false, type: 'number', decimals: 3 },
              Id_measured: { name: 'Id Measured', description: 'Measured direct current (A)', writable: false, type: 'number', decimals: 3 },
              Id_setpoint: { name: 'Id Setpoint', description: 'Direct current setpoint (A)', writable: false, type: 'number', decimals: 3 },
              Vq_setpoint: { name: 'Vq Setpoint', description: 'Quadrature voltage setpoint (V)', writable: false, type: 'number', decimals: 3 },
              Vd_setpoint: { name: 'Vd Setpoint', description: 'Direct voltage setpoint (V)', writable: false, type: 'number', decimals: 3 },
            }
          },
          config: {
            name: 'Motor Configuration',
            description: 'Motor configuration and calibration parameters',
            properties: {
              motor_type: { name: 'Motor Type', description: 'Motor type (0=HIGH_CURRENT, 1=GIMBAL)', writable: true, type: 'number' },
              pole_pairs: { name: 'Pole Pairs', description: 'Number of motor pole pairs', writable: true, type: 'number', step: 1 },
              current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', step: 0.1, decimals: 3 },
              calibration_current: { name: 'Calibration Current', description: 'Current used for motor calibration (A)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Maximum voltage for resistance calibration (V)', writable: true, type: 'number', step: 0.1, decimals: 1 },
              phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', min: 0, max: 0.01, step: 0.000001, decimals: 6 },
              phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 3 },
              torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6 },
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
          vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3 },
          is_ready: { name: 'Is Ready', description: 'Whether encoder is ready for use', writable: false, type: 'boolean' },
          index_found: { name: 'Index Found', description: 'Whether encoder index was found', writable: false, type: 'boolean' },
          hall_state: { name: 'Hall State', description: 'Current Hall sensor state', writable: false, type: 'number' },
          phase: { name: 'Phase', description: 'Current electrical phase (rad)', writable: false, type: 'number', decimals: 6 },
        },
        children: {
          config: {
            name: 'Encoder Configuration',
            description: 'Encoder configuration and calibration parameters',
            properties: {
              cpr: { name: 'CPR', description: 'Counts per revolution', writable: true, type: 'number', step: 1 },
              mode: { name: 'Encoder Mode', description: 'Encoder mode (0=HALL, 1=INCREMENTAL, 2=SINCOS)', writable: true, type: 'number' },
              use_index: { name: 'Use Index', description: 'Use encoder index signal', writable: true, type: 'boolean' },
              bandwidth: { name: 'Bandwidth', description: 'Encoder bandwidth (Hz)', writable: true, type: 'number', step: 10 },
              calib_scan_distance: { name: 'Scan Distance', description: 'Encoder calibration scan distance', writable: true, type: 'number', step: 1000 },
              calib_scan_omega: { name: 'Scan Omega', description: 'Encoder calibration scan speed (rad/s)', writable: true, type: 'number', step: 0.1, decimals: 3 },
              calib_range: { name: 'Calib Range', description: 'Encoder calibration range tolerance', writable: true, type: 'number', step: 0.001, decimals: 6 },
              direction: { name: 'Direction', description: 'Encoder counting direction (1 or -1)', writable: true, type: 'number', min: -1, max: 1, step: 2 },
              pre_calibrated: { name: 'Pre-calibrated', description: 'Mark encoder as pre-calibrated', writable: true, type: 'boolean' },
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
          torque_setpoint: { name: 'Torque Setpoint', description: 'Current torque setpoint (Nm)', writable: false, type: 'number', decimals: 3 },
          input_pos: { name: 'Position Input', description: 'Position command input (turns)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.1, isSetpoint: true },
          input_vel: { name: 'Velocity Input', description: 'Velocity command input (turns/s)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.5, isSetpoint: true },
          input_torque: { name: 'Torque Input', description: 'Torque command input (Nm)', writable: true, type: 'number', decimals: 3, min: -10, max: 10, step: 0.1, isSetpoint: true },
        },
        children: {
          config: {
            name: 'Controller Configuration',
            description: 'Controller configuration parameters',
            properties: {
              control_mode: { name: 'Control Mode', description: 'Control mode (0=VOLTAGE, 1=TORQUE, 2=VELOCITY, 3=POSITION)', writable: true, type: 'number', min: 0, max: 3 },
              input_mode: { name: 'Input Mode', description: 'Input mode (0=INACTIVE, 1=PASSTHROUGH, 2=VEL_RAMP, 3=POS_FILTER, 4=MIX_CHANNELS, 5=TRAP_TRAJ, 6=TORQUE_RAMP, 7=MIRROR)', writable: true, type: 'number', min: 0, max: 7 },
              vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity (counts/s)', writable: true, type: 'number', step: 1 },
              pos_gain: { name: 'Position Gain', description: 'Position controller proportional gain', writable: true, type: 'number', step: 0.1, decimals: 3 },
              vel_gain: { name: 'Velocity Gain', description: 'Velocity controller proportional gain', writable: true, type: 'number', step: 0.001, decimals: 6 },
              vel_integrator_gain: { name: 'Velocity Integrator Gain', description: 'Velocity controller integral gain', writable: true, type: 'number', step: 0.001, decimals: 6 },
              torque_ramp_rate: { name: 'Torque Ramp Rate', description: 'Torque ramp rate (Nm/s)', writable: true, type: 'number', step: 0.001, decimals: 6 },
              inertia: { name: 'Inertia', description: 'System inertia (kg⋅m²)', writable: true, type: 'number', step: 0.001, decimals: 6 },
              input_filter_bandwidth: { name: 'Input Filter Bandwidth', description: 'Input filter bandwidth (Hz)', writable: true, type: 'number', step: 0.1, decimals: 3 },
            }
          }
        }
      }
    }
  }
}