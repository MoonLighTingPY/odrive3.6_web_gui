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
  Select,
  Switch,
  Icon,
  Tooltip,
  SimpleGrid,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { configurationMappings } from '../../utils/odriveCommands'

const InterfaceConfigStep = ({ 
  deviceConfig, 
  onReadParameter, 
  onUpdateConfig,
  loadingParams, 
}) => {
  const interfaceConfig = deviceConfig.interface || {}
  const interfaceMappings = configurationMappings.interface

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('interface', configKey, value)
  }

  const handleRefresh = (configKey) => {
    const odriveParam = interfaceMappings[configKey]
    if (odriveParam) {
      onReadParameter(odriveParam, 'interface', configKey)
    }
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`interface.${configKey}`)
  }

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} gap={4}>
          {/* Left Column */}
          <VStack spacing={3} align="stretch">

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
                        value={interfaceConfig.can_node_id}
                        onChange={(value) => handleConfigChange('can_node_id', parseInt(value) || 0)}
                        onRefresh={() => handleRefresh('can_node_id')}
                        isLoading={isLoading('can_node_id')}
                        step={1}
                        precision={0}
                        min={0}
                        max={63}
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
                      <Select
                        value={interfaceConfig.can_baudrate || 250000}
                        onChange={(e) => handleConfigChange('can_baudrate', parseInt(e.target.value))}
                        bg="gray.700"
                        border="1px solid"
                        borderColor="gray.600"
                        color="white"
                        size="sm"
                      >
                        <option value={125000}>125 kbps</option>
                        <option value={250000}>250 kbps</option>
                        <option value={500000}>500 kbps</option>
                        <option value={1000000}>1 Mbps</option>
                      </Select>
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel color="white" mb={1} fontSize="sm">Heartbeat Rate</FormLabel>
                      <ParameterInput
                        value={interfaceConfig.can_heartbeat_rate_ms}
                        onChange={(value) => handleConfigChange('can_heartbeat_rate_ms', parseInt(value) || 0)}
                        onRefresh={() => handleRefresh('can_heartbeat_rate_ms')}
                        isLoading={isLoading('can_heartbeat_rate_ms')}
                        unit="ms"
                        step={10}
                        precision={0}
                        min={0}
                        max={1000}
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">UART Interface</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={3}>
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
                        <FormLabel color="white" mb={1} fontSize="sm">UART_A Baudrate</FormLabel>
                        <ParameterInput
                          value={interfaceConfig.uart_a_baudrate}
                          onChange={(value) => handleConfigChange('uart_a_baudrate', parseInt(value) || 0)}
                          onRefresh={() => handleRefresh('uart_a_baudrate')}
                          isLoading={isLoading('uart_a_baudrate')}
                          unit="bps"
                          step={9600}
                          precision={0}
                          min={9600}
                          max={921600}
                        />
                      </FormControl>

                      <FormControl flex="1">
                        <FormLabel color="white" mb={1} fontSize="sm">Protocol</FormLabel>
                        <Select
                          value={interfaceConfig.uart0_protocol || 3}
                          onChange={(e) => handleConfigChange('uart0_protocol', parseInt(e.target.value))}
                          bg="gray.700"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          size="sm"
                        >
                          <option value={1}>ASCII</option>
                          <option value={3}>ASCII + STDOUT</option>
                          <option value={4}>Native</option>
                        </Select>
                      </FormControl>
                    </HStack>
                  )}

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
                        <FormLabel color="white" mb={1} fontSize="sm">UART_B Baudrate</FormLabel>
                        <ParameterInput
                          value={interfaceConfig.uart_b_baudrate}
                          onChange={(value) => handleConfigChange('uart_b_baudrate', parseInt(value) || 0)}
                          onRefresh={() => handleRefresh('uart_b_baudrate')}
                          isLoading={isLoading('uart_b_baudrate')}
                          unit="bps"
                          step={9600}
                          precision={0}
                          min={9600}
                          max={921600}
                        />
                      </FormControl>

                      <FormControl flex="1">
                        <FormLabel color="white" mb={1} fontSize="sm">Protocol</FormLabel>
                        <Select
                          value={interfaceConfig.uart1_protocol || 1}
                          onChange={(e) => handleConfigChange('uart1_protocol', parseInt(e.target.value))}
                          bg="gray.700"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          size="sm"
                        >
                          <option value={1}>ASCII</option>
                          <option value={3}>ASCII + STDOUT</option>
                          <option value={4}>Native</option>
                        </Select>
                      </FormControl>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

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
                      <Text fontSize="xs">Step/Dir mode uses GPIO1 for step input and GPIO2 for direction input.</Text>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Right Column */}
          <VStack spacing={3} align="stretch">
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
                        value={interfaceConfig.watchdog_timeout}
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

            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">GPIO Configuration</Heading>
              </CardHeader>
              <CardBody py={2}>
                <Alert status="info" mb={3} py={2} fontSize="xs">
                  <AlertIcon boxSize={3} />
                  <Text fontSize="xs">Some pins may be reserved based on interface settings.</Text>
                </Alert>
                <VStack spacing={2}>
                  {[1, 2, 3, 4].map(pin => (
                    <FormControl key={pin}>
                      <HStack spacing={2}>
                        <Text color="white" minW="60px" fontSize="sm">GPIO{pin}:</Text>
                        <Select
                          value={interfaceConfig[`gpio${pin}_mode`] || 0}
                          onChange={(e) => handleConfigChange(`gpio${pin}_mode`, parseInt(e.target.value))}
                          bg="gray.700"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          size="sm"
                          isDisabled={
                            (interfaceConfig.enable_step_dir && (pin === 1 || pin === 2)) ||
                            (interfaceConfig.enable_uart_a && (pin === 1 || pin === 2)) ||
                            (interfaceConfig.enable_uart_b && (pin === 3 || pin === 4))
                          }
                        >
                          <option value={0}>Digital</option>
                          <option value={1}>Digital Pull-up</option>
                          <option value={2}>Digital Pull-down</option>
                          <option value={3}>Analog Input</option>
                          <option value={11}>UART A TX</option>
                          <option value={12}>UART A RX</option>
                          <option value={13}>UART B TX</option>
                          <option value={14}>UART B RX</option>
                          <option value={7}>CAN A</option>
                          <option value={8}>CAN B</option>
                          <option value={9}>Step Input</option>
                          <option value={10}>Dir Input</option>
                        </Select>
                      </HStack>
                    </FormControl>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default InterfaceConfigStep