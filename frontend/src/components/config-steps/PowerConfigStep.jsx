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
import { updatePowerConfig } from '../../store/slices/configSlice'

const PowerConfigStep = () => {
  const dispatch = useDispatch()
  const { powerConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updatePowerConfig({ [field]: value }))
  }

  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Power Configuration
        </Heading>
        <Text color="gray.300" mb={6}>
          Configure DC bus voltage limits and current limits for safe operation. 
          These settings protect your ODrive and motor from damage.
        </Text>
      </Box>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">DC Bus Voltage Limits</Heading>
        </CardHeader>
        <CardBody>
          <Alert status="warning" mb={4}>
            <AlertIcon />
            Set appropriate voltage limits based on your power supply and motor specifications. 
            ODrive v3.6 is rated for up to 56V.
          </Alert>
          
          <VStack spacing={4}>
            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Overvoltage Trip Level</FormLabel>
                  <Tooltip label="DC bus voltage level that will trigger overvoltage protection. Should be set above normal operating voltage but below ODrive maximum rating.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_bus_overvoltage_trip_level}
                    onChange={(_, value) => handleConfigChange('dc_bus_overvoltage_trip_level', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">V</Text>
                </HStack>
              </FormControl>

              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Undervoltage Trip Level</FormLabel>
                  <Tooltip label="DC bus voltage level that will trigger undervoltage protection. Should be set below minimum operating voltage.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_bus_undervoltage_trip_level}
                    onChange={(_, value) => handleConfigChange('dc_bus_undervoltage_trip_level', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">V</Text>
                </HStack>
              </FormControl>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">DC Current Limits</Heading>
        </CardHeader>
        <CardBody>
          <Alert status="info" mb={4}>
            <AlertIcon />
            Current limits protect your power supply and ODrive. Set these based on your power supply capabilities.
          </Alert>
          
          <VStack spacing={4}>
            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Max Positive Current</FormLabel>
                  <Tooltip label="Maximum current the ODrive can draw from the power supply during motoring operation.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_max_positive_current}
                    onChange={(_, value) => handleConfigChange('dc_max_positive_current', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">A</Text>
                </HStack>
              </FormControl>

              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Max Negative Current</FormLabel>
                  <Tooltip label="Maximum regenerative current (negative value) during braking. Usually smaller magnitude than positive current.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_max_negative_current}
                    onChange={(_, value) => handleConfigChange('dc_max_negative_current', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">A</Text>
                </HStack>
              </FormControl>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Brake Resistor</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <HStack justify="space-between">
                <HStack>
                  <FormLabel color="white" mb={0}>Enable Brake Resistor</FormLabel>
                  <Tooltip label="Enable if you have a brake resistor connected to dissipate regenerative energy.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={powerConfig.brake_resistor_enabled}
                  onChange={(e) => handleConfigChange('brake_resistor_enabled', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>

            {powerConfig.brake_resistor_enabled && (
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>Brake Resistance</FormLabel>
                  <Tooltip label="Resistance value of your brake resistor in Ohms. Check your resistor specifications.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.brake_resistance}
                    onChange={(_, value) => handleConfigChange('brake_resistance', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">Ω</Text>
                </HStack>
              </FormControl>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.700" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Power Configuration Summary</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text color="gray.300">Overvoltage Trip:</Text>
              <Text fontWeight="bold" color="white">
                {powerConfig.dc_bus_overvoltage_trip_level} V
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Undervoltage Trip:</Text>
              <Text fontWeight="bold" color="white">
                {powerConfig.dc_bus_undervoltage_trip_level} V
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Max Positive Current:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {powerConfig.dc_max_positive_current} A
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Max Negative Current:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {powerConfig.dc_max_negative_current} A
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Brake Resistor:</Text>
              <Text fontWeight="bold" color={powerConfig.brake_resistor_enabled ? "green.300" : "gray.300"}>
                {powerConfig.brake_resistor_enabled ? `${powerConfig.brake_resistance} Ω` : "Disabled"}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default PowerConfigStep