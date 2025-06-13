import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Alert,
  AlertIcon,
  VStack,
  Checkbox,
  useToast
} from '@chakra-ui/react'
import { executeConfigAction } from '../../utils/configurationActions'

const EraseConfigModal = ({ isOpen, onClose }) => {
  const [isErasing, setIsErasing] = useState(false)
  const [confirmUnderstood, setConfirmUnderstood] = useState(false)
  const toast = useToast()

  const handleErase = async () => {
    if (!confirmUnderstood) {
      toast({
        title: 'Confirmation Required',
        description: 'Please confirm you understand this action cannot be undone',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setIsErasing(true)
    try {
      await executeConfigAction('erase')
      
      toast({
        title: 'Configuration Erased',
        description: 'ODrive configuration has been reset to factory defaults. Device will reboot.',
        status: 'success',
        duration: 5000,
      })
      
      handleClose()
    } catch (error) {
      toast({
        title: 'Erase Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsErasing(false)
    }
  }

  const handleClose = () => {
    if (!isErasing) {
      setConfirmUnderstood(false)
      onClose()
    }
  }

return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" closeOnOverlayClick={!isErasing}>
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="red.500" borderWidth="1px">
            <ModalHeader color="red.300">🗑️ Erase ODrive Configuration</ModalHeader>
            <ModalCloseButton color="white" isDisabled={isErasing} />
            
            <ModalBody>
                <VStack spacing={4} align="stretch">
                    {/* Warning */}
                    <Alert status="warning" bg="orange.900" borderColor="orange.500">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">
                                ⚠️ This action cannot be undone!
                            </Text>
                            <Text fontSize="md">
                                This will reset ALL ODrive settings to factory defaults and reboot the device.
                            </Text>
                        </VStack>
                    </Alert>

                    {/* Advisory text */}
                    <Text color="white" fontSize="sm">
                        It is strongly advised to save your current configuration as a preset before erasing, 
                        so you can restore it if needed. You can do this in the Presets tab.
                    </Text>

                    {/* Confirmation checkbox */}
                    <Checkbox
                        isChecked={confirmUnderstood}
                        onChange={(e) => setConfirmUnderstood(e.target.checked)}
                        colorScheme="red"
                        size="sm"
                    >
                        <Text fontSize="sm" color="white">
                            I understand this will permanently erase all configuration and cannot be undone
                        </Text>
                    </Checkbox>
                </VStack>
            </ModalBody>

            <ModalFooter>
                <Button 
                    variant="ghost" 
                    mr={3} 
                    onClick={handleClose}
                    isDisabled={isErasing}
                >
                    Cancel
                </Button>
                <Button 
                    colorScheme="red" 
                    onClick={handleErase}
                    isLoading={isErasing}
                    loadingText="Erasing..."
                    isDisabled={!confirmUnderstood}
                >
                    🗑️ Erase Configuration
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
)
}

export default EraseConfigModal