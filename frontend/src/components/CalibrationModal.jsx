import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'

const CalibrationModal = ({
  isOpen,
  onClose,
  isCalibrating,
  calibrationProgress,
  calibrationPhase,
  calibrationSequence,
  calibrationStatus,
  getCalibrationPhaseDescription
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="gray.600">
        <ModalHeader color="white">
          Calibration in Progress
        </ModalHeader>
        {!isCalibrating && <ModalCloseButton color="white" />}
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="center">
              <CircularProgress
                value={calibrationProgress}
                color="orange.400"
                size="120px"
                thickness="4px"
              >
                <CircularProgressLabel color="white" fontSize="lg">
                  {Math.round(calibrationProgress)}%
                </CircularProgressLabel>
              </CircularProgress>
            </HStack>
            
            <Text color="white" textAlign="center" fontWeight="bold">
              Current Phase: {calibrationPhase.replace(/_/g, ' ').toUpperCase()}
            </Text>
            
            <Text color="gray.300" textAlign="center" fontSize="sm">
              {getCalibrationPhaseDescription(calibrationPhase)}
            </Text>
            
            {calibrationSequence.length > 0 && (
              <Box>
                <Text color="white" fontWeight="bold" mb={2}>Calibration Sequence:</Text>
                <VStack spacing={1} align="stretch">
                  {calibrationSequence.map((step, index) => (
                    <HStack key={index} spacing={2}>
                      <Badge
                        colorScheme={
                          index < calibrationSequence.indexOf(calibrationPhase.replace('_calibration', '').replace('encoder_', '')) ? 'green' :
                          step === calibrationPhase.replace('_calibration', '').replace('encoder_', '') ? 'orange' : 'gray'
                        }
                        variant="solid"
                      >
                        {index + 1}
                      </Badge>
                      <Text color="gray.300" fontSize="sm">
                        {step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
            
            {calibrationStatus && (calibrationStatus.axis_error !== 0 || calibrationStatus.motor_error !== 0 || calibrationStatus.encoder_error !== 0) && (
              <Alert status="error" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Calibration Errors Detected:</Text>
                  {calibrationStatus.axis_error !== 0 && <Text fontSize="sm">Axis Error: 0x{calibrationStatus.axis_error.toString(16).toUpperCase()}</Text>}
                  {calibrationStatus.motor_error !== 0 && <Text fontSize="sm">Motor Error: 0x{calibrationStatus.motor_error.toString(16).toUpperCase()}</Text>}
                  {calibrationStatus.encoder_error !== 0 && <Text fontSize="sm">Encoder Error: 0x{calibrationStatus.encoder_error.toString(16).toUpperCase()}</Text>}
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          {!isCalibrating && (
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CalibrationModal