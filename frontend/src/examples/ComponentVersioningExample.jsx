/**
 * Example: How to Use ODrive 0.6.x Component Variants
 * 
 * This file demonstrates the various ways to use the dual-app architecture
 * for supporting both ODrive 0.5.x and 0.6.x devices in the same codebase.
 */

import React from 'react'
import { Box, VStack, Heading, Alert, AlertIcon, Text, Badge } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

// Method 1: Direct Import (for specific use cases)
import ControlConfigStep06 from '../components/config-steps/ControlConfigStep_0_6'
import PropertyTree06 from '../components/inspector/property-tree/PropertyTree_0_6'

// Method 2: Component Version Selector (recommended)
import {
  useVersionedComponent,
  useVersionInfo,
  VersionedControlConfigStep,
  VersionedPropertyTree,
  VersionedPresetManager,
} from '../utils/componentVersionSelector'

// Method 3: Manual version detection
import { useVersionedUtils } from '../utils/versionSelection'

const ExampleUsage = () => {
  const { isConnected } = useSelector(state => state.device)
  
  // Get version information
  const versionInfo = useVersionInfo()
  
  // Get version-aware utilities
  const { is0_6, versionName, registry } = useVersionedUtils()

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        
        <Heading color="white" size="lg">
          ODrive 0.6.x Component Variants Demo
        </Heading>

        {/* Version Status */}
        <Alert status={is0_6 ? "success" : "info"}>
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">
              Current Firmware: {versionInfo.displayName}
            </Text>
            <Text fontSize="sm">
              Using {versionName} components and utilities
            </Text>
          </Box>
        </Alert>

        {/* Method 1: Direct Import Examples */}
        <Box>
          <Heading size="md" color="blue.400" mb={3}>
            Method 1: Direct Import (Specific 0.6.x Usage)
          </Heading>
          <Text color="gray.300" mb={3} fontSize="sm">
            Use when you specifically need 0.6.x components regardless of connected device.
          </Text>
          
          {is0_6 && (
            <VStack spacing={4} align="stretch">
              <Box bg="gray.800" p={4} borderRadius="md" border="1px solid" borderColor="green.600">
                <Text fontSize="sm" color="green.400" mb={2}>✨ 0.6.x Control Configuration</Text>
                <ControlConfigStep06 
                  deviceConfig={{ control: {} }}
                  onReadParameter={() => {}}
                  onUpdateConfig={() => {}}
                  loadingParams={new Set()}
                />
              </Box>
            </VStack>
          )}
        </Box>

        {/* Method 2: Automatic Version Selection (Recommended) */}
        <Box>
          <Heading size="md" color="green.400" mb={3}>
            Method 2: Automatic Version Selection (Recommended)
          </Heading>
          <Text color="gray.300" mb={3} fontSize="sm">
            Components automatically switch between 0.5.x and 0.6.x variants based on firmware.
          </Text>
          
          <VStack spacing={4} align="stretch">
            {/* Example: Versioned Control Config Step */}
            <Box bg="gray.800" p={4} borderRadius="md" border="1px solid" borderColor={is0_6 ? "green.600" : "blue.600"}>
              <Text fontSize="sm" color={is0_6 ? "green.400" : "blue.400"} mb={2}>
                🔄 Auto-Selected {versionName} Control Configuration
              </Text>
              <VersionedControlConfigStep 
                deviceConfig={{ control: {} }}
                onReadParameter={() => {}}
                onUpdateConfig={() => {}}
                loadingParams={new Set()}
              />
            </Box>

            {/* Example: Versioned Property Tree */}
            <Box bg="gray.800" p={4} borderRadius="md" border="1px solid" borderColor={is0_6 ? "green.600" : "blue.600"}>
              <Text fontSize="sm" color={is0_6 ? "green.400" : "blue.400"} mb={2}>
                🔄 Auto-Selected {versionName} Property Tree
              </Text>
              <VersionedPropertyTree 
                odriveState={{}}
                searchFilter=""
                updateProperty={() => {}}
                isConnected={isConnected}
                selectedProperties={[]}
                togglePropertyChart={() => {}}
                refreshTrigger={0}
              />
            </Box>

            {/* Example: Versioned Preset Manager */}
            <Box bg="gray.800" p={4} borderRadius="md" border="1px solid" borderColor={is0_6 ? "green.600" : "blue.600"}>
              <Text fontSize="sm" color={is0_6 ? "green.400" : "blue.400"} mb={2}>
                🔄 Auto-Selected {versionName} Preset Manager
              </Text>
              <VersionedPresetManager />
            </Box>
          </VStack>
        </Box>

        {/* Method 3: Hook-based Selection */}
        <Box>
          <Heading size="md" color="purple.400" mb={3}>
            Method 3: Hook-based Dynamic Selection
          </Heading>
          <Text color="gray.300" mb={3} fontSize="sm">
            Use hooks to get the appropriate component variant in your code.
          </Text>
          
          <HookBasedExample />
        </Box>

        {/* Feature Comparison */}
        <Box>
          <Heading size="md" color="yellow.400" mb={3}>
            0.6.x Enhanced Features
          </Heading>
          <VStack spacing={2} align="stretch">
            <FeatureComparison feature="Initialization Settings" description="init_pos, init_vel, init_torque for smooth startup" />
            <FeatureComparison feature="Harmonic Compensation" description="Improved velocity smoothness with misaligned magnets" />
            <FeatureComparison feature="Encoder De-skewing" description="Compensate for off-axis mounted encoders" />
            <FeatureComparison feature="RS485 Encoder Support" description="Replaces AMT21 with enhanced RS485 communication" />
            <FeatureComparison feature="CAN-FD Support" description="Higher bandwidth CAN communication" />
            <FeatureComparison feature="Enhanced Current Control" description="dI/dt feedforward for better performance" />
            <FeatureComparison feature="Improved Thermistors" description="PT1000, KTY83/122, KTY84/130 support" />
            <FeatureComparison feature="Better Error Reporting" description="detailed_disarm_reason and enhanced diagnostics" />
          </VStack>
        </Box>

        {/* Integration Tips */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Integration Tips</Text>
            <VStack align="start" spacing={1} fontSize="sm" mt={2}>
              <Text>• Use VersionedComponents in MainTabs.jsx and other root components</Text>
              <Text>• 0.5.x components remain completely unchanged and work as before</Text>
              <Text>• 0.6.x variants handle all new features automatically</Text>
              <Text>• Version detection is automatic based on fw_is_0_6 Redux state</Text>
              <Text>• All existing code continues to work - this is purely additive</Text>
            </VStack>
          </Box>
        </Alert>

      </VStack>
    </Box>
  )
}

