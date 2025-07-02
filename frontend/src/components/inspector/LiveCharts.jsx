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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
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
import { applyChartFilter } from '../../utils/chartFilters'
import { Icon } from '@chakra-ui/react'


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
  const [timeWindow, setTimeWindow] = useState(60) // Default 60 seconds
  const [previewTimeWindow, setPreviewTimeWindow] = useState(timeWindow)
  const [chartFilters, setChartFilters] = useState({}) // Track filter state per property

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
        time: timestamp
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
      
      // Filter by time window first
      const cutoffTime = timestamp - (timeWindow * 1000)
      const filteredData = newData.filter(d => d.time > cutoffTime)
      
      // Calculate relative time based on the visible window
      const processedData = filteredData.map((item) => {
        if (filteredData.length === 0) return item
        
        // Use the oldest visible sample as the reference point (time 0)
        const oldestVisibleTime = filteredData[0].time
        const relativeTime = (item.time - oldestVisibleTime) / 1000
        
        return {
          ...item,
          relativeTime: relativeTime
        }
      })
      
      return processedData.length > 1000 ? processedData.slice(-1000) : processedData
    })
  }, [selectedProperties, timeWindow])

  // Use the new charts telemetry hook
  useChartsTelemetry(selectedProperties, handleChartData)

  // Only clear data when ALL properties are removed (not when adding new ones)
  useEffect(() => {
    if (selectedProperties.length === 0) {
      setChartData([])
    }
  }, [selectedProperties.length])

  // Recalculate relative times when time window changes
  useEffect(() => {
    if (chartData.length > 0) {
      const currentTime = Date.now()
      const cutoffTime = currentTime - (timeWindow * 1000)
      
      setChartData(prev => {
        // Filter by new time window
        const filteredData = prev.filter(d => d.time > cutoffTime)
        
        // Recalculate relative times for the new window
        const processedData = filteredData.map((item) => {
          if (filteredData.length === 0) return item
          
          // Use the oldest visible sample as the reference point (time 0)
          const oldestVisibleTime = filteredData[0].time
          const relativeTime = (item.time - oldestVisibleTime) / 1000
          
          return {
            ...item,
            relativeTime: relativeTime
          }
        })
        
        return processedData
      })
    }
  }, [chartData.length, timeWindow])

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
    let data = chartData.map((sample) => ({
      ...sample,
    }))
    
    // Apply filters to enabled properties
    Object.entries(chartFilters).forEach(([property, filter]) => {
      if (filter.enabled && selectedProperties.includes(property)) {
        data = applyChartFilter(data, property, filter.type, filter.options)
      }
    })
    
    return data
  }, [chartData, chartFilters, selectedProperties])

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
            
            {/* Filter Toggle Button */}
            <Tooltip label={chartFilters[property]?.enabled ? "Disable filter" : "Enable filter"} placement="top">
              <IconButton
                size="xs"
                variant="ghost"
                colorScheme={chartFilters[property]?.enabled ? "green" : "gray"}
                icon={<Icon viewBox="0 0 24 24" boxSize={3}>
                  <path fill="currentColor" d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" />
                </Icon>}
                onClick={() => {
                  setChartFilters(prev => ({
                    ...prev,
                    [property]: {
                      enabled: !prev[property]?.enabled,
                      type: prev[property]?.type || 'moving_average',
                      options: prev[property]?.options || { windowSize: 5 }
                    }
                  }))
                }}
                aria-label="Toggle filter"
              />
            </Tooltip>
            
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
  ), [chartColors, getPropertyDisplayName, chartData, chartFilters, processedChartData, chartConfig, handleRemoveChart])

  // Update preview immediately for badge display
  const handleTimeWindowPreview = useCallback((value) => {
    const integerValue = Math.round(value)
    const clampedValue = Math.max(10, Math.min(600, integerValue))
    setPreviewTimeWindow(clampedValue)
  }, [])

  // Only update actual time window when slider is released
  const handleTimeWindowChange = useCallback((value) => {
    const integerValue = Math.round(value)
    const clampedValue = Math.max(10, Math.min(600, integerValue))
    setTimeWindow(clampedValue)
    setPreviewTimeWindow(clampedValue)
  }, [])

  // Sync preview with actual value when timeWindow changes externally
  useEffect(() => {
    setPreviewTimeWindow(timeWindow)
  }, [timeWindow])

  const formatTimeLabel = useCallback((value) => {
    // For any integer value, format appropriately
    if (value < 60) {
      return `${value}s`
    } else if (value < 3600) {
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      return seconds === 0 ? `${minutes}m` : `${minutes}m${seconds}s`
    } else {
      const hours = Math.floor(value / 3600)
      const remainingMinutes = Math.floor((value % 3600) / 60)
      return remainingMinutes === 0 ? `${hours}h` : `${hours}h${remainingMinutes}m`
    }
  }, [])

  // Clean up filters when properties are removed
  useEffect(() => {
    setChartFilters(prev => {
      const newFilters = {}
      selectedProperties.forEach(property => {
        if (prev[property]) {
          newFilters[property] = prev[property]
        }
      })
      return newFilters
    })
  }, [selectedProperties])

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
            <VStack spacing={3} align="stretch">
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
              
              {/* Time Window Slider */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.300" fontWeight="medium">
                    Time Window
                  </Text>
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                    {formatTimeLabel(previewTimeWindow)}
                  </Badge>
                </HStack>
                <Box px={3}>
                  <Slider
                    value={previewTimeWindow}
                    onChange={handleTimeWindowPreview}
                    onChangeEnd={handleTimeWindowChange}
                    min={10}
                    max={600}
                    step={1}
                    colorScheme="blue"
                  >
                    <SliderTrack bg="gray.600">
                      <SliderFilledTrack bg="blue.400" />
                    </SliderTrack>
                    {/* Keep some reference marks but don't snap to them */}
                    <SliderMark value={30} mt={2} ml={-2} fontSize="xs" color="gray.500">
                      30s
                    </SliderMark>
                    <SliderMark value={60} mt={2} ml={-2} fontSize="xs" color="gray.500">
                      1m
                    </SliderMark>
                    <SliderMark value={120} mt={2} ml={-2} fontSize="xs" color="gray.500">
                      2m
                    </SliderMark>
                    <SliderMark value={300} mt={2} ml={-2} fontSize="xs" color="gray.500">
                      5m
                    </SliderMark>
                    <SliderMark value={600} mt={2} ml={-2} fontSize="xs" color="gray.500">
                      10m
                    </SliderMark>
                    <SliderThumb boxSize={4} bg="blue.500" />
                  </Slider>
                </Box>
              </Box>
            </VStack>
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