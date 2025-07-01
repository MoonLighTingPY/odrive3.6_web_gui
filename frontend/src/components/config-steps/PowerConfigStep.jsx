import React from 'react'
import {
  VStack,
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Collapse,
  useDisclosure,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import { 
  getParameterGroup, 
  getParameterSubgroup,
  getParametersByImportance,
  getGroupedAdvancedParameters,
} from '../../utils/configParameterGrouping'

// Power parameter groups
const POWER_PARAM_GROUPS = {
  // DC Bus Voltage Protection (including ramp)
  dc_bus_overvoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  dc_bus_undervoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  enable_dc_bus_overvoltage_ramp: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'advanced' },
  dc_bus_overvoltage_ramp_start: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'advanced' },
  dc_bus_overvoltage_ramp_end: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'advanced' },

  // Current Limits & Brake Resistor
  dc_max_positive_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  dc_max_negative_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  max_regen_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  enable_brake_resistor: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor', importance: 'essential' },
  brake_resistance: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor', importance: 'essential' },

  // FET Thermistor
  fet_thermistor_enabled: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_lower: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_upper: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },

  // Everything else goes to advanced (no more miscellaneous)
  usb_cdc_protocol: { group: 'System', subgroup: 'Communication', importance: 'advanced' },
}

const PowerConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const powerConfig = deviceConfig.power || {}
  const powerParams = getCategoryParameters('power')

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('power', configKey, value)
  }

  const handleRefresh = (configKey, odrivePath) => {
    onReadParameter(odrivePath, 'power', configKey)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`power.${configKey}`)
  }

  // Get essential parameters
  const essentialParams = getParametersByImportance(powerParams, POWER_PARAM_GROUPS, 'essential')

  // Group essential parameters by logical UI section
  const groupedEssentialParams = {}
  essentialParams.forEach(param => {
    const group = getParameterGroup(param, POWER_PARAM_GROUPS)
    if (!groupedEssentialParams[group]) groupedEssentialParams[group] = []
    groupedEssentialParams[group].push(param)
  })

  // Get advanced parameters grouped by category
  const groupedAdvancedParams = getGroupedAdvancedParameters(powerParams, POWER_PARAM_GROUPS)
  const totalAdvancedCount = Object.values(groupedAdvancedParams)
    .reduce((total, group) => total + Object.values(group).reduce((groupTotal, subgroup) => groupTotal + subgroup.length, 0), 0)

  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure()

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {/* DC Bus Voltage Protection */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">DC Bus Voltage Protection</Heading>
            </CardHeader>
            <CardBody py={2}>
              <ParameterFormGrid
                params={groupedEssentialParams['DC Bus Voltage Protection'] || []}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                subgroup={param => getParameterSubgroup(param, POWER_PARAM_GROUPS)}
              />
            </CardBody>
          </Card>

          {/* Current Limits & Brake Resistor */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">Current Limits & Brake Resistor</Heading>
            </CardHeader>
            <CardBody py={2}>
              <ParameterFormGrid
                params={groupedEssentialParams['Current Limits & Brake Resistor'] || []}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                subgroup={param => getParameterSubgroup(param, POWER_PARAM_GROUPS)}
              />
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Advanced Settings - Collapsible with grouping */}
        {totalAdvancedCount > 0 && (
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={2}>
              <HStack justify="space-between">
                <Heading size="sm" color="white">Advanced Settings</Heading>
                <Button size="sm" variant="ghost" onClick={onAdvancedToggle}>
                  {isAdvancedOpen ? 'Hide' : 'Show'} Advanced ({totalAdvancedCount} parameters)
                </Button>
              </HStack>
            </CardHeader>
            <Collapse in={isAdvancedOpen}>
              <CardBody py={3}>
                <VStack spacing={4} align="stretch">
                  {Object.entries(groupedAdvancedParams).map(([groupName, subgroups]) => (
                    <Box key={groupName}>
                      <Text fontWeight="bold" color="blue.200" fontSize="sm" mb={3}>
                        {groupName}
                      </Text>
                      <VStack spacing={3} align="stretch" pl={2}>
                        {Object.entries(subgroups).map(([subgroupName, params]) => (
                          <Box key={subgroupName}>
                            <Text fontWeight="semibold" color="blue.300" fontSize="xs" mb={2}>
                              {subgroupName}
                            </Text>
                            <ParameterFormGrid
                              params={params}
                              config={powerConfig}
                              onChange={handleConfigChange}
                              onRefresh={handleRefresh}
                              isLoading={isLoading}
                              layout="compact"
                              showGrouping={false}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Collapse>
          </Card>
        )}
      </VStack>
    </Box>
  )
}

export default PowerConfigStep