import { useState, useEffect } from 'react'
import {
  VStack,
  HStack,
  Text,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
} from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { useChartsTelemetry } from '../../hooks/useChartsTelemetry'

const LiveCharts = ({ selectedProperties }) => {
  const [chartData, setChartData] = useState([])
  
  const chartColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F472B6'
  ]

  const handleChartData = (data) => {
    if (!data.data) return
    
    const timestamp = data.timestamp
    const sample = { 
      time: timestamp,
      relativeTime: chartData.length > 0 ? (timestamp - chartData[0].time) / 1000 : 0
    }
    
    // Add all property values to the sample
    Object.entries(data.data).forEach(([property, value]) => {
      if (typeof value === 'number') {
        sample[property] = value
      }
    })
    
    setChartData(prev => {
      const newData = [...prev, sample]
      // Keep only last 1000 points and last 60 seconds
      const cutoffTime = timestamp - 60000
      const filteredData = newData.filter(d => d.time > cutoffTime)
      return filteredData.length > 1000 ? filteredData.slice(-1000) : filteredData
    })
  }

  // Use the new charts telemetry hook
  useChartsTelemetry(selectedProperties, handleChartData, 1)

  // Clear data when properties change
  useEffect(() => {
    setChartData([])
  }, [selectedProperties])

  const getPropertyDisplayName = (property) => {
    return property.split('.').pop()
  }

  const renderChart = (property, index) => (
    <Box key={property} p={3} bg="gray.900" borderRadius="md" borderWidth="1px" borderColor="gray.700" h="300px">
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
            {chartData.length > 0 ? chartData[chartData.length - 1][property]?.toFixed(3) || 'N/A' : 'N/A'}
          </Text>
        </HStack>
        
        <Box flex="1" minH="250px">
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
                domain={['auto', 'auto']}
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
        ) : (
          <Card bg="gray.800" variant="elevated" h="100%" display="flex" flexDirection="column">
            <CardHeader py={3} flexShrink={0}>
              <HStack justify="space-between">
                <Heading size="md" color="white">
                  Live Charts
                </Heading>
                <Badge colorScheme="blue" variant="outline">
                  {chartData.length} data points
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody flex="1" minH="0" p={4} overflowY="auto">
              <VStack spacing={3} align="stretch">
                {selectedProperties.map((property, index) => 
                  renderChart(property, index)
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>
    </VStack>
  )
}

export default LiveCharts