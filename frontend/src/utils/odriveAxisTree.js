// Firmware version utilities
const parseVersion = (versionString) => {
  if (!versionString || typeof versionString !== 'string') return { major: 0, minor: 5, patch: 6 };
  const parts = versionString.replace('v', '').split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 5,
    patch: parts[2] || 6
  };
};

const isVersion06x = (firmwareVersion) => {
  const version = parseVersion(firmwareVersion);
  return version.major === 0 && version.minor >= 6;
};

// Generate axis states based on firmware version
// eslint-disable-next-line no-unused-vars
const getAxisStateOptions = (firmwareVersion) => {
  const common = [
    { value: 0, label: 'Undefined' },
    { value: 1, label: 'Idle' },
    { value: 2, label: 'Startup Sequence' },
    { value: 3, label: 'Full Calibration' },
    { value: 4, label: 'Motor Calibration' },
    { value: 6, label: 'Encoder Index Search' },
    { value: 7, label: 'Encoder Offset Calibration' },
    { value: 8, label: 'Closed Loop Control' },
    { value: 9, label: 'Lockin Spin' },
    { value: 10, label: 'Encoder Direction Find' },
    { value: 11, label: 'Homing' },
    { value: 12, label: 'Encoder Hall Polarity Cal' },
    { value: 13, label: 'Encoder Hall Phase Cal' }
  ];
  
  // Both 0.5.x and 0.6.x use the same axis states
  return common;
};

