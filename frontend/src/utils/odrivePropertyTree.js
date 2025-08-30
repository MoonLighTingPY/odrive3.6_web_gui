/**
 * ODrive Property Tree Generator - Version-aware tree generation
 * Generates appropriate property trees for different firmware versions
 */

const parseVersion = (versionString) => {
  if (!versionString || typeof versionString !== 'string') return { major: 0, minor: 5, patch: 6 }
  const cleanVersion = versionString.replace(/^v/, '')
  const parts = cleanVersion.split('.').map(Number)
  return {
    major: parts[0] || 0,
    minor: parts[1] || 5,
    patch: parts[2] || 6
  }
}

const isVersion06x = (firmwareVersion) => {
  const version = parseVersion(firmwareVersion)
  return version.major === 0 && version.minor >= 6
}

/**
 * Generate property tree based on firmware version
 */
export const generateOdrivePropertyTree = (firmwareVersion = "0.5.6") => {
  const isV06x = isVersion06x(firmwareVersion)
  
  const tree = {
    system: {
      properties: {
        hw_version_major: { type: 'number', unit: '', description: 'Hardware version major' },
        hw_version_minor: { type: 'number', unit: '', description: 'Hardware version minor' },
        hw_version_variant: { type: 'number', unit: '', description: 'Hardware version variant' },
        fw_version_major: { type: 'number', unit: '', description: 'Firmware version major' },
        fw_version_minor: { type: 'number', unit: '', description: 'Firmware version minor' },
        fw_version_revision: { type: 'number', unit: '', description: 'Firmware version revision' },
        fw_version_unreleased: { type: 'number', unit: '', description: 'Firmware unreleased flag' },
        serial_number: { type: 'number', unit: '', description: 'Device serial number' },
        vbus_voltage: { type: 'number', unit: 'V', description: 'DC bus voltage' },
        ibus: { type: 'number', unit: 'A', description: 'DC bus current' },
        ibus_report_filter_k: { type: 'number', unit: '', description: 'Current report filter' },
        test_property: { type: 'number', unit: '', description: 'Test property' },
        identify: { type: 'function', description: 'Identify device' },
        reboot_required: { type: 'boolean', description: 'Reboot required flag' },
        user_config_loaded: { type: 'boolean', description: 'User config loaded flag' },
        misconfigured: { type: 'boolean', description: 'Device misconfigured flag' }
      }
    },

    config: {
      properties: {
        // Power configuration
        dc_bus_overvoltage_trip_level: { type: 'number', unit: 'V', min: 12, max: 60, description: 'DC bus overvoltage trip level' },
        dc_bus_undervoltage_trip_level: { type: 'number', unit: 'V', min: 8, max: 48, description: 'DC bus undervoltage trip level' },
        dc_max_positive_current: { type: 'number', unit: 'A', min: 0, max: 100, description: 'Maximum positive DC current' },
        dc_max_negative_current: { type: 'number', unit: 'A', min: -100, max: 0, description: 'Maximum negative DC current' },
        max_regen_current: { type: 'number', unit: 'A', min: 0, max: 50, description: 'Maximum regenerative current' },
        
        // Protocol configuration  
        usb_cdc_protocol: { type: 'number', min: 0, max: 5, description: 'USB CDC protocol' },
        uart0_protocol: { type: 'number', min: 0, max: 5, description: 'UART0 protocol' },
        
        // User config storage (0.6.x feature)
        ...(isV06x && {
          user_config_0: { type: 'number', description: 'User config 0' },
          user_config_1: { type: 'number', description: 'User config 1' },
          user_config_2: { type: 'number', description: 'User config 2' },
          user_config_3: { type: 'number', description: 'User config 3' },
          user_config_4: { type: 'number', description: 'User config 4' },
          user_config_5: { type: 'number', description: 'User config 5' },
          user_config_6: { type: 'number', description: 'User config 6' },
          user_config_7: { type: 'number', description: 'User config 7' }
        }),

        // Inverter configuration (0.6.x structure)
        ...(isV06x && {
          inverter0: {
            properties: {
              current_soft_max: { type: 'number', unit: 'A', description: 'Inverter soft current limit' },
              current_hard_max: { type: 'number', unit: 'A', description: 'Inverter hard current limit' },
              temp_limit_lower: { type: 'number', unit: '°C', description: 'Inverter lower temp limit' },
              temp_limit_upper: { type: 'number', unit: '°C', description: 'Inverter upper temp limit' },
              mod_magn_max: { type: 'number', description: 'Maximum modulation magnitude' },
              shunt_conductance: { type: 'number', unit: 'S', description: 'Shunt conductance' }
            }
          }
        }),

        // GPIO configuration (0.6.x has different structure)
        ...(isV06x && {
          gpio3_analog_mapping: { type: 'number', description: 'GPIO3 analog mapping' },
          gpio4_analog_mapping: { type: 'number', description: 'GPIO4 analog mapping' }
        })
      }
    },

    // 0.6.x brake resistor (separate object)
    ...(isV06x && {
      brake_resistor0: {
        properties: {
          current: { type: 'number', unit: 'A', description: 'Brake resistor current' },
          current_meas: { type: 'number', unit: 'A', description: 'Brake resistor current measurement' },
          duty: { type: 'number', unit: '%', description: 'Brake resistor duty cycle' },
          additional_duty: { type: 'number', unit: '%', description: 'Additional duty cycle' },
          chopper_temp: { type: 'number', unit: '°C', description: 'Chopper temperature' },
          is_armed: { type: 'boolean', description: 'Brake resistor armed' },
          was_saturated: { type: 'boolean', description: 'Brake resistor was saturated' },
          config: {
            properties: {
              enable: { type: 'boolean', description: 'Enable brake resistor' },
              resistance: { type: 'number', unit: 'Ω', min: 0.1, max: 100, description: 'Brake resistor resistance' }
            }
          }
        }
      }
    }),

    can: {
      properties: {
        error: { type: 'number', description: 'CAN error count' },
        n_restarts: { type: 'number', description: 'CAN restart count' },
        n_rx: { type: 'number', description: 'CAN RX count' },
        ...(isV06x && {
          effective_baudrate: { type: 'number', unit: 'bps', description: 'Effective CAN baudrate' }
        }),
        config: {
          properties: {
            baud_rate: { type: 'number', unit: 'bps', description: 'CAN baud rate' },
            protocol: { type: 'number', min: 0, max: 3, description: 'CAN protocol' },
            ...(isV06x && {
              autobaud_enabled: { type: 'boolean', description: 'CAN autobaud enabled' }
            })
          }
        }
      }
    },

    // 0.6.x methods (should be filtered out from property queries)
    ...(isV06x && {
      methods: {
        properties: {
          test_function: { type: 'function', description: 'Test function' },
          get_adc_voltage: { type: 'function', description: 'Get ADC voltage' },
          enter_dfu_mode2: { type: 'function', description: 'Enter DFU mode' },
          disable_bootloader: { type: 'function', description: 'Disable bootloader' },
          identify_once: { type: 'function', description: 'Identify once' },
          get_interrupt_status: { type: 'function', description: 'Get interrupt status' },
          get_dma_status: { type: 'function', description: 'Get DMA status' },
          set_gpio: { type: 'function', description: 'Set GPIO' },
          get_raw_8: { type: 'function', description: 'Get raw 8-bit' },
          get_raw_32: { type: 'function', description: 'Get raw 32-bit' },
          get_raw_256: { type: 'function', description: 'Get raw 256-bit' }
        }
      }
    })
  }

  // Add axis-specific properties
  for (let axisNum = 0; axisNum < 2; axisNum++) {
    tree[`axis${axisNum}`] = generateAxisProperties(axisNum, isV06x)
  }

  return tree
}

