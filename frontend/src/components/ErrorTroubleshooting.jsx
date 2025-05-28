import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Code,
  List,
  ListItem,
  ListIcon,
  Divider,
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  useClipboard,
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import { getErrorTroubleshootingGuide } from '../utils/odriveErrors'

const ErrorTroubleshooting = ({ isOpen, onClose, errorCode, errorType = 'encoder' }) => {
  const guide = getErrorTroubleshootingGuide(errorCode, errorType)
  const { onCopy, hasCopied } = useClipboard(
    guide?.commands?.join('\n') || 'No commands available'
  )

  if (!guide) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Error Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="info">
              <AlertIcon />
              No specific troubleshooting guide available for this error code.
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" maxH="80vh" overflowY="auto">
        <ModalHeader>
          <HStack>
            <Text>{guide.title}</Text>
            <Badge colorScheme="red" fontSize="sm">
              0x{errorCode.toString(16).toUpperCase()}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Description */}
            <Alert status="error" variant="left-accent">
              <AlertIcon />
              <Text>{guide.description}</Text>
            </Alert>

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

            {/* Specific guidance for CPR mismatch */}
            {errorCode === 0x2 && (
              <Alert status="warning" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold" mb={2}>Quick Fix for CPR Mismatch:</Text>
                  <Text fontSize="sm">
                    If you have 7 pole pairs, try these CPR values: 2800, 4200, 5600, 7000, 8400.
                    Higher values provide better resolution but require more processing power.
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ErrorTroubleshooting