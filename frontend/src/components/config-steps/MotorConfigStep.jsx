import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Select,
  Icon,
  Tooltip,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { useSelector, useDispatch } from 'react-redux'
import { updateMotorConfig } from '../../store/slices/configSlice'

const MotorConfigStep = () => {
  const dispatch = useDispatch()
  const { motorConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updateMotorConfig({ [field]: value }))
  }

  // Calculate derived values
  const calculatedKt = 8.27 / (motorConfig.motor_kv || 230)
  const maxTorque = calculatedKt * (motorConfig.current_lim || 10)

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} h="100%" p={4} overflow="auto">
      {/* Left Column */}
      <VStack spacing={3} align="stretch">
        <Box>
          <Heading size="md" color="white" mb={1}>
            Motor Configuration
          </Heading>
          <Text color="gray.300" fontSize="sm">
            Configure motor parameters and current limits.
          </Text>
        </Box>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Motor Type & Parameters</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Motor Type</FormLabel>
                  <Select
                    value={motorConfig.motor_type}
                    onChange={(e) => handleConfigChange('motor_type', parseInt(e.target.value))}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    size="sm"
                  >
                    <option value={0}>High Current</option>
                    <option value={1}>Gimbal</option>
                  </Select>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Pole Pairs</FormLabel>
                  <NumberInput
                    value={motorConfig.pole_pairs}
                    onChange={(value) => handleConfigChange('pole_pairs', parseInt(value) || 0)}
                    step={1}
                    size="sm"
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Motor Kv</FormLabel>
                  <HStack>
                    <NumberInput
                      value={motorConfig.motor_kv}
                      onChange={(value) => handleConfigChange('motor_kv', parseFloat(value) || 0)}
                      step={10}
                      precision={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="60px" fontSize="sm">RPM/V</Text>
                  </HStack>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Current Limit</FormLabel>
                  <HStack>
                    <NumberInput
                      value={motorConfig.current_lim}
                      onChange={(value) => handleConfigChange('current_lim', parseFloat(value) || 0)}
                      step={1}
                      precision={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="20px" fontSize="sm">A</Text>
                  </HStack>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Calibration Settings</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Calibration Current</FormLabel>
                  <HStack>
                    <NumberInput
                      value={motorConfig.calibration_current}
                      onChange={(value) => handleConfigChange('calibration_current', parseFloat(value) || 0)}
                      step={1}
                      precision={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="20px" fontSize="sm">A</Text>
                  </HStack>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Calib. Voltage</FormLabel>
                  <HStack>
                    <NumberInput
                      value={motorConfig.resistance_calib_max_voltage}
                      onChange={(value) => handleConfigChange('resistance_calib_max_voltage', parseFloat(value) || 0)}
                      step={0.5}
                      precision={1}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="20px" fontSize="sm">V</Text>
                  </HStack>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color="white" mb={1} fontSize="sm">Lock-in Spin Current</FormLabel>
                <HStack>
                  <NumberInput
                    value={motorConfig.lock_in_spin_current}
                    onChange={(value) => handleConfigChange('lock_in_spin_current', parseFloat(value) || 0)}
                    step={1}
                    precision={1}
                    size="sm"
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="20px" fontSize="sm">A</Text>
                </HStack>
              </FormControl>

              {motorConfig.motor_type === 1 && (
                <FormControl>
                  <HStack>
                    <FormLabel color="white" mb={1} fontSize="sm">Phase Resistance</FormLabel>
                    <Tooltip label="Only for gimbal motors. Leave 0 for auto-detection.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={motorConfig.phase_resistance}
                      onChange={(value) => handleConfigChange('phase_resistance', parseFloat(value) || 0)}
                      step={0.001}
                      precision={6}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="20px" fontSize="sm">Ω</Text>
                  </HStack>
                </FormControl>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Right Column */}
      <VStack spacing={3} align="stretch">
        <Card bg="green.900" variant="elevated" borderColor="green.500" borderWidth="1px">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Calculated Values</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Torque Constant (Kt):</Text>
                <Text fontWeight="bold" color="green.300" fontSize="sm">
                  {calculatedKt.toFixed(4)} Nm/A
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Max Torque:</Text>
                <Text fontWeight="bold" color="green.300" fontSize="sm">
                  {maxTorque.toFixed(2)} Nm
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Motor Type:</Text>
                <Badge colorScheme={motorConfig.motor_type === 0 ? "blue" : "purple"} fontSize="xs">
                  {motorConfig.motor_type === 0 ? "High Current" : "Gimbal"}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="gray.700" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Configuration Summary</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Pole Pairs:</Text>
                <Text fontWeight="bold" color="white" fontSize="sm">
                  {motorConfig.pole_pairs}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Motor Kv:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {motorConfig.motor_kv} RPM/V
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Current Limit:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {motorConfig.current_lim}A
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Calibration Current:</Text>
                <Text fontWeight="bold" color="yellow.300" fontSize="sm">
                  {motorConfig.calibration_current}A
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="blue.900" variant="elevated" borderColor="blue.500" borderWidth="1px">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Motor Guidelines</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="start">
              <Text fontSize="sm" color="blue.100">
                <strong>High Current:</strong> For most BLDC motors and high-power applications
              </Text>
              <Text fontSize="sm" color="blue.100">
                <strong>Gimbal:</strong> For low-current, high-precision gimbal motors
              </Text>
              <Text fontSize="sm" color="blue.100">
                <strong>Pole Pairs:</strong> Number of magnet pole pairs (typically 7-14)
              </Text>
              <Text fontSize="sm" color="yellow.300">
                <strong>Check motor datasheet for exact specifications</strong>
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Alert status="info" py={2}>
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="sm">ODrive v0.5.6 Motor Requirements:</Text>
            <Text fontSize="xs">• 3-phase BLDC or PMSM motors</Text>
            <Text fontSize="xs">• Resistance: 0.01Ω - 10Ω per phase</Text>
            <Text fontSize="xs">• Inductance: 1µH - 10mH per phase</Text>
          </VStack>
        </Alert>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Common Motor Types</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.300">Hobby Motors:</Text>
                <Text fontSize="sm" color="white">230-1000 Kv</Text>
              </HStack>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.300">Industrial:</Text>
                <Text fontSize="sm" color="white">50-500 Kv</Text>
              </HStack>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.300">Gimbal:</Text>
                <Text fontSize="sm" color="white">10-100 Kv</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </SimpleGrid>
  )
}

export default MotorConfigStep