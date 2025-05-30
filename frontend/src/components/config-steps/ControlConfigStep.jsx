import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Tooltip,
  Button,
  ButtonGroup,
  Divider,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons'
import { updateControlConfig, updateUiPreferences } from '../../store/slices/configSlice'
import { ControlMode, InputMode, getControlModeName, getInputModeName } from '../../utils/odriveEnums'
import { 
  radToRpm, 
  rpmToRad, 
  velGainRadToRpm, 
  velGainRpmToRad,
} from '../../utils/unitConversions'

const ControlConfigStep = () => {
  const dispatch = useDispatch()
  const config = useSelector(state => state.config)
  
  // Safe destructuring with fallbacks
  const { controlConfig, motorConfig, encoderConfig } = config
  const uiPreferences = config.uiPreferences || { useRpmUnits: true }
  const useRpm = uiPreferences.useRpmUnits ?? true

  // Local state for display values to prevent conversion issues
  const [displayValues, setDisplayValues] = useState({
    velLimit: 0,
    velRampRate: 0,
    velGain: 0,
    velIntGain: 0
  })

  // Calculate optimal PID gains based on motor and encoder configuration
  const calculateOptimalGains = useCallback(() => {
    const motorKv = motorConfig.motor_kv || 230
    const encoderCpr = encoderConfig.cpr || 4000
    
    // Calculate torque constant (Kt = 60/(2π * Kv))
    const torqueConstant = 60 / (2 * Math.PI * motorKv)
    
    // Default bandwidth assumptions for stable operation
    const currentBandwidth = 1000 // Hz - typical current control bandwidth
    const velocityBandwidth = 100 // Hz - target velocity bandwidth
    const positionBandwidth = 20 // Hz - target position bandwidth
    
    // Calculate gains based on ODrive v0.5.6 formulas
    // vel_gain should be: vel_gain = torque_constant * encoder_cpr * bandwidth_factor
    const velGain = torqueConstant * encoderCpr * (velocityBandwidth / currentBandwidth)
    
    // vel_integrator_gain should be: 0.5 * bandwidth * vel_gain
    const velIntegratorGain = 0.5 * velocityBandwidth * velGain
    
    // pos_gain should give reasonable bandwidth: pos_gain = bandwidth_ratio
    const posGain = positionBandwidth
    
    return {
      pos_gain: posGain,
      vel_gain: velGain,
      vel_integrator_gain: velIntegratorGain,
      torque_constant: torqueConstant
    }
  }, [motorConfig.motor_kv, encoderConfig.cpr])

  const [calculatedGains, setCalculatedGains] = useState(calculateOptimalGains())

  // Recalculate gains when motor or encoder config changes
  useEffect(() => {
    setCalculatedGains(calculateOptimalGains())
  }, [calculateOptimalGains])

  // Initialize display values when config or unit preference changes
  useEffect(() => {
    setDisplayValues({
      velLimit: useRpm ? radToRpm(controlConfig.vel_limit) : controlConfig.vel_limit,
      velRampRate: useRpm ? radToRpm(controlConfig.vel_ramp_rate) : controlConfig.vel_ramp_rate,
      velGain: useRpm ? velGainRadToRpm(controlConfig.vel_gain) : controlConfig.vel_gain,
      velIntGain: useRpm ? velGainRadToRpm(controlConfig.vel_integrator_gain) : controlConfig.vel_integrator_gain
    })
  }, [controlConfig.vel_limit, controlConfig.vel_ramp_rate, controlConfig.vel_gain, controlConfig.vel_integrator_gain, useRpm])

  const handleConfigChange = (key, value) => {
    dispatch(updateControlConfig({ [key]: value }))
  }

  const handleUnitToggle = (useRpmUnits) => {
    dispatch(updateUiPreferences({ useRpmUnits }))
  }

  // Apply calculated gains
  const applyCalculatedGains = () => {
    const gains = calculateOptimalGains()
    handleConfigChange('pos_gain', gains.pos_gain)
    handleConfigChange('vel_gain', gains.vel_gain)
    handleConfigChange('vel_integrator_gain', gains.vel_integrator_gain)
  }

  // Reset individual gain to calculated value
  const resetGainToCalculated = (gainType) => {
    const gains = calculateOptimalGains()
    handleConfigChange(gainType, gains[gainType])
  }

  // Handle velocity limit changes
  const handleVelLimitChange = (value) => {
    const numValue = parseFloat(value) || 0
    setDisplayValues(prev => ({ ...prev, velLimit: numValue }))
    const radValue = useRpm ? rpmToRad(numValue) : numValue
    handleConfigChange('vel_limit', radValue)
  }

  // Handle velocity ramp rate changes
  const handleVelRampRateChange = (value) => {
    const numValue = parseFloat(value) || 0
    setDisplayValues(prev => ({ ...prev, velRampRate: numValue }))
    const radValue = useRpm ? rpmToRad(numValue) : numValue
    handleConfigChange('vel_ramp_rate', radValue)
  }

  // Handle velocity gain changes
  const handleVelGainChange = (value) => {
    const numValue = parseFloat(value) || 0
    setDisplayValues(prev => ({ ...prev, velGain: numValue }))
    const radValue = useRpm ? velGainRpmToRad(numValue) : numValue
    handleConfigChange('vel_gain', radValue)
  }

  // Handle velocity integrator gain changes
  const handleVelIntGainChange = (value) => {
    const numValue = parseFloat(value) || 0
    setDisplayValues(prev => ({ ...prev, velIntGain: numValue }))
    const radValue = useRpm ? velGainRpmToRad(numValue) : numValue
    handleConfigChange('vel_integrator_gain', radValue)
  }

  const isPositionControl = controlConfig.control_mode === ControlMode.POSITION_CONTROL

  // ...existing code continues unchanged...
  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Control Mode Configuration
        </Heading>
        <Text color="gray.300" mb={4}>
          Configure the control mode and input processing for your motor. 
          This determines how the ODrive interprets and responds to commands.
        </Text>
        
        {/* Unit Toggle */}
        <Card bg="gray.700" variant="elevated" mb={4}>
          <CardBody py={3}>
            <HStack justify="space-between">
              <Text color="white" fontWeight="bold">Velocity Units:</Text>
              <ButtonGroup size="sm" isAttached variant="outline">
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
          </CardBody>
        </Card>
      </Box>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Control Mode Selection</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <HStack>
                <FormLabel color="white" mb={0}>Control Mode</FormLabel>
                <Tooltip label="Primary control mode determines what quantity the motor controller regulates (position, velocity, torque, or voltage).">
                  <Icon as={InfoIcon} color="gray.400" />
                </Tooltip>
              </HStack>
              <Select
                value={controlConfig.control_mode}
                onChange={(e) => handleConfigChange('control_mode', parseInt(e.target.value))}
                bg="gray.700"
                border="1px solid"
                borderColor="gray.600"
                color="white"
              >
                <option value={ControlMode.VOLTAGE_CONTROL}>Voltage Control</option>
                <option value={ControlMode.TORQUE_CONTROL}>Torque Control</option>
                <option value={ControlMode.VELOCITY_CONTROL}>Velocity Control</option>
                <option value={ControlMode.POSITION_CONTROL}>Position Control</option>
              </Select>
            </FormControl>

            <FormControl>
              <HStack>
                <FormLabel color="white" mb={0}>Input Mode</FormLabel>
                <Tooltip label="Input mode determines how commands are processed (direct passthrough, ramping, trajectory generation, etc.).">
                  <Icon as={InfoIcon} color="gray.400" />
                </Tooltip>
              </HStack>
              <Select
                value={controlConfig.input_mode}
                onChange={(e) => handleConfigChange('input_mode', parseInt(e.target.value))}
                bg="gray.700"
                border="1px solid"
                borderColor="gray.600"
                color="white"
              >
                <option value={InputMode.INACTIVE}>Inactive</option>
                <option value={InputMode.PASSTHROUGH}>Passthrough</option>
                <option value={InputMode.VEL_RAMP}>Velocity Ramp</option>
                <option value={InputMode.POS_FILTER}>Position Filter</option>
                <option value={InputMode.TRAP_TRAJ}>Trapezoidal Trajectory</option>
                <option value={InputMode.TORQUE_RAMP}>Torque Ramp</option>
              </Select>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      <Tabs variant="enclosed" colorScheme="odrive">
        <TabList>
          <Tab>PID Gains</Tab>
          <Tab>Limits & Ramps</Tab>
          <Tab>Advanced</Tab>
        </TabList>

        <TabPanels>
          {/* PID Gains Tab */}
          <TabPanel p={0}>
            {/* Calculated Gains Section */}
            <Card bg="green.900" variant="elevated" mt={4} borderColor="green.500" borderWidth="1px">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color="white">Calculated Optimal Gains</Heading>
                  <Button
                    leftIcon={<RepeatIcon />}
                    colorScheme="green"
                    size="sm"
                    onClick={applyCalculatedGains}
                  >
                    Apply All Calculated Gains
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">Auto-calculated based on your motor configuration:</Text>
                    <Text fontSize="sm">Motor Kv: {motorConfig.motor_kv || 230} RPM/V</Text>
                    <Text fontSize="sm">Pole Pairs: {motorConfig.pole_pairs || 7}</Text>
                    <Text fontSize="sm">Encoder CPR: {encoderConfig.cpr || 4000}</Text>
                    <Text fontSize="sm">Calculated Torque Constant: {calculatedGains.torque_constant.toFixed(4)} Nm/A</Text>
                  </VStack>
                </Alert>

                <VStack spacing={3}>
                  {isPositionControl && (
                    <HStack justify="space-between" w="100%" p={3} bg="gray.800" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text color="white" fontWeight="bold">Position Gain (Calculated)</Text>
                        <Text fontSize="sm" color="gray.300">{calculatedGains.pos_gain.toFixed(3)} (turns/s)/turn</Text>
                      </VStack>
                      <Button
                        size="sm"
                        leftIcon={<RepeatIcon />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => resetGainToCalculated('pos_gain')}
                      >
                        Use This Value
                      </Button>
                    </HStack>
                  )}

                  <HStack justify="space-between" w="100%" p={3} bg="gray.800" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="bold">Velocity Gain (Calculated)</Text>
                      <Text fontSize="sm" color="gray.300">
                        {useRpm ? 
                          `${velGainRadToRpm(calculatedGains.vel_gain).toFixed(3)} A/(RPM)` : 
                          `${calculatedGains.vel_gain.toFixed(6)} A/(turns/s)`
                        }
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      leftIcon={<RepeatIcon />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => resetGainToCalculated('vel_gain')}
                    >
                      Use This Value
                    </Button>
                  </HStack>

                  <HStack justify="space-between" w="100%" p={3} bg="gray.800" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="bold">Velocity Integrator Gain (Calculated)</Text>
                      <Text fontSize="sm" color="gray.300">
                        {useRpm ? 
                          `${velGainRadToRpm(calculatedGains.vel_integrator_gain).toFixed(3)} A⋅s/(RPM)` : 
                          `${calculatedGains.vel_integrator_gain.toFixed(6)} A⋅s/(turns/s)`
                        }
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      leftIcon={<RepeatIcon />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => resetGainToCalculated('vel_integrator_gain')}
                    >
                      Use This Value
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card bg="gray.800" variant="elevated" mt={4}>
              <CardHeader>
                <Heading size="md" color="white">Manual PID Controller Gains</Heading>
              </CardHeader>
              <CardBody>
                <Alert status="warning" mb={4}>
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">ODrive v0.5.6 Control Formulas:</Text>
                    <Text fontSize="sm">Position: <code>vel_setpoint = pos_gain × pos_error</code></Text>
                    <Text fontSize="sm">Velocity: <code>current_setpoint = vel_gain × vel_error + vel_integrator_gain × ∫vel_error</code></Text>
                    <Text fontSize="sm">Start with calculated values above, then fine-tune as needed.</Text>
                  </VStack>
                </Alert>
                
                <VStack spacing={4}>
                  {isPositionControl && (
                    <FormControl>
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={0}>Position Gain</FormLabel>
                          <Tooltip label="Proportional gain for position control. Converts position error (turns) to velocity setpoint (turns/s). Higher values increase position stiffness but may cause oscillation.">
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                        <Button
                          size="xs"
                          leftIcon={<RepeatIcon />}
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => resetGainToCalculated('pos_gain')}
                        >
                          Reset to Calculated
                        </Button>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.pos_gain}
                          onChange={(value) => handleConfigChange('pos_gain', parseFloat(value) || 0)}
                          step={0.1}
                          precision={3}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="100px">(turns/s)/turn</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Formula: vel_setpoint = pos_gain × (pos_setpoint - pos_estimate)
                      </Text>
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        Calculated optimal: {calculatedGains.pos_gain.toFixed(3)}
                      </Text>
                    </FormControl>
                  )}

                  <HStack spacing={6} w="100%">
                    <FormControl flex="1">
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={0}>Velocity Gain</FormLabel>
                          <Tooltip label="Proportional gain for velocity control. Converts velocity error (turns/s) to current setpoint (A). Affects how aggressively the motor responds to velocity errors.">
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                        <Button
                          size="xs"
                          leftIcon={<RepeatIcon />}
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => resetGainToCalculated('vel_gain')}
                        >
                          Reset
                        </Button>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={displayValues.velGain}
                          onChange={handleVelGainChange}
                          step={useRpm ? 0.01 : 0.001}
                          precision={useRpm ? 3 : 6}
                          format={(val) => val}
                          parse={(val) => val}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="90px">{useRpm ? "A/(RPM)" : "A/(turns/s)"}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Stored as: {controlConfig.vel_gain.toFixed(6)} A/(turns/s)
                      </Text>
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        Calculated: {useRpm ? 
                          `${velGainRadToRpm(calculatedGains.vel_gain).toFixed(3)} A/(RPM)` : 
                          `${calculatedGains.vel_gain.toFixed(6)} A/(turns/s)`
                        }
                      </Text>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={0}>Velocity Integrator Gain</FormLabel>
                          <Tooltip label="Integral gain for velocity control. Converts accumulated velocity error (turns/s×s) to current setpoint (A). Helps eliminate steady-state velocity errors but can cause overshoot.">
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                        <Button
                          size="xs"
                          leftIcon={<RepeatIcon />}
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => resetGainToCalculated('vel_integrator_gain')}
                        >
                          Reset
                        </Button>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={displayValues.velIntGain}
                          onChange={handleVelIntGainChange}
                          step={useRpm ? 0.01 : 0.001}
                          precision={useRpm ? 3 : 6}
                          format={(val) => val}
                          parse={(val) => val}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="110px">{useRpm ? "A⋅s/(RPM)" : "A⋅s/(turns/s)"}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Stored as: {controlConfig.vel_integrator_gain.toFixed(6)} A⋅s/(turns/s)
                      </Text>
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        Calculated: {useRpm ? 
                          `${velGainRadToRpm(calculatedGains.vel_integrator_gain).toFixed(3)} A⋅s/(RPM)` : 
                          `${calculatedGains.vel_integrator_gain.toFixed(6)} A⋅s/(turns/s)`
                        }
                      </Text>
                    </FormControl>
                  </HStack>
                  
                  <Divider />
                  
                  <Box bg="gray.900" p={3} borderRadius="md" w="100%">
                    <Text fontSize="sm" fontWeight="bold" color="odrive.300" mb={2}>
                      Complete Velocity Controller Formula:
                    </Text>
                    <Text fontSize="sm" color="gray.300" fontFamily="mono">
                      current_setpoint = vel_gain × vel_error + vel_integrator_gain × ∫vel_error dt
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Where vel_error = vel_setpoint - vel_estimate (in turns/s)
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Limits & Ramps Tab */}
          <TabPanel p={0}>
            <Card bg="gray.800" variant="elevated" mt={4}>
              <CardHeader>
                <Heading size="md" color="white">Velocity & Acceleration Limits</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <HStack spacing={6} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Velocity Limit</FormLabel>
                        <Tooltip label="Maximum velocity the motor is allowed to reach. Set based on your mechanical system limits.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={displayValues.velLimit}
                          onChange={handleVelLimitChange}
                          step={useRpm ? 10 : 0.5}
                          precision={useRpm ? 0 : 2}
                          format={(val) => val}
                          parse={(val) => val}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="70px">{useRpm ? "RPM" : "turns/s"}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Stored as: {controlConfig.vel_limit.toFixed(2)} turns/s
                      </Text>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Velocity Limit Tolerance</FormLabel>
                        <Tooltip label="Multiplier for velocity limit during transients. Allows temporary velocity overshoots.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <NumberInput
                        value={controlConfig.vel_limit_tolerance}
                        onChange={(value) => handleConfigChange('vel_limit_tolerance', parseFloat(value) || 0)}
                        step={0.1}
                        precision={2}
                      >
                        <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <HStack spacing={6} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Acceleration Limit</FormLabel>
                        <Tooltip label="Maximum acceleration when using velocity ramp input mode. This is the rate of change of velocity.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={displayValues.velRampRate}
                          onChange={handleVelRampRateChange}
                          step={useRpm ? 50 : 1}
                          precision={useRpm ? 0 : 2}
                          format={(val) => val}
                          parse={(val) => val}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="80px">{useRpm ? "RPM/s" : "turns/s²"}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Stored as: {controlConfig.vel_ramp_rate.toFixed(2)} turns/s²
                      </Text>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Torque Ramp Rate</FormLabel>
                        <Tooltip label="Maximum torque change rate when using torque ramp input mode.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.torque_ramp_rate}
                          onChange={(value) => handleConfigChange('torque_ramp_rate', parseFloat(value) || 0)}
                          step={0.001}
                          precision={4}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="60px">Nm/s</Text>
                      </HStack>
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Advanced Tab */}
          <TabPanel p={0}>
            <Card bg="gray.800" variant="elevated" mt={4}>
              <CardHeader>
                <Heading size="md" color="white">Advanced Settings</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <HStack justify="space-between">
                      <HStack>
                        <FormLabel color="white" mb={0}>Circular Setpoints</FormLabel>
                        <Tooltip label="Enable for continuous rotation applications. Prevents position wrapping issues.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <Switch
                        isChecked={controlConfig.circular_setpoints}
                        onChange={(e) => handleConfigChange('circular_setpoints', e.target.checked)}
                        colorScheme="odrive"
                      />
                    </HStack>
                  </FormControl>

                  <HStack spacing={6} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>System Inertia</FormLabel>
                        <Tooltip label="Estimated rotational inertia of the mechanical system. Used for feedforward control.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.inertia}
                          onChange={(value) => handleConfigChange('inertia', parseFloat(value) || 0)}
                          step={0.001}
                          precision={6}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="60px">kg⋅m²</Text>
                      </HStack>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Input Filter Bandwidth</FormLabel>
                        <Tooltip label="Low-pass filter bandwidth for input commands. Reduces noise but adds delay.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.input_filter_bandwidth}
                          onChange={(value) => handleConfigChange('input_filter_bandwidth', parseFloat(value) || 0)}
                          step={0.1}
                          precision={2}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="40px">Hz</Text>
                      </HStack>
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Card bg="gray.700" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Configuration Summary</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text color="gray.300">Control Mode:</Text>
              <Text fontWeight="bold" color="white">
                {getControlModeName(controlConfig.control_mode)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Input Mode:</Text>
              <Text fontWeight="bold" color="white">
                {getInputModeName(controlConfig.input_mode)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Max Velocity:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {useRpm ? `${(controlConfig.vel_limit * 60).toFixed(0)} RPM` : `${controlConfig.vel_limit.toFixed(2)} turns/s`}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Max Acceleration:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {useRpm ? `${(controlConfig.vel_ramp_rate * 60).toFixed(0)} RPM/s` : `${controlConfig.vel_ramp_rate.toFixed(2)} turns/s²`}
              </Text>
            </HStack>
            {isPositionControl && (
              <HStack justify="space-between">
                <Text color="gray.300">Position Gain:</Text>
                <Text fontWeight="bold" color="odrive.300">
                  {controlConfig.pos_gain.toFixed(3)} (turns/s)/turn
                </Text>
              </HStack>
            )}
            <HStack justify="space-between">
              <Text color="gray.300">Velocity Gain:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {useRpm ? `${velGainRadToRpm(controlConfig.vel_gain).toFixed(3)} A/(RPM)` : `${controlConfig.vel_gain.toFixed(6)} A/(turns/s)`}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Velocity Integrator Gain:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {useRpm ? `${velGainRadToRpm(controlConfig.vel_integrator_gain).toFixed(3)} A⋅s/(RPM)` : `${controlConfig.vel_integrator_gain.toFixed(6)} A⋅s/(turns/s)`}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default ControlConfigStep