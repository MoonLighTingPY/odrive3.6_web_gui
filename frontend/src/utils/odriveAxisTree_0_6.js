// ODrive Axis Tree for firmware 0.6.x (tested against 0.6.11)
// Complete comprehensive tree including all properties from API reference 0.6.11

export const generateAxisTree06 = (axisNumber) => ({
  name: `Axis ${axisNumber}`,
  description: `Axis ${axisNumber} status and configuration (0.6.x)`,
  properties: {
    // Core axis status properties (different from 0.5.x)
    active_errors: { name: 'Active Errors', description: 'Current axis error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
    disarm_reason: { name: 'Disarm Reason', description: 'Reason for last disarm', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
    detailed_disarm_reason: { name: 'Detailed Disarm Reason', description: 'Detailed reason for last disarm', writable: false, type: 'number', valueType: 'Uint32Property' },
    step_dir_active: { name: 'Step/Dir Active', description: 'Whether step/direction interface is active', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    last_drv_fault: { name: 'Last DRV Fault', description: 'Last gate driver fault', writable: false, type: 'number', valueType: 'Uint32Property' },
    steps: { name: 'Steps', description: 'Accumulated step count', writable: false, type: 'number', valueType: 'Int64Property' },
    
    // State interface
    current_state: {
      name: 'Current State', description: 'Current axis state', writable: false, type: 'number',
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
        { value: 12, label: 'Encoder Hall Polarity Calibration' },
        { value: 13, label: 'Encoder Hall Phase Calibration' },
        { value: 14, label: 'Anticogging Calibration' },
        { value: 15, label: 'Harmonic Calibration' },
        { value: 16, label: 'Harmonic Calibration Commutation' },
      ]
    },
    requested_state: {
      name: 'Requested State', description: 'Requested axis state', writable: true, type: 'number',
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
        { value: 12, label: 'Encoder Hall Polarity Calibration' },
        { value: 13, label: 'Encoder Hall Phase Calibration' },
        { value: 14, label: 'Anticogging Calibration' },
        { value: 15, label: 'Harmonic Calibration' },
        { value: 16, label: 'Harmonic Calibration Commutation' },
      ]
    },
    
    // Position and velocity estimates
    pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (turns)', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
    vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (turns/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
    is_homed: { name: 'Is Homed', description: 'Whether axis has been successfully homed', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    
    // Additional 0.6.x status properties
    procedure_result: { name: 'Procedure Result', description: 'Result of last calibration procedure', writable: false, type: 'number', valueType: 'Property[ODrive.ProcedureResult]' },
    disarm_time: { name: 'Disarm Time', description: 'Time when axis was disarmed', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
    is_armed: { name: 'Is Armed', description: 'Axis armed state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    observed_encoder_scale_factor: { name: 'Observed Encoder Scale Factor', description: 'Ratio between observed and configured encoder scale', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
  },
  children: {
    // Axis Configuration (expanded for 0.6.x)
    config: {
      name: 'Axis Configuration',
      description: 'Axis-level configuration parameters',
      properties: {
        startup_max_wait_for_ready: { name: 'Startup Max Wait for Ready', description: 'Max time to wait for errors to clear before startup (s)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        startup_motor_calibration: { name: 'Startup Motor Calibration', description: 'Run motor calibration on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_encoder_index_search: { name: 'Startup Encoder Index Search', description: 'Run encoder index search on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_encoder_offset_calibration: { name: 'Startup Encoder Offset Cal', description: 'Run encoder offset calibration on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_closed_loop_control: { name: 'Startup Closed Loop Control', description: 'Enter closed loop control on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        startup_homing: { name: 'Startup Homing', description: 'Run homing on startup', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        
        // Initial setpoints for closed loop control
        init_torque: { name: 'Initial Torque', description: 'Initial torque setpoint when entering closed loop (Nm)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        init_vel: { name: 'Initial Velocity', description: 'Initial velocity setpoint when entering closed loop (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        init_pos: { name: 'Initial Position', description: 'Initial position setpoint when entering closed loop (rev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        
        // Step/direction interface
        enable_step_dir: { name: 'Enable Step/Dir', description: 'Enable step/direction interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        step_dir_always_on: { name: 'Step/Dir Always On', description: 'Keep step/dir enabled while motor disabled', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        step_gpio_pin: { name: 'Step GPIO Pin', description: 'GPIO pin for step input', writable: true, type: 'number', valueType: 'Uint16Property' },
        dir_gpio_pin: { name: 'Dir GPIO Pin', description: 'GPIO pin for direction input', writable: true, type: 'number', valueType: 'Uint16Property' },
        
        // Calibration parameters
        calib_range: { name: 'Calibration Range', description: 'Maximum allowable error during encoder offset calibration', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        calib_scan_distance: { name: 'Calibration Scan Distance', description: 'Distance motor moves during calibration (erev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        calib_scan_vel: { name: 'Calibration Scan Velocity', description: 'Velocity for calibration scan (erev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        index_search_at_target_vel_only: { name: 'Index Search at Target Vel Only', description: 'Only search for index at target velocity', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        
        // Watchdog
        enable_watchdog: { name: 'Enable Watchdog', description: 'Enable watchdog timer', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        watchdog_timeout: { name: 'Watchdog Timeout', description: 'Watchdog timeout period (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        
        // GPIO configuration
        error_gpio_pin: { name: 'Error GPIO Pin', description: 'GPIO pin for error output', writable: true, type: 'number', valueType: 'Uint16Property' },
        enable_error_gpio: { name: 'Enable Error GPIO', description: 'Enable error GPIO output', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        
        // Encoder selection
        load_encoder: { name: 'Load Encoder', description: 'Encoder used for position/velocity estimates', writable: true, type: 'number', valueType: 'Property[ODrive.EncoderId]' },
        commutation_encoder: { name: 'Commutation Encoder', description: 'Encoder used for motor commutation', writable: true, type: 'number', valueType: 'Property[ODrive.EncoderId]' },
        encoder_bandwidth: { name: 'Encoder Bandwidth', description: 'Bandwidth of encoder state estimator (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        commutation_encoder_bandwidth: { name: 'Commutation Encoder Bandwidth', description: 'Bandwidth of commutation encoder estimator (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        
        // Current and power limits
        I_bus_hard_min: { name: 'DC Current Hard Min', description: 'Minimum DC current hard limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        I_bus_hard_max: { name: 'DC Current Hard Max', description: 'Maximum DC current hard limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        I_bus_soft_min: { name: 'DC Current Soft Min', description: 'Minimum DC current soft limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        I_bus_soft_max: { name: 'DC Current Soft Max', description: 'Maximum DC current soft limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        P_bus_soft_min: { name: 'DC Power Soft Min', description: 'Minimum DC power soft limit (W)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        P_bus_soft_max: { name: 'DC Power Soft Max', description: 'Maximum DC power soft limit (W)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        
        // Torque limits
        torque_soft_min: { name: 'Torque Soft Min', description: 'Minimum torque soft limit (Nm)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        torque_soft_max: { name: 'Torque Soft Max', description: 'Maximum torque soft limit (Nm)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        
        // Off-axis mounting compensation
        off_axis_k: { name: 'Off-Axis K', description: 'Skew parameter for off-axis magnetic encoder mounting', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
        off_axis_k_commutation: { name: 'Off-Axis K Commutation', description: 'Skew parameter for off-axis commutation encoder', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
      },
      children: {
        // Motor configuration
        motor: {
          name: 'Motor Configuration',
          description: 'Motor configuration parameters',
          properties: {
            motor_type: { name: 'Motor Type', description: 'Type of motor', writable: true, type: 'number', valueType: 'Property[ODrive.MotorType]' },
            pole_pairs: { name: 'Pole Pairs', description: 'Number of magnet pole pairs', writable: true, type: 'number', valueType: 'Uint32Property' },
            phase_resistance: { name: 'Phase Resistance', description: 'Motor phase resistance (Ω)', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            phase_inductance: { name: 'Phase Inductance', description: 'Motor phase inductance (H)', writable: true, type: 'number', decimals: 9, valueType: 'Float32Property' },
            phase_resistance_valid: { name: 'Phase Resistance Valid', description: 'Whether phase resistance is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            phase_inductance_valid: { name: 'Phase Inductance Valid', description: 'Whether phase inductance is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            torque_constant: { name: 'Torque Constant', description: 'Motor torque constant (Nm/A)', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            direction: { name: 'Direction', description: 'Motor direction (+1 or -1)', writable: true, type: 'number', valueType: 'Float32Property' },
            current_control_bandwidth: { name: 'Current Control Bandwidth', description: 'Current controller bandwidth (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            wL_FF_enable: { name: 'wL Feedforward Enable', description: 'Enable R and omega*L feedforward', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            bEMF_FF_enable: { name: 'bEMF Feedforward Enable', description: 'Enable back-EMF feedforward', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            dI_dt_FF_enable: { name: 'dI/dt Feedforward Enable', description: 'Enable current slew rate feedforward', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            ff_pm_flux_linkage: { name: 'PM Flux Linkage', description: 'Permanent magnet flux linkage', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            ff_pm_flux_linkage_valid: { name: 'PM Flux Linkage Valid', description: 'Whether PM flux linkage is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            motor_model_l_d: { name: 'Motor Model L d', description: 'd-axis inductance for motor model (H)', writable: true, type: 'number', decimals: 9, valueType: 'Float32Property' },
            motor_model_l_q: { name: 'Motor Model L q', description: 'q-axis inductance for motor model (H)', writable: true, type: 'number', decimals: 9, valueType: 'Float32Property' },
            motor_model_l_dq_valid: { name: 'Motor Model L dq Valid', description: 'Whether d/q axis inductances are valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            calibration_current: { name: 'Calibration Current', description: 'Current for motor calibration (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            resistance_calib_max_voltage: { name: 'Resistance Calibration Max Voltage', description: 'Max voltage during resistance calibration (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            current_soft_max: { name: 'Current Soft Max', description: 'Motor current soft limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            current_hard_max: { name: 'Current Hard Max', description: 'Motor current hard limit (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            current_slew_rate_limit: { name: 'Current Slew Rate Limit', description: 'Maximum current slew rate (A/s)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            fw_enable: { name: 'Field Weakening Enable', description: 'Enable field weakening', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            fw_mod_setpoint: { name: 'FW Modulation Setpoint', description: 'Field weakening modulation setpoint', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            fw_fb_bandwidth: { name: 'FW Feedback Bandwidth', description: 'Field weakening feedback bandwidth (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            acim_gain_min_flux: { name: 'ACIM Gain Min Flux', description: 'ACIM minimum flux gain', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            acim_autoflux_enable: { name: 'ACIM Autoflux Enable', description: 'Enable ACIM automatic flux control', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            acim_autoflux_min_Id: { name: 'ACIM Autoflux Min Id', description: 'Minimum Id for ACIM autoflux (A)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            acim_autoflux_attack_gain: { name: 'ACIM Autoflux Attack Gain', description: 'ACIM autoflux attack gain', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            acim_autoflux_decay_gain: { name: 'ACIM Autoflux Decay Gain', description: 'ACIM autoflux decay gain', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            acim_nominal_slip_vel: { name: 'ACIM Nominal Slip Velocity', description: 'ACIM nominal slip velocity (Hz)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            sensorless_observer_gain: { name: 'Sensorless Observer Gain', description: 'Sensorless observer gain (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            sensorless_pll_bandwidth: { name: 'Sensorless PLL Bandwidth', description: 'Sensorless PLL bandwidth (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            sensorless_pm_flux_linkage: { name: 'Sensorless PM Flux Linkage', description: 'PM flux linkage for sensorless estimator', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            sensorless_pm_flux_linkage_valid: { name: 'Sensorless PM Flux Linkage Valid', description: 'Whether sensorless PM flux linkage is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            power_torque_report_filter_bandwidth: { name: 'Power/Torque Report Filter Bandwidth', description: 'Filter bandwidth for power/torque reports (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          }
        },
        
        // Anticogging configuration
        anticogging: {
          name: 'Anticogging Configuration',
          description: 'Anticogging calibration and operation parameters',
          properties: {
            enabled: { name: 'Enabled', description: 'Enable anticogging feedforward', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            max_torque: { name: 'Max Torque', description: 'Maximum anticogging torque action (Nm)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_start_vel: { name: 'Calibration Start Velocity', description: 'Start velocity for calibration (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_end_vel: { name: 'Calibration End Velocity', description: 'End velocity for calibration (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_coarse_tuning_duration: { name: 'Coarse Tuning Duration', description: 'Coarse tuning duration (s)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            calib_fine_tuning_duration: { name: 'Fine Tuning Duration', description: 'Fine tuning duration (s)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            calib_fine_dist_scale: { name: 'Fine Distance Scale', description: 'Fine calibration distance scale factor', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_coarse_integrator_gain: { name: 'Coarse Integrator Gain', description: 'Coarse integrator gain ((Nm/s)/(rev/s))', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            calib_bidirectional: { name: 'Bidirectional Calibration', description: 'Run calibration in both directions', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        },
        
        // Harmonic compensation configuration
        harmonic_compensation: {
          name: 'Harmonic Compensation',
          description: 'Harmonic compensation parameters (load encoder)',
          properties: {
            calib_vel: { name: 'Calibration Velocity', description: 'Motor velocity for harmonic calibration (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_settling_delay: { name: 'Settling Delay', description: 'Time to wait after spinup for calibration (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_turns: { name: 'Calibration Turns', description: 'Number of encoder turns for calibration', writable: true, type: 'number', valueType: 'Uint32Property' },
            cosx_coef: { name: 'cos(x) Coefficient', description: 'First harmonic cosine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            sinx_coef: { name: 'sin(x) Coefficient', description: 'First harmonic sine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            cos2x_coef: { name: 'cos(2x) Coefficient', description: 'Second harmonic cosine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            sin2x_coef: { name: 'sin(2x) Coefficient', description: 'Second harmonic sine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          }
        },
        
        // Harmonic compensation for commutation encoder
        harmonic_compensation_commutation: {
          name: 'Harmonic Compensation Commutation',
          description: 'Harmonic compensation parameters (commutation encoder)',
          properties: {
            calib_vel: { name: 'Calibration Velocity', description: 'Motor velocity for harmonic calibration (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_settling_delay: { name: 'Settling Delay', description: 'Time to wait after spinup for calibration (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            calib_turns: { name: 'Calibration Turns', description: 'Number of encoder turns for calibration', writable: true, type: 'number', valueType: 'Uint32Property' },
            cosx_coef: { name: 'cos(x) Coefficient', description: 'First harmonic cosine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            sinx_coef: { name: 'sin(x) Coefficient', description: 'First harmonic sine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            cos2x_coef: { name: 'cos(2x) Coefficient', description: 'Second harmonic cosine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            sin2x_coef: { name: 'sin(2x) Coefficient', description: 'Second harmonic sine coefficient', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          }
        },
        
        // Calibration lockin configuration
        calibration_lockin: {
          name: 'Calibration Lockin',
          description: 'Open-loop lockin parameters for calibration',
          properties: {
            current: { name: 'Current', description: 'Lockin current (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            ramp_time: { name: 'Ramp Time', description: 'Lockin ramp time (unused)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            ramp_distance: { name: 'Ramp Distance', description: 'Lockin ramp distance (unused)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            accel: { name: 'Acceleration', description: 'Lockin acceleration (erev/s²)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel: { name: 'Velocity', description: 'Lockin velocity (erev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          }
        },
        
        // Sensorless ramp configuration
        sensorless_ramp: {
          name: 'Sensorless Ramp',
          description: 'Open-loop lockin parameters for sensorless ramp-up',
          properties: {
            initial_pos: { name: 'Initial Position', description: 'Initial electrical angle (erev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            current: { name: 'Current', description: 'Ramp current (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            ramp_time: { name: 'Ramp Time', description: 'Ramp time (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            ramp_distance: { name: 'Ramp Distance', description: 'Ramp distance (erev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            accel: { name: 'Acceleration', description: 'Ramp acceleration (erev/s²)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel: { name: 'Velocity', description: 'Ramp velocity (erev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_distance: { name: 'Finish Distance', description: 'Distance to finish ramp (erev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_on_vel: { name: 'Finish on Velocity', description: 'Finish ramp based on velocity', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            finish_on_distance: { name: 'Finish on Distance', description: 'Finish ramp based on distance', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        },
        
        // General lockin configuration
        general_lockin: {
          name: 'General Lockin',
          description: 'Open-loop lockin parameters for LOCKIN_SPIN',
          properties: {
            initial_pos: { name: 'Initial Position', description: 'Initial electrical angle (erev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            current: { name: 'Current', description: 'Lockin current (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            ramp_time: { name: 'Ramp Time', description: 'Ramp time (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            ramp_distance: { name: 'Ramp Distance', description: 'Ramp distance (erev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            accel: { name: 'Acceleration', description: 'Lockin acceleration (erev/s²)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel: { name: 'Velocity', description: 'Lockin velocity (erev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_distance: { name: 'Finish Distance', description: 'Distance to finish lockin (erev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            finish_on_vel: { name: 'Finish on Velocity', description: 'Finish lockin based on velocity', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            finish_on_distance: { name: 'Finish on Distance', description: 'Finish lockin based on distance', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        },
        
        // CAN configuration for this axis
        can: {
          name: 'CAN Configuration',
          description: 'Axis-specific CAN settings',
          properties: {
            node_id: { name: 'Node ID', description: 'CAN node identifier', writable: true, type: 'number', min: 0, max: 127, valueType: 'Uint32Property' },
            version_msg_rate_ms: { name: 'Version Message Rate', description: 'Version message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            heartbeat_msg_rate_ms: { name: 'Heartbeat Message Rate', description: 'Heartbeat message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            encoder_msg_rate_ms: { name: 'Encoder Message Rate', description: 'Encoder message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            iq_msg_rate_ms: { name: 'Iq Message Rate', description: 'Iq message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            error_msg_rate_ms: { name: 'Error Message Rate', description: 'Error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            temperature_msg_rate_ms: { name: 'Temperature Message Rate', description: 'Temperature message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            bus_voltage_msg_rate_ms: { name: 'Bus Voltage Message Rate', description: 'Bus voltage message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            torques_msg_rate_ms: { name: 'Torques Message Rate', description: 'Torques message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            powers_msg_rate_ms: { name: 'Powers Message Rate', description: 'Powers message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            input_vel_scale: { name: 'Input Velocity Scale', description: 'Scale for velocity feedforward in CAN (counts/(rev/s))', writable: true, type: 'number', valueType: 'Uint32Property' },
            input_torque_scale: { name: 'Input Torque Scale', description: 'Scale for torque feedforward in CAN (counts/Nm)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    },

    // Motor status and measurements (comprehensive 0.6.x)
    motor: {
      name: 'Motor',
      description: 'Motor status and measurements',
      properties: {
        torque_estimate: { name: 'Torque Estimate', description: 'Estimated motor torque (Nm)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        mechanical_power: { name: 'Mechanical Power', description: 'Mechanical output power (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        electrical_power: { name: 'Electrical Power', description: 'Electrical input power (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        loss_power: { name: 'Loss Power', description: 'Estimated power losses (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        effective_current_lim: { name: 'Effective Current Limit', description: 'Effective current limit (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        resistance_calibration_I_beta: { name: 'Resistance Calibration I Beta', description: 'Beta current during resistance calibration', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        input_id: { name: 'Input Id', description: 'Feedforward d-axis current (A)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        input_iq: { name: 'Input Iq', description: 'Feedforward q-axis current (A)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
      },
      children: {
        // Alpha-beta frame controller
        alpha_beta_controller: {
          name: 'Alpha Beta Controller',
          description: 'Alpha-beta frame current measurements',
          properties: {
            current_meas_phA: { name: 'Phase A Current', description: 'Measured current in phase A (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            current_meas_phB: { name: 'Phase B Current', description: 'Measured current in phase B (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            current_meas_phC: { name: 'Phase C Current', description: 'Measured current in phase C (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            current_meas_status_phA: { name: 'Phase A Status', description: 'Phase A measurement status', writable: false, type: 'number', valueType: 'Uint32Property' },
            current_meas_status_phB: { name: 'Phase B Status', description: 'Phase B measurement status', writable: false, type: 'number', valueType: 'Uint32Property' },
            current_meas_status_phC: { name: 'Phase C Status', description: 'Phase C measurement status', writable: false, type: 'number', valueType: 'Uint32Property' },
            I_bus: { name: 'DC Bus Current', description: 'DC bus current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Ialpha_measured: { name: 'Alpha Current', description: 'Measured alpha current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Ibeta_measured: { name: 'Beta Current', description: 'Measured beta current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            max_measurable_current: { name: 'Max Measurable Current', description: 'Maximum measurable current (A)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
            power: { name: 'Electrical Power', description: 'Electrical power to motor (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
            n_evt_current_measurement: { name: 'Current Measurement Events', description: 'Current measurement event count', writable: false, type: 'number', valueType: 'Uint32Property' },
            n_evt_pwm_update: { name: 'PWM Update Events', description: 'PWM update event count', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        
        // Field oriented controller (FOC)
        foc: {
          name: 'Field Oriented Controller',
          description: 'Field oriented control parameters',
          properties: {
            p_gain: { name: 'Proportional Gain', description: 'FOC proportional gain', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            i_gain: { name: 'Integral Gain', description: 'FOC integral gain', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            I_measured_report_filter_k: { name: 'Current Measurement Filter', description: 'Filter for reported Id/Iq measurements', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            Id_setpoint: { name: 'Id Setpoint', description: 'd-axis current setpoint (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Iq_setpoint: { name: 'Iq Setpoint', description: 'q-axis current setpoint (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Vd_setpoint: { name: 'Vd Setpoint', description: 'd-axis voltage setpoint (V)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Vq_setpoint: { name: 'Vq Setpoint', description: 'q-axis voltage setpoint (V)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            phase: { name: 'Phase', description: 'Current electrical phase (rad)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            phase_vel: { name: 'Phase Velocity', description: 'Electrical phase velocity (rad/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Id_measured: { name: 'Id Measured', description: 'Measured d-axis current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Iq_measured: { name: 'Iq Measured', description: 'Measured q-axis current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            v_current_control_integral_d: { name: 'V Control Integral D', description: 'd-axis current control integral', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            v_current_control_integral_q: { name: 'V Control Integral Q', description: 'q-axis current control integral', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            mod_d: { name: 'Modulation D', description: 'd-axis modulation', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            mod_q: { name: 'Modulation Q', description: 'q-axis modulation', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            mod_magn_sqr: { name: 'Modulation Magnitude Squared', description: 'Squared magnitude of modulation vector', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            final_v_alpha: { name: 'Final V Alpha', description: 'Final alpha voltage', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            final_v_beta: { name: 'Final V Beta', description: 'Final beta voltage', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            Ierr_d: { name: 'Current Error D', description: 'd-axis current error', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            Ierr_q: { name: 'Current Error Q', description: 'q-axis current error', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            Ierr_magn_sqr: { name: 'Current Error Magnitude Squared', description: 'Squared magnitude of current error', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          }
        },
        
        // FET thermistor
        fet_thermistor: {
          name: 'FET Thermistor',
          description: 'Power stage temperature monitoring',
          properties: {
            temperature: { name: 'Temperature', description: 'FET temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          }
        },
        
        // ACIM estimator
        acim_estimator: {
          name: 'ACIM Estimator',
          description: 'AC induction motor estimator',
          properties: {
            rotor_flux: { name: 'Rotor Flux', description: 'Estimated rotor flux magnitude (A)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            slip_vel: { name: 'Slip Velocity', description: 'Estimated slip velocity (Hz)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            phase_offset: { name: 'Phase Offset', description: 'Phase offset between physical and electrical (cycles)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            stator_phase_vel: { name: 'Stator Phase Velocity', description: 'Calculated electrical velocity (Hz)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
            stator_phase: { name: 'Stator Phase', description: 'Calculated electrical phase (cycles)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          }
        },
        
        // Sensorless estimator
        sensorless_estimator: {
          name: 'Sensorless Estimator',
          description: 'Sensorless position/velocity estimation',
          properties: {
            phase: { name: 'Phase', description: 'Estimated phase (rad)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            pll_pos: { name: 'PLL Position', description: 'PLL position estimate (rad)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            phase_vel: { name: 'Phase Velocity', description: 'Estimated phase velocity (rad/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
          }
        },
        
        // Motor thermistor (built-in motors have different structure)
        motor_thermistor: {
          name: 'Motor Thermistor',
          description: 'Motor temperature monitoring',
          properties: {
            temperature: { name: 'Temperature', description: 'Motor temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
          },
          children: {
            config: {
              name: 'Motor Thermistor Configuration',
              description: 'Motor thermistor configuration',
              properties: {
                gpio_pin: { name: 'GPIO Pin', description: 'GPIO pin for thermistor', writable: true, type: 'number', valueType: 'Uint16Property' },
                mode: { name: 'Thermistor Mode', description: 'Thermistor type/mode', writable: true, type: 'number', valueType: 'Property[ODrive.ThermistorMode]' },
                r_ref: { name: 'Reference Resistance', description: 'Thermistor resistance at reference temp (Ω)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
                t_ref: { name: 'Reference Temperature', description: 'Reference temperature (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
                beta: { name: 'Beta Value', description: 'Thermistor beta value (K)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
                a: { name: 'Linear Coefficient A', description: 'Linear coefficient for quadratic mode', writable: true, type: 'number', decimals: 9, valueType: 'Float32Property' },
                b: { name: 'Quadratic Coefficient B', description: 'Quadratic coefficient for quadratic mode', writable: true, type: 'number', decimals: 12, valueType: 'Float32Property' },
                temp_limit_lower: { name: 'Temperature Limit Lower', description: 'Lower temperature limit for current derating (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
                temp_limit_upper: { name: 'Temperature Limit Upper', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
                enabled: { name: 'Enabled', description: 'Whether thermistor is enabled', writable: true, type: 'boolean', valueType: 'BoolProperty' },
              }
            }
          }
        },
        
        // DC calibration diagnostics
        dc_calib: {
          name: 'DC Calibration',
          description: 'Inverter DC calibration diagnostics',
          properties: {
            a_0: { name: 'Phase A Offset 0', description: 'Phase A DC offset calibration 0', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            b_0: { name: 'Phase B Offset 0', description: 'Phase B DC offset calibration 0', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            c_0: { name: 'Phase C Offset 0', description: 'Phase C DC offset calibration 0', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            a_1: { name: 'Phase A Offset 1', description: 'Phase A DC offset calibration 1', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            b_1: { name: 'Phase B Offset 1', description: 'Phase B DC offset calibration 1', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            c_1: { name: 'Phase C Offset 1', description: 'Phase C DC offset calibration 1', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            a_2: { name: 'Phase A Offset 2', description: 'Phase A DC offset calibration 2', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            b_2: { name: 'Phase B Offset 2', description: 'Phase B DC offset calibration 2', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
            c_2: { name: 'Phase C Offset 2', description: 'Phase C DC offset calibration 2', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
          }
        }
      }
    },

    // Encoder status (generic interface)
    encoder: {
      name: 'Encoder',
      description: 'Load encoder status (generic interface)',
      properties: {
        status: { name: 'Status', description: 'Encoder status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
        pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (turns/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      }
    },
    
    // Controller (comprehensive 0.6.x)
    controller: {
      name: 'Controller',
      description: 'Control loop parameters and settings',
      properties: {
        input_pos: { name: 'Position Input', description: 'Position command input (turns)', writable: true, type: 'number', decimals: 3, min: -1000, max: 1000, step: 0.1, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        input_vel: { name: 'Velocity Input', description: 'Velocity command input (turns/s)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.5, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        input_torque: { name: 'Torque Input', description: 'Torque command input (Nm)', writable: true, type: 'number', decimals: 3, min: -10, max: 10, step: 0.1, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        pos_setpoint: { name: 'Position Setpoint', description: 'Position setpoint actually used by controller (turns)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        vel_setpoint: { name: 'Velocity Setpoint', description: 'Velocity setpoint actually used by controller (turns/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        torque_setpoint: { name: 'Torque Setpoint', description: 'Torque setpoint actually used by controller (Nm)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        effective_torque_setpoint: { name: 'Effective Torque Setpoint', description: 'Effective torque output to motor (Nm)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        trajectory_done: { name: 'Trajectory Done', description: 'Whether trajectory is complete', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        vel_integrator_torque: { name: 'Velocity Integrator Torque', description: 'Accumulated velocity integrator value (Nm)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        autotuning_phase: { name: 'Autotuning Phase', description: 'Current autotuning phase angle (rad)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        spinout_mechanical_power: { name: 'Spinout Mechanical Power', description: 'Mechanical power estimate for spinout detection (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        spinout_electrical_power: { name: 'Spinout Electrical Power', description: 'Electrical power estimate for spinout detection (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
      },
      children: {
        // Controller configuration
        config: {
          name: 'Controller Configuration',
          description: 'Controller configuration parameters',
          properties: {
            enable_vel_limit: { name: 'Enable Velocity Limit', description: 'Enable velocity limit enforcement', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            enable_torque_mode_vel_limit: { name: 'Enable Torque Mode Vel Limit', description: 'Enable velocity limit in torque control mode', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            enable_gain_scheduling: { name: 'Enable Gain Scheduling', description: 'Enable experimental gain scheduling (anti-hunt)', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            gain_scheduling_width: { name: 'Gain Scheduling Width', description: 'Distance over which gain scheduling operates (turns)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            enable_overspeed_error: { name: 'Enable Overspeed Error', description: 'Enable velocity controller overspeed error', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            control_mode: { name: 'Control Mode', description: 'Control mode selection', writable: true, type: 'number', valueType: 'Property[ODrive.Controller.ControlMode]' },
            input_mode: { name: 'Input Mode', description: 'Input mode selection', writable: true, type: 'number', valueType: 'Property[ODrive.Controller.InputMode]' },
            pos_gain: { name: 'Position Gain', description: 'Position controller proportional gain ((rev/s)/rev)', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            vel_gain: { name: 'Velocity Gain', description: 'Velocity controller proportional gain (Nm/(rev/s))', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            vel_integrator_gain: { name: 'Velocity Integrator Gain', description: 'Velocity controller integral gain ((Nm/s)/(rev/s))', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            vel_integrator_limit: { name: 'Velocity Integrator Limit', description: 'Velocity integrator output limit (Nm)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity (rev/s)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            vel_limit_tolerance: { name: 'Velocity Limit Tolerance', description: 'Velocity limit tolerance factor', writable: true, type: 'number', step: 0.01, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            vel_ramp_rate: { name: 'Velocity Ramp Rate', description: 'Velocity ramp rate (rev/s²)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            torque_ramp_rate: { name: 'Torque Ramp Rate', description: 'Torque ramp rate (Nm/s)', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            circular_setpoints: { name: 'Circular Setpoints', description: 'Enable circular position setpoints', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            circular_setpoint_range: { name: 'Circular Setpoint Range', description: 'Circular range for position setpoints (turns)', writable: true, type: 'number', decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            absolute_setpoints: { name: 'Absolute Setpoints', description: 'Use absolute reference frame', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            use_commutation_vel: { name: 'Use Commutation Velocity', description: 'Use commutation encoder for velocity', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            use_load_encoder_for_commutation_vel: { name: 'Use Load Encoder for Comm Vel', description: 'Use load encoder for commutation velocity', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            commutation_vel_scale: { name: 'Commutation Velocity Scale', description: 'Scale between load and commutation encoders', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            steps_per_circular_range: { name: 'Steps per Circular Range', description: 'Number of steps in circular range', writable: true, type: 'number', valueType: 'Int32Property' },
            homing_speed: { name: 'Homing Speed', description: 'Speed for homing operations (rev/s)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            inertia: { name: 'Inertia', description: 'System inertia (Nm/(rev/s²))', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            input_filter_bandwidth: { name: 'Input Filter Bandwidth', description: 'Desired bandwidth for POS_FILTER mode (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            spinout_mechanical_power_bandwidth: { name: 'Spinout Mechanical Power Bandwidth', description: 'Bandwidth for mechanical power estimate (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            spinout_electrical_power_bandwidth: { name: 'Spinout Electrical Power Bandwidth', description: 'Bandwidth for electrical power estimate (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            spinout_mechanical_power_threshold: { name: 'Spinout Mechanical Power Threshold', description: 'Mechanical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            spinout_electrical_power_threshold: { name: 'Spinout Electrical Power Threshold', description: 'Electrical power threshold for spinout detection (W)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          }
        },
        
        // Autotuning configuration
        autotuning: {
          name: 'Autotuning',
          description: 'Autotuning configuration parameters',
          properties: {
            frequency: { name: 'Frequency', description: 'Autotuning frequency (Hz)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            pos_amplitude: { name: 'Position Amplitude', description: 'Position amplitude for autotuning (rev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel_amplitude: { name: 'Velocity Amplitude', description: 'Velocity amplitude for autotuning (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            torque_amplitude: { name: 'Torque Amplitude', description: 'Torque amplitude for autotuning (Nm)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            vel_burst_factor: { name: 'Velocity Burst Factor', description: 'Velocity burst factor for autotuning', writable: true, type: 'number', valueType: 'Uint8Property' },
          }
        }
      }
    },
    
    // Trapezoidal trajectory planner
    trap_traj: {
      name: 'Trapezoidal Trajectory',
      description: 'Online trapezoidal trajectory planner',
      children: {
        config: {
          name: 'Trap Traj Configuration',
          description: 'Trapezoidal trajectory configuration',
          properties: {
            vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity for trajectories (rev/s)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            accel_limit: { name: 'Acceleration Limit', description: 'Maximum acceleration for trajectories (rev/s²)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
            decel_limit: { name: 'Deceleration Limit', description: 'Maximum deceleration for trajectories (rev/s²)', writable: true, type: 'number', decimals: 1, hasSlider: true, valueType: 'Float32Property' },
          }
        }
      }
    },
    
    // Endstops
    min_endstop: {
      name: 'Min Endstop',
      description: 'Minimum endstop configuration',
      properties: {
        state: { name: 'State', description: 'Current endstop state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      },
      children: {
        config: {
          name: 'Min Endstop Configuration',
          description: 'Minimum endstop configuration parameters',
          properties: {
            gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for endstop', writable: true, type: 'number', valueType: 'Uint16Property' },
            enabled: { name: 'Enabled', description: 'Enable endstop', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            offset: { name: 'Offset', description: 'Position offset for endstop (rev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            is_active_high: { name: 'Is Active High', description: 'Endstop is active high', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            debounce_ms: { name: 'Debounce Time', description: 'Debounce time for endstop (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    },
    
    max_endstop: {
      name: 'Max Endstop',
      description: 'Maximum endstop configuration',
      properties: {
        state: { name: 'State', description: 'Current endstop state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      },
      children: {
        config: {
          name: 'Max Endstop Configuration',
          description: 'Maximum endstop configuration parameters',
          properties: {
            gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for endstop', writable: true, type: 'number', valueType: 'Uint16Property' },
            enabled: { name: 'Enabled', description: 'Enable endstop', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            offset: { name: 'Offset', description: 'Position offset for endstop (rev)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            is_active_high: { name: 'Is Active High', description: 'Endstop is active high', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            debounce_ms: { name: 'Debounce Time', description: 'Debounce time for endstop (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    },
    
    // Enable pin
    enable_pin: {
      name: 'Enable Pin',
      description: 'Axis enable input',
      properties: {
        state: { name: 'State', description: 'Enable pin state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      },
      children: {
        config: {
          name: 'Enable Pin Configuration',
          description: 'Enable pin configuration parameters',
          properties: {
            gpio_num: { name: 'GPIO Number', description: 'GPIO pin number for enable', writable: true, type: 'number', valueType: 'Uint16Property' },
            enabled: { name: 'Enabled', description: 'Enable the enable pin', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            offset: { name: 'Offset', description: 'Offset for enable pin', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            is_active_high: { name: 'Is Active High', description: 'Enable pin is active high', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            debounce_ms: { name: 'Debounce Time', description: 'Debounce time for enable pin (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    },
    
    // Mechanical brake
    mechanical_brake: {
      name: 'Mechanical Brake',
      description: 'Mechanical brake control',
      properties: {},
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
    },
    
    // Position/velocity mapper
    pos_vel_mapper: {
      name: 'Position/Velocity Mapper',
      description: 'Maps input position/velocity to axis',
      properties: {
        status: { name: 'Status', description: 'Mapper component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
        pos_rel: { name: 'Relative Position', description: 'Relative position since startup (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        pos_abs: { name: 'Absolute Position', description: 'Absolute position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        vel: { name: 'Velocity', description: 'Velocity estimate (turns/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        working_offset: { name: 'Working Offset', description: 'Working offset (for diagnostics)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        n_index_events: { name: 'Index Events Count', description: 'Number of index events', writable: true, type: 'number', valueType: 'Uint32Property' },
      },
      children: {
        config: {
          name: 'Pos/Vel Mapper Configuration',
          description: 'Position/velocity mapper configuration',
          properties: {
            circular: { name: 'Circular', description: 'Enable circular mapping', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            circular_output_range: { name: 'Circular Output Range', description: 'Range for circular output', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            scale: { name: 'Scale', description: 'Encoder scale factor', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            offset_valid: { name: 'Offset Valid', description: 'Whether offset is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            offset: { name: 'Offset', description: 'Position offset', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            approx_init_pos_valid: { name: 'Approximate Init Pos Valid', description: 'Whether approximate init position is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            approx_init_pos: { name: 'Approximate Init Position', description: 'Approximate startup position', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            index_offset_valid: { name: 'Index Offset Valid', description: 'Whether index offset is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            index_offset: { name: 'Index Offset', description: 'Index position offset', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            use_index_gpio: { name: 'Use Index GPIO', description: 'Use GPIO for index signal', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            passive_index_search: { name: 'Passive Index Search', description: 'Listen for index pulses when motor disarmed', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            index_gpio: { name: 'Index GPIO', description: 'GPIO pin for index signal', writable: true, type: 'number', valueType: 'Uint8Property' },
            use_endstop: { name: 'Use Endstop', description: 'Use endstop for this mapper', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        }
      }
    },
    
    // Commutation mapper
    commutation_mapper: {
      name: 'Commutation Mapper',
      description: 'Maps commutation reference to axis',
      properties: {
        status: { name: 'Status', description: 'Mapper component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
        pos_rel: { name: 'Relative Position', description: 'Relative position since startup (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        pos_abs: { name: 'Absolute Position', description: 'Absolute position (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        vel: { name: 'Velocity', description: 'Velocity estimate (turns/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        working_offset: { name: 'Working Offset', description: 'Working offset (for diagnostics)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        n_index_events: { name: 'Index Events Count', description: 'Number of index events', writable: true, type: 'number', valueType: 'Uint32Property' },
      },
      children: {
        config: {
          name: 'Commutation Mapper Configuration',
          description: 'Commutation mapper configuration',
          properties: {
            circular: { name: 'Circular', description: 'Enable circular mapping', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            circular_output_range: { name: 'Circular Output Range', description: 'Range for circular output', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            scale: { name: 'Scale', description: 'Encoder scale factor', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            offset_valid: { name: 'Offset Valid', description: 'Whether offset is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            offset: { name: 'Offset', description: 'Position offset', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            approx_init_pos_valid: { name: 'Approximate Init Pos Valid', description: 'Whether approximate init position is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            approx_init_pos: { name: 'Approximate Init Position', description: 'Approximate startup position', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            index_offset_valid: { name: 'Index Offset Valid', description: 'Whether index offset is valid', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            index_offset: { name: 'Index Offset', description: 'Index position offset', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
            use_index_gpio: { name: 'Use Index GPIO', description: 'Use GPIO for index signal', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            passive_index_search: { name: 'Passive Index Search', description: 'Listen for index pulses when motor disarmed', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            index_gpio: { name: 'Index GPIO', description: 'GPIO pin for index signal', writable: true, type: 'number', valueType: 'Uint8Property' },
            use_endstop: { name: 'Use Endstop', description: 'Use endstop for this mapper', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        }
      }
    },
    
    // Interpolator
    interpolator: {
      name: 'Interpolator',
      description: 'Interpolator status and configuration',
      properties: {
        status: { name: 'Status', description: 'Interpolator component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
        interpolation: { name: 'Interpolation', description: 'Current interpolation value', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
      },
      children: {
        config: {
          name: 'Interpolator Configuration',
          description: 'Interpolator configuration parameters',
          properties: {
            dynamic: { name: 'Dynamic', description: 'Enable dynamic interpolation', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        }
      }
    },
    
    // Task timing information
    task_times: {
      name: 'Task Times',
      description: 'Axis task timing information',
      children: {
        thermistor_update: {
          name: 'Thermistor Update Timer',
          description: 'Thermistor update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        sensorless_estimator_update: {
          name: 'Sensorless Estimator Update Timer',
          description: 'Sensorless estimator update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        endstop_update: {
          name: 'Endstop Update Timer',
          description: 'Endstop update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        can_heartbeat: {
          name: 'CAN Heartbeat Timer',
          description: 'CAN heartbeat task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        controller_update: {
          name: 'Controller Update Timer',
          description: 'Controller update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        open_loop_vector_generator_update: {
          name: 'Open Loop Vector Generator Timer',
          description: 'Open loop vector generator task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        acim_estimator_update: {
          name: 'ACIM Estimator Update Timer',
          description: 'ACIM estimator update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        motor_update: {
          name: 'Motor Update Timer',
          description: 'Motor update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        current_controller_update: {
          name: 'Current Controller Update Timer',
          description: 'Current controller update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        current_sense: {
          name: 'Current Sense Timer',
          description: 'Current sensing task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        },
        pwm_update: {
          name: 'PWM Update Timer',
          description: 'PWM update task timing',
          properties: {
            start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
            end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
            length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
            max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    }
  }
})
export const generateAxisTree = generateAxisTree06;
