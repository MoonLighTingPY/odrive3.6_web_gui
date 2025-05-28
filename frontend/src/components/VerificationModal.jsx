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
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
} from '@chakra-ui/react'

const VerificationModal = ({
  isOpen,
  onClose,
  isVerifying,
  verificationProgress,
  verificationResults,
  onStartVerification,
  getStatusColor
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="gray.600" maxW="900px">
        <ModalHeader color="white">
          Verify Applied Configuration
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text color="gray.300">
              Would you like to verify that all configuration values were applied correctly? 
              This will read back each property from the ODrive to confirm the settings match what was intended.
            </Text>
            
            {isVerifying && (
              <Box>
                <Text color="white" mb={2}>Verification Progress:</Text>
                <Progress value={verificationProgress} colorScheme="blue" size="lg" />
                <Text color="gray.400" fontSize="sm" mt={1}>
                  {Math.round(verificationProgress)}% complete
                </Text>
              </Box>
            )}
            
            {verificationResults.length > 0 && (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="white" fontWeight="bold">Verification Results:</Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="green">
                      {verificationResults.filter(r => r.status === 'success').length} Success
                    </Badge>
                    <Badge colorScheme="orange">
                      {verificationResults.filter(r => r.status === 'mismatch').length} Mismatch
                    </Badge>
                    <Badge colorScheme="red">
                      {verificationResults.filter(r => r.status === 'error').length} Error
                    </Badge>
                  </HStack>
                </HStack>
                
                <Box
                  maxH="400px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                >
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.700">
                      <Tr>
                        <Th color="gray.300" borderColor="gray.600">Status</Th>
                        <Th color="gray.300" borderColor="gray.600">Command</Th>
                        <Th color="gray.300" borderColor="gray.600">Expected (Type)</Th>
                        <Th color="gray.300" borderColor="gray.600">Actual (Type)</Th>
                        <Th color="gray.300" borderColor="gray.600">Details</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {verificationResults.map((result, index) => (
                        <Tr key={index}>
                          <Td borderColor="gray.600">
                            <Badge colorScheme={getStatusColor(result.status)} variant="solid">
                              {result.status.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td borderColor="gray.600">
                            <Code fontSize="xs" bg="transparent" color="gray.300">
                              {result.command.length > 40 ? result.command.substring(0, 40) + '...' : result.command}
                            </Code>
                          </Td>
                          <Td borderColor="gray.600" color="white" fontSize="sm">
                            <VStack spacing={0} align="start">
                              <Text fontSize="xs" color="gray.400">
                                {typeof result.expectedValue} 
                              </Text>
                              <Code fontSize="xs" bg="transparent" color="yellow.300">
                                {String(result.expectedValue)}
                              </Code>
                            </VStack>
                          </Td>
                          <Td borderColor="gray.600" color="white" fontSize="sm">
                            <VStack spacing={0} align="start">
                              <Text fontSize="xs" color="gray.400">
                                {typeof result.actualValue}
                              </Text>
                              <Code fontSize="xs" bg="transparent" color="blue.300">
                                {String(result.actualValue)}
                              </Code>
                            </VStack>
                          </Td>
                          <Td borderColor="gray.600" color="gray.300" fontSize="xs">
                            {result.reason}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="blue"
            onClick={onStartVerification}
            isLoading={isVerifying}
            isDisabled={verificationResults.length > 0 && !isVerifying}
          >
            {verificationResults.length > 0 ? 'Re-verify Configuration' : 'Start Verification'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default VerificationModal