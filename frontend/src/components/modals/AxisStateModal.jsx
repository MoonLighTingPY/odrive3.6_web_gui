import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react'
import { useAxisStates, setBothAxesToIdle } from '../../utils/axisStateChecker'

const AxisStateModal = ({ 
  isOpen, 
  onClose, 
  onContinue, 
  actionName = "configure the ODrive"}) => {
  const [isSettingIdle, setIsSettingIdle] = useState(false)
  const toast = useToast()
  const { nonIdleAxes, areBothAxesIdle } = useAxisStates()

  const handleSetToIdle = async () => {
    setIsSettingIdle(true)
    try {
      await setBothAxesToIdle()
      
      toast({
        title: 'Axes Set to Idle',
        description: 'Both axes have been set to idle state.',
        status: 'success',
        duration: 3000,
      })
      
      // Small delay to let the state update
      setTimeout(() => {
        if (areBothAxesIdle) {
          onContinue()
        }
      }, 1000)
      
    } catch (error) {
      toast({
        title: 'Failed to Set Idle',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsSettingIdle(false)
    }
  }

  const handleContinueAnyway = () => {
    onContinue()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>⚠️ Axes Not in Idle State</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning" bg="orange.900" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Cannot {actionName} while axes are not in idle state. 
                The following axes need to be set to idle:
              </Text>
            </Alert>

            <VStack spacing={2} align="stretch">
              {nonIdleAxes.map(({ axis, state, stateName }) => (
                <HStack key={axis} justify="space-between" p={3} bg="gray.700" borderRadius="md">
                  <HStack spacing={2}>
                    <Badge colorScheme="blue" variant="solid">
                      Axis {axis}
                    </Badge>
                    <Text fontSize="sm">Current state:</Text>
                  </HStack>
                  <Badge 
                    colorScheme={state === 1 ? "green" : "orange"} 
                    variant="solid"
                    fontSize="xs"
                  >
                    {stateName}
                  </Badge>
                </HStack>
              ))}
            </VStack>

            <Text fontSize="sm" color="gray.300">
              Setting axes to idle will stop any ongoing operations like calibration or motor control.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleSetToIdle}
              isLoading={isSettingIdle}
              loadingText="Setting Idle..."
            >
              Set to Idle & Continue
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleContinueAnyway}
              title="Force continue - not recommended"
            >
              Continue Anyway
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AxisStateModal