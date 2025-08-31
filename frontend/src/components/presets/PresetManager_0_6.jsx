import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Tooltip
} from '@chakra-ui/react'
import {
  Download,
  Upload,
  Save,
  MoreVertical,
  Edit3,
  Trash2,
  Plus,
  Search,
  FileArchive
} from 'lucide-react'
import {
  getAllAvailablePresets,
  isFactoryPreset,
  saveCurrentConfigAsPreset,
  loadPresetConfig,
  deletePreset,
  exportPresetsToFile,
  updatePreset
} from '../../utils/presetsManager'
import {
  exportPresetsAsZip,
  handleFileImport
} from '../../utils/presetsOperations'
import { applyAndSaveConfiguration } from '../../utils/configurationActions'
import { useAxisStateGuard } from '../../hooks/useAxisStateGuard'
import { useVersionedUtils } from '../../utils/versionSelection'

const PresetManager06 = memo(() => {
  const dispatch = useDispatch()
  const toast = useToast()
  const fileInputRef = React.useRef(null)
  
  // Force 0.6.x mode
  const { isConnected, connectedDevice, fw_is_0_6, fw_version_string } = useSelector(state => state.device)
  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)
  const { executeWithAxisCheck } = useAxisStateGuard()
  
  // Use 0.6.x versioned utilities
  const { registry, versionName } = useVersionedUtils()

  const [presets, setPresets] = useState({})
  const [searchText, setSearchText] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen: isDialogOpen, onOpen: onDialogOpen, onClose: onDialogClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const [dialogMode, setDialogMode] = useState('save')
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')

  // Device config for 0.6.x
  const deviceConfig = useMemo(() => ({
    power: powerConfig || {},
    motor: motorConfig || {},
    encoder: encoderConfig || {},
    control: controlConfig || {},
    interface: interfaceConfig || {}
  }), [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig])

  // Load presets on mount
  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = useCallback(async () => {
    setIsLoading(true)
    try {
      const allPresets = await getAllAvailablePresets(true) // Force 0.6.x presets
      setPresets(allPresets)
      console.log(`PresetManager06: Loaded ${Object.keys(allPresets).length} 0.6.x presets`)
    } catch (error) {
      console.error('Failed to load 0.6.x presets:', error)
      toast({
        title: "Error Loading 0.6.x Presets",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Filter presets
  const filteredPresets = useMemo(() => {
    const presetEntries = Object.entries(presets)
    if (!searchText) return presetEntries
    
    const searchLower = searchText.toLowerCase()
    return presetEntries.filter(([name, preset]) => 
      name.toLowerCase().includes(searchLower) ||
      (preset.description && preset.description.toLowerCase().includes(searchLower)) ||
      (preset.category && preset.category.toLowerCase().includes(searchLower))
    )
  }, [presets, searchText])

  const handleSavePreset = useCallback(async () => {
    if (!presetName.trim()) {
      toast({
        title: "Invalid Preset Name",
        description: "Please enter a valid preset name",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const presetData = {
        name: presetName.trim(),
        description: presetDescription.trim(),
        category: 'User',
        firmware_version: '0.6.x',
        fw_version_string: fw_version_string,
        created: new Date().toISOString(),
        config: deviceConfig
      }

      await saveCurrentConfigAsPreset(presetName.trim(), presetData, true) // Force 0.6.x
      await loadPresets()
      
      toast({
        title: "0.6.x Preset Saved",
        description: `Preset "${presetName}" saved successfully for ODrive 0.6.x`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      
      onDialogClose()
      setPresetName('')
      setPresetDescription('')
    } catch (error) {
      console.error('Failed to save 0.6.x preset:', error)
      toast({
        title: "Error Saving 0.6.x Preset",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [presetName, presetDescription, deviceConfig, fw_version_string, loadPresets, toast, onDialogClose])

  const handleLoadPreset = useCallback(async (name) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to an ODrive 0.6.x device first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const preset = presets[name]
      if (!preset) {
        throw new Error('Preset not found')
      }

      // Check firmware compatibility
      if (preset.firmware_version && !preset.firmware_version.includes('0.6')) {
        toast({
          title: "Firmware Compatibility Warning",
          description: `This preset was created for ${preset.firmware_version}, but you're using 0.6.x. Some parameters may not be compatible.`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        })
      }

      await executeWithAxisCheck(async () => {
        await loadPresetConfig(preset, dispatch, true) // Force 0.6.x
        
        toast({
          title: "0.6.x Preset Loaded",
          description: `Configuration loaded from "${name}" for ODrive 0.6.x`,
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      })
    } catch (error) {
      console.error('Failed to load 0.6.x preset:', error)
      toast({
        title: "Error Loading 0.6.x Preset",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, presets, dispatch, executeWithAxisCheck, toast])

  const handleDeletePreset = useCallback(async (name) => {
    if (isFactoryPreset(name)) {
      toast({
        title: "Cannot Delete Factory Preset",
        description: "Factory presets cannot be deleted",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      await deletePreset(name, true) // Force 0.6.x
      await loadPresets()
      
      toast({
        title: "0.6.x Preset Deleted",
        description: `Preset "${name}" deleted successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Failed to delete 0.6.x preset:', error)
      toast({
        title: "Error Deleting 0.6.x Preset",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [loadPresets, toast])

  const handleApplyPreset = useCallback(async (name) => {
    await executeWithAxisCheck(async () => {
      await handleLoadPreset(name)
      
      // Apply the configuration to the device
      await applyAndSaveConfiguration(dispatch, deviceConfig, true) // Force 0.6.x
      
      toast({
        title: "0.6.x Configuration Applied",
        description: `Preset "${name}" applied and saved to ODrive 0.6.x device`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    })
  }, [executeWithAxisCheck, handleLoadPreset, dispatch, deviceConfig, toast])

  const openSaveDialog = () => {
    setDialogMode('save')
    setPresetName('')
    setPresetDescription('')
    onDialogOpen()
  }

  const openEditDialog = (name) => {
    const preset = presets[name]
    setSelectedPreset(name)
    setPresetName(name)
    setPresetDescription(preset?.description || '')
    setDialogMode('edit')
    onEditOpen()
  }

  return (
    <Box p={4} h="100%" maxW="1400px" mx="auto">
      <VStack spacing={4} align="stretch" h="100%">

        {/* Header with 0.6.x indicator */}
        <HStack justify="space-between" spacing={4}>
          <HStack>
            <Text fontSize="lg" fontWeight="bold" color="white" minW="fit-content">
              Configuration Presets (0.6.x) ({filteredPresets.length})
            </Text>
            <Badge colorScheme="green" variant="solid">
              ODrive 0.6.x
            </Badge>
          </HStack>

          <HStack spacing={2} flex="1" justify="flex-end">
            {/* Search input */}
            <HStack spacing={2} minW="250px">
              <Search size={16} color="gray" />
              <Input
                placeholder="Search 0.6.x presets..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="sm"
                bg="gray.700"
                borderColor="gray.600"
                fontSize="sm"
              />
            </HStack>

            {/* Action buttons */}
            <Button
              size="sm"
              leftIcon={<Plus size={14} />}
              colorScheme="green"
              onClick={openSaveDialog}
              isDisabled={!isConnected}
            >
              Save Current as 0.6.x Preset
            </Button>

            <Button
              size="sm"
              leftIcon={<Upload size={14} />}
              colorScheme="blue"
              onClick={() => fileInputRef.current?.click()}
            >
              Import 0.6.x
            </Button>

            <Button
              size="sm"
              leftIcon={<FileArchive size={14} />}
              colorScheme="purple"
              onClick={() => exportPresetsAsZip(presets, '0.6.x')}
              isDisabled={filteredPresets.length === 0}
            >
              Export All 0.6.x
            </Button>
          </HStack>
        </HStack>

        {/* 0.6.x Feature Info */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">ODrive 0.6.x Preset Features</Text>
            <Text fontSize="sm">
              Presets for 0.6.x include enhanced features: harmonic compensation, 
              CAN-FD support, RS485 encoders, improved error handling, and initialization settings.
            </Text>
          </Box>
        </Alert>

        {/* Connection Status for 0.6.x */}
        {!fw_is_0_6 && isConnected && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text>
              Connected device is not ODrive 0.6.x. These presets are optimized for 0.6.x firmware.
              Current firmware: {fw_version_string || 'Unknown'}
            </Text>
          </Alert>
        )}

        {/* Presets Table */}
        <Box flex="1" overflowY="auto" bg="gray.800" borderRadius="md" border="1px solid" borderColor="gray.600">
          <Table variant="simple" size="sm">
            <Thead bg="gray.700" position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th color="white" py={3}>Name</Th>
                <Th color="white" py={3}>Category</Th>
                <Th color="white" py={3}>Description</Th>
                <Th color="white" py={3}>Date</Th>
                <Th color="white" py={3}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text color="gray.400">Loading 0.6.x presets...</Text>
                  </Td>
                </Tr>
              ) : filteredPresets.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text color="gray.400">
                      {searchText ? 'No 0.6.x presets match your search.' : 'No 0.6.x presets available.'}
                    </Text>
                  </Td>
                </Tr>
              ) : (
                filteredPresets.map(([name, preset]) => {
                  const isFactory = isFactoryPreset(name)
                  const isCompatible = !preset.firmware_version || preset.firmware_version.includes('0.6')
                  
                  return (
                    <Tr key={name} _hover={{ bg: "gray.700" }}>
                      <Td py={2}>
                        <HStack>
                          <Text fontSize="sm" fontWeight="medium" color="white">
                            {name}
                          </Text>
                          {isFactory && (
                            <Badge colorScheme="blue" variant="outline" fontSize="xs">
                              Factory
                            </Badge>
                          )}
                          {!isCompatible && (
                            <Tooltip label="May not be fully compatible with 0.6.x">
                              <Badge colorScheme="yellow" variant="outline" fontSize="xs">
                                Legacy
                              </Badge>
                            </Tooltip>
                          )}
                          {preset.firmware_version?.includes('0.6') && (
                            <Badge colorScheme="green" variant="outline" fontSize="xs">
                              0.6.x
                            </Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td py={2}>
                        <Badge 
                          colorScheme={preset.category === 'Factory' ? 'blue' : 'gray'} 
                          variant="outline"
                          fontSize="xs"
                        >
                          {preset.category || 'User'}
                        </Badge>
                      </Td>
                      <Td py={2}>
                        <Text fontSize="xs" color="gray.300" noOfLines={2}>
                          {preset.description || "—"}
                        </Text>
                      </Td>
                      <Td py={2}>
                        <Text fontSize="xs" color="gray.400">
                          {preset.timestamp ? new Date(preset.timestamp).toLocaleDateString() : "—"}
                        </Text>
                      </Td>
                      <Td py={2}>
                        <HStack spacing={1}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleLoadPreset(name)}
                            title="Load to configuration editor"
                            isDisabled={!isConnected}
                          >
                            Load
                          </Button>

                          <Button
                            size="xs"
                            colorScheme="green"
                            variant="outline"
                            onClick={() => handleApplyPreset(name)}
                            title="Apply directly to ODrive 0.6.x device"
                            isDisabled={!isConnected}
                          >
                            Apply
                          </Button>

                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<MoreVertical size={14} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                            />
                            <MenuList bg="gray.700" borderColor="gray.600">
                              <MenuItem
                                icon={<Download size={14} />}
                                onClick={() => exportPresetsToFile(name, true)} // Force 0.6.x
                                bg="gray.700"
                                _hover={{ bg: "gray.600" }}
                              >
                                Export as JSON
                              </MenuItem>
                              {!isFactory && (
                                <>
                                  <MenuItem
                                    icon={<Edit3 size={14} />}
                                    onClick={() => openEditDialog(name)}
                                    bg="gray.700"
                                    _hover={{ bg: "gray.600" }}
                                  >
                                    Edit Details
                                  </MenuItem>
                                  <MenuItem
                                    icon={<Trash2 size={14} />}
                                    onClick={() => handleDeletePreset(name)}
                                    bg="gray.700"
                                    _hover={{ bg: "gray.600" }}
                                    color="red.400"
                                  >
                                    Delete
                                  </MenuItem>
                                </>
                              )}
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Td>
                    </Tr>
                  )
                })
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json,.zip"
          multiple
          onChange={(e) => handleFileImport(e, loadPresets, toast, true)} // Force 0.6.x
        />
      </VStack>

      {/* Save Dialog */}
      <Modal isOpen={isDialogOpen} onClose={onDialogClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.600">
          <ModalHeader color="white">Save 0.6.x Configuration as Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="white">Preset Name</FormLabel>
                <Input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Enter preset name"
                  bg="gray.700"
                  borderColor="gray.600"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color="white">Description (Optional)</FormLabel>
                <Textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Describe this 0.6.x configuration preset..."
                  bg="gray.700"
                  borderColor="gray.600"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              onClick={handleSavePreset}
              isLoading={isLoading}
              isDisabled={!presetName.trim()}
            >
              Save 0.6.x Preset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
})

PresetManager06.displayName = 'PresetManager06'

export default PresetManager06