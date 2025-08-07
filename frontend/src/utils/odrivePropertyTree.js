import { generateAxisTree } from './odriveAxisTree.js'

// Generate property tree with firmware version awareness
export const generateOdrivePropertyTree = (firmwareVersion = "0.5.6") => {
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

  const isV06x = isVersion06x(firmwareVersion);

  return {
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
      n_evt_sampling: { name: 'Sampling Events', description: 'Number of input sampling events since startup', writable: false, type: 'number', valueType: 'Uint32Property' },
      n_evt_control_loop: { name: 'Control Loop Events', description: 'Number of control loop iterations since startup', writable: false, type: 'number', valueType: 'Uint32Property' },
      error: { name: 'ODrive Error', description: 'ODrive system error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Error]' },
      
      // Version-specific system properties
      ...(isV06x ? {
        // 0.6.x specific system properties
        commit_hash: { name: 'Commit Hash', description: 'Git commit hash of firmware', writable: false, type: 'number', valueType: 'Uint32Property' },
        bootloader_version: { name: 'Bootloader Version', description: 'ODrive bootloader version', writable: false, type: 'number', valueType: 'Uint32Property' },
        control_loop_hz: { name: 'Control Loop Frequency', description: 'Control loop frequency (Hz)', writable: false, type: 'number', valueType: 'Uint32Property' },
        hw_version_revision: { name: 'Hardware Revision', description: 'Hardware revision number', writable: false, type: 'number', valueType: 'Uint8Property' },
        task_timers_armed: { name: 'Task Timers Armed', description: 'Indicates profiler trigger', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        test_property: { name: 'Test Property', description: 'Developer-use property', writable: true, type: 'number', valueType: 'Uint32Property' },
        reboot_required: { name: 'Reboot Required', description: 'Indicates if reboot is pending', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        identify: { name: 'Identify', description: 'LED identify toggle', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        user_config_loaded: { name: 'User Config Loaded', description: 'User configuration loaded count', writable: false, type: 'number', valueType: 'Uint32Property' },
        misconfigured: { name: 'Misconfigured', description: 'Whether device is misconfigured', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        otp_valid: { name: 'OTP Valid', description: 'Whether OTP (One-Time Programmable) memory is valid', writable: false, type: 'boolean', valueType: 'BoolProperty' },
      } : {
        // 0.5.x specific system properties
        brake_resistor_armed: { name: 'Brake Resistor Armed', description: 'Brake resistor armed state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        brake_resistor_saturated: { name: 'Brake Resistor Saturated', description: 'Brake resistor saturated state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        brake_resistor_current: { name: 'Brake Resistor Current', description: 'Commanded brake resistor current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        task_timers_armed: { name: 'Task Timers Armed', description: 'Set by profiling application to trigger sampling', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        user_config_loaded: { name: 'User Config Loaded', description: 'User configuration loaded status', writable: false, type: 'number', valueType: 'Uint32Property' },
        misconfigured: { name: 'Misconfigured', description: 'System misconfiguration flag', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        otp_valid: { name: 'OTP Valid', description: 'One-time programmable memory valid', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        test_property: { name: 'Test Property', description: 'Test property for development', writable: true, type: 'number', valueType: 'Uint32Property' },
      }),
    }
  },

  // Root config properties - these map to ODrive.Config
  config: {
    name: 'System Configuration',
    description: 'Top-level ODrive configuration parameters',
    properties: {
      // Common properties for both versions
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
      
      // Version-specific properties
      ...(isV06x ? {
        // 0.6.x only has uart0_protocol, not uart1/uart2
        uart0_protocol: {
          name: 'UART0 Protocol',
          description: 'Protocol selection for UART0 interface',
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
        // User config slots for 0.6.x
        user_config_0: { name: 'User Config 0', description: 'General purpose persistent user storage slot 0', writable: true, type: 'number', valueType: 'Uint32Property' },
        user_config_1: { name: 'User Config 1', description: 'General purpose persistent user storage slot 1', writable: true, type: 'number', valueType: 'Uint32Property' },
        user_config_2: { name: 'User Config 2', description: 'General purpose persistent user storage slot 2', writable: true, type: 'number', valueType: 'Uint32Property' },
        user_config_3: { name: 'User Config 3', description: 'General purpose persistent user storage slot 3', writable: true, type: 'number', valueType: 'Uint32Property' },
        user_config_4: { name: 'User Config 4', description: 'General purpose persistent user storage slot 4', writable: true, type: 'number', valueType: 'Uint32Property' },
        user_config_5: { name: 'User Config 5', description: 'General purpose persistent user storage slot 5', writable: true, type: 'number', valueType: 'Uint32Property' },
        user_config_6: { name: 'User Config 6', description: 'General purpose persistent user storage slot 6', writable: true, type: 'number', valueType: 'Uint32Property' },
        user_config_7: { name: 'User Config 7', description: 'General purpose persistent user storage slot 7', writable: true, type: 'number', valueType: 'Uint32Property' },
      } : {
        // 0.5.x has enable flags and multiple UARTs
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
        enable_can_a: { name: 'Enable CAN A', description: 'Enable CAN A interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        enable_i2c_a: { name: 'Enable I2C A', description: 'Enable I2C A interface', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      }),
      
      // Common properties for both versions
      max_regen_current: { name: 'Max Regen Current', description: 'Bus current allowed to flow back to power supply before brake resistor starts shunting (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      
      // Brake resistor properties only for 0.5.x (moved to brake_resistor0 in 0.6.x)
      ...(!isV06x ? {
        enable_brake_resistor: { name: 'Enable Brake Resistor', description: 'Enable/disable the use of a brake resistor', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        brake_resistance: { name: 'Brake Resistance', description: 'Value of the brake resistor connected to the ODrive (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2, hasSlider: true, valueType: 'Float32Property' },
      } : {}),
      
      dc_bus_undervoltage_trip_level: { name: 'DC Bus Undervoltage Trip', description: 'Minimum voltage below which the motor stops operating (V)', writable: true, type: 'number', min: 8, max: 30, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      dc_bus_overvoltage_trip_level: { name: 'DC Bus Overvoltage Trip', description: 'Maximum voltage above which the motor stops operating (V)', writable: true, type: 'number', min: 12, max: 60, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      
      // DC bus overvoltage ramp properties only for 0.5.x (moved to brake_resistor0 in 0.6.x)
      ...(!isV06x ? {
        enable_dc_bus_overvoltage_ramp: { name: 'Enable DC Bus Overvoltage Ramp', description: 'Enable DC bus overvoltage ramp feature', writable: true, type: 'boolean', valueType: 'BoolProperty' },
        dc_bus_overvoltage_ramp_start: { name: 'DC Bus Overvoltage Ramp Start', description: 'DC bus overvoltage ramp start voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
        dc_bus_overvoltage_ramp_end: { name: 'DC Bus Overvoltage Ramp End', description: 'DC bus overvoltage ramp end voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
      } : {}),
      
      dc_max_positive_current: { name: 'DC Max Positive Current', description: 'Max current the power supply can source (A)', writable: true, type: 'number', min: 0, max: 60, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      dc_max_negative_current: { name: 'DC Max Negative Current', description: 'Max current the power supply can sink (A)', writable: true, type: 'number', min: -60, max: 0, step: 0.1, decimals: 1, hasSlider: true, valueType: 'Float32Property' },
      error_gpio_pin: { name: 'Error GPIO Pin', description: 'GPIO pin for error output', writable: true, type: 'number', valueType: 'Uint32Property' },
      gpio3_analog_mapping: { name: 'GPIO3 Analog Mapping', description: 'Analog mapping for GPIO3', writable: true, type: 'object', valueType: 'ODrive.Endpoint' },
      gpio4_analog_mapping: { name: 'GPIO4 Analog Mapping', description: 'Analog mapping for GPIO4', writable: true, type: 'object', valueType: 'ODrive.Endpoint' },
    },
    // 0.6.x has nested inverter0 config
    ...(isV06x ? {
      children: {
        inverter0: {
          name: 'Inverter 0 Configuration',
          description: 'Inverter 0 configuration parameters',
          properties: {
            current_soft_max: { name: 'Current Soft Max', description: 'Soft maximum current limit for this inverter (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            current_hard_max: { name: 'Current Hard Max', description: 'Hard maximum current limit for this inverter (A)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            temp_limit_lower: { name: 'Temperature Limit Lower', description: 'Lower temperature limit for current limiting (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            temp_limit_upper: { name: 'Temperature Limit Upper', description: 'Upper temperature limit for shutdown (°C)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            mod_magn_max: { name: 'Max Modulation Magnitude', description: 'Maximum modulation depth', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
            shunt_conductance: { name: 'Shunt Conductance', description: 'Current sense shunt conductance (S)', writable: true, type: 'number', decimals: 6, valueType: 'Float32Property' },
          }
        },
        brake_resistor0: {
          name: 'Brake Resistor 0 Configuration',
          description: 'Brake resistor configuration parameters (0.6.x)',
          properties: {
            enable: { name: 'Enable', description: 'Enable/disable the use of a brake resistor', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            resistance: { name: 'Resistance', description: 'Value of the brake resistor (Ω)', writable: true, type: 'number', min: 0.1, max: 100, step: 0.1, decimals: 2, hasSlider: true, valueType: 'Float32Property' },
            enable_dc_bus_voltage_feedback: { name: 'Enable DC Bus Voltage Feedback', description: 'Enable DC bus voltage feedback feature', writable: true, type: 'boolean', valueType: 'BoolProperty' },
            dc_bus_voltage_feedback_ramp_start: { name: 'DC Bus Voltage Feedback Ramp Start', description: 'DC bus voltage feedback ramp start voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
            dc_bus_voltage_feedback_ramp_end: { name: 'DC Bus Voltage Feedback Ramp End', description: 'DC bus voltage feedback ramp end voltage (V)', writable: true, type: 'number', decimals: 1, valueType: 'Float32Property' },
          }
        }
      }
    } : {})
  },

  // CAN bus interface
  can: {
    name: 'CAN Bus',
    description: 'CAN bus interface settings and status',
    properties: {
      error: { name: 'CAN Error', description: 'CAN bus error flags', writable: false, type: 'number', valueType: 'Property[ODrive.Can.Error]' },
      
      // 0.6.x specific CAN diagnostic properties
      ...(isV06x ? {
        n_restarts: { name: 'CAN Restarts', description: 'Number of CAN bus restarts', writable: false, type: 'number', valueType: 'Uint32Property' },
        n_rx: { name: 'CAN RX Count', description: 'Number of CAN messages received', writable: false, type: 'number', valueType: 'Uint32Property' },
        effective_baudrate: { name: 'Effective Baudrate', description: 'Actual CAN baudrate after autobaud detection', writable: false, type: 'number', valueType: 'Uint32Property' },
      } : {}),
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
          ...(isV06x ? {
            autobaud_enabled: { name: 'Auto Baud Enable', description: 'Enable automatic baud rate detection', writable: true, type: 'boolean', valueType: 'BoolProperty' },
          } : {}),
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

  // 0.6.x brake resistor support
  ...(isV06x ? {
    brake_resistor0: {
      name: 'Brake Resistor',
      description: 'Brake resistor control and monitoring (0.6.x)',
      properties: {
        current: { name: 'Current', description: 'Calculated current dumped into the brake resistor (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        current_meas: { name: 'Current Measured', description: 'Measured brake resistor current (A)', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        current_meas_status: { name: 'Current Measurement Status', description: 'Current measurement status', writable: false, type: 'number', valueType: 'Uint32Property' },
        duty: { name: 'Duty Cycle', description: 'Brake resistor duty cycle', writable: false, type: 'number', decimals: 3, valueType: 'Float32Property' },
        additional_duty: { name: 'Additional Duty', description: 'Additional duty cycle to add (experimental)', writable: true, type: 'number', decimals: 3, valueType: 'Float32Property' },
        chopper_temp: { name: 'Chopper Temperature', description: 'Estimate of the brake resistor chopper temperature (°C)', writable: false, type: 'number', decimals: 1, valueType: 'Float32Property' },
        is_armed: { name: 'Is Armed', description: 'Brake resistor armed state', writable: false, type: 'boolean', valueType: 'BoolProperty' },
        was_saturated: { name: 'Was Saturated', description: 'Indicates if the brake resistor reached saturation (latching)', writable: true, type: 'boolean', valueType: 'BoolProperty' },
      }
    }
  } : {}),

  // 0.6.x New Methods/Functions
  ...(isV06x ? {
    methods: {
      name: 'ODrive Methods',
      description: 'Callable methods and functions available in 0.6.x',
      properties: {
        test_function: { name: 'Test Function', description: 'Test function accepting a delta parameter', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'delta', type: 'number' }] },
        get_adc_voltage: { name: 'Get ADC Voltage', description: 'Reads ADC voltage from a specified GPIO', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'gpio', type: 'number' }] },
        enter_dfu_mode2: { name: 'Enter DFU Mode 2', description: 'Enters experimental DFU mode via CAN', writable: false, type: 'function', valueType: 'Function' },
        disable_bootloader: { name: 'Disable Bootloader', description: 'Disables bootloader (useful for downgrades)', writable: false, type: 'function', valueType: 'Function' },
        identify_once: { name: 'Identify Once', description: 'Blinks the LED once (for identifying devices)', writable: false, type: 'function', valueType: 'Function' },
        get_interrupt_status: { name: 'Get Interrupt Status', description: 'Returns status of specified interrupt', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'irqn', type: 'number' }] },
        get_dma_status: { name: 'Get DMA Status', description: 'Returns DMA stream information', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'stream_num', type: 'number' }] },
        set_gpio: { name: 'Set GPIO', description: 'Sets a GPIO state (experimental)', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'num', type: 'number' }, { name: 'status', type: 'boolean' }] },
        get_raw_8: { name: 'Get Raw 8', description: 'Raw memory access for 8-bit diagnostics', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'address', type: 'number' }] },
        get_raw_32: { name: 'Get Raw 32', description: 'Raw memory access for 32-bit diagnostics', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'address', type: 'number' }] },
        get_raw_256: { name: 'Get Raw 256', description: 'Raw memory access for 256-bit diagnostics', writable: false, type: 'function', valueType: 'Function', parameters: [{ name: 'address', type: 'number' }] },
      }
    },
    // Experimental interfaces for 0.6.x
    auth: {
      name: 'Authentication',
      description: 'Experimental authentication interface',
      properties: {}
    },
    issues: {
      name: 'Issues',
      description: 'Experimental diagnostic and issue reporting interface',
      properties: {}
    },
    debug: {
      name: 'Debug',
      description: 'Diagnostics features. Not intended for use by end users',
      properties: {}
    },
  } : {}),

  // Axis 0 tree structure
  axis0: generateAxisTree(0, firmwareVersion),
  axis1: generateAxisTree(1, firmwareVersion),
  };
};

// For backward compatibility
export const odrivePropertyTree = generateOdrivePropertyTree("0.5.6");

