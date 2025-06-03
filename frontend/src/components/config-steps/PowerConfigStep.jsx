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
  Badge
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { configurationMappings } from '../../utils/odriveCommands'

const PowerConfigStep = ({ 
  deviceConfig, 
  onReadParameter, 
  onUpdateConfig,
  loadingParams, 
  isConnected 
}) => {
  const powerConfig = deviceConfig.power || {}
  const powerMappings = configurationMappings.power

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('power', configKey, value)
  }

  const handleRefresh = (configKey) => {
    const odriveParam = powerMappings[configKey]
    if (odriveParam) {
      onReadParameter(odriveParam, 'power', configKey)
    }
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`power.${configKey}`)
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
                  <ParameterInput
                    value={powerConfig.dc_bus_overvoltage_trip_level}
                    onChange={(value) => handleConfigChange('dc_bus_overvoltage_trip_level', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('dc_bus_overvoltage_trip_level')}
                    isLoading={isLoading('dc_bus_overvoltage_trip_level')}
                    unit="V"
                    step={1}
                    precision={1}
                    min={10}
                    max={60}
                  />
                </FormControl>

                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Undervoltage Trip</FormLabel>
                    <Tooltip label="Minimum DC bus voltage before protection triggers.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <ParameterInput
                    value={powerConfig.dc_bus_undervoltage_trip_level}
                    onChange={(value) => handleConfigChange('dc_bus_undervoltage_trip_level', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('dc_bus_undervoltage_trip_level')}
                    isLoading={isLoading('dc_bus_undervoltage_trip_level')}
                    unit="V"
                    step={1}
                    precision={1}
                    min={5}
                    max={30}
                  />
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
                  <FormLabel color="white" mb={1} fontSize="sm">Max Positive Current</FormLabel>
                  <ParameterInput
                    value={powerConfig.dc_max_positive_current}
                    onChange={(value) => handleConfigChange('dc_max_positive_current', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('dc_max_positive_current')}
                    isLoading={isLoading('dc_max_positive_current')}
                    unit="A"
                    step={1}
                    precision={1}
                    min={0}
                    max={120}
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Max Negative Current</FormLabel>
                  <ParameterInput
                    value={powerConfig.dc_max_negative_current}
                    onChange={(value) => handleConfigChange('dc_max_negative_current', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('dc_max_negative_current')}
                    isLoading={isLoading('dc_max_negative_current')}
                    unit="A"
                    step={1}
                    precision={1}
                    min={-120}
                    max={0}
                  />
                </FormControl>
              </HStack>
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
                    isChecked={powerConfig.brake_resistor_enabled}
                    onChange={(e) => handleConfigChange('brake_resistor_enabled', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>

              {powerConfig.brake_resistor_enabled && (
                <FormControl>
                  <FormLabel color="white" mb={1} fontSize="sm">Brake Resistance</FormLabel>
                  <ParameterInput
                    value={powerConfig.brake_resistance}
                    onChange={(value) => handleConfigChange('brake_resistance', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('brake_resistance')}
                    isLoading={isLoading('brake_resistance')}
                    unit="Ω"
                    step={0.1}
                    precision={2}
                    min={0.1}
                    max={10}
                  />
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
                  {powerConfig.dc_bus_overvoltage_trip_level || 56}V
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Undervoltage Trip:</Text>
                <Badge colorScheme="yellow" fontSize="xs">
                  {powerConfig.dc_bus_undervoltage_trip_level || 10}V
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Max Positive Current:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {powerConfig.dc_max_positive_current || 10}A
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Max Negative Current:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {powerConfig.dc_max_negative_current || -10}A
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Brake Resistor:</Text>
                <Badge colorScheme={powerConfig.brake_resistor_enabled ? "green" : "gray"} fontSize="xs">
                  {powerConfig.brake_resistor_enabled ? "Enabled" : "Disabled"}
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

        <Alert status="info" variant="left-accent">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="sm">Power Configuration Tips:</Text>
            <Text fontSize="xs">• Use refresh buttons to read current values from ODrive</Text>
            <Text fontSize="xs">• Changes are applied immediately to the device</Text>
            <Text fontSize="xs">• Brake resistor helps with deceleration and regenerative energy</Text>
          </VStack>
        </Alert>
      </VStack>
    </SimpleGrid>
  )
}

export default PowerConfigStep