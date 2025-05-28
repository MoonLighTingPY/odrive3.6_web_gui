import { useState, useMemo } from 'react'
import {
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Box,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { InfoIcon, WarningIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { getAxisStateName } from '../../utils/odriveEnums'

const StatusOverview = ({ odriveState }) => {
  const systemStatus = useMemo(() => {
    if (!odriveState || Object.keys(odriveState).length === 0) {
      return {
        overall: 'disconnected',
        vbusVoltage: 0,
        axisState: 0,
        errors: [],
        warnings: []
      }
    }

    const errors = []
    const warnings = []
    
    // Check for errors
    if (odriveState.axis0?.error && odriveState.axis0.error !== 0) {
      errors.push({ type: 'Axis Error', code: odriveState.axis0.error, path: 'axis0.error' })
    }
    if (odriveState.axis0?.motor?.error && odriveState.axis0.motor.error !== 0) {
      errors.push({ type: 'Motor Error', code: odriveState.axis0.motor.error, path: 'axis0.motor.error' })
    }
    if (odriveState.axis0?.encoder?.error && odriveState.axis0.encoder.error !== 0) {
      errors.push({ type: 'Encoder Error', code: odriveState.axis0.encoder.error, path: 'axis0.encoder.error' })
    }
    if (odriveState.axis0?.controller?.error && odriveState.axis0.controller.error !== 0) {
      errors.push({ type: 'Controller Error', code: odriveState.axis0.controller.error, path: 'axis0.controller.error' })
    }
    if (odriveState.axis0?.sensorless_estimator?.error && odriveState.axis0.sensorless_estimator.error !== 0) {
      errors.push({ type: 'Sensorless Error', code: odriveState.axis0.sensorless_estimator.error, path: 'axis0.sensorless_estimator.error' })
    }

    // Check for warnings
    const vbus = odriveState.vbus_voltage || 0
    if (vbus > 0 && vbus < 12) {
      warnings.push({ type: 'Low Voltage', message: `Vbus voltage is ${vbus.toFixed(1)}V` })
    }
    if (vbus > 56) {
      warnings.push({ type: 'High Voltage', message: `Vbus voltage is ${vbus.toFixed(1)}V` })
    }

    const motorTemp = odriveState.axis0?.motor?.motor_thermistor?.temperature || 0
    if (motorTemp > 80) {
      warnings.push({ type: 'High Motor Temperature', message: `Motor temperature is ${motorTemp.toFixed(1)}°C` })
    }

    const fetTemp = odriveState.axis0?.motor?.fet_thermistor?.temperature || 0
    if (fetTemp > 80) {
      warnings.push({ type: 'High FET Temperature', message: `FET temperature is ${fetTemp.toFixed(1)}°C` })
    }

    let overall = 'good'
    if (errors.length > 0) overall = 'error'
    else if (warnings.length > 0) overall = 'warning'

    return {
      overall,
      vbusVoltage: vbus,
      axisState: odriveState.axis0?.current_state || 0,
      errors,
      warnings
    }
  }, [odriveState])

  const getOverallStatusColor = (status) => {
    switch (status) {
      case 'good': return 'green'
      case 'warning': return 'yellow'
      case 'error': return 'red'
      case 'disconnected': return 'gray'
      default: return 'gray'
    }
  }

  const getOverallStatusIcon = (status) => {
    switch (status) {
      case 'good': return CheckCircleIcon
      case 'warning': return WarningIcon
      case 'error': return WarningIcon
      case 'disconnected': return InfoIcon
      default: return InfoIcon
    }
  }

  const getAxisStateColor = (state) => {
    if (state === 8) return 'green' // CLOSED_LOOP_CONTROL
    if (state === 1) return 'blue' // IDLE
    if (state >= 2 && state <= 7) return 'yellow' // Calibration states
    return 'red' // Error or undefined
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Overall Status */}
      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="white">System Status</Heading>
            <HStack>
              <Icon as={getOverallStatusIcon(systemStatus.overall)} color={`${getOverallStatusColor(systemStatus.overall)}.300`} />
              <Badge colorScheme={getOverallStatusColor(systemStatus.overall)} variant="solid">
                {systemStatus.overall.toUpperCase()}
              </Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={2} spacing={4}>
            <Stat>
              <StatLabel color="gray.300">Vbus Voltage</StatLabel>
              <StatNumber color="white" fontSize="lg">
                {systemStatus.vbusVoltage.toFixed(1)} V
              </StatNumber>
              <StatHelpText color="gray.400">
                DC Bus Voltage
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color="gray.300">Axis State</StatLabel>
              <HStack>
                <Badge colorScheme={getAxisStateColor(systemStatus.axisState)} variant="solid">
                  {systemStatus.axisState}
                </Badge>
                <Text color="white" fontSize="sm">
                  {getAxisStateName(systemStatus.axisState)}
                </Text>
              </HStack>
              <StatHelpText color="gray.400">
                Current Operation Mode
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Errors */}
      {systemStatus.errors.length > 0 && (
        <Card bg="red.900" variant="elevated" borderColor="red.500" borderWidth="1px">
          <CardHeader>
            <Heading size="md" color="red.200">
              Active Errors ({systemStatus.errors.length})
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={2} align="stretch">
              {systemStatus.errors.map((error, index) => (
                <Alert key={index} status="error" variant="left-accent" bg="red.800">
                  <AlertIcon />
                  <VStack align="start" spacing={0} flex="1">
                    <Text fontWeight="bold" color="red.200">
                      {error.type}
                    </Text>
                    <Text fontSize="sm" color="red.300" fontFamily="mono">
                      Error Code: 0x{error.code.toString(16).toUpperCase()}
                    </Text>
                    <Text fontSize="xs" color="red.400">
                      Path: {error.path}
                    </Text>
                  </VStack>
                </Alert>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Warnings */}
      {systemStatus.warnings.length > 0 && (
        <Card bg="yellow.900" variant="elevated" borderColor="yellow.500" borderWidth="1px">
          <CardHeader>
            <Heading size="md" color="yellow.200">
              Warnings ({systemStatus.warnings.length})
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={2} align="stretch">
              {systemStatus.warnings.map((warning, index) => (
                <Alert key={index} status="warning" variant="left-accent" bg="yellow.800">
                  <AlertIcon />
                  <VStack align="start" spacing={0} flex="1">
                    <Text fontWeight="bold" color="yellow.200">
                      {warning.type}
                    </Text>
                    <Text fontSize="sm" color="yellow.300">
                      {warning.message}
                    </Text>
                  </VStack>
                </Alert>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* System Information */}
      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Device Information</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text color="gray.300">Hardware Version:</Text>
              <Text color="white" fontFamily="mono">
                {odriveState.hw_version_major || 0}.{odriveState.hw_version_minor || 0}.{odriveState.hw_version_variant || 0}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Firmware Version:</Text>
              <Text color="white" fontFamily="mono">
                {odriveState.fw_version_major || 0}.{odriveState.fw_version_minor || 0}.{odriveState.fw_version_revision || 0}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">Serial Number:</Text>
              <Text color="white" fontFamily="mono">
                {odriveState.serial_number || 'Unknown'}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.300">User Config Loaded:</Text>
              <Badge colorScheme={odriveState.user_config_loaded ? 'green' : 'yellow'}>
                {odriveState.user_config_loaded ? 'Yes' : 'No'}
              </Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default StatusOverview