import { useState, useEffect, useRef } from 'react'
import {
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Button,
  Select,
  FormControl,
  FormLabel,
  Switch,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { Download, Trash2, Play, Pause } from 'lucide-react'

const LiveDataView = ({ odriveState, isConnected }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedData, setRecordedData] = useState([])
  const [sampleRate, setSampleRate] = useState(10) // Hz
  const [maxSamples, setMaxSamples] = useState(1000)
  const [selectedProperties, setSelectedProperties] = useState([
    'vbus_voltage',
    'axis0.encoder.pos_estimate',
    'axis0.encoder.vel_estimate',
    'axis0.motor.current_control.Iq_measured',
    'axis0.controller.pos_setpoint',
    'axis0.controller.vel_setpoint'
  ])

  const intervalRef = useRef(null)
  useEffect(() => {
    if (isRecording && isConnected) {
      intervalRef.current = setInterval(() => {
        const timestamp = Date.now()
        const sample = { timestamp }
        
        selectedProperties.forEach(property => {
          sample[property] = getValueFromPath(odriveState, property)
        })
        
        setRecordedData(prev => {
          const newData = [...prev, sample]
          // Keep only the most recent samples
          if (newData.length > maxSamples) {
            return newData.slice(-maxSamples)
          }
          return newData
        })
      }, 1000 / sampleRate)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording, isConnected, sampleRate, selectedProperties, odriveState, maxSamples])

  const getValueFromPath = (obj, path) => {
    const parts = path.split('.')
    let current = obj
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part]
      } else {
        return null
      }
    }
    
    return current
  }

  const startRecording = () => {
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const clearData = () => {
    setRecordedData([])
  }

  const exportData = () => {
    if (recordedData.length === 0) return

    // Create CSV content
    const headers = ['timestamp', ...selectedProperties]
    const csvContent = [
      headers.join(','),
      ...recordedData.map(sample => 
        headers.map(header => {
          if (header === 'timestamp') {
            return new Date(sample.timestamp).toISOString()
          }
          return sample[header] !== null ? sample[header] : ''
        }).join(',')
      )
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `odrive_data_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const availableProperties = [
    'vbus_voltage',
    'axis0.current_state',
    'axis0.encoder.pos_estimate',
    'axis0.encoder.vel_estimate',
    'axis0.motor.current_control.Iq_measured',
    'axis0.motor.current_control.Id_measured',
    'axis0.controller.pos_setpoint',
    'axis0.controller.vel_setpoint',
    'axis0.controller.torque_setpoint',
    'axis0.motor.motor_thermistor.temperature',
    'axis0.motor.fet_thermistor.temperature'
  ]

  const toggleProperty = (property) => {
    setSelectedProperties(prev => 
      prev.includes(property) 
        ? prev.filter(p => p !== property)
        : [...prev, property]
    )
  }

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toString() : value.toFixed(3)
    }
    return String(value)
  }

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Controls */}
      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="white">Data Recording</Heading>
            <HStack spacing={2}>
              <Badge colorScheme={isRecording ? 'green' : 'gray'}>
                {isRecording ? 'Recording' : 'Stopped'}
              </Badge>
              <Badge colorScheme="blue">
                {recordedData.length} samples
              </Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {/* Recording Controls */}
            <HStack spacing={4} w="100%">
              <Button
                leftIcon={isRecording ? <Pause size={16} /> : <Play size={16} />}
                colorScheme={isRecording ? 'red' : 'green'}
                onClick={isRecording ? stopRecording : startRecording}
                isDisabled={!isConnected}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              
              <Tooltip label="Clear all recorded data">
                <IconButton
                  icon={<Trash2 size={16} />}
                  colorScheme="red"
                  variant="outline"
                  onClick={clearData}
                  isDisabled={recordedData.length === 0}
                />
              </Tooltip>
              
              <Tooltip label="Export data as CSV">
                <IconButton
                  icon={<Download size={16} />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={exportData}
                  isDisabled={recordedData.length === 0}
                />
              </Tooltip>
            </HStack>

            {/* Settings */}
            <HStack spacing={6} w="100%">
              <FormControl maxW="150px">
                <FormLabel color="gray.300" fontSize="sm">Sample Rate (Hz):</FormLabel>
                <Select
                  value={sampleRate}
                  onChange={(e) => setSampleRate(parseInt(e.target.value))}
                  size="sm"
                  bg="gray.700"
                  color="white"
                >
                  <option value={1}>1 Hz</option>
                  <option value={5}>5 Hz</option>
                  <option value={10}>10 Hz</option>
                  <option value={20}>20 Hz</option>
                  <option value={50}>50 Hz</option>
                  <option value={100}>100 Hz</option>
                </Select>
              </FormControl>
              
              <FormControl maxW="150px">
                <FormLabel color="gray.300" fontSize="sm">Max Samples:</FormLabel>
                <Select
                  value={maxSamples}
                  onChange={(e) => setMaxSamples(parseInt(e.target.value))}
                  size="sm"
                  bg="gray.700"
                  color="white"
                >
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={2000}>2000</option>
                  <option value={5000}>5000</option>
                  <option value={10000}>10000</option>
                </Select>
              </FormControl>
            </HStack>

            {/* Property Selection */}
            <Box w="100%">
              <Text color="gray.300" fontSize="sm" mb={2}>
                Properties to Record ({selectedProperties.length}):
              </Text>
              <Box p={3} bg="gray.900" borderRadius="md" maxH="150px" overflowY="auto">
                <VStack spacing={2} align="stretch">
                  {availableProperties.map(property => (
                    <HStack key={property} spacing={3}>
                      <Switch
                        size="sm"
                        colorScheme="blue"
                        isChecked={selectedProperties.includes(property)}
                        onChange={() => toggleProperty(property)}
                      />
                      <Text fontSize="sm" color="gray.300" fontFamily="mono" flex="1">
                        {property}
                      </Text>
                      <Text fontSize="sm" color="white" fontFamily="mono" minW="80px" textAlign="right">
                        {formatValue(getValueFromPath(odriveState, property))}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Data Display */}
      <Card bg="gray.800" variant="elevated" flex="1">
        <CardHeader>
          <Heading size="md" color="white">Recorded Data</Heading>
        </CardHeader>
        <CardBody>
          {recordedData.length === 0 ? (
            <Text color="gray.400" textAlign="center">
              No data recorded yet. Start recording to see live data.
            </Text>
          ) : (
            <Box maxH="400px" overflowY="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th color="gray.300" borderColor="gray.600">Time</Th>
                    {selectedProperties.map(property => (
                      <Th key={property} color="gray.300" borderColor="gray.600">
                        <Code fontSize="xs" bg="transparent" color="gray.300">
                          {property}
                        </Code>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {recordedData.slice(-50).reverse().map((sample, index) => (
                    <Tr key={index}>
                      <Td borderColor="gray.600" fontFamily="mono" fontSize="xs" color="gray.400">
                        {new Date(sample.timestamp).toLocaleTimeString()}
                      </Td>
                      {selectedProperties.map(property => (
                        <Td key={property} borderColor="gray.600" fontFamily="mono" fontSize="sm" color="white">
                          {formatValue(sample[property])}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {recordedData.length > 50 && (
                <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
                  Showing latest 50 samples of {recordedData.length} total
                </Text>
              )}
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  )
}

export default LiveDataView