/**
 * Generate axis-specific properties based on firmware version
 */
function generateAxisProperties(axisNum, isV06x) {
  const axisTree = {
    properties: {
      // Core axis properties
      active_errors: { type: 'number', description: 'Active error flags' },
      disarm_reason: { type: 'number', description: 'Disarm reason code' },
      current_state: { type: 'number', description: 'Current axis state' },
      requested_state: { type: 'number', description: 'Requested axis state' },
      step_dir_active: { type: 'boolean', description: 'Step/dir active' },
      last_drv_fault: { type: 'number', description: 'Last driver fault' },
      steps: { type: 'number', description: 'Step count' },
      vel_estimate: { type: 'number', unit: 'turns/s', description: 'Velocity estimate' },
      pos_estimate: { type: 'number', unit: 'turns', description: 'Position estimate' },
      is_homed: { type: 'boolean', description: 'Axis is homed' },
      is_armed: { type: 'boolean', description: 'Axis is armed' },
      procedure_result: { type: 'number', description: 'Last procedure result' },
      disarm_time: { type: 'number', description: 'Disarm time' },

      // 0.6.x specific properties
      ...(isV06x && {
        detailed_disarm_reason: { type: 'number', description: 'Detailed disarm reason' },
        observed_encoder_scale_factor: { type: 'number', description: 'Observed encoder scale factor' }
      })
    },

    children: {
      config: generateAxisConfigProperties(isV06x),
      motor: generateMotorProperties(isV06x),
      controller: generateControllerProperties(isV06x),
      trap_traj: generateTrapTrajProperties(),
      min_endstop: generateEndstopProperties(),
      max_endstop: generateEndstopProperties(),
      mechanical_brake: generateMechanicalBrakeProperties(),
      ...(isV06x && {
        inverter: generateInverterProperties(),
        load_mapper: generateLoadMapperProperties(),
        commutation_mapper: generateCommutationMapperProperties(),
        pos_vel_mapper: generatePosVelMapperProperties(),
        harmonic_compensation: generateHarmonicCompensationProperties(),
        thermal_current_limiter: generateThermalCurrentLimiterProperties(),
        motor_thermistor_current_limiter: generateMotorThermistorCurrentLimiterProperties(),
        sensorless_estimator: generateSensorlessEstimatorProperties()
      })
    }
  }

  return axisTree
}

