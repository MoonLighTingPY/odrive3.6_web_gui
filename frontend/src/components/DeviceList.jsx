import { useState, useEffect, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  Spinner,
  useToast,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { 
  setAvailableDevices, 
  setConnectedDevice, 
  setConnectionLost
} from '../store/slices/deviceSlice'
import { getAxisStateName } from '../utils/odriveEnums'
import { getErrorDescription, getErrorColor, isErrorCritical } from '../utils/odriveErrors'
import '../styles/DeviceList.css'

// Memoized Status Badge Component
const StatusBadge = memo(({ isConnected, connectionLost, connectedDevice, device }) => {
  const getStatusColor = () => {
    if (isConnected && connectedDevice?.serial === device.serial) {
      return connectionLost ? 'yellow' : 'green'
    }
    return 'gray'
  }

  const getStatusText = () => {
    if (isConnected && connectedDevice?.serial === device.serial) {
      return connectionLost ? 'Reconnecting' : 'Connected'
    }
    return 'Disconnected'
  }

  return (
    <Badge
      colorScheme={getStatusColor()}
      variant="solid"
    >
      {getStatusText()}
    </Badge>
  )
})

StatusBadge.displayName = 'StatusBadge'

// Memoized Device Info Component
const DeviceInfo = memo(({ device, index }) => (
  <VStack align="start" spacing={1} flex="1">
    <Text fontWeight="bold">{device.path || `ODrive ${index + 1}`}</Text>
    <Text fontSize="sm" color="gray.300">
      Serial: {device.serial || 'Unknown'}
    </Text>
    <Text fontSize="sm" color="gray.400">
      FW: {device.fw_version || 'v0.5.6'}
    </Text>
  </VStack>
))

DeviceInfo.displayName = 'DeviceInfo'

// Memoized Error Display Component
const ErrorDisplay = memo(({ errorCode, errorType = 'axis', handleErrorClick }) => {
  if (!errorCode || errorCode === 0) {
    return (
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Error:</Text>
        <Text fontSize="sm" fontWeight="bold" color="green.300">None</Text>
      </HStack>
    )
  }

  const description = getErrorDescription(errorCode, errorType)
  const colorScheme = getErrorColor(errorCode, errorType)
  const isCritical = isErrorCritical(errorCode, errorType)

  return (
    <VStack spacing={1} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Error:</Text>
        <HStack>
          <Badge 
            colorScheme={colorScheme} 
            variant="solid" 
            fontSize="xs"
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
            onClick={() => handleErrorClick(errorCode, errorType)}
          >
            0x{errorCode.toString(16).toUpperCase()}
          </Badge>
          {isCritical && (
            <Tooltip label="Critical error - immediate attention required">
              <Icon as={InfoIcon} color="red.400" boxSize={3} />
            </Tooltip>
          )}
        </HStack>
      </HStack>
      <Text fontSize="xs" color={`${colorScheme}.300`} textAlign="right" maxW="200px">
        {description}
      </Text>
    </VStack>
  )
})

ErrorDisplay.displayName = 'ErrorDisplay'

// Memoized Device Status Component
const DeviceStatusDisplay = memo(({ telemetry, odriveState }) => {
  const getAxisStateColorScheme = (state) => {
    if (state === 8) return "green" // CLOSED_LOOP_CONTROL
    if (state === 1) return "blue" // IDLE
    if (state >= 2 && state <= 7) return "yellow" // Calibration states
    return "red" // Error or undefined
  }

  // Use telemetry data for real-time values, fallback to odriveState
  const vbusVoltage = telemetry?.vbus_voltage ?? odriveState.device?.vbus_voltage ?? 0
  const motorCurrent = telemetry?.motor_current ?? odriveState.device?.axis0?.motor?.current_control?.Iq_measured ?? 0
  const encoderPos = telemetry?.encoder_pos ?? odriveState.device?.axis0?.encoder?.pos_estimate ?? 0
  const axisState = telemetry?.axis_state ?? odriveState.device?.axis0?.current_state ?? 0

  return (
    <VStack spacing={2} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Vbus Voltage:</Text>
        <Text fontSize="sm" fontWeight="bold" color="white">
          {vbusVoltage.toFixed(1)} V
        </Text>
      </HStack>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Axis State:</Text>
        <Text fontSize="sm" fontWeight="bold" color="white">
          {axisState}
        </Text>
      </HStack>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Motor Current:</Text>
        <Text fontSize="sm" fontWeight="bold" color="white">
          {motorCurrent.toFixed(2)} A
        </Text>
      </HStack>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Encoder Pos:</Text>
        <Text fontSize="sm" fontWeight="bold" color="white">
          {encoderPos.toFixed(2)}
        </Text>
      </HStack>

      {/* Status Information */}
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Status:</Text>
        <Badge colorScheme={getAxisStateColorScheme(axisState)}>
          {getAxisStateName(axisState)}
        </Badge>
      </HStack>
    </VStack>
  )
})

DeviceStatusDisplay.displayName = 'DeviceStatusDisplay'

// Memoized Device Card Component
const DeviceCard = memo(({ 
  device, 
  index, 
  isConnected, 
  connectedDevice, 
  connectionLost, 
  onConnect, 
  onDisconnect 
}) => (
  <Card
    key={index}
    w="100%"
    className="device-card"
    bg={isConnected && connectedDevice?.serial === device.serial ? 'odrive.700' : 'gray.700'}
    variant="elevated"
  >
    <CardBody>
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <DeviceInfo device={device} index={index} />
          <VStack>
            <StatusBadge 
              isConnected={isConnected}
              connectionLost={connectionLost}
              connectedDevice={connectedDevice}
              device={device}
            />
            {isConnected && connectedDevice?.serial === device.serial ? (
              <Button
                size="sm"
                colorScheme="red"
                onClick={onDisconnect}
                isDisabled={connectionLost}
              >
                {connectionLost ? <Spinner size="xs" /> : 'Disconnect'}
              </Button>
            ) : (
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => onConnect(device)}
              >
                Connect
              </Button>
            )}
          </VStack>
        </HStack>
      </VStack>
    </CardBody>
  </Card>
))

