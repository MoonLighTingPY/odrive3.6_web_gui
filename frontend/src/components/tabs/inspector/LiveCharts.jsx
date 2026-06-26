import { memo, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react'
import { DeleteIcon, DownloadIcon, CloseIcon } from '@chakra-ui/icons'
import { useSelector, useDispatch } from 'react-redux'
import { removeProperty, clearAll } from '../../../store/slices/telemetrySlice'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

// Stable frozen telemetry view used when the Inspector tab is hidden so the
// chart doesn't re-render at the raw WebSocket rate while off-screen.
const FROZEN_TELEMETRY = Object.freeze({ selectedProperties: [], samples: {}, status: 'disconnected' })

const COLORS = [
  '#63B3ED', '#68D391', '#F6AD55', '#FC8181',
  '#B794F6', '#4FD1C7', '#FBB6CE', '#9AE6B4',
  '#90CDF4', '#F687B3', '#76E4F7', '#FBD38D',
]

const leafName = (path) => path.split('.').pop()

// How many recent points to plot per chart. Bounded so the fast (10 ms) stream
// stays smooth without recharts choking on thousands of nodes.
const WINDOW_POINTS = 240

// One chart for a single property. Memoized on its own data array so a new
// sample for property A doesn't re-render property B's chart.
const PropertyChart = memo(({ path, color, data }) => (
  <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="md" p={2} h="220px" display="flex" flexDirection="column">
    <HStack justify="space-between" mb={1} flexShrink={0}>
      <HStack spacing={2} minW={0}>
        <Box w={3} h={3} borderRadius="full" bg={color} flexShrink={0} />
        <Text fontSize="sm" fontWeight="semibold" color="white" isTruncated>{leafName(path)}</Text>
      </HStack>
      <Text fontSize="xs" color="gray.500" fontFamily="mono" flexShrink={0} pr={6}>
        {data.length ? Number(data[data.length - 1].v).toFixed(3) : '—'}
      </Text>
    </HStack>
    <Box flex="1" minH={0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="t"
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickFormatter={(v) => `${v.toFixed(1)}s`}
            minTickGap={24}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            domain={['auto', 'auto']}
            width={48}
          />
          <RechartsTooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px', color: '#F9FAFB', fontSize: '11px' }}
            labelFormatter={(v) => `t: ${Number(v).toFixed(2)}s`}
            formatter={(v) => [typeof v === 'number' ? v.toFixed(6) : v, leafName(path)]}
          />
          <Line
            type="linear"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </Box>
))
PropertyChart.displayName = 'PropertyChart'

const LiveCharts = ({ isActive = true }) => {
  const dispatch = useDispatch()
  const { selectedProperties, samples, status } = useSelector(
    (state) => (isActive ? state.telemetry : FROZEN_TELEMETRY)
  )

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Build a per-property data array (relative seconds + value), windowed.
  const chartSeries = useMemo(() => {
    return selectedProperties.map((path, index) => {
      const raw = samples[path] || []
      const slice = raw.slice(-WINDOW_POINTS)
      const t0 = slice.length ? slice[0].t : 0
      const data = slice.map((s) => ({
        t: (s.t - t0) / 1000,
        v: typeof s.v === 'boolean' ? (s.v ? 1 : 0) : s.v,
      }))
      return { path, color: COLORS[index % COLORS.length], data }
    })
  }, [selectedProperties, samples])

  // Stack vertically; switch to two columns once more than two are selected.
  const columns = selectedProperties.length > 2 ? 2 : 1

  return (
    <Box h="100%" bg={bgColor} display="flex" flexDirection="column">
      {/* Header */}
      <HStack justify="space-between" align="center" p={4} borderBottom="1px solid" borderColor={borderColor} flexShrink={0}>
        <VStack spacing={1} align="start">
          <Text fontSize="lg" fontWeight="medium" color="white">Live Charts</Text>
          <HStack spacing={2}>
            <Badge colorScheme={status === 'connected' ? 'green' : 'gray'} variant="outline">{status}</Badge>
            <Text fontSize="xs" color="gray.400">
              {selectedProperties.length} {selectedProperties.length === 1 ? 'property' : 'properties'} • realtime
            </Text>
          </HStack>
        </VStack>

        <HStack spacing={2}>
          <Tooltip label="Clear chart data">
            <IconButton size="sm" icon={<DeleteIcon />} onClick={() => dispatch(clearAll())} aria-label="Clear data" />
          </Tooltip>
          <Tooltip label="Export data (JSON)">
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
                URL.revokeObjectURL(url)
              }}
              aria-label="Export data"
            />
          </Tooltip>
        </HStack>
      </HStack>

      {/* Charts */}
      <Box flex="1" minH={0} overflowY="auto" p={4}>
        {selectedProperties.length === 0 ? (
          <VStack spacing={4} justify="center" align="center" h="100%" color="gray.400">
            <Text fontSize="lg">No properties selected</Text>
            <Text fontSize="sm" textAlign="center">
              Tick the checkbox next to a property in the tree to chart it.
            </Text>
          </VStack>
        ) : (
          <SimpleGrid columns={columns} spacing={4}>
            {chartSeries.map(({ path, color, data }) => (
              <Box key={path} position="relative">
                <Tooltip label="Remove chart">
                  <IconButton
                    size="xs"
                    icon={<CloseIcon />}
                    aria-label={`Remove ${path}`}
                    position="absolute"
                    top={2}
                    right={2}
                    zIndex={1}
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => dispatch(removeProperty(path))}
                  />
                </Tooltip>
                <PropertyChart path={path} color={color} data={data} />
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  )
}

export default LiveCharts