// Helper functions for generating component properties
function generateAxisConfigProperties(isV06x) {
  return {
    properties: {
      startup_motor_calibration: { type: 'boolean', description: 'Start motor calibration on startup' },
      startup_encoder_index_search: { type: 'boolean', description: 'Start encoder index search on startup' },
      startup_encoder_offset_calibration: { type: 'boolean', description: 'Start encoder offset calibration on startup' },
      startup_closed_loop_control: { type: 'boolean', description: 'Start closed loop control on startup' },
      startup_homing: { type: 'boolean', description: 'Start homing on startup' },
      enable_step_dir: { type: 'boolean', description: 'Enable step/direction input' },
      step_dir_always_on: { type: 'boolean', description: 'Keep step/dir always on' },
      step_gpio_pin: { type: 'number', min: 0, max: 16, description: 'Step GPIO pin' },
      dir_gpio_pin: { type: 'number', min: 0, max: 16, description: 'Direction GPIO pin' },
      enable_watchdog: { type: 'boolean', description: 'Enable watchdog' },
      watchdog_timeout: { type: 'number', unit: 's', min: 0, max: 60, description: 'Watchdog timeout' },
      startup_max_wait_for_ready: { type: 'number', unit: 's', min: 0, max: 10, description: 'Max wait for ready on startup' },
      calib_range: { type: 'number', unit: 'turns', description: 'Calibration range' },
      calib_scan_distance: { type: 'number', unit: 'turns', description: 'Calibration scan distance' },
      calib_scan_vel: { type: 'number', unit: 'turns/s', description: 'Calibration scan velocity' },
      encoder_bandwidth: { type: 'number', unit: 'Hz', min: 10, max: 10000, description: 'Encoder bandwidth' },

      // 0.6.x additions
      ...(isV06x && {
        init_pos: { type: 'number', unit: 'turns', description: 'Initial position' },
        init_vel: { type: 'number', unit: 'turns/s', description: 'Initial velocity' },
        init_torque: { type: 'number', unit: 'Nm', description: 'Initial torque' },
        I_bus_hard_min: { type: 'number', unit: 'A', description: 'Hard minimum bus current' },
        I_bus_hard_max: { type: 'number', unit: 'A', description: 'Hard maximum bus current' },
        I_bus_soft_min: { type: 'number', unit: 'A', description: 'Soft minimum bus current' },
        I_bus_soft_max: { type: 'number', unit: 'A', description: 'Soft maximum bus current' },
        P_bus_soft_min: { type: 'number', unit: 'W', description: 'Soft minimum bus power' },
        P_bus_soft_max: { type: 'number', unit: 'W', description: 'Soft maximum bus power' }
      })
    },
    children: {
      can: {
        properties: {
          node_id: { type: 'number', min: 0, max: 127, description: 'CAN node ID' }
        }
      },
      calibration_lockin: generateLockinProperties(),
      sensorless_ramp: generateSensorlessRampProperties(),
      general_lockin: generateLockinProperties()
    }
  }
}

