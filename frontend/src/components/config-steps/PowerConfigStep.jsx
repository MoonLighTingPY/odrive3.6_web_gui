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
import { useVersionedUtils } from '../../utils/versionSelection'
import { useSelector } from 'react-redux'

// Power parameter groups for 0.5.x
const POWER_PARAM_GROUPS_0_5 = {
  // DC Bus Voltage Protection (including ramp)
  dc_bus_overvoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  dc_bus_undervoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  enable_dc_bus_overvoltage_ramp: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_start: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_end: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },

  // Current Limits & Brake Resistor
  dc_max_positive_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  dc_max_negative_current: { group: 'Current Limits & Brake Resistor', subgroup: 'Current Limits', importance: 'essential' },
  enable_brake_resistor: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor', importance: 'essential' },
  brake_resistance: { group: 'Current Limits & Brake Resistor', subgroup: 'Brake Resistor', importance: 'essential' },

  // FET Thermistor
  fet_thermistor_enabled: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_lower: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_upper: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },

  // Everything else goes to advanced
  usb_cdc_protocol: { group: 'System', subgroup: 'Communication', importance: 'advanced' },
}

// Power parameter groups for 0.6.x
const POWER_PARAM_GROUPS_0_6 = {
  // DC Bus Voltage Protection (enhanced in 0.6.x)
  dc_bus_overvoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  dc_bus_undervoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  enable_dc_bus_overvoltage_ramp: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_start: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_end: { group: 'DC Bus Voltage Protection', subgroup: 'Ramp', importance: 'essential' },

  // Current Limits & Regeneration (0.6.x uses max_regen_current)
  dc_max_positive_current: { group: 'Current Limits & Regeneration', subgroup: 'Current Limits', importance: 'essential' },
  dc_max_negative_current: { group: 'Current Limits & Regeneration', subgroup: 'Current Limits', importance: 'essential' },
  max_regen_current: { group: 'Current Limits & Regeneration', subgroup: 'Regeneration', importance: 'essential' },
  
  // Brake resistor (still available in 0.6.x but less prominent)
  enable_brake_resistor: { group: 'Current Limits & Regeneration', subgroup: 'Brake Resistor', importance: 'advanced' },
  brake_resistance: { group: 'Current Limits & Regeneration', subgroup: 'Brake Resistor', importance: 'advanced' },

  // Inverter Configuration (0.6.x specific)
  inverter_temp_limit_lower: { group: 'Inverter Protection', subgroup: 'Temperature', importance: 'essential' },
  inverter_temp_limit_upper: { group: 'Inverter Protection', subgroup: 'Temperature', importance: 'essential' },
  inverter_temp_enabled: { group: 'Inverter Protection', subgroup: 'Temperature', importance: 'essential' },

  // FET Thermistor (enhanced in 0.6.x)
  fet_thermistor_enabled: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_lower: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },
  fet_temp_limit_upper: { group: 'FET Thermistor', subgroup: 'Thermistor', importance: 'advanced' },

  // Power Stage Configuration (0.6.x specific)
  shunt_conductance: { group: 'Power Stage', subgroup: 'Sensing', importance: 'advanced' },
  mod_magn_max: { group: 'Power Stage', subgroup: 'Modulation', importance: 'advanced' },
  drv_config: { group: 'Power Stage', subgroup: 'Gate Driver', importance: 'advanced' },

  // System
  usb_cdc_protocol: { group: 'System', subgroup: 'Communication', importance: 'advanced' },
}

const PowerConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const powerConfig = deviceConfig.power || {}
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Use version-aware utilities
  const { registry, grouping, is0_6 } = useVersionedUtils()
  
  // Select the right parameter groups based on firmware version
  const POWER_PARAM_GROUPS = is0_6 ? POWER_PARAM_GROUPS_0_6 : POWER_PARAM_GROUPS_0_5
  
  // Get raw parameters and normalize them
  const rawPowerParams = registry.getConfigCategories().power || []
  const powerParams = rawPowerParams.map(p => {
    // Ensure every parameter has a name and description
    const name = p.name || p.label || (p.property && (p.property.name || p.property.label)) || p.configKey || 'Unknown Parameter'
    const description = p.description || (p.property && (p.property.description || p.property.help)) || `Configuration parameter: ${p.configKey}`
    
    return { 
      ...p, 
      name, 
      description,
      // Ensure property object exists with fallbacks
      property: {
        ...p.property,
        name,
        description
      }
    }
  })
  
  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('power', configKey, value)
  }

  const handleRefresh = (configKey) => {
    onReadParameter('power', configKey, selectedAxis)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`power.${configKey}`)
  }

  // Get essential parameters using version-aware grouping
  const essentialParams = grouping.getParametersByImportance(powerParams, POWER_PARAM_GROUPS, 'essential')

  // Group essential parameters by logical UI section
  const groupedEssentialParams = {}
  essentialParams.forEach(param => {
    const group = grouping.getParameterGroup(param, POWER_PARAM_GROUPS)
    if (!groupedEssentialParams[group]) groupedEssentialParams[group] = []
    groupedEssentialParams[group].push(param)
  })

  // Get advanced parameters grouped by category
  const groupedAdvancedParams = grouping.getGroupedAdvancedParameters ? 
    grouping.getGroupedAdvancedParameters(powerParams, POWER_PARAM_GROUPS) : 
    {} // Fallback for older versions
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
                subgroup={param => grouping.getParameterSubgroup(param, POWER_PARAM_GROUPS)}
              />
            </CardBody>
          </Card>

          {/* Current Limits & Power Management (version-aware title) */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">
                {is0_6 ? 'Current Limits & Regeneration' : 'Current Limits & Brake Resistor'}
              </Heading>
            </CardHeader>
            <CardBody py={2}>
              <ParameterFormGrid
                params={groupedEssentialParams[is0_6 ? 'Current Limits & Regeneration' : 'Current Limits & Brake Resistor'] || []}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                subgroup={param => grouping.getParameterSubgroup(param, POWER_PARAM_GROUPS)}
              />
            </CardBody>
          </Card>

          {/* Inverter Protection (0.6.x only) */}
          {is0_6 && groupedEssentialParams['Inverter Protection'] && (
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">Inverter Protection</Heading>
              </CardHeader>
              <CardBody py={2}>
                <ParameterFormGrid
                  params={groupedEssentialParams['Inverter Protection'] || []}
                  config={powerConfig}
                  onChange={handleConfigChange}
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                  subgroup={param => grouping.getParameterSubgroup(param, POWER_PARAM_GROUPS)}
                />
              </CardBody>
            </Card>
          )}
        </SimpleGrid>

        {/* Advanced Settings */}
        {totalAdvancedCount > 0 && (
          <AdvancedSettingsSection
            title="Advanced Power Settings"
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