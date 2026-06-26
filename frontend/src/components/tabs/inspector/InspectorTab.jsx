import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react'
import * as backend from '../../../api/backend'
import PropertyTree from './property-tree/PropertyTree'
import LiveCharts from './LiveCharts'
import MotorControlsCard from '../../MotorControlsCard'
import { useApiPropertyTree } from '../../../hooks/useApiPropertyTree'
import '../../../styles/InspectorTab.css'

const InspectorTab = ({ isConnected, isActive = true }) => {
  const toast = useToast()
  const propertyTree = useApiPropertyTree()
  const serial = useSelector((s) => s.device.connectedDevice?.serial_number)

  // Write a single property and surface the result as a toast (dev parity).
  const updateProperty = useCallback(
    async (path, value) => {
      if (!serial) {
        toast({ title: 'Not connected', status: 'warning', duration: 2500 })
        throw new Error('Not connected')
      }
      try {
        const res = await backend.writeProperties(serial, [{ path, value }])
        const r = Array.isArray(res) ? res[0] : null
        if (r && r.status && r.status !== 'ok') throw new Error(r.error || 'Write failed')
        toast({ title: 'Value updated', description: `${path} = ${value}`, status: 'success', duration: 2000 })
      } catch (err) {
        toast({ title: 'Write failed', description: String(err.message || err), status: 'error', duration: 4000 })
        throw err
      }
    },
    [serial, toast]
  )

  return (
    <Box className="inspector-tab" h="100%" display="flex" flexDirection="column" bg="gray.900">
      <Box flex="1" minH="0" p={4}>
        {!isConnected && (
          <Alert status="info" variant="left-accent" mb={3} borderRadius="md">
            <AlertIcon />
            Connect to an ODrive to read and edit live values.
          </Alert>
        )}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1.5fr' }} gap={4} h="100%" minH="0">
          {/* Left: property tree + motor controls */}
          <GridItem display="flex" flexDirection="column" minH="0">
            <Box flex="1" minH="0">
              <PropertyTree
                propertyTree={propertyTree}
                isConnected={isConnected}
                serial={serial}
                updateProperty={updateProperty}
              />
            </Box>
            <Box flexShrink={0} mt={3}>
              <MotorControlsCard isActive={isActive} />
            </Box>
          </GridItem>

          {/* Right: live charts */}
          <GridItem display="flex" flexDirection="column" minH="0" overflow="hidden">
            <Box flex="1" minH="0" overflow="hidden">
              <LiveCharts isActive={isActive} />
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  )
}

export default InspectorTab
