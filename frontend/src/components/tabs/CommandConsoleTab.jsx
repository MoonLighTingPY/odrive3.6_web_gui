import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react'
import { Terminal, Wifi, WifiOff } from 'lucide-react'
import CommandConsole from '../CommandConsole'

const CommandConsoleTab = () => {
  const { isConnected, connectedDevice } = useSelector(state => state.device)

  return (
    <Box p={4} h="100%" maxW="1400px" mx="auto">
      <VStack spacing={4} align="stretch" h="100%">
        
        {/* Compact Header Bar */}
        <HStack justify="space-between" align="center" p={3} bg="gray.800" borderRadius="md">
          <HStack spacing={3}>
            <Terminal size={18} color="#00d4aa" />
            <Text color="white" fontWeight="semibold" fontSize="md">
              Command Console
            </Text>
          </HStack>
          
          <HStack spacing={3}>
            {connectedDevice && (
              <Badge 
                colorScheme="gray" 
                variant="subtle" 
                fontSize="xs"
                display={{ base: 'none', md: 'flex' }}
              >
                {connectedDevice.serial}
              </Badge>
            )}
            <HStack spacing={2}>
              {isConnected ? (
                <>
                  <Badge colorScheme="green" variant="solid" fontSize="xs">
                    CONNECTED
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff size={14} color="#f56565" />
                  <Badge colorScheme="red" variant="solid" fontSize="xs">
                    DISCONNECTED
                  </Badge>
                </>
              )}
            </HStack>
          </HStack>
        </HStack>

        {/* Warning for disconnected state - more compact */}
        {!isConnected && (
          <Alert status="warning" size="sm" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              Device not connected. Commands will be queued until connection is established.
            </Text>
          </Alert>
        )}

        {/* Console Content - Centered Card */}
        <Box 
          flex="1" 
          bg="gray.800" 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor="gray.600"
          overflow="hidden"
        >
          <CommandConsole isConnected={isConnected} />
        </Box>

      </VStack>
    </Box>
  )
}

export default CommandConsoleTab