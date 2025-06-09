import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  VStack,
  HStack,
  Text,
  Box,
  Card,
  CardBody,
  Heading,
  Alert,
  AlertIcon,
  Button,
  useToast,
  Badge,
  Spinner,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'
import PropertyTree from '../inspector/PropertyTree'
import LiveCharts from '../inspector/LiveCharts'

const InspectorTab = () => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  const [localOdriveState, setLocalOdriveState] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshRate, setRefreshRate] = useState(1000) // ms
  const [selectedProperties, setSelectedProperties] = useState([])

  // Use Redux state as primary source, fallback to local state
  const currentOdriveState = Object.keys(odriveState).length > 0 ? odriveState : localOdriveState

  // Auto-refresh when enabled
  const refreshAllData = useCallback(async () => {
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
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, toast])

  useEffect(() => {
    let interval
    if (autoRefresh && isConnected) {
      interval = setInterval(refreshAllData, refreshRate)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, isConnected, refreshRate, refreshAllData])

  const updateProperty = async (path, value) => {
    try {
      const response = await fetch('/api/odrive/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, value })
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

  const togglePropertyChart = (propertyPath) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyPath)) {
        return prev.filter(p => p !== propertyPath)
      } else {
        return [...prev, propertyPath]
      }
    })
  }

  const shouldShowInspector = () => {
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    return isDevelopment || isConnected
  }

  if (!shouldShowInspector()) {
    return (
      <Box p={6} bg="gray.900" h="100%">
        <Alert status="warning" bg="orange.900" borderColor="orange.500">
          <AlertIcon />
          Connect to an ODrive device to view Inspector.
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
          Monitor properties in real-time and create live charts by selecting properties from the tree
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
              {selectedProperties.length > 0 && (
                <Badge colorScheme="blue">
                  {selectedProperties.length} properties charted
                </Badge>
              )}
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

      {/* Main Content Grid */}
      <Grid templateColumns="1fr 1fr" gap={6} flex="1" h="100%">
        
        {/* Left Side - Property Tree */}
        <GridItem>
          <PropertyTree
            odriveState={currentOdriveState}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            updateProperty={updateProperty}
            isConnected={isConnected}
            selectedProperties={selectedProperties}
            togglePropertyChart={togglePropertyChart}
          />
        </GridItem>

        {/* Right Side - Live Charts */}
        <GridItem>
          <LiveCharts
            selectedProperties={selectedProperties}
            odriveState={currentOdriveState}
            isConnected={isConnected}
          />
        </GridItem>

      </Grid>
    </VStack>
  )
}

export default InspectorTab