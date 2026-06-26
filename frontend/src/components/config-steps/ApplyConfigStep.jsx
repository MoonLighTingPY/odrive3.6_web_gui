import { useMemo, useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormLabel,
  Checkbox,
  Tooltip,
  Icon,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { Save } from 'lucide-react'
import CommandList from '../CommandList'
import ConfirmationModal from '../modals/ConfirmationModal'

/**
 * Apply tab — faithful to the dev FinalConfigStep: "only changed parameters",
 * "enable editing" and "apply to both axes" toggles, an editable command list,
 * and a confirmation before writing + saving.
 */
const ApplyConfigStep = ({ wizard }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [onlyChanged, setOnlyChanged] = useState(true)
  const [enableEditing, setEnableEditing] = useState(false)
  const [bothAxes, setBothAxes] = useState(false)
  const [customCommands, setCustomCommands] = useState({})
  const [disabledCommands, setDisabledCommands] = useState(() => new Set())
  const [applying, setApplying] = useState(false)
  const [resultToast, setResultToast] = useState(null)

  const baseCommands = useMemo(
    () => wizard.buildCommandStrings({ onlyChanged, bothAxes }),
    [wizard, onlyChanged, bothAxes]
  )

  const finalCommands = useMemo(
    () =>
      baseCommands
        .map((cmd, i) => customCommands[i] ?? cmd)
        .filter((_, i) => !disabledCommands.has(i))
        .concat(
          Object.keys(customCommands)
            .map(Number)
            .filter((k) => k >= baseCommands.length && !disabledCommands.has(k))
            .map((k) => customCommands[k])
        ),
    [baseCommands, customCommands, disabledCommands]
  )

  const nothingToDo = onlyChanged && baseCommands.length === 0 && Object.keys(customCommands).length === 0

  const { errors = [], warnings = [] } = wizard.validation || {}
  const hasErrors = errors.length > 0

  const handleCustomCommandChange = (index, value) => {
    setCustomCommands((prev) => {
      const next = { ...prev }
      if (value === null) delete next[index]
      else next[index] = value
      return next
    })
  }
  const handleCommandToggle = (index) => {
    setDisabledCommands((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }
  const handleAddCustomCommand = () => {
    const idx = baseCommands.length + Object.keys(customCommands).filter((k) => Number(k) >= baseCommands.length).length
    setCustomCommands((prev) => ({ ...prev, [idx]: '# new command, e.g. axis0.requested_state = 1' }))
  }

  const apply = async () => {
    setApplying(true)
    setResultToast(null)
    try {
      const { written, failed } = await wizard.applyCommandStrings(finalCommands)
      setResultToast(
        failed.length
          ? { ok: false, msg: `${failed.length} command(s) failed` }
          : { ok: true, msg: `Applied & saved ${written} command(s)` }
      )
      if (!failed.length) {
        setCustomCommands({})
        setDisabledCommands(new Set())
      }
    } catch (err) {
      setResultToast({ ok: false, msg: String(err.message || err) })
    } finally {
      setApplying(false)
      onClose()
    }
  }

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={4} align="stretch" maxW="1200px" mx="auto">
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="md" color="white" textAlign="center">Configuration Management</Heading>
          </CardHeader>
          <CardBody py={3}>
            {nothingToDo ? (
              <Box py={16} textAlign="center">
                <Text color="gray.100" fontSize="2xl" fontWeight="bold">
                  Nothing was changed, so no commands were generated.
                </Text>
                <Text color="gray.500" mt={2}>
                  Edit parameters in the wizard steps, or turn off “Only changed parameters” to write the full configuration.
                </Text>
                <HStack justify="center" mt={4}>
                  <FormLabel htmlFor="only-changed" mb="0" color="gray.300" fontSize="sm">Only changed parameters</FormLabel>
                  <Checkbox id="only-changed" isChecked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} colorScheme="blue" />
                </HStack>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {(hasErrors || warnings.length > 0) && (
                  <VStack spacing={2} align="stretch">
                    {errors.map((msg) => (
                      <Alert key={msg} status="error" borderRadius="md" bg="red.900" fontSize="sm">
                        <AlertIcon /> {msg}
                      </Alert>
                    ))}
                    {warnings.map((msg) => (
                      <Alert key={msg} status="warning" borderRadius="md" bg="orange.900" fontSize="sm">
                        <AlertIcon /> {msg}
                      </Alert>
                    ))}
                  </VStack>
                )}
                {/* Toggles */}
                <HStack spacing={2} flexWrap="wrap">
                  <FormLabel htmlFor="only-changed" mb="0" color="gray.300" fontSize="sm" mr={0}>Only changed parameters</FormLabel>
                  <Checkbox id="only-changed" isChecked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} colorScheme="blue" />
                  <Tooltip label="Generate commands only for parameters you've modified."><Icon as={InfoIcon} color="gray.400" boxSize={3} /></Tooltip>

                  <FormLabel htmlFor="enable-editing" mb="0" color="gray.300" fontSize="sm" mr={0} ml={4}>Enable Editing</FormLabel>
                  <Checkbox id="enable-editing" isChecked={enableEditing} onChange={(e) => setEnableEditing(e.target.checked)} colorScheme="blue" />
                  <Tooltip label="Edit, disable or add commands before applying."><Icon as={InfoIcon} color="gray.400" boxSize={3} /></Tooltip>

                  <FormLabel htmlFor="both-axes" mb="0" color="gray.300" fontSize="sm" mr={0} ml={4}>Apply to both axes</FormLabel>
                  <Checkbox id="both-axes" isChecked={bothAxes} onChange={(e) => setBothAxes(e.target.checked)} colorScheme="blue" />
                  <Tooltip label="Apply axis commands to both Axis 0 and Axis 1."><Icon as={InfoIcon} color="gray.400" boxSize={3} /></Tooltip>
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color="white" fontSize="lg">Configuration Commands</Text>
                    <Text color="gray.400" fontSize="sm">
                      {finalCommands.length} command(s) for {bothAxes ? 'both axes (0 & 1)' : `Axis ${wizard.selectedAxis}`}
                    </Text>
                  </VStack>
                </HStack>

                <Box bg="gray.900" p={4} borderRadius="md" maxH="500px" overflowY="auto" border="1px solid" borderColor="gray.600">
                  <CommandList
                    commands={baseCommands}
                    customCommands={customCommands}
                    disabledCommands={disabledCommands}
                    enableEditing={enableEditing}
                    onCustomCommandChange={handleCustomCommandChange}
                    onCommandToggle={handleCommandToggle}
                    onAddCustomCommand={handleAddCustomCommand}
                  />
                </Box>

                {resultToast && (
                  <Text color={resultToast.ok ? 'green.300' : 'red.300'} fontSize="sm" textAlign="center">
                    {resultToast.msg}
                  </Text>
                )}

                <VStack spacing={2} w="100%" maxW="400px" mx="auto">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    h="56px"
                    onClick={onOpen}
                    isDisabled={!wizard.isConnected || finalCommands.length === 0 || hasErrors}
                    isLoading={applying}
                    loadingText="Applying & Saving…"
                    leftIcon={<Save size={18} />}
                  >
                    Apply &amp; Save Configuration
                  </Button>
                </VStack>
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={apply}
        isLoading={applying}
        commandCount={finalCommands.length}
        customCommandCount={Object.keys(customCommands).length}
        targetAxis={bothAxes ? 'both' : wizard.selectedAxis}
      />
    </Box>
  )
}

export default ApplyConfigStep
