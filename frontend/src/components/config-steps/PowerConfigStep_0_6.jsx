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
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterSwitch from '../config-parameter-fields/ParameterSwitch'
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { useVersionedUtils } from '../../utils/versionSelection'
import { useSelector } from 'react-redux'

// Power parameter groups for 0.6.x API
const POWER_PARAM_GROUPS_06 = {
  // Enhanced DC Bus Voltage Protection (0.6.x has improved overvoltage ramp)
  dc_bus_overvoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  dc_bus_undervoltage_trip_level: { group: 'DC Bus Voltage Protection', subgroup: 'Trip Levels', importance: 'essential' },
  enable_dc_bus_overvoltage_ramp: { group: 'DC Bus Voltage Protection', subgroup: 'Overvoltage Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_start: { group: 'DC Bus Voltage Protection', subgroup: 'Overvoltage Ramp', importance: 'essential' },
  dc_bus_overvoltage_ramp_end: { group: 'DC Bus Voltage Protection', subgroup: 'Overvoltage Ramp', importance: 'essential' },

  // Enhanced Current Limits (0.6.x has max_regen_current)
  dc_max_positive_current: { group: 'Current Limits', subgroup: 'DC Current', importance: 'essential' },
  dc_max_negative_current: { group: 'Current Limits', subgroup: 'DC Current', importance: 'essential' },
  max_regen_current: { group: 'Current Limits', subgroup: 'Regenerative Braking', importance: 'essential' }, // New in 0.6.x

  // Enhanced Brake Resistor (0.6.x API changes)
  brake_resistor_armed: { group: 'Brake Resistor', subgroup: 'Configuration', importance: 'advanced' },
  brake_resistor_current: { group: 'Brake Resistor', subgroup: 'Configuration', importance: 'advanced' },

  // Enhanced FET Thermistor (expanded in 0.6.x)
  fet_thermistor_enabled: { group: 'FET Thermistor', subgroup: 'Configuration', importance: 'advanced' },
  fet_temp_limit_lower: { group: 'FET Thermistor', subgroup: 'Limits', importance: 'advanced' },
  fet_temp_limit_upper: { group: 'FET Thermistor', subgroup: 'Limits', importance: 'advanced' },

  // Enhanced communication protocols (0.6.x changes)
  usb_cdc_protocol: { group: 'Communication', subgroup: 'USB', importance: 'advanced' },

  // 0.6.x specific system settings
  enable_can_a: { group: 'Communication', subgroup: 'CAN', importance: 'advanced' }, // Behavior changed in 0.6.x
}

const PowerConfigStep06 = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const powerConfig = deviceConfig.power || {}
  const { registry, grouping } = useVersionedUtils()

  // Get power parameters for 0.6.x
  const powerParams = registry.getConfigCategories().power || []
  
  // Filter parameters by importance
  const essentialParams = grouping.getParametersByImportance(powerParams, POWER_PARAM_GROUPS_06, 'essential')
  const advancedParams = grouping.getParametersByImportance(powerParams, POWER_PARAM_GROUPS_06, 'advanced')
    .filter(param => grouping.getParameterImportance(param, POWER_PARAM_GROUPS_06) === 'advanced')

  // Group advanced parameters
  const groupedAdvancedParams = grouping.getGroupedAdvancedParameters(advancedParams, POWER_PARAM_GROUPS_06)

  const handleParameterChange = (configKey, value) => {
    onUpdateConfig('power', configKey, value)
  }

  const handleLoadDefaults = () => {
    // 0.6.x specific defaults (may differ from 0.5.x)
    const defaults = {
      dc_bus_overvoltage_trip_level: 56.0, // May vary by ODrive model in 0.6.x
      dc_bus_undervoltage_trip_level: 8.0,
      enable_dc_bus_overvoltage_ramp: true, // Enhanced feature in 0.6.x
      dc_bus_overvoltage_ramp_start: 48.0,
      dc_bus_overvoltage_ramp_end: 56.0,
      dc_max_positive_current: 120.0, // Check device-specific limits in 0.6.x
      dc_max_negative_current: -10.0,
      max_regen_current: 10.0, // New in 0.6.x
      brake_resistor_armed: true,
      brake_resistor_current: 10.0,
    }

    Object.entries(defaults).forEach(([key, value]) => {
      handleParameterChange(key, value)
    })
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <Heading size="md" color="green.400">
              Power Configuration (0.6.x)
            </Heading>
            <Button
              size="sm"
              colorScheme="green"
              variant="outline"
              onClick={handleLoadDefaults}
              leftIcon={<RepeatIcon />}
            >
              Load 0.6.x Defaults
            </Button>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">ODrive 0.6.x Power Features</Text>
              <Text fontSize="sm">
                Enhanced overvoltage ramp control, new regenerative current limiting,
                and improved brake resistor management. CAN enable behavior changed.
              </Text>
            </Box>
          </Alert>

          <VStack spacing={4} align="stretch">
            <Heading size="sm" color="white">Essential Power Settings</Heading>

            {/* DC Bus Voltage Protection */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                DC Bus Voltage Protection
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <ParameterInput
                  label="Overvoltage Trip Level"
                  configKey="dc_bus_overvoltage_trip_level"
                  value={powerConfig.dc_bus_overvoltage_trip_level}
                  onChange={handleParameterChange}
                  unit="V"
                  min={12}
                  max={60}
                  step={0.1}
                  precision={1}
                  isLoading={loadingParams.has('dc_bus_overvoltage_trip_level')}
                  helperText="Device-specific limit in 0.6.x"
                />
                <ParameterInput
                  label="Undervoltage Trip Level"
                  configKey="dc_bus_undervoltage_trip_level"
                  value={powerConfig.dc_bus_undervoltage_trip_level}
                  onChange={handleParameterChange}
                  unit="V"
                  min={6}
                  max={24}
                  step={0.1}
                  precision={1}
                  isLoading={loadingParams.has('dc_bus_undervoltage_trip_level')}
                />
              </SimpleGrid>
            </Box>

            {/* Enhanced Overvoltage Ramp (0.6.x feature) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Enhanced Overvoltage Ramp (0.6.x)
                </Text>
                <Tooltip label="Improved overvoltage protection with gradual ramp">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <VStack spacing={3} align="stretch">
                <ParameterSwitch
                  label="Enable DC Bus Overvoltage Ramp"
                  configKey="enable_dc_bus_overvoltage_ramp"
                  value={powerConfig.enable_dc_bus_overvoltage_ramp}
                  onChange={handleParameterChange}
                  isLoading={loadingParams.has('enable_dc_bus_overvoltage_ramp')}
                  helperText="Gradual power reduction before trip"
                />
                {powerConfig.enable_dc_bus_overvoltage_ramp && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <ParameterInput
                      label="Ramp Start Voltage"
                      configKey="dc_bus_overvoltage_ramp_start"
                      value={powerConfig.dc_bus_overvoltage_ramp_start}
                      onChange={handleParameterChange}
                      unit="V"
                      min={12}
                      max={55}
                      step={0.1}
                      precision={1}
                      isLoading={loadingParams.has('dc_bus_overvoltage_ramp_start')}
                    />
                    <ParameterInput
                      label="Ramp End Voltage"
                      configKey="dc_bus_overvoltage_ramp_end"
                      value={powerConfig.dc_bus_overvoltage_ramp_end}
                      onChange={handleParameterChange}
                      unit="V"
                      min={24}
                      max={60}
                      step={0.1}
                      precision={1}
                      isLoading={loadingParams.has('dc_bus_overvoltage_ramp_end')}
                    />
                  </SimpleGrid>
                )}
              </VStack>
            </Box>

            {/* Enhanced Current Limits (0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Current Limits (Enhanced 0.6.x)
                </Text>
                <Tooltip label="Includes new regenerative current limiting">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterInput
                  label="DC Max Positive Current"
                  configKey="dc_max_positive_current"
                  value={powerConfig.dc_max_positive_current}
                  onChange={handleParameterChange}
                  unit="A"
                  min={0}
                  max={200}
                  step={1}
                  isLoading={loadingParams.has('dc_max_positive_current')}
                  helperText="Check device limits"
                />
                <ParameterInput
                  label="DC Max Negative Current"
                  configKey="dc_max_negative_current"
                  value={powerConfig.dc_max_negative_current}
                  onChange={handleParameterChange}
                  unit="A"
                  min={-50}
                  max={0}
                  step={1}
                  isLoading={loadingParams.has('dc_max_negative_current')}
                />
                <Box>
                  <ParameterInput
                    label="Max Regen Current"
                    configKey="max_regen_current"
                    value={powerConfig.max_regen_current}
                    onChange={handleParameterChange}
                    unit="A"
                    min={0}
                    max={50}
                    step={0.1}
                    precision={1}
                    isLoading={loadingParams.has('max_regen_current')}
                    helperText="NEW in 0.6.x"
                  />
                  <Text fontSize="xs" color="green.300" mt={1}>
                    ⭐ 0.6.x Feature
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Brake Resistor */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                Brake Resistor
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <ParameterSwitch
                  label="Brake Resistor Armed"
                  configKey="brake_resistor_armed"
                  value={powerConfig.brake_resistor_armed}
                  onChange={handleParameterChange}
                  isLoading={loadingParams.has('brake_resistor_armed')}
                />
                <ParameterInput
                  label="Brake Resistor Current"
                  configKey="brake_resistor_current"
                  value={powerConfig.brake_resistor_current}
                  onChange={handleParameterChange}
                  unit="A"
                  min={0}
                  max={50}
                  step={0.1}
                  precision={1}
                  isLoading={loadingParams.has('brake_resistor_current')}
                />
              </SimpleGrid>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Advanced Settings */}
      <AdvancedSettingsSection
        title="Advanced Power Settings (0.6.x)"
        groupedParams={groupedAdvancedParams}
        config={powerConfig}
        onUpdateConfig={handleParameterChange}
        loadingParams={loadingParams}
      />

      {/* 0.6.x Specific Notes */}
      <Card>
        <CardBody>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">0.6.x API Changes</Text>
              <VStack align="start" spacing={1} fontSize="sm" mt={2}>
                <Text>• CAN interface enable behavior changed - no longer uses enable_can_a</Text>
                <Text>• brake_resistor.is_saturated renamed to was_saturated</Text>
                <Text>• Enhanced thermistor support with new types (PT1000, KTY83/122, etc.)</Text>
                <Text>• Current limits may be device-dependent in 0.6.x</Text>
              </VStack>
            </Box>
          </Alert>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default PowerConfigStep06