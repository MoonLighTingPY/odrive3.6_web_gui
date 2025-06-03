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
        
      </VStack>
    </SimpleGrid>
  )
}

export default PowerConfigStep