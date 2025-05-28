import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react'
import { setAvailableDevices, setConnectedDevice, updateOdriveState, setScanning } from '../store/slices/deviceSlice'
import '../styles/DeviceList.css'

const DeviceList = () => {
  const dispatch = useDispatch()
  const { availableDevices, connectedDevice, isConnected, isScanning, odriveState } = useSelector(state => state.device)

  useEffect(() => {
    scanForDevices()
  }, [])

  useEffect(() => {
    // Poll ODrive state when connected
    if (isConnected) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/odrive/state')
          if (response.ok) {
            const state = await response.json()
            dispatch(updateOdriveState(state))
          }
        } catch (error) {
          console.error('Failed to fetch ODrive state:', error)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isConnected, dispatch])

  const scanForDevices = async () => {
    dispatch(setScanning(true))
    try {
      const response = await fetch('/api/odrive/scan')
      if (response.ok) {
        const deviceList = await response.json()
        dispatch(setAvailableDevices(deviceList))
      }
    } catch (error) {
      console.error('Failed to scan for devices:', error)
    }
    dispatch(setScanning(false))
  }

  const handleConnect = async (device) => {
    try {
      const response = await fetch('/api/odrive/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device })
      })
      
      if (response.ok) {
        dispatch(setConnectedDevice(device))
      }
    } catch (error) {
      console.error('Failed to connect to ODrive:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await fetch('/api/odrive/disconnect', { method: 'POST' })
      dispatch(setConnectedDevice(null))
      dispatch(updateOdriveState({}))
    } catch (error) {
      console.error('Failed to disconnect from ODrive:', error)
    }
  }

  const getStatusColor = (state) => {
    if (!state.axis0) return 'gray'
    const axisState = state.axis0.current_state
    if (axisState === 8) return 'green' // CLOSED_LOOP_CONTROL
    if (axisState === 1) return 'blue' // IDLE
    if (axisState >= 2 && axisState <= 7) return 'yellow' // Calibration states
    return 'red' // Error or undefined
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
                            {isConnected && connectedDevice?.serial === device.serial ? 'Connected' : 'Disconnected'}
                          </Badge>
                          {isConnected && connectedDevice?.serial === device.serial ? (
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={handleDisconnect}
                            >
                              Disconnect
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
                {odriveState.axis0?.error && odriveState.axis0.error !== 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="red.300">Error:</Text>
                    <Text fontSize="sm" fontWeight="bold" color="red.300">
                      0x{odriveState.axis0.error.toString(16).toUpperCase()}
                    </Text>
                  </HStack>
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