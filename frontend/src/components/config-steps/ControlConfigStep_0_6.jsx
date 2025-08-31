import React, { useState, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Switch,
  Icon,
  Tooltip,
  Button,
  ButtonGroup,
  SimpleGrid,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { ControlMode, InputMode } from '../../utils/odriveEnums'
import {
  turnsToRpm,
  rpmToTurns,
} from '../../utils/unitConversions'
import { useSelector } from 'react-redux'
import { useVersionedUtils } from '../../utils/versionSelection'

// Control parameter groups for 0.6.x API
const CONTROL_PARAM_GROUPS_06 = {
  // Essential Control Settings (0.6.x specific)
  control_mode: { group: 'Control', subgroup: 'Mode', importance: 'essential' },
  input_mode: { group: 'Control', subgroup: 'Mode', importance: 'essential' },
  pos_gain: { group: 'PID Gains', subgroup: 'Position', importance: 'essential' },
  vel_gain: { group: 'PID Gains', subgroup: 'Velocity', importance: 'essential' },
  vel_integrator_gain: { group: 'PID Gains', subgroup: 'Velocity', importance: 'essential' },
  vel_limit: { group: 'Limits', subgroup: 'Velocity', importance: 'essential' },
  vel_ramp_rate: { group: 'Limits', subgroup: 'Velocity', importance: 'essential' },
  torque_ramp_rate: { group: 'Limits', subgroup: 'Torque', importance: 'essential' },

  // 0.6.x specific initialization settings
  init_pos: { group: 'Initialization', subgroup: 'Initial Values', importance: 'essential' },
  init_vel: { group: 'Initialization', subgroup: 'Initial Values', importance: 'essential' },
  init_torque: { group: 'Initialization', subgroup: 'Initial Values', importance: 'advanced' },

  // Enhanced features in 0.6.x
  input_filter_bandwidth: { group: 'Control', subgroup: 'Filtering', importance: 'advanced' },
  vel_integrator_limit: { group: 'PID Gains', subgroup: 'Advanced', importance: 'advanced' },
  vel_limit_tolerance: { group: 'Limits', subgroup: 'Advanced', importance: 'advanced' },
  circular_setpoints: { group: 'Advanced', subgroup: 'Setpoints', importance: 'advanced' },
  circular_setpoint_range: { group: 'Advanced', subgroup: 'Setpoints', importance: 'advanced' },
  steps_per_circular_range: { group: 'Advanced', subgroup: 'Setpoints', importance: 'advanced' },
  
  // Enhanced homing features in 0.6.x
  homing_speed: { group: 'Homing', subgroup: 'Configuration', importance: 'advanced' },
  inertia: { group: 'Advanced', subgroup: 'System', importance: 'advanced' },
  
  // Gain scheduling
  gain_scheduling_width: { group: 'Gain Scheduling', subgroup: 'Configuration', importance: 'advanced' },
  enable_gain_scheduling: { group: 'Gain Scheduling', subgroup: 'Configuration', importance: 'advanced' },
  
  // Enhanced anticogging in 0.6.x
  anticogging_enabled: { group: 'Anticogging', subgroup: 'Configuration', importance: 'advanced' },
  calib_anticogging: { group: 'Anticogging', subgroup: 'Calibration', importance: 'advanced' },
  calib_pos_threshold: { group: 'Anticogging', subgroup: 'Calibration', importance: 'advanced' },
  calib_vel_threshold: { group: 'Anticogging', subgroup: 'Calibration', importance: 'advanced' },
  cogging_ratio: { group: 'Anticogging', subgroup: 'Configuration', importance: 'advanced' },
  
  // Mirroring
  axis_to_mirror: { group: 'Mirroring', subgroup: 'Configuration', importance: 'advanced' },
  mirror_ratio: { group: 'Mirroring', subgroup: 'Configuration', importance: 'advanced' },
  torque_mirror_ratio: { group: 'Mirroring', subgroup: 'Configuration', importance: 'advanced' },
  
  // Load encoder
  load_encoder_axis: { group: 'Load Encoder', subgroup: 'Configuration', importance: 'advanced' },
  
  // Enhanced error detection in 0.6.x
  enable_overspeed_error: { group: 'Error Detection', subgroup: 'Overspeed', importance: 'advanced' },
  enable_vel_limit: { group: 'Error Detection', subgroup: 'Limits', importance: 'advanced' },
  enable_torque_mode_vel_limit: { group: 'Error Detection', subgroup: 'Limits', importance: 'advanced' },
  
  // Enhanced spinout detection in 0.6.x
  spinout_mechanical_power_threshold: { group: 'Spinout Detection', subgroup: 'Thresholds', importance: 'advanced' },
  spinout_electrical_power_threshold: { group: 'Spinout Detection', subgroup: 'Thresholds', importance: 'advanced' },
  mechanical_power_bandwidth: { group: 'Spinout Detection', subgroup: 'Bandwidth', importance: 'advanced' },
  electrical_power_bandwidth: { group: 'Spinout Detection', subgroup: 'Bandwidth', importance: 'advanced' },

  // 0.6.x specific feedforward enhancements
  input_torque: { group: 'Feedforward', subgroup: 'Torque', importance: 'advanced' },
}

const ControlConfigStep06 = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Get axis-specific control config
  const controlConfig = deviceConfig.control?.[`axis${selectedAxis}`] || {}
  const motorConfig = deviceConfig.motor?.[`axis${selectedAxis}`] || {}

  const { isOpen, onToggle } = useDisclosure()
  const { registry, grouping } = useVersionedUtils()

  const [showRpmValues, setShowRpmValues] = useState(false)

  // Get control parameters for this version
  const controlParams = registry.getConfigCategories().control || []
  
  // Filter essential and advanced parameters
  const essentialParams = grouping.getParametersByImportance(controlParams, CONTROL_PARAM_GROUPS_06, 'essential')
  const advancedParams = grouping.getParametersByImportance(controlParams, CONTROL_PARAM_GROUPS_06, 'advanced')
    .filter(param => grouping.getParameterImportance(param, CONTROL_PARAM_GROUPS_06) === 'advanced')

  // Group advanced parameters
  const groupedAdvancedParams = grouping.getGroupedAdvancedParameters(advancedParams, CONTROL_PARAM_GROUPS_06)

  const handleParameterChange = (configKey, value) => {
    onUpdateConfig('control', configKey, value)
  }

  const handleLoadDefaults = () => {
    // 0.6.x specific defaults
    const defaults = {
      control_mode: ControlMode.VELOCITY_CONTROL,
      input_mode: InputMode.VEL_RAMP,
      pos_gain: 10.0,
      vel_gain: 0.02,
      vel_integrator_gain: 0.1,
      vel_limit: 2.0, // turns/s
      vel_ramp_rate: 10.0, // Updated default for 0.6.x (was 1.0 in 0.5.x)
      torque_ramp_rate: 0.01,
      input_filter_bandwidth: 20.0, // Updated default for 0.6.x (was 2.0 in 0.5.x)
      init_pos: Number.NaN, // 0.6.x specific - NaN means use current position
      init_vel: 0.0,
      init_torque: 0.0,
    }

    Object.entries(defaults).forEach(([key, value]) => {
      handleParameterChange(key, value)
    })
  }

  // Get current values with unit conversion for display
  const currentValues = useMemo(() => {
    const values = {}
    
    // Convert velocity values if showing RPM
    if (showRpmValues) {
      values.vel_limit_display = turnsToRpm(controlConfig.vel_limit || 0)
      values.vel_ramp_rate_display = turnsToRpm(controlConfig.vel_ramp_rate || 0)
    } else {
      values.vel_limit_display = controlConfig.vel_limit || 0
      values.vel_ramp_rate_display = controlConfig.vel_ramp_rate || 0
    }
    
    return values
  }, [controlConfig, showRpmValues])

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <Heading size="md" color="blue.400">
              Control Configuration (0.6.x)
            </Heading>
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={handleLoadDefaults}
                leftIcon={<RepeatIcon />}
              >
                Load 0.6.x Defaults
              </Button>
              <Switch
                isChecked={showRpmValues}
                onChange={(e) => setShowRpmValues(e.target.checked)}
                size="sm"
              />
              <Text fontSize="sm" color="gray.300">
                Show RPM
              </Text>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">ODrive 0.6.x Control Features</Text>
              <Text fontSize="sm">
                Enhanced initialization settings, improved feedforward, and better error handling.
                Default filter bandwidth increased to 20Hz and ramp rate to 10 turns/s².
              </Text>
            </Box>
          </Alert>

          {/* Essential Control Settings */}
          <VStack spacing={4} align="stretch">
            <Heading size="sm" color="white">Essential Settings</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* Control Mode */}
              <ParameterSelect
                label="Control Mode"
                configKey="control_mode"
                value={controlConfig.control_mode}
                onChange={handleParameterChange}
                options={Object.entries(ControlMode).map(([key, value]) => ({
                  value,
                  label: key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
                }))}
                isLoading={loadingParams.has('control_mode')}
              />

              {/* Input Mode */}
              <ParameterSelect
                label="Input Mode"
                configKey="input_mode"
                value={controlConfig.input_mode}
                onChange={handleParameterChange}
                options={Object.entries(InputMode).map(([key, value]) => ({
                  value,
                  label: key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
                }))}
                isLoading={loadingParams.has('input_mode')}
              />
            </SimpleGrid>

            {/* PID Gains */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                PID Gains
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterInput
                  label="Position Gain"
                  configKey="pos_gain"
                  value={controlConfig.pos_gain}
                  onChange={handleParameterChange}
                  unit="(turn/s)/turn"
                  min={0}
                  max={1000}
                  step={0.1}
                  isLoading={loadingParams.has('pos_gain')}
                />
                <ParameterInput
                  label="Velocity Gain"
                  configKey="vel_gain"
                  value={controlConfig.vel_gain}
                  onChange={handleParameterChange}
                  unit="A/(turn/s)"
                  min={0}
                  max={10}
                  step={0.001}
                  precision={3}
                  isLoading={loadingParams.has('vel_gain')}
                />
                <ParameterInput
                  label="Velocity Integrator Gain"
                  configKey="vel_integrator_gain"
                  value={controlConfig.vel_integrator_gain}
                  onChange={handleParameterChange}
                  unit="A/((turn/s)·s)"
                  min={0}
                  max={10}
                  step={0.001}
                  precision={3}
                  isLoading={loadingParams.has('vel_integrator_gain')}
                />
              </SimpleGrid>
            </Box>

            {/* 0.6.x Initialization Settings */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Initialization Settings (0.6.x)
                </Text>
                <Tooltip label="Initial values used when entering closed loop control">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterInput
                  label="Initial Position"
                  configKey="init_pos"
                  value={controlConfig.init_pos}
                  onChange={handleParameterChange}
                  unit="turns"
                  min={-1000}
                  max={1000}
                  step={0.01}
                  precision={3}
                  isLoading={loadingParams.has('init_pos')}
                  helperText="NaN = use current position"
                />
                <ParameterInput
                  label="Initial Velocity"
                  configKey="init_vel"
                  value={controlConfig.init_vel}
                  onChange={handleParameterChange}
                  unit={showRpmValues ? 'RPM' : 'turns/s'}
                  min={-100}
                  max={100}
                  step={0.1}
                  precision={2}
                  isLoading={loadingParams.has('init_vel')}
                />
                <ParameterInput
                  label="Initial Torque"
                  configKey="init_torque"
                  value={controlConfig.init_torque}
                  onChange={handleParameterChange}
                  unit="Nm"
                  min={-100}
                  max={100}
                  step={0.01}
                  precision={3}
                  isLoading={loadingParams.has('init_torque')}
                />
              </SimpleGrid>
            </Box>

            {/* Limits */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                Limits & Ramp Rates
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <ParameterInput
                  label="Velocity Limit"
                  configKey="vel_limit"
                  value={showRpmValues ? turnsToRpm(controlConfig.vel_limit || 0) : controlConfig.vel_limit}
                  onChange={(key, value) => handleParameterChange(key, showRpmValues ? rpmToTurns(value) : value)}
                  unit={showRpmValues ? 'RPM' : 'turns/s'}
                  min={0}
                  max={showRpmValues ? 6000 : 100}
                  step={showRpmValues ? 10 : 0.1}
                  isLoading={loadingParams.has('vel_limit')}
                />
                <ParameterInput
                  label="Velocity Ramp Rate"
                  configKey="vel_ramp_rate"
                  value={showRpmValues ? turnsToRpm(controlConfig.vel_ramp_rate || 0) : controlConfig.vel_ramp_rate}
                  onChange={(key, value) => handleParameterChange(key, showRpmValues ? rpmToTurns(value) : value)}
                  unit={showRpmValues ? 'RPM/s' : 'turns/s²'}
                  min={0}
                  max={showRpmValues ? 60000 : 1000}
                  step={showRpmValues ? 100 : 1}
                  isLoading={loadingParams.has('vel_ramp_rate')}
                  helperText="Default: 10 (0.6.x)"
                />
                <ParameterInput
                  label="Torque Ramp Rate"
                  configKey="torque_ramp_rate"
                  value={controlConfig.torque_ramp_rate}
                  onChange={handleParameterChange}
                  unit="Nm/s"
                  min={0}
                  max={1000}
                  step={0.01}
                  precision={3}
                  isLoading={loadingParams.has('torque_ramp_rate')}
                />
              </SimpleGrid>
            </Box>

            {/* Enhanced Input Filtering (0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Input Filtering (Enhanced 0.6.x)
                </Text>
                <Tooltip label="Improved filtering with higher default bandwidth">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <ParameterInput
                label="Input Filter Bandwidth"
                configKey="input_filter_bandwidth"
                value={controlConfig.input_filter_bandwidth}
                onChange={handleParameterChange}
                unit="Hz"
                min={0.1}
                max={1000}
                step={0.1}
                precision={1}
                isLoading={loadingParams.has('input_filter_bandwidth')}
                helperText="Default: 20Hz (0.6.x), was 2Hz in 0.5.x"
                width="200px"
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Advanced Settings */}
      <AdvancedSettingsSection
        title="Advanced Control Settings (0.6.x)"
        groupedParams={groupedAdvancedParams}
        config={controlConfig}
        onUpdateConfig={handleParameterChange}
        loadingParams={loadingParams}
        showRpmValues={showRpmValues}
      />
    </VStack>
  )
}

export default ControlConfigStep06