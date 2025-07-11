import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Button,
  FormControl,
  FormLabel,
  SimpleGrid,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import {
  getParametersByImportance,
  getGroupedAdvancedParameters,
} from '../../utils/configParameterGrouping'

// Motor parameter groups
const MOTOR_PARAM_GROUPS = {
  // Essential Motor Settings (critical + important merged)
  motor_type: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  pole_pairs: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  motor_kv: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  current_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },
  calibration_current: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'essential' },
  phase_resistance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  phase_inductance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  torque_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },

  // Advanced parameters (everything else)
  resistance_calib_max_voltage: { group: 'Motor', subgroup: 'Electrical', importance: 'advanced' },
  motor_thermistor_enabled: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  gpio_pin: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  motor_temp_limit_lower: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  motor_temp_limit_upper: { group: 'Motor', subgroup: 'Thermistor', importance: 'advanced' },
  requested_current_range: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'advanced' },
  current_control_bandwidth: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'advanced' },
  pre_calibrated: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'advanced' },

  // Lock-in Parameters
  lock_in_spin_current: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  ramp_time: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  ramp_distance: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  accel: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },
  vel: { group: 'Lock-in', subgroup: 'Lock-in', importance: 'advanced' },

  // AC Induction Motor (ACIM) Parameters
  acim_gain_min_flux: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_enable: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_min_Id: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_attack_gain: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
  acim_autoflux_decay_gain: { group: 'ACIM', subgroup: 'ACIM', importance: 'advanced' },
}

const MotorConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const motorConfig = deviceConfig.motor || {}
  const motorParams = getCategoryParameters('motor')

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('motor', configKey, value)
  }

  const handleRefresh = (configKey, odrivePath) => {
    onReadParameter(odrivePath, 'motor', configKey)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`motor.${configKey}`)
  }

  // Get essential parameters only (merged critical + important)
  const essentialParams = getParametersByImportance(motorParams, MOTOR_PARAM_GROUPS, 'essential')
  
  // Get advanced parameters grouped by category
  const groupedAdvancedParams = getGroupedAdvancedParameters(motorParams, MOTOR_PARAM_GROUPS)
  const totalAdvancedCount = Object.values(groupedAdvancedParams)
    .reduce((total, group) => total + Object.values(group).reduce((groupTotal, subgroup) => groupTotal + subgroup.length, 0), 0)

  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure()

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={4} align="stretch" maxW="1200px" mx="auto">
        
        {/* Essential Motor Settings - Custom UI */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={3}>
            <Heading size="md" color="white">Essential Motor Settings</Heading>
          </CardHeader>
          <CardBody py={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel color="white" fontSize="sm">Motor Type</FormLabel>
                <ParameterSelect
                  value={motorConfig.motor_type || 0}
                  onChange={(e) => handleConfigChange('motor_type', parseInt(e.target.value))}
                  onRefresh={() => handleRefresh('motor_type', 'axis0.motor.config.motor_type')}
                  isLoading={isLoading('motor_type')}
                  parameterPath="axis0.motor.config.motor_type"
                  configKey="motor_type"
                  size="sm"
                >
                </ParameterSelect>
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontSize="sm">Pole Pairs</FormLabel>
                <ParameterInput
                  value={motorConfig.pole_pairs}
                  onChange={(value) => handleConfigChange('pole_pairs', value)}
                  onRefresh={() => handleRefresh('pole_pairs', 'axis0.motor.config.pole_pairs')}
                  isLoading={isLoading('pole_pairs')}
                  step={1}
                  precision={0}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontSize="sm">Motor Kv (RPM/V)</FormLabel>
                <ParameterInput
                  value={motorConfig.motor_kv}
                  onChange={(value) => handleConfigChange('motor_kv', value)}
                  onRefresh={() => handleRefresh('motor_kv', 'axis0.motor.config.torque_constant')}
                  isLoading={isLoading('motor_kv')}
                  unit="RPM/V"
                  step={10}
                  precision={1}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontSize="sm">Current Limit (A)</FormLabel>
                <ParameterInput
                  value={motorConfig.current_lim}
                  onChange={(value) => handleConfigChange('current_lim', value)}
                  onRefresh={() => handleRefresh('current_lim', 'axis0.motor.config.current_lim')}
                  isLoading={isLoading('current_lim')}
                  unit="A"
                  step={1}
                  precision={1}
                />
              </FormControl>
            </SimpleGrid>

            {/* Additional essential parameters in auto-generated grid */}
            <Box mt={6}>
              <ParameterFormGrid
                params={essentialParams.filter(p => !['motor_type', 'pole_pairs', 'motor_kv', 'current_lim'].includes(p.configKey))}
                config={motorConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                layout="grid"
                maxColumns={2}
              />
            </Box>
          </CardBody>
        </Card>

        {/* Calculated Values */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Calculated Values</Heading>
          </CardHeader>
          <CardBody py={3}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text color="gray.400" fontSize="xs">Torque Constant (Kt)</Text>
                <Text fontWeight="bold" color="green.300" fontSize="sm">
                  {(8.27 / (motorConfig.motor_kv || 1)).toFixed(4)} Nm/A
                </Text>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="xs">Max Torque</Text>
                <Text fontWeight="bold" color="green.300" fontSize="sm">
                  {((8.27 / (motorConfig.motor_kv || 1)) * (motorConfig.current_lim || 0)).toFixed(2)} Nm
                </Text>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="xs">Motor Type</Text>
                <Badge colorScheme={motorConfig.motor_type === 0 ? "blue" : "purple"} fontSize="xs">
                  {motorConfig.motor_type === 0 ? "High Current" : motorConfig.motor_type === 2 ? "Gimbal" : "ACIM"}
                </Badge>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Advanced Settings - Collapsible with grouping */}
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
                            config={motorConfig}
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
      </VStack>
    </Box>
  )
}

export default MotorConfigStep