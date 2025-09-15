import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
} from '@chakra-ui/react'

import DeviceList from './components/DeviceList'
import MainTabs from './components/MainTabs'
import './App.css'

function App() {

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <Flex h="100vh">
        {/* Left Sidebar - Device List */}
        <Box w="300px" bg="gray.800" borderRight="1px solid" borderColor="gray.600" p={4}>
          <VStack spacing={4} align="stretch" h="100%">
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="odrive.300" textAlign="center">
                ODrive GUI
              </Heading>
            </HStack>
            <DeviceList />
          </VStack>
        </Box>

        {/* Main Content Area */}
        <MainTabs />
      </Flex>
    </Box>
  )
}

export default App