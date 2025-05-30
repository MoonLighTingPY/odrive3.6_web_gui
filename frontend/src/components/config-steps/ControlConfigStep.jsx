import { useState, useEffect } from 'react'
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
import { InfoIcon } from '@chakra-ui/icons'
import { updateControlConfig, updateUiPreferences } from '../../store/slices/configSlice'
import { ControlMode, InputMode, getControlModeName, getInputModeName } from '../../utils/odriveEnums'
import { 
  radToRpm, 
  rpmToRad, 
  velGainRadToRpm, 
  velGainRpmToRad,
  formatVelocity,
  formatAcceleration,
  formatVelGain,
  formatVelIntGain
} from '../../utils/unitConversions'

const ControlConfigStep = () => {
  const dispatch = useDispatch()
  const config = useSelector(state => state.config)
  
  // Safe destructuring with fallbacks
  const { controlConfig } = config
  const uiPreferences = config.uiPreferences || { useRpmUnits: true }
  const useRpm = uiPreferences.useRpmUnits ?? true

  // Local state for display values to prevent conversion issues
  const [displayValues, setDisplayValues] = useState({
    velLimit: 0,
    velRampRate: 0,
    velGain: 0,
    velIntGain: 0
  })

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
  const isVelocityControl = controlConfig.control_mode === ControlMode.VELOCITY_CONTROL

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
            <Card bg="gray.800" variant="elevated" mt={4}>
              <CardHeader>
                <Heading size="md" color="white">PID Controller Gains</Heading>
              </CardHeader>
              <CardBody>
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">ODrive v0.5.6 Control Formulas:</Text>
                    <Text fontSize="sm">Position: <code>vel_setpoint = pos_gain × pos_error</code></Text>
                    <Text fontSize="sm">Velocity: <code>current_setpoint = vel_gain × vel_error + vel_integrator_gain × ∫vel_error</code></Text>
                    <Text fontSize="sm">All units are in turns/s and amperes. Tuning requires careful adjustment.</Text>
                  </VStack>
                </Alert>
                
                <VStack spacing={4}>
                  {isPositionControl && (
                    <FormControl>
                      <HStack>
                        <FormLabel color="white" mb={0}>Position Gain</FormLabel>
                        <Tooltip label="Proportional gain for position control. Converts position error (turns) to velocity setpoint (turns/s). Higher values increase position stiffness but may cause oscillation.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
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
                    </FormControl>
                  )}

                  <HStack spacing={6} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Velocity Gain</FormLabel>
                        <Tooltip label="Proportional gain for velocity control. Converts velocity error (turns/s) to current setpoint (A). Affects how aggressively the motor responds to velocity errors.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
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
                        Formula: I_proportional = vel_gain × vel_error
                      </Text>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Velocity Integrator Gain</FormLabel>
                        <Tooltip label="Integral gain for velocity control. Converts accumulated velocity error (turns/s×s) to current setpoint (A). Helps eliminate steady-state velocity errors but can cause overshoot.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
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
                        Formula: I_integral = vel_integrator_gain × ∫vel_error dt
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