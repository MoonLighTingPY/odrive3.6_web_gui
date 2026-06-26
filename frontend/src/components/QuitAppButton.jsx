import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react'
import { useState } from 'react'
import { shutdownApp } from '../api/backend'

/**
 * Stops the backend process (works in both dev and standalone). Shows a confirm
 * dialog, then a "process killed — safe to close this page" notice.
 */
const QuitAppButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [stopped, setStopped] = useState(false)

  const quit = async () => {
    await shutdownApp()
    setStopped(true)
  }

  return (
    <>
      <Button size="sm" colorScheme="red" variant="solid" onClick={onOpen}>
        Quit Application
      </Button>

      <Modal isOpen={isOpen} onClose={stopped ? undefined : onClose} isCentered closeOnOverlayClick={!stopped}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="red.300">{stopped ? 'Application stopped' : 'Quit ODrive GUI?'}</ModalHeader>
          <ModalBody>
            {stopped ? (
              <Alert status="success" borderRadius="md" bg="green.900">
                <AlertIcon />
                The application process has been stopped. You can safely close this web page.
              </Alert>
            ) : (
              <Text color="gray.300">
                This stops the backend server process. Any unsaved work should be applied first.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            {stopped ? (
              <Button colorScheme="red" onClick={() => window.close()}>Close Page</Button>
            ) : (
              <>
                <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                <Button colorScheme="red" onClick={quit}>Quit Application</Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default QuitAppButton
