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
  NumberInput,
  NumberInputField,
  Select,
  Switch,
  Icon,
  Tooltip,
  SimpleGrid,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { useSelector, useDispatch } from 'react-redux'
import { updateInterfaceConfig } from '../../store/slices/configSlice'

const InterfaceConfigStep = () => {
  const dispatch = useDispatch()
  const { interfaceConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updateInterfaceConfig({ [field]: value }))
  }

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={3} h="100%" p={3} overflow="auto">
      {/* Left Column */}
      <VStack spacing={3} align="stretch">
        <Box>
          <Heading size="md" color="white" mb={1}>
            Interface Configuration
          </Heading>
          <Text color="gray.300" fontSize="sm">
            Configure communication interfaces, GPIO pins, and safety features.
          </Text>
        </Box>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">CAN Bus Interface</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Enable CAN Bus</FormLabel>
                    <Tooltip label="Enable CAN bus communication. Requires proper termination and wiring.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={interfaceConfig.enable_can}
                    onChange={(e) => handleConfigChange('enable_can', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>

              {interfaceConfig.enable_can && (
                <HStack spacing={3} w="100%">
                  <FormControl flex="1">
                    <FormLabel color="white" mb={1} fontSize="sm">CAN Node ID</FormLabel>
                    <NumberInput
                      value={interfaceConfig.can_node_id}
                      onChange={(value) => handleConfigChange('can_node_id', parseInt(value) || 0)}
                      min={0}
                      max={63}
                      step={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                  </FormControl>

                  <FormControl flex="1">
                    <FormLabel color="white" mb={1} fontSize="sm">CAN Baudrate</FormLabel>
                    <Select
                      value={interfaceConfig.can_baudrate}
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
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">UART Interface</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Enable UART</FormLabel>
                    <Tooltip label="Enable UART serial communication on designated GPIO pins.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={interfaceConfig.enable_uart}
                    onChange={(e) => handleConfigChange('enable_uart', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>

              {interfaceConfig.enable_uart && (
                <FormControl>
                  <FormLabel color="white" mb={1} fontSize="sm">UART Baudrate</FormLabel>
                  <Select
                    value={interfaceConfig.uart_baudrate}
                    onChange={(e) => handleConfigChange('uart_baudrate', parseInt(e.target.value))}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    size="sm"
                  >
                    <option value={9600}>9600</option>
                    <option value={19200}>19200</option>
                    <option value={38400}>38400</option>
                    <option value={57600}>57600</option>
                    <option value={115200}>115200</option>
                    <option value={230400}>230400</option>
                  </Select>
                </FormControl>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Step/Direction Interface</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Enable Step/Dir</FormLabel>
                    <Tooltip label="Enable step/direction input for direct stepper motor replacement.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={interfaceConfig.enable_step_dir}
                    onChange={(e) => handleConfigChange('enable_step_dir', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>

              {interfaceConfig.enable_step_dir && (
                <Alert status="info" py={2}>
                  <AlertIcon />
                  <Text fontSize="sm">Step/Dir mode uses GPIO1 for step input and GPIO2 for direction input.</Text>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Right Column */}
      <VStack spacing={3} align="stretch">
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Safety Features</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Enable Watchdog Timer</FormLabel>
                    <Tooltip label="Safety feature that disables the motor if no commands are received within the timeout period.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={interfaceConfig.enable_watchdog}
                    onChange={(e) => handleConfigChange('enable_watchdog', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>

              {interfaceConfig.enable_watchdog && (
                <FormControl>
                  <FormLabel color="white" mb={1} fontSize="sm">Watchdog Timeout</FormLabel>
                  <HStack>
                    <NumberInput
                      value={interfaceConfig.watchdog_timeout}
                      onChange={(value) => handleConfigChange('watchdog_timeout', parseFloat(value) || 0)}
                      min={0.1}
                      max={10}
                      step={0.1}
                      precision={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="20px" fontSize="sm">s</Text>
                  </HStack>
                </FormControl>
              )}

              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Enable Sensorless Mode</FormLabel>
                    <Tooltip label="Enable sensorless (encoderless) motor control. Requires proper motor parameters.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={interfaceConfig.enable_sensorless}
                    onChange={(e) => handleConfigChange('enable_sensorless', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">GPIO Configuration</Heading>
          </CardHeader>
          <CardBody py={2}>
            <Alert status="info" mb={3}>
              <AlertIcon />
              <Text fontSize="sm">Some pins may be reserved based on interface settings.</Text>
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
                        (interfaceConfig.enable_uart && (pin === 1 || pin === 2)) ||
                        (interfaceConfig.enable_can && (pin === 3 || pin === 4))
                      }
                    >
                      <option value={0}>Digital</option>
                      <option value={1}>Digital Pull-up</option>
                      <option value={2}>Digital Pull-down</option>
                      <option value={3}>Analog Input</option>
                      <option value={4}>PWM Output</option>
                      <option value={5}>UART A</option>
                      <option value={6}>UART B</option>
                      <option value={7}>CAN A</option>
                      <option value={8}>CAN B</option>
                      <option value={9}>Encoder 0</option>
                      <option value={10}>Encoder 1</option>
                    </Select>
                  </HStack>
                </FormControl>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.700" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Interface Summary</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">CAN Bus:</Text>
                <Text fontWeight="bold" color={interfaceConfig.enable_can ? "green.300" : "gray.300"} fontSize="sm">
                  {interfaceConfig.enable_can ? `Enabled (ID: ${interfaceConfig.can_node_id})` : "Disabled"}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">UART:</Text>
                <Text fontWeight="bold" color={interfaceConfig.enable_uart ? "green.300" : "gray.300"} fontSize="sm">
                  {interfaceConfig.enable_uart ? `Enabled (${interfaceConfig.uart_baudrate} bps)` : "Disabled"}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Step/Dir:</Text>
                <Text fontWeight="bold" color={interfaceConfig.enable_step_dir ? "green.300" : "gray.300"} fontSize="sm">
                  {interfaceConfig.enable_step_dir ? "Enabled" : "Disabled"}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Watchdog:</Text>
                <Text fontWeight="bold" color={interfaceConfig.enable_watchdog ? "yellow.300" : "gray.300"} fontSize="sm">
                  {interfaceConfig.enable_watchdog ? `Enabled (${interfaceConfig.watchdog_timeout}s)` : "Disabled"}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </SimpleGrid>
  )
}

export default InterfaceConfigStep