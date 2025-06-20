import { useState, useMemo, memo} from 'react'
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
  Select,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  Switch,
  Icon,
  Tooltip,
  Button,
  ButtonGroup,
  Divider,
  SimpleGrid,
  Collapse,
  useDisclosure,
  Badge,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { ODrivePropertyMappings as configurationMappings } from '../../utils/odriveUnifiedRegistry'
import { ControlMode, InputMode} from '../../utils/odriveEnums'
import { 
  radToRpm, 
  rpmToRad, 
} from '../../utils/unitConversions'

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

  const [useRpm, setUseRpm] = useState(true)

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('control', configKey, value)
  }

  const handleRefresh = (configKey) => {
    const odriveParam = controlMappings[configKey]
    if (odriveParam) {
      onReadParameter(odriveParam, 'control', configKey)
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

  const resetGainToCalculated = (gainType) => {
    handleConfigChange(gainType, calculatedGains[gainType])
  }

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
    const radValue = useRpm ? rpmToRad(numValue) : numValue
    handleConfigChange('vel_limit', radValue)
  }

  const handleVelRampRateChange = (value) => {
    const numValue = parseFloat(value) || 0
    const radValue = useRpm ? rpmToRad(numValue) : numValue
    handleConfigChange('vel_ramp_rate', radValue)
  }

  const isPositionControl = (controlConfig.control_mode ?? ControlMode.VELOCITY_CONTROL) === ControlMode.POSITION_CONTROL
  const { isOpen: isCalculatedOpen, onToggle: onCalculatedToggle } = useDisclosure({ defaultIsOpen: false })

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
                <Select
                  value={controlConfig.control_mode ?? ControlMode.VELOCITY_CONTROL}
                  onChange={(e) => handleConfigChange('control_mode', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  size="sm"
                >
                  <option value={ControlMode.VOLTAGE_CONTROL}>Voltage Control</option>
                  <option value={ControlMode.TORQUE_CONTROL}>Torque Control</option>
                  <option value={ControlMode.VELOCITY_CONTROL}>Velocity Control</option>
                  <option value={ControlMode.POSITION_CONTROL}>Position Control</option>
                </Select>
              </FormControl>

              <FormControl>
                <HStack spacing={2} mb={1}>
                  <FormLabel color="white" mb={0} fontSize="sm">Input Mode</FormLabel>
                  <Tooltip label="Input mode determines how commands are processed.">
                    <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                  </Tooltip>
                </HStack>
                <Select
                  value={controlConfig.input_mode ?? InputMode.VEL_RAMP}
                  onChange={(e) => handleConfigChange('input_mode', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  size="sm"
                >
                  <option value={InputMode.INACTIVE}>Inactive</option>
                  <option value={InputMode.PASSTHROUGH}>Passthrough</option>
                  <option value={InputMode.VEL_RAMP}>Velocity Ramp</option>
                  <option value={InputMode.POS_FILTER}>Position Filter</option>
                  <option value={InputMode.TRAP_TRAJ}>Trapezoidal Trajectory</option>
                  <option value={InputMode.TORQUE_RAMP}>Torque Ramp</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Main Configuration Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} gap={4}>
          
          {/* Left Column - PID Gains */}
          <VStack spacing={3} align="stretch">
            
            {/* Manual PID Gains */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">Manual PID Controller Gains</Heading>
              </CardHeader>
              <CardBody py={2}>
                <Alert status="warning" mb={2} py={1} fontSize="xs">
                  <AlertIcon boxSize={3} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="xs">ODrive v0.5.6 Control Formulas:</Text>
                    <Text fontSize="xs">Position: <code>vel_setpoint = pos_gain × pos_error</code></Text>
                    <Text fontSize="xs">Velocity: <code>current_setpoint = vel_gain × vel_error + vel_integrator_gain × ∫vel_error</code></Text>
                  </VStack>
                </Alert>
                
                <VStack spacing={2}>
                  {isPositionControl && (
                    <FormControl>
                      <HStack justify="space-between" mb={1}>
                        <HStack spacing={2}>
                          <FormLabel color="white" mb={0} fontSize="xs">Position Gain</FormLabel>
                          <Tooltip label="Proportional gain for position control. Higher values = faster response.">
                            <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                          </Tooltip>
                        </HStack>
                      </HStack>
                      <ParameterInput
                        value={controlConfig.pos_gain}
                        onChange={(value) => handleConfigChange('pos_gain', parseFloat(value) || 0)}
                        onRefresh={() => handleRefresh('pos_gain')}
                        isLoading={isLoading('pos_gain')}
                        unit="(turns/s)/turn"
                        precision={3}

                      />
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        Calculated: {calculatedGains.pos_gain.toFixed(3)}
                      </Text>
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
                    </HStack>
                    <ParameterInput
                      value={controlConfig.vel_gain}
                      onChange={(value) => handleConfigChange('vel_gain', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('vel_gain')}
                      isLoading={isLoading('vel_gain')}
                      unit="Nm [per turn/s]"
                      precision={6}
                    />
                    <Text fontSize="xs" color="blue.300" mt={1}>
                      Calculated: {calculatedGains.vel_gain.toFixed(6)}
                    </Text>
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between" mb={1}>
                      <HStack spacing={2}>
                        <FormLabel color="white" mb={0} fontSize="xs">Velocity Integrator Gain</FormLabel>
                        <Tooltip label="Integral gain for velocity control. Helps eliminate steady-state error.">
                          <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                        </Tooltip>
                      </HStack>
                    </HStack>
                    <ParameterInput
                      value={controlConfig.vel_integrator_gain}
                      onChange={(value) => handleConfigChange('vel_integrator_gain', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('vel_integrator_gain')}
                      isLoading={isLoading('vel_integrator_gain')}
                      unit="Nm⋅s [per turn/s]"
                      precision={6}
                    />
                    <Text fontSize="xs" color="blue.300" mt={1}>
                      Calculated: {calculatedGains.vel_integrator_gain.toFixed(6)}
                    </Text>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Calculated Gains Section */}
            <Card bg="green.900" variant="elevated" borderColor="green.500" borderWidth="1px">
              <CardHeader py={1}>
                <HStack justify="space-between">
                  <Heading size="sm" color="white">Calculated Optimal Gains</Heading>
                  <HStack spacing={1}>
                    <Button
                      leftIcon={<RepeatIcon />}
                      colorScheme="green"
                      size="xs"
                      onClick={applyCalculatedGains}
                    >
                      Apply All
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={onCalculatedToggle}
                      rightIcon={isCalculatedOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    >
                      {isCalculatedOpen ? 'Hide' : 'Show'}
                    </Button>
                  </HStack>
                </HStack>
              </CardHeader>
              <Collapse in={isCalculatedOpen}>
                <CardBody py={2}>
                  <Alert status="info" mb={2} py={1} fontSize="xs">
                    <AlertIcon boxSize={3} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="xs">Auto-calculated based on your motor configuration:</Text>
                      <Text fontSize="xs">Motor Kv: {motorConfig.motor_kv || 0} RPM/V, Encoder CPR: {encoderConfig.cpr || 0}</Text>
                      <Text fontSize="xs">Calculated Torque Constant: {calculatedGains.torque_constant.toFixed(4)} Nm/A</Text>
                    </VStack>
                  </Alert>

                  <VStack spacing={2}>
                    {isPositionControl && (
                      <HStack justify="space-between" w="100%" p={2} bg="gray.800" borderRadius="md">
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="bold" fontSize="xs">Position Gain (Calculated)</Text>
                          <Text fontSize="xs" color="gray.300">{calculatedGains.pos_gain.toFixed(3)} (turns/s)/turn</Text>
                        </VStack>
                        <Button
                          size="xs"
                          leftIcon={<RepeatIcon />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => resetGainToCalculated('pos_gain')}
                        >
                          Use
                        </Button>
                      </HStack>
                    )}

                    <HStack justify="space-between" w="100%" p={2} bg="gray.800" borderRadius="md">
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold" fontSize="xs">Velocity Gain (Calculated)</Text>
                        <Text fontSize="xs" color="gray.300">
                          {calculatedGains.vel_gain.toFixed(6)} Nm [per turn/s]
                        </Text>
                      </VStack>
                      <Button
                        size="xs"
                        leftIcon={<RepeatIcon />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => resetGainToCalculated('vel_gain')}
                      >
                        Use
                      </Button>
                    </HStack>

                    <HStack justify="space-between" w="100%" p={2} bg="gray.800" borderRadius="md">
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold" fontSize="xs">Velocity Integrator Gain (Calculated)</Text>
                        <Text fontSize="xs" color="gray.300">
                          {calculatedGains.vel_integrator_gain.toFixed(6)} Nm⋅s [per turn/s]
                        </Text>
                      </VStack>
                      <Button
                        size="xs"
                        leftIcon={<RepeatIcon />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => resetGainToCalculated('vel_integrator_gain')}
                      >
                        Use
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Collapse>
            </Card>
          </VStack>

          {/* Right Column - Limits, Ramps & Advanced */}
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
                      value={useRpm ? radToRpm(controlConfig.vel_limit) : (controlConfig.vel_limit)}
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
                      value={useRpm ? radToRpm(controlConfig.vel_ramp_rate) : (controlConfig.vel_ramp_rate)}
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

            {/* Advanced Settings */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader py={1}>
                <Heading size="sm" color="white">Advanced Settings</Heading>
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
      </VStack>
    </Box>
  )
}

export default ControlConfigStep