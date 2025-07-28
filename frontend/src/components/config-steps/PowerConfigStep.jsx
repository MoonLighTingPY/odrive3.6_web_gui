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
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import { 
  getParameterGroup, 
  getParameterSubgroup,
  getParametersByImportance,
  getGroupedAdvancedParameters,
} from '../../utils/configParameterGrouping'
import { useSelector } from 'react-redux'
// Power parameter groups
const POWER_PARAM_GROUPS = {
  // DC Bus Voltage Protection (including ramp)
  dc_bus_overvoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  dc_bus_undervoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  enable_dc_bus_overvoltage_ramp: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_start: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_end: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },

  // Current Limits & Brake Resistor
  dc_max_positive_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  dc_max_negative_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  max_regen_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },


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
  const selectedAxis = useSelector(state => state.ui.selectedAxis)

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('power', configKey, value)
  }

  const handleRefresh = (configKey) => {
    onReadParameter('power', configKey, selectedAxis)
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
          <AdvancedSettingsSection
            title="Advanced Settings"
            isOpen={isAdvancedOpen}
            onToggle={onAdvancedToggle}
            paramCount={totalAdvancedCount}
            groupedParams={groupedAdvancedParams}
            config={powerConfig}
            onChange={handleConfigChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        )}
      </VStack>
    </Box>
  )
}

export default PowerConfigStep