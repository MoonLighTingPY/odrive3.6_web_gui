import { useState, useEffect } from 'react'
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
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'
import PropertyTree from '../inspector/property-tree/PropertyTree'
import LiveCharts from '../inspector/LiveCharts'

const InspectorTab = () => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedProperties, setSelectedProperties] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Trigger refresh when tab opens and device is connected
  useEffect(() => {
    if (isConnected) {
      setRefreshTrigger(prev => prev + 1)
    }
  }, [isConnected])

  const updateProperty = async (path, value) => {
    try {
      const response = await fetch('/api/odrive/set_property', {
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
      {/* Main Content Grid */}
      <Grid templateColumns="1fr 1.5fr" gap={6} flex="1" h="100%">
        
        {/* Left Side - Property Tree */}
        <GridItem>
          <PropertyTree
            odriveState={odriveState}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            updateProperty={updateProperty}
            isConnected={isConnected}
            selectedProperties={selectedProperties}
            togglePropertyChart={togglePropertyChart}
            refreshTrigger={refreshTrigger}
          />
        </GridItem>

        {/* Right Side - Live Charts */}
        <GridItem>
          <LiveCharts
            selectedProperties={selectedProperties}
          />
        </GridItem>

      </Grid>
    </VStack>
  )
}

export default InspectorTab