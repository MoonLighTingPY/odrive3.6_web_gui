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
  List,
  ListItem,
  ListIcon,
  Code,
  Box,
  Badge,
} from '@chakra-ui/react'
import { WarningIcon, CheckCircleIcon, InfoIcon } from '@chakra-ui/icons'

/**
 * Shows curated guidance for a decoded error (causes / solutions / diagnostic
 * commands). `error` is { group, flag, description } plus an optional guide.
 */
const ErrorTroubleshootingModal = ({ isOpen, onClose, error, guide }) => {
  if (!error) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader color="red.300">
          <Badge colorScheme="red" mr={2}>{error.flag}</Badge>
          {guide?.title || error.description}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {guide ? (
            <VStack align="stretch" spacing={4}>
              <Text color="gray.300">{guide.description}</Text>

              <Box>
                <Text fontWeight="semibold" color="orange.300" mb={1}>Possible Causes</Text>
                <List spacing={1}>
                  {guide.causes.map((c) => (
                    <ListItem key={c} fontSize="sm"><ListIcon as={WarningIcon} color="orange.400" />{c}</ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="green.300" mb={1}>Recommended Solutions</Text>
                <List spacing={1}>
                  {guide.solutions.map((s) => (
                    <ListItem key={s} fontSize="sm"><ListIcon as={CheckCircleIcon} color="green.400" />{s}</ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="blue.300" mb={1}>Diagnostic Commands</Text>
                <VStack align="stretch" spacing={1}>
                  {guide.commands.map((cmd) => (
                    <Code key={cmd} fontSize="xs" p={1}>{cmd}</Code>
                  ))}
                </VStack>
              </Box>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={2}>
              <Text color="gray.300">{error.description}</Text>
              <Text fontSize="sm" color="gray.500">
                <InfoIcon mr={1} />No detailed guide for this error. Clear errors and check wiring/configuration.
              </Text>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ErrorTroubleshootingModal
