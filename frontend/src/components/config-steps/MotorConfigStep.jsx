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

  Badge,
  Switch
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import { ODrivePropertyMappings as configurationMappings } from '../../utils/odriveUnifiedRegistry'

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
  const calculatedKt = 8.27 / (motorConfig.motor_kv || 0) // Kt = 8.27 / Kv
  const maxTorque = calculatedKt * (motorConfig.current_lim || 0)

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Motor Type & Parameters</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <HStack spacing={4} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Motor Type</FormLabel>
                  <ParameterSelect
                    value={motorConfig.motor_type ?? ""}
                    onChange={e => handleConfigChange('motor_type', parseInt(e.target.value))}
                    onRefresh={() => handleRefresh('motor_type')}
                    isLoading={isLoading('motor_type')}
                    placeholder="Select Motor Type"
                  >
                    <option value={0}>High Current</option>
                    <option value={1}>Gimbal</option>
                  </ParameterSelect>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Pole Pairs</FormLabel>
                  <ParameterInput
                    value={motorConfig.pole_pairs}
                    onChange={(value) => handleConfigChange('pole_pairs', parseInt(value) || 0)}
                    onRefresh={() => handleRefresh('pole_pairs')}
                    isLoading={isLoading('pole_pairs')}
                    precision={0}
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
                    precision={1}
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
                    precision={1}
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
                    precision={1}
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
                    precision={1}
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
                    precision={1}
                  />
                </FormControl>


                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Phase Resistance</FormLabel>
                  <ParameterInput
                    value={motorConfig.phase_resistance}
                    onChange={(value) => handleConfigChange('phase_resistance', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('phase_resistance')}
                    isLoading={isLoading('phase_resistance')}
                    unit="Ω"
                    precision={6}
                  />
                </FormControl>

              </HStack>
            </VStack>
          </CardBody>
          <CardHeader py={2}>
            <Heading size="sm" color="white">Motor Thermistor</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack spacing={2} mb={1}>
                  <Switch
                    isChecked={motorConfig.motor_thermistor_enabled || false}
                    onChange={(e) => handleConfigChange('motor_thermistor_enabled', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                  <FormLabel color="white" mb={0} fontSize="sm">Enable Motor Thermistor</FormLabel>
                  <Tooltip label="Enable external motor thermistor monitoring for temperature protection.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
              </FormControl>

              {motorConfig.motor_thermistor_enabled && (
                <>
                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="sm">GPIO Pin</FormLabel>
                    <ParameterInput
                      value={motorConfig.motor_thermistor_gpio_pin}
                      onChange={(value) => handleConfigChange('motor_thermistor_gpio_pin', parseInt(value) || 0)}
                      onRefresh={() => handleRefresh('motor_thermistor_gpio_pin')}
                      isLoading={isLoading('motor_thermistor_gpio_pin')}
                      precision={0}
                      placeholder="GPIO Pin (3-8)"
                    />
                  </FormControl>

                  <HStack spacing={4} w="100%">
                    <FormControl flex="1">
                      <FormLabel color="white" mb={1} fontSize="sm">Lower Temp Limit</FormLabel>
                      <ParameterInput
                        value={motorConfig.motor_temp_limit_lower}
                        onChange={(value) => handleConfigChange('motor_temp_limit_lower', parseFloat(value) || 0)}
                        onRefresh={() => handleRefresh('motor_temp_limit_lower')}
                        isLoading={isLoading('motor_temp_limit_lower')}
                        unit="°C"
                        precision={1}
                      />
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel color="white" mb={1} fontSize="sm">Upper Temp Limit</FormLabel>
                      <ParameterInput
                        value={motorConfig.motor_temp_limit_upper}
                        onChange={(value) => handleConfigChange('motor_temp_limit_upper', parseFloat(value) || 0)}
                        onRefresh={() => handleRefresh('motor_temp_limit_upper')}
                        isLoading={isLoading('motor_temp_limit_upper')}
                        unit="°C"
                        precision={1}
                      />
                    </FormControl>
                  </HStack>
                </>
              )}
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

        {/* Motor Thermistor Configuration */}
        <Card bg="gray.800" variant="elevated">

        </Card>
      </VStack>
    </Box>
  )
}

export default MotorConfigStep