import { useState, useEffect } from 'react'
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
import { getAxisStateName } from '../utils/odriveEnums'
import { getErrorDescription, isErrorCritical } from '../utils/odriveErrors'
import ErrorTroubleshooting from './ErrorTroubleshooting'
import '../styles/DashboardTab.css'

const DashboardTab = ({ isConnected, odriveState }) => {
  const [realTimeData, setRealTimeData] = useState({})
  const [selectedError, setSelectedError] = useState({ code: null, type: null })
  const { connectedDevice } = useSelector(state => state.device)
  
  const { isOpen: isTroubleshootingOpen, onOpen: onTroubleshootingOpen, onClose: onTroubleshootingClose } = useDisclosure()

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/odrive/telemetry')
          if (response.ok) {
            const data = await response.json()
            setRealTimeData(data)
          }
        } catch (error) {
          console.error('Failed to fetch telemetry:', error)
        }
      }, 100) // 10Hz update rate

      return () => clearInterval(interval)
    }
  }, [isConnected])

  if (!isConnected) {
    return (
      <Box className="dashboard-tab" p={8} textAlign="center">
        <Alert status="info" variant="subtle" borderRadius="md">
          <AlertIcon />
          Connect to an ODrive device to view dashboard data.
        </Alert>
      </Box>
    )
  }

  const axisState = odriveState.axis0?.current_state || 0
  const motorCurrent = realTimeData.axis0?.motor?.current_control?.Iq_measured || 0
  const encoderPos = realTimeData.axis0?.encoder?.pos_estimate || 0
  const encoderVel = realTimeData.axis0?.encoder?.vel_estimate || 0
  const vbusVoltage = realTimeData.vbus_voltage || 0
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
                  v0.5.6
                </StatNumber>
                <StatHelpText color="gray.400">
                  ODrive v3.6 56V
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
              <Stat>
                <StatLabel color="gray.300">Errors</StatLabel>
                <StatNumber 
                  color={odriveState.axis0?.error ? "red.300" : "green.300"} 
                  fontSize="md"
                  cursor={odriveState.axis0?.error ? "pointer" : "default"}
                  _hover={odriveState.axis0?.error ? { opacity: 0.8 } : {}}
                  onClick={odriveState.axis0?.error ? () => handleErrorClick(odriveState.axis0.error, 'axis') : undefined}
                >
                  {odriveState.axis0?.error ? `0x${odriveState.axis0.error.toString(16).toUpperCase()}` : 'None'}
                </StatNumber>
                <StatHelpText color="gray.400">
                  {odriveState.axis0?.error ? "Click for help" : "Axis Error Code"}
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Error Status Section */}
        {(odriveState.axis0?.error || 
          odriveState.axis0?.motor?.error || 
          odriveState.axis0?.encoder?.error || 
          odriveState.axis0?.controller?.error ||
          odriveState.axis0?.sensorless_estimator?.error) && (
          <Card bg="red.900" variant="elevated">
            <CardHeader>
              <HStack>
                <Icon as={WarningIcon} color="red.300" />
                <Heading size="md" color="red.0">System Errors - Click for Help</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {renderErrorCard("Axis Error", odriveState.axis0?.error, 'axis', 'red')}
                {renderErrorCard("Motor Error", odriveState.axis0?.motor?.error, 'motor', 'orange')}
                {renderErrorCard("Encoder Error", odriveState.axis0?.encoder?.error, 'encoder', 'yellow')}
                {renderErrorCard("Controller Error", odriveState.axis0?.controller?.error, 'controller', 'purple')}
                {renderErrorCard("Sensorless Error", odriveState.axis0?.sensorless_estimator?.error, 'sensorless', 'blue')}
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