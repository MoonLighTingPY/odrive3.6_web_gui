import { generateAxisTree } from './odriveAxisTree.js'

export const odrivePropertyTree = {
  // Root system properties
  system: {
    name: 'System Properties',
    description: 'Top-level ODrive system settings and information',
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
      serial_number: { name: 'Serial Number', description: 'Device serial number', writable: false, type: 'number', valueType: 'Uint64Property' },
      brake_resistor_armed: { name: 'Brake Resistor Armed', description: 'Brake resistor armed state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      brake_resistor_saturated: { name: 'Brake Resistor Saturated', description: 'Brake resistor saturated state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      brake_resistor_current: { name: 'Brake Resistor Current', description: 'Commanded brake resistor current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
      n_evt_sampling: { name: 'Sampling Events', description: 'Number of input sampling events since startup', writable: false, type: 'number', valueType: 'Uint32Property' },
      n_evt_control_loop: { name: 'Control Loop Events', description: 'Number of control loop iterations since startup', writable: false, type: 'number', valueType: 'Uint32Property' },
      task_timers_armed: { name: 'Task Timers Armed', description: 'Set by profiling application to trigger sampling', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      user_config_loaded: { name: 'User Config Loaded', description: 'User configuration loaded status', writable: false, type: 'number', valueType: 'Uint32Property' },
      misconfigured: { name: 'Misconfigured', description: 'System misconfiguration flag', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      otp_valid: { name: 'OTP Valid', description: 'One-time programmable memory valid', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      test_property: { name: 'Test Property', description: 'Test property for development', writable: true, type: 'number', valueType: 'Uint32Property' },
      error: { name: 'ODrive Error', description: 'ODrive system error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
    }
  },

  // Root config properties - these map to ODrive.Config
  config: {
    name: 'System Configuration',
    description: 'Top-level ODrive configuration parameters',
    properties: {
      enable_uart_a: { name: 'Enable UART A', description: 'Enable UART A interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      enable_uart_b: { name: 'Enable UART B', description: 'Enable UART B interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      enable_uart_c: { name: 'Enable UART C', description: 'Enable UART C interface (not supported on ODrive v3.x)', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      uart_a_baudrate: {
        name: 'UART A Baudrate',
        description: 'UART A communication baudrate',
        writable: true,
        type: 'number',
        valueType: 'Uint32Property',
        selectOptions: [
          { value: 9600, label: '9600 bps' },
          { value: 19200, label: '19200 bps' },
          { value: 38400, label: '38400 bps' },
          { value: 57600, label: '57600 bps' },
          { value: 115200, label: '115200 bps' },
          { value: 230400, label: '230400 bps' },
          { value: 460800, label: '460800 bps' },
          { value: 921600, label: '921600 bps' }
        ]
      },
      uart_b_baudrate: {
        name: 'UART B Baudrate',
        description: 'UART B communication baudrate',
        writable: true,
        type: 'number',
        valueType: 'Uint32Property',
        selectOptions: [
          { value: 9600, label: '9600 bps' },
          { value: 19200, label: '19200 bps' },
          { value: 38400, label: '38400 bps' },
          { value: 57600, label: '57600 bps' },
          { value: 115200, label: '115200 bps' },
          { value: 230400, label: '230400 bps' },
          { value: 460800, label: '460800 bps' },
          { value: 921600, label: '921600 bps' }
        ]
      },
      uart_c_baudrate: {
        name: 'UART C Baudrate',
        description: 'UART C communication baudrate (not supported on ODrive v3.x)',
        writable: true,
        type: 'number',
        valueType: 'Uint32Property',
        selectOptions: [
          { value: 9600, label: '9600 bps' },
          { value: 19200, label: '19200 bps' },
          { value: 38400, label: '38400 bps' },
          { value: 57600, label: '57600 bps' },
          { value: 115200, label: '115200 bps' },
          { value: 230400, label: '230400 bps' },
          { value: 460800, label: '460800 bps' },
          { value: 921600, label: '921600 bps' }
        ]
      },
      enable_can_a: { name: 'Enable CAN A', description: 'Enable CAN A interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      enable_i2c_a: { name: 'Enable I2C A', description: 'Enable I2C A interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      usb_cdc_protocol: {
        name: 'USB CDC Protocol',
        description: 'Protocol for USB virtual COM port',
        writable: true,
        type: 'number',
        valueType: 'Property[ODrive.StreamProtocolType]',
        selectOptions: [
          { value: 0, label: 'Fibre' },
          { value: 1, label: 'ASCII' },
          { value: 2, label: 'Stdout' },
          { value: 3, label: 'ASCII + Stdout' }
        ]
      },
      uart0_protocol: {
        name: 'UART0 Protocol',
        description: 'UART0 protocol selection',
        writable: true,
        type: 'number',
        valueType: 'Property[ODrive.StreamProtocolType]',
        selectOptions: [
          { value: 0, label: 'Fibre' },
          { value: 1, label: 'ASCII' },
          { value: 2, label: 'Stdout' },
          { value: 3, label: 'ASCII + Stdout' }
        ]
      },
      uart1_protocol: {
        name: 'UART1 Protocol',
        description: 'UART1 protocol selection',
        writable: true,
        type: 'number',
        valueType: 'Property[ODrive.StreamProtocolType]',
        selectOptions: [
          { value: 0, label: 'Fibre' },
          { value: 1, label: 'ASCII' },
          { value: 2, label: 'Stdout' },
          { value: 3, label: 'ASCII + Stdout' }
        ]
      },
      uart2_protocol: {
        name: 'UART2 Protocol',
        description: 'UART2 protocol selection',
        writable: true,
        type: 'number',
        valueType: 'Property[ODrive.StreamProtocolType]',
        selectOptions: [
          { value: 0, label: 'Fibre' },
          { value: 1, label: 'ASCII' },
          { value: 2, label: 'Stdout' },
          { value: 3, label: 'ASCII + Stdout' }
        ]
      },
      max_regen_current: { name: 'Max Regen Current', description: 'Bus current allowed to flow back to power supply before brake resistor starts shunting (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      brake_resistance: { name: 'Brake Resistance', description: 'Value of the brake resistor connected to the ODrive (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2, hasSlider: true, valueType: 'Float32Property' },
      enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable the use of a brake resistor', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'Minimum voltage below which the motor stops operating (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'Maximum voltage above which the motor stops operating (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      enable_dc_bus_overvoltage_ramp: { name: 'Enable DC Bus Overvoltage Ramp', description: 'Enable DC bus overvoltage ramp feature', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      dc_bus_overvoltage_ramp_start: { name: 'DC Bus Overvoltage Ramp Start', description: 'DC bus overvoltage ramp start voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_bus_overvoltage_ramp_end: { name: 'DC Bus Overvoltage Ramp End', description: 'DC bus overvoltage ramp end voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Max current the power supply can source (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Max current the power supply can sink (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      error_gpio_pin: { name: 'Error GPIO Pin', description: 'GPIO pin for error output', writable: true, type: 'number', valueType: 'Uint32Property' },
      gpio3_analog_mapping: { name: 'GPIO3 Analog Mapping', description: 'Analog mapping for GPIO3', writable: true, type: 'object', valueType: 'ODrive.Endpoint' },
      gpio4_analog_mapping: { name: 'GPIO4 Analog Mapping', description: 'Analog mapping for GPIO4', writable: true, type: 'object', valueType: 'ODrive.Endpoint' },
    }
  },

  // CAN bus interface
  can: {
    name: 'CAN Bus',
    description: 'CAN bus interface settings and status',
    properties: {
      error: { name: 'CAN Error', description: 'CAN bus error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Can.Error]' },
    },
    children: {
      config: {
        name: 'CAN Configuration',
        description: 'CAN bus configuration parameters',
        properties: {
          baud_rate: {
            name: 'Baud Rate',
            description: 'CAN bus communication speed',
            writable: true,
            type: 'number',
            valueType: 'Uint32Property',
            selectOptions: [
              { value: 125000, label: '125 kbps' },
              { value: 250000, label: '250 kbps' },
              { value: 500000, label: '500 kbps' },
              { value: 1000000, label: '1 Mbps' }
            ]
          },
          protocol: {
            name: 'Protocol',
            description: 'CAN protocol selection',
            writable: true,
            type: 'number',
            valueType: 'Property[ODrive.Can.Protocol]',
            selectOptions: [
              { value: 1, label: 'Simple' }
            ]
          },
        }
      }
    }
  },

  // System stats
  system_stats: {
    name: 'System Statistics',
    description: 'System performance statistics',
    properties: {
      uptime: { name: 'Uptime', description: 'System uptime (ms)', writable: false, type: 'number', valueType: 'Uint32Property' },
      min_heap_space: { name: 'Min Heap Space', description: 'Minimum available heap space (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_axis: { name: 'Max Stack Usage Axis', description: 'Maximum stack usage for axis thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_usb: { name: 'Max Stack Usage USB', description: 'Maximum stack usage for USB thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_uart: { name: 'Max Stack Usage UART', description: 'Maximum stack usage for UART thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_can: { name: 'Max Stack Usage CAN', description: 'Maximum stack usage for CAN thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_startup: { name: 'Max Stack Usage Startup', description: 'Maximum stack usage for startup thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      max_stack_usage_analog: { name: 'Max Stack Usage Analog', description: 'Maximum stack usage for analog thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_axis: { name: 'Stack Size Axis', description: 'Stack size for axis thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_usb: { name: 'Stack Size USB', description: 'Stack size for USB thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_uart: { name: 'Stack Size UART', description: 'Stack size for UART thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_startup: { name: 'Stack Size Startup', description: 'Stack size for startup thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_can: { name: 'Stack Size CAN', description: 'Stack size for CAN thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      stack_size_analog: { name: 'Stack Size Analog', description: 'Stack size for analog thread (bytes)', writable: false, type: 'number', valueType: 'Uint32Property' },
      prio_axis: { name: 'Priority Axis', description: 'Thread priority for axis thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_usb: { name: 'Priority USB', description: 'Thread priority for USB thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_uart: { name: 'Priority UART', description: 'Thread priority for UART thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_startup: { name: 'Priority Startup', description: 'Thread priority for startup thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_can: { name: 'Priority CAN', description: 'Thread priority for CAN thread', writable: false, type: 'number', valueType: 'Int32Property' },
      prio_analog: { name: 'Priority Analog', description: 'Thread priority for analog thread', writable: false, type: 'number', valueType: 'Int32Property' },
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

  // Oscilloscope
  oscilloscope: {
    name: 'Oscilloscope',
    description: 'Built-in oscilloscope for debugging',
    properties: {
      size: { name: 'Size', description: 'Oscilloscope buffer size', writable: false, type: 'number', valueType: 'Uint32Property' },
    }
  },

  // Axis 0 tree structure
  axis0: generateAxisTree(0),
  axis1: generateAxisTree(1),
};

