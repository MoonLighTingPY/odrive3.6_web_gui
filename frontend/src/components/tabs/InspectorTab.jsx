import { useState, useEffect, memo, useCallback } from 'react'
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
import { setActiveOdriveFirmwareVersion } from '../../utils/odriveUnifiedRegistry'

const InspectorTab = memo(() => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedProperties, setSelectedProperties] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
    toast({
      title: 'Refreshing properties',
      status: 'info',
      duration: 1000,
    })
  }, [toast])

  // Trigger refresh when tab opens and device is connected
  useEffect(() => {
    if (isConnected) {
      setRefreshTrigger(prev => prev + 1)
    }
  }, [isConnected])

  // Select correct registry based on connected device firmware version
  useEffect(() => {
    if (!odriveState) return
    // Prefer system fields if present
    const sys = odriveState.system || odriveState
    if (sys && (sys.fw_version_major != null || typeof sys.firmware_version === 'string')) {
      if (sys.fw_version_major != null) {
        setActiveOdriveFirmwareVersion({
          fw_version_major: sys.fw_version_major,
          fw_version_minor: sys.fw_version_minor,
          fw_version_revision: sys.fw_version_revision,
        })
      } else {
        setActiveOdriveFirmwareVersion(sys.firmware_version) // e.g. "0.6.10"
      }
    }
  }, [
    odriveState,
    odriveState?.system?.fw_version_major,
    odriveState?.system?.fw_version_minor,
    odriveState?.system?.fw_version_revision,
  ])

  // Compute firmware label for UI
  const firmwareLabel = (() => {
    const sys = odriveState?.system || odriveState
    if (!sys) return null
    if (typeof sys.firmware_version === 'string' && sys.firmware_version) return sys.firmware_version
    if (sys.fw_version_major != null) {
      const major = sys.fw_version_major
      const minor = sys.fw_version_minor ?? 0
      const rev = sys.fw_version_revision ?? 0
      return `${major}.${minor}.${rev}`
    }
    return null
  })()

  const updateProperty = useCallback(async (path, value) => {
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
        // Try to parse JSON error, otherwise use text
        const responseText = await response.text()
        let message = responseText
        try {
          const errorObj = JSON.parse(responseText)
          message = errorObj.error || message
        } catch {
          // noop
        }
        throw new Error(message || 'Update failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update ${path}: ${error.message}`,
        status: 'error',
        duration: 5000,
      })
    }
  }, [toast])

  const togglePropertyChart = useCallback((propertyPath) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyPath)) {
        return prev.filter(p => p !== propertyPath)
      } else {
        return [...prev, propertyPath]
      }
    })
  }, [])

  const isInspectorVisible = (import.meta.env.DEV || import.meta.env.MODE === 'development') || isConnected

  if (!isInspectorVisible) {
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
        {/* Toolbar */}
        <HStack justify="space-between" mb={4}>
          <HStack spacing={3}>
            <Heading size="sm" color="white">Inspector</Heading>
            {firmwareLabel && (
              <Badge colorScheme="green" variant="subtle" title="Firmware version">
                FW {firmwareLabel}
              </Badge>
            )}
            {isConnected ? (
              <Badge colorScheme="green">Connected</Badge>
            ) : (
              <Badge colorScheme="red">Disconnected</Badge>
            )}
          </HStack>
          <Button
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            variant="outline"
            colorScheme="blue"
          >
            Refresh
          </Button>
        </HStack>

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
                <Heading size="sm" color="white">Motor Controls - Axis {selectedAxis}</Heading>
              </CardHeader>
              <CardBody py={2}>
                <VStack spacing={2}>
                  <SimpleGrid columns={2} spacing={2} w="100%">
                    <EnableMotorButton axisNumber={selectedAxis} size="sm" />
                    <DisableMotorButton axisNumber={selectedAxis} size="sm" />
                    <CalibrationButton axisNumber={selectedAxis} size="sm" />
                    <ClearErrorsButton axisNumber={selectedAxis} size="sm" />
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