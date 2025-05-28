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
          Configure the DC bus voltage limits and current limits to protect your ODrive and connected components.
        </Text>
      </Box>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">DC Bus Voltage Protection</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Overvoltage Trip Level</FormLabel>
                  <Tooltip label="Voltage level at which the ODrive will shut down to protect against overvoltage. Set this 2-3V above your expected maximum voltage.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_bus_overvoltage_trip_level}
                    onChange={(_, value) => handleConfigChange('dc_bus_overvoltage_trip_level', value)}
                    min={12}
                    max={60}
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
                  <Tooltip label="Voltage level below which the ODrive will shut down to protect the power source and prevent brownout conditions.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_bus_undervoltage_trip_level}
                    onChange={(_, value) => handleConfigChange('dc_bus_undervoltage_trip_level', value)}
                    min={8}
                    max={30}
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
          <Heading size="md" color="white">DC Bus Current Limits</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Max Positive Current</FormLabel>
                  <Tooltip label="Maximum current that can be drawn from the DC bus during motor operation (motoring).">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_max_positive_current}
                    onChange={(_, value) => handleConfigChange('dc_max_positive_current', value)}
                    min={1}
                    max={60}
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
                  <Tooltip label="Maximum regenerative current that can be fed back to the DC bus during braking. Use negative value.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.dc_max_negative_current}
                    onChange={(_, value) => handleConfigChange('dc_max_negative_current', value)}
                    min={-60}
                    max={0}
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
                  isChecked={powerConfig.enable_brake_resistor}
                  onChange={(e) => handleConfigChange('enable_brake_resistor', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>

            {powerConfig.enable_brake_resistor && (
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>Brake Resistance</FormLabel>
                  <Tooltip label="Resistance value of your brake resistor in Ohms. Typical values are 2Ω for ODrive v3.6 56V.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={powerConfig.brake_resistance}
                    onChange={(_, value) => handleConfigChange('brake_resistance', value)}
                    min={0.1}
                    max={10}
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
    </VStack>
  )
}

export default PowerConfigStep