function generateMotorProperties(isV06x) {
  return {
    properties: {
      effective_current_lim: { type: 'number', unit: 'A', description: 'Effective current limit' },
      torque_estimate: { type: 'number', unit: 'Nm', description: 'Torque estimate' },
      mechanical_power: { type: 'number', unit: 'W', description: 'Mechanical power' },
      electrical_power: { type: 'number', unit: 'W', description: 'Electrical power' },
      ...(isV06x && {
        loss_power: { type: 'number', unit: 'W', description: 'Loss power' }
      }),
      resistance_calibration_I_beta: { type: 'number', unit: 'A', description: 'Resistance calibration beta current' },
      input_id: { type: 'number', unit: 'A', description: 'Input D current' },
      input_iq: { type: 'number', unit: 'A', description: 'Input Q current' }
    },
    children: {
      config: {
        properties: {
          pre_calibrated: { type: 'boolean', description: 'Motor pre-calibrated' },
          pole_pairs: { type: 'number', min: 1, max: 50, description: 'Motor pole pairs' },
          calibration_current: { type: 'number', unit: 'A', min: 0, max: 100, description: 'Calibration current' },
          resistance_calib_max_voltage: { type: 'number', unit: 'V', min: 0, max: 24, description: 'Resistance calibration max voltage' },
          phase_inductance: { type: 'number', unit: 'H', description: 'Motor phase inductance' },
          phase_resistance: { type: 'number', unit: 'Ω', description: 'Motor phase resistance' },
          torque_constant: { type: 'number', unit: 'Nm/A', description: 'Motor torque constant' },
          direction: { type: 'number', min: -1, max: 1, description: 'Motor direction' },
          motor_type: { type: 'number', min: 0, max: 2, description: 'Motor type' },
          current_lim: { type: 'number', unit: 'A', min: 0, max: 100, description: 'Motor current limit' },
          current_lim_margin: { type: 'number', unit: 'A', description: 'Current limit margin' },
          torque_lim: { type: 'number', unit: 'Nm', min: 0, max: 1000, description: 'Torque limit' },
          inverter_temp_limit_lower: { type: 'number', unit: '°C', description: 'Inverter lower temp limit' },
          inverter_temp_limit_upper: { type: 'number', unit: '°C', description: 'Inverter upper temp limit' },
          requested_current_range: { type: 'number', unit: 'A', description: 'Requested current range' },
          current_control_bandwidth: { type: 'number', unit: 'Hz', description: 'Current control bandwidth' }
        }
      },
      fet_thermistor: {
        properties: {
          temperature: { type: 'number', unit: '°C', description: 'FET thermistor temperature' }
        }
      },
      motor_thermistor: {
        properties: {
          config: {
            properties: {
              enabled: { type: 'boolean', description: 'Motor thermistor enabled' },
              gpio_pin: { type: 'number', min: 0, max: 16, description: 'Motor thermistor GPIO pin' },
              temp_limit_lower: { type: 'number', unit: '°C', description: 'Motor thermistor lower limit' },
              temp_limit_upper: { type: 'number', unit: '°C', description: 'Motor thermistor upper limit' }
            }
          }
        }
      }
    }
  }
}

