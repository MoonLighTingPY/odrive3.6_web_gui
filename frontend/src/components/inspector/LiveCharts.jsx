import { useState } from 'react'
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
  Tooltip,
  Grid,
  GridItem,
  ButtonGroup
} from '@chakra-ui/react'
import { Trash2, Play, Pause, Download, LayoutGrid, List } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { odrivePropertyTree } from '../../utils/odrivePropertyTree'
import { useTelemetry } from '../../hooks/useTelemetry'

const LiveCharts = ({ selectedProperties, odriveState, isConnected }) => {
  const [chartData, setChartData] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [sampleRate, setSampleRate] = useState(10) // Hz
  const [maxSamples, setMaxSamples] = useState(1000)
  const [autoScale, setAutoScale] = useState(true)
  const [timeWindow, setTimeWindow] = useState(60) // seconds
  const [layoutMode, setLayoutMode] = useState('grid') // 'grid' or 'list'
  
  const chartColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F472B6'
  ]

  const getValueFromPath = (obj, path) => {
    if (!obj || !obj.device) {
      return null
    }
    
    // Handle calculated properties
    if (path.startsWith('calculated.')) {
      const calcType = path.replace('calculated.', '')
      if (calcType === 'electrical_power') {
        const vbus = obj.device.vbus_voltage
        const ibus = obj.device.ibus || 0
        return vbus && ibus ? vbus * ibus : 0
      } else if (calcType === 'mechanical_power') {
        // Calculate mechanical power from torque and velocity
        const torque_setpoint = obj.device.axis0?.controller?.torque_setpoint || 0
        const vel_estimate = obj.device.axis0?.encoder?.vel_estimate || 0
        const TORQUE_CONSTANT = obj.device.axis0?.motor?.config?.torque_constant || 0
        
        // P_mech = Torque * Angular_Velocity (in rad/s)
        // Convert turns/s to rad/s: rad/s = turns/s * 2π
        const angular_velocity = vel_estimate * 2 * Math.PI
        
        // If torque constant is available, calculate actual mechanical torque
        // Otherwise use torque setpoint directly (assuming it's already in Nm)
        const actual_torque = TORQUE_CONSTANT > 0 ? 
          (obj.device.axis0?.motor?.current_control?.Iq_setpoint || 0) * TORQUE_CONSTANT :
          torque_setpoint
          
        return actual_torque * angular_velocity
      }
      return null
    }
    
    // Handle custom path mapping for featured properties
    let actualPath = path
    
    // Check if this is a featured property with a custom path
    const findPropertyPath = (tree, targetPath) => {
      for (const [sectionName, section] of Object.entries(tree)) {
        if (section.properties) {
          for (const [propName, prop] of Object.entries(section.properties)) {
            const currentPath = sectionName.startsWith('featured') ? `${sectionName}.${propName}` : 
                              sectionName === 'system' ? `system.${propName}` : `${sectionName}.${propName}`
            if (currentPath === targetPath && prop.path) {
              return prop.path
            }
          }
        }
      }
      return targetPath
    }
    
    actualPath = findPropertyPath(odrivePropertyTree, path)
    
    // Build the correct path for the data structure
    let fullPath
    if (actualPath.startsWith('system.')) {
      const systemProp = actualPath.replace('system.', '')
      // Handle properties that are under device.config.*
      if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
           'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
        fullPath = `device.config.${systemProp}`
      } else {
        fullPath = `device.${systemProp}`
      }
    } else if (actualPath.startsWith('axis0.') || actualPath.startsWith('axis1.')) {
      fullPath = `device.${actualPath}`
    } else if (actualPath.startsWith('config.')) {
      fullPath = `device.${actualPath}`
    } else {
      fullPath = `device.${actualPath}`
    }
    
    const parts = fullPath.split('.')
    let current = obj
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (current && current[part] !== undefined) {
        current = current[part]
      } else {
        return null
      }
    }
    
    const result = typeof current === 'number' ? current : null
    return result
  }

  // Only subscribe to telemetry when we have properties selected AND we're connected AND recording
  const telemetryConfig = selectedProperties.length > 0 && isConnected && isRecording ? {
    type: 'charts',
    paths: selectedProperties,
    updateRate: Math.max(Math.round(1000 / sampleRate), 50), // Minimum 50ms (20Hz max)
    onData: (data) => {
      console.log('LiveCharts received data:', data)
      console.log('Selected properties:', selectedProperties)
      
      if (isRecording && selectedProperties.length > 0) {
        const timestamp = data.timestamp || Date.now()
        const sample = { 
          time: timestamp,
          relativeTime: chartData.length > 0 ? (timestamp - chartData[0].time) / 1000 : 0
        }
        
        selectedProperties.forEach(property => {
          const value = getValueFromPath(data, property)
          console.log(`Getting value for ${property}:`, value)
          if (value !== null) {
            sample[property] = value
          }
        })
        
        console.log('Sample data:', sample)
        
        setChartData(prev => {
          const newData = [...prev, sample]
          const cutoffTime = timestamp - (timeWindow * 1000)
          const filteredData = newData.filter(d => d.time > cutoffTime)
          return filteredData.length > maxSamples ? 
            filteredData.slice(-maxSamples) : filteredData
        })
      }
    }
  } : null

  useTelemetry(telemetryConfig)

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

  // Calculate grid columns based on number of properties
  const getGridColumns = (count) => {
    if (count <= 1) return 1
    if (count <= 2) return 2
    if (count <= 4) return 2
    if (count <= 6) return 3
    return 4
  }

  // Render individual chart component
  const renderChart = (property, index) => (
  <Box key={property} p={3} bg="gray.900" borderRadius="md" borderWidth="1px" borderColor="gray.700" h="100%">
    <VStack spacing={2} align="stretch" h="100%">
      <HStack justify="space-between" flexShrink={0}>
        <Text 
          fontSize="sm" 
          fontWeight="bold" 
          color={chartColors[index % chartColors.length]}
        >
          {getPropertyDisplayName(property)}
        </Text>
        <Text fontSize="xs" color="gray.400" fontFamily="mono">
          {formatValue(getValueFromPath(odriveState, property))}
        </Text>
      </HStack>
      
      <Box flex="1" minH={layoutMode === 'list' ? "200px" : "250px"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 5, right: 5, left: 20, bottom: 5 }}
            isAnimationActive={false}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="relativeTime" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickFormatter={(value) => `${value.toFixed(0)}s`}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              domain={autoScale ? ['auto', 'auto'] : undefined}
              width={60}
              tickFormatter={(value) => 
                Math.abs(value) >= 1000 ? 
                  `${(value / 1000).toFixed(1)}k` : 
                  value.toFixed(2)
              }
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#F9FAFB',
                fontSize: '11px'
              }}
              labelFormatter={(value) => `Time: ${value.toFixed(1)}s`}
              formatter={(value) => [
                typeof value === 'number' ? value.toFixed(6) : value, 
                getPropertyDisplayName(property)
              ]}
            />
            <Line
              type="monotone"
              dataKey={property}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  </Box>
)

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Controls */}
      <Card bg="gray.800" variant="elevated" flexShrink={0}>
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

              {/* Layout Toggle */}
              <ButtonGroup size="sm" isAttached variant="outline" ml="auto">
                <Tooltip label="Grid Layout">
                  <Button
                    leftIcon={<LayoutGrid size={14} />}
                    colorScheme={layoutMode === 'grid' ? 'blue' : 'gray'}
                    variant={layoutMode === 'grid' ? 'solid' : 'outline'}
                    onClick={() => setLayoutMode('grid')}
                  >
                    Grid
                  </Button>
                </Tooltip>
                <Tooltip label="List Layout">
                  <Button
                    leftIcon={<List size={14} />}
                    colorScheme={layoutMode === 'list' ? 'blue' : 'gray'}
                    variant={layoutMode === 'list' ? 'solid' : 'outline'}
                    onClick={() => setLayoutMode('list')}
                  >
                    List
                  </Button>
                </Tooltip>
              </ButtonGroup>

              <Badge colorScheme={isRecording ? 'green' : 'gray'}>
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
                  <option value={20}>20 Hz (Max)</option>
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

              <FormControl maxW="120px">
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

      {/* Charts Display - This will take remaining space */}
      <Box flex="1" minH="0">
        {selectedProperties.length === 0 ? (
          <Card bg="gray.800" variant="elevated" h="100%">
            <CardBody display="flex" alignItems="center" justifyContent="center">
              <VStack>
                <Text color="gray.400" fontSize="lg">
                  Select properties from the tree to start charting
                </Text>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Click the checkbox next to any property in the Property Tree
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : chartData.length === 0 ? (
          <Card bg="gray.800" variant="elevated" h="100%">
            <CardBody display="flex" alignItems="center" justifyContent="center">
              <VStack>
                <Text color="gray.400" fontSize="lg">
                  No data recorded yet
                </Text>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Click "Start Recording" to begin data collection
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card bg="gray.800" variant="elevated" h="100%" display="flex" flexDirection="column">
            <CardHeader py={3} flexShrink={0}>
              <HStack justify="space-between">
                <Heading size="md" color="white">
                  Charts ({layoutMode === 'grid' ? 'Grid View' : 'List View'})
                </Heading>
                <Badge colorScheme="blue" variant="outline">
                  {chartData.length} data points
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody flex="1" minH="0" p={4}>
              {layoutMode === 'list' ? (
                // List Layout - Single Column
                <VStack spacing={3} align="stretch" h="100%">
                  {selectedProperties.map((property, index) => (
                    <Box key={property} h={`${100 / selectedProperties.length}%`} minH="200px">
                      {renderChart(property, index)}
                    </Box>
                  ))}
                </VStack>
              ) : (
                // Grid Layout - Multiple Columns
                <Grid 
                  templateColumns={`repeat(${getGridColumns(selectedProperties.length)}, 1fr)`}
                  templateRows={`repeat(${Math.ceil(selectedProperties.length / getGridColumns(selectedProperties.length))}, 1fr)`}
                  gap={4}
                  h="100%"
                >
                  {selectedProperties.map((property, index) => (
                    <GridItem key={property}>
                      {renderChart(property, index)}
                    </GridItem>
                  ))}
                </Grid>
              )}
            </CardBody>
          </Card>
        )}
      </Box>

    </VStack>
  )
}

export default LiveCharts