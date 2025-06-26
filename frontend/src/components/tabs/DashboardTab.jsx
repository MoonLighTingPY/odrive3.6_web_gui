import { useState, memo } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Progress,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Alert,
  AlertIcon,
  Divider,
  Tooltip,
  Icon,
  useDisclosure,
} from '@chakra-ui/react'
import { InfoIcon, WarningIcon } from '@chakra-ui/icons'
import { getAxisStateName } from '../../utils/odriveEnums'
import { getErrorDescription, isErrorCritical } from '../../utils/odriveErrors'
import ErrorTroubleshooting from "../modals/ErrorTroubleshootingModal"
import '../../styles/DashboardTab.css'

import MotorControls from '../MotorControls'

// Memoized components for expensive renders
const TelemetryDisplay = memo(({ label, value, unit, color = "white" }) => (
  <Stat textAlign="center">
    <StatLabel color="gray.300">{label}</StatLabel>
    <StatNumber color={color} fontSize="2xl">
      <Box display="inline-block" minWidth="80px" textAlign="right">
        {typeof value === 'number' ? value.toFixed(2) : value}
      </Box> {unit}
    </StatNumber>
  </Stat>
))

const VoltageProgress = memo(({ voltage }) => (
  <Box w="100%">
    <HStack justify="space-between" mb={2}>
      <Text color="gray.300">DC Bus Voltage</Text>
      <Text fontWeight="bold" color="white">{(voltage ?? 0).toFixed(1)} V</Text>
    </HStack>
    <Progress 
      value={((voltage ?? 0) / 56) * 100} 
      colorScheme={voltage > 50 ? "red" : voltage > 40 ? "yellow" : "green"}
      size="sm"
    />
  </Box>
))

const TemperatureDisplay = memo(({ temp, label, maxTemp = 100 }) => (
  <Box w="100%">
    <HStack justify="space-between" mb={2}>
      <Text color="gray.300">{label}</Text>
      <Text fontWeight="bold" color={(temp ?? 0) > 80 ? "red.300" : "white"}>
        {(temp ?? 0).toFixed(1)} °C
      </Text>
    </HStack>
    <Progress 
      value={((temp ?? 0) / maxTemp) * 100} 
      colorScheme={(temp ?? 0) > 80 ? "red" : (temp ?? 0) > 60 ? "yellow" : "green"}
      size="sm"
    />
  </Box>
))

