import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  CircularProgress,
  Badge,
  Box,
  Alert,
  AlertIcon,
  Divider,
  useToast,
} from '@chakra-ui/react'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

/**
 * Calibration progress dialog driven by useCalibration state. On success it
 * shows the measured values (editable) and a "Set pre-calibrated & save" button.
 */
const CalibrationModal = ({ isOpen, onClose, calibration, title = 'Calibration' }) => {
  const toast = useToast()
  const {
    isCalibrating, phase, result, cancel,
    resultFields, resultValues, setResultValue, saveResults, saving,
  } = calibration
  const finished = !isCalibrating && result != null
  const [saved, setSaved] = useState(false)

  const handleClose = () => {
    if (isCalibrating) cancel()
    setSaved(false)
    onClose()
  }

  const handleSave = async () => {
    try {
      await saveResults()
      setSaved(true)
      toast({ title: 'Saved & marked pre-calibrated', status: 'success', duration: 2500 })
    } catch (err) {
      toast({ title: 'Save failed', description: String(err.message || err), status: 'error' })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={!isCalibrating} isCentered size="md">
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader color="odrive.300">
          {finished ? (result.ok ? 'Calibration Complete' : 'Calibration Finished with Issues') : `${title} in Progress`}
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} py={2} align="stretch">
            <VStack spacing={3}>
              {isCalibrating ? (
                <CircularProgress isIndeterminate color="odrive.300" size="80px" />
              ) : result?.ok ? (
                <CheckCircle2 size={56} color="#48BB78" />
              ) : (
                <AlertTriangle size={56} color="#ED8936" />
              )}

              {isCalibrating && (
                <HStack>
                  <Spinner size="sm" />
                  <Text color="gray.300">{phase || 'Working…'}</Text>
                </HStack>
              )}
            </VStack>

            {finished && result.ok && (
              <Alert status="success" borderRadius="md" bg="green.900">
                <AlertIcon />
                <Box>
                  <Text fontWeight="semibold">Calibration successful</Text>
                  <Text fontSize="sm">Review the measured values below, then save them to the device.</Text>
                </Box>
              </Alert>
            )}

            {/* Measured values editor */}
            {finished && result.ok && resultFields.length > 0 && (
              <Box>
                <Divider mb={3} />
                <Text fontWeight="semibold" color="white" mb={2}>Measured Values</Text>
                <VStack align="stretch" spacing={2}>
                  {resultFields.map((f) => (
                    <HStack key={f.path} justify="space-between">
                      <Text fontSize="sm">{f.label}</Text>
                      <ParameterInput
                        value={resultValues[f.path]}
                        decimals={null}
                        unit={f.unit}
                        onChange={(v) => setResultValue(f.path, v)}
                      />
                    </HStack>
                  ))}
                </VStack>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Saving stores these values, sets <b>pre_calibrated</b> so the axis skips this calibration on
                  startup, and writes to non-volatile memory.
                </Text>
              </Box>
            )}

            {finished && !result.ok && (
              <Alert status="error" borderRadius="md" bg="red.900" flexDirection="column" alignItems="start">
                <HStack><AlertIcon /><Text fontWeight="semibold">Errors detected:</Text></HStack>
                <VStack align="stretch" spacing={1} mt={2} w="100%">
                  {result.errors.map((e) => (
                    <HStack key={e.flag}>
                      <Badge colorScheme="red">{e.flag}</Badge>
                      <Text fontSize="sm">{e.description}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          {isCalibrating ? (
            <Button variant="outline" colorScheme="red" onClick={handleClose}>Cancel</Button>
          ) : (
            <HStack>
              {finished && result.ok && resultFields.length > 0 && (
                <Button colorScheme="teal" onClick={handleSave} isLoading={saving} loadingText="Saving…" isDisabled={saved}>
                  {saved ? 'Saved ✓' : 'Set Pre-Calibrated & Save'}
                </Button>
              )}
              <Button variant={finished && result.ok && resultFields.length > 0 ? 'ghost' : 'solid'} colorScheme="gray" onClick={handleClose}>
                {saved ? 'Close' : 'Done'}
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CalibrationModal
