import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Button,
  Select,
  Text,
  Alert,
  AlertIcon,
  Collapse,
  IconButton,
  useDisclosure,
  useToast,
  Divider
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, AddIcon } from '@chakra-ui/icons'
import { 
  getAllAvailablePresets, 
  isFactoryPreset,
  saveCurrentConfigAsPreset,
  loadPresetConfig,
  createAutoBackup
} from '../../utils/configurationPresetsManager'
import PresetSaveDialog from './PresetSaveDialog'
import PresetImportExport from './PresetImportExport'

const PresetManager = ({ 
  onPresetLoad, 
  onPresetSave, 
  isConnected = false 
}) => {
  const [presets, setPresets] = useState({})
  const [selectedPreset, setSelectedPreset] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, onToggle } = useDisclosure()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const toast = useToast()

  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)

  const currentConfig = useMemo(() => ({
  power: powerConfig,
  motor: motorConfig,
  encoder: encoderConfig,
  control: controlConfig,
  interface: interfaceConfig
}), [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig])

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
  }, [toast])

  const handleAutoBackup = useCallback(async () => {
    try {
      createAutoBackup(currentConfig)
      loadPresets() // Refresh preset list
      toast({
        title: 'Auto Backup Created',
        description: 'Configuration automatically backed up',
        status: 'info',
        duration: 2000,
      })
    } catch (error) {
      console.error('Auto backup failed:', error)
    }
  }, [currentConfig, loadPresets, toast])

  // Load presets on component mount
  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  // Auto-backup when connected
  useEffect(() => {
    if (isConnected && Object.keys(currentConfig).length > 0) {
      handleAutoBackup()
    }
  }, [isConnected, currentConfig, handleAutoBackup])

  const handleLoadPreset = async () => {
  if (!selectedPreset) {
    toast({
      title: 'No Preset Selected',
      description: 'Please select a preset to load',
      status: 'warning',
      duration: 3000,
    })
    return
  }

  setIsLoading(true)
  try {
    const config = loadPresetConfig(selectedPreset)
    if (!config) {
      throw new Error(`Preset "${selectedPreset}" not found`)
    }
    
    console.log('Loading preset configuration:', config) // Debug log
    
    toast({
      title: 'Preset Loaded',
      description: `Configuration "${selectedPreset}" loaded`,
      status: 'success',
      duration: 3000,
    })
    
    // Call the parent callback to update the configuration
    if (onPresetLoad) {
      onPresetLoad(config, selectedPreset)
    }
  } catch (error) {
    toast({
      title: 'Load Preset Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    console.error('Failed to load preset:', error)
  } finally {
    setIsLoading(false)
  }
}

  const handleSavePreset = async (name, description) => {
  setIsLoading(true)
  try {
    // Get the actual current configuration - don't use mock data
    let configToSave = currentConfig
    
    // In dev mode, we need to check if we have valid config data
    if (!isConnected && (import.meta.env.DEV || import.meta.env.MODE === 'development')) {
      // Only use mock if we truly have NO config data at all
      if (!configToSave || Object.keys(configToSave).length === 0 || 
          Object.values(configToSave).every(category => !category || Object.keys(category).length === 0)) {
        console.warn('No configuration available, using minimal mock config')
        configToSave = {
          power: { dc_bus_overvoltage_trip_level: 56, dc_max_positive_current: 10 },
          motor: { motor_type: 0, pole_pairs: 7, motor_kv: 150 },
          encoder: { encoder_type: 1, cpr: 4000 },
          control: { control_mode: 3, vel_limit: 10 },
          interface: { enable_can: false }
        }
      }
    } else if (!configToSave || Object.keys(configToSave).length === 0) {
      throw new Error('No configuration to save. Please ensure ODrive is connected.')
    }
    
    console.log('Saving configuration:', configToSave) // Debug log
    
    // Save to localStorage
    saveCurrentConfigAsPreset(configToSave, name, description)
    loadPresets() // Refresh preset list
    setShowSaveDialog(false)
    
    // Auto-export the saved preset as a file
    try {
      const { exportPresetsToFile } = await import('../../utils/configurationPresetsManager')
      exportPresetsToFile(name)
      
      toast({
        title: 'Preset Saved & Exported',
        description: `"${name}" saved and exported to file`,
        status: 'success',
        duration: 5000,
      })
    } catch (exportError) {
      console.warn('Failed to auto-export preset:', exportError)
      toast({
        title: 'Preset Saved',
        description: `"${name}" saved successfully (export failed: ${exportError.message})`,
        status: 'warning',
        duration: 5000,
      })
    }
    
    if (onPresetSave) {
      onPresetSave(name)
    }
  } catch (error) {
    toast({
      title: 'Save Preset Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
    console.error('Failed to save preset:', error)
  } finally {
    setIsLoading(false)
  }
}

  const formatPresetOption = (name) => {
    const isFactory = isFactoryPreset(name)
    const prefix = isFactory ? '[Factory] ' : '[User] '
    return `${prefix}${name}`
  }

  const getPresetDescription = (name) => {
    const preset = presets[name]
    if (!preset) return ''
    
    const isFactory = isFactoryPreset(name)
    const typeText = isFactory ? 'Factory preset' : 'User preset'
    const dateText = preset.timestamp ? 
      ` • Created: ${new Date(preset.timestamp).toLocaleDateString()}` : ''
    
    return `${typeText}${dateText}`
  }

  const presetOptions = Object.keys(presets).sort((a, b) => {
    // Factory presets first, then user presets alphabetically
    const aFactory = isFactoryPreset(a)
    const bFactory = isFactoryPreset(b)
    
    if (aFactory && !bFactory) return -1
    if (!aFactory && bFactory) return 1
    return a.localeCompare(b)
  })

  const hasValidConfig = isConnected && Object.keys(currentConfig).length > 0

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50" _dark={{ bg: 'gray.800' }}>
      <HStack justify="space-between" mb={2}>
        <Text fontSize="lg" fontWeight="semibold">Configuration Presets</Text>
        <IconButton
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={onToggle}
          variant="ghost"
          size="sm"
          aria-label="Toggle presets panel"
        />
      </HStack>

      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={4} align="stretch">
          {!isConnected && (
            <Alert status="info" size="sm">
              <AlertIcon />
              Connect to ODrive to enable preset functionality
            </Alert>
          )}

          {isConnected && !hasValidConfig && (
            <Alert status="warning" size="sm">
              <AlertIcon />
              Loading device configuration...
            </Alert>
          )}

          {/* Load Preset Section */}
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="medium">Load Preset</Text>
            <Select
              placeholder="Select a preset to load..."
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              size="sm"
            >
              {presetOptions.map((name) => (
                <option key={name} value={name}>
                  {formatPresetOption(name)}
                </option>
              ))}
            </Select>
            
            {selectedPreset && (
              <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                {getPresetDescription(selectedPreset)}
                {presets[selectedPreset]?.description && (
                  <Text as="span" display="block" mt={1} fontStyle="italic">
                    {presets[selectedPreset].description}
                  </Text>
                )}
              </Text>
            )}

            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleLoadPreset}
              isDisabled={!selectedPreset || isLoading}
              isLoading={isLoading}
            >
              Load Selected Preset
            </Button>
          </VStack>

          <Divider />

          {/* Save Preset Section */}
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="medium">Save Current Configuration</Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="green"
              onClick={() => setShowSaveDialog(true)}
              isDisabled={!isConnected && !(import.meta.env.DEV || import.meta.env.MODE === 'development')} // Enable in dev mode
              title={!isConnected && !(import.meta.env.DEV || import.meta.env.MODE === 'development') ? "Connect to ODrive to save presets" : "Save current configuration as new preset"}
            >
              Save As New Preset
            </Button>
          </VStack>

          <Divider />

          {/* Import/Export Section */}
          <PresetImportExport onImportComplete={loadPresets} />
        </VStack>
      </Collapse>

      {/* Save Dialog */}
      <PresetSaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSavePreset}
        existingPresets={Object.keys(presets)}
      />
    </Box>
  )
}

export default PresetManager