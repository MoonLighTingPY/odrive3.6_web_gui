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
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { useVersionedUtils } from '../../utils/versionSelection'
import { useSelector } from 'react-redux'

// Motor parameter groups
const MOTOR_PARAM_GROUPS = {
  // Essential Motor Settings (no duplicates in advanced)
  motor_type: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  pole_pairs: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  motor_kv: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  current_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },
  calibration_current: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'essential' },
  phase_resistance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  phase_inductance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  torque_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },

  // Advanced - Motor Properties
  resistance_calib_max_voltage: { group: 'Motor Configuration', subgroup: 'Calibration', importance: 'advanced' },
  current_control_bandwidth: { group: 'Motor Configuration', subgroup: 'Current', importance: 'advanced' },
  requested_current_range: { group: 'Motor Configuration', subgroup: 'Current', importance: 'advanced' },
  pre_calibrated: { group: 'Motor Configuration', subgroup: 'Calibration', importance: 'advanced' },
  current_lim_margin: { group: 'Motor Configuration', subgroup: 'Current', importance: 'advanced' },
  inverter_temp_limit_lower: { group: 'Motor Configuration', subgroup: 'Inverter Temperature', importance: 'advanced' },
  inverter_temp_limit_upper: { group: 'Motor Configuration', subgroup: 'Inverter Temperature', importance: 'advanced' },

  // Advanced - Thermistor
  motor_thermistor_enabled: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },
  motor_thermistor_gpio_pin: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },
  motor_temp_limit_lower: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },
  motor_temp_limit_upper: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },

  // Advanced - Lock-in (only one entry per parameter)
  lock_in_spin_current: { group: 'Lock-in Configuration', subgroup: 'Calibration Lock-in', importance: 'advanced' },
  calibration_lockin_ramp_time: { group: 'Lock-in Configuration', subgroup: 'Calibration Lock-in', importance: 'advanced' },
  calibration_lockin_ramp_distance: { group: 'Lock-in Configuration', subgroup: 'Calibration Lock-in', importance: 'advanced' },
  calibration_lockin_accel: { group: 'Lock-in Configuration', subgroup: 'Calibration Lock-in', importance: 'advanced' },
  calibration_lockin_vel: { group: 'Lock-in Configuration', subgroup: 'Calibration Lock-in', importance: 'advanced' },
  
  // Separate sensorless parameters (these should be different from general lock-in)
  sensorless_ramp_current: { group: 'Lock-in Configuration', subgroup: 'Sensorless Ramp', importance: 'advanced' },
  sensorless_ramp_ramp_time: { group: 'Lock-in Configuration', subgroup: 'Sensorless Ramp', importance: 'advanced' },
  sensorless_ramp_ramp_distance: { group: 'Lock-in Configuration', subgroup: 'Sensorless Ramp', importance: 'advanced' },
  sensorless_ramp_accel: { group: 'Lock-in Configuration', subgroup: 'Sensorless Ramp', importance: 'advanced' },
  sensorless_ramp_vel: { group: 'Lock-in Configuration', subgroup: 'Sensorless Ramp', importance: 'advanced' },

  // ACIM
  acim_gain_min_flux: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_enable: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_min_Id: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_attack_gain: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_decay_gain: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
}

const MotorConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Use version-aware utilities
  const { registry, grouping } = useVersionedUtils()
  
  // Get axis-specific motor config
  const motorConfig = deviceConfig.motor?.[`axis${selectedAxis}`] || {}
  
  // Get raw parameters and normalize them (same pattern as PowerConfigStep)
  const rawMotorParams = registry.getConfigCategories().motor || []
  const motorParams = rawMotorParams.map(p => {
    const name = p.name || p.label || (p.property && (p.property.name || p.property.label)) || p.configKey || 'Unknown Parameter'
    const description = p.description || (p.property && (p.property.description || p.property.help)) || `Configuration parameter: ${p.configKey}`
    
    return { 
      ...p, 
      name, 
      description,
      property: {
        ...p.property,
        name,
        description
      }
    }
  })

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('motor', configKey, value, selectedAxis)
  }

  const handleReadParameter = (configKey) => {
    onReadParameter('motor', configKey, selectedAxis)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`motor.${configKey}`)
  }

  // Get essential parameters only (merged critical + important) using version-aware grouping
  const essentialParams = grouping.getParametersByImportance(motorParams, MOTOR_PARAM_GROUPS, 'essential')
  
  // Get advanced parameters grouped by category
  const groupedAdvancedParams = grouping.getGroupedAdvancedParameters(motorParams, MOTOR_PARAM_GROUPS)
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
                  onRefresh={() => handleReadParameter('motor_type')}
                  isLoading={isLoading('motor_type')}
                  parameterPath={`axis${selectedAxis}.motor.config.motor_type`}
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
                  onRefresh={() => handleReadParameter('pole_pairs')}
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
                  onRefresh={() => handleReadParameter('motor_kv')}
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
                  onRefresh={() => handleReadParameter('current_lim')}
                  isLoading={isLoading('current_lim')}
                  unit="A"
                  step={1}
                  precision={1}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontSize="sm">Calibration Current (A)</FormLabel>
                <ParameterInput
                  value={motorConfig.calibration_current}
                  onChange={(value) => handleConfigChange('calibration_current', value)}
                  onRefresh={() => handleReadParameter('calibration_current')}
                  isLoading={isLoading('calibration_current')}
                  unit="A"
                  step={0.1}
                  precision={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontSize="sm">Phase Resistance (Ω)</FormLabel>
                <ParameterInput
                  value={motorConfig.phase_resistance}
                  onChange={(value) => handleConfigChange('phase_resistance', value)}
                  onRefresh={() => handleReadParameter('phase_resistance')}
                  isLoading={isLoading('phase_resistance')}
                  unit="Ω"
                  step={0.001}
                  precision={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontSize="sm">Phase Inductance (H)</FormLabel>
                <ParameterInput
                  value={motorConfig.phase_inductance}
                  onChange={(value) => handleConfigChange('phase_inductance', value)}
                  onRefresh={() => handleReadParameter('phase_inductance')}
                  isLoading={isLoading('phase_inductance')}
                  unit="H"
                  step={0.00001}
                  precision={6}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white" fontSize="sm">Torque Limit (Nm)</FormLabel>
                <ParameterInput
                  value={motorConfig.torque_lim}
                  onChange={(value) => handleConfigChange('torque_lim', value)}
                  onRefresh={() => handleReadParameter('torque_lim')}
                  isLoading={isLoading('torque_lim')}
                  unit="Nm"
                  step={0.1}
                  precision={2}
                />
              </FormControl>
            </SimpleGrid>

            {/* Additional essential parameters in auto-generated grid */}
            <Box mt={6}>
              <ParameterFormGrid
                params={essentialParams.filter(p =>
                  ![
                    'motor_type',
                    'pole_pairs',
                    'motor_kv',
                    'current_lim',
                    'calibration_current',
                    'phase_resistance',
                    'phase_inductance',
                    'torque_lim'
                  ].includes(p.configKey)
                )}
                config={motorConfig}
                onChange={handleConfigChange}
                onRefresh={handleReadParameter}
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

        <AdvancedSettingsSection
          title="Advanced Settings"
          isOpen={isAdvancedOpen}
          onToggle={onAdvancedToggle}
          paramCount={totalAdvancedCount}
          groupedParams={groupedAdvancedParams}
          config={motorConfig}
          onChange={handleConfigChange}
          onRefresh={handleReadParameter}
          isLoading={isLoading}
        />
      </VStack>
    </Box>
  )
}

export default MotorConfigStep