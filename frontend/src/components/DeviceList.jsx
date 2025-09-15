// This should be inside device List Component
// {isConnected && connectedDevice && (
//   <Box mt={4} p={3} bg="gray.700" borderRadius="md">
//     <VStack spacing={2} align="stretch">
//       <HStack justify="space-between">
//         <Box fontSize="sm" color="gray.300">Status:</Box>
//         <Badge colorScheme="green" variant="solid">Connected</Badge>
//       </HStack>
//       <HStack justify="space-between">
//         <Box fontSize="sm" color="gray.300">Device:</Box>
//         <Box fontSize="sm" color="white">{connectedDevice.path}</Box>
//       </HStack>
//       <HStack justify="space-between">
//         <Box fontSize="sm" color="gray.300">Serial:</Box>
//         <Box fontSize="sm" color="white" fontFamily="mono">
//           {connectedDevice.serial}
//         </Box>
//       </HStack>
//       <HStack justify="space-between">
//         <Box fontSize="sm" color="gray.300">Firmware:</Box>
//         <Box fontSize="sm" color="odrive.300">{connectedDevice.fw_version}</Box>
//       </HStack>
//     </VStack>
//   </Box>
// )}

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Badge,
  Spinner,
  Divider,
} from '@chakra-ui/react'
import { fetchDevices, connectDevice, disconnectDevice } from '../store/slices/deviceSlice'

const DeviceList = () => {
  const dispatch = useDispatch()
  const { availableDevices, connectedDevice, isLoading } = useSelector((s) => s.device)

  useEffect(() => {
    dispatch(fetchDevices())
    const interval = setInterval(() => dispatch(fetchDevices()), 3000) // simple polling
    return () => clearInterval(interval)
  }, [dispatch])

  const handleConnect = (dev) => {
    dispatch(connectDevice(dev))
  }

  const handleDisconnect = () => {
    dispatch(disconnectDevice())
  }

  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <Text fontWeight="semibold" color="odrive.300">Devices</Text>
        {isLoading ? <Spinner size="xs" /> : null}
      </HStack>

      <Box maxH="60vh" overflowY="auto" p={2}>
        {availableDevices.length === 0 && !isLoading && (
          <Text color="gray.400" fontSize="sm">No devices found</Text>
        )}

        {availableDevices.map((d) => {
          const serial = d.serial_number || 'unknown'
          const isConnected = connectedDevice && connectedDevice.serial_number === serial
          return (
            <Box key={serial} p={3} bg={isConnected ? 'gray.700' : 'gray.800'} borderRadius="md" mb={2}>
              <HStack justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" fontFamily="mono">{serial}</Text>
                  <Text fontSize="xs" color="gray.400">{d.fw_version || 'fw: ?'}</Text>
                </Box>
                <HStack>
                  {isConnected ? <Badge colorScheme="green">Connected</Badge> : null}
                  <Button size="sm" onClick={() => (isConnected ? handleDisconnect() : handleConnect(d))}>
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </Button>
                </HStack>
              </HStack>
            </Box>
          )
        })}
      </Box>

      <Divider />
      <Box>
        <Text fontSize="xs" color="gray.400">Tip: select a device to enable tabs</Text>
      </Box>
    </VStack>
  )
}

export default DeviceList