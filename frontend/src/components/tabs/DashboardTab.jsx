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
      <Text fontWeight="bold" color="white">{voltage.toFixed(1)} V</Text>
    </HStack>
    <Progress 
      value={(voltage / 56) * 100} 
      colorScheme={voltage > 50 ? "red" : voltage > 40 ? "yellow" : "green"}
      size="sm"
    />
  </Box>
))

const TemperatureDisplay = memo(({ temp, label, maxTemp = 100 }) => (
  <Box w="100%">
    <HStack justify="space-between" mb={2}>
      <Text color="gray.300">{label}</Text>
      <Text fontWeight="bold" color={temp > 80 ? "red.300" : "white"}>
        {temp.toFixed(1)} °C
      </Text>
    </HStack>
    <Progress 
      value={(temp / maxTemp) * 100} 
      colorScheme={temp > 80 ? "red" : temp > 60 ? "yellow" : "green"}
      size="sm"
    />
  </Box>
))

const DashboardTab = memo(() => {
  // Use telemetry slice for high-frequency data
  const telemetry = useSelector(state => state.telemetry)
  const { connectedDevice, odriveState } = useSelector(state => state.device) // Removed unused isConnected
  
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

  return (
    <Box className="dashboard-tab" h="100%" overflow="hidden">
      <VStack spacing={6} align="stretch" h="100%" overflow="auto" p={6}>
        
        {/* Connection Health Indicator */}
        {!connectionHealth && (
          <Alert status="warning">
            <AlertIcon />
            Telemetry connection degraded - some data may be outdated
          </Alert>
        )}

        {/* Device Info */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md" color="white">Device Status</Heading>
              <Badge colorScheme={getStateColor(axisState)} variant="solid" fontSize="sm" px={3} py={1}>
                {getAxisStateName(axisState)}
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
                  {systemData?.serial_number || connectedDevice?.serial || 'Unknown'}
                </StatNumber>
                <StatHelpText color="gray.400">
                  VBus: {vbusVoltage.toFixed(1)} V
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel color="gray.300">Axis State</StatLabel>
                <StatNumber color="white" fontSize="md">
                  {axisState}
                </StatNumber>
                <StatHelpText color="gray.400">
                  {getAxisStateName(axisState)}
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Error Status Section */}
        {(axis0Data?.error || 
          axis0Data?.motor?.error || 
          axis0Data?.encoder?.error || 
          axis0Data?.controller?.error ||
          axis0Data?.sensorless_estimator?.error) && (
          <Card bg="red.900" variant="elevated">
            <CardHeader>
              <HStack>
                <Icon as={WarningIcon} color="red.300" />
                <Heading size="md" color="red.300">System Errors - Click for Help</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {renderErrorCard("Axis Error", axis0Data?.error, 'axis', 'red')}
                {renderErrorCard("Motor Error", axis0Data?.motor?.error, 'motor', 'orange')}
                {renderErrorCard("Encoder Error", axis0Data?.encoder?.error, 'encoder', 'yellow')}
                {renderErrorCard("Controller Error", axis0Data?.controller?.error, 'controller', 'purple')}
                {renderErrorCard("Sensorless Error", axis0Data?.sensorless_estimator?.error, 'sensorless', 'blue')}
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
                <VoltageProgress voltage={vbusVoltage} />
                <Divider />
                <TelemetryDisplay 
                  label="Motor Current (measured)"
                  value={motorCurrent}
                  unit="A"
                  color={Math.abs(motorCurrent) > 5 ? "red.300" : "odrive.300"}
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
                <TemperatureDisplay temp={motorTemp} label="Motor Temperature" />
                <TemperatureDisplay temp={fetTemp} label="FET Temperature" />
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
                  value={encoderPos}
                  unit=""
                  color="odrive.300"
                />
                <TelemetryDisplay 
                  label="Velocity (counts/s)"
                  value={encoderVel}
                  unit=""
                  color="odrive.300"
                />
                <TelemetryDisplay 
                  label="Position (turns)"
                  value={(encoderPos / 4000)}
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