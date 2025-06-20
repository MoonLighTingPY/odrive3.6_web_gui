import { useState, lazy, Suspense } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spacer,
  Spinner,
  Text,
} from '@chakra-ui/react'

import UpdateChecker from './UpdateChecker'
import { useDashboardTelemetry } from '../hooks/useDashboardTelemetry'

// Lazy-loaded tab components
const ConfigurationTab = lazy(() => import('./tabs/ConfigurationTab'))
const InspectorTab = lazy(() => import('./tabs/InspectorTab'))
const DashboardTab = lazy(() => import('./tabs/DashboardTab'))
const PresetsTab = lazy(() => import('./tabs/PresetsTab'))
const CommandConsoleTab = lazy(() => import('./tabs/CommandConsoleTab'))

// Lightweight loading component
const TabLoadingFallback = () => (
  <Box 
    h="100%" 
    display="flex" 
    alignItems="center" 
    justifyContent="center"
    bg="gray.900"
  >
    <VStack spacing={3}>
      <Spinner 
        size="lg" 
        color="odrive.300" 
        thickness="3px"
        speed="0.8s"
      />
      <Text 
        color="gray.400" 
        fontSize="sm"
        fontWeight="medium"
      >
        Loading tab...
      </Text>
    </VStack>
  </Box>
)

// Tab configuration
const TAB_CONFIG = [
  {
    id: 'configuration',
    label: 'Configuration',
    component: ConfigurationTab,
    requiresConnection: false
  },
  {
    id: 'presets',
    label: 'Presets',
    component: PresetsTab,
    requiresConnection: false
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    component: DashboardTab,
    requiresConnection: false,
    isActive: true // Pass active state for dashboard
  },
  {
    id: 'inspector',
    label: 'Inspector',
    component: InspectorTab,
    requiresConnection: false
  },
  {
    id: 'console',
    label: 'Command Console',
    component: CommandConsoleTab,
    requiresConnection: false
  }
]

const MainTabs = () => {
  const { isConnected, connectedDevice, odriveState } = useSelector(state => state.device)
  const [activeTab, setActiveTab] = useState(0)

  // Hook for dashboard telemetry
  useDashboardTelemetry()

  const renderTabContent = (tabConfig, index) => {
    const Component = tabConfig.component
    const commonProps = { isConnected }
    
    // Add specific props based on tab type
    const getTabProps = () => {
      switch (tabConfig.id) {
        case 'dashboard':
          return {
            ...commonProps,
            odriveState,
            isActive: activeTab === index
          }
        case 'inspector':
          return {
            ...commonProps,
            odriveState
          }
        default:
          return commonProps
      }
    }

    return (
      <TabPanel key={tabConfig.id} p={0} h="100%">
        <Component {...getTabProps()} />
      </TabPanel>
    )
  }

  return (
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
          {TAB_CONFIG.map((tabConfig) => (
            <Tab
              key={tabConfig.id}
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
              {tabConfig.label}
            </Tab>
          ))}

          <Spacer />
          <HStack spacing={4} pr={4}>
            <UpdateChecker />
          </HStack>
        </TabList>

        <Suspense fallback={<TabLoadingFallback />}>
          <TabPanels flex="1" bg="gray.900">
            {TAB_CONFIG.map((tabConfig, index) => renderTabContent(tabConfig, index))}
          </TabPanels>
        </Suspense>
      </Tabs>
    </Box>
  )
}

export default MainTabs