import { useState, useEffect, useRef } from 'react'
import {
  VStack,
  HStack,
  Text,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  IconButton,
  Badge,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Tooltip
} from '@chakra-ui/react'
import { Trash2, Play, Pause, Download, Settings } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const LiveCharts = ({ selectedProperties, odriveState, isConnected }) => {
  const [chartData, setChartData] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [sampleRate, setSampleRate] = useState(10) // Hz
  const [maxSamples, setMaxSamples] = useState(1000)
  const [autoScale, setAutoScale] = useState(true)
  const [timeWindow, setTimeWindow] = useState(60) // seconds
  
  const intervalRef = useRef(null)
  const chartColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F472B6'
  ]

  const getValueFromPath = (obj, path) => {
    if (!obj || !obj.device) {
      console.log(`LiveCharts: obj or obj.device is null/undefined for path: ${path}`)
      return null
    }
    
    console.log(`LiveCharts: Getting value for path: ${path}`)
    console.log(`LiveCharts: Device object keys:`, Object.keys(obj.device))
    
    // Build the correct path - the PropertyTree uses paths like "axis0.encoder.pos_estimate"
    // but the data is actually under device.axis0.encoder.pos_estimate
    let fullPath
    if (path.startsWith('system.')) {
      // System properties map to device.* or device.config.*
      const systemProp = path.replace('system.', '')
      if (['hw_version_major', 'hw_version_minor', 'fw_version_major', 'fw_version_minor', 'serial_number', 'vbus_voltage', 'ibus'].includes(systemProp)) {
        fullPath = `device.${systemProp}`
      } else {
        fullPath = `device.config.${systemProp}`
      }
    } else if (path.startsWith('axis0.') || path.startsWith('axis1.')) {
      // Axis properties map to device.axis0.* or device.axis1.*
      fullPath = `device.${path}`
    } else {
      // Direct device path
      fullPath = `device.${path}`
    }
    
    console.log(`LiveCharts: Full path: ${fullPath}`)
    
    const parts = fullPath.split('.')
    let current = obj
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (current && current[part] !== undefined) {
        current = current[part]
        console.log(`LiveCharts: Found part ${part}, current:`, typeof current === 'object' ? Object.keys(current) : current)
      } else {
        console.log(`LiveCharts: Part ${part} not found in:`, current ? Object.keys(current) : 'null object')
        return null
      }
    }
    
    const result = typeof current === 'number' ? current : null
    console.log(`LiveCharts: Final result for ${fullPath}:`, result)
    return result
  }

  useEffect(() => {
    if (isRecording && isConnected && selectedProperties.length > 0) {
      intervalRef.current = setInterval(() => {
        const timestamp = Date.now()
        const sample = { 
          time: timestamp,
          relativeTime: chartData.length > 0 ? (timestamp - chartData[0].time) / 1000 : 0
        }
        
        selectedProperties.forEach(property => {
          const value = getValueFromPath(odriveState, property)
          if (value !== null) {
            sample[property] = value
          }
        })
        
        setChartData(prev => {
          const newData = [...prev, sample]
          // Keep only samples within time window
          const cutoffTime = timestamp - (timeWindow * 1000)
          const filteredData = newData.filter(d => d.time > cutoffTime)
          
          // Limit total samples
          if (filteredData.length > maxSamples) {
            return filteredData.slice(-maxSamples)
          }
          return filteredData
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
  }, [isRecording, isConnected, selectedProperties, sampleRate, odriveState, timeWindow, maxSamples, chartData])

  const startRecording = () => {
    setIsRecording(true)
    setChartData([]) // Clear existing data
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const clearData = () => {
    setChartData([])
    setIsRecording(false)
  }

  const exportData = () => {
    if (chartData.length === 0) return
    
    const headers = ['timestamp', 'time_relative', ...selectedProperties]
    const csvContent = [
      headers.join(','),
      ...chartData.map(row => [
        new Date(row.time).toISOString(),
        row.relativeTime.toFixed(3),
        ...selectedProperties.map(prop => row[prop] || '')
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `odrive_data_${new Date().toISOString().slice(0, 19)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return typeof value === 'number' ? value.toFixed(3) : String(value)
  }

  const getPropertyDisplayName = (property) => {
    return property.split('.').pop()
  }

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Controls */}
      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="white">Live Charts</Heading>
            <Badge colorScheme={selectedProperties.length > 0 ? 'green' : 'gray'}>
              {selectedProperties.length} properties
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3}>
            {/* Recording Controls */}
            <HStack spacing={3} w="100%">
              <Button
                leftIcon={isRecording ? <Pause size={16} /> : <Play size={16} />}
                colorScheme={isRecording ? 'red' : 'green'}
                onClick={isRecording ? stopRecording : startRecording}
                isDisabled={!isConnected || selectedProperties.length === 0}
              >
                {isRecording ? 'Stop' : 'Start'} Recording
              </Button>
              
              <Button
                leftIcon={<Trash2 size={16} />}
                variant="outline"
                onClick={clearData}
                isDisabled={chartData.length === 0}
              >
                Clear Data
              </Button>
              
              <Button
                leftIcon={<Download size={16} />}
                variant="outline"
                onClick={exportData}
                isDisabled={chartData.length === 0}
              >
                Export CSV
              </Button>

              <Badge colorScheme={isRecording ? 'green' : 'gray'} ml="auto">
                {isRecording ? 'Recording' : 'Stopped'}
              </Badge>
            </HStack>

            {/* Settings */}
            <HStack spacing={4} w="100%">
              <FormControl maxW="120px">
                <FormLabel color="gray.300" fontSize="sm">Sample Rate:</FormLabel>
                <Select
                  value={sampleRate}
                  onChange={(e) => setSampleRate(parseInt(e.target.value))}
                  size="sm"
                  bg="gray.700"
                  color="white"
                >
                  <option value={1}>1 Hz</option>
                  <option value={2}>2 Hz</option>
                  <option value={5}>5 Hz</option>
                  <option value={10}>10 Hz</option>
                  <option value={20}>20 Hz</option>
                  <option value={50}>50 Hz</option>
                </Select>
              </FormControl>

              <FormControl maxW="120px">
                <FormLabel color="gray.300" fontSize="sm">Time Window:</FormLabel>
                <Select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                  size="sm"
                  bg="gray.700"
                  color="white"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                  <option value={1800}>30 minutes</option>
                </Select>
              </FormControl>

              <FormControl display="flex" alignItems="center" maxW="120px">
                <FormLabel htmlFor="auto-scale" mb="0" color="gray.300" fontSize="sm">
                  Auto Scale:
                </FormLabel>
                <Switch
                  id="auto-scale"
                  size="sm"
                  colorScheme="blue"
                  isChecked={autoScale}
                  onChange={(e) => setAutoScale(e.target.checked)}
                />
              </FormControl>
            </HStack>

            {/* Current Values */}
            {selectedProperties.length > 0 && (
              <Box w="100%">
                <Text color="gray.300" fontSize="sm" mb={2}>Current Values:</Text>
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                  {selectedProperties.map((property, index) => (
                    <Box key={property} p={2} bg="gray.900" borderRadius="md">
                      <Text fontSize="xs" color={chartColors[index % chartColors.length]} fontWeight="bold">
                        {getPropertyDisplayName(property)}
                      </Text>
                      <Text fontSize="sm" color="white" fontFamily="mono">
                        {formatValue(getValueFromPath(odriveState, property))}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Charts */}
      <Card bg="gray.800" variant="elevated" flex="1">
        <CardBody h="100%">
          {selectedProperties.length === 0 ? (
            <Box textAlign="center" py={20}>
              <Text color="gray.400" fontSize="lg">
                Select properties from the tree to start charting
              </Text>
              <Text color="gray.500" fontSize="sm" mt={2}>
                Click the checkbox next to any property in the Property Tree
              </Text>
            </Box>
          ) : chartData.length === 0 ? (
            <Box textAlign="center" py={20}>
              <Text color="gray.400" fontSize="lg">
                No data recorded yet
              </Text>
              <Text color="gray.500" fontSize="sm" mt={2}>
                Click "Start Recording" to begin data collection
              </Text>
            </Box>
          ) : (
            <Box h="100%">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="relativeTime" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(1)}s`}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    domain={autoScale ? ['auto', 'auto'] : undefined}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(value) => `Time: ${value.toFixed(3)}s`}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(6) : value, 
                      getPropertyDisplayName(name)
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#F9FAFB' }}
                    formatter={(value) => getPropertyDisplayName(value)}
                  />
                  {selectedProperties.map((property, index) => (
                    <Line
                      key={property}
                      type="monotone"
                      dataKey={property}
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Data Info */}
      {chartData.length > 0 && (
        <Card bg="gray.800" variant="elevated">
          <CardBody>
            <HStack justify="space-between">
              <Text color="gray.300" fontSize="sm">
                Data Points: {chartData.length}
              </Text>
              <Text color="gray.300" fontSize="sm">
                Duration: {chartData.length > 0 ? (chartData[chartData.length - 1].relativeTime).toFixed(1) : 0}s
              </Text>
              <Text color="gray.300" fontSize="sm">
                Rate: {sampleRate} Hz
              </Text>
            </HStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}

export default LiveCharts