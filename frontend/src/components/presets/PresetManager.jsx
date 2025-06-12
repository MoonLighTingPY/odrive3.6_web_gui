import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  useToast,
  Divider,
  Card,
  CardHeader,
  Heading,
  CardBody,
  SimpleGrid,
  Badge, 
  Input
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, AddIcon, DownloadIcon } from '@chakra-ui/icons'
import { 
  getAllAvailablePresets, 
  isFactoryPreset,
  saveCurrentConfigAsPreset,
  loadPresetConfig,
  createAutoBackup,
  importPresetsFromFile
} from '../../utils/configurationPresetsManager'
import PresetSaveDialog from './PresetSaveDialog'

const PresetManager = ({ 
  onPresetLoad, 
  onPresetSave, 
  isConnected = false 
}) => {
  const [presets, setPresets] = useState({})
  const [selectedPreset, setSelectedPreset] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [importing, setImporting] = useState(false)

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

  // Auto-backup when connected - only once per connection
useEffect(() => {
  if (isConnected && Object.keys(currentConfig).length > 0) {
    handleAutoBackup()
  }
}, [isConnected, currentConfig, handleAutoBackup]) // Remove currentConfig from dependencies

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

    window.dispatchEvent(new CustomEvent('presetUpdated', { 
      detail: { action: 'save', presetName: name } 
    }))
    
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



// Drag and drop handlers
const handleDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  const files = Array.from(e.dataTransfer.files)
  const jsonFile = files.find(file => file.name.endsWith('.json'))
  
  if (jsonFile) {
    importPresetFile(jsonFile)
  } else {
    toast({
      title: 'Invalid File',
      description: 'Please drop a valid JSON preset file',
      status: 'error',
      duration: 3000,
    })
  }
}

const handleFileImport = (e) => {
  const file = e.target.files[0]
  if (file) {
    importPresetFile(file)
  }
}

