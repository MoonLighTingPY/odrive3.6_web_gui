import { useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Input,
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
  Collapse,
  Code,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { Download, Upload, Save, Edit3, Trash2, Plus, Search, GitCompare } from 'lucide-react'
import * as backend from '../../../api/backend'
import { allReadablePaths, getParamMeta } from '../../../utils/odriveRegistry'
import { buildDeviceSnapshot, diffConfig, toWrites } from '../../../utils/configDiff'
import { valuesEqual } from '../../../utils/helpers/valueHelpers'
import {
  listPresets,
  listAllPresets,
  makePreset,
  savePreset,
  deletePreset,
  updatePreset,
  exportPreset,
  expandValues,
} from '../../../utils/presets/presetsManager'
import { exportPresetsAsZip, importPresetFromFile } from '../../../utils/presets/presetsOperations'

const PresetsTab = () => {
  const toast = useToast()
  const fileRef = useRef(null)
  const { connectedDevice, fw_line, isConnected } = useSelector((s) => s.device)
  const selectedAxis = useSelector((s) => s.ui.selectedAxis)
  const serial = connectedDevice?.serial_number
  const fwLine = fw_line || 5

  const [userPresets, setUserPresets] = useState(() => listPresets())
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [comparison, setComparison] = useState(null)

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: cmpOpen, onToggle: toggleCmp, onClose: closeCmp } = useDisclosure()
  const { isOpen: fwOpen, onOpen: onFwOpen, onClose: onFwClose } = useDisclosure()
  const [pendingPreset, setPendingPreset] = useState(null)

  const refresh = () => setUserPresets(listPresets())

  const allPresets = useMemo(() => {
    const factory = listAllPresets().filter((p) => p.factory)
    return [...factory, ...userPresets]
  }, [userPresets])

  const filtered = useMemo(
    () =>
      allPresets
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (a.factory === b.factory ? a.name.localeCompare(b.name) : a.factory ? -1 : 1)),
    [allPresets, search]
  )

  const saveCurrent = async () => {
    if (!serial || !newName.trim()) return
    setBusy(true)
    try {
      const paths = allReadablePaths(fwLine, [selectedAxis])
      const results = await backend.readProperties(serial, paths)
      const { snapshot } = buildDeviceSnapshot(results)
      savePreset(makePreset(newName.trim(), snapshot, { fwLine, description: newDesc.trim() }))
      refresh()
      setNewName('')
      setNewDesc('')
      onCreateClose()
      toast({ title: `Preset "${newName.trim()}" saved`, status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: 'Save failed', description: String(err.message || err), status: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const applyPreset = async (preset) => {
    if (!serial) {
      toast({ title: 'Not connected', description: 'Connect to ODrive first', status: 'warning' })
      return
    }
    // Block applying a preset captured on a different firmware line (0.5.x vs
    // 0.6.x); paths and semantics differ enough to misconfigure the device.
    if (preset.fwLine && preset.fwLine !== fwLine) {
      toast({
        title: 'Firmware mismatch',
        description: `This preset was saved on 0.${preset.fwLine}.x but the device is 0.${fwLine}.x. Apply blocked.`,
        status: 'error',
        duration: 5000,
      })
      return
    }
    // Same minor but a saved preset: confirm via modal (patch revisions may differ).
    if (preset.fwLine) {
      setPendingPreset(preset)
      onFwOpen()
      return
    }
    runApply(preset)
  }

  const confirmFwApply = () => {
    const preset = pendingPreset
    onFwClose()
    setPendingPreset(null)
    if (preset) runApply(preset)
  }

  const runApply = async (preset) => {
    if (!serial) return
    setBusy(true)
    try {
      const expanded = expandValues(preset.values, selectedAxis)
      // Only writable paths can be applied; read-only values are kept in the
      // preset for reference but skipped here so writes don't fail.
      const desired = Object.fromEntries(
        Object.entries(expanded).filter(([path]) => getParamMeta(fwLine, path)?.writable)
      )
      const paths = Object.keys(desired)
      const results = await backend.readProperties(serial, paths)
      const { snapshot } = buildDeviceSnapshot(results)
      const changes = diffConfig({ snapshot, desired, editedPaths: paths })
      if (changes.length === 0) {
        toast({ title: 'Device already matches preset', status: 'info', duration: 2000 })
        return
      }
      await backend.writeProperties(serial, toWrites(changes))
      await backend.invokeCommand(serial, 'save_configuration', [])
      toast({ title: `Applied "${preset.name}"`, description: `${changes.length} change(s) saved`, status: 'success', duration: 4000 })
    } catch (err) {
      toast({ title: 'Apply failed', description: String(err.message || err), status: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const comparePreset = async (preset) => {
    if (!serial) return
    setBusy(true)
    try {
      const desired = expandValues(preset.values, selectedAxis)
      const paths = Object.keys(desired)
      const results = await backend.readProperties(serial, paths)
      const { snapshot } = buildDeviceSnapshot(results)
      const rows = paths
        .map((path) => ({
          path,
          name: getParamMeta(fwLine, path)?.name || path,
          current: snapshot[path],
          preset: desired[path],
          differs: !valuesEqual(snapshot[path], desired[path]),
        }))
        .filter((r) => r.differs)
      setComparison({ name: preset.name, rows })
      if (!cmpOpen) toggleCmp()
    } catch (err) {
      toast({ title: 'Compare failed', description: String(err.message || err), status: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const openEdit = (preset) => {
    setEditTarget(preset.name)
    setEditName(preset.name)
    setEditDesc(preset.description || '')
    onEditOpen()
  }
  const saveEdit = () => {
    updatePreset(editTarget, { name: editName.trim(), description: editDesc.trim() })
    refresh()
    onEditClose()
    toast({ title: 'Preset updated', status: 'success', duration: 2000 })
  }

  const removePreset = (preset) => {
    deletePreset(preset.name)
    refresh()
    if (selected === preset.name) setSelected('')
  }

  const downloadPreset = (preset) => {
    const blob = new Blob([exportPreset(preset)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${preset.name.replace(/\s+/g, '_')}.odrivepreset.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const preset = await importPresetFromFile(file)
      refresh()
      toast({ title: `Imported "${preset.name}"`, status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: 'Import failed', description: String(err.message || err), status: 'error' })
    }
  }

  return (
    <Box p={4} h="100%" maxW="1400px" mx="auto">
      <VStack spacing={4} align="stretch" h="100%">
        {/* Header */}
        <HStack justify="space-between" spacing={4}>
          <Text fontSize="lg" fontWeight="bold" color="white" minW="fit-content">
            Configuration Presets ({filtered.length})
          </Text>
          <HStack spacing={2} flex="1" justify="flex-end">
            <HStack spacing={2} minW="240px">
              <Search size={16} color="gray" />
              <Input placeholder="Search presets..." value={search} onChange={(e) => setSearch(e.target.value)} size="sm" bg="gray.700" borderColor="gray.600" />
            </HStack>
            <Button size="sm" leftIcon={<Plus size={14} />} colorScheme="green" onClick={onCreateOpen} isDisabled={!isConnected}>
              Save Current Config
            </Button>
            <Button size="sm" leftIcon={<Download size={14} />} variant="outline" onClick={() => fileRef.current?.click()}>
              Import Preset
            </Button>
            <Button size="sm" leftIcon={<Upload size={14} />} variant="outline" onClick={() => exportPresetsAsZip(userPresets)} isDisabled={userPresets.length === 0}>
              Export all as ZIP
            </Button>
            <input ref={fileRef} type="file" accept=".json" hidden onChange={onImportFile} />
          </HStack>
        </HStack>

        {/* How presets work */}
        <Alert status="info" variant="left-accent" borderRadius="md" fontSize="sm" alignItems="start">
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold">How presets work</Text>
            <Text color="gray.300">
              Saving a preset captures a full snapshot of the device — every property, including read-only
              values kept for reference. Applying a preset restores all writable settings (then saves to the
              ODrive) so it returns to the saved state. Use Compare to see what differs before applying, and
              Export/Import to share profiles. Presets are stored per axis and in template form, so they apply
              to whichever axis is selected.
            </Text>
          </Box>
        </Alert>

        {/* Comparison */}
        <Collapse in={cmpOpen} animateOpacity>
          {comparison && (
            <Box bg="gray.800" borderRadius="md" p={4} borderLeft="3px solid" borderColor="orange.400" maxH="320px" overflowY="auto">
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold" color="orange.300">Differences vs &quot;{comparison.name}&quot; ({comparison.rows.length})</Text>
                <Button size="xs" variant="ghost" onClick={closeCmp}>Close</Button>
              </HStack>
              {comparison.rows.length === 0 ? (
                <Text fontSize="sm" color="green.300">Device matches this preset.</Text>
              ) : (
                <Table size="sm" variant="simple">
                  <Thead><Tr><Th>Parameter</Th><Th>Current</Th><Th>Preset</Th></Tr></Thead>
                  <Tbody>
                    {comparison.rows.map((r) => (
                      <Tr key={r.path}>
                        <Td>{r.name}</Td>
                        <Td><Code fontSize="xs">{String(r.current ?? '—')}</Code></Td>
                        <Td><Code fontSize="xs" colorScheme="teal">{String(r.preset)}</Code></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          )}
        </Collapse>

        {/* Presets grid */}
        <Box flex="1" overflowY="auto">
          {filtered.length === 0 ? (
            <Alert status="info" variant="subtle"><AlertIcon />No presets match your search.</Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
              {filtered.map((preset) => {
                const isSelected = selected === preset.name
                return (
                  <Card
                    key={(preset.factory ? 'f:' : 'u:') + preset.name}
                    bg="gray.800"
                    borderWidth="1px"
                    borderColor={isSelected ? 'blue.400' : 'gray.700'}
                    _hover={{ borderColor: 'blue.500' }}
                    transition="border-color 0.15s"
                  >
                    <CardBody p={3}>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between" align="start">
                          <Text fontSize="sm" fontWeight="bold" color="white" noOfLines={1}>{preset.name}</Text>
                          <HStack spacing={1} flexShrink={0}>
                            {preset.fwLine && (
                              <Badge colorScheme={preset.fwLine === fwLine ? 'purple' : 'red'} variant="subtle">0.{preset.fwLine}.x</Badge>
                            )}
                            <Badge colorScheme={preset.factory ? 'blue' : 'green'} variant="solid">
                              {preset.factory ? 'Factory' : 'User'}
                            </Badge>
                          </HStack>
                        </HStack>
                        <Text fontSize="xs" color="gray.400" noOfLines={2} minH="2.4em">
                          {preset.description || 'No description'}
                        </Text>
                        <Text fontSize="0.65rem" color="gray.500">{Object.keys(preset.values).length} parameters</Text>
                        <HStack spacing={1} pt={1}>
                          <Button flex="1" size="sm" colorScheme="green" leftIcon={<Save size={14} />}
                            onClick={() => applyPreset(preset)} isDisabled={!isConnected || (preset.fwLine && preset.fwLine !== fwLine)} isLoading={busy}
                            title={preset.fwLine && preset.fwLine !== fwLine ? `Saved on 0.${preset.fwLine}.x — incompatible with this 0.${fwLine}.x device` : isConnected ? 'Apply & save this preset to the device' : 'Connect to a device first'}>
                            Apply
                          </Button>
                          <Button size="sm" colorScheme="blue" variant="outline" leftIcon={<GitCompare size={14} />}
                            onClick={() => { setSelected(preset.name); comparePreset(preset) }} isDisabled={!isConnected} title="Compare with device">
                            Compare
                          </Button>
                          <IconButton size="sm" variant="ghost" icon={<Upload size={16} />} aria-label="Export"
                            onClick={() => downloadPreset(preset)} title="Export as JSON" />
                          {!preset.factory && (
                            <>
                              <IconButton size="sm" colorScheme="yellow" variant="ghost" icon={<Edit3 size={16} />} aria-label="Edit"
                                onClick={() => openEdit(preset)} title="Edit details" />
                              <IconButton size="sm" colorScheme="red" variant="ghost" icon={<Trash2 size={16} />} aria-label="Delete"
                                onClick={() => removePreset(preset)} title="Delete" />
                            </>
                          )}
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )
              })}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      {/* Create modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="odrive.300">Save Configuration Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <FormControl isRequired>
                <FormLabel>Preset Name</FormLabel>
                <Input placeholder="Enter preset name…" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea placeholder="Enter description for this preset…" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
              </FormControl>
              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                Saves a full snapshot of the ODrive (axis {selectedAxis}) — all properties, including read-only ones for reference. Applying later restores every writable setting.
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>Cancel</Button>
            <Button colorScheme="green" onClick={saveCurrent} isLoading={busy} isDisabled={!newName.trim()}>Save Preset</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="odrive.300">Edit Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <FormControl isRequired>
                <FormLabel>Preset Name</FormLabel>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>Cancel</Button>
            <Button colorScheme="yellow" onClick={saveEdit} isDisabled={!editName.trim()}>Update Preset</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Firmware-revision confirmation */}
      <Modal isOpen={fwOpen} onClose={onFwClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="orange.300">Same firmware line, different revision</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" borderRadius="md" fontSize="sm">
              <AlertIcon />
              <Box>
                This preset and the device are both 0.{fwLine}.x but may differ in patch revision.
                A few parameters might not exist on this firmware and will be skipped, but the rest
                will apply fine.
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFwClose}>Cancel</Button>
            <Button colorScheme="green" onClick={confirmFwApply} isLoading={busy}>Apply Anyway</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default PresetsTab