DeviceCard.displayName = 'DeviceCard'

// Memoized Error Section Component
const ErrorSection = memo(({ currentErrors, handleErrorClick }) => {
  const renderErrorInfo = useCallback((errorCode, errorType = 'axis') => (
    <ErrorDisplay 
      errorCode={errorCode}
      errorType={errorType}
      handleErrorClick={handleErrorClick}
    />
  ), [handleErrorClick])

  return (
    <VStack spacing={2} align="stretch">
      {/* Axis Error */}
      {renderErrorInfo(currentErrors.axis_error, 'axis')}

      {/* Motor Error */}
      {currentErrors.motor_error !== 0 && (
        <>
          <Divider my={2} />
          <Text fontSize="sm" fontWeight="bold" color="orange.300">Motor Errors:</Text>
          {renderErrorInfo(currentErrors.motor_error, 'motor')}
        </>
      )}

      {/* Encoder Error */}
      {currentErrors.encoder_error !== 0 && (
        <>
          <Divider my={2} />
          <Text fontSize="sm" fontWeight="bold" color="orange.300">Encoder Errors:</Text>
          {renderErrorInfo(currentErrors.encoder_error, 'encoder')}
        </>
      )}

      {/* Controller Error */}
      {currentErrors.controller_error !== 0 && (
        <>
          <Divider my={2} />
          <Text fontSize="sm" fontWeight="bold" color="orange.300">Controller Errors:</Text>
          {renderErrorInfo(currentErrors.controller_error, 'controller')}
        </>
      )}

      {/* Sensorless Estimator Error */}
      {currentErrors.sensorless_error !== 0 && (
        <>
          <Divider my={2} />
          <Text fontSize="sm" fontWeight="bold" color="orange.300">Sensorless Errors:</Text>
          {renderErrorInfo(currentErrors.sensorless_error, 'sensorless')}
        </>
      )}
    </VStack>
  )
})

ErrorSection.displayName = 'ErrorSection'

