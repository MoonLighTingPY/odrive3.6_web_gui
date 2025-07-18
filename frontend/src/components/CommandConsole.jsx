import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { ODriveCommands } from '../utils/odriveUnifiedRegistry'
import {
  Box, VStack, HStack, Input, Button, Text, Select, FormControl, FormLabel,
  SimpleGrid, Code, Tooltip, IconButton, Badge
} from '@chakra-ui/react'
import { Send, Copy, Clock, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

const CommandConsole = ({ isConnected }) => {
  const [commandInput, setCommandInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCommand, setSelectedCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  
  const toast = useToast()
  
  // Get selected axis from Redux
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Define useODriveCommand hook inline (like in useOdriveButtons.jsx)
  const sendCommand = async (command) => {
    const response = await fetch('/api/odrive/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Command failed')
    }

    const result = await response.json()
    return result
  }
  
  // Get ODrive commands
  const odriveCommands = ODriveCommands

  const sendCommandHandler = async () => {
    if (!commandInput.trim()) return

    try {
      const result = await sendCommand(commandInput)
      
      // Format the result properly for display
      let formattedResult
      if (typeof result === 'object' && result !== null) {
        // If it's an object, try to extract the actual value or stringify it nicely
        if (result.result !== undefined) {
          formattedResult = result.result
        } else if (result.value !== undefined) {
          formattedResult = result.value
        } else if (result.response !== undefined) {
          formattedResult = result.response
        } else {
          formattedResult = JSON.stringify(result, null, 2)
        }
      } else {
        formattedResult = result
      }
      
      const historyEntry = {
        command: commandInput,
        timestamp: new Date().toLocaleTimeString(),
        success: true,
        result: formattedResult
      }
      
      setCommandHistory(prev => [...prev, historyEntry])
      setCommandInput('')
      
      toast({
        title: 'Command sent successfully',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      const historyEntry = {
        command: commandInput,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        result: error.message
      }
      
      setCommandHistory(prev => [...prev, historyEntry])
      
      toast({
        title: 'Command failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const insertCommand = (command) => {
    // Replace axis placeholders with selected axis
    const axisAwareCommand = command.replace(/axis0/g, `axis${selectedAxis}`)
    setCommandInput(axisAwareCommand)
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
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="semibold" color="white" fontSize="sm">Quick Commands</Text>
          <Badge colorScheme="blue" variant="solid" fontSize="xs">
            Axis {selectedAxis}
          </Badge>
        </HStack>
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
              {selectedCategory && odriveCommands[selectedCategory]?.map(cmd => {
                const displayCommand = cmd.command.replace(/axis0/g, `axis${selectedAxis}`)
                return (
                  <option key={cmd.command} value={cmd.command}>
                    {cmd.name} - {displayCommand}
                  </option>
                )
              })}
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
            <Code fontSize="xs" colorScheme="blue" p={2} borderRadius="md">
              {selectedCommand.replace(/axis0/g, `axis${selectedAxis}`)}
            </Code>
          </Box>
        )}
      </Box>

      {/* Command Input Section */}
      <Box p={4} bg="gray.700" borderBottom="1px solid" borderColor="gray.600">
        <HStack spacing={2}>
          <Input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={`Enter ODrive command (e.g., odrv0.axis${selectedAxis}.requested_state = 1)`}
            bg="gray.600"
            border="1px solid"
            borderColor="gray.500"
            color="white"
            fontFamily="mono"
            fontSize="sm"
            onKeyPress={(e) => e.key === 'Enter' && sendCommandHandler()}
          />
          <Button
            colorScheme="green"
            onClick={sendCommandHandler}
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
                        {typeof entry.result === 'object' && entry.result !== null 
                          ? JSON.stringify(entry.result, null, 2) 
                          : String(entry.result)
                        }
                      </Text>
                    </Box>
                  )}
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