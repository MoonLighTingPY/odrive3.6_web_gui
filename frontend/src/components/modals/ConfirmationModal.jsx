import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Box,
  Button,
  Alert,
  AlertIcon,
  VStack,
  HStack,
} from '@chakra-ui/react'

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  pendingAction, 
  getActionDetails, 
  onConfirm, 
  isLoading, 
  enabledCommandCount, 
  customCommandCount,
  targetAxis 
}) => {
  const actionDetails = getActionDetails(pendingAction)
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg="gray.800" border="1px solid" borderColor="gray.600">
        <ModalHeader color="white">
          {actionDetails.title}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text color="gray.300">
              {actionDetails.description}
            </Text>
            
            <Box bg="gray.900" p={3} borderRadius="md" border="1px solid" borderColor="gray.600">
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.400">Target:</Text>
                  <Text fontSize="sm" color="white" fontWeight="medium">
                    {targetAxis === 'both' ? 'Both Axes (Axis 0 & Axis 1)' : `Axis ${targetAxis} Only`}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.400">Commands:</Text>
                  <Text fontSize="sm" color="white">{enabledCommandCount}</Text>
                </HStack>
                {customCommandCount > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.400">Custom commands:</Text>
                    <Text fontSize="sm" color="yellow.300">{customCommandCount}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button
              colorScheme={actionDetails.color || 'blue'}
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText="Processing..."
            >
              {actionDetails.confirmText}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmationModal