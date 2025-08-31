import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import ParameterSwitch from '../config-parameter-fields/ParameterSwitch'
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { useVersionedUtils } from '../../utils/versionSelection'
import { useSelector } from 'react-redux'

// Interface parameter groups for 0.6.x API
const INTERFACE_PARAM_GROUPS_06 = {
  // Enhanced CAN Configuration (0.6.x changes)
  can_protocol: { group: 'CAN', subgroup: 'Protocol', importance: 'essential' }, // Replaces enable_can_a
  can_node_id: { group: 'CAN', subgroup: 'Addressing', importance: 'essential' }, // Extended format in bit 31
  can_baudrate: { group: 'CAN', subgroup: 'Communication', importance: 'essential' },
  can_data_baud_rate: { group: 'CAN', subgroup: 'CAN-FD', importance: 'advanced' }, // New CAN-FD support in 0.6.x
  can_tx_brs: { group: 'CAN', subgroup: 'CAN-FD', importance: 'advanced' }, // CAN-FD bit rate switching

  // Enhanced watchdog (0.6.x behavior changes)
  enable_watchdog: { group: 'Watchdog', subgroup: 'Configuration', importance: 'essential' },
  watchdog_timeout: { group: 'Watchdog', subgroup: 'Configuration', importance: 'essential' },
  
  // Enhanced UART settings
  uart_baudrate: { group: 'UART', subgroup: 'Communication', importance: 'advanced' },
  uart_protocol: { group: 'UART', subgroup: 'Protocol', importance: 'advanced' },

  // Step/Direction interface (enhanced in 0.6.x)
  step_dir_enabled: { group: 'Step/Direction', subgroup: 'Configuration', importance: 'advanced' },
  step_dir_step_pin: { group: 'Step/Direction', subgroup: 'Hardware', importance: 'advanced' },
  step_dir_dir_pin: { group: 'Step/Direction', subgroup: 'Hardware', importance: 'advanced' },
  
  // PWM Input (enhanced in 0.6.x)
  pwm_enabled: { group: 'PWM Input', subgroup: 'Configuration', importance: 'advanced' },
  pwm_pin: { group: 'PWM Input', subgroup: 'Hardware', importance: 'advanced' },
  pwm_mapping_min: { group: 'PWM Input', subgroup: 'Mapping', importance: 'advanced' },
  pwm_mapping_max: { group: 'PWM Input', subgroup: 'Mapping', importance: 'advanced' },

  // Analog Input
  analog_enabled: { group: 'Analog Input', subgroup: 'Configuration', importance: 'advanced' },
  analog_pin: { group: 'Analog Input', subgroup: 'Hardware', importance: 'advanced' },
  analog_mapping_min: { group: 'Analog Input', subgroup: 'Mapping', importance: 'advanced' },
  analog_mapping_max: { group: 'Analog Input', subgroup: 'Mapping', importance: 'advanced' },

  // GPIO Configuration (enhanced in 0.6.x)
  gpio_modes: { group: 'GPIO', subgroup: 'Configuration', importance: 'advanced' }, // Enhanced in 0.6.x
  
  // CAN scaling factors (new in 0.6.x)
  input_vel_scale: { group: 'CAN', subgroup: 'Scaling', importance: 'advanced' }, // New in 0.6.x
  input_torque_scale: { group: 'CAN', subgroup: 'Scaling', importance: 'advanced' }, // New in 0.6.x
}

