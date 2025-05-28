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
import { updateMotorConfig } from '../../store/slices/configSlice'
import { MotorType, getMotorTypeName } from '../../utils/odriveEnums'

const MotorConfigStep = () => {
  const dispatch = useDispatch()
  const { motorConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updateMotorConfig({ [field]: value }))
  }

  // Calculate torque constant from Kv
  const calculateKt = () => {
    if (motorConfig.motor_kv && motorConfig.motor_kv > 0) {
      return (60 / (2 * Math.PI * motorConfig.motor_kv)) // Kt = 60/(2π * Kv)
    }
    return 0
  }

  const calculateMaxTorque = () => {
    const kt = calculateKt()
    return kt * motorConfig.current_lim
  }

  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Motor Configuration
        </Heading>
        <Text color="gray.300" mb={6}>
          Configure your motor parameters. Accurate values are essential for proper operation and calibration.
        </Text>
      </Box>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Motor Type & Basic Parameters</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Motor Type</FormLabel>
                  <Tooltip label="High Current motors have low resistance and high current capability. Gimbal motors have high resistance and precise control.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Select
                  value={motorConfig.motor_type}
                  onChange={(e) => handleConfigChange('motor_type', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                >
                  <option value={MotorType.HIGH_CURRENT}>High Current</option>
                  <option value={MotorType.GIMBAL}>Gimbal</option>
                </Select>
              </FormControl>

              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Pole Pairs</FormLabel>
                  <Tooltip label="Number of pole pairs in your motor. Usually found in motor specifications. Common values: 7, 14, 21.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <NumberInput
                  value={motorConfig.pole_pairs}
                  onChange={(_, value) => handleConfigChange('pole_pairs', value)}
                  step={1}
                >
                  <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                </NumberInput>
              </FormControl>
            </HStack>

            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Motor Kv</FormLabel>
                  <Tooltip label="Motor velocity constant in RPM/V. Found in motor specifications or calculated from no-load speed and voltage.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={motorConfig.motor_kv}
                    onChange={(_, value) => handleConfigChange('motor_kv', value)}
                    step={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="50px">RPM/V</Text>
                </HStack>
              </FormControl>

              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Current Limit</FormLabel>
                  <Tooltip label="Maximum continuous current for the motor. Check motor specifications and thermal capacity.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={motorConfig.current_lim}
                    onChange={(_, value) => handleConfigChange('current_lim', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">A</Text>
                </HStack>
              </FormControl>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Calibration Parameters</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={6} w="100%">
              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Calibration Current</FormLabel>
                  <Tooltip label="Current used for motor resistance and inductance calibration. Usually 10-25% of motor rated current.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={motorConfig.calibration_current}
                    onChange={(_, value) => handleConfigChange('calibration_current', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">A</Text>
                </HStack>
              </FormControl>

              <FormControl flex="1">
                <HStack>
                  <FormLabel color="white" mb={0}>Resistance Calib Max Voltage</FormLabel>
                  <Tooltip label="Maximum voltage applied during resistance calibration. Should be safely below your power supply voltage.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <HStack>
                  <NumberInput
                    value={motorConfig.resistance_calib_max_voltage}
                    onChange={(_, value) => handleConfigChange('resistance_calib_max_voltage', value)}
                    step={0.1}
                    precision={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px">V</Text>
                </HStack>
              </FormControl>
            </HStack>

            <FormControl>
              <HStack>
                <FormLabel color="white" mb={0}>Lock-in Spin Current</FormLabel>
                <Tooltip label="Current used during encoder offset calibration when the motor is spun slowly. Should be enough to overcome friction.">
                  <Icon as={InfoIcon} color="gray.400" />
                </Tooltip>
              </HStack>
              <HStack>
                <NumberInput
                  value={motorConfig.lock_in_spin_current}
                  onChange={(_, value) => handleConfigChange('lock_in_spin_current', value)}
                  step={0.1}
                  precision={1}
                >
                  <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                </NumberInput>
                <Text color="gray.300" minW="20px">A</Text>
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {motorConfig.motor_type === MotorType.GIMBAL && (
        <Card bg="orange.900" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Gimbal Motor Parameters</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="info" mb={4}>
              <AlertIcon />
              Gimbal motors require manual phase resistance configuration. These values will be auto-detected during calibration.
            </Alert>
            <VStack spacing={4}>
              <HStack spacing={6} w="100%">
                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>Phase Resistance</FormLabel>
                    <Tooltip label="Resistance of motor windings. Will be automatically measured during calibration.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={motorConfig.phase_resistance}
                      onChange={(_, value) => handleConfigChange('phase_resistance', value)}
                      step={0.01}
                      precision={3}
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="20px">Ω</Text>
                  </HStack>
                </FormControl>

                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>Phase Inductance</FormLabel>
                    <Tooltip label="Inductance of motor windings. Will be automatically measured during calibration.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={motorConfig.phase_inductance}
                      onChange={(_, value) => handleConfigChange('phase_inductance', value)}
                      step={0.000001}
                      precision={6}
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="20px">H</Text>
                  </HStack>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      <Card bg="gray.700" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Motor Summary & Calculations</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text color="gray.300">Motor Type:</Text>
              <Text fontWeight="bold" color="white">
                {getMotorTypeName(motorConfig.motor_type)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Pole Pairs:</Text>
              <Text fontWeight="bold" color="white">{motorConfig.pole_pairs}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Motor Kv:</Text>
              <Text fontWeight="bold" color="white">{motorConfig.motor_kv} RPM/V</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Calculated Kt:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {calculateKt().toFixed(4)} Nm/A
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Current Limit:</Text>
              <Text fontWeight="bold" color="odrive.300">{motorConfig.current_lim} A</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Max Torque:</Text>
              <Text fontWeight="bold" color="odrive.300">
                {calculateMaxTorque().toFixed(3)} Nm
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default MotorConfigStep