export const generateAxisTree = (axisNumber, firmwareVersion = "0.5.6") => {
  const isV06x = isVersion06x(firmwareVersion);
  
  return {
    name: `Axis ${axisNumber}`,
    description: `Motor axis ${axisNumber} configuration and status`,
    properties: {
      // Version-specific error properties
      ...(isV06x ? {
        // 0.6.x uses active_errors instead of error
        active_errors: { name: 'Active Errors', description: 'Current active error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
        disarm_reason: { name: 'Disarm Reason', description: 'Reason why axis was last disarmed', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
        detailed_disarm_reason: { name: 'Detailed Disarm Reason', description: 'Detailed disarm reason code', writable: false, type: 'number', valueType: 'Uint32Property' },
      } : {
        // 0.5.x uses error 
        error: { name: 'Axis Error', description: 'Current axis error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Axis.Error]' },
      }),
      current_state: { 
        name: 'Current State', 
        description: 'Current axis state', 
        writable: false, type: 'number', 
        valueType: 'Property[ODrive.Axis.AxisState]',
        selectOptions: getAxisStateOptions(firmwareVersion)
      },
    requested_state: {
      name: 'Requested State',
      description: 'Requested axis state',
      writable: true,
      type: 'number',
      valueType: 'Property[ODrive.Axis.AxisState]',
      selectOptions: [
        { value: 0, label: 'Undefined' },
        { value: 1, label: 'Idle' },
        { value: 2, label: 'Startup Sequence' },
        { value: 3, label: 'Full Calibration' },
        { value: 4, label: 'Motor Calibration' },
        { value: 6, label: 'Encoder Index Search' },
        { value: 7, label: 'Encoder Offset Calibration' },
        { value: 8, label: 'Closed Loop Control' },
        { value: 9, label: 'Lockin Spin' },
        { value: 10, label: 'Encoder Direction Find' },
        { value: 11, label: 'Homing' },
        { value: 12, label: 'Encoder Hall Polarity Cal' },
        { value: 13, label: 'Encoder Hall Phase Cal' }
      ]
    },
    step_dir_active: { name: 'Step/Dir Active', description: 'Whether step/direction interface is active', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    last_drv_fault: { name: 'Last DRV Fault', description: 'Last gate driver fault', writable: false, type: 'number', valueType: 'Uint32Property' },
    steps: { name: 'Steps', description: 'Step count', writable: false, type: 'number', valueType: 'Int64Property' },
    // Position and velocity estimates
    pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (turns)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
    vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (turns/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
    is_homed: { name: 'Is Homed', description: 'Whether axis is homed', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    
    // 0.6.x specific properties
    ...(isV06x ? {
      is_armed: { name: 'Is Armed', description: 'Whether axis is armed', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      procedure_result: { name: 'Procedure Result', description: 'Result of last procedure/calibration', writable: false, type: 'number', valueType: 'Property[ODrive.ProcedureResult]' },
      disarm_time: { name: 'Disarm Time', description: 'Time when axis was disarmed', writable: false, type: 'number', valueType: 'Float32Property' },
      detailed_disarm_reason: { name: 'Detailed Disarm Reason', description: 'Detailed reason for axis disarm', writable: false, type: 'number', valueType: 'Property[ODrive.DisarmReason]' },
      observed_encoder_scale_factor: { name: 'Observed Encoder Scale Factor', description: 'Observed encoder-to-motor scale factor for debugging', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
    } : {}),
  },
  children: {
    config: {
      name: 'Axis Configuration',
      description: 'Axis-level configuration parameters',
      properties: {
        startup_motor_calibration: { name: 'Startup Motor Calibration', description: 'Run motor calibration on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_encoder_index_search: { name: 'Startup Encoder Index Search', description: 'Run encoder index search on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_encoder_offset_calibration: { name: 'Startup Encoder Offset Cal', description: 'Run encoder offset calibration on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_closed_loop_control: { name: 'Startup Closed Loop Control', description: 'Enter closed loop control on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_homing: { name: 'Startup Homing', description: 'Run homing on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        step_dir_always_on: { name: 'Step/Dir Always On', description: 'Keep step/direction interface always enabled', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        step_gpio_pin: { name: 'Step GPIO Pin', description: 'GPIO pin for step input', writable: true, type: 'number', valueType: 'Uint16Property' },
        dir_gpio_pin: { name: 'Dir GPIO Pin', description: 'GPIO pin for direction input', writable: true, type: 'number', valueType: 'Uint16Property' },
        enable_watchdog: { name: 'Enable Watchdog', description: 'Enable watchdog timer', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        watchdog_timeout: { name: 'Watchdog Timeout', description: 'Watchdog timeout period (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        enable_sensorless_mode: { name: 'Enable Sensorless Mode', description: 'Enable sensorless mode', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        
        // 0.6.x specific config properties
        ...(isV06x ? {
          user_config_0: { name: 'User Config 0', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          user_config_1: { name: 'User Config 1', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          user_config_2: { name: 'User Config 2', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          user_config_3: { name: 'User Config 3', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          user_config_4: { name: 'User Config 4', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          user_config_5: { name: 'User Config 5', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          user_config_6: { name: 'User Config 6', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          user_config_7: { name: 'User Config 7', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Int32Property' },
          enable_gpio_pin: { name: 'Enable GPIO Pin', description: 'GPIO pin for enable functionality', writable: true, type: 'number', valueType: 'Uint16Property' },
          
          // Startup configuration - 0.6.x additions
          startup_max_wait_for_ready: { name: 'Startup Max Wait for Ready', description: 'Maximum time to wait for errors to clear before startup (s)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          init_pos: { name: 'Init Position', description: 'Initial position when entering closed loop (NaN = current position)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          init_vel: { name: 'Init Velocity', description: 'Initial velocity setpoint when entering closed loop (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          init_torque: { name: 'Init Torque', description: 'Initial torque setpoint when entering closed loop (Nm)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          
          // Calibration properties moved from encoder config to axis config in 0.6.x
          calib_range: { name: 'Calibration Range', description: 'Maximum allowable error during encoder offset calibration', writable: true, type: 'number', decimals: 4, valueType: 'Float32Property' },
          calib_scan_distance: { name: 'Calibration Scan Distance', description: 'Distance to scan during encoder calibration', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          calib_scan_vel: { name: 'Calibration Scan Velocity', description: 'Velocity for encoder calibration scan (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          
          // Encoder bandwidth properties
          encoder_bandwidth: { name: 'Encoder Bandwidth', description: 'Bandwidth of the load encoder state estimator (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          commutation_encoder_bandwidth: { name: 'Commutation Encoder Bandwidth', description: 'Bandwidth of the commutation encoder state estimator (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          
          // Current limiters - 0.6.x DC current limiting
          I_bus_hard_min: { name: 'I Bus Hard Min', description: 'Hard minimum DC current limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          I_bus_hard_max: { name: 'I Bus Hard Max', description: 'Hard maximum DC current limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          I_bus_soft_min: { name: 'I Bus Soft Min', description: 'Soft minimum DC current limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          I_bus_soft_max: { name: 'I Bus Soft Max', description: 'Soft maximum DC current limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          
          // Power limiters - 0.6.x DC power limiting
          P_bus_soft_min: { name: 'P Bus Soft Min', description: 'Soft minimum DC power limit (W)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          P_bus_soft_max: { name: 'P Bus Soft Max', description: 'Soft maximum DC power limit (W)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        } : {}),
      },
      children: {
        can: {
          name: 'CAN Configuration',
          description: 'Axis-specific CAN settings',
          properties: {
            node_id: { name: 'Node ID', description: 'CAN node identifier', writable: true, type: 'number', min: 0, max: 63, valueType: 'Uint32Property' },
            is_extended: { name: 'Extended ID', description: 'Use 29-bit extended CAN IDs', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            heartbeat_rate_ms: { name: 'Heartbeat Rate', description: 'CAN heartbeat transmission rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            encoder_rate_ms: { name: 'Encoder Rate', description: 'CAN encoder message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            encoder_error_rate_ms: { name: 'Encoder Error Rate', description: 'CAN encoder error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            controller_error_rate_ms: { name: 'Controller Error Rate', description: 'CAN controller error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            motor_error_rate_ms: { name: 'Motor Error Rate', description: 'CAN motor error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            sensorless_error_rate_ms: { name: 'Sensorless Error Rate', description: 'CAN sensorless error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        },
        calibration_lockin: {
          name: 'Calibration Lock-in',
          description: 'Motor calibration lock-in parameters',
          properties: {
            current: { name: 'Lock-in Current', description: 'Current for motor lock-in during calibration (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            ramp_time: { name: 'Lock-in Ramp Time', description: 'Time to ramp to lock-in current (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            ramp_distance: { name: 'Lock-in Ramp Distance', description: 'Distance to ramp during lock-in', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            accel: { name: 'Lock-in Acceleration', description: 'Acceleration during lock-in', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel: { name: 'Lock-in Velocity', description: 'Velocity during lock-in', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          }
        },
        sensorless_ramp: {
          name: 'Sensorless Ramp',
          description: 'Sensorless control ramp parameters',
          properties: {
            current: { name: 'Sensorless Current', description: 'Current for sensorless ramp (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            ramp_time: { name: 'Sensorless Ramp Time', description: 'Time for sensorless ramp (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            ramp_distance: { name: 'Sensorless Ramp Distance', description: 'Distance for sensorless ramp', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            accel: { name: 'Sensorless Acceleration', description: 'Acceleration for sensorless ramp', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel: { name: 'Sensorless Velocity', description: 'Velocity for sensorless ramp', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_distance: { name: 'Sensorless Finish Distance', description: 'Distance to finish sensorless ramp', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_on_vel: { name: 'Finish on Velocity', description: 'Finish sensorless ramp based on velocity', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            finish_on_distance: { name: 'Finish on Distance', description: 'Finish sensorless ramp based on distance', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        },
        general_lockin: {
          name: 'General Lock-in',
          description: 'General lock-in parameters',
          properties: {
            current: { name: 'General Lock-in Current', description: 'Current for general lock-in (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            ramp_time: { name: 'General Lock-in Ramp Time', description: 'Time for general lock-in ramp (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            ramp_distance: { name: 'General Lock-in Ramp Distance', description: 'Distance for general lock-in ramp', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            accel: { name: 'General Lock-in Acceleration', description: 'Acceleration for general lock-in', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel: { name: 'General Lock-in Velocity', description: 'Velocity for general lock-in', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_distance: { name: 'General Finish Distance', description: 'Distance to finish general lock-in', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_on_vel: { name: 'General Finish on Velocity', description: 'Finish general lock-in based on velocity', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            finish_on_distance: { name: 'General Finish on Distance', description: 'Finish general lock-in based on distance', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        }
      }
    },
    motor: {
      name: 'Motor',
      description: 'Motor status and measurements',
      properties: {
        // Common properties across versions
        ...(isV06x ? {
          // 0.6.x uses different error structure
          // error is available through axis.active_errors instead
        } : {
          // 0.5.x specific motor properties
          last_error_time: { name: 'Last Error Time', description: 'Time of last motor error', writable: false, type: 'number', valueType: 'Float32Property' },
          error: { name: 'Motor Error', description: 'Current motor error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Motor.Error]' },
          is_armed: { name: 'Is Armed', description: 'Motor armed state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
          is_calibrated: { name: 'Is Calibrated', description: 'Motor calibration status', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        }),

        // Current measurements - available in both versions but may have different paths
        current_meas_phA: { name: 'Phase A Current', description: 'Measured current in phase A (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        DC_calib_phA: { name: 'DC Calibration Phase A', description: 'DC calibration value for phase A', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        DC_calib_phB: { name: 'DC Calibration Phase B', description: 'DC calibration value for phase B', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        DC_calib_phC: { name: 'DC Calibration Phase C', description: 'DC calibration value for phase C', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        I_bus: { name: 'Bus Current', description: 'DC bus current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        phase_current_rev_gain: { name: 'Phase Current Rev Gain', description: 'Phase current reverse gain', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        effective_current_lim: { name: 'Effective Current Limit', description: 'Effective current limit (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        max_allowed_current: { name: 'Max Allowed Current', description: 'Maximum allowed current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        max_dc_calib: { name: 'Max DC Calibration', description: 'Maximum DC calibration value', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        n_evt_current_measurement: { name: 'Current Measurement Events', description: 'Number of current measurement events', writable: false, type: 'number', valueType: 'Uint32Property' },
        n_evt_pwm_update: { name: 'PWM Update Events', description: 'Number of PWM update events', writable: false, type: 'number', valueType: 'Uint32Property' },
        
        // 0.6.x specific motor properties
        ...(isV06x ? {
          torque_estimate: { name: 'Torque Estimate', description: 'Estimated motor torque (Nm)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          mechanical_power: { name: 'Mechanical Power', description: 'Mechanical power output (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          electrical_power: { name: 'Electrical Power', description: 'Electrical power consumption (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          loss_power: { name: 'Loss Power', description: 'Motor loss power (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          current_meas_status: { name: 'Current Measurement Status', description: 'Status code for current measurement', writable: false, type: 'number', valueType: 'Uint32Property' },
          resistance_calibration_I_beta: { name: 'Resistance Cal I Beta', description: 'Beta current for resistance calibration debugging', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          input_id: { name: 'Input Id', description: 'Feedforward term for d-axis current (A)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          input_iq: { name: 'Input Iq', description: 'Feedforward term for q-axis current (A)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        } : {}),
      },
      children: {
        current_control: {
          name: 'Current Control',
          description: 'Motor current control loop parameters',
          properties: {
            p_gain: { name: 'P Gain', description: 'Current controller proportional gain (auto-calculated)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            i_gain: { name: 'I Gain', description: 'Current controller integral gain (auto-calculated)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            v_current_control_integral_d: { name: 'Integral D', description: 'Current control integral D component', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            v_current_control_integral_q: { name: 'Integral Q', description: 'Current control integral Q component', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            Iq_setpoint: { name: 'Iq Setpoint', description: 'Quadrature current setpoint (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Iq_measured: { name: 'Iq Measured', description: 'Measured quadrature current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Id_setpoint: { name: 'Id Setpoint', description: 'Direct current setpoint (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Id_measured: { name: 'Id Measured', description: 'Measured direct current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            power: { name: 'Power', description: 'Motor power consumption (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
            Vq_setpoint: { name: 'Vq Setpoint', description: 'Quadrature voltage setpoint (V)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Vd_setpoint: { name: 'Vd Setpoint', description: 'Direct voltage setpoint (V)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          }
        },
        config: {
          name: 'Motor Configuration',
          description: 'Motor configuration and calibration parameters',
          properties: {
            pre_calibrated: { name: 'Pre-calibrated', description: 'Motor marked as pre-calibrated', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            motor_type: { name: 'Motor Type', description: 'Motor type (0=HIGH_CURRENT, 2=GIMBAL, 3=ACIM)', writable: true, type: 'number', valueType: 'Property[ODrive.Motor.MotorType]',
              selectOptions: [
                { value: 0, label: 'High Current' },
                { value: 2, label: 'Gimbal' },
                { value: 3, label: 'ACIM' }
              ]
            },
            pole_pairs: { name: 'Pole Pairs', description: 'Number of motor pole pairs', writable: true, type: 'number', valueType: 'Int32Property' },
            calibration_current: { name: 'Calibration Current', description: 'Current used for motor calibration (A)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Maximum voltage for resistance calibration (V)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', min: 0, max: 0.01, step: 0.000001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', min: 0, max: 10, step: 0.001, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', min: 0, max: 1, step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            current_lim: { name: 'Current Limit', description: 'Motor current limit (A)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            current_lim_margin: { name: 'Current Limit Margin', description: 'Current limit safety margin (A)', writable: true, type: 'number', step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            torque_lim: { name: 'Torque Limit', description: 'Motor torque limit (Nm)', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            inverter_temp_limit_lower: { name: 'Inverter Temp Limit Lower', description: 'Lower inverter temperature limit (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            inverter_temp_limit_upper: { name: 'Inverter Temp Limit Upper', description: 'Upper inverter temperature limit (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            requested_current_range: { name: 'Requested Current Range', description: 'Requested current measurement range (A)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            current_control_bandwidth: { name: 'Current Control Bandwidth', description: 'Current control loop bandwidth (Hz)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            acim_autoflux_enable: { name: 'ACIM Autoflux Enable', description: 'Enable ACIM autoflux', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            acim_autoflux_attack_gain: { name: 'ACIM Autoflux Attack Gain', description: 'ACIM autoflux attack gain', writable: true, type: 'number', decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            acim_autoflux_decay_gain: { name: 'ACIM Autoflux Decay Gain', description: 'ACIM autoflux decay gain', writable: true, type: 'number', decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            bEMF_FF_enable: { name: 'bEMF Feed Forward Enable', description: 'Enable back-EMF feed forward', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            
            // Version-specific motor config properties
            ...(isV06x ? {
              // 0.6.x properties
              current_slew_rate_limit: { name: 'Current Slew Rate Limit', description: 'Current slew rate limit (A/s)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
              wL_FF_enable: { name: 'wL Feed Forward Enable', description: 'Enable wL feed forward (renamed from R_wL_FF_enable)', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              dI_dt_FF_enable: { name: 'dI/dt Feed Forward Enable', description: 'Enable inductance current slew rate feedforward', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              phase_resistance_valid: { name: 'Phase Resistance Valid', description: 'Phase resistance calibration valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              phase_inductance_valid: { name: 'Phase Inductance Valid', description: 'Phase inductance calibration valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              // Additional 0.6.x motor config properties
              power_torque_report_filter_bandwidth: { name: 'Power/Torque Report Filter Bandwidth', description: 'Filter bandwidth for power and torque reporting (Hz)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            } : {
              // 0.5.x properties
              R_wL_FF_enable: { name: 'R wL Feed Forward Enable', description: 'Enable R and wL feed forward', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              phase_resistance_inductance_valid: { name: 'Phase R & L Valid', description: 'Phase resistance and inductance calibration valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              requested_current_range: { name: 'Requested Current Range', description: 'Requested current measurement range (A)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            }),
          }
        },
        fet_thermistor: {
          name: 'FET Thermistor',
          description: 'FET temperature monitoring',
          properties: {
            temperature: { name: 'FET Temperature', description: 'FET thermistor temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          },
          children: {
            config: {
              name: 'FET Thermistor Configuration',
              description: 'FET thermistor configuration parameters',
              properties: {
                enabled: { name: 'Enable FET thermistor', description: 'Enable FET thermistor monitoring', writable: true, type: 'boolean', valueType: 'BoolProperty' },
                temp_limit_lower: { name: 'Lower Temperature Limit', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
                temp_limit_upper: { name: 'Upper Temperature Limit', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
              }
            }
          }
        },
        motor_thermistor: {
          name: 'Motor Thermistor',
          description: 'Motor temperature monitoring',
          properties: {
            temperature: { name: 'Motor Temperature', description: 'Motor thermistor temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          },
          children: {
            config: {
              name: 'Motor Thermistor Configuration',
              description: 'Motor thermistor configuration parameters',
              properties: {
                enabled: { name: 'Enabled', description: 'Enable motor thermistor monitoring', writable: true, type: 'boolean', valueType: 'BoolProperty' },
                gpio_pin: { name: 'GPIO Pin', description: 'GPIO pin for motor thermistor input', writable: true, type: 'number', valueType: 'Uint16Property' },
                temp_limit_lower: { name: 'Lower Temperature Limit', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
                temp_limit_upper: { name: 'Upper Temperature Limit', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
              }
            }
          }
        },
        
        // 0.6.x specific motor children
        ...(isV06x ? {
          dc_calib: {
            name: 'DC Calibration',
            description: 'Inverter DC calibration diagnostics (for diagnostics only)',
            properties: {
              // This is for diagnostics only and not for end user use
            }
          }
        } : {}),
      }
    },
    
    // 0.6.x thermal current limiters
    ...(isV06x ? {
      thermal_current_limiter: {
        name: 'Thermal Current Limiter',
        description: 'Built-in thermal current limiter',
        properties: {
          current_lim: { name: 'Current Limit', description: 'Current thermal current limit (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        },
        children: {
          config: {
            name: 'Thermal Current Limiter Configuration',
            description: 'Built-in thermal current limiter configuration',
            properties: {
              temp_limit_lower: { name: 'Lower Temperature Limit', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
              temp_limit_upper: { name: 'Upper Temperature Limit', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            }
          }
        }
      },
      motor_thermistor_current_limiter: {
        name: 'Motor Thermistor Current Limiter',
        description: 'Offboard thermistor current limiter for motor temperature',
        properties: {
          current_lim: { name: 'Current Limit', description: 'Current thermal current limit from motor thermistor (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          temperature: { name: 'Temperature', description: 'Motor thermistor temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        },
        children: {
          config: {
            name: 'Motor Thermistor Current Limiter Configuration',
            description: 'Motor thermistor current limiter configuration',
            properties: {
              gpio_pin: { name: 'GPIO Pin', description: 'GPIO pin for motor thermistor input', writable: true, type: 'number', valueType: 'Uint16Property' },
              temp_limit_lower: { name: 'Lower Temperature Limit', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
              temp_limit_upper: { name: 'Upper Temperature Limit', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
              poly_coefficient_0: { name: 'Polynomial Coefficient 0', description: 'Thermistor polynomial coefficient 0', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
              poly_coefficient_1: { name: 'Polynomial Coefficient 1', description: 'Thermistor polynomial coefficient 1', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
              poly_coefficient_2: { name: 'Polynomial Coefficient 2', description: 'Thermistor polynomial coefficient 2', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
              poly_coefficient_3: { name: 'Polynomial Coefficient 3', description: 'Thermistor polynomial coefficient 3', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            }
          }
        }
      }
    } : {}),
    // Encoder section - different structure for 0.5.x vs 0.6.x
    ...(isV06x ? {
      // 0.6.x encoder structure - split into multiple components
      load_mapper: {
        name: 'Load Mapper',
        description: 'Load encoder position mapping',
        properties: {
          status: { name: 'Status', description: 'Component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
          pos_rel: { name: 'Position Relative', description: 'Relative position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          pos_abs: { name: 'Position Absolute', description: 'Absolute position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          vel: { name: 'Velocity', description: 'Velocity estimate (turns/s)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          working_offset: { name: 'Working Offset', description: 'Current working offset for diagnostics', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          n_index_events: { name: 'Index Events Count', description: 'Number of index events detected', writable: false, type: 'number', valueType: 'Uint32Property' },
        },
        children: {
          config: {
            name: 'Load Mapper Configuration',
            description: 'Load mapper configuration parameters',
            properties: {
              scale: { name: 'Scale', description: 'Encoder scale factor', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
              offset: { name: 'Offset', description: 'Encoder offset', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            }
          }
        }
      },
      commutation_mapper: {
        name: 'Commutation Mapper',
        description: 'Commutation encoder position mapping',
        properties: {
          status: { name: 'Status', description: 'Component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
          pos_rel: { name: 'Position Relative', description: 'Relative commutation position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          pos_abs: { name: 'Position Absolute', description: 'Absolute commutation position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          vel: { name: 'Velocity', description: 'Commutation velocity estimate (turns/s)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          working_offset: { name: 'Working Offset', description: 'Current working offset for diagnostics', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          n_index_events: { name: 'Index Events Count', description: 'Number of index events detected', writable: false, type: 'number', valueType: 'Uint32Property' },
        },
        children: {
          config: {
            name: 'Commutation Mapper Configuration',
            description: 'Commutation mapper configuration parameters',
            properties: {
              scale: { name: 'Scale', description: 'Commutation encoder scale factor', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
              offset: { name: 'Offset', description: 'Commutation encoder offset', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            }
          }
        }
      },
      pos_vel_mapper: {
        name: 'Position Velocity Mapper',
        description: 'Combined position and velocity mapping',
        properties: {
          status: { name: 'Status', description: 'Component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
          pos_rel: { name: 'Position Relative', description: 'Relative position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          pos_abs: { name: 'Position Absolute', description: 'Absolute position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          vel: { name: 'Velocity', description: 'Velocity estimate (turns/s)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          working_offset: { name: 'Working Offset', description: 'Current working offset for diagnostics', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          n_index_events: { name: 'Index Events Count', description: 'Number of index events detected', writable: false, type: 'number', valueType: 'Uint32Property' },
        },
        children: {
          config: {
            name: 'Position Velocity Mapper Configuration',
            description: 'Position velocity mapper configuration parameters',
            properties: {
              approx_init_pos: { name: 'Approximate Initial Position', description: 'Approximate initial position for homing-free startup (turns)', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            }
          }
        }
      }
    } : {
      // 0.5.x encoder structure - monolithic encoder
      encoder: {
        name: 'Encoder',
        description: 'Encoder settings and status',
        properties: {
          error: { name: 'Encoder Error', description: 'Current encoder error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Encoder.Error]' },
          is_ready: { name: 'Is Ready', description: 'Whether encoder is ready for use', writable: false, type: 'boolean', valueType: 'BoolProperty' },
          index_found: { name: 'Index Found', description: 'Whether encoder index was found', writable: false, type: 'boolean', valueType: 'BoolProperty' },
          shadow_count: { name: 'Shadow Count', description: 'Encoder shadow count', writable: false, type: 'number', valueType: 'Int32Property' },
          count_in_cpr: { name: 'Count in CPR', description: 'Count within one CPR', writable: false, type: 'number', valueType: 'Int32Property' },
          interpolation: { name: 'Interpolation', description: 'Encoder interpolation value', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          phase: { name: 'Phase', description: 'Current electrical phase (rad)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (counts)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          pos_estimate_counts: { name: 'Position Estimate Counts', description: 'Position estimate in encoder counts', writable: false, type: 'number', decimals: 0, valueType: 'Float32Property' },
          pos_circular: { name: 'Circular Position', description: 'Circular position (0-1)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          pos_cpr_counts: { name: 'Position CPR Counts', description: 'Position in CPR counts', writable: false, type: 'number', decimals: 0, valueType: 'Float32Property' },
            delta_pos_cpr_counts: { name: 'Delta Position CPR Counts', description: 'Change in CPR counts', writable: false, type: 'number', decimals: 0, valueType: 'Float32Property' },
          hall_state: { name: 'Hall State', description: 'Current Hall sensor state', writable: false, type: 'number', valueType: 'Uint8Property' },
          vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          vel_estimate_counts: { name: 'Velocity Estimate Counts', description: 'Velocity estimate in encoder counts/s', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          calib_scan_response: { name: 'Calibration Scan Response', description: 'Encoder calibration scan response', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          pos_abs: { name: 'Absolute Position', description: 'Absolute encoder position', writable: false, type: 'number', decimals: 6, valueType: 'Int32Property' },
          spi_error_rate: { name: 'SPI Error Rate', description: 'SPI communication error rate', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        },
        children: {
          config: {
            name: 'Encoder Configuration',
            description: 'Encoder configuration and calibration parameters',
            properties: {
              mode: {
                name: 'Encoder Mode',
                description: 'Encoder mode selection',
                writable: true,
                type: 'number',
                valueType: 'Property[ODrive.Encoder.Mode]',
                selectOptions: [
                  { value: 0, label: 'Incremental' },
                  { value: 1, label: 'Hall' },
                  { value: 2, label: 'SinCos' },
                  { value: 256, label: 'SPI Absolute CUI' },
                  { value: 257, label: 'SPI Absolute AMS' },
                  { value: 258, label: 'SPI Absolute AEAT' },
                  { value: 259, label: 'SPI Absolute RLS' },
                  { value: 260, label: 'SPI Absolute MA732' }
                ]
              },
              use_index: { name: 'Use Index', description: 'Use encoder index signal', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              find_idx_on_lockin_only: { name: 'Find Index on Lock-in Only', description: 'Only find index during lock-in phase', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              abs_spi_cs_gpio_pin: { name: 'Absolute SPI CS GPIO Pin', description: 'GPIO pin for absolute SPI chip select', writable: true, type: 'number', valueType: 'Uint16Property' },
              cpr: { name: 'CPR', description: 'Counts per revolution', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Int32Property' },
              pre_calibrated: { name: 'Pre-calibrated', description: 'Mark encoder as pre-calibrated', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              enable_phase_interpolation: { name: 'Enable Phase Interpolation', description: 'Enable encoder phase interpolation', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              bandwidth: { name: 'Bandwidth', description: 'Encoder bandwidth (Hz)', writable: true, type: 'number', step: 10, hasSlider: true, valueType: 'Float32Property' },
              calib_range: { name: 'Calib Range', description: 'Encoder calibration range tolerance', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
              calib_scan_distance: { name: 'Scan Distance', description: 'Encoder calibration scan distance', writable: true, type: 'number', step: 1000, hasSlider: true, valueType: 'Float32Property' },
              calib_scan_omega: { name: 'Scan Omega', description: 'Encoder calibration scan speed (rad/s)', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
              ignore_illegal_hall_state: { name: 'Ignore Illegal Hall State', description: 'Ignore illegal Hall sensor states', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              sincos_gpio_pin_sin: { name: 'Sin/Cos GPIO Pin Sin', description: 'GPIO pin for sine signal', writable: true, type: 'number', valueType: 'Uint16Property' },
              sincos_gpio_pin_cos: { name: 'Sin/Cos GPIO Pin Cos', description: 'GPIO pin for cosine signal', writable: true, type: 'number', valueType: 'Uint16Property' },
              hall_polarity_calibrated: { name: 'Hall Polarity Calibrated', description: 'Hall sensor polarity calibration status', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              direction: {
                name: 'Direction',
                description: 'Encoder direction (1 or -1)',
                writable: true,
                type: 'number',
                valueType: 'Int32Property',
                selectOptions: [
                  { value: 1, label: 'Forward (1)' },
                  { value: -1, label: 'Reverse (-1)' }
                ]
              },
              hall_polarity: {
                name: 'Hall Polarity',
                description: 'Hall sensor polarity',
                writable: true,
                type: 'number',
                valueType: 'Uint8Property'
              },
              use_index_offset: { name: 'Use Index Offset', description: 'Use encoder index offset', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              index_offset: { name: 'Index Offset', description: 'Encoder index offset', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
              
              // 0.6.x specific encoder properties
              ...(isV06x ? {
                filter: { name: 'Filter', description: 'Filter configuration for incremental encoder', writable: true, type: 'number', valueType: 'Property[ODrive.IncrementalEncoderFilter]',
                  selectOptions: [
                    { value: 0, label: 'Sync Only' },
                    { value: 1, label: 'N=2' },
                    { value: 2, label: 'N=4' }
                  ]
                },
                biss_c_multiturn_bits: { name: 'BISS-C Multiturn Bits', description: 'Number of multiturn bits for BISS-C encoder (experimental)', writable: true, type: 'number', valueType: 'Uint32Property' },
              } : {}),
            }
          }
        }
      }
    }),
    
    // 0.6.x specific children - Harmonic Compensation
    ...(isV06x ? {
      harmonic_compensation: {
        name: 'Harmonic Compensation',
        description: 'Harmonic compensation for encoder distortion',
        properties: {
          cosx_coef: { name: 'Cos X Coefficient', description: '1st harmonic cosine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          sinx_coef: { name: 'Sin X Coefficient', description: '1st harmonic sine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          cos2x_coef: { name: 'Cos 2X Coefficient', description: '2nd harmonic cosine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          sin2x_coef: { name: 'Sin 2X Coefficient', description: '2nd harmonic sine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        },
        children: {
          config: {
            name: 'Harmonic Compensation Configuration',
            description: 'Harmonic compensation calibration parameters',
            properties: {
              calib_vel: { name: 'Calibration Velocity', description: 'Motor velocity for harmonic calibration (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
              calib_turns: { name: 'Calibration Turns', description: 'Number of turns for harmonic calibration', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
              calib_settling_delay: { name: 'Calibration Settling Delay', description: 'Settling delay between harmonic calibration measurements (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            }
          }
        }
      },
    } : {}),


    sensorless_estimator: {
      name: 'Sensorless Estimator',
      description: 'Sensorless position estimation',
      properties: {
        error: { name: 'Sensorless Error', description: 'Sensorless estimator error flags', writable: false, type: 'number', valueType: 'Property[ODrive.SensorlessEstimator.Error]' },
        phase: { name: 'Phase', description: 'Estimated electrical phase (rad)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        pll_pos: { name: 'PLL Position', description: 'PLL estimated position', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        phase_vel: { name: 'Phase Velocity', description: 'Estimated electrical phase velocity (rad/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        vel_estimate: { name: 'Velocity Estimate', description: 'Sensorless velocity estimate (counts/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      },
      children: {
        config: {
          name: 'Sensorless Configuration',
          description: 'Sensorless estimator configuration',
          properties: {
            observer_gain: { name: 'Observer Gain', description: 'Sensorless observer gain', writable: true, type: 'number', decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            pll_bandwidth: { name: 'PLL Bandwidth', description: 'PLL bandwidth (Hz)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            pm_flux_linkage: { name: 'PM Flux Linkage', description: 'Permanent magnet flux linkage (Wb)', writable: true, type: 'number', decimals: 6, hasSlider: true, valueType: 'Float32Property' },
          }
        }
      }
    },
    controller: {
      name: 'Controller',
      description: 'Control loop parameters and settings',
      properties: {
        // Version-specific error properties
        ...(!isV06x ? {
          // 0.5.x has individual controller errors
          error: { name: 'Controller Error', description: 'Current controller error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Controller.Error]' },
          last_error_time: { name: 'Last Error Time', description: 'Time of last controller error', writable: false, type: 'number', valueType: 'Float32Property' },
        } : {}),
        
        // Common properties for both versions
        input_pos: { name: 'Position Input', description: 'Position command input (turns)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.1, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        input_vel: { name: 'Velocity Input', description: 'Velocity command input (turns/s)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.5, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        input_torque: { name: 'Torque Input', description: 'Torque command input (Nm)', writable: true, type: 'number', decimals: 3, min: -10, max: 10, step: 0.1, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        pos_setpoint: { name: 'Position Setpoint', description: 'Current position setpoint (counts)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        vel_setpoint: { name: 'Velocity Setpoint', description: 'Current velocity setpoint (counts/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        torque_setpoint: { name: 'Torque Setpoint', description: 'Current torque setpoint (Nm)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        trajectory_done: { name: 'Trajectory Done', description: 'Whether trajectory is complete', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        vel_integrator_torque: { name: 'Velocity Integrator Torque', description: 'Torque from velocity integrator (Nm)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        anticogging_valid: { name: 'Anticogging Valid', description: 'Whether anticogging calibration is valid', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        autotuning_phase: { name: 'Autotuning Phase', description: 'Current autotuning phase', writable: false, type: 'number', valueType: 'Float32Property' },
        mechanical_power: { name: 'Mechanical Power', description: 'Mechanical power output (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        electrical_power: { name: 'Electrical Power', description: 'Electrical power consumption (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        
        // 0.6.x specific controller properties
        ...(isV06x ? {
          effective_torque_setpoint: { name: 'Effective Torque Setpoint', description: 'Effective torque commanded by controller (Nm)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          spinout_electrical_power: { name: 'Spinout Electrical Power', description: 'Electrical power for spinout detection (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          spinout_mechanical_power: { name: 'Spinout Mechanical Power', description: 'Mechanical power for spinout detection (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        } : {}),
      },
      children: {
        config: {
          name: 'Controller Configuration',
          description: 'Controller configuration parameters',
          properties: {
            control_mode: {
              name: 'Control Mode',
              description: 'Control mode (0=VOLTAGE, 1=TORQUE, 2=VELOCITY, 3=POSITION)',
              writable: true,
              type: 'number',
              min: 0,
              max: 3,
              valueType: 'Property[ODrive.Controller.ControlMode]',
              selectOptions: [
                { value: 0, label: 'Voltage Control' },
                { value: 1, label: 'Torque Control' },
                { value: 2, label: 'Velocity Control' },
                { value: 3, label: 'Position Control' }
              ]
            },
            input_mode: {
              name: 'Input Mode',
              description: 'Input mode (0=INACTIVE, 1=PASSTHROUGH, 2=VEL_RAMP, 3=POS_FILTER, 4=MIX_CHANNELS, 5=TRAP_TRAJ, 6=TORQUE_RAMP, 7=MIRROR, 8=TUNING)',
              writable: true,
              type: 'number',
              min: 0,
              max: 8,
              valueType: 'Property[ODrive.Controller.InputMode]',
              selectOptions: [
                { value: 0, label: 'Inactive' },
                { value: 1, label: 'Passthrough' },
                { value: 2, label: 'Velocity Ramp' },
                { value: 3, label: 'Position Filter' },
                { value: 4, label: 'Mix Channels' },
                { value: 5, label: 'Trapezoidal Trajectory' },
                { value: 6, label: 'Torque Ramp' },
                { value: 7, label: 'Mirror' },
                { value: 8, label: 'Tuning' }
              ]
            },
            pos_gain: { name: 'Position Gain', description: 'Position controller proportional gain', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            vel_gain: { name: 'Velocity Gain', description: 'Velocity controller proportional gain', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            vel_integrator_gain: { name: 'Velocity Integrator Gain', description: 'Velocity controller integral gain', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity (counts/s)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            vel_limit_tolerance: { name: 'Velocity Limit Tolerance', description: 'Velocity limit tolerance factor', writable: true, type: 'number', step: 0.01, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            vel_ramp_rate: { name: 'Velocity Ramp Rate', description: 'Velocity ramp rate (counts/s²)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            torque_ramp_rate: { name: 'Torque Ramp Rate', description: 'Torque ramp rate (Nm/s)', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            circular_setpoints: { name: 'Circular Setpoints', description: 'Enable circular position setpoints', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            circular_setpoint_range: { name: 'Circular Setpoint Range', description: 'Range for circular setpoints (turns)', writable: true, type: 'number', decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            homing_speed: { name: 'Homing Speed', description: 'Speed for homing operations (counts/s)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            inertia: { name: 'Inertia', description: 'System inertia (kg⋅m²)', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            axis_to_mirror: { name: 'Axis to Mirror', description: 'Axis number to mirror in mirror mode', writable: true, type: 'number', valueType: 'Uint8Property' },
            mirror_ratio: { name: 'Mirror Ratio', description: 'Ratio for mirror mode', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            load_encoder_axis: { name: 'Load Encoder Axis', description: 'Axis number for load encoder', writable: true, type: 'number', valueType: 'Uint8Property' },
            input_filter_bandwidth: { name: 'Input Filter Bandwidth', description: 'Input filter bandwidth (Hz)', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            enable_overspeed_error: { name: 'Enable Overspeed Error', description: 'Enable overspeed error detection', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            enable_torque_mode_vel_limit: { name: 'Enable Torque Mode Vel Limit', description: 'Enable velocity limit in torque mode', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            enable_gain_scheduling: { name: 'Enable Gain Scheduling', description: 'Enable controller gain scheduling', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            gain_scheduling_width: { name: 'Gain Scheduling Width', description: 'Width for gain scheduling (counts/s)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            enable_vel_limit: { name: 'Enable Velocity Limit', description: 'Enable velocity limiting', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            spinout_electrical_power_threshold: { name: 'Spinout Electrical Power Threshold', description: 'Electrical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            spinout_mechanical_power_threshold: { name: 'Spinout Mechanical Power Threshold', description: 'Mechanical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            
            // 0.6.x specific controller config properties
            ...(isV06x ? {
              absolute_setpoints: { name: 'Absolute Setpoints', description: 'Use absolute position setpoints', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              use_commutation_vel: { name: 'Use Commutation Velocity', description: 'Use commutation velocity for control', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              mechanical_power_bandwidth: { name: 'Mechanical Power Bandwidth', description: 'Bandwidth for mechanical power calculation (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
              electrical_power_bandwidth: { name: 'Electrical Power Bandwidth', description: 'Bandwidth for electrical power calculation (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            } : {}),
          },
          children: {
            anticogging: {
              name: 'Anticogging',
              description: 'Anticogging compensation parameters',
              properties: {
                index: { name: 'Anticogging Index', description: 'Current anticogging table index', writable: false, type: 'number', valueType: 'Uint32Property' },
                pre_calibrated: { name: 'Anticogging Pre-calibrated', description: 'Anticogging table pre-calibrated', writable: true, type: 'boolean', valueType: 'BoolProperty' },
                anticogging_enabled: { name: 'Anticogging Enabled', description: 'Enable anticogging compensation', writable: true, type: 'boolean', valueType: 'BoolProperty' },
                calib_anticogging: { name: 'Calibrate Anticogging', description: 'Start anticogging calibration', writable: false, type: 'boolean', valueType: 'BoolProperty' },
                calib_pos_threshold: { name: 'Calib Position Threshold', description: 'Position threshold for anticogging calibration', writable: true, type: 'number', decimals: 6, hasSlider: true, valueType: 'Float32Property' },
                calib_vel_threshold: { name: 'Calib Velocity Threshold', description: 'Velocity threshold for anticogging calibration', writable: true, type: 'number', decimals: 3, hasSlider: true, valueType: 'Float32Property' },
                
                // 0.6.x specific anticogging enhancements
                ...(isV06x ? {
                  calib_start_vel: { name: 'Calib Start Velocity', description: 'Starting velocity for fine-tuned calibration control (turns/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
                  calib_end_vel: { name: 'Calib End Velocity', description: 'Ending velocity for fine-tuned calibration control (turns/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
                  calib_bidirectional: { name: 'Calib Bidirectional', description: 'Run calibration in both directions', writable: true, type: 'boolean', valueType: 'BoolProperty' },
                  calib_coarse_integrator_gain: { name: 'Calib Coarse Integrator Gain', description: 'Fine gain setting for calibration', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
                } : {}),
              }
            }
          }
        },
        autotuning: {
          name: 'Autotuning',
          description: 'Controller autotuning parameters',
          properties: {
            frequency: { name: 'Frequency', description: 'Autotuning frequency (Hz)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            torque_amplitude: { name: 'Torque Amplitude', description: 'Autotuning torque amplitude (Nm)', writable: true, type: 'number', decimals: 3, hasSlider: true, valueType: 'Float32Property' },
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
            vel_limit: { name: 'Velocity Limit', description: 'Maximum trajectory velocity (counts/s)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            accel_limit: { name: 'Acceleration Limit', description: 'Maximum trajectory acceleration (counts/s²)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            decel_limit: { name: 'Deceleration Limit', description: 'Maximum trajectory deceleration (counts/s²)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
          }
        }
      }
    },
    min_endstop: {
      name: 'Min Endstop',
      description: 'Minimum endstop configuration',
      properties: {
        endstop_state: { name: 'Endstop State', description: 'Current endstop state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      },
      children: {
        config: {
          name: 'Min Endstop Configuration',
          description: 'Minimum endstop configuration parameters',
          properties: {
            gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for minimum endstop', writable: true, type: 'number', valueType: 'Uint16Property' },
            enabled: { name: 'Enabled', description: 'Enable minimum endstop', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            is_active_high: { name: 'Is Active High', description: 'Endstop is active high', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            debounce_ms: { name: 'Debounce Time', description: 'Endstop debounce time (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    },
    max_endstop: {
      name: 'Max Endstop',
      description: 'Maximum endstop configuration',
      properties: {
        endstop_state: { name: 'Endstop State', description: 'Current endstop state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      },
      children: {
        config: {
          name: 'Max Endstop Configuration',
          description: 'Maximum endstop configuration parameters',
          properties: {
            gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for maximum endstop', writable: true, type: 'number', valueType: 'Uint16Property' },
            enabled: { name: 'Enabled', description: 'Enable maximum endstop', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            offset: { name: 'Offset', description: 'Endstop offset (counts)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            is_active_high: { name: 'Is Active High', description: 'Endstop is active high', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            debounce_ms: { name: 'Debounce Time', description: 'Endstop debounce time (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    },

    // 0.6.x Inverter Component
    ...(isV06x ? {
      inverter: {
        name: 'Inverter',
        description: 'Motor inverter status and configuration (0.6.x)',
        properties: {
          is_ready: { name: 'Is Ready', description: 'Inverter ready status', writable: false, type: 'boolean', valueType: 'BoolProperty' },
          error: { name: 'Error', description: 'Inverter error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Component.Error]' },
          armed_state: { name: 'Armed State', description: 'Inverter armed state', writable: false, type: 'number', valueType: 'Property[ODrive.Inverter.ArmedState]' },
          temperature: { name: 'Temperature', description: 'Inverter temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          effective_current_lim: { name: 'Effective Current Limit', description: 'Effective current limit considering thermal derating (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          max_allowed_current: { name: 'Max Allowed Current', description: 'Maximum allowed current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        },
        children: {
          config: {
            name: 'Inverter Configuration',
            description: 'Inverter configuration parameters',
            properties: {
              temp_limit_lower: { name: 'Temperature Limit Lower', description: 'Lower temperature limit for thermal protection (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
              temp_limit_upper: { name: 'Temperature Limit Upper', description: 'Upper temperature limit for thermal protection (°C)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            }
          }
        }
      }
    } : {}),

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
            gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for brake control', writable: true, type: 'number', valueType: 'Uint16Property' },
            is_active_low: { name: 'Is Active Low', description: 'Brake control is active low', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        }
      }
    }
  }
}
};