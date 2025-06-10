import { useState} from 'react'
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

const DashboardTab = ({ isConnected, odriveState }) => {
  // eslint-disable-next-line no-unused-vars
  const [realTimeData, setRealTimeData] = useState({})
  const [selectedError, setSelectedError] = useState({ code: null, type: null })
  const { connectedDevice } = useSelector(state => state.device)
  
  const { isOpen: isTroubleshootingOpen, onOpen: onTroubleshootingOpen, onClose: onTroubleshootingClose } = useDisclosure()


  // Check if we should show dashboard content
  const shouldShowDashboard = () => {
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    return isDevelopment || isConnected
  }

  // If we shouldn't show dashboard, show the connection warning
  if (!shouldShowDashboard()) {
    return (
      <Box p={6} bg="gray.900" h="100%">
        <Alert status="warning" bg="orange.900" borderColor="orange.500">
          <AlertIcon />
          Connect to an ODrive device to view dashboard data.
        </Alert>
      </Box>
    )
  }

  const getAxisData = (odriveState, axisNum = 0) => {
    // Add safety check for odriveState structure
    if (!odriveState || !odriveState.device) {
      return {
        state: 0,
        error: 0,
        motor: { error: 0, current_phB: 0, current_phC: 0, is_calibrated: false },
        encoder: { error: 0, pos_estimate: 0, vel_estimate: 0, is_ready: false, index_found: false },
        controller: { error: 0, pos_setpoint: 0, vel_setpoint: 0, torque_setpoint: 0 }
      }
    }

    const axis = odriveState.device[`axis${axisNum}`]
    if (!axis) {
      return {
        state: 0,
        error: 0,
        motor: { error: 0, current_phB: 0, current_phC: 0, is_calibrated: false },
        encoder: { error: 0, pos_estimate: 0, vel_estimate: 0, is_ready: false, index_found: false },
        controller: { error: 0, pos_setpoint: 0, vel_setpoint: 0, torque_setpoint: 0 }
      }
    }
    
    return {
      state: axis.current_state || 0,
      error: axis.error || 0,
      motor: {
        error: axis.motor?.error || 0,
        current_phB: axis.motor?.current_meas_phB || 0,
        current_phC: axis.motor?.current_meas_phC || 0,
        is_calibrated: axis.motor?.is_calibrated || false
      },
      encoder: {
        error: axis.encoder?.error || 0,
        pos_estimate: axis.encoder?.pos_estimate || 0,
        vel_estimate: axis.encoder?.vel_estimate || 0,
        is_ready: axis.encoder?.is_ready || false,
        index_found: axis.encoder?.index_found || false
      },
      controller: {
        error: axis.controller?.error || 0,
        pos_setpoint: axis.controller?.pos_setpoint || 0,
        vel_setpoint: axis.controller?.vel_setpoint || 0,
        torque_setpoint: axis.controller?.torque_setpoint || 0
      }
    }
  }

  const getSystemData = (odriveState) => {
    // Add safety check
    if (!odriveState || !odriveState.device) {
      return {
        vbus_voltage: 0,
        ibus: 0,
        hw_version_major: 0,
        hw_version_minor: 0,
        fw_version_major: 0,
        fw_version_minor: 0,
        serial_number: 'Unknown'
      }
    }

    const device = odriveState.device
    return {
      vbus_voltage: device.vbus_voltage || 0,
      ibus: device.ibus || 0,
      hw_version_major: device.hw_version_major || 0,
      hw_version_minor: device.hw_version_minor || 0,
      fw_version_major: device.fw_version_major || 0,
      fw_version_minor: device.fw_version_minor || 0,
      serial_number: device.serial_number || 'Unknown'
    }
  }

  const axis0Data = getAxisData(odriveState, 0)
  const systemData = getSystemData(odriveState)

  // Add null checks before accessing properties
  const axisState = axis0Data?.state || 0
  const motorCurrent = realTimeData.axis0?.motor?.current_control?.Iq_measured || 0
  const encoderPos = realTimeData.axis0?.encoder?.pos_estimate || axis0Data?.encoder?.pos_estimate || 0
  const encoderVel = realTimeData.axis0?.encoder?.vel_estimate || axis0Data?.encoder?.vel_estimate || 0
  const vbusVoltage = realTimeData.vbus_voltage || systemData?.vbus_voltage || 0
  const motorTemp = realTimeData.axis0?.motor?.motor_thermistor?.temperature || 0
  const fetTemp = realTimeData.axis0?.motor?.fet_thermistor?.temperature || 0

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
                  v{systemData?.fw_version_major || 0}.{systemData?.fw_version_minor || 5}.{systemData?.fw_version_revision || 6}
                </StatNumber>
                <StatHelpText color="gray.400">
                  HW: v{systemData?.hw_version_major || 3}.{systemData?.hw_version_minor || 6}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel color="gray.300">Serial Number</StatLabel>
                <StatNumber color="white" fontSize="md">
                  {systemData?.serial_number || connectedDevice?.serial || 'Unknown'}
                </StatNumber>
                <StatHelpText color="gray.400">
                  VBus: {systemData?.vbus_voltage?.toFixed(1) || '0.0'} V
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
          odriveState.device?.axis0?.sensorless_estimator?.error) && (
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
                {renderErrorCard("Sensorless Error", odriveState.device?.axis0?.sensorless_estimator?.error, 'sensorless', 'blue')}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Power & Thermal */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          <Card bg="gray.800" variant="elevated">
            <CardHeader>
              <Heading size="md" color="white">Power & Voltage</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text color="gray.300">DC Bus Voltage</Text>
                    <Text fontWeight="bold" color="white">{vbusVoltage.toFixed(1)} V</Text>
                  </HStack>
                  <Progress 
                    value={(vbusVoltage / 56) * 100} 
                    colorScheme={vbusVoltage > 50 ? "red" : vbusVoltage > 40 ? "yellow" : "green"}
                    size="sm"
                  />
                </Box>
                <Divider />
                <Stat textAlign="center">
                  <StatLabel color="gray.300">Motor Current</StatLabel>
                  <StatNumber color={Math.abs(motorCurrent) > 5 ? "red.300" : "odrive.300"} fontSize="2xl">
                    {motorCurrent.toFixed(2)} A
                  </StatNumber>
                  <StatHelpText color="gray.400">
                    {motorCurrent > 0 ? "Motoring" : motorCurrent < 0 ? "Regenerating" : "Idle"}
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="gray.800" variant="elevated">
            <CardHeader>
              <Heading size="md" color="white">Temperature Monitoring</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text color="gray.300">Motor Temperature</Text>
                    <Text fontWeight="bold" color={motorTemp > 80 ? "red.300" : "white"}>
                      {motorTemp.toFixed(1)} °C
                    </Text>
                  </HStack>
                  <Progress 
                    value={(motorTemp / 100) * 100} 
                    colorScheme={motorTemp > 80 ? "red" : motorTemp > 60 ? "yellow" : "green"}
                    size="sm"
                  />
                </Box>
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text color="gray.300">FET Temperature</Text>
                    <Text fontWeight="bold" color={fetTemp > 80 ? "red.300" : "white"}>
                      {fetTemp.toFixed(1)} °C
                    </Text>
                  </HStack>
                  <Progress 
                    value={(fetTemp / 100) * 100} 
                    colorScheme={fetTemp > 80 ? "red" : fetTemp > 60 ? "yellow" : "green"}
                    size="sm"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>
          <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Encoder Feedback</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Stat textAlign="center">
                <StatLabel color="gray.300">Position</StatLabel>
                <StatNumber color="odrive.300" fontSize="2xl">
                  {encoderPos.toFixed(1)}
                </StatNumber>
                <StatHelpText color="gray.400">counts</StatHelpText>
              </Stat>
              <Stat textAlign="center">
                <StatLabel color="gray.300">Velocity</StatLabel>
                <StatNumber color="odrive.300" fontSize="2xl">
                  {encoderVel.toFixed(1)}
                </StatNumber>
                <StatHelpText color="gray.400">counts/s</StatHelpText>
              </Stat>
              <Stat textAlign="center">
                <StatLabel color="gray.300">Position (turns)</StatLabel>
                <StatNumber color="odrive.300" fontSize="2xl">
                  {(encoderPos / (odriveState.axis0?.encoder?.config?.cpr || 4000)).toFixed(3)}
                </StatNumber>
                <StatHelpText color="gray.400">revolutions</StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>
        </SimpleGrid>

        {/* Encoder Data */}
        

        {/* Control Actions */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Button
                colorScheme="green"
                onClick={() => fetch('/api/odrive/command', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ command: 'odrv0.axis0.requested_state = 8' })
                })}
                isDisabled={axisState === 8}
              >
                Enable Motor
              </Button>
              <Button
                colorScheme="red"
                onClick={() => fetch('/api/odrive/command', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ command: 'odrv0.axis0.requested_state = 1' })
                })}
                isDisabled={axisState === 1}
              >
                Disable Motor
              </Button>
              <Button
                colorScheme="orange"
                onClick={() => fetch('/api/odrive/command', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ command: 'odrv0.axis0.requested_state = 3' })
                })}
                isDisabled={axisState !== 1}
              >
                Full Calibration
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => fetch('/api/odrive/command', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ command: 'odrv0.clear_errors()' })
                })}
              >
                Clear Errors
              </Button>
            </SimpleGrid>
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
}

export default DashboardTab