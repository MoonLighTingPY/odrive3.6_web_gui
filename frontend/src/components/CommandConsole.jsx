import { useState } from 'react'
import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Box,
  Code,
  Badge,
  useToast,
  Select,
  FormControl,
  FormLabel,
  IconButton,
  Tooltip,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react'
import { Send, Clock, AlertCircle, CheckCircle, Copy, Trash2 } from 'lucide-react'
import { odriveCommands } from '../utils/odriveCommands'

const CommandConsole = ({ isConnected }) => {
  const toast = useToast()
  const [commandInput, setCommandInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCommand, setSelectedCommand] = useState('')

  const sendCommand = async () => {
    if (!commandInput.trim()) return

    try {
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandInput })
      })

      const result = await response.json()
      
      // Debug: Log the actual response to see its structure
      console.log('Command response:', result)

      const newEntry = {
        command: commandInput,
        result: result.result || result.response || result.output || result.error || result.message || JSON.stringify(result),
        success: response.ok,
        timestamp: new Date().toLocaleTimeString()
      }

      setCommandHistory(prev => [newEntry, ...prev.slice(0, 49)])
      setCommandInput('')

      if (response.ok) {
        toast({
          title: 'Command executed',
          status: 'success',
          duration: 2000,
        })
      } else {
        toast({
          title: 'Command failed',
          description: result.error || result.message || 'Unknown error',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Connection error',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const insertCommand = (command) => {
    setCommandInput(command)
  }

  const clearHistory = () => {
    setCommandHistory([])
    toast({
      title: 'History cleared',
      status: 'info',
      duration: 1000,
    })
  }

  const copyCommand = (command) => {
    navigator.clipboard.writeText(command)
    toast({
      title: 'Copied to clipboard',
      status: 'info',
      duration: 1000,
    })
  }

  return (
    <VStack spacing={0} align="stretch" h="100%">
      
      {/* Quick Commands Section */}
      <Box p={4} bg="gray.700" borderBottom="1px solid" borderColor="gray.600">
        <Text fontWeight="semibold" color="white" fontSize="sm" mb={3}>Quick Commands</Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          <FormControl size="sm">
            <FormLabel color="gray.300" fontSize="xs" mb={1}>Category</FormLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedCommand('')
              }}
              bg="gray.600"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              size="sm"
              placeholder="Select category"
            >
              {Object.keys(odriveCommands).map(category => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="sm">
            <FormLabel color="gray.300" fontSize="xs" mb={1}>Command</FormLabel>
            <Select
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value)}
              bg="gray.600"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              size="sm"
              placeholder="Select command"
              isDisabled={!selectedCategory}
            >
              {selectedCategory && odriveCommands[selectedCategory]?.map(cmd => (
                <option key={cmd.command} value={cmd.command}>
                  {cmd.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <VStack align="stretch" spacing={1}>
            <Text color="gray.300" fontSize="xs" mb={1}>Action</Text>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => insertCommand(selectedCommand)}
              isDisabled={!selectedCommand}
              leftIcon={<Copy size={14} />}
            >
              Insert
            </Button>
          </VStack>
        </SimpleGrid>
        
        {selectedCommand && selectedCategory && (
          <Box mt={3} p={3} bg="gray.600" borderRadius="md">
            <Text fontSize="xs" color="gray.200" mb={2}>
              {odriveCommands[selectedCategory].find(cmd => cmd.command === selectedCommand)?.description}
            </Text>
            <Code fontSize="xs" colorScheme="blue" p={2} borderRadius="md">{selectedCommand}</Code>
          </Box>
        )}
      </Box>

      {/* Command Input Section */}
      <Box p={4} bg="gray.700" borderBottom="1px solid" borderColor="gray.600">
        <HStack spacing={2}>
          <Input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Enter ODrive command (e.g., odrv0.axis0.requested_state = 1)"
            bg="gray.600"
            border="1px solid"
            borderColor="gray.500"
            color="white"
            fontFamily="mono"
            fontSize="sm"
            onKeyPress={(e) => e.key === 'Enter' && sendCommand()}
          />
          <Button 
            colorScheme="green" 
            onClick={sendCommand} 
            isDisabled={!commandInput.trim() || !isConnected}
            leftIcon={<Send size={14} />}
            size="sm"
            minW="80px"
          >
            Send
          </Button>
        </HStack>
      </Box>

      {/* Command History Section */}
      <VStack spacing={0} align="stretch" flex="1">
        <HStack justify="space-between" p={3} bg="gray.700" borderBottom="1px solid" borderColor="gray.600">
          <HStack spacing={2}>
            <Clock size={16} color="#a0aec0" />
            <Text fontWeight="semibold" color="white" fontSize="sm">
              History
            </Text>
            <Badge colorScheme="gray" size="sm">{commandHistory.length}</Badge>
          </HStack>
          <Tooltip label="Clear history">
            <IconButton 
              size="xs" 
              variant="ghost" 
              onClick={clearHistory}
              icon={<Trash2 size={14} />}
              color="gray.300"
              isDisabled={commandHistory.length === 0}
            />
          </Tooltip>
        </HStack>
        
        <Box flex="1" overflowY="auto" p={4}>
          {commandHistory.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" fontSize="sm">No commands executed yet</Text>
            </Box>
          ) : (
            <VStack spacing={2} align="stretch">
              {commandHistory.map((entry, index) => (
                <Box key={index}>
                  <HStack justify="space-between" py={2}>
                    <HStack spacing={2} flex="1" minW="0">
                      {entry.success ? (
                        <CheckCircle size={14} color="#48bb78" />
                      ) : (
                        <AlertCircle size={14} color="#f56565" />
                      )}
                      <Code 
                        fontSize="xs"
                        bg="transparent"
                        color={entry.success ? "green.300" : "red.300"}
                        p={1}
                        onClick={() => setCommandInput(entry.command)}
                        cursor="pointer"
                        _hover={{ bg: "gray.600" }}
                        borderRadius="md"
                        isTruncated
                        flex="1"
                      >
                        {entry.command}
                      </Code>
                    </HStack>
                    <HStack spacing={2}>
                      <Tooltip label="Copy command">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={<Copy size={12} />}
                          onClick={() => copyCommand(entry.command)}
                          color="gray.400"
                        />
                      </Tooltip>
                      <Text fontSize="xs" color="gray.500" minW="fit-content">
                        {entry.timestamp}
                      </Text>
                    </HStack>
                  </HStack>
                  {entry.result && (
                    <Box ml={6} mb={2}>
                      <Text 
                        fontSize="xs" 
                        color={entry.success ? "gray.300" : "red.300"}
                        fontFamily="mono"
                        bg="gray.800"
                        p={2}
                        borderRadius="md"
                        whiteSpace="pre-wrap"
                      >
                        {String(entry.result)}
                      </Text>
                    </Box>
                  )}
                  {index < commandHistory.length - 1 && <Divider borderColor="gray.600" />}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </VStack>
  )
}

export default CommandConsole