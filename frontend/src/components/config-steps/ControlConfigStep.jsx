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
  SimpleGrid,
  Collapse,
  useDisclosure,
  Badge,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
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
  const { isOpen: isCalculatedOpen, onToggle: onCalculatedToggle } = useDisclosure({ defaultIsOpen: false })

  return (
    <Box h="100%" overflow="hidden" p={4}>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6} h="100%">
        {/* Left Column */}
        <VStack spacing={4} align="stretch" h="100%" overflow="auto">
          <Box>
            <Heading size="md" color="white" mb={1}>
              Control Mode Configuration
            </Heading>
            <Text color="gray.300" fontSize="sm" mb={3}>
              Configure the control mode and input processing for your motor.
            </Text>
            
            {/* Unit Toggle */}
            <Card bg="gray.700" variant="elevated">
              <CardBody py={2}>
                <HStack justify="space-between">
                  <Text color="white" fontWeight="bold" fontSize="sm">Velocity Units:</Text>
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
              </CardBody>
            </Card>
          </Box>

          <Card bg="gray.800" variant="elevated">
            <CardHeader py={2}>
              <Heading size="sm" color="white">Control Mode Selection</Heading>
            </CardHeader>
            <CardBody py={3}>
              <VStack spacing={3}>
                <FormControl>
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Control Mode</FormLabel>
                    <Tooltip label="Primary control mode determines what quantity the motor controller regulates.">
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
                    size="sm"
                  >
                    <option value={ControlMode.VOLTAGE_CONTROL}>Voltage Control</option>
                    <option value={ControlMode.TORQUE_CONTROL}>Torque Control</option>
                    <option value={ControlMode.VELOCITY_CONTROL}>Velocity Control</option>
                    <option value={ControlMode.POSITION_CONTROL}>Position Control</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <HStack>
                    <FormLabel color="white" mb={0} fontSize="sm">Input Mode</FormLabel>
                    <Tooltip label="Input mode determines how commands are processed.">
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
              </VStack>
            </CardBody>
          </Card>      <Tabs variant="enclosed" colorScheme="odrive" size="sm">
        <TabList>
          <Tab fontSize="sm">PID Gains</Tab>
          <Tab fontSize="sm">Limits & Ramps</Tab>
          <Tab fontSize="sm">Advanced</Tab>
        </TabList>

        <TabPanels>
          {/* PID Gains Tab */}
          <TabPanel p={0}>
            {/* Calculated Gains Section - Collapsible */}
            <Card bg="green.900" variant="elevated" mt={3} borderColor="green.500" borderWidth="1px">
              <CardHeader py={2}>
                <HStack justify="space-between">
                  <Heading size="sm" color="white">Calculated Optimal Gains</Heading>
                  <HStack>
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
                  <Alert status="info" mb={3} py={2}>
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="sm">Auto-calculated based on your motor configuration:</Text>
                      <Text fontSize="xs">Motor Kv: {motorConfig.motor_kv || 230} RPM/V, Encoder CPR: {encoderConfig.cpr || 4000}</Text>
                      <Text fontSize="xs">Calculated Torque Constant: {calculatedGains.torque_constant.toFixed(4)} Nm/A</Text>
                    </VStack>
                  </Alert>

                  <VStack spacing={2}>
                    {isPositionControl && (
                      <HStack justify="space-between" w="100%" p={2} bg="gray.800" borderRadius="md">
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="bold" fontSize="sm">Position Gain (Calculated)</Text>
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
                        <Text color="white" fontWeight="bold" fontSize="sm">Velocity Gain (Calculated)</Text>
                        <Text fontSize="xs" color="gray.300">
                          {useRpm ? 
                            `${velGainRadToRpm(calculatedGains.vel_gain).toFixed(3)} A/(RPM)` : 
                            `${calculatedGains.vel_gain.toFixed(6)} A/(turns/s)`
                          }
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
                        <Text color="white" fontWeight="bold" fontSize="sm">Velocity Integrator Gain (Calculated)</Text>
                        <Text fontSize="xs" color="gray.300">
                          {useRpm ? 
                            `${velGainRadToRpm(calculatedGains.vel_integrator_gain).toFixed(3)} A⋅s/(RPM)` : 
                            `${calculatedGains.vel_integrator_gain.toFixed(6)} A⋅s/(turns/s)`
                          }
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

            <Card bg="gray.800" variant="elevated" mt={3}>
              <CardHeader py={2}>
                <Heading size="sm" color="white">Manual PID Controller Gains</Heading>
              </CardHeader>
              <CardBody py={2}>
                <Alert status="warning" mb={3} py={2}>
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="sm">ODrive v0.5.6 Control Formulas:</Text>
                    <Text fontSize="xs">Position: <code>vel_setpoint = pos_gain × pos_error</code></Text>
                    <Text fontSize="xs">Velocity: <code>current_setpoint = vel_gain × vel_error + vel_integrator_gain × ∫vel_error</code></Text>
                  </VStack>
                </Alert>
                
                <VStack spacing={3}>
                  {isPositionControl && (
                    <FormControl>
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={0} fontSize="sm">Position Gain</FormLabel>
                          <Tooltip label="Proportional gain for position control. Converts position error (turns) to velocity setpoint (turns/s).">
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
                          Reset
                        </Button>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.pos_gain}
                          onChange={(value) => handleConfigChange('pos_gain', parseFloat(value) || 0)}
                          step={0.1}
                          precision={3}
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="80px" fontSize="sm">(turns/s)/turn</Text>
                      </HStack>
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        Calculated: {calculatedGains.pos_gain.toFixed(3)}
                      </Text>
                    </FormControl>
                  )}

                  <HStack spacing={4} w="100%">
                    <FormControl flex="1">
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={0} fontSize="sm">Velocity Gain</FormLabel>
                          <Tooltip label="Proportional gain for velocity control. Converts velocity error to current setpoint.">
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
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="70px" fontSize="sm">{useRpm ? "A/(RPM)" : "A/(turns/s)"}</Text>
                      </HStack>
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        Calculated: {useRpm ? 
                          `${velGainRadToRpm(calculatedGains.vel_gain).toFixed(3)}` : 
                          `${calculatedGains.vel_gain.toFixed(6)}`
                        }
                      </Text>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={0} fontSize="sm">Velocity Integrator Gain</FormLabel>
                          <Tooltip label="Integral gain for velocity control. Eliminates steady-state velocity errors.">
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
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="80px" fontSize="sm">{useRpm ? "A⋅s/(RPM)" : "A⋅s/(turns/s)"}</Text>
                      </HStack>
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        Calculated: {useRpm ? 
                          `${velGainRadToRpm(calculatedGains.vel_integrator_gain).toFixed(3)}` : 
                          `${calculatedGains.vel_integrator_gain.toFixed(6)}`
                        }
                      </Text>
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Limits & Ramps Tab */}
          <TabPanel p={0}>
            <Card bg="gray.800" variant="elevated" mt={3}>
              <CardHeader py={2}>
                <Heading size="sm" color="white">Velocity & Acceleration Limits</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={3}>
                  <HStack spacing={4} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0} fontSize="sm">Velocity Limit</FormLabel>
                        <Tooltip label="Maximum velocity the motor is allowed to reach.">
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
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="50px" fontSize="sm">{useRpm ? "RPM" : "turns/s"}</Text>
                      </HStack>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0} fontSize="sm">Velocity Limit Tolerance</FormLabel>
                        <Tooltip label="Multiplier for velocity limit during transients.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <NumberInput
                        value={controlConfig.vel_limit_tolerance}
                        onChange={(value) => handleConfigChange('vel_limit_tolerance', parseFloat(value) || 0)}
                        step={0.1}
                        precision={2}
                        size="sm"
                      >
                        <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0} fontSize="sm">Acceleration Limit</FormLabel>
                        <Tooltip label="Maximum acceleration when using velocity ramp input mode.">
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
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="60px" fontSize="sm">{useRpm ? "RPM/s" : "turns/s²"}</Text>
                      </HStack>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0} fontSize="sm">Torque Ramp Rate</FormLabel>
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
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="40px" fontSize="sm">Nm/s</Text>
                      </HStack>
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Advanced Tab */}
          <TabPanel p={0}>
            <Card bg="gray.800" variant="elevated" mt={3}>
              <CardHeader py={2}>
                <Heading size="sm" color="white">Advanced Settings</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={3}>
                  <FormControl>
                    <HStack justify="space-between">
                      <HStack>
                        <FormLabel color="white" mb={0} fontSize="sm">Circular Setpoints</FormLabel>
                        <Tooltip label="Enable for continuous rotation applications.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <Switch
                        isChecked={controlConfig.circular_setpoints}
                        onChange={(e) => handleConfigChange('circular_setpoints', e.target.checked)}
                        colorScheme="odrive"
                        size="sm"
                      />
                    </HStack>
                  </FormControl>

                  <HStack spacing={4} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0} fontSize="sm">System Inertia</FormLabel>
                        <Tooltip label="Estimated rotational inertia of the mechanical system.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.inertia}
                          onChange={(value) => handleConfigChange('inertia', parseFloat(value) || 0)}
                          step={0.001}
                          precision={6}
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="50px" fontSize="sm">kg⋅m²</Text>
                      </HStack>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0} fontSize="sm">Input Filter Bandwidth</FormLabel>
                        <Tooltip label="Low-pass filter bandwidth for input commands.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.input_filter_bandwidth}
                          onChange={(value) => handleConfigChange('input_filter_bandwidth', parseFloat(value) || 0)}
                          step={0.1}
                          precision={2}
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="30px" fontSize="sm">Hz</Text>
                      </HStack>
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
        </VStack>

        {/* Right Column */}
        <VStack spacing={4} align="stretch" h="100%" overflow="auto">
          <Card bg="gray.700" variant="elevated">
            <CardHeader py={2}>
              <Heading size="sm" color="white">Configuration Summary</Heading>
            </CardHeader>
            <CardBody py={2}>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text color="gray.300" fontSize="sm">Control Mode:</Text>
                  <Badge colorScheme="blue" fontSize="xs">
                    {getControlModeName(controlConfig.control_mode)}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.300" fontSize="sm">Input Mode:</Text>
                  <Badge colorScheme="green" fontSize="xs">
                    {getInputModeName(controlConfig.input_mode)}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.300" fontSize="sm">Max Velocity:</Text>
                  <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                    {useRpm ? `${(controlConfig.vel_limit * 60).toFixed(0)} RPM` : `${controlConfig.vel_limit.toFixed(2)} turns/s`}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.300" fontSize="sm">Max Acceleration:</Text>
                  <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                    {useRpm ? `${(controlConfig.vel_ramp_rate * 60).toFixed(0)} RPM/s` : `${controlConfig.vel_ramp_rate.toFixed(2)} turns/s²`}
                  </Text>
                </HStack>
                {isPositionControl && (
                  <HStack justify="space-between">
                    <Text color="gray.300" fontSize="sm">Position Gain:</Text>
                    <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                      {controlConfig.pos_gain.toFixed(3)} (turns/s)/turn
                    </Text>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text color="gray.300" fontSize="sm">Velocity Gain:</Text>
                  <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                    {useRpm ? `${velGainRadToRpm(controlConfig.vel_gain).toFixed(3)} A/(RPM)` : `${controlConfig.vel_gain.toFixed(6)} A/(turns/s)`}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.300" fontSize="sm">Velocity Integrator Gain:</Text>
                  <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                    {useRpm ? `${velGainRadToRpm(controlConfig.vel_integrator_gain).toFixed(3)} A⋅s/(RPM)` : `${controlConfig.vel_integrator_gain.toFixed(6)} A⋅s/(turns/s)`}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="blue.900" variant="elevated" borderColor="blue.500" borderWidth="1px">
            <CardHeader py={2}>
              <Heading size="sm" color="white">Control Guidelines</Heading>
            </CardHeader>
            <CardBody py={2}>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color="blue.100">
                  <strong>Start with calculated gains</strong> for stable operation
                </Text>
                <Text fontSize="sm" color="blue.100">
                  <strong>Position Control:</strong> Good for precise positioning tasks
                </Text>
                <Text fontSize="sm" color="blue.100">
                  <strong>Velocity Control:</strong> Good for speed regulation
                </Text>
                <Text fontSize="sm" color="blue.100">
                  <strong>Higher gains:</strong> Faster response but may cause oscillation
                </Text>
                <Text fontSize="sm" color="blue.100">
                  <strong>Lower gains:</strong> Slower but more stable response
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Alert status="info" variant="left-accent" py={2}>
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="bold">
                ODrive v0.5.6 Control Loop
              </Text>
              <Text fontSize="xs">
                Position → Velocity → Current → Voltage
              </Text>
              <Text fontSize="xs">
                Each control mode bypasses earlier stages
              </Text>
            </VStack>
          </Alert>
        </VStack>
      </SimpleGrid>
    </Box>
  )
}

export default ControlConfigStep