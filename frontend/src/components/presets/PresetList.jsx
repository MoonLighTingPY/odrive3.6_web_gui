import React, { useState, useEffect, useMemo } from 'react'
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
  ModalFooter,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import { DeleteIcon, DownloadIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { 
  getAllAvailablePresets, 
  isFactoryPreset, 
  deletePreset,
  exportPresetsToFile,
  loadPresetConfig,
  getStoredPresets
} from '../../utils/presetsManager'

const PresetList = ({ onPresetLoad, onRefreshNeeded }) => {
  const [presets, setPresets] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
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


  const handleLoad = async (presetName) => {
    setIsLoading(true)
    try {
      const config = loadPresetConfig(presetName)
      if (config && onPresetLoad) {
        onPresetLoad(config, presetName)
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

  const handleEdit = (presetName) => {
    const preset = presets[presetName]
    setEditTarget(presetName)
    setEditName(presetName)
    setEditDescription(preset?.description || '')
    onEditOpen()
  }

  const confirmDelete = () => {
  if (!deleteTarget) return

  try {
    deletePreset(deleteTarget)
    loadPresets()
    if (onRefreshNeeded) onRefreshNeeded()
    
    // Broadcast preset update to other components
    window.dispatchEvent(new CustomEvent('presetUpdated', { 
      detail: { action: 'delete', presetName: deleteTarget } 
    }))
    
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

// Update the confirmEdit function around line 175:

const confirmEdit = () => {
  if (!editTarget || !editName.trim()) return

  try {
    // Get the original preset
    const originalPreset = presets[editTarget]
    if (!originalPreset) {
      throw new Error('Preset not found')
    }

    // Create updated preset with new name/description
    const updatedPreset = {
      ...originalPreset,
      name: editName.trim(),
      description: editDescription.trim(),
      timestamp: new Date().toISOString()
    }

    // Get existing presets
    const storedPresets = getStoredPresets()

    // If name changed, remove old and add new
    if (editTarget !== editName.trim()) {
      delete storedPresets[editTarget]
    }
    storedPresets[editName.trim()] = updatedPreset

    // Save to localStorage
    localStorage.setItem('odrive_config_presets', JSON.stringify(storedPresets))
    
    loadPresets()
    if (onRefreshNeeded) onRefreshNeeded()
    
    // Broadcast preset update to other components
    window.dispatchEvent(new CustomEvent('presetUpdated', { 
      detail: { action: 'edit', oldName: editTarget, newName: editName.trim() } 
    }))
    
    toast({
      title: 'Preset Updated',
      description: `"${editName}" has been updated`,
      status: 'success',
      duration: 3000,
    })
  } catch (error) {
    toast({
      title: 'Update Failed',
      description: error.message,
      status: 'error',
      duration: 3000,
    })
  }

  setEditTarget(null)
  setEditName('')
  setEditDescription('')
  onEditClose()
}


  const presetEntries = useMemo(() => 
    Object.entries(presets).sort(([a], [b]) => {
      const aFactory = isFactoryPreset(a)
      const bFactory = isFactoryPreset(b)
      if (aFactory && !bFactory) return -1
      if (!aFactory && bFactory) return 1
      return a.localeCompare(b)
    }), [presets]
  )

  // Show connection warning if not in dev mode and not connected
  {!isConnected && (import.meta.env.DEV || import.meta.env.MODE === 'development') && (
  <Alert status="info" size="sm" mb={4}>
    <AlertIcon />
    <VStack align="start" spacing={1}>
      <Text fontSize="sm" fontWeight="medium">Development Mode</Text>
      <Text fontSize="xs">
        Preset functionality is fully available in development mode. You can load, save, edit, and delete presets for testing.
      </Text>
    </VStack>
  </Alert>
)}

  return (
    <>

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
                        <Text>Encoder: {preset.config.encoder?.encoder_type || 'N/A'}</Text>
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
                      title="Load preset configuration"
                    >
                      Load
                    </Button>
                    
                    <IconButton
                      size="sm"
                      icon={<DownloadIcon />}
                      onClick={() => handleExportSingle(name)}
                      aria-label="Export preset"
                      title="Export this preset to file"
                    />

                    {!isFactory && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<ChevronDownIcon />}
                          size="sm"
                          variant="ghost"
                          aria-label="More actions"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<EditIcon />} 
                            onClick={() => handleEdit(name)}
                          >
                            Edit Preset
                          </MenuItem>
                          <MenuItem 
                            icon={<DeleteIcon />} 
                            onClick={() => handleDelete(name)}
                            color="red.400"
                          >
                            Delete Preset
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}

                    {isFactory && (
                      <IconButton
                        size="sm"
                        icon={<EditIcon />}
                        variant="ghost"
                        onClick={() => handleEdit(name)}
                        aria-label="View preset details"
                        title="View preset details (factory presets cannot be modified)"
                      />
                    )}
                  </HStack>
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

      {/* Edit Preset Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Preset Name</FormLabel>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter preset name..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={3}
                />
              </FormControl>

              {isFactoryPreset(editTarget) && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">
                    This is a factory preset. You can view but not modify it.
                  </Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={confirmEdit}
              isDisabled={!editName.trim() || isFactoryPreset(editTarget)}
            >
              {isFactoryPreset(editTarget) ? 'View Only' : 'Update Preset'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PresetList