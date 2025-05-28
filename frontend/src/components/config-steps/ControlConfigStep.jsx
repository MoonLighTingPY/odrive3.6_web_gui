import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  Switch,
  Select,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tooltip,
  Icon,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { updateControlConfig } from '../../store/slices/configSlice'
import { ControlMode, InputMode, getControlModeName, getInputModeName } from '../../utils/odriveEnums'

const ControlConfigStep = () => {
  const dispatch = useDispatch()
  const { controlConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updateControlConfig({ [field]: value }))
  }

  const isPositionControl = controlConfig.control_mode === ControlMode.POSITION_CONTROL
  const isVelocityControl = controlConfig.control_mode === ControlMode.VELOCITY_CONTROL

  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Control Mode Configuration
        </Heading>
        <Text color="gray.300" mb={6}>
          Configure the control mode and input processing for your motor. 
          This determines how the ODrive interprets and responds to commands.
        </Text>
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
                <Alert status="warning" mb={4}>
                  <AlertIcon />
                  Tuning PID gains requires careful adjustment. Start with conservative values and adjust gradually.
                </Alert>
                
                <VStack spacing={4}>
                  {isPositionControl && (
                    <FormControl>
                      <HStack>
                        <FormLabel color="white" mb={0}>Position Gain</FormLabel>
                        <Tooltip label="Proportional gain for position control. Higher values increase position stiffness but may cause oscillation.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.pos_gain}
                          onChange={(_, value) => handleConfigChange('pos_gain', value)}
                          min={0}
                          max={100}
                          step={0.1}
                          precision={1}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="60px">(rad/s)/rad</Text>
                      </HStack>
                    </FormControl>
                  )}

                  <HStack spacing={6} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Velocity Gain</FormLabel>
                        <Tooltip label="Proportional gain for velocity control. Affects how aggressively the motor responds to velocity errors.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.vel_gain}
                          onChange={(_, value) => handleConfigChange('vel_gain', value)}
                          min={0}
                          max={1}
                          step={0.01}
                          precision={3}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="60px">A/(rad/s)</Text>
                      </HStack>
                    </FormControl>

                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Velocity Integrator Gain</FormLabel>
                        <Tooltip label="Integral gain for velocity control. Helps eliminate steady-state velocity errors but can cause overshoot.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.vel_integrator_gain}
                          onChange={(_, value) => handleConfigChange('vel_integrator_gain', value)}
                          min={0}
                          max={10}
                          step={0.01}
                          precision={3}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="60px">A/(rad/s)/s</Text>
                      </HStack>
                    </FormControl>
                  </HStack>
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
                          value={controlConfig.vel_limit}
                          onChange={(_, value) => handleConfigChange('vel_limit', value)}
                          min={0.1}
                          max={50}
                          step={0.1}
                          precision={1}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="50px">rad/s</Text>
                      </HStack>
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
                        onChange={(_, value) => handleConfigChange('vel_limit_tolerance', value)}
                        min={1.0}
                        max={2.0}
                        step={0.1}
                        precision={1}
                      >
                        <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <HStack spacing={6} w="100%">
                    <FormControl flex="1">
                      <HStack>
                        <FormLabel color="white" mb={0}>Velocity Ramp Rate</FormLabel>
                        <Tooltip label="Maximum velocity change rate when using velocity ramp input mode.">
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <NumberInput
                          value={controlConfig.vel_ramp_rate}
                          onChange={(_, value) => handleConfigChange('vel_ramp_rate', value)}
                          min={0.1}
                          max={100}
                          step={0.1}
                          precision={1}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="60px">rad/s²</Text>
                      </HStack>
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
                          onChange={(_, value) => handleConfigChange('torque_ramp_rate', value)}
                          min={0.001}
                          max={1}
                          step={0.001}
                          precision={3}
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
                          onChange={(_, value) => handleConfigChange('inertia', value)}
                          min={0}
                          max={1}
                          step={0.001}
                          precision={4}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInputField>
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
                          onChange={(_, value) => handleConfigChange('input_filter_bandwidth', value)}
                          min={0.1}
                          max={100}
                          step={0.1}
                          precision={1}
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="30px">Hz</Text>
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
          <Heading size="md" color="white">Control Configuration Summary</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch">
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
                {controlConfig.vel_limit} rad/s
              </Text>
            </HStack>
            {isPositionControl && (
              <HStack justify="space-between">
                <Text color="gray.300">Position Gain:</Text>
                <Text fontWeight="bold" color="odrive.300">
                  {controlConfig.pos_gain} (rad/s)/rad
                </Text>
              </HStack>
            )}
            <HStack justify="space-between">
              <Text color="gray.300">Velocity Gain:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {controlConfig.vel_gain} A/(rad/s)
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default ControlConfigStep