function generateControllerProperties(isV06x) {
  return {
    properties: {
      input_pos: { type: 'number', unit: 'turns', description: 'Controller input position' },
      input_vel: { type: 'number', unit: 'turns/s', description: 'Controller input velocity' },
      input_torque: { type: 'number', unit: 'Nm', description: 'Controller input torque' },
      pos_setpoint: { type: 'number', unit: 'turns', description: 'Position setpoint' },
      vel_setpoint: { type: 'number', unit: 'turns/s', description: 'Velocity setpoint' },
      torque_setpoint: { type: 'number', unit: 'Nm', description: 'Torque setpoint' },
      trajectory_done: { type: 'boolean', description: 'Trajectory complete' },
      vel_integrator_torque: { type: 'number', unit: 'Nm', description: 'Velocity integrator torque' },
      autotuning_phase: { type: 'number', description: 'Autotuning phase' },
      effective_torque_setpoint: { type: 'number', unit: 'Nm', description: 'Effective torque setpoint' },
      spinout_electrical_power: { type: 'number', unit: 'W', description: 'Spinout electrical power' },
      spinout_mechanical_power: { type: 'number', unit: 'W', description: 'Spinout mechanical power' }
    },
    children: {
      config: {
        properties: {
          control_mode: { type: 'number', min: 0, max: 4, description: 'Control mode' },
          input_mode: { type: 'number', min: 0, max: 7, description: 'Input mode' },
          pos_gain: { type: 'number', unit: '(turns/s)/turn', min: 0, max: 1000, description: 'Position gain' },
          vel_gain: { type: 'number', unit: 'Nm/(turns/s)', min: 0, max: 10, description: 'Velocity gain' },
          vel_integrator_gain: { type: 'number', unit: 'Nm/((turns/s)*s)', min: 0, max: 10, description: 'Velocity integrator gain' },
          vel_limit: { type: 'number', unit: 'turns/s', min: 0, max: 100, description: 'Velocity limit' },
          vel_limit_tolerance: { type: 'number', unit: 'turns/s', min: 0, max: 10, description: 'Velocity limit tolerance' },
          vel_ramp_rate: { type: 'number', unit: '(turns/s)/s', min: 0, max: 1000, description: 'Velocity ramp rate' },
          torque_ramp_rate: { type: 'number', unit: 'Nm/s', min: 0, max: 1000, description: 'Torque ramp rate' },
          circular_setpoints: { type: 'boolean', description: 'Use circular setpoints' },
          circular_setpoint_range: { type: 'number', unit: 'turns', description: 'Circular setpoint range' },
          homing_speed: { type: 'number', unit: 'turns/s', description: 'Homing speed' },
          inertia: { type: 'number', unit: 'kg*m²', description: 'Load inertia' },
          input_filter_bandwidth: { type: 'number', unit: 'Hz', min: 0, max: 1000, description: 'Input filter bandwidth' },
          enable_overspeed_error: { type: 'boolean', description: 'Enable overspeed error' },
          enable_torque_mode_vel_limit: { type: 'boolean', description: 'Enable torque mode velocity limit' },
          enable_gain_scheduling: { type: 'boolean', description: 'Enable gain scheduling' },
          gain_scheduling_width: { type: 'number', description: 'Gain scheduling width' },
          enable_vel_limit: { type: 'boolean', description: 'Enable velocity limit' },
          spinout_electrical_power_threshold: { type: 'number', unit: 'W', description: 'Spinout electrical power threshold' },
          spinout_mechanical_power_threshold: { type: 'number', unit: 'W', description: 'Spinout mechanical power threshold' },
          absolute_setpoints: { type: 'boolean', description: 'Use absolute setpoints' },
          use_commutation_vel: { type: 'boolean', description: 'Use commutation velocity' }
        }
      },
      autotuning: {
        properties: {
          frequency: { type: 'number', unit: 'Hz', description: 'Autotuning frequency' },
          torque_amplitude: { type: 'number', unit: 'Nm', description: 'Autotuning torque amplitude' }
        }
      }
    }
  }
}

function generateTrapTrajProperties() {
  return {
    properties: {},
    children: {
      config: {
        properties: {
          vel_limit: { type: 'number', unit: 'turns/s', min: 0, max: 100, description: 'Trapezoidal velocity limit' },
          accel_limit: { type: 'number', unit: '(turns/s)/s', min: 0, max: 1000, description: 'Acceleration limit' },
          decel_limit: { type: 'number', unit: '(turns/s)/s', min: 0, max: 1000, description: 'Deceleration limit' }
        }
      }
    }
  }
}

function generateEndstopProperties() {
  return {
    properties: {},
    children: {
      config: {
        properties: {
          gpio_num: { type: 'number', min: 0, max: 16, description: 'Endstop GPIO pin' },
          enabled: { type: 'boolean', description: 'Endstop enabled' },
          offset: { type: 'number', unit: 'turns', description: 'Endstop offset' },
          is_active_high: { type: 'boolean', description: 'Endstop active high' },
          debounce_ms: { type: 'number', unit: 'ms', min: 0, max: 1000, description: 'Endstop debounce time' }
        }
      }
    }
  }
}

