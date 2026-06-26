import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Box,
  Checkbox,
  useToast,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import * as backend from '../../api/backend'

/**
 * Confirmation dialog for erasing the ODrive configuration (factory reset).
 */
const EraseConfigModal = ({ isOpen, onClose }) => {
  const toast = useToast()
  const serial = useSelector((s) => s.device.connectedDevice?.serial_number)
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleErase = async () => {
    if (!serial) return
    setBusy(true)
    try {
      await backend.invokeCommand(serial, 'erase_configuration', [])
      toast({
        title: 'Configuration erased',
        description: 'The ODrive was reset to defaults and will reboot.',
        status: 'success',
        duration: 5000,
      })
      onClose()
    } catch (err) {
      // erase reboots and drops the connection; treat disconnect as success.
      const msg = String(err.message || err)
      if (/reboot|disconnect|timeout/i.test(msg)) {
        toast({ title: 'Configuration erased', description: 'Device is rebooting.', status: 'success' })
        onClose()
      } else {
        toast({ title: 'Erase failed', description: msg, status: 'error' })
      }
    } finally {
      setBusy(false)
      setAcknowledged(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" borderTop="3px solid" borderColor="red.500">
        <ModalHeader color="red.300">Erase ODrive Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={3}>
            <Alert status="warning" bg="orange.900" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">This action cannot be undone!</Text>
                <Text fontSize="sm">This resets ALL ODrive settings to factory defaults and reboots the device.</Text>
              </Box>
            </Alert>
            <Text fontSize="sm" color="gray.400">
              It is strongly advised to save your current configuration as a preset before erasing — you can do this in the Presets tab.
            </Text>
            <Checkbox isChecked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} colorScheme="red">
              I understand this will permanently erase all configuration.
            </Checkbox>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="red" onClick={handleErase} isDisabled={!acknowledged} isLoading={busy} loadingText="Erasing…" leftIcon={<Trash2 size={16} />}>
            Erase Configuration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EraseConfigModal
