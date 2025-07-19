import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
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
  AlertIcon
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
  updatePreset // Add this import
} from '../../utils/presetsManager'

import {
  exportPresetsAsZip,
  handleFileImport
} from '../../utils/presetsOperations'
import { applyAndSaveConfiguration } from '../../utils/configurationActions'
import { useAxisStateGuard } from '../../hooks/useAxisStateGuard'

const PresetsTab = memo(() => {
  const dispatch = useDispatch()
  const toast = useToast()
  const fileInputRef = useRef(null)
  const { isConnected, connectedDevice } = useSelector(state => state.device)
  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)
  const { executeWithAxisCheck } = useAxisStateGuard()

  const deviceConfig = useMemo(() => ({
    power: powerConfig || {},
    motor: motorConfig || {},
    encoder: encoderConfig || {},
    control: controlConfig || {},
    interface: interfaceConfig || {}
  }), [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig])

  const [presets, setPresets] = useState({})
  const [selectedPreset, setSelectedPreset] = useState('')
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetDescription, setNewPresetDescription] = useState('')
  const [editingPreset, setEditingPreset] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [searchText, setSearchText] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()

  // Load presets
  const loadPresets = useCallback(() => {
    try {
      const availablePresets = getAllAvailablePresets()
      setPresets(availablePresets)
    } catch (error) {
      toast({
        title: 'Failed to load presets',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }, [toast])

  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  // Filter presets based on search
  const filteredPresets = useMemo(() => {
    return Object.entries(presets).filter(([name]) =>
      name.toLowerCase().includes(searchText.toLowerCase())
    ).sort(([a], [b]) => {
      const aFactory = isFactoryPreset(a)
      const bFactory = isFactoryPreset(b)
      if (aFactory && !bFactory) return -1
      if (!aFactory && bFactory) return 1
      return a.localeCompare(b)
    })
  }, [presets, searchText])

  const handleLoadPreset = (presetName) => {
    try {
      const config = loadPresetConfig(presetName)

      // Update Redux store
      if (config.power) dispatch({ type: 'config/updatePowerConfig', payload: config.power })
      if (config.motor) dispatch({ type: 'config/updateMotorConfig', payload: config.motor })
      if (config.encoder) dispatch({ type: 'config/updateEncoderConfig', payload: config.encoder })
      if (config.control) dispatch({ type: 'config/updateControlConfig', payload: config.control })
      if (config.interface) dispatch({ type: 'config/updateInterfaceConfig', payload: config.interface })

      // Notify ConfigurationTab
      window.dispatchEvent(new CustomEvent('presetLoaded', {
        detail: { config, presetName }
      }))

      setSelectedPreset(presetName)

      toast({
        title: 'Preset loaded',
        description: `"${presetName}" loaded to configuration`,
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: 'Load failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  // Unify preset apply logic
  const handleApplyPreset = async (presetName) => {
    if (!isConnected) {
      toast({
        title: 'Not connected',
        description: 'Connect to ODrive first',
        status: 'warning',
        duration: 2000,
      })
      return
    }

    try {
      const config = loadPresetConfig(presetName)
      if (!config) throw new Error(`Preset "${presetName}" not found`)

      // Update Redux config state so the wizard and inspector are in sync
      if (config.power) dispatch({ type: 'config/updatePowerConfig', payload: config.power })
      if (config.motor) dispatch({ type: 'config/updateMotorConfig', payload: config.motor })
      if (config.encoder) dispatch({ type: 'config/updateEncoderConfig', payload: config.encoder })
      if (config.control) dispatch({ type: 'config/updateControlConfig', payload: config.control })
      if (config.interface) dispatch({ type: 'config/updateInterfaceConfig', payload: config.interface })

      // Apply and save with reconnection logic
      await applyAndSaveConfiguration(config, toast, dispatch, connectedDevice)

      toast({
        title: 'Preset Applied & Saved',
        description: `Configuration "${presetName}" applied and saved to ODrive`,
        status: 'success',
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: 'Apply Preset Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) return

    try {
      await saveCurrentConfigAsPreset(deviceConfig, newPresetName.trim(), newPresetDescription.trim())
      loadPresets()
      setNewPresetName('')
      setNewPresetDescription('')
      onCreateClose()

      toast({
        title: 'Preset saved',
        description: `"${newPresetName}" created`,
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeletePreset = (presetName) => {
    if (isFactoryPreset(presetName)) return

    try {
      deletePreset(presetName)
      loadPresets()
      if (selectedPreset === presetName) setSelectedPreset('')

      toast({
        title: 'Preset deleted',
        description: `"${presetName}" removed`,
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleEditPreset = (presetName) => {
    const preset = presets[presetName]
    if (!preset) return

    setEditingPreset(presetName)
    setEditName(presetName)
    setEditDescription(preset.description || '')
    onEditOpen()
  }

  const handleSaveEdit = async () => {
    if (!editingPreset || !editName.trim()) return

    try {
      await updatePreset(editingPreset, editName.trim(), editDescription.trim())

      // Update selection if the selected preset was renamed
      if (selectedPreset === editingPreset && editingPreset !== editName.trim()) {
        setSelectedPreset(editName.trim())
      }

      // Reload presets
      loadPresets()

      // Close modal and reset state
      setEditingPreset(null)
      setEditName('')
      setEditDescription('')
      onEditClose()

      const message = editingPreset !== editName.trim()
        ? `Preset renamed from "${editingPreset}" to "${editName.trim()}"`
        : `Preset "${editName.trim()}" updated`

      toast({
        title: 'Preset updated',
        description: message,
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingPreset(null)
    setEditName('')
    setEditDescription('')
    onEditClose()
  }

  // Export all presets as ZIP
  const handleExportAllAsZip = async () => {
    setIsExporting(true)
    try {
      await exportPresetsAsZip(presets, toast)
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      // Error handling is done in the utility function
    } finally {
      setIsExporting(false)
    }
  }

  // Handle file import
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsImporting(true)
    try {
      await handleFileImport(file, toast)
      loadPresets()
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  const shouldShowPresets = () => {
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    return isDevelopment || isConnected
  }

  if (!shouldShowPresets()) {
    return (
      <Box p={4}>
        <Alert status="warning">
          <AlertIcon />
          Connect to ODrive to access presets
        </Alert>
      </Box>
    )
  }

  // Add this after the other state declarations (around line 93)
  const { execute: executeApplyAndSave, AxisGuardModal } = executeWithAxisCheck(
    () => handleApplyPreset(selectedPreset),
    "apply and save the preset",
    "Apply & Save"
  )

  return (
    <Box p={4} h="100%" maxW="1400px" mx="auto">
      <VStack spacing={4} align="stretch" h="100%">

        {/* Header with actions */}
        <HStack justify="space-between" spacing={4}>
          <Text fontSize="lg" fontWeight="bold" color="white" minW="fit-content">
            Configuration Presets ({filteredPresets.length})
          </Text>

          <HStack spacing={2} flex="1" justify="flex-end">
            {/* Search input */}
            <HStack spacing={2} minW="250px">
              <Search size={16} color="gray" />
              <Input
                placeholder="Search presets..."
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
              onClick={onCreateOpen}
            >
              Save Current Config
            </Button>

            <Button
              size="sm"
              leftIcon={<Download size={14} />}
              variant="outline"
              onClick={handleImportClick}
              isLoading={isImporting}
              loadingText="Importing"
            >
              Import Preset
            </Button>

            <Button
              size="sm"
              leftIcon={<Upload size={14} />}
              variant="outline"
              onClick={handleExportAllAsZip}
              isLoading={isExporting}
              loadingText="Exporting"
            >
              Export all as ZIP
            </Button>
          </HStack>
        </HStack>

        {/* Selected preset actions */}
        {selectedPreset && (
          <HStack p={3} bg="blue.900" borderRadius="md" justify="space-between">
            <Text fontSize="sm" color="white">
              Selected: <Text as="span" fontWeight="bold">{selectedPreset}</Text>
            </Text>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<Download size={14} />}
              onClick={executeApplyAndSave}
              isDisabled={!isConnected}
            >
              Apply & Save to ODrive
            </Button>
          </HStack>
        )}

        {/* Presets table */}
        <Box flex="1" overflow="auto" borderWidth="1px" borderColor="gray.600" borderRadius="md">
          <Table size="sm" variant="simple">
            <Thead bg="gray.700">
              <Tr>
                <Th color="white" py={2} fontSize="xs">Name</Th>
                <Th color="white" py={2} fontSize="xs" w="80px">Type</Th>
                <Th color="white" py={2} fontSize="xs">Description</Th>
                <Th color="white" py={2} fontSize="xs" w="100px">Created</Th>
                <Th color="white" py={2} fontSize="xs" w="120px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPresets.map(([name, preset]) => {
                const isFactory = isFactoryPreset(name)
                const isSelected = selectedPreset === name

                return (
                  <Tr
                    key={name}
                    bg={isSelected ? "blue.800" : "transparent"}
                    _hover={{ bg: isSelected ? "blue.700" : "gray.700" }}
                    cursor="pointer"
                    onClick={() => setSelectedPreset(isSelected ? '' : name)}
                  >
                    <Td py={2}>
                      <Text fontSize="sm" fontWeight={isSelected ? "bold" : "normal"} noOfLines={1}>
                        {name}
                      </Text>
                    </Td>
                    <Td py={2}>
                      <Badge
                        size="sm"
                        colorScheme={isFactory ? "blue" : "green"}
                        variant="solid"
                      >
                        {isFactory ? "Factory" : "User"}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLoadPreset(name)
                          }}
                          title="Load to configuration editor"
                        >
                          Use
                        </Button>

                        <IconButton
                          size="xs"
                          colorScheme="gray"
                          variant="ghost"
                          icon={<Upload size={16} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            exportPresetsToFile(name)
                          }}
                          title="Export as JSON file"
                          aria-label="Export preset"
                        />

                        {!isFactory && (
                          <>
                            <IconButton
                              size="xs"
                              colorScheme="yellow"
                              variant="ghost"
                              icon={<Edit3 size={16} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditPreset(name) // Changed from setEditingPreset(name); onEditOpen()
                              }}
                              title="Edit preset details"
                              aria-label="Edit preset"
                            />

                            <IconButton
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              icon={<Trash2 size={16} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePreset(name)
                              }}
                              title="Delete preset"
                              aria-label="Delete preset"
                            />
                          </>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.zip"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Create preset modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Preset</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Preset Name</FormLabel>
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Enter preset name..."
                    autoFocus
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                    placeholder="Describe this configuration..."
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleSavePreset}
                isDisabled={!newPresetName.trim()}
              >
                Save Preset
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit preset modal */}
        <Modal isOpen={isEditOpen} onClose={handleCancelEdit} size="md">
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
                    autoFocus
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe this configuration..."
                    rows={3}
                  />
                </FormControl>

                {editingPreset && (
                  <Alert status="info" size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Editing preset: <Text as="span" fontWeight="bold">"{editingPreset}"</Text>
                    </Text>
                  </Alert>
                )}

                {editingPreset && isFactoryPreset(editingPreset) && (
                  <Alert status="warning" size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Factory presets cannot be edited. This is view-only mode.
                    </Text>
                  </Alert>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSaveEdit}
                isDisabled={!editName.trim() || isFactoryPreset(editingPreset)}
              >
                {isFactoryPreset(editingPreset) ? 'View Only' : 'Update Preset'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {AxisGuardModal && <AxisGuardModal />}
      </VStack>
    </Box>
  )
})

PresetsTab.displayName = 'PresetsTab'

export default PresetsTab