import { generateAxisTree06 as generateAxisTree } from './odriveAxisTree_0_6.js'

export const odrivePropertyTree06 = {
  system: {
    name: 'System Properties',
    description: 'Top-level ODrive system settings and information (0.6.x)',
    properties: {
      hw_version_major: { name: 'Hardware Version Major', description: 'Major hardware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      hw_version_minor: { name: 'Hardware Version Minor', description: 'Minor hardware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      hw_version_variant: { name: 'Hardware Variant', description: 'Hardware variant identifier', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_major: { name: 'Firmware Version Major', description: 'Major firmware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_minor: { name: 'Firmware Version Minor', description: 'Minor firmware version', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_revision: { name: 'Firmware Revision', description: 'Firmware revision number', writable: false, type: 'number', valueType: 'Uint8Property' },
      fw_version_unreleased: { name: 'Firmware Unreleased', description: 'Unreleased firmware flag (0 for official releases)', writable: false, type: 'number', valueType: 'Uint8Property' },
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
  bootloader_version: { name: 'Bootloader Version', description: 'Bootloader version', writable: false, type: 'number', valueType: 'Uint32Property' },
  reboot_required: { name: 'Reboot Required', description: 'Indicates if reboot is required', writable: false, type: 'boolean', valueType: 'BoolProperty' },
  identify: { name: 'Identify', description: 'Toggle LED identify mode', writable: true, type: 'boolean', valueType: 'BoolProperty' },
    }
  },

  config: {
    name: 'System Configuration',
    description: 'Top-level ODrive configuration parameters (0.6.x)',
    properties: {
  enable_uart_a: { name: 'Enable UART A', description: 'Enable UART A interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
  uart_a_baudrate: { name: 'UART A Baudrate', description: 'UART A communication baudrate', writable: true, type: 'number', valueType: 'Uint32Property' },
  usb_cdc_protocol: { name: 'USB CDC Protocol', description: 'Protocol for USB virtual COM port', writable: true, type: 'number', valueType: 'Property[ODrive.StreamProtocolType]' },
  uart0_protocol: { name: 'UART0 Protocol', description: 'UART0 protocol selection', writable: true, type: 'number', valueType: 'Property[ODrive.StreamProtocolType]' },
      max_regen_current: { name: 'Max Regen Current', description: 'Bus current allowed to flow back before brake resistor (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable the use of a brake resistor', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      brake_resistance: { name: 'Brake Resistance', description: 'Value of the brake resistor (Ω)', writable: true, type: 'number', decimals: 2, valueType: 'Float32Property' },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'Minimum voltage below which the motor stops (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'Maximum voltage above which the motor stops (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      enable_dc_bus_overvoltage_ramp: { name: 'Enable DC Bus Overvoltage Ramp', description: 'Enable DC bus overvoltage ramp feature', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      dc_bus_overvoltage_ramp_start: { name: 'DC Bus Overvoltage Ramp Start', description: 'Ramp start voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_bus_overvoltage_ramp_end: { name: 'DC Bus Overvoltage Ramp End', description: 'Ramp end voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Max current the supply can source (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Max current the supply can sink (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
  error_gpio_pin: { name: 'Error GPIO Pin', description: 'GPIO pin for error output', writable: true, type: 'number', valueType: 'Uint32Property' },
    }
  },

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

  oscilloscope: {
    name: 'Oscilloscope',
    description: 'Built-in oscilloscope for debugging',
    properties: {
      size: { name: 'Size', description: 'Oscilloscope buffer size', writable: false, type: 'number', valueType: 'Uint32Property' },
    }
  },

  axis0: generateAxisTree(0),
  axis1: generateAxisTree(1),
}
