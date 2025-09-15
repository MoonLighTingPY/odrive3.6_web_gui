import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Select,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import { DeleteIcon, DownloadIcon } from '@chakra-ui/icons'
import { useSelector, useDispatch } from 'react-redux'
import { removeProperty, setIntervalMs, clearAll } from '../../../store/slices/telemetrySlice'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

const LiveCharts = () => {
  const dispatch = useDispatch()
  const { selectedProperties, samples, intervalMs, status } = useSelector(state => state.telemetry)
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const colors = [
    '#63B3ED', '#68D391', '#F6AD55', '#FC8181', 
    '#B794F6', '#4FD1C7', '#FBB6CE', '#9AE6B4'
  ]

  const prepareChartData = () => {
    if (selectedProperties.length === 0) return []
    
    const allTimestamps = new Set()
    Object.values(samples).forEach(propertyData => {
      propertyData.forEach(sample => allTimestamps.add(sample.t))
    })
    
    const sortedTimestamps = Array.from(allTimestamps).sort()
    const recentTimestamps = sortedTimestamps.slice(-100) // Last 100 points
    
    return recentTimestamps.map(timestamp => {
      const dataPoint = { timestamp, time: new Date(timestamp).toLocaleTimeString() }
      selectedProperties.forEach(path => {
        const pathData = samples[path] || []
        const sample = pathData.find(s => s.t === timestamp)
        dataPoint[path] = sample ? sample.v : null
      })
      return dataPoint
    })
  }

  const chartData = prepareChartData()

  return (
    <Box h="100%" bg={bgColor} display="flex" flexDirection="column">
      {/* Header */}
      <VStack spacing={4} p={4} borderBottom="1px solid" borderColor={borderColor}>
        <HStack w="100%" justify="space-between" align="center">
          <VStack spacing={1} align="start">
            <Text fontSize="lg" fontWeight="medium" color="white">
              Live Charts
            </Text>
            <HStack spacing={2}>
              <Badge 
                colorScheme={status === 'connected' ? 'green' : 'gray'}
                variant="outline"
              >
                {status}
              </Badge>
              <Text fontSize="xs" color="gray.400">
                {selectedProperties.length} properties • {intervalMs}ms interval
              </Text>
            </HStack>
          </VStack>
          
          <HStack spacing={2}>
            <Select
              size="sm"
              w="auto"
              value={intervalMs}
              onChange={(e) => dispatch(setIntervalMs(parseInt(e.target.value)))}
            >
              <option value={100}>100ms</option>
              <option value={200}>200ms</option>
              <option value={500}>500ms</option>
              <option value={1000}>1s</option>
            </Select>
            
            <Tooltip label="Clear all data">
              <IconButton
                size="sm"
                icon={<DeleteIcon />}
                onClick={() => dispatch(clearAll())}
                aria-label="Clear data"
              />
            </Tooltip>
            
            <Tooltip label="Export data">
              <IconButton
                size="sm"
                icon={<DownloadIcon />}
                onClick={() => {
                  const dataStr = JSON.stringify(samples, null, 2)
                  const blob = new Blob([dataStr], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `odrive-telemetry-${Date.now()}.json`
                  a.click()
                }}
                aria-label="Export data"
              />
            </Tooltip>
          </HStack>
        </HStack>

        {/* Selected Properties */}
        {selectedProperties.length > 0 && (
          <HStack spacing={2} w="100%" flexWrap="wrap">
            {selectedProperties.map((path, index) => (
              <Badge
                key={path}
                colorScheme="odrive"
                variant="solid"
                display="flex"
                alignItems="center"
                gap={1}
                px={2}
                py={1}
              >
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={colors[index % colors.length]}
                />
                <Text fontSize="xs" noOfLines={1}>
                  {path.split('.').pop()}
                </Text>
                <IconButton
                  size="xs"
                  icon={<DeleteIcon />}
                  onClick={() => dispatch(removeProperty(path))}
                  variant="ghost"
                  colorScheme="red"
                  minW="auto"
                  h="auto"
                  p={0}
                  aria-label={`Remove ${path}`}
                />
              </Badge>
            ))}
          </HStack>
        )}
      </VStack>

      {/* Chart Area */}
      <Box flex="1" p={4}>
        {selectedProperties.length === 0 ? (
          <VStack 
            spacing={4} 
            justify="center" 
            align="center" 
            h="100%" 
            color="gray.400"
          >
            <Text fontSize="lg">No properties selected</Text>
            <Text fontSize="sm" textAlign="center">
              Select properties from the tree on the left to start charting
            </Text>
          </VStack>
        ) : chartData.length === 0 ? (
          <VStack 
            spacing={4} 
            justify="center" 
            align="center" 
            h="100%" 
            color="gray.400"
          >
            <Text fontSize="lg">Waiting for data...</Text>
            <Text fontSize="sm">
              Make sure you're connected to a device
            </Text>
          </VStack>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              {selectedProperties.map((path, index) => (
                <Line
                  key={path}
                  type="monotone"
                  dataKey={path}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  )
}

export default LiveCharts