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
  Select,
  Icon,
  Tooltip,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { configurationMappings } from '../../utils/odriveCommands'

const MotorConfigStep = ({ 
  deviceConfig, 
  onReadParameter, 
  onUpdateConfig,
  loadingParams, 
}) => {
  const motorConfig = deviceConfig.motor || {}
  const motorMappings = configurationMappings.motor

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('motor', configKey, value)
  }

  const handleRefresh = (configKey) => {
    const odriveParam = motorMappings[configKey]
    if (odriveParam) {
      onReadParameter(odriveParam, 'motor', configKey)
    }
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`motor.${configKey}`)
  }

  // Calculate derived values
  const calculatedKt = 8.27 / (motorConfig.motor_kv || 230)
  const maxTorque = calculatedKt * (motorConfig.current_lim || 10)

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} h="100%" p={4} overflow="auto">
      {/* Left Column */}
      <VStack spacing={3} align="stretch">

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
                    value={motorConfig.motor_type || 0}
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
                  <ParameterInput
                    value={motorConfig.pole_pairs}
                    onChange={(value) => handleConfigChange('pole_pairs', parseInt(value) || 0)}
                    onRefresh={() => handleRefresh('pole_pairs')}
                    isLoading={isLoading('pole_pairs')}
                    step={1}
                    precision={0}
                    min={1}
                    max={50}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Motor Kv</FormLabel>
                  <ParameterInput
                    value={motorConfig.motor_kv}
                    onChange={(value) => handleConfigChange('motor_kv', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('motor_kv')}
                    isLoading={isLoading('motor_kv')}
                    unit="RPM/V"
                    step={10}
                    precision={1}
                    min={1}
                    max={10000}
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Current Limit</FormLabel>
                  <ParameterInput
                    value={motorConfig.current_lim}
                    onChange={(value) => handleConfigChange('current_lim', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('current_lim')}
                    isLoading={isLoading('current_lim')}
                    unit="A"
                    step={1}
                    precision={1}
                    min={0}
                    max={100}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Calibration Current</FormLabel>
                  <ParameterInput
                    value={motorConfig.calibration_current}
                    onChange={(value) => handleConfigChange('calibration_current', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('calibration_current')}
                    isLoading={isLoading('calibration_current')}
                    unit="A"
                    step={1}
                    precision={1}
                    min={0}
                    max={100}
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Calib. Voltage</FormLabel>
                  <ParameterInput
                    value={motorConfig.resistance_calib_max_voltage}
                    onChange={(value) => handleConfigChange('resistance_calib_max_voltage', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('resistance_calib_max_voltage')}
                    isLoading={isLoading('resistance_calib_max_voltage')}
                    unit="V"
                    step={0.5}
                    precision={1}
                    min={0}
                    max={12}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Lock-in Spin Current</FormLabel>
                  <ParameterInput
                    value={motorConfig.lock_in_spin_current}
                    onChange={(value) => handleConfigChange('lock_in_spin_current', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('lock_in_spin_current')}
                    isLoading={isLoading('lock_in_spin_current')}
                    unit="A"
                    step={1}
                    precision={1}
                    min={0}
                    max={50}
                  />
                </FormControl>

                {motorConfig.motor_type === 1 && (
                  <FormControl flex="1">
                    <FormLabel color="white" mb={1} fontSize="sm">Phase Resistance</FormLabel>
                    <ParameterInput
                      value={motorConfig.phase_resistance}
                      onChange={(value) => handleConfigChange('phase_resistance', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('phase_resistance')}
                      isLoading={isLoading('phase_resistance')}
                      unit="Ω"
                      step={0.001}
                      precision={6}
                      min={0}
                      max={10}
                    />
                  </FormControl>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        <Card bg="gray.800" variant="elevated">
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
      </VStack>

      {/* Right Column - Calculated Values */}
      <VStack spacing={3} align="stretch">


      </VStack>
    </SimpleGrid>
  )
}

export default MotorConfigStep