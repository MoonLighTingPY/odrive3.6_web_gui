import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  VStack,
  HStack,
  Text,
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  Button,
  useToast,
  Badge,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'
import PropertyTree from './inspector/PropertyTree'
import StatusOverview from './inspector/StatusOverview'
import ErrorDisplay from './inspector/ErrorDisplay'
import LiveMonitor from './inspector/LiveMonitor'
import LiveDataView from './inspector/LiveDataView'
import CommandConsole from './inspector/CommandConsole'

const InspectorTab = () => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  const [localOdriveState, setLocalOdriveState] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshRate, setRefreshRate] = useState(1000) // ms
  const [activeInspectorTab, setActiveInspectorTab] = useState(0)

  // Use Redux state as primary source, fallback to local state
  const currentOdriveState = Object.keys(odriveState).length > 0 ? odriveState : localOdriveState

  // Auto-refresh when enabled
  useEffect(() => {
    let interval = null
    if (autoRefresh && isConnected) {
      interval = setInterval(() => {
        refreshAllData()
      }, refreshRate)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, isConnected, refreshRate])

  const refreshAllData = async () => {
    if (!isConnected) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/odrive/state')
      if (response.ok) {
        const data = await response.json()
        setLocalOdriveState(data)
        setLastUpdate(new Date())
      } else {
        throw new Error('Failed to read properties')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to refresh data: ${error.message}`,
        status: 'error',
        duration: 3000,
      })
    }
    setIsLoading(false)
  }

  const updateProperty = async (path, value) => {
    if (!isConnected) return

    try {
      const command = `odrv0.${path} = ${value}`
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Updated ${path} = ${value}`,
          status: 'success',
          duration: 2000,
        })
        // Refresh data to show the change
        setTimeout(() => refreshAllData(), 100)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Update failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update ${path}: ${error.message}`,
        status: 'error',
        duration: 5000,
      })
    }
  }

    if (!isConnected) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="info" variant="subtle" borderRadius="md">
          <AlertIcon />
          Connect to an ODrive device to inspect properties and execute commands.
        </Alert>
      </Box>
    )
  }

  return (
    <VStack spacing={6} align="stretch" p={6} h="100%">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          ODrive Inspector
        </Heading>
        <Text color="gray.300" mb={4}>
          Real-time monitoring, debugging, and control of all ODrive properties and states
        </Text>
      </Box>

      {/* Control Panel */}
      <Card bg="gray.800" variant="elevated">
        <CardBody>
          <HStack justify="space-between" wrap="wrap" spacing={4}>
            <HStack spacing={4}>
              <Button
                leftIcon={isLoading ? <Spinner size="sm" /> : <RefreshCw size={16} />}
                onClick={refreshAllData}
                isDisabled={!isConnected}
                isLoading={isLoading}
                colorScheme="blue"
              >
                Refresh All
              </Button>
              
              <HStack>
                <Text color="gray.300" fontSize="sm">Auto-refresh:</Text>
                <Button
                  size="sm"
                  variant={autoRefresh ? "solid" : "outline"}
                  colorScheme="green"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  isDisabled={!isConnected}
                >
                  {autoRefresh ? 'ON' : 'OFF'}
                </Button>
              </HStack>
            </HStack>

            <HStack spacing={4}>
              {lastUpdate && (
                <Text color="gray.400" fontSize="sm">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Text>
              )}
              <Badge colorScheme={isConnected ? 'green' : 'red'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Inspector Tabs */}
      <Card bg="gray.800" variant="elevated" flex="1">
        <CardBody p={0} h="100%">
          <Tabs 
            index={activeInspectorTab} 
            onChange={setActiveInspectorTab}
            variant="enclosed" 
            colorScheme="blue"
            h="100%"
            display="flex"
            flexDirection="column"
          >
            <TabList bg="gray.700" borderColor="gray.600">
              <Tab color="gray.300" _selected={{ color: 'blue.300', borderBottomColor: 'blue.300' }}>
                Property Tree
              </Tab>
              <Tab color="gray.300" _selected={{ color: 'blue.300', borderBottomColor: 'blue.300' }}>
                System Status
              </Tab>
              <Tab color="gray.300" _selected={{ color: 'blue.300', borderBottomColor: 'blue.300' }}>
                Live Monitor
              </Tab>
              <Tab color="gray.300" _selected={{ color: 'blue.300', borderBottomColor: 'blue.300' }}>
                Data Logger
              </Tab>
              <Tab color="gray.300" _selected={{ color: 'blue.300', borderBottomColor: 'blue.300' }}>
                Command Console
              </Tab>
            </TabList>

            <TabPanels flex="1" h="100%">
              <TabPanel p={4} h="100%">
                <PropertyTree
                  odriveState={currentOdriveState}
                  searchFilter={searchFilter}
                  setSearchFilter={setSearchFilter}
                  updateProperty={updateProperty}
                  isConnected={isConnected}
                />
              </TabPanel>
              
              <TabPanel p={4} h="100%">
                <Grid templateColumns="1fr 1fr" gap={6} h="100%">
                  <GridItem>
                    <StatusOverview odriveState={currentOdriveState} />
                  </GridItem>
                  <GridItem>
                    <ErrorDisplay odriveState={currentOdriveState} />
                  </GridItem>
                </Grid>
              </TabPanel>
              
              <TabPanel p={4} h="100%">
                <LiveMonitor 
                  odriveState={currentOdriveState} 
                  refreshRate={refreshRate}
                  setRefreshRate={setRefreshRate}
                />
              </TabPanel>
              
              <TabPanel p={4} h="100%">
                <LiveDataView 
                  odriveState={currentOdriveState}
                  isConnected={isConnected}
                />
              </TabPanel>
              
              <TabPanel p={4} h="100%">
                <CommandConsole isConnected={isConnected} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default InspectorTab