const DashboardTab = memo(() => {
  // Use telemetry slice for high-frequency data
  const telemetry = useSelector(state => state.telemetry)
  const { connectedDevice, odriveState } = useSelector(state => state.device)
  
  const [selectedError, setSelectedError] = useState({ code: null, type: null })
  const { isOpen: isTroubleshootingOpen, onOpen: onTroubleshootingOpen, onClose: onTroubleshootingClose } = useDisclosure()

  // Use telemetry data for real-time values
  const {
    vbus_voltage: vbusVoltage,
    motor_current: motorCurrent,
    encoder_pos: encoderPos,
    encoder_vel: encoderVel,
    motor_temp: motorTemp,
    fet_temp: fetTemp,
    axis_state: axisState,
    connectionHealth
  } = telemetry

  // Get axis0 data from odriveState for error checking
  const axis0Data = odriveState.device?.axis0

  // Helper function to get current error codes from both sources
  const getCurrentErrors = () => {
    return {
      axis_error: telemetry?.axis_error || axis0Data?.error || 0,
      motor_error: telemetry?.motor_error || axis0Data?.motor?.error || 0,
      encoder_error: telemetry?.encoder_error || axis0Data?.encoder?.error || 0,
      controller_error: telemetry?.controller_error || axis0Data?.controller?.error || 0,
      sensorless_error: telemetry?.sensorless_error || axis0Data?.sensorless_estimator?.error || 0,
    }
  }

  const currentErrors = getCurrentErrors()
  const hasAnyErrors = Object.values(currentErrors).some(error => error !== 0)


  // Fallback to device state for other data
  const getSystemData = (odriveState) => {
    const device = odriveState.device
    if (!device) {
      return {
        fw_version_major: 0,
        fw_version_minor: 5,
        fw_version_revision: 6,
        hw_version_major: 3,
        hw_version_minor: 6,
        serial_number: 'Unknown'
      }
    }
    
    return {
      fw_version_major: device.fw_version_major || 0,
      fw_version_minor: device.fw_version_minor || 5,
      fw_version_revision: device.fw_version_revision || 6,
      hw_version_major: device.hw_version_major || 3,
      hw_version_minor: device.hw_version_minor || 6,
      serial_number: device.serial_number || 'Unknown'
    }
  }

  const systemData = getSystemData(odriveState)

  const getStateColor = (state) => {
    if (state === 8) return 'green' // CLOSED_LOOP_CONTROL
    if (state === 1) return 'blue' // IDLE
    if (state >= 2 && state <= 7) return 'yellow' // Calibration states
    return 'red' // Error or undefined
  }

  // Helper function to open troubleshooting modal
  const handleErrorClick = (errorCode, errorType) => {
    setSelectedError({ code: errorCode, type: errorType })
    onTroubleshootingOpen()
  }

  // Helper function to render error cards with clickable elements
  const renderErrorCard = (title, errorCode, errorType, color = 'red') => {
    if (!errorCode || errorCode === 0) return null

    const description = getErrorDescription(errorCode, errorType)
    const isCritical = isErrorCritical(errorCode, errorType)

    return (
      <Alert status={isCritical ? "error" : "warning"} variant="left-accent">
        <AlertIcon />
        <Box flex="1">
          <HStack justify="space-between" mb={1}>
            <Text fontWeight="bold" fontSize="sm">
              {title} 
            </Text>
            <HStack>
              <Badge 
                colorScheme={color} 
                fontSize="xs"
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
                onClick={() => handleErrorClick(errorCode, errorType)}
              >
                0x{errorCode.toString(16).toUpperCase()}
              </Badge>
              {isCritical && (
                <Tooltip label="Critical error - immediate attention required">
                  <Icon as={WarningIcon} color="red.500" boxSize={3} />
                </Tooltip>
              )}
            </HStack>
          </HStack>
          <Text fontSize="xs" color="gray.0" mb={1}>
            {description}
          </Text>
        </Box>
      </Alert>
    )
  }

  // Helper function to format serial numbers
  const formatSerial = (serial) => {
    if (!serial) return 'Unknown'
    if (typeof serial === 'number') return serial.toString(16).toUpperCase()
    return serial
  }

  return (
    <Box p={4} h="100%" maxW="1400px" mx="auto" overflow="hidden">
      <VStack spacing={4} align="stretch" h="100%">
        
        {/* Connection Health Indicator */}
        {!connectionHealth && (
          <Alert status="warning" flexShrink={0}>
            <AlertIcon />
            Telemetry connection degraded - some data may be outdated
          </Alert>
        )}

        {/* Scrollable Content Area */}
        <Box flex="1" overflow="auto">
          <VStack spacing={6} align="stretch">
            
            {/* Device Info */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color="white">Device Status</Heading>
                  <Badge colorScheme={getStateColor(axisState ?? 0)} variant="solid" fontSize="sm" px={3} py={1}>
                    {getAxisStateName(axisState ?? 0)}
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Stat>
                    <StatLabel color="gray.300">Device</StatLabel>
                    <StatNumber color="white" fontSize="md">
                      {connectedDevice?.path || 'ODrive'}
                    </StatNumber>
                    <StatHelpText color="gray.400">
                      Serial: {connectedDevice?.serial || 'Unknown'}
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.300">Firmware</StatLabel>
                    <StatNumber color="white" fontSize="md">
                      v{systemData?.fw_version_major || 0}.{systemData?.fw_version_minor}.{systemData?.fw_version_revision}
                    </StatNumber>
                    <StatHelpText color="gray.400">
                      HW: v{systemData?.hw_version_major}.{systemData?.hw_version_minor}
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.300">Serial Number</StatLabel>
                    <StatNumber color="white" fontSize="md">
                      {formatSerial(
                        systemData?.serial_number && systemData?.serial_number !== 'Unknown'
                          ? systemData.serial_number
                          : connectedDevice?.serial
                      )}
                    </StatNumber>
                    <StatHelpText color="gray.400">
                      VBus: {(vbusVoltage ?? 0).toFixed(1)} V
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.300">Axis State</StatLabel>
                    <StatNumber color="white" fontSize="md">
                      {axisState ?? 0}
                    </StatNumber>
                    <StatHelpText color="gray.400">
                      {getAxisStateName(axisState ?? 0)}
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Error Status Section */}
            {hasAnyErrors && (
              <Card bg="red.900" variant="elevated">
                <CardHeader>
                  <HStack>
                    <Icon as={WarningIcon} color="red.300" />
                    <Heading size="md" color="red.300">System Errors - Click for Help</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {currentErrors.axis_error !== 0 && renderErrorCard("Axis Error", currentErrors.axis_error, 'axis', 'red')}
                    {currentErrors.motor_error !== 0 && renderErrorCard("Motor Error", currentErrors.motor_error, 'motor', 'orange')}
                    {currentErrors.encoder_error !== 0 && renderErrorCard("Encoder Error", currentErrors.encoder_error, 'encoder', 'yellow')}
                    {currentErrors.controller_error !== 0 && renderErrorCard("Controller Error", currentErrors.controller_error, 'controller', 'purple')}
                    {currentErrors.sensorless_error !== 0 && renderErrorCard("Sensorless Error", currentErrors.sensorless_error, 'sensorless', 'blue')}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Power & Thermal - Using Memoized Components */}
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <Card bg="gray.800" variant="elevated">
                <CardHeader>
                  <Heading size="md" color="white">Power & Voltage</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <VoltageProgress voltage={vbusVoltage ?? 0} />
                    <Divider />
                    <TelemetryDisplay 
                      label="Motor Current (measured)"
                      value={motorCurrent ?? 0}
                      unit="A"
                      color={Math.abs(motorCurrent ?? 0) > 5 ? "red.300" : "odrive.300"}
                    />
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="gray.800" variant="elevated">
                <CardHeader>
                  <Heading size="md" color="white">Temperature Monitoring</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <TemperatureDisplay temp={motorTemp ?? 0} label="Motor Temperature" />
                    <TemperatureDisplay temp={fetTemp ?? 0} label="FET Temperature" />
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="gray.800" variant="elevated">
                <CardHeader>
                  <Heading size="md" color="white">Encoder Feedback</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <TelemetryDisplay 
                      label="Position (counts)"
                      value={encoderPos ?? 0}
                      unit=""
                      color="odrive.300"
                    />
                    <TelemetryDisplay 
                      label="Velocity (counts/s)"
                      value={encoderVel ?? 0}
                      unit=""
                      color="odrive.300"
                    />
                    <TelemetryDisplay 
                      label="Position (turns)"
                      value={((encoderPos ?? 0) / 4000)}
                      unit=""
                      color="odrive.300"
                    />
                  </SimpleGrid>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Control Actions */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader>
                <Heading size="md" color="white">Quick Actions</Heading>
              </CardHeader>
              <CardBody>
                <MotorControls 
                  axisNumber={0} 
                  size="md" 
                  orientation="horizontal" 
                  variant="full"
                />
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </VStack>

      {/* Error Troubleshooting Modal */}
      <ErrorTroubleshooting
        isOpen={isTroubleshootingOpen}
        onClose={onTroubleshootingClose}
        errorCode={selectedError.code}
        errorType={selectedError.type}
      />
    </Box>
  )
})

DashboardTab.displayName = 'DashboardTab'

export default DashboardTab