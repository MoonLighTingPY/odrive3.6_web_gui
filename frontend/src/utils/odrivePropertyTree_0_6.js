import { generateAxisTree06 as generateAxisTree } from './odriveAxisTree_0_6.js'

export const odrivePropertyTree06 = {
  // Root system properties
  system: {
    name: 'System Properties',
    description: 'Top-level ODrive system settings and information (0.6.x)',
    properties: {
      hw_version_major: { name: 'Hardware Version Major', description: 'Major hardware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      hw_version_minor: { name: 'Hardware Version Minor', description: 'Minor hardware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      hw_version_variant: { name: 'Hardware Variant', description: 'Hardware variant identifier', writable: false, type: 'number', valueType: 'Uint8Property' },
      hw_version_revision: { name: 'Hardware Revision', description: 'Hardware revision number', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_major: { name: 'Firmware Version Major', description: 'Major firmware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_minor: { name: 'Firmware Version Minor', description: 'Minor firmware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_revision: { name: 'Firmware Revision', description: 'Firmware revision number', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_unreleased: { name: 'Firmware Unreleased', description: 'Unreleased firmware flag (0 for official releases)', writable: false, type: 'number', valueType: 'Uint8Property' },
      commit_hash: { name: 'Commit Hash', description: 'Firmware commit hash', writable: false, type: 'number', valueType: 'Uint32Property' },
      bootloader_version: { name: 'Bootloader Version', description: 'ODrive bootloader version', writable: false, type: 'number', valueType: 'Uint32Property' },
      vbus_voltage: { name: 'VBus Voltage', description: 'Voltage on the DC bus as measured by the ODrive (V)', writable: false, type: 'number', decimals: 2, valueType: 'Float32Property' },
      ibus: { name: 'IBus Current', description: 'Current on the DC bus as calculated by the ODrive (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      ibus_report_filter_k: { name: 'IBus Report Filter', description: 'Filter gain for the reported ibus', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
      control_loop_hz: { name: 'Control Loop Frequency', description: 'Control loop frequency (Hz)', writable: false, type: 'number', valueType: 'Uint32Property' },
      serial_number: { name: 'Serial Number', description: 'Device serial number', writable: false, type: 'number', valueType: 'Uint64Property' },
      n_evt_sampling: { name: 'Sampling Events', description: 'Number of input sampling events since startup', writable: false, type: 'number', valueType: 'Uint32Property' },
      n_evt_control_loop: { name: 'Control Loop Events', description: 'Number of control loop iterations since startup', writable: false, type: 'number', valueType: 'Uint32Property' },
      task_timers_armed: { name: 'Task Timers Armed', description: 'Set by profiling application to trigger sampling', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      user_config_loaded: { name: 'User Config Loaded', description: 'User configuration loaded status', writable: false, type: 'number', valueType: 'Uint32Property' },
      misconfigured: { name: 'Misconfigured', description: 'System misconfiguration flag', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      test_property: { name: 'Test Property', description: 'Test property for development', writable: true, type: 'number', valueType: 'Uint32Property' },
      identify: { name: 'Identify', description: 'Toggle LED identify mode', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      reboot_required: { name: 'Reboot Required', description: 'Indicates if reboot is required', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    }
  },

  // Root config properties - these map to ODrive.Config
  config: {
    name: 'System Configuration',
    description: 'Top-level ODrive configuration parameters (0.6.x)',
    properties: {
      enable_uart_a: { name: 'Enable UART A', description: 'Enable UART A interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      uart_a_baudrate: { name: 'UART A Baudrate', description: 'UART A communication baudrate', writable: true, type: 'number', valueType: 'Uint32Property' },
      usb_cdc_protocol: { name: 'USB CDC Protocol', description: 'Protocol for USB virtual COM port', writable: true, type: 'number', valueType: 'Property[ODrive.StreamProtocolType]' },
      uart0_protocol: { name: 'UART0 Protocol', description: 'UART0 protocol selection', writable: true, type: 'number', valueType: 'Property[ODrive.StreamProtocolType]' },
      max_regen_current: { name: 'Max Regen Current', description: 'Bus current allowed to flow back before brake resistor (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'Minimum voltage below which the motor stops (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'Maximum voltage above which the motor stops (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Max current the supply can source (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Max current the supply can sink (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      user_config_0: { name: 'User Config 0', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
      user_config_1: { name: 'User Config 1', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
      user_config_2: { name: 'User Config 2', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
      user_config_3: { name: 'User Config 3', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
      user_config_4: { name: 'User Config 4', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
      user_config_5: { name: 'User Config 5', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
      user_config_6: { name: 'User Config 6', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
      user_config_7: { name: 'User Config 7', description: 'General purpose user storage', writable: true, type: 'number', valueType: 'Uint32Property' },
    }
  },

  // Brake resistor configuration and status
  brake_resistor0: {
    name: 'Brake Resistor',
    description: 'Brake resistor control and status',
    properties: {
      current_meas: { name: 'Current Measured', description: 'Measured brake resistor current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      current_meas_status: { name: 'Current Measurement Status', description: 'Status of current measurement', writable: false, type: 'number', valueType: 'Uint32Property' },
      duty: { name: 'Duty Cycle', description: 'Brake resistor duty cycle', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      additional_duty: { name: 'Additional Duty', description: 'Additional duty cycle on top of calculated value', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
      current: { name: 'Calculated Current', description: 'Calculated brake resistor current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      chopper_temp: { name: 'Chopper Temperature', description: 'Estimated brake resistor chopper temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
      is_armed: { name: 'Is Armed', description: 'Brake resistor armed state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      was_saturated: { name: 'Was Saturated', description: 'Indicates if brake resistor reached saturation', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    },
    children: {
      config: {
        name: 'Brake Resistor Configuration',
        description: 'Brake resistor configuration parameters',
        properties: {
          enable: { name: 'Enable', description: 'Enable/disable the use of a brake resistor', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          resistance: { name: 'Resistance', description: 'Value of the brake resistor (Ω)', writable: true, type: 'number', decimals: 2, valueType: 'Float32Property' },
          enable_dc_bus_voltage_feedback: { name: 'Enable DC Voltage Feedback', description: 'Enable DC bus voltage feedback feature', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          dc_bus_voltage_feedback_ramp_start: { name: 'DC Voltage Ramp Start', description: 'Start voltage for DC feedback ramp (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          dc_bus_voltage_feedback_ramp_end: { name: 'DC Voltage Ramp End', description: 'End voltage for DC feedback ramp (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        }
      }
    }
  },

  // Task timing information
  task_times: {
    name: 'Task Times',
    description: 'Task timing information for performance analysis',
    children: {
      sampling: {
        name: 'Sampling Timer',
        description: 'Input sampling task timing',
        properties: {
          start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
          end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
          length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      },
      encoder_update: {
        name: 'Encoder Update Timer',
        description: 'Encoder update task timing',
        properties: {
          start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
          end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
          length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      },
      control_loop_misc: {
        name: 'Control Loop Misc Timer',
        description: 'Control loop miscellaneous task timing',
        properties: {
          start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
          end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
          length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      },
      control_loop_checks: {
        name: 'Control Loop Checks Timer',
        description: 'Control loop checks task timing',
        properties: {
          start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
          end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
          length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      },
      current_sense_wait: {
        name: 'Current Sense Wait Timer',
        description: 'Current sensing wait task timing',
        properties: {
          start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
          end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
          length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      },
      dc_calib_wait: {
        name: 'DC Calibration Wait Timer',
        description: 'DC calibration wait task timing',
        properties: {
          start_time: { name: 'Start Time', description: 'Task start time', writable: false, type: 'number', valueType: 'Uint32Property' },
          end_time: { name: 'End Time', description: 'Task end time', writable: false, type: 'number', valueType: 'Uint32Property' },
          length: { name: 'Length', description: 'Task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
          max_length: { name: 'Max Length', description: 'Maximum task execution length', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      }
    }
  },

  // CAN Bus interface
  can: {
    name: 'CAN Bus',
    description: 'CAN bus interface settings and status (0.6.x)',
    properties: {
      error: { name: 'CAN Error', description: 'CAN bus error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Can.Error]' },
      n_restarts: { name: 'Restarts', description: 'Number of CAN restarts', writable: false, type: 'number', valueType: 'Uint32Property' },
      n_rx: { name: 'RX Frames', description: 'Number of received CAN frames', writable: false, type: 'number', valueType: 'Uint32Property' },
      effective_baudrate: { name: 'Effective Baudrate', description: 'Measured effective CAN baudrate', writable: false, type: 'number', valueType: 'Uint32Property' },
    },
    children: {
      config: {
        name: 'CAN Configuration',
        description: 'CAN bus configuration parameters',
        properties: {
          baud_rate: { name: 'Baud Rate', description: 'CAN bus speed', writable: true, type: 'number', valueType: 'Uint32Property' },
          protocol: { name: 'Protocol', description: 'CAN protocol selection', writable: true, type: 'number', valueType: 'Property[ODrive.Can.Protocol]' },
        }
      }
    }
  },

  // System performance statistics
  system_stats: {
    name: 'System Statistics',
    description: 'System performance statistics',
    properties: {
      uptime: { name: 'Uptime', description: 'System uptime (ms)', writable: false, type: 'number', valueType: 'Uint32Property' },
      min_heap_space: { name: 'Min Heap Space', description: 'Minimum available heap space (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_axis: { name: 'Max Stack Usage Axis', description: 'Max stack usage for axis thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_comms: { name: 'Max Stack Usage Comms', description: 'Max stack usage for comms thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_uart: { name: 'Max Stack Usage UART', description: 'Max stack usage for UART thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_startup: { name: 'Max Stack Usage Startup', description: 'Max stack usage for startup thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_axis: { name: 'Stack Size Axis', description: 'Stack size for axis thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_comms: { name: 'Stack Size Comms', description: 'Stack size for comms thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_uart: { name: 'Stack Size UART', description: 'Stack size for UART thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_startup: { name: 'Stack Size Startup', description: 'Stack size for startup thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      prio_axis: { name: 'Priority Axis', description: 'Thread priority for axis thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_comms: { name: 'Priority Comms', description: 'Thread priority for comms thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_uart: { name: 'Priority UART', description: 'Thread priority for UART thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_startup: { name: 'Priority Startup', description: 'Thread priority for startup thread', writable: false, type: 'number', valueType: 'Int32Property' },
    },
    children: {
      usb: {
        name: 'USB Statistics',
        description: 'USB interface statistics',
        properties: {
          rx_cnt: { name: 'RX Count', description: 'USB receive count', writable: false, type: 'number', valueType: 'Uint32Property' },
          tx_cnt: { name: 'TX Count', description: 'USB transmit count', writable: false, type: 'number', valueType: 'Uint32Property' },
          tx_overrun_cnt: { name: 'TX Overrun Count', description: 'USB transmit overrun count', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      },
      i2c: {
        name: 'I2C Statistics',
        description: 'I2C interface statistics',
        properties: {
          addr: { name: 'Address', description: 'I2C address', writable: false, type: 'number', valueType: 'Uint8Property' },
          addr_match_cnt: { name: 'Address Match Count', description: 'I2C address match count', writable: false, type: 'number', valueType: 'Uint32Property' },
          rx_cnt: { name: 'RX Count', description: 'I2C receive count', writable: false, type: 'number', valueType: 'Uint32Property' },
          error_cnt: { name: 'Error Count', description: 'I2C error count', writable: false, type: 'number', valueType: 'Uint32Property' },
        }
      }
    }
  },

  // Built-in oscilloscope for debugging
  oscilloscope: {
    name: 'Oscilloscope',
    description: 'Built-in oscilloscope for debugging',
    properties: {
      size: { name: 'Size', description: 'Oscilloscope buffer size', writable: false, type: 'number', valueType: 'Uint32Property' },
      pos: { name: 'Position', description: 'Current buffer position', writable: false, type: 'number', valueType: 'Uint32Property' },
      rollover: { name: 'Rollover', description: 'Buffer rollover flag', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      recording: { name: 'Recording', description: 'Recording state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      trigger_pos: { name: 'Trigger Position', description: 'Trigger position in buffer', writable: false, type: 'number', valueType: 'Uint32Property' },
      triggered_at: { name: 'Triggered At', description: 'Time when triggered', writable: false, type: 'number', valueType: 'Uint32Property' },
    }
  },

  // Debug interface (not for end users)
  debug: {
    name: 'Debug',
    description: 'Diagnostics features (not intended for end users)',
    properties: {
      hal_ticks: { name: 'HAL Ticks', description: 'Hardware abstraction layer ticks', writable: false, type: 'number', valueType: 'Uint32Property' },
      adc_slot_0_raw: { name: 'ADC Slot 0 Raw', description: 'Raw ADC slot 0 value', writable: false, type: 'number', valueType: 'Uint32Property' },
      adc_slot_1_raw: { name: 'ADC Slot 1 Raw', description: 'Raw ADC slot 1 value', writable: false, type: 'number', valueType: 'Uint32Property' },
      adc_slot_2_raw: { name: 'ADC Slot 2 Raw', description: 'Raw ADC slot 2 value', writable: false, type: 'number', valueType: 'Uint32Property' },
      adc_slot_3_raw: { name: 'ADC Slot 3 Raw', description: 'Raw ADC slot 3 value', writable: false, type: 'number', valueType: 'Uint32Property' },
      adc_slot_4_raw: { name: 'ADC Slot 4 Raw', description: 'Raw ADC slot 4 value', writable: false, type: 'number', valueType: 'Uint32Property' },
      adc_slot_10_raw: { name: 'ADC Slot 10 Raw', description: 'Raw ADC slot 10 value', writable: false, type: 'number', valueType: 'Uint32Property' },
      vref: { name: 'Voltage Reference', description: 'Internal voltage reference', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      mcu_temperature: { name: 'MCU Temperature', description: 'Microcontroller temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
      factory_data_loaded: { name: 'Factory Data Loaded', description: 'Factory calibration data loaded', writable: false, type: 'boolean', valueType: 'BoolProperty' },
    }
  },

  // Issues tracking (experimental)
  issues: {
    name: 'Issues',
    description: 'Issue tracking system (experimental)',
    properties: {
      length: { name: 'Length', description: 'Number of tracked issues', writable: false, type: 'number', valueType: 'Uint32Property' },
    }
  },

  // Authentication system
  auth: {
    name: 'Authentication',
    description: 'Authentication and security features',
    properties: {}
  },

  // Inverter configurations
  inverter0: {
    name: 'Inverter 0',
    description: 'Motor inverter 0 configuration',
    children: {
      config: {
        name: 'Inverter 0 Configuration',
        description: 'Inverter 0 power stage configuration',
        properties: {
          current_soft_max: { name: 'Current Soft Max', description: 'Maximum commanded current for this inverter (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          current_hard_max: { name: 'Current Hard Max', description: 'Maximum measured current allowed (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          temp_limit_lower: { name: 'Temperature Limit Lower', description: 'Lower temperature limit for current derating (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          temp_limit_upper: { name: 'Temperature Limit Upper', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          mod_magn_max: { name: 'Max Modulation Magnitude', description: 'Maximum modulation depth', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          shunt_conductance: { name: 'Shunt Conductance', description: 'Shunt resistor conductance (1/R)', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
          drv_config: { name: 'DRV Config', description: 'Gate driver configuration register', writable: true, type: 'number', valueType: 'Uint64Property' },
        }
      }
    }
  },

  inverter1: {
    name: 'Inverter 1',
    description: 'Motor inverter 1 configuration',
    children: {
      config: {
        name: 'Inverter 1 Configuration',
        description: 'Inverter 1 power stage configuration',
        properties: {
          current_soft_max: { name: 'Current Soft Max', description: 'Maximum commanded current for this inverter (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          current_hard_max: { name: 'Current Hard Max', description: 'Maximum measured current allowed (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          temp_limit_lower: { name: 'Temperature Limit Lower', description: 'Lower temperature limit for current derating (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          temp_limit_upper: { name: 'Temperature Limit Upper', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          mod_magn_max: { name: 'Max Modulation Magnitude', description: 'Maximum modulation depth', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
          shunt_conductance: { name: 'Shunt Conductance', description: 'Shunt resistor conductance (1/R)', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
          drv_config: { name: 'DRV Config', description: 'Gate driver configuration register', writable: true, type: 'number', valueType: 'Uint64Property' },
        }
      }
    }
  },

  // Axis 0 and 1 tree structures
  axis0: generateAxisTree(0),
  axis1: generateAxisTree(1),
};
