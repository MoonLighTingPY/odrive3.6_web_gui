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
  Select
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { ODrivePropertyMappings as configurationMappings } from '../../utils/odriveUnifiedRegistry'

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
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">
        
        {/* DC Bus Voltage Protection */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">DC Bus Voltage Protection</Heading>
          </CardHeader>
          <CardBody py={2}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <HStack spacing={2} mb={1}>
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

              <FormControl>
                <HStack spacing={2} mb={1}>
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
                  precision={1}
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Current Limits & Brake Resistor */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">Current Limits & Brake Resistor</Heading>
          </CardHeader>
          <CardBody py={2}>
            <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={4} gap={4}>
              
              {/* Left Column - Current Limits */}
              <Box>
                <Text fontWeight="bold" color="blue.300" mb={2} fontSize="sm">Current Limits</Text>
                <HStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="sm">Max Positive Current</FormLabel>
                    <ParameterInput
                      value={powerConfig.dc_max_positive_current}
                      onChange={(value) => handleConfigChange('dc_max_positive_current', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('dc_max_positive_current')}
                      isLoading={isLoading('dc_max_positive_current')}
                      unit="A"
                      precision={1}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="sm">Max Negative Current</FormLabel>
                    <ParameterInput
                      value={powerConfig.dc_max_negative_current}
                      onChange={(value) => handleConfigChange('dc_max_negative_current', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('dc_max_negative_current')}
                      isLoading={isLoading('dc_max_negative_current')}
                      unit="A"
                      precision={1}
                    />
                  </FormControl>
                </HStack>
              </Box>

              {/* Center Column - Brake Resistor */}
              <Box>
                <Text fontWeight="bold" color="green.300" mb={2} fontSize="sm">Brake Resistor</Text>
                <VStack spacing={1} align="stretch">
                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <Switch
                        isChecked={powerConfig.brake_resistor_enabled}
                        onChange={(e) => handleConfigChange('brake_resistor_enabled', e.target.checked)}
                        colorScheme="odrive"
                        size="sm"
                      />
                      <FormLabel color="white" mb={0} fontSize="sm">Enable Brake Resistor</FormLabel>
                      <Tooltip label="Enable brake resistor for regenerative braking.">
                        <Icon as={InfoIcon} color="gray.400" />
                      </Tooltip>
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
                        precision={2}
                      />
                    </FormControl>
                  )}
                </VStack>
              </Box>

            </SimpleGrid>
          </CardBody>
        </Card>

        {/* FET Thermistor Configuration */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">FET Thermistor Limits</Heading>
          </CardHeader>
          <CardBody py={2}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <HStack spacing={2} mb={1}>
                  <FormLabel color="white" mb={0} fontSize="sm">Lower Temperature Limit</FormLabel>
                  <Tooltip label="Temperature at which current limiting begins.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <ParameterInput
                  value={powerConfig.fet_temp_limit_lower}
                  onChange={(value) => handleConfigChange('fet_temp_limit_lower', parseFloat(value) || 0)}
                  onRefresh={() => handleRefresh('fet_temp_limit_lower')}
                  isLoading={isLoading('fet_temp_limit_lower')}
                  unit="°C"
                  precision={1}
                  min={0}
                  max={150}
                />
              </FormControl>

              <FormControl>
                <HStack spacing={2} mb={1}>
                  <FormLabel color="white" mb={0} fontSize="sm">Upper Temperature Limit</FormLabel>
                  <Tooltip label="Temperature at which motor control stops and error is set.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <ParameterInput
                  value={powerConfig.fet_temp_limit_upper}
                  onChange={(value) => handleConfigChange('fet_temp_limit_upper', parseFloat(value) || 0)}
                  onRefresh={() => handleRefresh('fet_temp_limit_upper')}
                  isLoading={isLoading('fet_temp_limit_upper')}
                  unit="°C"
                  precision={1}
                  min={0}
                  max={150}
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default PowerConfigStep