function generateMechanicalBrakeProperties() {
  return {
    properties: {},
    children: {
      config: {
        properties: {
          gpio_num: { type: 'number', min: 0, max: 16, description: 'Mechanical brake GPIO pin' },
          is_active_low: { type: 'boolean', description: 'Mechanical brake active low' }
        }
      }
    }
  }
}

function generateLockinProperties() {
  return {
    properties: {
      current: { type: 'number', unit: 'A', description: 'Lockin current' },
      ramp_time: { type: 'number', unit: 's', description: 'Lockin ramp time' },
      ramp_distance: { type: 'number', unit: 'turns', description: 'Lockin ramp distance' },
      accel: { type: 'number', unit: '(turns/s)/s', description: 'Lockin acceleration' },
      vel: { type: 'number', unit: 'turns/s', description: 'Lockin velocity' }
    }
  }
}

function generateSensorlessRampProperties() {
  return {
    properties: {
      current: { type: 'number', unit: 'A', description: 'Sensorless ramp current' },
      ramp_time: { type: 'number', unit: 's', description: 'Sensorless ramp time' },
      ramp_distance: { type: 'number', unit: 'turns', description: 'Sensorless ramp distance' },
      accel: { type: 'number', unit: '(turns/s)/s', description: 'Sensorless ramp acceleration' },
      vel: { type: 'number', unit: 'turns/s', description: 'Sensorless ramp velocity' },
      finish_distance: { type: 'number', unit: 'turns', description: 'Sensorless ramp finish distance' },
      finish_on_vel: { type: 'boolean', description: 'Finish sensorless ramp on velocity' },
      finish_on_distance: { type: 'boolean', description: 'Finish sensorless ramp on distance' }
    }
  }
}

// 0.6.x specific component generators
function generateLoadMapperProperties() {
  return {
    properties: {
      is_ready: { type: 'boolean', description: 'Load mapper ready' },
      error: { type: 'number', description: 'Load mapper error' },
      shadow_count: { type: 'number', description: 'Load mapper shadow count' },
      pos_estimate: { type: 'number', unit: 'turns', description: 'Load mapper position estimate' },
      vel_estimate: { type: 'number', unit: 'turns/s', description: 'Load mapper velocity estimate' }
    },
    children: {
      config: {
        properties: {
          use_index: { type: 'boolean', description: 'Load mapper use index' },
          index_offset: { type: 'number', unit: 'turns', description: 'Load mapper index offset' },
          cpr: { type: 'number', min: 1, max: 100000, description: 'Load mapper counts per revolution' },
          pre_calibrated: { type: 'boolean', description: 'Load mapper pre-calibrated' }
        }
      }
    }
  }
}

function generateCommutationMapperProperties() {
  return {
    properties: {
      is_ready: { type: 'boolean', description: 'Commutation mapper ready' },
      error: { type: 'number', description: 'Commutation mapper error' },
      phase: { type: 'number', unit: 'rad', description: 'Commutation phase' },
      phase_vel: { type: 'number', unit: 'rad/s', description: 'Commutation phase velocity' }
    },
    children: {
      config: {
        properties: {
          pole_pairs: { type: 'number', min: 1, max: 50, description: 'Commutation pole pairs' },
          use_index_electrical_offset: { type: 'boolean', description: 'Use index electrical offset' },
          electrical_offset: { type: 'number', unit: 'rad', description: 'Electrical offset' },
          direction: { type: 'number', min: -1, max: 1, description: 'Commutation direction' }
        }
      }
    }
  }
}

function generatePosVelMapperProperties() {
  return {
    properties: {
      is_ready: { type: 'boolean', description: 'Position velocity mapper ready' },
      error: { type: 'number', description: 'Position velocity mapper error' },
      pos_estimate: { type: 'number', unit: 'turns', description: 'Position velocity mapper position estimate' },
      vel_estimate: { type: 'number', unit: 'turns/s', description: 'Position velocity mapper velocity estimate' }
    },
    children: {
      config: {
        properties: {
          use_circular_pos: { type: 'boolean', description: 'Use circular position' },
          circular_setpoints: { type: 'boolean', description: 'Use circular setpoints' },
          range: { type: 'number', unit: 'turns', description: 'Position velocity mapper range' },
          bandwidth: { type: 'number', unit: 'Hz', description: 'Position velocity mapper bandwidth' }
        }
      }
    }
  }
}

