import { useState } from 'react'
import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Code,
  Badge,
  useToast,
  Textarea,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { odriveCommands } from '../../utils/odriveCommands'

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
      
      const newEntry = {
        command: commandInput,
        result: result.result || result.error,
        success: response.ok,
        timestamp: new Date().toLocaleTimeString()
      }

      setCommandHistory(prev => [newEntry, ...prev.slice(0, 49)])
      setCommandInput('')

      if (response.ok) {
        toast({
          title: 'Command executed successfully',
          status: 'success',
          duration: 2000,
        })
      } else {
        toast({
          title: 'Command failed',
          description: result.error,
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error sending command',
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
  }

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Command Categories */}
      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Quick Commands</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3}>
            <HStack w="100%">
              <FormControl flex="1">
                <FormLabel color="white" fontSize="sm">Category</FormLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setSelectedCommand('')
                  }}
                  bg="gray.700"
                  color="white"
                  placeholder="Select command category"
                >
                  {Object.keys(odriveCommands).map(category => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl flex="1">
                <FormLabel color="white" fontSize="sm">Command</FormLabel>
                <Select
                  value={selectedCommand}
                  onChange={(e) => setSelectedCommand(e.target.value)}
                  bg="gray.700"
                  color="white"
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
              <Button
                colorScheme="blue"
                onClick={() => insertCommand(selectedCommand)}
                isDisabled={!selectedCommand}
                mt={6}
              >
                Insert
              </Button>
            </HStack>
            
            {selectedCommand && selectedCategory && (
              <Box p={3} bg="gray.700" borderRadius="md" w="100%">
                <Text fontSize="sm" color="gray.300" mb={1}>
                  {odriveCommands[selectedCategory].find(cmd => cmd.command === selectedCommand)?.description}
                </Text>
                <Code fontSize="sm" colorScheme="blue">{selectedCommand}</Code>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Command Input */}
      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="white">Send Command</Heading>
            <Button size="sm" variant="ghost" onClick={clearHistory} color="gray.400">
              Clear History
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <HStack>
            <Input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Enter ODrive command (e.g., odrv0.axis0.requested_state = 1)"
              bg="gray.700"
              border="1px solid"
              borderColor="gray.600"
              color="white"
              fontFamily="mono"
              onKeyPress={(e) => e.key === 'Enter' && sendCommand()}
            />
            <Button 
              colorScheme="odrive" 
              onClick={sendCommand} 
              isDisabled={!commandInput.trim() || !isConnected}
            >
              Send
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Command History */}
      <Card bg="gray.800" variant="elevated" flex="1">
        <CardHeader>
          <Heading size="md" color="white">
            Command History ({commandHistory.length})
          </Heading>
        </CardHeader>
        <CardBody>
          <Box maxH="400px" overflowY="auto">
            {commandHistory.length === 0 ? (
              <Text color="gray.400" textAlign="center">No commands executed yet</Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {commandHistory.map((entry, index) => (
                  <Box key={index} p={3} bg="gray.900" borderRadius="md">
                    <HStack justify="space-between" mb={1}>
                      <Code 
                        colorScheme={entry.success ? "green" : "red"} 
                        fontSize="sm"
                        onClick={() => setCommandInput(entry.command)}
                        cursor="pointer"
                        _hover={{ bg: entry.success ? "green.700" : "red.700" }}
                      >
                        {entry.command}
                      </Code>
                      <Badge colorScheme={entry.success ? "green" : "red"} fontSize="xs">
                        {entry.timestamp}
                      </Badge>
                    </HStack>
                    <Text 
                      fontSize="sm" 
                      color={entry.success ? "green.300" : "red.300"}
                      fontFamily="mono"
                      whiteSpace="pre-wrap"
                    >
                      {String(entry.result)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default CommandConsole