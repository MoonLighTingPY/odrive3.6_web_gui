import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
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
  SimpleGrid
} from '@chakra-ui/react'
import { RefreshCw, Save, Upload } from 'lucide-react'
import { 
  getAllAvailablePresets, 
  createAutoBackup,
  cleanupAutoBackups
} from '../../utils/configurationPresetsManager'
import {
  applyPresetAndSaveAction
} from '../../utils/configurationPresetsActions'
import PresetManager from '../presets/PresetManager'
import PresetList from '../presets/PresetList'
import PresetComparison from '../presets/PresetComparison'
import PresetImportExport from '../presets/PresetImportExport'

const PresetsTab = () => {
  const dispatch = useDispatch()
  const toast = useToast()
  const { isConnected } = useSelector(state => state.device)
  const [deviceConfig, setDeviceConfig] = useState({})
  // eslint-disable-next-line no-unused-vars
  const [presets, setPresets] = useState({})
  const [selectedPreset, setSelectedPreset] = useState('')
  const [setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [ setLastUpdate] = useState(null)

  // Load current device configuration
  const loadDeviceConfig = useCallback(async () => {
    if (!isConnected) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/odrive/configuration')
      if (response.ok) {
        const config = await response.json()
        setDeviceConfig(config)
        setLastUpdate(new Date())
      } else {
        throw new Error('Failed to load device configuration')
      }
    } catch (error) {
      toast({
        title: 'Failed to Load Configuration',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, toast, setLastUpdate, setIsLoading])

  // Load presets
  const loadPresets = useCallback(() => {
    try {
      const availablePresets = getAllAvailablePresets()
      setPresets(availablePresets)
    } catch (error) {
      toast({
        title: 'Failed to Load Presets',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }, [toast, setPresets])

  // Auto-backup when connected
  useEffect(() => {
    if (isConnected && Object.keys(deviceConfig).length > 0) {
      try {
        createAutoBackup(deviceConfig)
        cleanupAutoBackups()
        loadPresets()
      } catch (error) {
        console.error('Auto backup failed:', error)
      }
    }
  }, [isConnected, deviceConfig, loadPresets])

  // Load data on mount and connection
  useEffect(() => {
    loadPresets()
    if (isConnected) {
      loadDeviceConfig()
    } else {
      setDeviceConfig({})
    }
  }, [isConnected, loadDeviceConfig, loadPresets])

  const handlePresetLoad = (config, presetName) => {
  console.log('PresetsTab: Loading preset config:', config) // Debug log
  
  // Update Redux store with the loaded configuration
  if (config.power) {
    dispatch({ type: 'config/updatePowerConfig', payload: config.power })
  }
  if (config.motor) {
    dispatch({ type: 'config/updateMotorConfig', payload: config.motor })
  }
  if (config.encoder) {
    dispatch({ type: 'config/updateEncoderConfig', payload: config.encoder })
  }
  if (config.control) {
    dispatch({ type: 'config/updateControlConfig', payload: config.control })
  }
  if (config.interface) {
    dispatch({ type: 'config/updateInterfaceConfig', payload: config.interface })
  }
  
  // IMPORTANT: Also trigger an event that ConfigurationTab can listen to
  // This will update the local deviceConfig state
  window.dispatchEvent(new CustomEvent('presetLoaded', { 
    detail: { config, presetName } 
  }))
  
  setSelectedPreset(presetName)
  
  toast({
    title: 'Preset Loaded',
    description: `Configuration "${presetName}" selected and loaded to config tab`,
    status: 'success',
    duration: 3000,
  })
}

// Also update the handlePresetSave function around line 170:

const handlePresetSave = (presetName) => {
  loadPresets() // Refresh preset list
  setSelectedPreset(presetName)
  
  toast({
    title: 'Preset Saved',
    description: `Current configuration saved as "${presetName}"`,
    status: 'success',
    duration: 3000,
  })
}

  const handleApplyPreset = async (presetName) => {
    if (!presetName) return

    try {
      await applyPresetAndSaveAction(presetName, toast)
      await loadDeviceConfig() // Refresh current config
    } catch (error) {
      console.error('Failed to apply preset:', error)
    }
  }

  const shouldShowPresets = () => {
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    return isDevelopment || isConnected
  }

  if (!shouldShowPresets()) {
    return (
      <Box p={6} bg="gray.900" h="100%">
        <Alert status="warning" bg="orange.900" borderColor="orange.500">
          <AlertIcon />
          Connect to an ODrive device to access preset management.
        </Alert>
      </Box>
    )
  }


  return (
    <VStack spacing={6} align="stretch" p={6} h="100%">
      
      {/* Header */}
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Configuration Presets
        </Heading>
        <Text color="gray.300" mb={4}>
          Manage, save, load, and share ODrive configuration presets
        </Text>
      </Box>



      {/* Main Preset Management Tabs */}
      <Card bg="gray.800" variant="elevated" flex="1">
        <CardBody p={0} h="100%">
          <Tabs 
            index={activeTab} 
            onChange={setActiveTab}
            variant="enclosed" 
            colorScheme="blue"
            h="100%"
            display="flex"
            flexDirection="column"
          >
            <TabList bg="gray.700" borderColor="gray.600">
              <Tab color="gray.300" _selected={{ color: 'blue.300', borderBottomColor: 'blue.300' }}>
                <HStack spacing={2}>
                  <Save size={16} />
                  <Text>Save/Load</Text>
                </HStack>
              </Tab>
              <Tab color="gray.300" _selected={{ color: 'blue.300', borderBottomColor: 'blue.300' }}>
                <HStack spacing={2}>
                  <Text>📋</Text>
                  <Text>Manage Presets</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels flex="1" h="100%">
              
              {/* Quick Actions Tab */}
              <TabPanel p={6} h="100%">
                <VStack spacing={6} align="stretch" h="100%">
                  
            

                  {/* Quick Actions */}
                  <PresetManager
                    currentConfig={deviceConfig}
                    onPresetLoad={handlePresetLoad}
                    onPresetSave={handlePresetSave}
                    isConnected={isConnected}
                  />

                  {/* Quick Apply Section */}
                  {selectedPreset && (
                    <Card bg="purple.900" variant="elevated" borderColor="purple.500" borderWidth="1px">
                      <CardHeader>
                        <Heading size="md" color="white">Apply Preset to ODrive</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Text color="gray.300">
                            Selected preset: <Text as="span" color="purple.300" fontWeight="bold">{selectedPreset}</Text>
                          </Text>
                          
                          <Button
                            colorScheme="purple"
                            size="lg"
                            onClick={() => handleApplyPreset(selectedPreset)}
                            isDisabled={!isConnected}
                          >
                            Apply "{selectedPreset}" & Save to ODrive
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </TabPanel>
              
              {/* Browse Presets Tab */}
              <TabPanel p={6} h="100%">
                <PresetList 
                  onPresetLoad={handlePresetLoad}
                  onRefreshNeeded={loadPresets}
                />
              </TabPanel>
              
              
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default PresetsTab