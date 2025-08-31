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
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import ParameterSwitch from '../config-parameter-fields/ParameterSwitch'
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { useVersionedUtils } from '../../utils/versionSelection'
import { useSelector } from 'react-redux'

// Motor parameter groups for 0.6.x API
const MOTOR_PARAM_GROUPS_06 = {
  // Essential Motor Settings (enhanced in 0.6.x)
  motor_type: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  pole_pairs: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  motor_kv: { group: 'Motor', subgroup: 'Basics', importance: 'essential' },
  current_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },
  calibration_current: { group: 'Limits & Calibration', subgroup: 'Calibration', importance: 'essential' },
  phase_resistance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  phase_inductance: { group: 'Motor', subgroup: 'Electrical', importance: 'essential' },
  torque_lim: { group: 'Limits & Calibration', subgroup: 'Limits', importance: 'essential' },

  // Enhanced current control in 0.6.x
  current_control_bandwidth: { group: 'Current Control', subgroup: 'Bandwidth', importance: 'advanced' },
  current_slew_rate_limit: { group: 'Current Control', subgroup: 'Slew Rate', importance: 'advanced' },
  dI_dt_FF_enable: { group: 'Current Control', subgroup: 'Feedforward', importance: 'advanced' }, // New in 0.6.x

  // Advanced Motor Properties (enhanced in 0.6.x)
  resistance_calib_max_voltage: { group: 'Motor Configuration', subgroup: 'Calibration', importance: 'advanced' },
  requested_current_range: { group: 'Motor Configuration', subgroup: 'Current', importance: 'advanced' },
  pre_calibrated: { group: 'Motor Configuration', subgroup: 'Calibration', importance: 'advanced' },
  current_lim_margin: { group: 'Motor Configuration', subgroup: 'Current', importance: 'advanced' },
  inverter_temp_limit_lower: { group: 'Motor Configuration', subgroup: 'Inverter Temperature', importance: 'advanced' },
  inverter_temp_limit_upper: { group: 'Motor Configuration', subgroup: 'Inverter Temperature', importance: 'advanced' },

  // Enhanced Thermistor support (0.6.x has new types)
  motor_thermistor_enabled: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },
  motor_thermistor_gpio_pin: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },
  motor_thermistor_type: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' }, // Enhanced in 0.6.x
  motor_temp_limit_lower: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },
  motor_temp_limit_upper: { group: 'Thermistor', subgroup: 'Motor Thermistor', importance: 'advanced' },

  // ACIM specific (enhanced in 0.6.x)
  acim_slip_velocity: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_gain_min_flux: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_min_Id: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_enable: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_attack_gain: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },
  acim_autoflux_decay_gain: { group: 'ACIM', subgroup: 'ACIM Configuration', importance: 'advanced' },

  // Calibration enhancements (0.6.x specific)
  resistance_calib_current: { group: 'Calibration', subgroup: 'Resistance', importance: 'advanced' },
  resistance_calib_max_voltage: { group: 'Calibration', subgroup: 'Resistance', importance: 'advanced' },
  inductance_calib_current: { group: 'Calibration', subgroup: 'Inductance', importance: 'advanced' },
}

