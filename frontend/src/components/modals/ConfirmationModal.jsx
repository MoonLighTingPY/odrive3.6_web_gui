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
  HStack,
  Text,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'

/**
 * Generic confirmation dialog for the Apply action.
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title = 'Apply & Save Configuration',
  description = 'This will write the commands below to the ODrive and save them to non-volatile memory. The device will reboot.',
  confirmText = 'Apply & Save',
  commandCount = 0,
  customCommandCount = 0,
  targetAxis = 0,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent bg="gray.800">
      <ModalHeader color="odrive.300">{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack align="stretch" spacing={3}>
          <Text color="gray.300" fontSize="sm">{description}</Text>
          <Box bg="gray.900" p={3} borderRadius="md">
            <HStack justify="space-between"><Text fontSize="sm" color="gray.400">Target:</Text>
              <Text fontSize="sm">{targetAxis === 'both' ? 'Both Axes (0 & 1)' : `Axis ${targetAxis}`}</Text></HStack>
            <HStack justify="space-between"><Text fontSize="sm" color="gray.400">Commands:</Text>
              <Text fontSize="sm">{commandCount}</Text></HStack>
            {customCommandCount > 0 && (
              <HStack justify="space-between"><Text fontSize="sm" color="gray.400">Custom commands:</Text>
                <Text fontSize="sm">{customCommandCount}</Text></HStack>
            )}
          </Box>
          {targetAxis === 'both' && (
            <Alert status="warning" borderRadius="md" bg="orange.900" fontSize="sm">
              <AlertIcon /> Writing to both axes. Make sure a motor and encoder are connected to Axis 0 and Axis 1; applying to an unconnected axis can leave it misconfigured.
            </Alert>
          )}
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
        <Button colorScheme="blue" onClick={onConfirm} isLoading={isLoading} loadingText="Processing…">
          {confirmText}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)

export default ConfirmationModal