const DeviceList = memo(() => {
  const dispatch = useDispatch()
  const toast = useToast()
  const [isScanning, setIsScanning] = useState(false)
  
  // Use telemetry slice for real-time data
  const telemetry = useSelector(state => state.telemetry)
  
  const { 
    availableDevices, 
    connectedDevice, 
    isConnected, 
    odriveState,
    connectionLost 
  } = useSelector(state => state.device)

  // Helper function to get current error codes from both sources
  const getCurrentErrors = () => {
    const axis0Data = odriveState.device?.axis0
    
    return {
      axis_error: telemetry?.axis_error || axis0Data?.error || 0,
      motor_error: telemetry?.motor_error || axis0Data?.motor?.error || 0,
      encoder_error: telemetry?.encoder_error || axis0Data?.encoder?.error || 0,
      controller_error: telemetry?.controller_error || axis0Data?.controller?.error || 0,
      sensorless_error: telemetry?.sensorless_error || axis0Data?.sensorless_estimator?.error || 0,
    }
  }

  const scanForDevices = useCallback(async () => {
    setIsScanning(true)
    try {
      const response = await fetch('/api/odrive/scan')
      if (response.ok) {
        const devices = await response.json()
        dispatch(setAvailableDevices(devices))
      } else {
        toast({
          title: 'Scan failed',
          description: 'Failed to scan for ODrive devices',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Failed to scan for devices:', error)
      toast({
        title: 'Scan failed',
        description: 'Network error while scanning for devices',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsScanning(false)
    }
  }, [dispatch, toast])

  useEffect(() => {
    scanForDevices()
  }, [scanForDevices])

  // Reconnection detection useEffect
  useEffect(() => {
    if (connectedDevice && !isConnected) {
      const reconnectInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch('/api/odrive/connection_status')
          if (statusResponse.ok) {
            const status = await statusResponse.json()
            if (status.connected && !status.connection_lost && status.device_serial) {
              dispatch(setConnectionLost(false))
              dispatch(setConnectedDevice({ 
                serial: status.device_serial,
                path: connectedDevice.path || `ODrive ${status.device_serial}`
              }))
              
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('deviceReconnected'))
              }, 500)
              
              const isExpectedReconnection = sessionStorage.getItem('expectingReconnection') === 'true'
              if (!isExpectedReconnection) {
                console.log('Reconnected to ODrive:', status.device_serial)
              } else {
                sessionStorage.removeItem('expectingReconnection')
              }
              
              clearInterval(reconnectInterval)
            }
          }
        } catch (error) {
          console.log('Reconnection attempt failed:', error)
        }
      }, 1000)
      
      return () => clearInterval(reconnectInterval)
    }
  }, [connectedDevice, isConnected, dispatch, toast, isScanning])

  const handleConnect = useCallback(async (device) => {
    try {
      const response = await fetch('/api/odrive/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device })
      })
      
      if (response.ok) {
        dispatch(setConnectedDevice(device))
        toast({
          title: 'Connected',
          description: `Connected to ODrive ${device.serial}`,
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Connection failed',
          description: error.error || 'Failed to connect to ODrive',
          status: 'error',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Failed to connect to ODrive:', error)
      toast({
        title: 'Connection failed',
        description: 'Network error while connecting to ODrive',
        status: 'error',
        duration: 5000,
      })
    }
  }, [dispatch, toast])

  const handleDisconnect = useCallback(async () => {
    try {
      const response = await fetch('/api/odrive/disconnect', {
        method: 'POST'
      })
      
      if (response.ok) {
        dispatch(setConnectedDevice(null))
        toast({
          title: 'Disconnected',
          description: 'Disconnected from ODrive',
          status: 'info',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Disconnect failed',
          description: error.error || 'Failed to disconnect from ODrive',
          status: 'error',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Failed to disconnect from ODrive:', error)
      toast({
        title: 'Disconnect failed',
        description: 'Network error while disconnecting from ODrive',
        status: 'error',
        duration: 5000,
      })
    }
  }, [dispatch, toast])

  const handleErrorClick = useCallback((errorCode, errorType) => {
    // For now, just log the error click - you can add modal or troubleshooting logic here
    console.log('Error clicked:', { errorCode: errorCode.toString(16), errorType })
  }, [])

  const handleClearErrors = useCallback(async () => {
    try {
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'odrv0.clear_errors()' })
      })
      
      if (response.ok) {
        toast({
          title: 'Errors cleared',
          description: 'All error flags have been cleared',
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to clear errors')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to clear errors: ${error.message}`,
        status: 'error',
        duration: 5000,
      })
    }
  }, [toast])

  // Get current errors
  const currentErrors = getCurrentErrors()
  const hasAnyErrors = Object.values(currentErrors).some(error => error !== 0)

  return (
    <Box className="device-list" p={4} h="100%">
      <VStack spacing={4} align="stretch" h="100%">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color="white">
            ODrive Devices
          </Text>
          <Button
            size="sm"
            colorScheme="odrive"
            onClick={scanForDevices}
            isLoading={isScanning}
            loadingText="Scanning"
          >
            Scan
          </Button>
        </HStack>

        {connectionLost && (
          <Alert status="warning" size="sm">
            <AlertIcon />
            <Text fontSize="sm">Device disconnected. Reconnecting...</Text>
          </Alert>
        )}

        <Box flex="1" overflowY="auto">
          {availableDevices.length === 0 ? (
            <Alert status="info" variant="subtle">
              <AlertIcon />
              No ODrive devices found. Make sure your device is connected.
            </Alert>
          ) : (
            <VStack spacing={3}>
              {availableDevices.map((device, index) => (
                <DeviceCard
                  key={device.serial || index}
                  device={device}
                  index={index}
                  isConnected={isConnected}
                  connectedDevice={connectedDevice}
                  connectionLost={connectionLost}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </VStack>
          )}
        </Box>

        {isConnected && (
          <>
            <Divider />
            <Box>
              <Text fontSize="md" fontWeight="bold" mb={1} color="white">
                Device Status
              </Text>
              <DeviceStatusDisplay telemetry={telemetry} odriveState={odriveState} />

              {/* Clear Errors Button - only shown if errors exist */}
              {hasAnyErrors && (
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="outline"
                  width="100%"
                  mt={2}
                  onClick={handleClearErrors}
                >
                  Clear All Errors
                </Button>
              )}

              {/* Pass current errors to ErrorSection */}
              <ErrorSection 
                currentErrors={currentErrors}
                handleErrorClick={handleErrorClick}
              />
            </Box>
          </>
        )}
      </VStack>
    </Box>
  )
})

DeviceList.displayName = 'DeviceList'

export default DeviceList