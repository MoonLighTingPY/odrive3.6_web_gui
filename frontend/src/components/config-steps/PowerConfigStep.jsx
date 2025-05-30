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
  Switch,
  Icon,
  Tooltip,
  SimpleGrid,
  Alert,
  AlertIcon,
  Badge
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { useSelector, useDispatch } from 'react-redux'
import { updatePowerConfig } from '../../store/slices/configSlice'

const PowerConfigStep = () => {
  const dispatch = useDispatch()
  const { powerConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updatePowerConfig({ [field]: value }))
  }

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} h="100%" p={4} overflow="auto">
      {/* Left Column */}
      <VStack spacing={3} align="stretch">
        <Box>
          <Heading size="md" color="white" mb={1}>
            Power Configuration
          </Heading>
          <Text color="gray.300" fontSize="sm">
            Configure DC bus voltage limits and current protections.
          </Text>
        </Box>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Voltage Limits</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Overvoltage Trip</FormLabel>
                    <Tooltip label="Maximum DC bus voltage before protection triggers.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={powerConfig.dc_bus_overvoltage_trip_level}
                      onChange={(value) => handleConfigChange('dc_bus_overvoltage_trip_level', parseFloat(value) || 0)}
                      step={1}
                      precision={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="30px" fontSize="sm">V</Text>
                  </HStack>
                </FormControl>

                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Undervoltage Trip</FormLabel>
                    <Tooltip label="Minimum DC bus voltage before protection triggers.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={powerConfig.dc_bus_undervoltage_trip_level}
                      onChange={(value) => handleConfigChange('dc_bus_undervoltage_trip_level', parseFloat(value) || 0)}
                      step={1}
                      precision={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="30px" fontSize="sm">V</Text>
                  </HStack>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Current Limits</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <HStack justify="space-between">
                    <HStack>
                      <FormLabel color="white" mb={0} fontSize="sm">Enable DC Current Limit</FormLabel>
                      <Tooltip label="Enable maximum DC bus current protection.">
                        <Icon as={InfoIcon} color="gray.400" />
                      </Tooltip>
                    </HStack>
                    <Switch
                      isChecked={powerConfig.enable_dc_current_limit}
                      onChange={(e) => handleConfigChange('enable_dc_current_limit', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                  </HStack>
                </FormControl>
              </HStack>

              {powerConfig.enable_dc_current_limit && (
                <HStack spacing={4} w="100%">
                  <FormControl flex="1">
                    <FormLabel color="white" mb={1} fontSize="sm">Max Positive Current</FormLabel>
                    <HStack>
                      <NumberInput
                        value={powerConfig.dc_max_positive_current}
                        onChange={(value) => handleConfigChange('dc_max_positive_current', parseFloat(value) || 0)}
                        step={1}
                        precision={1}
                        size="sm"
                      >
                        <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                      </NumberInput>
                      <Text color="gray.300" minW="20px" fontSize="sm">A</Text>
                    </HStack>
                  </FormControl>

                  <FormControl flex="1">
                    <FormLabel color="white" mb={1} fontSize="sm">Max Negative Current</FormLabel>
                    <HStack>
                      <NumberInput
                        value={powerConfig.dc_max_negative_current}
                        onChange={(value) => handleConfigChange('dc_max_negative_current', parseFloat(value) || 0)}
                        step={1}
                        precision={1}
                        size="sm"
                      >
                        <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                      </NumberInput>
                      <Text color="gray.300" minW="20px" fontSize="sm">A</Text>
                    </HStack>
                  </FormControl>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Brake Resistor</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Enable Brake Resistor</FormLabel>
                    <Tooltip label="Enable brake resistor for regenerative braking.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={powerConfig.enable_brake_resistor}
                    onChange={(e) => handleConfigChange('enable_brake_resistor', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>

              {powerConfig.enable_brake_resistor && (
                <FormControl>
                  <FormLabel color="white" mb={1} fontSize="sm">Brake Resistance (Ω)</FormLabel>
                  <NumberInput
                    value={powerConfig.brake_resistance}
                    onChange={(value) => handleConfigChange('brake_resistance', parseFloat(value) || 0)}
                    step={0.1}
                    precision={2}
                    size="sm"
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                </FormControl>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Right Column */}
      <VStack spacing={3} align="stretch">
        <Card bg="gray.700" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Configuration Summary</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Overvoltage Trip:</Text>
                <Badge colorScheme="red" fontSize="xs">
                  {powerConfig.dc_bus_overvoltage_trip_level}V
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Undervoltage Trip:</Text>
                <Badge colorScheme="yellow" fontSize="xs">
                  {powerConfig.dc_bus_undervoltage_trip_level}V
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Max Positive Current:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {powerConfig.dc_max_positive_current}A
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Max Negative Current:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {powerConfig.dc_max_negative_current}A
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Brake Resistor:</Text>
                <Badge colorScheme={powerConfig.enable_brake_resistor ? "green" : "gray"} fontSize="xs">
                  {powerConfig.enable_brake_resistor ? "Enabled" : "Disabled"}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="orange.900" variant="elevated" borderColor="orange.500" borderWidth="1px">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Safety Guidelines</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="start">
              <Text fontSize="sm" color="orange.100">
                <strong>Overvoltage:</strong> Set 10-15% above your maximum supply voltage
              </Text>
              <Text fontSize="sm" color="orange.100">
                <strong>Undervoltage:</strong> Set 10-15% below your minimum supply voltage
              </Text>
              <Text fontSize="sm" color="orange.100">
                <strong>Current Limits:</strong> Consider your power supply capabilities
              </Text>
              <Text fontSize="sm" color="yellow.300">
                <strong>Always use appropriate fusing and protection circuits</strong>
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Alert status="warning" py={2}>
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="sm">ODrive v0.5.6 Power Requirements:</Text>
            <Text fontSize="xs">• 12-56V DC input voltage range</Text>
            <Text fontSize="xs">• Maximum 120A peak current per axis</Text>
            <Text fontSize="xs">• Brake resistor recommended for high-power applications</Text>
          </VStack>
        </Alert>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Voltage Range Recommendations</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.300">12V System:</Text>
                <Text fontSize="sm" color="white">10V - 15V</Text>
              </HStack>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.300">24V System:</Text>
                <Text fontSize="sm" color="white">20V - 30V</Text>
              </HStack>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.300">48V System:</Text>
                <Text fontSize="sm" color="white">40V - 56V</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </SimpleGrid>
  )
}

export default PowerConfigStep