// Hook-based component selection example
const HookBasedExample = () => {
  // Get the appropriate component variant using hooks
  const ControlConfigComponent = useVersionedComponent('ControlConfigStep')
  const PropertyTreeComponent = useVersionedComponent('PropertyTree')
  
  const versionInfo = useVersionInfo()

  if (!ControlConfigComponent || !PropertyTreeComponent) {
    return <Text color="red.400">Failed to resolve component variants</Text>
  }

  return (
    <Box bg="gray.800" p={4} borderRadius="md" border="1px solid" borderColor="purple.600">
      <Text fontSize="sm" color="purple.400" mb={3}>
        🎯 Hook-selected {versionInfo.displayName} Components
      </Text>
      <Text fontSize="xs" color="gray.400" mb={2}>
        Available components: {versionInfo.availableComponents.join(', ')}
      </Text>
      {/* Use the dynamically selected components */}
      <ControlConfigComponent 
        deviceConfig={{ control: {} }}
        onReadParameter={() => {}}
        onUpdateConfig={() => {}}
        loadingParams={new Set()}
      />
    </Box>
  )
}

// Feature comparison component
const FeatureComparison = ({ feature, description }) => (
  <Box bg="gray.700" p={3} borderRadius="md" borderLeft="4px solid" borderColor="green.400">
    <HStack justify="space-between">
      <Text fontSize="sm" fontWeight="medium" color="white">
        {feature}
      </Text>
      <Badge colorScheme="green" variant="solid" fontSize="xs">
        0.6.x
      </Badge>
    </HStack>
    <Text fontSize="xs" color="gray.400" mt={1}>
      {description}
    </Text>
  </Box>
)

export default ExampleUsage