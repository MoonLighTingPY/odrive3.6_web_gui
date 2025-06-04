import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  Alert,
  AlertIcon,
  useToast,
  useDisclosure,
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react'
import { DeleteIcon, DownloadIcon } from '@chakra-ui/icons'
import { 
  getAllAvailablePresets, 
  isFactoryPreset, 
  deletePreset,
  exportPresetsToFile,
  loadPresetConfig
} from '../../utils/configurationPresetsManager'

const PresetList = ({ onPresetLoad, onRefreshNeeded }) => {
  const [presets, setPresets] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()
  
  // Get connection status from Redux
  const { isConnected } = useSelector(state => state.device)

  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = () => {
    const availablePresets = getAllAvailablePresets()
    setPresets(availablePresets)
  }

  const handleDelete = (presetName) => {
    setDeleteTarget(presetName)
    onDeleteOpen()
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    try {
      deletePreset(deleteTarget)
      loadPresets()
      if (onRefreshNeeded) onRefreshNeeded()
      
      toast({
        title: 'Preset Deleted',
        description: `"${deleteTarget}" has been deleted`,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }

    setDeleteTarget(null)
    onDeleteClose()
  }

  const handleLoad = async (presetName) => {
    setIsLoading(true)
    try {
      const config = loadPresetConfig(presetName)
      if (config && onPresetLoad) {
        onPresetLoad(config, presetName)
        toast({
          title: 'Preset Loaded',
          description: `"${presetName}" loaded successfully`,
          status: 'success',
          duration: 3000,
        })
      } else {
        throw new Error('Preset not found')
      }
    } catch (error) {
      toast({
        title: 'Load Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportSingle = async (presetName) => {
    try {
      exportPresetsToFile(presetName)
      toast({
        title: 'Export Successful',
        description: `"${presetName}" exported successfully`,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  // Check if we should show presets functionality
  const shouldShowPresets = () => {
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    return isDevelopment || isConnected
  }

  const presetEntries = Object.entries(presets).sort(([a], [b]) => {
    // Factory presets first, then user presets alphabetically
    const aFactory = isFactoryPreset(a)
    const bFactory = isFactoryPreset(b)
    
    if (aFactory && !bFactory) return -1
    if (!aFactory && bFactory) return 1
    return a.localeCompare(b)
  })

  // Show connection warning if not in dev mode and not connected
  if (!shouldShowPresets()) {
    return (
      <Alert status="warning" bg="orange.900" borderColor="orange.500">
        <AlertIcon />
        Connect to an ODrive device to access preset management.
      </Alert>
    )
  }

  if (presetEntries.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No presets available. Save your current configuration to create your first preset.
      </Alert>
    )
  }

  return (
    <>
      {/* Development Mode Notice */}
      {!isConnected && (import.meta.env.DEV || import.meta.env.MODE === 'development') && (
        <Alert status="info" size="sm" mb={4}>
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="medium">Development Mode</Text>
            <Text fontSize="xs">
              Preset functionality is available in development mode. Factory presets are always available, 
              and you can test save/load operations with mock configurations.
            </Text>
          </VStack>
        </Alert>
      )}

      <VStack spacing={3} align="stretch">
        {presetEntries.map(([name, preset]) => {
          const isFactory = isFactoryPreset(name)
          
          return (
            <Box
              key={name}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg={isFactory ? 'blue.50' : 'gray.50'}
              _dark={{ 
                bg: isFactory ? 'blue.900' : 'gray.700' 
              }}
            >
              <Flex align="start">
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <Text fontWeight="medium">{name}</Text>
                    <Badge colorScheme={isFactory ? 'blue' : 'green'} size="sm">
                      {isFactory ? 'Factory' : 'User'}
                    </Badge>
                    {!isConnected && (
                      <Badge colorScheme="orange" size="sm" variant="outline">
                        Dev Mode
                      </Badge>
                    )}
                  </HStack>
                  
                  {preset.description && (
                    <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                      {preset.description}
                    </Text>
                  )}
                  
                  <HStack spacing={4} fontSize="xs" color="gray.500">
                    {preset.timestamp && (
                      <Text>Created: {new Date(preset.timestamp).toLocaleDateString()}</Text>
                    )}
                    {preset.version && (
                      <Text>Version: {preset.version}</Text>
                    )}
                  </HStack>

                  {/* Show configuration preview in dev mode */}
                  {!isConnected && preset.config && (
                    <Box mt={2} p={2} bg="gray.100" _dark={{ bg: 'gray.800' }} borderRadius="sm">
                      <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }} fontWeight="medium">
                        Configuration Preview:
                      </Text>
                      <HStack spacing={4} fontSize="xs" color="gray.500" mt={1}>
                        <Text>Motor: {preset.config.motor?.motor_type === 0 ? 'High Current' : 'Gimbal'}</Text>
                        <Text>KV: {preset.config.motor?.motor_kv || 'N/A'}</Text>
                        <Text>Poles: {preset.config.motor?.pole_pairs || 'N/A'}</Text>
                        <Text>CPR: {preset.config.encoder?.cpr || 'N/A'}</Text>
                      </HStack>
                    </Box>
                  )}
                </VStack>

                <VStack spacing={2}>
                  <HStack spacing={1}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleLoad(name)}
                      isLoading={isLoading}
                      title={!isConnected ? "Load preset configuration for preview" : "Load preset to device configuration"}
                    >
                      {!isConnected ? 'Preview' : 'Load'}
                    </Button>
                    
                    <IconButton
                      size="sm"
                      icon={<DownloadIcon />}
                      onClick={() => handleExportSingle(name)}
                      aria-label="Export preset"
                      title="Export this preset to file"
                    />
                  </HStack>

                  {!isFactory && (
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(name)}
                      aria-label="Delete preset"
                      title="Delete this preset"
                    />
                  )}
                </VStack>
              </Flex>
            </Box>
          )
        })}
      </VStack>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the preset "{deleteTarget}"? 
              This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PresetList