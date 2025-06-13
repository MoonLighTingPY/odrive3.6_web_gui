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
  
  // Helper function to determine step status
  const getStepStatus = (step, currentPhase, calibrationStatus) => {
    // Normalize step names for comparison
    const normalizeStep = (stepName) => {
      return stepName.toLowerCase().replace(/[_\s]/g, '').replace('calibration', '')
    }
    
    const normalizedStep = normalizeStep(step)
    const normalizedPhase = normalizeStep(currentPhase)
    
    // Check if this step has been completed successfully
    const isMotorStep = normalizedStep.includes('motor')
    const isEncoderPolarityStep = normalizedStep.includes('encoderpolarity') || normalizedStep.includes('polarity') || normalizedStep.includes('dirfind')
    const isEncoderOffsetStep = normalizedStep.includes('encoderoffset') || normalizedStep.includes('offset')
    
    // During calibration, show current active step
    if (isCalibrating) {
      // Check if this is the currently active step
      if (normalizedStep === normalizedPhase || 
          (isMotorStep && normalizedPhase.includes('motor')) ||
          (isEncoderPolarityStep && (normalizedPhase.includes('polarity') || normalizedPhase.includes('dirfind'))) ||
          (isEncoderOffsetStep && normalizedPhase.includes('offset'))) {
        return 'active'
      }
      
      // FIXED: Only show success for steps that have actually completed during this calibration
      // We need to track progress through the sequence, not just check final flags
      const currentStepIndex = calibrationSequence.findIndex(seqStep => 
        normalizeStep(seqStep) === normalizedPhase ||
        (isMotorStep && normalizeStep(seqStep).includes('motor') && normalizedPhase.includes('motor')) ||
        (isEncoderPolarityStep && (normalizeStep(seqStep).includes('polarity') || normalizeStep(seqStep).includes('dirfind')) && (normalizedPhase.includes('polarity') || normalizedPhase.includes('dirfind'))) ||
        (isEncoderOffsetStep && normalizeStep(seqStep).includes('offset') && normalizedPhase.includes('offset'))
      )
      
      const thisStepIndex = calibrationSequence.findIndex(seqStep => normalizeStep(seqStep) === normalizedStep)
      
      // If this step comes before the current step in the sequence, it's completed
      if (thisStepIndex < currentStepIndex && thisStepIndex !== -1) {
        // Double-check with calibration status to ensure it actually completed successfully
        if (calibrationStatus) {
          if (isMotorStep && calibrationStatus.motor_calibrated) return 'success'
          if (isEncoderPolarityStep && calibrationStatus.encoder_polarity_calibrated) return 'success'
          if (isEncoderOffsetStep && calibrationStatus.encoder_ready) return 'success'
        }
      }
      
      // All other steps during calibration are pending
      return 'pending'
    }
    
    // If calibration is complete, check final status
    if (!isCalibrating && calibrationStatus) {
      const hasErrors = calibrationStatus.axis_error !== 0 || 
                       calibrationStatus.motor_error !== 0 || 
                       calibrationStatus.encoder_error !== 0
      
      if (isMotorStep) {
        return calibrationStatus.motor_calibrated ? 'success' : (hasErrors ? 'error' : 'pending')
      }
      if (isEncoderPolarityStep) {
        return calibrationStatus.encoder_polarity_calibrated ? 'success' : (hasErrors ? 'error' : 'pending')
      }
      if (isEncoderOffsetStep) {
        return calibrationStatus.encoder_ready ? 'success' : (hasErrors ? 'error' : 'pending')
      }
    }
    
    return 'pending'
  }
  
  // Helper function to get step icon
  const getStepIcon = (status) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'active': return '⚡'
      default: return '⏳'
    }
  }
  
  // Helper function to get step color
  const getStepColor = (status) => {
    switch (status) {
      case 'success': return 'green'
      case 'error': return 'red'
      case 'active': return 'orange'
      default: return 'gray'
    }
  }
  
  // Check if calibration is finished (either successful or failed)
  const isCalibrationFinished = !isCalibrating && calibrationStatus && (
    calibrationStatus.calibration_phase === 'complete' ||
    calibrationStatus.calibration_phase === 'full_calibration_complete' ||
    calibrationStatus.calibration_phase === 'failed' ||
    calibrationStatus.calibration_phase === 'motor_complete' ||
    (calibrationStatus.axis_error !== 0 || calibrationStatus.motor_error !== 0 || calibrationStatus.encoder_error !== 0)
  )
  
  // Determine if calibration was successful
  const isCalibrationSuccessful = isCalibrationFinished && 
    calibrationStatus.axis_error === 0 && 
    calibrationStatus.motor_error === 0 && 
    calibrationStatus.encoder_error === 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!isCalibrating}>
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="gray.600">
        <ModalHeader color="white">
          {isCalibrationFinished ? 
            (isCalibrationSuccessful ? 'Calibration Complete!' : 'Calibration Finished') :
            'Calibration in Progress'
          }
        </ModalHeader>
        {!isCalibrating && <ModalCloseButton color="white" />}
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="center">
              <CircularProgress
                value={calibrationProgress}
                color={isCalibrationFinished ? 
                  (isCalibrationSuccessful ? "green.400" : "red.400") : 
                  "orange.400"
                }
                size="120px"
                thickness="4px"
              >
                <CircularProgressLabel color="white" fontSize="lg">
                  {isCalibrationFinished ? 
                    (isCalibrationSuccessful ? '✅' : '❌') :
                    `${Math.round(calibrationProgress)}%`
                  }
                </CircularProgressLabel>
              </CircularProgress>
            </HStack>
            
            <Text color="white" textAlign="center" fontWeight="bold">
              {isCalibrationFinished ? 
                (isCalibrationSuccessful ? 'Success!' : 'Finished with issues') :
                `Current Phase: ${calibrationPhase.replace(/_/g, ' ').toUpperCase()}`
              }
            </Text>
            
            <Text color="gray.300" textAlign="center" fontSize="sm">
              {isCalibrationFinished ? 
                (isCalibrationSuccessful ? 
                  'All calibration steps completed successfully!' : 
                  'Calibration completed but there may be errors to address.') :
                getCalibrationPhaseDescription(calibrationPhase)
              }
            </Text>
            
            {calibrationSequence.length > 0 && (
              <Box>
                <VStack spacing={2} align="stretch">
                  {calibrationSequence.map((step, index) => {
                    const stepStatus = getStepStatus(step, calibrationPhase, calibrationStatus)
                    const stepColor = getStepColor(stepStatus)
                    const stepIcon = getStepIcon(stepStatus)
                    
                    return (
                      <HStack key={index} spacing={3} justify="space-between" 
                        bg={stepStatus === 'active' ? 'orange.900' : 'transparent'}
                        p={2} borderRadius="md"
                        border={stepStatus === 'active' ? '1px solid' : 'none'}
                        borderColor={stepStatus === 'active' ? 'orange.400' : 'transparent'}
                      >
                        <HStack spacing={3}>
                          <Badge
                            colorScheme={stepColor}
                            variant="solid"
                            fontSize="sm"
                            w="8"
                            h="8"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {index + 1}
                          </Badge>
                          <Text 
                            color={stepStatus === 'active' ? 'orange.300' : 'gray.300'} 
                            fontSize="sm"
                            fontWeight={stepStatus === 'active' ? 'bold' : 'normal'}
                          >
                            {step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                        </HStack>
                        <Text fontSize="lg">
                          {stepIcon}
                        </Text>
                      </HStack>
                    )
                  })}
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
            
            {isCalibrationFinished && isCalibrationSuccessful && (
              <Alert status="success" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Calibration Successful!</Text>
                  <Text fontSize="sm">
                    Your ODrive is now calibrated and ready for closed-loop control.
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          {isCalibrationFinished ? (
            <Button colorScheme="blue" onClick={onClose}>
              OK
            </Button>
          ) : (
            <Text color="gray.400" fontSize="sm">
              Calibration in progress... Please wait
            </Text>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CalibrationModal