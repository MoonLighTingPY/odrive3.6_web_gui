import React from 'react'
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
  VStack,
  HStack,
  List,
  ListItem,
  ListIcon,
  Code,
  Alert,
  AlertIcon,
  Box,
  Divider,
  useClipboard
} from '@chakra-ui/react'
import {
  WarningIcon,
  CheckCircleIcon,
  InfoIcon
} from '@chakra-ui/icons'
import { getErrorTroubleshootingGuide } from '../../utils/odriveErrors'
import { EncoderError } from '../../utils/odriveErrors'


const ErrorTroubleshooting = ({ isOpen, onClose, errorCode, errorType = 'encoder' }) => {
  const guide = getErrorTroubleshootingGuide(errorCode, errorType)
  const { hasCopied, onCopy } = useClipboard(guide?.commands?.join('\n') || '')

  if (!guide) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader color="red.300">{guide.title}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Description */}
            <Alert status="error" variant="left-accent" bg="red.900" borderColor="red.500">
              <AlertIcon color="red.300" />
              <Text color="red.100">{guide.description}</Text>
            </Alert>

            {/* Specific guidance for CPR mismatch - FIXED CONDITION */}
            {errorType === 'encoder' && (errorCode & EncoderError.CPR_POLEPAIRS_MISMATCH) === EncoderError.CPR_POLEPAIRS_MISMATCH && (
              <Alert status="warning" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold" mb={2}>Quick Fix for CPR Mismatch:</Text>
                  <Text fontSize="sm" mb={2}>
                    For Hall encoders: This error should not occur since Hall sensors don't use CPR. 
                    Check that encoder mode is set to 1 (Hall) not 0 (Incremental).
                  </Text>
                  <Text fontSize="sm">
                    For Incremental encoders with 7 pole pairs: try CPR values like 28, 35, 56, 70, 140, 280, 2800, 4200, 5600, 7000, 8400.
                    Any multiple of your pole pairs should work.
                  </Text>
                </Box>
              </Alert>
            )}

            {/* Possible Causes */}
            <Box>
              <HStack mb={3}>
                <WarningIcon color="orange.400" />
                <Text fontWeight="bold" color="orange.300">Possible Causes:</Text>
              </HStack>
              <List spacing={2} ml={6}>
                {guide.causes.map((cause, index) => (
                  <ListItem key={index}>
                    <ListIcon as={WarningIcon} color="orange.400" boxSize={3} />
                    <Text fontSize="sm" color="gray.200">{cause}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            {/* Solutions */}
            <Box>
              <HStack mb={3}>
                <CheckCircleIcon color="green.400" />
                <Text fontWeight="bold" color="green.300">Recommended Solutions:</Text>
              </HStack>
              <List spacing={2} ml={6}>
                {guide.solutions.map((solution, index) => (
                  <ListItem key={index}>
                    <ListIcon as={CheckCircleIcon} color="green.400" boxSize={3} />
                    <Text fontSize="sm" color="gray.200">{solution}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            {/* Commands */}
            <Box>
              <HStack mb={3} justify="space-between">
                <HStack>
                  <InfoIcon color="blue.400" />
                  <Text fontWeight="bold" color="blue.300">Diagnostic Commands:</Text>
                </HStack>
                <Button
                  size="sm"
                  onClick={onCopy}
                  colorScheme="blue"
                  variant="outline"
                >
                  {hasCopied ? 'Copied!' : 'Copy Commands'}
                </Button>
              </HStack>
              <VStack spacing={2} align="stretch" ml={6}>
                {guide.commands.map((command, index) => (
                  <Code key={index} p={2} bg="gray.700" fontSize="sm" display="block">
                    {command}
                  </Code>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ErrorTroubleshooting