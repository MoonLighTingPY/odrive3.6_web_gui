import { useSelector } from 'react-redux'
import {
  VStack,
  Box,
  Heading,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import CommandConsole from '../inspector/CommandConsole'

const CommandConsoleTab = () => {
  const { isConnected } = useSelector(state => state.device)

  return (
    <Box p={6} bg="gray.900" h="100%">
      <VStack spacing={6} align="stretch" h="100%">
        
        <Box>
          <Heading size="lg" color="white" mb={2}>
            ODrive Command Console
          </Heading>
          <Text color="gray.300" mb={4}>
            Send commands directly to the ODrive device and view command history
          </Text>
        </Box>

        {!isConnected && (
          <Alert status="warning" bg="orange.900" borderColor="orange.500">
            <AlertIcon />
            Connect to an ODrive device to use the command console.
          </Alert>
        )}

        <Box flex="1">
          <CommandConsole isConnected={isConnected} />
        </Box>

      </VStack>
    </Box>
  )
}

export default CommandConsoleTab