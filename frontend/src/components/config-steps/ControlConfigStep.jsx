import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Select,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tooltip,
  Icon,
  Alert,
  AlertIcon,
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
  const isTrapTrajMode = controlConfig.input_mode === InputMode.TRAP_TRAJ
  const isVelRampMode = controlConfig.input_mode === InputMode.VEL_RAMP

  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Control Configuration
        </Heading>
        <Text color="gray.300" mb={6}>
          Configure the control modes and tuning parameters for your motor control system.
        </Text>
      </Box>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Control & Input Modes</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Control Mode</FormLabel>
                  <Tooltip label="Primary control mode: Voltage (open-loop), Current, Velocity, or Position control.">
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
                  <option value={ControlMode.CURRENT_CONTROL}>Current Control</option>
                  <option value={ControlMode.VELOCITY_CONTROL}>Velocity Control</option>
                  <option value={ControlMode.POSITION_CONTROL}>Position Control</option>
                </Select>
              </FormControl>

              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Input Mode</FormLabel>
                  <Tooltip label="How input commands are processed: Direct passthrough, ramped, filtered, or trajectory planned.">
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
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <HStack>
                <FormLabel color="white" mb={0}>Velocity Limit</FormLabel>
                <Tooltip label="Maximum velocity limit for the controller in counts/s or rad/s depending on units.">
                  <Icon as={InfoIcon} color="gray.400" />
                </Tooltip>
              </HStack>
              <HStack>
                <NumberInput
                  value={controlConfig.vel_limit}
                  onChange={(_, value) => handleConfigChange('vel_limit', value)}
                  min={0.1}
                  max={1000}
                  step={0.1}
                  precision={1}
                >
                  <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                </NumberInput>
                <Text color="gray.300" minW="80px">counts/s</Text>
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {(isPositionControl || isVelocityControl) && (
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Controller Tuning</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="info" mb={4}>
              <AlertIcon />
              These gains determine the responsiveness and stability of your control system. Start with conservative values and tune incrementally.
            </Alert>
            <VStack spacing={4}>
              {isPositionControl && (
                <FormControl>
                  <HStack>
                    <FormLabel color="white" mb={0}>Position Gain</FormLabel>
                    <Tooltip label="Proportional gain for position control. Higher values give faster response but may cause oscillation.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={controlConfig.pos_gain}
                      onChange={(_, value) => handleConfigChange('pos_gain', value)}
                      min={0.1}
                      max={200}
                      step={0.1}
                      precision={1}
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="80px">(A/count)/s</Text>
                  </HStack>
                </FormControl>
              )}

              <HStack spacing={6} w="100%">
                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>Velocity Gain</FormLabel>
                    <Tooltip label="Proportional gain for velocity control. Adjust for desired stiffness and response.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={controlConfig.vel_gain}
                      onChange={(_, value) => handleConfigChange('vel_gain', value)}
                      min={0.001}
                      max={10}
                      step={0.001}
                      precision={4}
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="80px">A/(count/s)</Text>
                  </HStack>
                </FormControl>

                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>Velocity Integrator Gain</FormLabel>
                    <Tooltip label="Integral gain for velocity control. Helps eliminate steady-state error but can cause instability if too high.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={controlConfig.vel_integrator_gain}
                      onChange={(_, value) => handleConfigChange('vel_integrator_gain', value)}
                      min={0}
                      max={10}
                      step={0.001}
                      precision={4}
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="80px">A/((count/s)*s)</Text>
                  </HStack>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {isVelRampMode && (
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Velocity Ramp Settings</Heading>
          </CardHeader>
          <CardBody>
            <FormControl>
              <HStack>
                <FormLabel color="white" mb={0}>Velocity Ramp Rate</FormLabel>
                <Tooltip label="Maximum acceleration/deceleration rate when ramping to target velocity.">
                  <Icon as={InfoIcon} color="gray.400" />
                </Tooltip>
              </HStack>
              <HStack>
                <NumberInput
                  value={controlConfig.vel_ramp_rate}
                  onChange={(_, value) => handleConfigChange('vel_ramp_rate', value)}
                  min={100}
                  max={50000}
                  step={100}
                >
                  <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                </NumberInput>
                <Text color="gray.300" minW="80px">counts/s²</Text>
              </HStack>
            </FormControl>
          </CardBody>
        </Card>
      )}

      {isTrapTrajMode && (
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Trapezoidal Trajectory Settings</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="info" mb={4}>
              <AlertIcon />
              Trapezoidal trajectory provides smooth, planned motion with configurable acceleration and velocity limits.
            </Alert>
            <VStack spacing={4}>
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>Trajectory Velocity Limit</FormLabel>
                  <Tooltip label="Maximum velocity during trajectory execution. Should be ≤ controller vel_limit.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={controlConfig.traj_vel_limit}
                    onChange={(_, value) => handleConfigChange('traj_vel_limit', value)}
                    min={0.1}
                    max={controlConfig.vel_limit}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="80px">counts/s</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>Trajectory Acceleration Limit</FormLabel>
                  <Tooltip label="Maximum acceleration during trajectory execution.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={controlConfig.traj_accel_limit}
                    onChange={(_, value) => handleConfigChange('traj_accel_limit', value)}
                    min={100}
                    max={50000}
                    step={100}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="80px">counts/s²</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>Trajectory Deceleration Limit</FormLabel>
                  <Tooltip label="Maximum deceleration during trajectory execution.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={controlConfig.traj_decel_limit}
                    onChange={(_, value) => handleConfigChange('traj_decel_limit', value)}
                    min={100}
                    max={50000}
                    step={100}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="80px">counts/s²</Text>
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )}

      <Card bg="gray.700" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Control Summary</Heading>
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
              <Text color="gray.300">Velocity Limit:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {controlConfig.vel_limit} counts/s
              </Text>
            </HStack>
            {isPositionControl && (
              <HStack justify="space-between">
                <Text color="gray.300">Position Gain:</Text>
                <Text fontWeight="bold" color="odrive.300">
                  {controlConfig.pos_gain}
                </Text>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default ControlConfigStep