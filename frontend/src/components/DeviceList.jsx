import React, { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import {
  setScanning,
  setAvailableDevices,
  setConnectedDevice,
  setConnectionError,
  clearDeviceState,
  setFirmwareVersion,
} from '../store/slices/deviceSlice'
import { clearErrors } from '../utils/configurationActions'
import { setRegistryVersion, clearRegistry } from '../utils/registryManager'
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
  Tooltip,
  Icon,
  Heading,
} from '@chakra-ui/react'
import { InfoIcon, SearchIcon } from '@chakra-ui/icons'
import { getAxisStateName } from '../utils/odriveEnums'
import { getErrorDescription, getErrorColor, isErrorCritical } from '../utils/odriveErrors'
import '../styles/DeviceList.css'
import AxisSelector from './AxisSelector'

// Memoized Status Badge Component
const StatusBadge = memo(({ isConnected, connectedDevice, device }) => {
  const isThisDeviceConnected = isConnected &&
    connectedDevice &&
    connectedDevice.serial === device.serial

  return (
    <Badge
      colorScheme={isThisDeviceConnected ? "green" : "gray"}
      variant="solid"
      fontSize="xs"
      px={2}
      py={1}
    >
      {isThisDeviceConnected ? "Connected" : "Available"}
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
const DeviceStatusDisplay = memo(({ telemetry, odriveState, selectedAxis }) => {
  const getAxisStateColorScheme = (state) => {
    if (state === 8) return "green" // CLOSED_LOOP_CONTROL
    if (state === 1) return "blue" // IDLE
    if (state >= 2 && state <= 7) return "yellow" // Calibration states
    return "red" // Error or undefined
  }

  // Use telemetry data for real-time values, fallback to odriveState with selected axis
  const vbusVoltage = telemetry?.vbus_voltage ?? odriveState.device?.vbus_voltage ?? 0
  const motorCurrent = telemetry?.motor_current ?? odriveState.device?.[`axis${selectedAxis}`]?.motor?.current_control?.Iq_measured ?? 0
  const encoderPos = telemetry?.encoder_pos ?? odriveState.device?.[`axis${selectedAxis}`]?.encoder?.pos_estimate ?? 0
  const axisState = telemetry?.axis_state ?? odriveState.device?.[`axis${selectedAxis}`]?.current_state ?? 0

  return (
    <VStack spacing={2} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Vbus Voltage:</Text>
        <Text fontSize="sm" fontWeight="bold" color="white">
          {vbusVoltage.toFixed(1)} V
        </Text>
      </HStack>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">Axis {selectedAxis} State:</Text>
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
  onConnect,
  onDisconnect
}) => (
  <Card
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
              connectedDevice={connectedDevice}
              device={device}
            />
            {isConnected && connectedDevice?.serial === device.serial ? (
              <Button
                size="sm"
                colorScheme="red"
                onClick={onDisconnect}
              >
                Disconnect
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
  const isScanningRef = useRef(false) // Add this ref

  // Use telemetry slice for real-time data
  const telemetry = useSelector(state => state.telemetry)
  const selectedAxis = useSelector(state => state.ui.selectedAxis)

  const {
    availableDevices,
    connectedDevice,
    isConnected,
    odriveState,
    firmwareVersion,
  } = useSelector(state => state.device)

  // Helper function to get current error codes from both sources
  const getCurrentErrors = () => {
  return {
    axis_error: telemetry?.axis_error || odriveState.device?.[`axis${selectedAxis}`]?.error || 0,
    motor_error: telemetry?.motor_error || odriveState.device?.[`axis${selectedAxis}`]?.motor?.error || 0,
    encoder_error: telemetry?.encoder_error || odriveState.device?.[`axis${selectedAxis}`]?.encoder?.error || 0,
    controller_error: telemetry?.controller_error || odriveState.device?.[`axis${selectedAxis}`]?.controller?.error || 0,
    sensorless_error: telemetry?.sensorless_error || odriveState.device?.[`axis${selectedAxis}`]?.sensorless_estimator?.error || 0,
  }
}

  const scanForDevices = useCallback(async () => {
    if (isScanningRef.current) return

    try {
      isScanningRef.current = true
      setIsScanning(true)
      dispatch(setScanning(true))

      const response = await fetch('/api/odrive/scan')
      const devices = await response.json()

      if (response.ok) {
        dispatch(setAvailableDevices(devices))
      } else {
        // Check for USB error
        if (
          devices.error &&
          devices.error.includes('[UsbDiscoverer] Failed to open USB device:')
        ) {
          toast({
            title: 'USB Error',
            description: 'Failed to open USB device: It may be disconnected or busy. Replugging the USB cable usually helps.',
            status: 'error',
            duration: 10000,
          })
        }
        dispatch(setAvailableDevices([]))
      }
    } catch (error) {
      console.error('Scan error:', error)
      toast({
        title: 'Scan Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
      dispatch(setAvailableDevices([]))
    } finally {
      isScanningRef.current = false
      setIsScanning(false)
      dispatch(setScanning(false))
    }
  }, [dispatch, toast])

  useEffect(() => {
    scanForDevices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount, not when scanForDevices changes


  const handleConnect = useCallback(async (device) => {
    try {
      const response = await fetch('/api/odrive/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device })
      })

      if (response.ok) {
        console.log('🔌 Device connected, detecting firmware version...')
        
        // Detect and set firmware version BEFORE setting connected device
        // This ensures the registry is switched before any auto-loading happens
        try {
          const versionResponse = await fetch('/api/odrive/firmware_version')
          if (versionResponse.ok) {
            const versionData = await versionResponse.json()
            const firmwareVersion = versionData.version || 'v0.5.6'
            
            console.log(`🔍 Detected firmware version: ${firmwareVersion}`)
            
            // Update Redux state with firmware version FIRST
            dispatch(setFirmwareVersion(firmwareVersion))
            
            // Switch registry to appropriate version BEFORE setting device as connected
            setRegistryVersion(firmwareVersion)
            console.log('🔄 Registry switched, now setting device as connected...')
            
          } else {
            console.warn('⚠️ Failed to detect firmware version, using default 0.5.6')
            dispatch(setFirmwareVersion('v0.5.6'))
            setRegistryVersion('v0.5.6')
          }
        } catch (versionError) {
          console.warn('❌ Error detecting firmware version:', versionError)
          dispatch(setFirmwareVersion('v0.5.6'))
          setRegistryVersion('v0.5.6')
        }

        // NOW set the device as connected - this will trigger auto-loading with correct registry
        // Add a small delay to ensure registry switch has propagated
        await new Promise(resolve => setTimeout(resolve, 100))
        dispatch(setConnectedDevice(device))

        toast({
          title: 'Connected',
          description: `Connected to ${device.path}`,
          status: 'success',
          duration: 2000,
        })

      } else {
        const error = await response.json()
        throw new Error(error.error || 'Connection failed')
      }
    } catch (error) {
      console.error('Connection error:', error)
      dispatch(setConnectionError(error.message))
      toast({
        title: 'Connection Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }, [dispatch, toast])

  const handleDisconnect = useCallback(async () => {
    try {
      const response = await fetch('/api/odrive/disconnect', {
        method: 'POST'
      })

      if (response.ok) {
        dispatch(clearDeviceState())
        
        // Clear registry version on disconnect
        clearRegistry()
        
        toast({
          title: 'Disconnected',
          description: 'Disconnected from ODrive',
          status: 'info',
          duration: 2000,
        })
        // Refresh device list after disconnect
        scanForDevices()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Disconnect failed')
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      toast({
        title: 'Disconnect Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }, [dispatch, toast, scanForDevices])

  const handleErrorClick = useCallback((errorCode, errorType) => {
    console.log(`Error clicked: ${errorType} error 0x${errorCode.toString(16)}`)
    // Could open error details modal here
  }, [])

  const handleClearErrors = useCallback(async () => {
    try {
      await clearErrors()
      toast({
        title: 'Errors Cleared',
        description: 'All ODrive errors have been cleared',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: 'Clear Errors Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }, [toast])

  // Get current errors
  const currentErrors = getCurrentErrors()
  const hasAnyErrors = Object.values(currentErrors).some(error => error !== 0)

  useEffect(() => {
    if (!isConnected) {
      // Optimistically clear device list
      dispatch(setAvailableDevices([]))
      scanForDevices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, selectedAxis])

  return (
    <Box className="device-list" p={4} h="100%">
      <VStack spacing={4} align="stretch" h="100%">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              ODrive Devices
            </Text>
            {isConnected && (
              <HStack spacing={3}>
                <AxisSelector size="xs" />
                {firmwareVersion && (
                  <Badge colorScheme="blue" size="sm" variant="subtle">
                    FW: {firmwareVersion}
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>
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
                  key={device.serial || `device-${index}`} // Add this key prop
                  device={device}
                  index={index}
                  isConnected={isConnected}
                  connectedDevice={connectedDevice}
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
              <DeviceStatusDisplay 
  telemetry={telemetry} 
  odriveState={odriveState} 
  selectedAxis={selectedAxis}
/>

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