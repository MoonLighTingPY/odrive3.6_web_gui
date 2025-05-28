import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Badge,
  useToast,
  Textarea,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import { updateDeviceProperty } from '../store/slices/deviceSlice'
import '../styles/InspectorTab.css'

const InspectorTab = ({ isConnected, odriveState }) => {
  const dispatch = useDispatch()
  const toast = useToast()
  const [commandInput, setCommandInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [propertyValue, setPropertyValue] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

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

      setCommandHistory(prev => [newEntry, ...prev.slice(0, 49)]) // Keep last 50 entries
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

  const updateProperty = async (path, value) => {
    try {
      const response = await fetch('/api/odrive/set_property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, value })
      })

      if (response.ok) {
        dispatch(updateDeviceProperty({ path, value }))
        toast({
          title: 'Property updated',
          status: 'success',
          duration: 2000,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Failed to update property',
          description: error.message,
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error updating property',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const flattenObject = (obj, prefix = '') => {
    let result = []
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          result = result.concat(flattenObject(obj[key], newKey))
        } else {
          result.push({
            path: newKey,
            value: obj[key],
            type: typeof obj[key]
          })
        }
      }
    }
    return result
  }

  const filteredProperties = flattenObject(odriveState).filter(prop =>
    prop.path.toLowerCase().includes(searchFilter.toLowerCase())
  )

  if (!isConnected) {
    return (
      <Box className="inspector-tab" p={8} textAlign="center">
        <Alert status="info" variant="subtle" borderRadius="md">
          <AlertIcon />
          Connect to an ODrive device to inspect properties and send commands.
        </Alert>
      </Box>
    )
  }

  return (
    <Box className="inspector-tab" p={6} h="100%">
      <VStack spacing={6} align="stretch" h="100%">
        <Heading size="lg" color="white">ODrive Inspector</Heading>

        <Tabs variant="enclosed" colorScheme="odrive" flex="1">
          <TabList>
            <Tab>Command Console</Tab>
            <Tab>Property Inspector</Tab>
            <Tab>Live Data</Tab>
          </TabList>

          <TabPanels flex="1">
            {/* Command Console */}
            <TabPanel h="100%">
              <VStack spacing={4} align="stretch" h="100%">
                <Card bg="gray.800" variant="elevated">
                  <CardHeader>
                    <Heading size="md" color="white">Send Command</Heading>
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
                        onKeyPress={(e) => e.key === 'Enter' && sendCommand()}
                      />
                      <Button colorScheme="odrive" onClick={sendCommand} isDisabled={!commandInput.trim()}>
                        Send
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>

                <Card bg="gray.800" variant="elevated" flex="1">
                  <CardHeader>
                    <Heading size="md" color="white">Command History</Heading>
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
                                <Code colorScheme="blue" fontSize="sm">{entry.command}</Code>
                                <Badge colorScheme={entry.success ? "green" : "red"} fontSize="xs">
                                  {entry.timestamp}
                                </Badge>
                              </HStack>
                              <Text 
                                fontSize="sm" 
                                color={entry.success ? "green.300" : "red.300"}
                                fontFamily="mono"
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
            </TabPanel>

            {/* Property Inspector */}
            <TabPanel h="100%">
              <VStack spacing={4} align="stretch" h="100%">
                <Card bg="gray.800" variant="elevated">
                  <CardHeader>
                    <Heading size="md" color="white">Search Properties</Heading>
                  </CardHeader>
                  <CardBody>
                    <Input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter properties (e.g., axis0.motor, config, error)"
                      bg="gray.700"
                      border="1px solid"
                      borderColor="gray.600"
                      color="white"
                    />
                  </CardBody>
                </Card>

                <Card bg="gray.800" variant="elevated" flex="1">
                  <CardHeader>
                    <Heading size="md" color="white">Properties ({filteredProperties.length})</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box maxH="500px" overflowY="auto">
                      <Table size="sm" variant="simple">
                        <Thead position="sticky" top={0} bg="gray.800">
                          <Tr>
                            <Th color="gray.300" borderColor="gray.600">Property Path</Th>
                            <Th color="gray.300" borderColor="gray.600">Value</Th>
                            <Th color="gray.300" borderColor="gray.600">Type</Th>
                            <Th color="gray.300" borderColor="gray.600">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredProperties.map((prop, index) => (
                            <Tr key={index}>
                              <Td color="odrive.300" fontSize="sm" fontFamily="mono" borderColor="gray.600">
                                {prop.path}
                              </Td>
                              <Td color="white" fontSize="sm" borderColor="gray.600">
                                {typeof prop.value === 'boolean' 
                                  ? prop.value.toString() 
                                  : typeof prop.value === 'number'
                                    ? prop.value.toFixed(4)
                                    : String(prop.value)
                                }
                              </Td>
                              <Td color="gray.400" fontSize="xs" borderColor="gray.600">
                                <Badge colorScheme="gray" variant="outline">{prop.type}</Badge>
                              </Td>
                              <Td borderColor="gray.600">
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedProperty(prop.path)
                                    setPropertyValue(String(prop.value))
                                  }}
                                >
                                  Edit
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </CardBody>
                </Card>

                {selectedProperty && (
                  <Card bg="gray.800" variant="elevated">
                    <CardHeader>
                      <Heading size="sm" color="white">Edit Property: {selectedProperty}</Heading>
                    </CardHeader>
                    <CardBody>
                      <HStack>
                        <Input
                          value={propertyValue}
                          onChange={(e) => setPropertyValue(e.target.value)}
                          bg="gray.700"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                        />
                        <Button
                          colorScheme="green"
                          onClick={() => {
                            const numValue = parseFloat(propertyValue)
                            const finalValue = isNaN(numValue) ? propertyValue : numValue
                            updateProperty(selectedProperty, finalValue)
                            setSelectedProperty('')
                            setPropertyValue('')
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty('')
                            setPropertyValue('')
                          }}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Live Data */}
            <TabPanel h="100%">
              <Card bg="gray.800" variant="elevated" h="100%">
                <CardHeader>
                  <Heading size="md" color="white">Live ODrive State</Heading>
                </CardHeader>
                <CardBody>
                  <Box maxH="600px" overflowY="auto">
                    <Textarea
                      value={JSON.stringify(odriveState, null, 2)}
                      readOnly
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.600"
                      color="green.300"
                      fontFamily="mono"
                      fontSize="sm"
                      minH="500px"
                    />
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

export default InspectorTab