const MotorConfigStep06 = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Get axis-specific motor config
  const motorConfig = deviceConfig.motor?.[`axis${selectedAxis}`] || {}

  const { registry, grouping } = useVersionedUtils()

  // Get motor parameters for 0.6.x
  const motorParams = registry.getConfigCategories().motor || []
  
  // Filter parameters by importance
  const essentialParams = grouping.getParametersByImportance(motorParams, MOTOR_PARAM_GROUPS_06, 'essential')
  const advancedParams = grouping.getParametersByImportance(motorParams, MOTOR_PARAM_GROUPS_06, 'advanced')
    .filter(param => grouping.getParameterImportance(param, MOTOR_PARAM_GROUPS_06) === 'advanced')

  // Group advanced parameters
  const groupedAdvancedParams = grouping.getGroupedAdvancedParameters(advancedParams, MOTOR_PARAM_GROUPS_06)

  const handleParameterChange = (configKey, value) => {
    onUpdateConfig('motor', configKey, value)
  }

  const handleLoadDefaults = () => {
    // 0.6.x specific defaults
    const defaults = {
      motor_type: 0, // HIGH_CURRENT_MOTOR
      pole_pairs: 7,
      motor_kv: 150,
      current_lim: 10.0,
      calibration_current: 10.0,
      phase_resistance: 0.0, // Will be calibrated
      phase_inductance: 0.0, // Will be calibrated
      torque_lim: Number.POSITIVE_INFINITY,
      current_control_bandwidth: 1000.0,
      current_slew_rate_limit: Number.POSITIVE_INFINITY,
      dI_dt_FF_enable: false, // New feedforward feature in 0.6.x
      resistance_calib_max_voltage: 2.0,
      requested_current_range: 25.0,
      pre_calibrated: false,
      current_lim_margin: 8.0,
      inverter_temp_limit_lower: 100.0,
      inverter_temp_limit_upper: 120.0,
    }

    Object.entries(defaults).forEach(([key, value]) => {
      handleParameterChange(key, value)
    })
  }

  // Motor type options (may have additions in 0.6.x)
  const motorTypeOptions = [
    { value: 0, label: 'High Current Motor' },
    { value: 1, label: 'Gimbal Motor' },
    { value: 2, label: 'ACIM Motor' }, // Enhanced support in 0.6.x
  ]

  // Enhanced thermistor types in 0.6.x
  const thermistorTypeOptions = [
    { value: 0, label: 'NTC 10K' },
    { value: 1, label: 'PTC 1K' },
    { value: 2, label: 'PT1000' }, // New in 0.6.x
    { value: 3, label: 'KTY83/122' }, // New in 0.6.x
    { value: 4, label: 'KTY84/130' }, // New in 0.6.x
  ]

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <HStack>
              <Heading size="md" color="orange.400">
                Motor Configuration (0.6.x)
              </Heading>
              <Badge colorScheme="orange" variant="outline" fontSize="xs">
                Axis {selectedAxis}
              </Badge>
            </HStack>
            <Button
              size="sm"
              colorScheme="orange"
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
              <Text fontWeight="medium">ODrive 0.6.x Motor Features</Text>
              <Text fontSize="sm">
                Enhanced current control with feedforward, improved ACIM support, 
                new thermistor types (PT1000, KTY series), and better torque constant scaling.
              </Text>
            </Box>
          </Alert>

          <VStack spacing={4} align="stretch">
            <Heading size="sm" color="white">Essential Motor Settings</Heading>

            {/* Basic Motor Properties */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                Basic Motor Properties
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterSelect
                  label="Motor Type"
                  configKey="motor_type"
                  value={motorConfig.motor_type}
                  onChange={handleParameterChange}
                  options={motorTypeOptions}
                  isLoading={loadingParams.has('motor_type')}
                />
                <ParameterInput
                  label="Pole Pairs"
                  configKey="pole_pairs"
                  value={motorConfig.pole_pairs}
                  onChange={handleParameterChange}
                  min={1}
                  max={100}
                  step={1}
                  isLoading={loadingParams.has('pole_pairs')}
                  helperText="Number of pole pairs"
                />
                <ParameterInput
                  label="Motor KV"
                  configKey="motor_kv"
                  value={motorConfig.motor_kv}
                  onChange={handleParameterChange}
                  unit="RPM/V"
                  min={1}
                  max={10000}
                  step={1}
                  isLoading={loadingParams.has('motor_kv')}
                  helperText="Motor velocity constant"
                />
              </SimpleGrid>
            </Box>

            {/* Current and Torque Limits */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                Current & Torque Limits
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterInput
                  label="Current Limit"
                  configKey="current_lim"
                  value={motorConfig.current_lim}
                  onChange={handleParameterChange}
                  unit="A"
                  min={0.1}
                  max={200}
                  step={0.1}
                  precision={1}
                  isLoading={loadingParams.has('current_lim')}
                />
                <ParameterInput
                  label="Calibration Current"
                  configKey="calibration_current"
                  value={motorConfig.calibration_current}
                  onChange={handleParameterChange}
                  unit="A"
                  min={0.1}
                  max={50}
                  step={0.1}
                  precision={1}
                  isLoading={loadingParams.has('calibration_current')}
                />
                <ParameterInput
                  label="Torque Limit"
                  configKey="torque_lim"
                  value={motorConfig.torque_lim}
                  onChange={handleParameterChange}
                  unit="Nm"
                  min={0}
                  max={1000}
                  step={0.01}
                  precision={3}
                  isLoading={loadingParams.has('torque_lim')}
                  helperText="Inf for unlimited"
                />
              </SimpleGrid>
            </Box>

            {/* Electrical Properties */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                Electrical Properties (Calibrated)
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <ParameterInput
                  label="Phase Resistance"
                  configKey="phase_resistance"
                  value={motorConfig.phase_resistance}
                  onChange={handleParameterChange}
                  unit="Ω"
                  min={0}
                  max={10}
                  step={0.001}
                  precision={4}
                  isLoading={loadingParams.has('phase_resistance')}
                  helperText="Set by calibration"
                  isReadOnly={true}
                />
                <ParameterInput
                  label="Phase Inductance"
                  configKey="phase_inductance"
                  value={motorConfig.phase_inductance}
                  onChange={handleParameterChange}
                  unit="H"
                  min={0}
                  max={0.01}
                  step={0.000001}
                  precision={8}
                  isLoading={loadingParams.has('phase_inductance')}
                  helperText="Set by calibration"
                  isReadOnly={true}
                />
              </SimpleGrid>
            </Box>

            {/* Enhanced Current Control (0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Enhanced Current Control (0.6.x)
                </Text>
                <Tooltip label="Improved current control with feedforward">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterInput
                  label="Current Control Bandwidth"
                  configKey="current_control_bandwidth"
                  value={motorConfig.current_control_bandwidth}
                  onChange={handleParameterChange}
                  unit="Hz"
                  min={100}
                  max={10000}
                  step={10}
                  isLoading={loadingParams.has('current_control_bandwidth')}
                />
                <ParameterInput
                  label="Current Slew Rate Limit"
                  configKey="current_slew_rate_limit"
                  value={motorConfig.current_slew_rate_limit}
                  onChange={handleParameterChange}
                  unit="A/s"
                  min={0.1}
                  max={10000}
                  step={1}
                  isLoading={loadingParams.has('current_slew_rate_limit')}
                  helperText="Inf for unlimited"
                />
                <Box>
                  <ParameterSwitch
                    label="dI/dt Feedforward Enable"
                    configKey="dI_dt_FF_enable"
                    value={motorConfig.dI_dt_FF_enable}
                    onChange={handleParameterChange}
                    isLoading={loadingParams.has('dI_dt_FF_enable')}
                    helperText="NEW in 0.6.x"
                  />
                  <Text fontSize="xs" color="green.300" mt={1}>
                    ⭐ 0.6.x Feature
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Enhanced Thermistor Section (0.6.x) */}
      <Card>
        <CardHeader pb={2}>
          <HStack>
            <Heading size="sm" color="orange.400">
              Enhanced Thermistor Support (0.6.x)
            </Heading>
            <Badge colorScheme="green" variant="outline" fontSize="xs">
              New Types
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="success" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">New Thermistor Types in 0.6.x</Text>
              <Text fontSize="sm">
                Added support for PT1000, KTY83/122, and KTY84/130 thermistors.
                Improved low-pass filtering in voltage space with 20ms time constant.
              </Text>
            </Box>
          </Alert>

          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <ParameterSwitch
                label="Motor Thermistor Enabled"
                configKey="motor_thermistor_enabled"
                value={motorConfig.motor_thermistor_enabled}
                onChange={handleParameterChange}
                isLoading={loadingParams.has('motor_thermistor_enabled')}
              />
              <ParameterSelect
                label="Thermistor Type"
                configKey="motor_thermistor_type"
                value={motorConfig.motor_thermistor_type}
                onChange={handleParameterChange}
                options={thermistorTypeOptions}
                isLoading={loadingParams.has('motor_thermistor_type')}
                isDisabled={!motorConfig.motor_thermistor_enabled}
              />
            </SimpleGrid>

            {motorConfig.motor_thermistor_enabled && (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterInput
                  label="GPIO Pin"
                  configKey="motor_thermistor_gpio_pin"
                  value={motorConfig.motor_thermistor_gpio_pin}
                  onChange={handleParameterChange}
                  min={0}
                  max={20}
                  step={1}
                  isLoading={loadingParams.has('motor_thermistor_gpio_pin')}
                />
                <ParameterInput
                  label="Temp Limit Lower"
                  configKey="motor_temp_limit_lower"
                  value={motorConfig.motor_temp_limit_lower}
                  onChange={handleParameterChange}
                  unit="°C"
                  min={-40}
                  max={200}
                  step={1}
                  isLoading={loadingParams.has('motor_temp_limit_lower')}
                />
                <ParameterInput
                  label="Temp Limit Upper"
                  configKey="motor_temp_limit_upper"
                  value={motorConfig.motor_temp_limit_upper}
                  onChange={handleParameterChange}
                  unit="°C"
                  min={0}
                  max={200}
                  step={1}
                  isLoading={loadingParams.has('motor_temp_limit_upper')}
                />
              </SimpleGrid>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Advanced Settings */}
      <AdvancedSettingsSection
        title="Advanced Motor Settings (0.6.x)"
        groupedParams={groupedAdvancedParams}
        config={motorConfig}
        onUpdateConfig={handleParameterChange}
        loadingParams={loadingParams}
      />

      {/* ACIM Specific Settings (if motor type is ACIM) */}
      {motorConfig.motor_type === 2 && (
        <Card>
          <CardHeader pb={2}>
            <Heading size="sm" color="orange.400">
              Enhanced ACIM Configuration (0.6.x)
            </Heading>
          </CardHeader>
          <CardBody py={2}>
            <Alert status="info" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="medium">ACIM Enhancements in 0.6.x</Text>
                <Text fontSize="sm">
                  Fixed torque constant scaling and improved flux control algorithms.
                </Text>
              </Box>
            </Alert>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <ParameterInput
                label="Slip Velocity"
                configKey="acim_slip_velocity"
                value={motorConfig.acim_slip_velocity}
                onChange={handleParameterChange}
                unit="turns/s"
                min={0}
                max={100}
                step={0.1}
                precision={2}
                isLoading={loadingParams.has('acim_slip_velocity')}
              />
              <ParameterInput
                label="Gain Min Flux"
                configKey="acim_gain_min_flux"
                value={motorConfig.acim_gain_min_flux}
                onChange={handleParameterChange}
                min={0}
                max={10}
                step={0.01}
                precision={3}
                isLoading={loadingParams.has('acim_gain_min_flux')}
              />
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* 0.6.x Specific Notes */}
      <Card>
        <CardBody>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">0.6.x Motor Changes</Text>
              <VStack align="start" spacing={1} fontSize="sm" mt={2}>
                <Text>• Fixed ACIM torque constant scaling according to rotor flux</Text>
                <Text>• Added current controller inductance current slew rate feedforward</Text>
                <Text>• Enhanced thermistor filtering (20ms time constant in voltage space)</Text>
                <Text>• New thermistor types: PT1000, KTY83/122, KTY84/130</Text>
                <Text>• Improved numerical integration for InputMode.POS_FILTER</Text>
              </VStack>
            </Box>
          </Alert>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default MotorConfigStep06