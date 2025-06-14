import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast
} from '@chakra-ui/react'
import { 
  odriveRegistry, 
  getDebugInfo, 
  generateAllCommands,
  validateConfig
} from '../../utils/odriveUnifiedRegistry'

const UnifiedRegistryDebug = () => {
  const [debugInfo, setDebugInfo] = useState(getDebugInfo())
  const toast = useToast()

  const testConfig = {
    power: {
      dc_bus_overvoltage_trip_level: 56,
      brake_resistor_enabled: true,
      brake_resistance: 2.0
    },
    motor: {
      motor_type: 0,
      pole_pairs: 7,
      current_lim: 10
    },
    encoder: {
      encoder_type: 0,
      cpr: 4000
    },
    control: {
      control_mode: 3,
      input_mode: 1,
      vel_limit: 20
    },
    interface: {
      can_node_id: 0,
      enable_uart_a: true
    }
  }

  const handleTestCommandGeneration = () => {
    try {
      const commands = generateAllCommands(testConfig)
      console.log('Generated commands:', commands)
      toast({
        title: 'Command Generation Test',
        description: `Generated ${commands.length} commands successfully`,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Command Generation Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleTestValidation = () => {
    const errors = []
    Object.entries(testConfig).forEach(([category, config]) => {
      const categoryErrors = validateConfig(category, config)
      errors.push(...categoryErrors.map(err => `${category}: ${err}`))
    })

    if (errors.length === 0) {
      toast({
        title: 'Validation Test',
        description: 'All test configuration values are valid',
        status: 'success',
        duration: 3000,
      })
    } else {
      console.log('Validation errors:', errors)
      toast({
        title: 'Validation Test',
        description: `Found ${errors.length} validation errors`,
        status: 'warning',
        duration: 3000,
      })
    }
  }

  return (
    <Box p={4} bg="gray.900" color="white">
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Unified Registry Debug Console
          </Text>
          
          <HStack spacing={4} mb={4}>
            <Button colorScheme="blue" onClick={handleTestCommandGeneration}>
              Test Command Generation
            </Button>
            <Button colorScheme="green" onClick={handleTestValidation}>
              Test Validation
            </Button>
            <Button colorScheme="purple" onClick={() => setDebugInfo(getDebugInfo())}>
              Refresh Debug Info
            </Button>
          </HStack>
        </Box>

        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">Registry Overview</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Text>Total Categories:</Text>
                  <Badge colorScheme="blue">{debugInfo.categories.length}</Badge>
                </HStack>
                <HStack>
                  <Text>Total Batch Paths:</Text>
                  <Badge colorScheme="green">{debugInfo.batchPathsCount}</Badge>
                </HStack>
                <Box>
                  <Text fontWeight="bold" mb={2}>Parameter Counts by Category:</Text>
                  <HStack spacing={4}>
                    {Object.entries(debugInfo.parameterCounts).map(([category, count]) => (
                      <VStack key={category} spacing={1}>
                        <Text fontSize="sm" color="gray.400">{category}</Text>
                        <Badge colorScheme="purple">{count}</Badge>
                      </VStack>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">Sample Parameters</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {Object.entries(debugInfo.sampleParams).map(([category, params]) => (
                <Box key={category} mb={4}>
                  <Text fontWeight="bold" color="yellow.300" mb={2}>{category.toUpperCase()}</Text>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th color="gray.300">Config Key</Th>
                        <Th color="gray.300">Property Path</Th>
                        <Th color="gray.300">ODrive Command</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {params.map((param, idx) => (
                        <Tr key={idx}>
                          <Td><Code colorScheme="blue">{param.key}</Code></Td>
                          <Td><Code colorScheme="green">{param.path}</Code></Td>
                          <Td><Code colorScheme="purple">{param.command}</Code></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ))}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">Test Configuration</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Code display="block" whiteSpace="pre-wrap" p={4} bg="gray.800" borderRadius="md">
                {JSON.stringify(testConfig, null, 2)}
              </Code>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">Generated Commands Preview</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <VStack align="stretch" spacing={4}>
                {Object.entries(testConfig).map(([category, config]) => {
                  const commands = odriveRegistry.generateCommands(category, config)
                  return (
                    <Box key={category}>
                      <HStack mb={2}>
                        <Text fontWeight="bold" color="yellow.300">{category.toUpperCase()}</Text>
                        <Badge colorScheme="green">{commands.length} commands</Badge>
                      </HStack>
                      <Box bg="gray.800" p={3} borderRadius="md">
                        {commands.map((cmd, idx) => (
                          <Code key={idx} display="block" mb={1}>
                            {cmd}
                          </Code>
                        ))}
                      </Box>
                    </Box>
                  )
                })}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  )
}

export default UnifiedRegistryDebug