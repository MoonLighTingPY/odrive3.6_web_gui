import { useState, useEffect, memo } from 'react'
import { useSelector } from 'react-redux'
import {
  VStack,
  HStack,
  Text,
  Box,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
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
import { EnableMotorButton, DisableMotorButton, CalibrationButton, ClearErrorsButton, SaveAndRebootButton } from '../MotorControls'

const InspectorTab = memo(() => {
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
      <Box p={6} bg="gray.900" h="100vh">
        <Alert status="warning" bg="orange.900" borderColor="orange.500">
          <AlertIcon />
          Connect to an ODrive device to view Inspector.
        </Alert>
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" flex="1" overflow="hidden" bg="gray.900" height="calc(100vh - 64px)">
      <Box display="flex" flexDirection="column" flex="1" p={6} minH="0">
        {/* Main Content Grid */}
        <Grid templateColumns="1fr 1.5fr" gap={6} flex="1" minH="0">
          
          {/* Left Side – Property Tree & Motor Controls */}
          <GridItem display="flex" flexDirection="column" flex="1" minH="0">
            {/* make this box scrollable */}
            <Box flex="1" minH="0" overflowY="auto">
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
            </Box>

            {/* Motor controls stay fixed */}
            <Card bg="gray.800" variant="elevated" flexShrink={0} mt={4}>
              <CardHeader py={2}>
                <Heading size="sm" color="white">Motor Controls</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={2}>
                  <SimpleGrid columns={2} spacing={2} w="100%">
                    <EnableMotorButton axisNumber={0} size="sm" />
                    <DisableMotorButton axisNumber={0} size="sm" />
                    <CalibrationButton axisNumber={0} size="sm" />
                    <ClearErrorsButton axisNumber={0} size="sm" />
                    <SaveAndRebootButton size="sm" gridColumn="span 2" />
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Right Side – Live Charts */}
          <GridItem display="flex" flexDirection="column" flex="1" overflow="hidden" minH="0">
            <Box flex="1" overflow="auto">
              <LiveCharts
                selectedProperties={selectedProperties}
                togglePropertyChart={togglePropertyChart}
              />
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  )
})

InspectorTab.displayName = 'InspectorTab'

export default InspectorTab