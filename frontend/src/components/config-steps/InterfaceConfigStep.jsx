import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Switch,
  Icon,
  Tooltip,
  SimpleGrid,
  Alert,
  AlertIcon,
  Collapse,
  useDisclosure,
  Button,
  Badge,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import {
  getGroupedAdvancedParameters,
} from '../../utils/configParameterGrouping'
import { useSelector } from 'react-redux'

// Interface parameter groups
const INTERFACE_PARAM_GROUPS = {
  // Essential Interface Settings
  enable_uart_a: { group: 'UART', subgroup: 'UART A', importance: 'essential' },
  uart_a_baudrate: { group: 'UART', subgroup: 'UART A', importance: 'essential' },
  uart0_protocol: { group: 'UART', subgroup: 'UART A', importance: 'essential' },
  enable_uart_b: { group: 'UART', subgroup: 'UART B', importance: 'essential' },
  uart_b_baudrate: { group: 'UART', subgroup: 'UART B', importance: 'essential' },
  uart1_protocol: { group: 'UART', subgroup: 'UART B', importance: 'essential' },
  
  can_node_id: { group: 'CAN', subgroup: 'CAN', importance: 'essential' },
  can_node_id_extended: { group: 'CAN', subgroup: 'CAN', importance: 'essential' },
  can_baudrate: { group: 'CAN', subgroup: 'CAN', importance: 'essential' },
  heartbeat_rate_ms: { group: 'CAN', subgroup: 'CAN', importance: 'essential' },
  
  enable_step_dir: { group: 'Step/Direction', subgroup: 'Step/Direction', importance: 'essential' },
  step_dir_always_on: { group: 'Step/Direction', subgroup: 'Step/Direction', importance: 'essential' },
  
  enable_watchdog: { group: 'Safety', subgroup: 'Watchdog', importance: 'essential' },
  watchdog_timeout: { group: 'Safety', subgroup: 'Watchdog', importance: 'essential' },
  enable_sensorless: { group: 'Safety', subgroup: 'Safety', importance: 'essential' },

  // Advanced parameters
  enable_uart_c: { group: 'Interface', subgroup: 'Interface', importance: 'advanced' },
  uart_c_baudrate: { group: 'Interface', subgroup: 'Interface', importance: 'advanced' },
  uart2_protocol: { group: 'Interface', subgroup: 'Interface', importance: 'advanced' },
  
  enable_can_a: { group: 'Interface', subgroup: 'Interface', importance: 'advanced' },
  enable_i2c_a: { group: 'Interface', subgroup: 'Interface', importance: 'advanced' },
  
  usb_cdc_protocol: { group: 'USB', subgroup: 'USB', importance: 'advanced' },
  
  error_gpio_pin: { group: 'GPIO', subgroup: 'Error Handling', importance: 'advanced' },
  gpio1_mode: { group: 'GPIO', subgroup: 'GPIO Modes', importance: 'advanced' },
  gpio2_mode: { group: 'GPIO', subgroup: 'GPIO Modes', importance: 'advanced' },
  gpio3_mode: { group: 'GPIO', subgroup: 'GPIO Modes', importance: 'advanced' },
  gpio4_mode: { group: 'GPIO', subgroup: 'GPIO Modes', importance: 'advanced' },
  
  // Analog mapping
  gpio3_analog_mapping: { group: 'Analog', subgroup: 'Analog Mapping', importance: 'advanced' },
  gpio4_analog_mapping: { group: 'Analog', subgroup: 'Analog Mapping', importance: 'advanced' },
  
  // Step/Direction advanced
  step_gpio_pin: { group: 'Step/Direction', subgroup: 'Advanced', importance: 'advanced' },
  dir_gpio_pin: { group: 'Step/Direction', subgroup: 'Advanced', importance: 'advanced' },
}

const InterfaceConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const interfaceConfig = deviceConfig.interface || {}
  const interfaceParams = getCategoryParameters('interface')
  const selectedAxis = useSelector(state => state.ui.selectedAxis)

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('interface', configKey, value, selectedAxis)
  }

  const handleRefresh = (configKey) => {
    onReadParameter('interface', configKey, selectedAxis)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`interface.${configKey}`)
  }

  // Get advanced parameters grouped by category
  const groupedAdvancedParams = getGroupedAdvancedParameters(interfaceParams, INTERFACE_PARAM_GROUPS)
  const totalAdvancedCount = Object.values(groupedAdvancedParams)
    .reduce((total, group) => total + Object.values(group).reduce((groupTotal, subgroup) => groupTotal + subgroup.length, 0), 0)

  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure()

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">

        {/* Essential Interface Configuration */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} gap={4}>
          
          {/* Left Column - Communication Interfaces */}
          <VStack spacing={3} align="stretch">

            {/* CAN Bus Interface */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">CAN Bus Interface</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={3}>
                  <HStack spacing={4} w="100%">
                    <FormControl flex="1">
                      <FormLabel color="white" mb={1} fontSize="sm">CAN Node ID</FormLabel>
                      <ParameterInput
                        value={interfaceConfig.can_node_id ?? 0}
                        onChange={(value) => handleConfigChange('can_node_id', parseInt(value) || 0)}
                        onRefresh={() => handleRefresh('can_node_id')}
                        isLoading={isLoading('can_node_id')}
                        precision={0}
                        min={0}
                        max={127}
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <HStack spacing={2} mb={1}>
                        <Switch
                          isChecked={interfaceConfig.can_node_id_extended}
                          onChange={(e) => handleConfigChange('can_node_id_extended', e.target.checked)}
                          colorScheme="odrive"
                          size="sm"
                        />
                        <FormLabel color="white" mb={0} fontSize="sm">Extended ID (29-bit)</FormLabel>
                        <Tooltip label="Use 29-bit extended CAN IDs instead of 11-bit standard IDs.">
                          <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                        </Tooltip>
                      </HStack>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} w="100%">
                    <FormControl flex="1">
                      <FormLabel color="white" mb={1} fontSize="sm">CAN Baudrate</FormLabel>
                      <ParameterSelect
                        value={interfaceConfig.can_baudrate ?? 0}
                        onChange={(e) => handleConfigChange('can_baudrate', parseInt(e.target.value))}
                        onRefresh={() => handleRefresh('can_baudrate')}
                        isLoading={isLoading('can_baudrate')}
                        parameterPath="can.config.baud_rate"
                        size="sm"
                        placeholder="Select Baudrate"
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel color="white" mb={1} fontSize="sm">Heartbeat Rate</FormLabel>
                      <ParameterInput
                        value={interfaceConfig.heartbeat_rate_ms}
                        onChange={(value) => handleConfigChange('heartbeat_rate_ms', parseInt(value) || 0)}
                        onRefresh={() => handleRefresh('heartbeat_rate_ms')}
                        isLoading={isLoading('heartbeat_rate_ms')}
                        unit="ms"
                        precision={0}
                        min={0}
                        max={10000}
                      />
                    </FormControl>
                  </HStack>

                  <Alert status="info" py={2} fontSize="xs">
                    <AlertIcon boxSize={3} />
                    <Text fontSize="xs">CAN communication allows multiple ODrives on a single bus. Set unique node IDs for each device.</Text>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>

            {/* UART Interface */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">UART Serial Interface</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={3}>
                  
                  {/* UART A */}
                  <Box w="100%">
                    <Text fontWeight="semibold" color="blue.300" fontSize="sm" mb={2}>UART A (GPIO1/2)</Text>
                    <VStack spacing={2}>
                      <FormControl>
                        <HStack spacing={2} mb={1}>
                          <Switch
                            isChecked={interfaceConfig.enable_uart_a}
                            onChange={(e) => handleConfigChange('enable_uart_a', e.target.checked)}
                            colorScheme="odrive"
                            size="sm"
                          />
                          <FormLabel color="white" mb={0} fontSize="sm">Enable UART A</FormLabel>
                          <Tooltip label="Enable UART_A serial communication on GPIO1/2.">
                            <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                          </Tooltip>
                        </HStack>
                      </FormControl>

                      {interfaceConfig.enable_uart_a && (
                        <HStack spacing={4} w="100%">
                          <FormControl flex="1">
                            <FormLabel color="white" mb={1} fontSize="xs">Baudrate</FormLabel>
                            <ParameterSelect
                              value={interfaceConfig.uart_a_baudrate ?? 115200}
                              onChange={(e) => handleConfigChange('uart_a_baudrate', parseInt(e.target.value))}
                              onRefresh={() => handleRefresh('uart_a_baudrate')}
                              isLoading={isLoading('uart_a_baudrate')}
                              parameterPath="config.uart_a_baudrate"
                              configKey="uart_a_baudrate"
                              size="sm"
                            />
                          </FormControl>

                          <FormControl flex="1">
                            <FormLabel color="white" mb={1} fontSize="xs">Protocol</FormLabel>
                            <ParameterSelect
                              value={interfaceConfig.uart0_protocol ?? 1}
                              onChange={(e) => handleConfigChange('uart0_protocol', parseInt(e.target.value))}
                              onRefresh={() => handleRefresh('uart0_protocol')}
                              isLoading={isLoading('uart0_protocol')}
                              parameterPath="config.uart0_protocol"
                              size="sm"
                            >
                            </ParameterSelect>
                          </FormControl>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  {/* UART B */}
                  <Box w="100%">
                    <Text fontWeight="semibold" color="blue.300" fontSize="sm" mb={2}>UART B (GPIO3/4)</Text>
                    <VStack spacing={2}>
                      <FormControl>
                        <HStack spacing={2} mb={1}>
                          <Switch
                            isChecked={interfaceConfig.enable_uart_b}
                            onChange={(e) => handleConfigChange('enable_uart_b', e.target.checked)}
                            colorScheme="odrive"
                            size="sm"
                          />
                          <FormLabel color="white" mb={0} fontSize="sm">Enable UART B</FormLabel>
                          <Tooltip label="Enable UART_B serial communication on GPIO3/4.">
                            <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                          </Tooltip>
                        </HStack>
                      </FormControl>

                      {interfaceConfig.enable_uart_b && (
                        <HStack spacing={4} w="100%">
                          <FormControl flex="1">
                            <FormLabel color="white" mb={1} fontSize="xs">Baudrate</FormLabel>
                            <ParameterSelect
                              value={interfaceConfig.uart_b_baudrate ?? 115200}
                              onChange={(e) => handleConfigChange('uart_b_baudrate', parseInt(e.target.value))}
                              onRefresh={() => handleRefresh('uart_b_baudrate')}
                              isLoading={isLoading('uart_b_baudrate')}
                              parameterPath="config.uart_b_baudrate"
                              configKey="uart_b_baudrate"
                              size="sm"
                            />
                          </FormControl>

                          <FormControl flex="1">
                            <FormLabel color="white" mb={1} fontSize="xs">Protocol</FormLabel>
                            <ParameterSelect
                              value={interfaceConfig.uart1_protocol ?? 1}
                              onChange={(e) => handleConfigChange('uart1_protocol', parseInt(e.target.value))}
                              onRefresh={() => handleRefresh('uart1_protocol')}
                              isLoading={isLoading('uart1_protocol')}
                              parameterPath="config.uart1_protocol"
                              size="sm"
                            >
                            </ParameterSelect>
                          </FormControl>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Right Column - Control Interfaces & Safety */}
          <VStack spacing={3} align="stretch">

            {/* Step/Direction Interface */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">Step/Direction Interface</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={3}>
                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <Switch
                        isChecked={interfaceConfig.enable_step_dir}
                        onChange={(e) => handleConfigChange('enable_step_dir', e.target.checked)}
                        colorScheme="odrive"
                        size="sm"
                      />
                      <FormLabel color="white" mb={0} fontSize="sm">Enable Step/Dir</FormLabel>
                      <Tooltip label="Enable step/direction input for direct stepper motor replacement.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                  </FormControl>

                  {interfaceConfig.enable_step_dir && (
                    <FormControl>
                      <HStack spacing={2} mb={1}>
                        <Switch
                          isChecked={interfaceConfig.step_dir_always_on}
                          onChange={(e) => handleConfigChange('step_dir_always_on', e.target.checked)}
                          colorScheme="odrive"
                          size="sm"
                        />
                        <FormLabel color="white" mb={0} fontSize="sm">Always On</FormLabel>
                        <Tooltip label="Keep step/dir enabled even when not in closed loop.">
                          <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                        </Tooltip>
                      </HStack>
                    </FormControl>
                  )}

                  {interfaceConfig.enable_step_dir && (
                    <Alert status="info" py={2} fontSize="xs">
                      <AlertIcon boxSize={3} />
                      <Text fontSize="xs">Step/Dir mode uses GPIO1 for step input and GPIO2 for direction input. This conflicts with UART A.</Text>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Safety Features */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">Safety Features</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={3}>
                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <Switch
                        isChecked={interfaceConfig.enable_watchdog}
                        onChange={(e) => handleConfigChange('enable_watchdog', e.target.checked)}
                        colorScheme="odrive"
                        size="sm"
                      />
                      <FormLabel color="white" mb={0} fontSize="sm">Enable Watchdog Timer</FormLabel>
                      <Tooltip label="Safety feature that disables the motor if no commands are received within the timeout period.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                  </FormControl>

                  {interfaceConfig.enable_watchdog && (
                    <FormControl>
                      <FormLabel color="white" mb={1} fontSize="sm">Watchdog Timeout</FormLabel>
                      <ParameterInput
                        value={interfaceConfig.watchdog_timeout ?? 1.0}
                        onChange={(value) => handleConfigChange('watchdog_timeout', parseFloat(value) || 0)}
                        onRefresh={() => handleRefresh('watchdog_timeout')}
                        isLoading={isLoading('watchdog_timeout')}
                        unit="s"
                        step={0.1}
                        precision={1}
                        min={0.1}
                        max={10}
                      />
                    </FormControl>
                  )}

                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <Switch
                        isChecked={interfaceConfig.enable_sensorless}
                        onChange={(e) => handleConfigChange('enable_sensorless', e.target.checked)}
                        colorScheme="odrive"
                        size="sm"
                      />
                      <FormLabel color="white" mb={0} fontSize="sm">Enable Sensorless Mode</FormLabel>
                      <Tooltip label="Enable sensorless (encoderless) motor control. Requires proper motor parameters.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Smart GPIO Configuration */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">GPIO Configuration</Heading>
              </CardHeader>
              <CardBody py={2}>
                <Alert status="info" mb={3} py={2} fontSize="xs">
                  <AlertIcon boxSize={3} />
                  <Text fontSize="xs">GPIO pins are automatically configured based on enabled interfaces. Manual override available in Advanced settings.</Text>
                </Alert>
                
                <VStack spacing={2}>
                  {[1, 2, 3, 4].map(pin => {
                    let pinFunction = 'Digital'
                    let isReserved = false
                    let reservedBy = ''

                    // Determine pin function based on interface settings
                    if (interfaceConfig.enable_step_dir && (pin === 1 || pin === 2)) {
                      pinFunction = pin === 1 ? 'Step Input' : 'Dir Input'
                      isReserved = true
                      reservedBy = 'Step/Dir'
                    } else if (interfaceConfig.enable_uart_a && (pin === 1 || pin === 2)) {
                      pinFunction = pin === 1 ? 'UART A TX' : 'UART A RX'
                      isReserved = true
                      reservedBy = 'UART A'
                    } else if (interfaceConfig.enable_uart_b && (pin === 3 || pin === 4)) {
                      pinFunction = pin === 3 ? 'UART B TX' : 'UART B RX'
                      isReserved = true
                      reservedBy = 'UART B'
                    }

                    return (
                      <HStack key={pin} justify="space-between" w="100%" p={2} bg={isReserved ? "blue.900" : "gray.700"} borderRadius="md">
                        <HStack spacing={2}>
                          <Text color="white" fontWeight="bold" fontSize="sm" minW="60px">GPIO{pin}:</Text>
                          <Text color={isReserved ? "blue.200" : "gray.300"} fontSize="sm">
                            {pinFunction}
                          </Text>
                        </HStack>
                        {isReserved && (
                          <Badge colorScheme="blue" size="sm">{reservedBy}</Badge>
                        )}
                      </HStack>
                    )
                  })}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </SimpleGrid>

        {/* Advanced Settings - Collapsible with grouping */}
        {totalAdvancedCount > 0 && (
          <AdvancedSettingsSection
            title="Advanced Interface Settings"
            isOpen={isAdvancedOpen}
            onToggle={onAdvancedToggle}
            paramCount={totalAdvancedCount}
            groupedParams={groupedAdvancedParams}
            config={interfaceConfig}
            onChange={handleConfigChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
)}
      </VStack>
    </Box>
  )
}

export default InterfaceConfigStep