import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Spacer,
  Badge,
} from '@chakra-ui/react'

import DeviceList from './components/DeviceList'
import ConfigurationTab from './components/tabs/ConfigurationTab'
import DashboardTab from './components/tabs/DashboardTab'
import InspectorTab from './components/tabs/InspectorTab'
import PresetsTab from './components/tabs/PresetsTab'
import CommandConsoleTab from './components/tabs/CommandConsoleTab'
import { updateOdriveState } from './store/slices/deviceSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const { isConnected, connectedDevice, odriveState } = useSelector(state => state.device)
  const [activeTab, setActiveTab] = useState(0)

  // Poll device state when connected
  useEffect(() => {
    if (!isConnected) return

    const pollDeviceState = async () => {
      try {
        const response = await fetch('/api/odrive/state')
        if (response.ok) {
          const state = await response.json()
          dispatch(updateOdriveState(state))
        }
      } catch (error) {
        console.error('Failed to poll device state:', error)
      }
    }

    // Poll every 500ms
    const interval = setInterval(pollDeviceState, 500)
    
    // Initial poll
    pollDeviceState()

    return () => clearInterval(interval)
  }, [isConnected, dispatch])

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
        <Box flex="1" bg="gray.900">
          <Tabs 
            index={activeTab} 
            onChange={setActiveTab}
            variant="enclosed" 
            colorScheme="odrive"
            h="100%"
            display="flex"
            flexDirection="column"
          >
            <TabList bg="gray.800" borderBottom="1px solid" borderColor="gray.600" px={6}>
              {/* Configuration Tab */}
              <Tab
                bg="gray.700"
                color="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.800' }}
                _selected={{
                  bg: 'gray.900',
                  color: 'odrive.300',
                  borderBottom: '3px solid',
                  borderBottomColor: 'odrive.300',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                }}
              >
                Configuration
              </Tab>

              {/* Dashboard Tab */}
              <Tab
                bg="gray.700"
                color="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.800' }}
                _selected={{
                  bg: 'gray.900',
                  color: 'odrive.300',
                  borderBottom: '3px solid',
                  borderBottomColor: 'odrive.300',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                }}
              >
                Dashboard
              </Tab>

              {/* Inspector Tab */}
              <Tab
                bg="gray.700"
                color="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.800' }}
                _selected={{
                  bg: 'gray.900',
                  color: 'odrive.300',
                  borderBottom: '3px solid',
                  borderBottomColor: 'odrive.300',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                }}
              >
                Inspector
              </Tab>

              {/* Presets Tab */}
              <Tab
                bg="gray.700"
                color="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.800' }}
                _selected={{
                  bg: 'gray.900',
                  color: 'odrive.300',
                  borderBottom: '3px solid',
                  borderBottomColor: 'odrive.300',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                }}
              >
                Presets
              </Tab>

              { /* Command Console Tab */}
              <Tab
                bg="gray.700"
                color="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.800' }}
                _selected={{
                  bg: 'gray.900',
                  color: 'odrive.300',
                  borderBottom: '3px solid',
                  borderBottomColor: 'odrive.300',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                }}
              >
                Command Console
              </Tab>

              <Spacer />
              <HStack spacing={4} pr={4}>
                {isConnected && (
                  <Badge colorScheme="green" variant="outline" fontSize="xs">
                    Connected to {connectedDevice?.path}
                  </Badge>
                )}
              </HStack>
            </TabList>

            <TabPanels flex="1" bg="gray.900">
              <TabPanel p={0} h="100%">
                <ConfigurationTab isConnected={isConnected} />
              </TabPanel>
              
              <TabPanel p={0} h="100%">
                <DashboardTab isConnected={isConnected} odriveState={odriveState} />
              </TabPanel>
              
              <TabPanel p={0} h="100%">
                <InspectorTab isConnected={isConnected} odriveState={odriveState} />
              </TabPanel>

              <TabPanel p={0} h="100%">
                <PresetsTab />
              </TabPanel>

              <TabPanel p={0} h="100%">
                <CommandConsoleTab />
              </TabPanel>
            </TabPanels>

          </Tabs>
        </Box>
      </Flex>
    </Box>
  )
}

export default App