import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tooltip,
  Icon,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { updateInterfaceConfig } from '../../store/slices/configSlice'
import { GpioMode } from '../../utils/odriveEnums'

const InterfaceConfigStep = () => {
  const dispatch = useDispatch()
  const { interfaceConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updateInterfaceConfig({ [field]: value }))
  }

  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Interface Configuration
        </Heading>
        <Text color="gray.300" mb={6}>
          Configure communication interfaces, GPIO pins, and safety features for your ODrive.
        </Text>
      </Box>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">CAN Bus Interface</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <HStack justify="space-between">
                <HStack>
                  <FormLabel color="white" mb={0}>Enable CAN Bus</FormLabel>
                  <Tooltip label="Enable CAN bus communication. Requires proper termination and wiring.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={interfaceConfig.enable_can}
                  onChange={(e) => handleConfigChange('enable_can', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>

            {interfaceConfig.enable_can && (
              <HStack spacing={6} w="100%">
                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>CAN Node ID</FormLabel>
                    <Tooltip label="Unique identifier for this ODrive on the CAN bus (0-63).">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <NumberInput
                    value={interfaceConfig.can_node_id}
                    onChange={(_, value) => handleConfigChange('can_node_id', value)}
                    min={0}
                    max={63}
                    step={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                </FormControl>

                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>CAN Baudrate</FormLabel>
                    <Tooltip label="CAN bus communication speed. Common values: 125k, 250k, 500k, 1M.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Select
                    value={interfaceConfig.can_baudrate}
                    onChange={(e) => handleConfigChange('can_baudrate', parseInt(e.target.value))}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
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
        <CardHeader>
          <Heading size="md" color="white">UART Interface</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <HStack justify="space-between">
                <HStack>
                  <FormLabel color="white" mb={0}>Enable UART</FormLabel>
                  <Tooltip label="Enable UART serial communication on designated GPIO pins.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={interfaceConfig.enable_uart}
                  onChange={(e) => handleConfigChange('enable_uart', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>

            {interfaceConfig.enable_uart && (
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>UART Baudrate</FormLabel>
                  <Tooltip label="UART communication speed in bits per second.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Select
                  value={interfaceConfig.uart_baudrate}
                  onChange={(e) => handleConfigChange('uart_baudrate', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
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
        <CardHeader>
          <Heading size="md" color="white">Step/Direction Interface</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <HStack justify="space-between">
                <HStack>
                  <FormLabel color="white" mb={0}>Enable Step/Dir</FormLabel>
                  <Tooltip label="Enable step/direction input for direct stepper motor replacement.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={interfaceConfig.enable_step_dir}
                  onChange={(e) => handleConfigChange('enable_step_dir', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>

            {interfaceConfig.enable_step_dir && (
              <Alert status="info">
                <AlertIcon />
                Step/Dir mode uses GPIO1 for step input and GPIO2 for direction input.
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Safety Features</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <HStack justify="space-between">
                <HStack>
                  <FormLabel color="white" mb={0}>Enable Watchdog Timer</FormLabel>
                  <Tooltip label="Safety feature that disables the motor if no commands are received within the timeout period.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={interfaceConfig.enable_watchdog}
                  onChange={(e) => handleConfigChange('enable_watchdog', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>

            {interfaceConfig.enable_watchdog && (
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>Watchdog Timeout</FormLabel>
                  <Tooltip label="Time in seconds before watchdog triggers if no commands received.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={interfaceConfig.watchdog_timeout}
                    onChange={(_, value) => handleConfigChange('watchdog_timeout', value)}
                    min={0.1}
                    max={10}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">s</Text>
                </HStack>
              </FormControl>
            )}

            <FormControl>
              <HStack justify="space-between">
                <HStack>
                  <FormLabel color="white" mb={0}>Enable Sensorless Mode</FormLabel>
                  <Tooltip label="Enable sensorless (encoderless) motor control. Requires proper motor parameters.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={interfaceConfig.enable_sensorless}
                  onChange={(e) => handleConfigChange('enable_sensorless', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">GPIO Configuration</Heading>
        </CardHeader>
        <CardBody>
          <Alert status="info" mb={4}>
            <AlertIcon />
            Configure GPIO pins for various functions. Some pins may be reserved based on other interface settings.
          </Alert>
          <VStack spacing={4}>
            {[1, 2, 3, 4].map(pin => (
              <FormControl key={pin}>
                <HStack>
                  <FormLabel color="white" mb={0} minW="80px">GPIO{pin} Mode</FormLabel>
                  <Tooltip label={`Configure the function of GPIO pin ${pin}.`}>
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Select
                  value={interfaceConfig[`gpio${pin}_mode`]}
                  onChange={(e) => handleConfigChange(`gpio${pin}_mode`, parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  isDisabled={
                    (interfaceConfig.enable_step_dir && (pin === 1 || pin === 2)) ||
                    (interfaceConfig.enable_uart && (pin === 1 || pin === 2)) ||
                    (interfaceConfig.enable_can && (pin === 3 || pin === 4))
                  }
                >
                  <option value={GpioMode.DIGITAL}>Digital</option>
                  <option value={GpioMode.DIGITAL_PULL_UP}>Digital Pull-up</option>
                  <option value={GpioMode.DIGITAL_PULL_DOWN}>Digital Pull-down</option>
                  <option value={GpioMode.ANALOG_IN}>Analog Input</option>
                  <option value={GpioMode.PWM}>PWM Output</option>
                  <option value={GpioMode.UART_A}>UART A</option>
                  <option value={GpioMode.UART_B}>UART B</option>
                  <option value={GpioMode.CAN_A}>CAN A</option>
                  <option value={GpioMode.CAN_B}>CAN B</option>
                  <option value={GpioMode.ENC0}>Encoder 0</option>
                  <option value={GpioMode.ENC1}>Encoder 1</option>
                </Select>
              </FormControl>
            ))}
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.700" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Interface Summary</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text color="gray.300">CAN Bus:</Text>
              <Text fontWeight="bold" color={interfaceConfig.enable_can ? "green.300" : "gray.300"}>
                {interfaceConfig.enable_can ? `Enabled (ID: ${interfaceConfig.can_node_id})` : "Disabled"}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">UART:</Text>
              <Text fontWeight="bold" color={interfaceConfig.enable_uart ? "green.300" : "gray.300"}>
                {interfaceConfig.enable_uart ? `Enabled (${interfaceConfig.uart_baudrate} bps)` : "Disabled"}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Step/Dir:</Text>
              <Text fontWeight="bold" color={interfaceConfig.enable_step_dir ? "green.300" : "gray.300"}>
                {interfaceConfig.enable_step_dir ? "Enabled" : "Disabled"}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Watchdog:</Text>
              <Text fontWeight="bold" color={interfaceConfig.enable_watchdog ? "yellow.300" : "gray.300"}>
                {interfaceConfig.enable_watchdog ? `Enabled (${interfaceConfig.watchdog_timeout}s)` : "Disabled"}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default InterfaceConfigStep