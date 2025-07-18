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
import { ODrivePropertyMappings as configurationMappings } from '../../utils/odriveUnifiedRegistry'
import { ControlMode, InputMode } from '../../utils/odriveEnums'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import {
  getGroupedAdvancedParameters,
} from '../../utils/configParameterGrouping'
import {
  turnsToRpm,
  rpmToTurns,
} from '../../utils/unitConversions'
import { useSelector } from 'react-redux'

// Control parameter groups
const CONTROL_PARAM_GROUPS = {
  // Essential Control Settings
  control_mode: { group: 'Control', subgroup: 'Mode', importance: 'essential' },
  input_mode: { group: 'Control', subgroup: 'Mode', importance: 'essential' },
  pos_gain: { group: 'PID Gains', subgroup: 'Position', importance: 'essential' },
  vel_gain: { group: 'PID Gains', subgroup: 'Velocity', importance: 'essential' },
  vel_integrator_gain: { group: 'PID Gains', subgroup: 'Velocity', importance: 'essential' },
  vel_limit: { group: 'Limits', subgroup: 'Velocity', importance: 'essential' },
  vel_ramp_rate: { group: 'Limits', subgroup: 'Velocity', importance: 'essential' },
  torque_ramp_rate: { group: 'Limits', subgroup: 'Torque', importance: 'essential' },

  // Advanced parameters
  vel_integrator_limit: { group: 'PID Gains', subgroup: 'Advanced', importance: 'advanced' },
  vel_limit_tolerance: { group: 'Limits', subgroup: 'Advanced', importance: 'advanced' },
  circular_setpoints: { group: 'Advanced', subgroup: 'Setpoints', importance: 'advanced' },
  circular_setpoint_range: { group: 'Advanced', subgroup: 'Setpoints', importance: 'advanced' },
  steps_per_circular_range: { group: 'Advanced', subgroup: 'Setpoints', importance: 'advanced' },
  homing_speed: { group: 'Homing', subgroup: 'Homing', importance: 'advanced' },
  inertia: { group: 'Advanced', subgroup: 'System', importance: 'advanced' },
  input_filter_bandwidth: { group: 'Advanced', subgroup: 'Filtering', importance: 'advanced' },
  
  // Gain scheduling
  gain_scheduling_width: { group: 'Gain Scheduling', subgroup: 'Gain Scheduling', importance: 'advanced' },
  enable_gain_scheduling: { group: 'Gain Scheduling', subgroup: 'Gain Scheduling', importance: 'advanced' },
  
  // Anticogging
  anticogging_enabled: { group: 'Anticogging', subgroup: 'Anticogging', importance: 'advanced' },
  calib_anticogging: { group: 'Anticogging', subgroup: 'Anticogging', importance: 'advanced' },
  calib_pos_threshold: { group: 'Anticogging', subgroup: 'Anticogging', importance: 'advanced' },
  calib_vel_threshold: { group: 'Anticogging', subgroup: 'Anticogging', importance: 'advanced' },
  cogging_ratio: { group: 'Anticogging', subgroup: 'Anticogging', importance: 'advanced' },
  
  // Mirroring
  axis_to_mirror: { group: 'Mirroring', subgroup: 'Mirroring', importance: 'advanced' },
  mirror_ratio: { group: 'Mirroring', subgroup: 'Mirroring', importance: 'advanced' },
  torque_mirror_ratio: { group: 'Mirroring', subgroup: 'Mirroring', importance: 'advanced' },
  
  // Load encoder
  load_encoder_axis: { group: 'Load Encoder', subgroup: 'Load Encoder', importance: 'advanced' },
  
  // Error detection
  enable_overspeed_error: { group: 'Error Detection', subgroup: 'Overspeed', importance: 'advanced' },
  enable_vel_limit: { group: 'Error Detection', subgroup: 'Limits', importance: 'advanced' },
  enable_torque_mode_vel_limit: { group: 'Error Detection', subgroup: 'Limits', importance: 'advanced' },
  
  // Spinout detection
  spinout_mechanical_power_threshold: { group: 'Spinout Detection', subgroup: 'Spinout', importance: 'advanced' },
  spinout_electrical_power_threshold: { group: 'Spinout Detection', subgroup: 'Spinout', importance: 'advanced' },
  mechanical_power_bandwidth: { group: 'Spinout Detection', subgroup: 'Spinout', importance: 'advanced' },
  electrical_power_bandwidth: { group: 'Spinout Detection', subgroup: 'Spinout', importance: 'advanced' },
}

const ControlConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const controlConfig = deviceConfig.control || {}
  const motorConfig = deviceConfig.motor || {}
  const encoderConfig = deviceConfig.encoder || {}
  const controlMappings = configurationMappings.control
  const controlParams = getCategoryParameters('control')

  const [useRpm, setUseRpm] = useState(false)

  const selectedAxis = useSelector(state => state.ui.selectedAxis)

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('control', configKey, value, selectedAxis) // ADD selectedAxis
  }


  const handleRefresh = (configKey) => {
  const odriveParam = controlMappings[configKey]
  if (odriveParam) {
    onReadParameter('control', configKey, selectedAxis) // ADD selectedAxis
  }
}

  const isLoading = (configKey) => {
    return loadingParams.has(`control.${configKey}`)
  }

  // Calculate optimal gains based on motor parameters
  const calculatedGains = useMemo(() => {
    const motor_kv = motorConfig.motor_kv || 0
    const cpr = encoderConfig.cpr || 0

    const torque_constant = 8.27 / motor_kv
    const pos_gain = motor_kv / 10.0 / cpr * 60
    const vel_gain = torque_constant * cpr / 10.0
    const vel_integrator_gain = 0.1 * vel_gain

    return {
      torque_constant,
      pos_gain,
      vel_gain,
      vel_integrator_gain
    }
  }, [motorConfig.motor_kv, encoderConfig.cpr])

  const applyCalculatedGains = () => {
    handleConfigChange('pos_gain', calculatedGains.pos_gain)
    handleConfigChange('vel_gain', calculatedGains.vel_gain)
    handleConfigChange('vel_integrator_gain', calculatedGains.vel_integrator_gain)
  }

  const handleUnitToggle = (rpm) => {
    setUseRpm(rpm)
  }

  const handleVelLimitChange = (value) => {
    const numValue = parseFloat(value) || 0
    const turnsValue = useRpm ? rpmToTurns(numValue) : numValue
    handleConfigChange('vel_limit', turnsValue)
  }

  const handleVelRampRateChange = (value) => {
    const numValue = parseFloat(value) || 0
    const turnsValue = useRpm ? rpmToTurns(numValue) : numValue
    handleConfigChange('vel_ramp_rate', turnsValue)
  }

  const isPositionControl = (controlConfig.control_mode ?? ControlMode.VELOCITY_CONTROL) === ControlMode.POSITION_CONTROL

  // Get advanced parameters grouped by category
  const groupedAdvancedParams = getGroupedAdvancedParameters(controlParams, CONTROL_PARAM_GROUPS)
  const totalAdvancedCount = Object.values(groupedAdvancedParams)
    .reduce((total, group) => total + Object.values(group).reduce((groupTotal, subgroup) => groupTotal + subgroup.length, 0), 0)

  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure()

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">

        {/* Control Mode Selection */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">Control Mode Selection</Heading>
          </CardHeader>
          <CardBody py={2}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <FormControl>
                <HStack spacing={2} mb={1}>
                  <FormLabel color="white" mb={0} fontSize="sm">Control Mode</FormLabel>
                  <Tooltip label="Primary control mode determines what quantity the motor controller regulates.">
                    <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                  </Tooltip>
                </HStack>
                <ParameterSelect
                  value={controlConfig.control_mode ?? ControlMode.VELOCITY_CONTROL}
                  onChange={(e) => handleConfigChange('control_mode', parseInt(e.target.value))}
                  onRefresh={() => handleRefresh('control_mode')}
                  isLoading={isLoading('control_mode')}
                  parameterPath="axis0.controller.config.control_mode"
                  configKey="control_mode"
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <HStack spacing={2} mb={1}>
                  <FormLabel color="white" mb={0} fontSize="sm">Input Mode</FormLabel>
                  <Tooltip label="Input mode determines how commands are processed.">
                    <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                  </Tooltip>
                </HStack>
                <ParameterSelect
                  value={controlConfig.input_mode ?? InputMode.VEL_RAMP}
                  onChange={(e) => handleConfigChange('input_mode', parseInt(e.target.value))}
                  onRefresh={() => handleRefresh('input_mode')}
                  isLoading={isLoading('input_mode')}
                  parameterPath="axis0.controller.config.input_mode"
                  configKey="input_mode"
                  size="sm"
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Main Configuration Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} gap={4}>

          {/* Left Column - PID Configuration */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <HStack justify="space-between">
                <Heading size="sm" color="white">PID Controller Configuration</Heading>
                <Button
                  leftIcon={<RepeatIcon />}
                  colorScheme="green"
                  size="xs"
                  onClick={applyCalculatedGains}
                  title="Apply all calculated optimal gains"
                  mt={3}
                >
                  Use Calculated
                </Button>
              </HStack>
            </CardHeader>
            <CardBody py={2}>


              <VStack spacing={3}>
                {isPositionControl && (
                  <FormControl>
                    <HStack justify="space-between" mb={1}>
                      <HStack spacing={2}>
                        <FormLabel color="white" mb={0} fontSize="xs">Position Gain</FormLabel>
                        <Tooltip label="Proportional gain for position control. Higher values = faster response.">
                          <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                        </Tooltip>
                      </HStack>
                      <Text fontSize="xs" color="green.300">
                        Calc: {calculatedGains.pos_gain.toFixed(3)}
                      </Text>
                    </HStack>
                    <ParameterInput
                      value={controlConfig.pos_gain}
                      onChange={(value) => handleConfigChange('pos_gain', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('pos_gain')}
                      isLoading={isLoading('pos_gain')}
                      unit="(turns/s)/turn"
                      precision={3}
                    />
                  </FormControl>
                )}

                <FormControl>
                  <HStack justify="space-between" mb={1}>
                    <HStack spacing={2}>
                      <FormLabel color="white" mb={0} fontSize="xs">Velocity Gain</FormLabel>
                      <Tooltip label="Torque output per velocity error. Higher values = more aggressive velocity correction.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <Text fontSize="xs" color="green.300">
                      Calc: {calculatedGains.vel_gain.toFixed(4)}
                    </Text>
                  </HStack>
                  <ParameterInput
                    value={controlConfig.vel_gain}
                    onChange={(value) => handleConfigChange('vel_gain', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('vel_gain')}
                    isLoading={isLoading('vel_gain')}
                    unit="Nm [per turn/s]"
                    precision={6}
                  />
                </FormControl>

                <FormControl>
                  <HStack justify="space-between" mb={1}>
                    <HStack spacing={2}>
                      <FormLabel color="white" mb={0} fontSize="xs">Velocity Integrator Gain</FormLabel>
                      <Tooltip label="Integral gain for velocity control. Helps eliminate steady-state error.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <Text fontSize="xs" color="green.300">
                      Calc: {calculatedGains.vel_integrator_gain.toFixed(4)}
                    </Text>
                  </HStack>
                  <ParameterInput
                    value={controlConfig.vel_integrator_gain}
                    onChange={(value) => handleConfigChange('vel_integrator_gain', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('vel_integrator_gain')}
                    isLoading={isLoading('vel_integrator_gain')}
                    unit="Nm⋅s [per turn/s]"
                    precision={6}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Right Column - Limits & Settings */}
          <VStack spacing={3} align="stretch">

            {/* Velocity & Acceleration Limits */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <HStack justify="space-between">
                  <Heading size="sm" color="white">Velocity & Acceleration Limits</Heading>
                  <ButtonGroup size="xs" isAttached variant="outline">
                    <Button
                      colorScheme={useRpm ? "odrive" : "gray"}
                      variant={useRpm ? "solid" : "outline"}
                      onClick={() => handleUnitToggle(true)}
                    >
                      RPM
                    </Button>
                    <Button
                      colorScheme={!useRpm ? "odrive" : "gray"}
                      variant={!useRpm ? "solid" : "outline"}
                      onClick={() => handleUnitToggle(false)}
                    >
                      turns/s
                    </Button>
                  </ButtonGroup>
                </HStack>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={2}>
                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <FormLabel color="white" mb={0} fontSize="xs">Velocity Limit</FormLabel>
                      <Tooltip label="Maximum velocity the motor is allowed to reach.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <ParameterInput
                      value={useRpm ? turnsToRpm(controlConfig.vel_limit) : (controlConfig.vel_limit)}
                      onChange={handleVelLimitChange}
                      onRefresh={() => handleRefresh('vel_limit')}
                      isLoading={isLoading('vel_limit')}
                      unit={useRpm ? "RPM" : "turns/s"}
                      precision={useRpm ? 0 : 2}
                    />
                  </FormControl>

                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <FormLabel color="white" mb={0} fontSize="xs">Velocity Ramp Rate</FormLabel>
                      <Tooltip label="Maximum rate of change of velocity setpoint.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <ParameterInput
                      value={useRpm ? turnsToRpm(controlConfig.vel_ramp_rate) : (controlConfig.vel_ramp_rate)}
                      onChange={handleVelRampRateChange}
                      onRefresh={() => handleRefresh('vel_ramp_rate')}
                      isLoading={isLoading('vel_ramp_rate')}
                      unit={useRpm ? "RPM/s" : "turns/s²"}
                      precision={useRpm ? 0 : 2}
                    />
                  </FormControl>

                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <FormLabel color="white" mb={0} fontSize="xs">Torque Ramp Rate</FormLabel>
                      <Tooltip label="Maximum rate of change of torque setpoint.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <ParameterInput
                      value={controlConfig.torque_ramp_rate}
                      onChange={(value) => handleConfigChange('torque_ramp_rate', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('torque_ramp_rate')}
                      isLoading={isLoading('torque_ramp_rate')}
                      unit="Nm/s"
                      precision={2}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Essential Settings */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">Essential Settings</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={2}>
                  <HStack justify="space-between" w="100%">
                    <HStack spacing={2}>
                      <Switch
                        isChecked={controlConfig.circular_setpoints}
                        onChange={(e) => handleConfigChange('circular_setpoints', e.target.checked)}
                        colorScheme="odrive"
                        size="sm"
                      />
                      <FormLabel color="white" mb={0} fontSize="xs">Circular Setpoints</FormLabel>
                      <Tooltip label="Enable for continuous rotation applications.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                  </HStack>

                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <FormLabel color="white" mb={0} fontSize="xs">System Inertia</FormLabel>
                      <Tooltip label="Estimated rotational inertia of the mechanical system.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <ParameterInput
                      value={controlConfig.inertia ?? 0}
                      onChange={(value) => handleConfigChange('inertia', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('inertia')}
                      isLoading={isLoading('inertia')}
                      unit="kg⋅m²"
                      precision={6}
                    />
                  </FormControl>

                  <FormControl>
                    <HStack spacing={2} mb={1}>
                      <FormLabel color="white" mb={0} fontSize="xs">Input Filter Bandwidth</FormLabel>
                      <Tooltip label="Low-pass filter bandwidth for input commands.">
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <ParameterInput
                      value={controlConfig.input_filter_bandwidth}
                      onChange={(value) => handleConfigChange('input_filter_bandwidth', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('input_filter_bandwidth')}
                      isLoading={isLoading('input_filter_bandwidth')}
                      unit="Hz"
                      precision={2}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
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
                              config={controlConfig}
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

export default ControlConfigStep