const importPresetFile = async (file) => {
  if (importing) return
  
  setImporting(true)
  try {
    toast({
      title: 'Importing Presets',
      description: 'Processing preset file...',
      status: 'info',
      duration: 2000,
    })

    const results = await importPresetsFromFile(file, false)
    
    let resultMessage = `Imported: ${results.imported}`
    if (results.skipped > 0) {
      resultMessage += `, Skipped: ${results.skipped} (already exist)`
    }
    if (results.errors.length > 0) {
      resultMessage += `, Errors: ${results.errors.length}`
    }

    toast({
      title: 'Import Complete',
      description: resultMessage,
      status: results.errors.length > 0 ? 'warning' : 'success',
      duration: 5000,
    })
    
    loadPresets()

    window.dispatchEvent(new CustomEvent('presetUpdated', { 
    detail: { action: 'import', imported: results.imported } 
  }))
  } catch (error) {
    toast({
      title: 'Import Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    })
  } finally {
    setImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
}


  const presetOptions = Object.keys(presets).sort((a, b) => {
    // Factory presets first, then user presets alphabetically
    const aFactory = isFactoryPreset(a)
    const bFactory = isFactoryPreset(b)
    
    if (aFactory && !bFactory) return -1
    if (!aFactory && bFactory) return 1
    return a.localeCompare(b)
  })

  useEffect(() => {
  const handlePresetUpdate = () => {
    loadPresets() // Refresh preset list when other components update presets
  }

  window.addEventListener('presetUpdated', handlePresetUpdate)
  
  return () => {
    window.removeEventListener('presetUpdate', handlePresetUpdate)
  }
}, [loadPresets])


return (
  <VStack spacing={4} align="stretch">
    
    {!isConnected && !(import.meta.env.DEV || import.meta.env.MODE === 'development') && (
      <Alert status="info" size="sm">
        <AlertIcon />
        Connect to ODrive to enable preset functionality
      </Alert>
    )}

    {/* Import Section - Drag & Drop */}
    <Box 
      p={4} 
      bg="gray.700" 
      borderRadius="md"
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="gray.500"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      cursor="pointer"
      _hover={{ borderColor: "blue.400", bg: "gray.600" }}
      transition="all 0.2s"
    >
      <VStack spacing={2}>
        <Text fontSize="sm" fontWeight="medium" color="white" textAlign="center">
          Import Presets
        </Text>
        <Text fontSize="xs" color="gray.300" textAlign="center">
          Click here or drag & drop a preset JSON file to import
        </Text>
      </VStack>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />
    </Box>

    {/* Save Current Configuration */}
    <Box p={4} bg="green.900" borderRadius="md" borderWidth="1px" borderColor="green.500">
      <HStack justify="space-between" align="center" spacing={4}>
        <VStack align="start" spacing={1} flex={1}>
          <Text fontWeight="bold" color="white" fontSize="sm">Save Current Configuration</Text>
          <Text fontSize="xs" color="gray.300">
            Save your current ODrive settings as a new preset
          </Text>
        </VStack>
        <HStack spacing={2}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            size="md"
            onClick={() => setShowSaveDialog(true)}
            isDisabled={!isConnected && !(import.meta.env.DEV || import.meta.env.MODE === 'development')}
            minW="120px"
          >
            Save Preset
          </Button>

        </HStack>
      </HStack>
    </Box>

    {/* Load Preset Section - Grid Layout */}
    <Box p={4} bg="blue.900" borderRadius="md" borderWidth="1px" borderColor="blue.500">
      <VStack spacing={3} align="stretch">
        <Text fontWeight="bold" color="white" fontSize="sm">Load Existing Preset</Text>
        
        {/* Preset Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={2} maxH="200px" overflowY="auto">
          {presetOptions.map((name) => {
            const isFactory = isFactoryPreset(name)
            const isSelected = selectedPreset === name
            const preset = presets[name]
            
            return (
              <Box
                key={name}
                p={3}
                bg={isSelected ? "blue.600" : "gray.700"}
                borderRadius="md"
                cursor="pointer"
                onClick={() => setSelectedPreset(name)}
                borderWidth="1px"
                borderColor={isSelected ? "blue.400" : "gray.600"}
                _hover={{ bg: isSelected ? "blue.500" : "gray.600" }}
                transition="all 0.2s"
              >
                <VStack spacing={1} align="start">
                  <HStack spacing={2} w="100%">
                    <Text fontSize="xs" fontWeight="bold" color="white" noOfLines={1} flex={1}>
                      {name}
                    </Text>
                    <Badge 
                      colorScheme={isFactory ? 'blue' : 'green'} 
                      size="xs"
                    >
                      {isFactory ? 'Factory' : 'User'}
                    </Badge>
                  </HStack>
                  
                  {preset?.description && (
                    <Text fontSize="2xs" color="gray.300" noOfLines={2}>
                      {preset.description}
                    </Text>
                  )}
                  
                  {preset?.timestamp && (
                    <Text fontSize="2xs" color="gray.400">
                      {new Date(preset.timestamp).toLocaleDateString()}
                    </Text>
                  )}
                </VStack>
              </Box>
            )
          })}
        </SimpleGrid>

        {/* Load Button */}
        {selectedPreset && (
          <HStack spacing={2} pt={2}>
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="xs" color="gray.300">Selected:</Text>
              <Text fontSize="sm" fontWeight="bold" color="blue.300" noOfLines={1}>
                {selectedPreset}
              </Text>
            </VStack>
            <Button
              colorScheme="blue"
              size="md"
              onClick={handleLoadPreset}
              isLoading={isLoading}
              minW="120px"
            >
              Load Preset
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>

    {/* Save Dialog */}
    <PresetSaveDialog
      isOpen={showSaveDialog}
      onClose={() => setShowSaveDialog(false)}
      onSave={handleSavePreset}
      existingPresets={Object.keys(presets)}
    />
  </VStack>
)
}

export default PresetManager