function generateHarmonicCompensationProperties() {
  return {
    properties: {
      cosx_coef: { type: 'number', description: 'Cosine X coefficient' },
      sinx_coef: { type: 'number', description: 'Sine X coefficient' },
      cos2x_coef: { type: 'number', description: 'Cosine 2X coefficient' },
      sin2x_coef: { type: 'number', description: 'Sine 2X coefficient' }
    },
    children: {
      config: {
        properties: {
          enable: { type: 'boolean', description: 'Enable harmonic compensation' },
          calib_vel: { type: 'number', unit: 'turns/s', description: 'Harmonic calibration velocity' },
          calib_turns: { type: 'number', unit: 'turns', description: 'Harmonic calibration turns' },
          calib_settling_delay: { type: 'number', unit: 's', description: 'Harmonic calibration settling delay' }
        }
      }
    }
  }
}

function generateThermalCurrentLimiterProperties() {
  return {
    properties: {
      current_lim: { type: 'number', unit: 'A', description: 'Thermal current limit' }
    },
    children: {
      config: {
        properties: {
          temp_limit_lower: { type: 'number', unit: '°C', description: 'Thermal lower temperature limit' },
          temp_limit_upper: { type: 'number', unit: '°C', description: 'Thermal upper temperature limit' }
        }
      }
    }
  }
}

function generateMotorThermistorCurrentLimiterProperties() {
  return {
    properties: {
      current_lim: { type: 'number', unit: 'A', description: 'Motor thermistor current limit' },
      temperature: { type: 'number', unit: '°C', description: 'Motor thermistor temperature' }
    },
    children: {
      config: {
        properties: {
          enabled: { type: 'boolean', description: 'Motor thermistor current limiter enabled' },
          temp_limit_lower: { type: 'number', unit: '°C', description: 'Motor thermistor lower limit' },
          temp_limit_upper: { type: 'number', unit: '°C', description: 'Motor thermistor upper limit' },
          poly_coefficient_0: { type: 'number', description: 'Polynomial coefficient 0' },
          poly_coefficient_1: { type: 'number', description: 'Polynomial coefficient 1' },
          poly_coefficient_2: { type: 'number', description: 'Polynomial coefficient 2' },
          poly_coefficient_3: { type: 'number', description: 'Polynomial coefficient 3' }
        }
      }
    }
  }
}

function generateSensorlessEstimatorProperties() {
  return {
    properties: {
      error: { type: 'number', description: 'Sensorless estimator error' },
      phase: { type: 'number', unit: 'rad', description: 'Sensorless phase estimate' },
      pll_pos: { type: 'number', unit: 'rad', description: 'PLL position' },
      phase_vel: { type: 'number', unit: 'rad/s', description: 'Sensorless phase velocity' },
      vel_estimate: { type: 'number', unit: 'turns/s', description: 'Sensorless velocity estimate' }
    },
    children: {
      config: {
        properties: {
          observer_gain: { type: 'number', description: 'Sensorless observer gain' },
          pll_bandwidth: { type: 'number', unit: 'Hz', description: 'Sensorless PLL bandwidth' },
          pm_flux_linkage: { type: 'number', unit: 'Wb', description: 'PM flux linkage' }
        }
      }
    }
  }
}

// Update the generateInverterProperties function (add if missing)
function generateInverterProperties() {
  return {
    properties: {
      is_ready: { type: 'boolean', description: 'Inverter ready status' },
      error: { type: 'number', description: 'Inverter error flags' },
      armed_state: { type: 'number', description: 'Inverter armed state' },
      temperature: { type: 'number', unit: '°C', description: 'Inverter temperature' },
      effective_current_lim: { type: 'number', unit: 'A', description: 'Effective current limit' },
      current_meas_phA: { type: 'number', unit: 'A', description: 'Phase A current measurement' },
      current_meas_phB: { type: 'number', unit: 'A', description: 'Phase B current measurement' },
      current_meas_phC: { type: 'number', unit: 'A', description: 'Phase C current measurement' }
    }
  }
}

// For backward compatibility
export const odrivePropertyTree = generateOdrivePropertyTree("0.5.6")

