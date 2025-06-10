import { useState, useEffect, useCallback } from 'react'
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
  updateOdriveState,
  setConnectionLost
} from '../store/slices/deviceSlice'
import { getAxisStateName } from '../utils/odriveEnums'
import { getErrorDescription, getErrorColor, isErrorCritical } from '../utils/odriveErrors'
import '../styles/DeviceList.css'
import { useTelemetry } from '../hooks/useTelemetry'

const DeviceList = () => {
  const dispatch = useDispatch()
  const toast = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [ setSelectedError] = useState({ code: null, type: null })
  
  
  const { 
    availableDevices, 
    connectedDevice, 
    isConnected, 
    odriveState,
    connectionLost 
  } = useSelector(state => state.device)

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

    const getAxisStateColorScheme = (state) => {
    if (state === 8) return "green" // CLOSED_LOOP_CONTROL
    if (state === 1) return "blue" // IDLE
    if (state >= 2 && state <= 7) return "yellow" // Calibration states
    return "red" // Error or undefined
  }
  

  // Replace the useEffect that handles polling (around lines 90-145)
  useTelemetry({
    type: 'dashboard',
    updateRate: 2000, // 2 seconds for device list
  })

// Update the reconnection detection useEffect in DeviceList.jsx
useEffect(() => {
  if (!isConnected && connectedDevice && !isScanning) {
    // More frequent polling for faster reconnection detection
    const reconnectInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch('/api/odrive/connection_status')
        if (statusResponse.ok) {
          const status = await statusResponse.json()
          if (status.connected && !status.connection_lost) {
            // Backend says we're connected - trust it and clear connection lost
            dispatch(setConnectionLost(false))
            
            // Trigger configuration pull after successful reconnection
            setTimeout(() => {
              // Dispatch a custom event to trigger config pull in ConfigurationTab
              window.dispatchEvent(new CustomEvent('deviceReconnected'))
            }, 100) // Reduced from 500ms to 100ms for faster response
            
            toast({
              title: 'Device reconnected',
              description: 'ODrive connection has been restored. Pulling configuration...',
              status: 'success',
              duration: 3000,
            })
          }
        }
      } catch (error) {
        // Reconnection attempt failed, continue trying
        console.log('Reconnection attempt failed:', error)
      }
    }, 500) // Reduced from 1000ms to 500ms for much faster detection
    
    return () => clearInterval(reconnectInterval)
  }
}, [isConnected, connectionLost, dispatch, toast, isScanning, connectedDevice])


  const handleConnect = async (device) => {
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
  }

  const handleDisconnect = async () => {
    try {
      await fetch('/api/odrive/disconnect', { method: 'POST' })
      dispatch(setConnectedDevice(null))
      dispatch(updateOdriveState({}))
      toast({
        title: 'Disconnected',
        description: 'Disconnected from ODrive',
        status: 'info',
        duration: 3000,
      })
    } catch (error) {
      console.error('Failed to disconnect from ODrive:', error)
    }
  }

  const getStatusColor = (state) => {
  if (connectionLost) return 'yellow'
  if (!state.device) return 'gray'
  const axisState = state.device.axis0?.current_state
  if (axisState === 8) return 'green'
  if (axisState === 1) return 'blue'
  if (axisState >= 2 && axisState <= 7) return 'yellow'
  return 'red' // Error or undefined
}

  // Helper function to open troubleshooting modal
  const handleErrorClick = (errorCode, errorType) => {
    setSelectedError({ code: errorCode, type: errorType })
  }

  // Helper function to render error information with clickable badges
  const renderErrorInfo = (errorCode, errorType = 'axis') => {
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
  }

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
                        <VStack align="start" spacing={1} flex="1">
                          <Text fontWeight="bold">{device.path || `ODrive ${index + 1}`}</Text>
                          <Text fontSize="sm" color="gray.300">
                            Serial: {device.serial || 'Unknown'}
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            FW: {device.fw_version || 'v0.5.6'}
                          </Text>
                        </VStack>
                        <VStack>
                          <Badge
                            colorScheme={getStatusColor(odriveState)}
                            variant="solid"
                          >
                            {isConnected && connectedDevice?.serial === device.serial ? 
                              (connectionLost ? 'Reconnecting' : 'Connected') : 'Disconnected'}
                          </Badge>
                          {isConnected && connectedDevice?.serial === device.serial ? (
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={handleDisconnect}
                              isDisabled={connectionLost}
                            >
                              {connectionLost ? <Spinner size="xs" /> : 'Disconnect'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleConnect(device)}
                            >
                              Connect
                            </Button>
                          )}
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </Box>

        {isConnected && (
          <>
            <Divider />
            <Box>
              <Text fontSize="md" fontWeight="bold" mb={3} color="white">
                Device Status
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Vbus Voltage:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {odriveState.device?.vbus_voltage?.toFixed(1) || '0.0'} V
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Axis State:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {odriveState.device?.axis0?.current_state || 0}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Motor Current:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {odriveState.device?.axis0?.motor?.current_meas_phB?.toFixed(2) || '0.00'} A
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Encoder Pos:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {odriveState.device?.axis0?.encoder?.pos_estimate?.toFixed(2) || '0.00'}
                  </Text>
                </HStack>

                {/* Status Information */}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Status:</Text>
                  <Badge colorScheme={getAxisStateColorScheme(odriveState.device?.axis0?.current_state)}>
                    {getAxisStateName(odriveState.device?.axis0?.current_state)}
                  </Badge>
                </HStack>

                {/* Clear Errors Button - only shown if errors exist */}
                {(odriveState.device?.axis0?.error || 
                  odriveState.device?.axis0?.motor?.error || 
                  odriveState.device?.axis0?.encoder?.error || 
                  odriveState.device?.axis0?.controller?.error ||
                  odriveState.device?.axis0?.sensorless_estimator?.error) && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    mt={2}
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/odrive/command', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ command: 'odrv0.clear_errors()' })
                        });
                        
                        if (response.ok) {
                          toast({
                            title: 'Errors cleared',
                            description: 'All error flags have been cleared',
                            status: 'success',
                            duration: 3000,
                          });

                        } else {
                          const error = await response.json();
                          throw new Error(error.error || 'Failed to clear errors');
                        }
                      } catch (error) {
                        toast({
                          title: 'Error',
                          description: `Failed to clear errors: ${error.message}`,
                          status: 'error',
                          duration: 5000,
                        });
                      }
                    }}
                  >
                    Clear All Errors
                  </Button>
                )}

                {/* Axis Error */}
                {renderErrorInfo(odriveState.device?.axis0?.error, 'axis')}

                {/* Motor Error */}
                {odriveState.device?.axis0?.motor?.error && odriveState.device.axis0.motor.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Motor Errors:</Text>
                    {renderErrorInfo(odriveState.device.axis0.motor.error, 'motor')}
                  </>
                )}

                {/* Encoder Error */}
                {odriveState.device?.axis0?.encoder?.error && odriveState.device.axis0.encoder.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Encoder Errors:</Text>
                    {renderErrorInfo(odriveState.device.axis0.encoder.error, 'encoder')}
                  </>
                )}

                {/* Controller Error */}
                {odriveState.device?.axis0?.controller?.error && odriveState.device.axis0.controller.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Controller Errors:</Text>
                    {renderErrorInfo(odriveState.device.axis0.controller.error, 'controller')}
                  </>
                )}

                {/* Sensorless Estimator Error */}
                {odriveState.device?.axis0?.sensorless_estimator?.error && odriveState.device.axis0.sensorless_estimator.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Sensorless Errors:</Text>
                    {renderErrorInfo(odriveState.device.axis0.sensorless_estimator.error, 'sensorless')}
                  </>
                )}
              </VStack>
            </Box>
          </>
        )}
      </VStack>

    </Box>
  )
}

export default DeviceList