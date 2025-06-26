import { useState, useEffect, memo, useMemo, useCallback } from 'react'
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
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
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

// Move ChartComponent outside as a separate component
const ChartComponent = memo(({ property, index, data, chartColors, chartConfig, getPropertyDisplayName }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} {...chartConfig}>
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
        tickFormatter={(value) => `${value}`}  // raw values
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
        type="linear"
        dataKey={property}
        stroke={chartColors[index % chartColors.length]}
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
))

ChartComponent.displayName = 'ChartComponent'

const LiveCharts = memo(({ selectedProperties, togglePropertyChart }) => {
  const [chartData, setChartData] = useState([])
  
  const chartColors = useMemo(() => [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F472B6'
  ], [])

  const handleChartData = useCallback((data) => {
    if (!data.data) return

    setChartData(prev => {
      const timestamp = data.timestamp
      const sample = { 
        time: timestamp,
        relativeTime: prev.length > 0 ? (timestamp - prev[0].time) / 1000 : 0
      }

      Object.entries(data.data).forEach(([property, value]) => {
        // Store booleans as 1/0 for charting
        sample[property] = typeof value === 'boolean' ? (value ? 1 : 0) : value
      })

      // Patch: For each selected property, if it's a system property and missing, try root key
      selectedProperties.forEach((prop) => {
        if (prop.startsWith('system.') && sample[prop] === undefined) {
          const rootKey = prop.replace(/^system\./, '')
          if (sample[rootKey] !== undefined) {
            sample[prop] = sample[rootKey]
          }
        }
      })

      const newData = [...prev, sample]
      const cutoffTime = timestamp - 60000
      const filteredData = newData.filter(d => d.time > cutoffTime)
      return filteredData.length > 1000 ? filteredData.slice(-1000) : filteredData
    })
  }, [selectedProperties]) // Remove chartData dependency

  // Use the new charts telemetry hook
  useChartsTelemetry(selectedProperties, handleChartData)

  // Only clear data when ALL properties are removed (not when adding new ones)
  useEffect(() => {
    if (selectedProperties.length === 0) {
      setChartData([])
    }
  }, [selectedProperties.length])

  const getPropertyDisplayName = useCallback((property) => {
    return property.split('.').pop()
  }, [])

  const handleRemoveChart = useCallback((property) => {
    if (togglePropertyChart) {
      togglePropertyChart(property)
    }
  }, [togglePropertyChart])

  // Memoize chart configurations
  const chartConfig = useMemo(() => ({
    margin: { top: 5, right: 5, left: 20, bottom: 5 },
    isAnimationActive: false
  }), [])

  // Use useMemo for expensive chart data transformations
  const processedChartData = useMemo(() => {
    return chartData.map((sample) => ({
      ...sample,
    }))
  }, [chartData])

  const renderChart = useCallback((property, index) => (
    <Box 
      key={property} 
      p={3} 
      bg="gray.900" 
      borderRadius="md" 
      borderWidth="1px" 
      borderColor="gray.700" 
      h="280px"
      flexShrink={0}
    >
      <VStack spacing={2} align="stretch" h="100%">
        <HStack justify="space-between" flexShrink={0}>
          <HStack spacing={2}>
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color={chartColors[index % chartColors.length]}
            >
              {getPropertyDisplayName(property)}
            </Text>
            <Text fontSize="xs" color="gray.500" fontFamily="mono">
              {property}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Text fontSize="xs" color="gray.400" fontFamily="mono" minW="80px" textAlign="right">
              {
                chartData.length > 0
                  ? (() => {
                      const val = chartData[chartData.length - 1][property];
                      if (typeof val === 'number') return val.toFixed(3);
                      if (typeof val === 'boolean') return val ? '1' : '0';
                      if (
                        property.startsWith('system.') &&
                        chartData[chartData.length - 1][property.replace(/^system\./, '')] !== undefined
                      ) {
                        const sysVal = chartData[chartData.length - 1][property.replace(/^system\./, '')];
                        if (typeof sysVal === 'number') return sysVal.toFixed(3);
                        if (typeof sysVal === 'boolean') return sysVal ? '1' : '0';
                      }
                      return 'N/A';
                    })()
                  : 'N/A'
              }
            </Text>
            <Tooltip label="Remove from charts" placement="top">
              <IconButton
                size="xs"
                variant="ghost"
                colorScheme="red"
                icon={<CloseIcon />}
                onClick={() => handleRemoveChart(property)}
                aria-label="Remove chart"
              />
            </Tooltip>
          </HStack>
        </HStack>
        
        <Box flex="1" minH="200px">
          <ChartComponent 
            property={property} 
            index={index} 
            data={processedChartData}
            chartColors={chartColors}
            chartConfig={chartConfig}
            getPropertyDisplayName={getPropertyDisplayName}
          />
        </Box>
      </VStack>
    </Box>
  ), [chartData, chartColors, processedChartData, chartConfig, getPropertyDisplayName, handleRemoveChart])

  return (
    <Box h="100%" display="flex" flexDirection="column">
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
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="outline">
                  {selectedProperties.length} chart{selectedProperties.length !== 1 ? 's' : ''}
                </Badge>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody flex="1" minH="0" p={0}>
            <Box 
              h="100%" 
              overflowY="auto" 
              overflowX="hidden"
              px={4}
              py={2}
            >
              <VStack spacing={3} align="stretch">
                {selectedProperties.map((property, index) => 
                  renderChart(property, index)
                )}
              </VStack>
            </Box>
          </CardBody>
        </Card>
      )}
    </Box>
  )
})

LiveCharts.displayName = 'LiveCharts'

export default LiveCharts