const InterfaceConfigStep06 = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Get interface config (device-level) and axis-specific interface config
  const interfaceConfig = deviceConfig.interface || {}
  const axisInterfaceConfig = deviceConfig.interface?.[`axis${selectedAxis}`] || {}

  const { registry, grouping } = useVersionedUtils()

  // Get interface parameters for 0.6.x
  const interfaceParams = registry.getConfigCategories().interface || []
  
  // Filter parameters by importance
  const essentialParams = grouping.getParametersByImportance(interfaceParams, INTERFACE_PARAM_GROUPS_06, 'essential')
  const advancedParams = grouping.getParametersByImportance(interfaceParams, INTERFACE_PARAM_GROUPS_06, 'advanced')
    .filter(param => grouping.getParameterImportance(param, INTERFACE_PARAM_GROUPS_06) === 'advanced')

  // Group advanced parameters
  const groupedAdvancedParams = grouping.getGroupedAdvancedParameters(advancedParams, INTERFACE_PARAM_GROUPS_06)

  const handleParameterChange = (configKey, value) => {
    onUpdateConfig('interface', configKey, value)
  }

  const handleLoadDefaults = () => {
    // 0.6.x specific defaults
    const defaults = {
      can_protocol: 1, // Protocol.SIMPLE (replaces enable_can_a)
      can_node_id: 0x3f, // Changed default from 0x00 to 0x3f in 0.6.x
      can_baudrate: 250000,
      can_data_baud_rate: 2000000, // CAN-FD data rate
      can_tx_brs: false, // Bit rate switching
      enable_watchdog: false,
      watchdog_timeout: 0.0,
      input_vel_scale: 1.0, // New scaling factors in 0.6.x
      input_torque_scale: 1.0,
      uart_baudrate: 115200,
      step_dir_enabled: false,
      pwm_enabled: false,
      analog_enabled: false,
    }

    Object.entries(defaults).forEach(([key, value]) => {
      handleParameterChange(key, value)
    })
  }

  // CAN protocol options (0.6.x)
  const canProtocolOptions = [
    { value: 0, label: 'None (Disabled)' },
    { value: 1, label: 'CANSimple' },
    { value: 2, label: 'CANOpen (Reserved)' },
  ]

  // UART protocol options
  const uartProtocolOptions = [
    { value: 0, label: 'None' },
    { value: 1, label: 'ASCII' },
    { value: 2, label: 'Modbus RTU' },
  ]

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <HStack>
              <Heading size="md" color="cyan.400">
                Interface Configuration (0.6.x)
              </Heading>
              <Badge colorScheme="cyan" variant="outline" fontSize="xs">
                Axis {selectedAxis}
              </Badge>
            </HStack>
            <Button
              size="sm"
              colorScheme="cyan"
              variant="outline"
              onClick={handleLoadDefaults}
              leftIcon={<RepeatIcon />}
            >
              Load 0.6.x Defaults
            </Button>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">ODrive 0.6.x Interface Features</Text>
              <Text fontSize="sm">
                Enhanced CAN configuration (no more enable_can_a), CAN-FD support,
                improved watchdog behavior, and configurable CAN scaling factors.
              </Text>
            </Box>
          </Alert>

          <VStack spacing={4} align="stretch">
            <Heading size="sm" color="white">Essential Interface Settings</Heading>

            {/* Enhanced CAN Configuration (0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Enhanced CAN Configuration (0.6.x)
                </Text>
                <Tooltip label="CAN protocol replaces enable_can_a setting">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterSelect
                  label="CAN Protocol"
                  configKey="can_protocol"
                  value={interfaceConfig.can_protocol}
                  onChange={handleParameterChange}
                  options={canProtocolOptions}
                  isLoading={loadingParams.has('can_protocol')}
                  helperText="Replaces enable_can_a"
                />
                <ParameterInput
                  label="CAN Node ID"
                  configKey="can_node_id"
                  value={interfaceConfig.can_node_id}
                  onChange={handleParameterChange}
                  min={0}
                  max={0x7FF} // 11-bit max, or use bit 31 for extended
                  step={1}
                  isLoading={loadingParams.has('can_node_id')}
                  helperText="Default: 0x3F (was 0x00)"
                  format="hex"
                />
                <ParameterInput
                  label="CAN Baudrate"
                  configKey="can_baudrate"
                  value={interfaceConfig.can_baudrate}
                  onChange={handleParameterChange}
                  unit="bps"
                  min={125000}
                  max={1000000}
                  step={125000}
                  isLoading={loadingParams.has('can_baudrate')}
                />
              </SimpleGrid>
            </Box>

            {/* CAN-FD Support (New in 0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  CAN-FD Support (NEW 0.6.x)
                </Text>
                <Tooltip label="Experimental CAN-FD frame support">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <ParameterInput
                    label="CAN Data Baud Rate"
                    configKey="can_data_baud_rate"
                    value={interfaceConfig.can_data_baud_rate}
                    onChange={handleParameterChange}
                    unit="bps"
                    min={500000}
                    max={8000000}
                    step={500000}
                    isLoading={loadingParams.has('can_data_baud_rate')}
                    helperText="CAN-FD data phase rate"
                  />
                  <Text fontSize="xs" color="green.300" mt={1}>
                    ⭐ 0.6.x Feature
                  </Text>
                </Box>
                <Box>
                  <ParameterSwitch
                    label="CAN TX Bit Rate Switching"
                    configKey="can_tx_brs"
                    value={interfaceConfig.can_tx_brs}
                    onChange={handleParameterChange}
                    isLoading={loadingParams.has('can_tx_brs')}
                    helperText="Enable bit rate switching"
                  />
                  <Text fontSize="xs" color="green.300" mt={1}>
                    ⭐ 0.6.x Feature
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* CAN Scaling Factors (New in 0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  CAN Scaling Factors (NEW 0.6.x)
                </Text>
                <Tooltip label="Configurable scales for velocity and torque feedforward">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <ParameterInput
                    label="Input Velocity Scale"
                    configKey="input_vel_scale"
                    value={axisInterfaceConfig.input_vel_scale}
                    onChange={handleParameterChange}
                    min={0.001}
                    max={1000}
                    step={0.1}
                    precision={3}
                    isLoading={loadingParams.has('input_vel_scale')}
                    helperText="Scale for Vel_FF in Set_Input_Pos"
                  />
                  <Text fontSize="xs" color="green.300" mt={1}>
                    ⭐ 0.6.x Feature
                  </Text>
                </Box>
                <Box>
                  <ParameterInput
                    label="Input Torque Scale"
                    configKey="input_torque_scale"
                    value={axisInterfaceConfig.input_torque_scale}
                    onChange={handleParameterChange}
                    min={0.001}
                    max={1000}
                    step={0.1}
                    precision={3}
                    isLoading={loadingParams.has('input_torque_scale')}
                    helperText="Scale for Torque_FF in Set_Input_Pos"
                  />
                  <Text fontSize="xs" color="green.300" mt={1}>
                    ⭐ 0.6.x Feature
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Enhanced Watchdog (0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Enhanced Watchdog (0.6.x)
                </Text>
                <Tooltip label="Only setpoint messages feed the watchdog in 0.6.x">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <Alert status="warning" borderRadius="md" mb={3} size="sm">
                <AlertIcon />
                <Text fontSize="sm">
                  In 0.6.x, only setpoint messages (Set_Input_*) and Set_Axis_State feed the watchdog timer
                </Text>
              </Alert>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <ParameterSwitch
                  label="Enable Watchdog"
                  configKey="enable_watchdog"
                  value={interfaceConfig.enable_watchdog}
                  onChange={handleParameterChange}
                  isLoading={loadingParams.has('enable_watchdog')}
                />
                <ParameterInput
                  label="Watchdog Timeout"
                  configKey="watchdog_timeout"
                  value={interfaceConfig.watchdog_timeout}
                  onChange={handleParameterChange}
                  unit="s"
                  min={0}
                  max={10}
                  step={0.1}
                  precision={2}
                  isLoading={loadingParams.has('watchdog_timeout')}
                  isDisabled={!interfaceConfig.enable_watchdog}
                />
              </SimpleGrid>
            </Box>

            {/* UART Configuration */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                UART Configuration
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <ParameterSelect
                  label="UART Protocol"
                  configKey="uart_protocol"
                  value={interfaceConfig.uart_protocol}
                  onChange={handleParameterChange}
                  options={uartProtocolOptions}
                  isLoading={loadingParams.has('uart_protocol')}
                />
                <ParameterInput
                  label="UART Baudrate"
                  configKey="uart_baudrate"
                  value={interfaceConfig.uart_baudrate}
                  onChange={handleParameterChange}
                  unit="bps"
                  min={9600}
                  max={2000000}
                  step={9600}
                  isLoading={loadingParams.has('uart_baudrate')}
                />
              </SimpleGrid>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Advanced Settings */}
      <AdvancedSettingsSection
        title="Advanced Interface Settings (0.6.x)"
        groupedParams={groupedAdvancedParams}
        config={{ ...interfaceConfig, ...axisInterfaceConfig }}
        onUpdateConfig={handleParameterChange}
        loadingParams={loadingParams}
      />

      {/* 0.6.x Specific Notes */}
      <Card>
        <CardBody>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">0.6.x Interface Changes</Text>
              <VStack align="start" spacing={1} fontSize="sm" mt={2}>
                <Text>• enable_can_a removed - use can.protocol instead</Text>
                <Text>• CAN node_id default changed from 0x00 to 0x3f</Text>
                <Text>• Extended CAN IDs use bit 31 of node_id</Text>
                <Text>• Only setpoint CAN messages feed watchdog timer</Text>
                <Text>• Enter_DFU_Mode deprecated - use Reboot with Action=3</Text>
                <Text>• All CAN config changes take effect immediately</Text>
              </VStack>
            </Box>
          </Alert>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default InterfaceConfigStep06