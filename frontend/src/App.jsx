import { useSelector } from 'react-redux'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Badge,
} from '@chakra-ui/react'

import DeviceList from './components/DeviceList'
import MainTabs from './components/MainTabs'
import './App.css'

function App() {
  const { isConnected, connectedDevice } = useSelector(state => state.device)

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <Flex h="100vh">
        {/* Left Sidebar - Device List */}
        <Box w="300px" bg="gray.800" borderRight="1px solid" borderColor="gray.600" p={4}>
          <VStack spacing={4} align="stretch" h="100%">
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="odrive.300" textAlign="center">
                ODrive GUI v0.5.6
              </Heading>
            </HStack>
            
            <DeviceList />
            
            {isConnected && connectedDevice && (
              <Box mt={4} p={3} bg="gray.700" borderRadius="md">
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Box fontSize="sm" color="gray.300">Status:</Box>
                    <Badge colorScheme="green" variant="solid">Connected</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Box fontSize="sm" color="gray.300">Device:</Box>
                    <Box fontSize="sm" color="white">{connectedDevice.path}</Box>
                  </HStack>
                  <HStack justify="space-between">
                    <Box fontSize="sm" color="gray.300">Serial:</Box>
                    <Box fontSize="sm" color="white" fontFamily="mono">
                      {connectedDevice.serial}
                    </Box>
                  </HStack>
                  <HStack justify="space-between">
                    <Box fontSize="sm" color="gray.300">Firmware:</Box>
                    <Box fontSize="sm" color="odrive.300">{connectedDevice.fw_version}</Box>
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Main Content Area */}
        <MainTabs />
      </Flex>
    </Box>
  )
}

export default App