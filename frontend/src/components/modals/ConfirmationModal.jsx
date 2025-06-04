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
} from '@chakra-ui/react'

const ConfirmationModal = ({
  isOpen,
  onClose,
  pendingAction,
  getActionDetails,
  onConfirm,
  isLoading,
  enabledCommandCount,
  customCommandCount
}) => {
  const actionDetails = getActionDetails(pendingAction)

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="gray.600">
        <ModalHeader color="white">
          {actionDetails.title}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <Text color="gray.300" mb={4}>
            {actionDetails.description}
          </Text>
          {pendingAction === 'apply' && (
            <Box>
              <Text color="white" fontWeight="bold" mb={2}>
                Commands to execute: {enabledCommandCount}
              </Text>
              <Text color="gray.400" fontSize="sm">
                This will send all enabled configuration commands shown in the preview above.
              </Text>
              {customCommandCount > 0 && (
                <Text color="yellow.400" fontSize="sm" mt={2}>
                  ⚠️ Includes {customCommandCount} custom/modified commands
                </Text>
              )}
              <Text color="blue.400" fontSize="sm" mt={2}>
                ℹ️ After applying, you'll be prompted to verify the configuration was set correctly.
              </Text>
            </Box>
          )}
          {pendingAction && pendingAction.includes('calibrate') && (
            <Alert status="info" variant="left-accent" mt={4}>
              <AlertIcon />
              <Text fontSize="sm">
                The calibration will follow the proper ODrive v0.5.6 sequence and automatically progress through each phase.
              </Text>
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme={actionDetails.color}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {actionDetails.confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmationModal