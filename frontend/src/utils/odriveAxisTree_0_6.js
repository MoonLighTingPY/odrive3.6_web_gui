// ODrive Axis Tree for firmware 0.6.x (tested against 0.6.11)
// Minimal/safe tree: mirrors 0.5.x UI where still valid, removes deprecated bits, adds 0.6.x fields.

export const generateAxisTree06 = (axisNumber) => ({
  name: `Axis ${axisNumber}`,
  description: `Axis ${axisNumber} status and configuration (0.6.x)` ,
  properties: {
    // 0.6.x exposes active_errors & disarm_reason instead of axis.error
    active_errors: { name: 'Active Errors', description: 'Current axis error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
    disarm_reason: { name: 'Disarm Reason', description: 'Reason for last disarm', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
    detailed_disarm_reason: { name: 'Detailed Disarm Reason', description: 'Detailed reason for last disarm', writable: false, type: 'number', valueType: 'Uint32Property' },

    // State interface is still present in 0.6.x
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
      ]
    },
    step_dir_active: { name: 'Step/Dir Active', description: 'Whether step/direction interface is active', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    last_drv_fault: { name: 'Last DRV Fault', description: 'Last gate driver fault', writable: false, type: 'number', valueType: 'Uint32Property' },
    steps: { name: 'Steps', description: 'Accumulated step count', writable: false, type: 'number', valueType: 'Int64Property' },
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
      },
      children: {
        can: {
          name: 'CAN Configuration',
          description: 'Axis-specific CAN settings (0.6.x)',
          properties: {
            node_id: { name: 'Node ID', description: 'CAN node identifier', writable: true, type: 'number', min: 0, max: 127, valueType: 'Uint32Property' },
            heartbeat_rate_ms: { name: 'Heartbeat Rate', description: 'CAN heartbeat tx rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            // extended IDs option was removed in 0.6.x
            encoder_error_rate_ms: { name: 'Encoder Error Rate', description: 'Encoder error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            controller_error_rate_ms: { name: 'Controller Error Rate', description: 'Controller error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            motor_error_rate_ms: { name: 'Motor Error Rate', description: 'Motor error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
            sensorless_error_rate_ms: { name: 'Sensorless Error Rate', description: 'Sensorless error message rate (ms)', writable: true, type: 'number', valueType: 'Uint32Property' },
          }
        }
      }
    },

    motor: {
      name: 'Motor',
      description: 'Motor status and measurements',
      properties: {
        torque_estimate: { name: 'Torque Estimate', description: 'Estimated torque (Nm)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        mechanical_power: { name: 'Mechanical Power', description: 'Mechanical output power (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        electrical_power: { name: 'Electrical Power', description: 'Electrical input power (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        loss_power: { name: 'Loss Power', description: 'Estimated power losses (W)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        effective_current_lim: { name: 'Effective Current Limit', description: 'Effective current limit (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      }
    },

    encoder: {
      name: 'Encoder',
      description: 'Encoder settings and status (generic view)',
      properties: {
        status: { name: 'Status', description: 'Encoder component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
        pos_estimate: { name: 'Position Estimate', description: 'Current position estimate (turns)', writable: false, type: 'number', decimals: 6, valueType: 'Float32Property' },
        vel_estimate: { name: 'Velocity Estimate', description: 'Current velocity estimate (turns/s)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      }
    },

    controller: {
      name: 'Controller',
      description: 'Control loop parameters and settings',
      properties: {
        error: { name: 'Controller Error', description: 'Current controller error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Controller.Error]' },
        input_pos: { name: 'Position Input', description: 'Position command input (turns)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.1, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        input_vel: { name: 'Velocity Input', description: 'Velocity command input (turns/s)', writable: true, type: 'number', decimals: 3, min: -100, max: 100, step: 0.5, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        input_torque: { name: 'Torque Input', description: 'Torque command input (Nm)', writable: true, type: 'number', decimals: 3, min: -10, max: 10, step: 0.1, isSetpoint: true, hasSlider: true, valueType: 'Float32Property' },
        trajectory_done: { name: 'Trajectory Done', description: 'Whether trajectory is complete', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      },
      children: {
        config: {
          name: 'Controller Configuration',
          description: 'Controller configuration parameters',
          properties: {
            control_mode: { name: 'Control Mode', description: 'Control mode', writable: true, type: 'number', valueType: 'Property[ODrive.Controller.ControlMode]' },
            input_mode: { name: 'Input Mode', description: 'Input mode', writable: true, type: 'number', valueType: 'Property[ODrive.Controller.InputMode]' },
            pos_gain: { name: 'Position Gain', description: 'Position controller proportional gain', writable: true, type: 'number', step: 0.1, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            vel_gain: { name: 'Velocity Gain', description: 'Velocity controller proportional gain', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            vel_integrator_gain: { name: 'Velocity Integrator Gain', description: 'Velocity controller integral gain', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            vel_limit: { name: 'Velocity Limit', description: 'Maximum velocity (turns/s)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            vel_limit_tolerance: { name: 'Velocity Limit Tolerance', description: 'Velocity limit tolerance factor', writable: true, type: 'number', step: 0.01, decimals: 3, hasSlider: true, valueType: 'Float32Property' },
            vel_ramp_rate: { name: 'Velocity Ramp Rate', description: 'Velocity ramp rate (turns/s²)', writable: true, type: 'number', step: 1, hasSlider: true, valueType: 'Float32Property' },
            torque_ramp_rate: { name: 'Torque Ramp Rate', description: 'Torque ramp rate (Nm/s)', writable: true, type: 'number', step: 0.001, decimals: 6, hasSlider: true, valueType: 'Float32Property' },
            circular_setpoints: { name: 'Circular Setpoints', description: 'Enable circular position setpoints', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          }
        }
      }
    },

    harmonic_compensation: {
      name: 'Harmonic Compensation',
      description: 'Harmonic compensation parameters (0.6.x)',
      properties: {
        calib_vel: { name: 'Calibration Velocity', description: 'Calibration velocity (rev/s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        calib_settling_delay: { name: 'Settling Delay', description: 'Settling delay (s)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        calib_turns: { name: 'Calibration Turns', description: 'Number of turns for calibration', writable: true, type: 'number', valueType: 'Uint32Property' },
      }
    },

    min_endstop: {
      name: 'Min Endstop',
      description: 'Minimum endstop configuration',
      properties: {
        state: { name: 'State', description: 'Current endstop state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      }
    },

    max_endstop: {
      name: 'Max Endstop',
      description: 'Maximum endstop configuration',
      properties: {
        state: { name: 'State', description: 'Current endstop state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      }
    },

    enable_pin: {
      name: 'Enable Pin',
      description: 'Axis enable input',
      properties: {
        state: { name: 'State', description: 'Enable pin state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      }
    },

    mechanical_brake: {
      name: 'Mechanical Brake',
      description: 'Mechanical brake control',
      properties: {}
    },

    pos_vel_mapper: {
      name: 'Position/Velocity Mapper',
      description: 'Maps input position/velocity to axis',
      properties: {
        status: { name: 'Status', description: 'Mapper component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
      }
    },
    commutation_mapper: {
      name: 'Commutation Mapper',
      description: 'Maps commutation reference to axis',
      properties: {
        status: { name: 'Status', description: 'Mapper component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
      }
    },
    interpolator: {
      name: 'Interpolator',
      description: 'Interpolator status and configuration',
      properties: {
        status: { name: 'Status', description: 'Interpolator component status', writable: false, type: 'number', valueType: 'Property[ODrive.ComponentStatus]' },
      }
    },
  }
})

export const generateAxisTree = generateAxisTree06;
