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
  useDisclosure,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { 
  setAvailableDevices, 
  setConnectedDevice, 
  updateOdriveState,
  setConnectionLost
} from '../store/slices/deviceSlice'
import { getErrorDescription, getErrorColor, isErrorCritical } from '../utils/odriveErrors'
import ErrorTroubleshooting from './ErrorTroubleshooting'
import '../styles/DeviceList.css'

const DeviceList = () => {
  const dispatch = useDispatch()
  const toast = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [selectedError, setSelectedError] = useState({ code: null, type: null })
  
  const { isOpen: isTroubleshootingOpen, onOpen: onTroubleshootingOpen, onClose: onTroubleshootingClose } = useDisclosure()
  
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

  useEffect(() => {
    scanForDevices()
    
    // Poll for device state updates when connected
    if (isConnected || connectionLost) {
      const interval = setInterval(async () => {
        try {
          // Use different endpoints based on what we need
          // During calibration, reduce the frequency of state updates
          const isCalibrating = odriveState.axis0?.current_state >= 3 && odriveState.axis0?.current_state <= 7
          
          if (isCalibrating) {
            // During calibration, only poll state every 2 seconds
            const response = await fetch('/api/odrive/state')
            if (response.ok) {
              const state = await response.json()
              if (Object.keys(state).length > 0) {
                dispatch(updateOdriveState(state))
                if (connectionLost) {
                  toast({
                    title: 'Device reconnected',
                    description: 'ODrive connection has been restored.',
                    status: 'success',
                    duration: 3000,
                  })
                }
              }
            }
          } else {
            // Normal operation - use telemetry endpoint
            const response = await fetch('/api/odrive/telemetry')
            if (response.ok) {
              const state = await response.json()
              if (Object.keys(state).length > 0) {
                dispatch(updateOdriveState(state))
                if (connectionLost) {
                  toast({
                    title: 'Device reconnected',
                    description: 'ODrive connection has been restored.',
                    status: 'success',
                    duration: 3000,
                  })
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch device state:', error)
          if (!connectionLost) {
            dispatch(setConnectionLost(true))
            toast({
              title: 'Connection lost',
              description: 'Lost connection to ODrive. Attempting to reconnect...',
              status: 'warning',
              duration: 5000,
            })
          }
        }
      }, odriveState.axis0?.current_state >= 3 && odriveState.axis0?.current_state <= 7 ? 2000 : 1000) // Slower polling during calibration
      
      return () => clearInterval(interval)
    }
  }, [isConnected, connectionLost, odriveState.axis0?.current_state, dispatch, toast, scanForDevices])

  

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
    if (!state.axis0) return 'gray'
    const axisState = state.axis0.current_state
    if (axisState === 8) return 'green' // CLOSED_LOOP_CONTROL
    if (axisState === 1) return 'blue' // IDLE
    if (axisState >= 2 && axisState <= 7) return 'yellow' // Calibration states
    return 'red' // Error or undefined
  }

  // Helper function to open troubleshooting modal
  const handleErrorClick = (errorCode, errorType) => {
    setSelectedError({ code: errorCode, type: errorType })
    onTroubleshootingOpen()
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
        <Text 
          fontSize="xs" 
          color="blue.300" 
          textAlign="right" 
          cursor="pointer"
          _hover={{ textDecoration: 'underline' }}
          onClick={() => handleErrorClick(errorCode, errorType)}
        >
          Click for troubleshooting →
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
                    {odriveState.vbus_voltage?.toFixed(1) || '0.0'} V
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Axis State:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {odriveState.axis0?.current_state || 0}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Motor Current:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {odriveState.axis0?.motor?.current_control?.Iq_measured?.toFixed(2) || '0.00'} A
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Encoder Pos:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {odriveState.axis0?.encoder?.pos_estimate?.toFixed(2) || '0.00'}
                  </Text>
                </HStack>

                {/* Axis Error */}
                {renderErrorInfo(odriveState.axis0?.error, 'axis')}

                {/* Motor Error */}
                {odriveState.axis0?.motor?.error && odriveState.axis0.motor.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Motor Errors:</Text>
                    {renderErrorInfo(odriveState.axis0.motor.error, 'motor')}
                  </>
                )}

                {/* Encoder Error */}
                {odriveState.axis0?.encoder?.error && odriveState.axis0.encoder.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Encoder Errors:</Text>
                    {renderErrorInfo(odriveState.axis0.encoder.error, 'encoder')}
                  </>
                )}

                {/* Controller Error */}
                {odriveState.axis0?.controller?.error && odriveState.axis0.controller.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Controller Errors:</Text>
                    {renderErrorInfo(odriveState.axis0.controller.error, 'controller')}
                  </>
                )}

                {/* Sensorless Estimator Error */}
                {odriveState.axis0?.sensorless_estimator?.error && odriveState.axis0.sensorless_estimator.error !== 0 && (
                  <>
                    <Divider my={2} />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Sensorless Errors:</Text>
                    {renderErrorInfo(odriveState.axis0.sensorless_estimator.error, 'sensorless')}
                  </>
                )}
              </VStack>
            </Box>
          </>
        )}
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

export default DeviceList