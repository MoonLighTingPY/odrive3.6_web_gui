import { useState, useEffect } from 'react'
import {
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Switch,
  SimpleGrid,
  Box,
  Badge,
  Progress,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
} from '@chakra-ui/react'

const LiveMonitor = ({ odriveState, refreshRate, setRefreshRate }) => {
  const [monitoredProperties, setMonitoredProperties] = useState([
    'vbus_voltage',
    'axis0.current_state',
    'axis0.encoder.pos_estimate',
    'axis0.encoder.vel_estimate',
    'axis0.motor.current_control.Iq_measured',
    'axis0.controller.pos_setpoint',
    'axis0.controller.vel_setpoint'
  ])
  const [displayFormat, setDisplayFormat] = useState('table') // table, grid
  const [autoScroll, setAutoScroll] = useState(true)

  const getValueFromPath = (obj, path) => {
    const parts = path.split('.')
    let current = obj
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part]
      } else {
        return undefined
      }
    }
    
    return current
  }

  const formatValue = (value, path) => {
    if (value === undefined || value === null) return 'N/A'
    
    if (typeof value === 'number') {
      // Format numbers based on their likely use
      if (path.includes('voltage')) return `${value.toFixed(2)} V`
      if (path.includes('current')) return `${value.toFixed(3)} A`
      if (path.includes('temperature')) return `${value.toFixed(1)} °C`
      if (path.includes('pos_estimate')) return `${value.toFixed(1)} counts`
      if (path.includes('vel_estimate')) return `${value.toFixed(1)} counts/s`
      if (path.includes('state')) return value.toString()
      
      // Default number formatting
      if (Number.isInteger(value)) return value.toString()
      return value.toFixed(3)
    }
    
    if (typeof value === 'boolean') return value ? 'True' : 'False'
    
    return String(value)
  }

  const getValueColor = (value, path) => {
    if (value === undefined || value === null) return 'gray.500'
    
    // Color coding based on value types and ranges
    if (path.includes('error') && value !== 0) return 'red.300'
    if (path.includes('voltage')) {
      const v = parseFloat(value)
      if (v < 12) return 'yellow.300'
      if (v > 56) return 'red.300'
      return 'green.300'
    }
    if (path.includes('temperature')) {
      const t = parseFloat(value)
      if (t > 80) return 'red.300'
      if (t > 60) return 'yellow.300'
      return 'green.300'
    }
    if (path.includes('current_state')) {
      const state = parseInt(value)
      if (state === 8) return 'green.300' // CLOSED_LOOP_CONTROL
      if (state === 1) return 'blue.300' // IDLE
      if (state >= 2 && state <= 7) return 'yellow.300' // Calibration
      return 'red.300'
    }
    
    return 'white'
  }

  const availableProperties = [
    'vbus_voltage',
    'axis0.current_state',
    'axis0.error',
    'axis0.encoder.pos_estimate',
    'axis0.encoder.vel_estimate',
    'axis0.encoder.error',
    'axis0.motor.current_control.Iq_measured',
    'axis0.motor.current_control.Id_measured',
    'axis0.motor.error',
    'axis0.controller.pos_setpoint',
    'axis0.controller.vel_setpoint',
    'axis0.controller.torque_setpoint',
    'axis0.controller.error',
    'axis0.sensorless_estimator.phase',
    'axis0.sensorless_estimator.vel_estimate'
  ]

  const toggleProperty = (property) => {
    setMonitoredProperties(prev => 
      prev.includes(property) 
        ? prev.filter(p => p !== property)
        : [...prev, property]
    )
  }

  return (
    <Card bg="gray.800" variant="elevated" flex="1">
      <CardHeader>
        <Heading size="md" color="white">Live Data Monitor</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Controls */}
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <FormControl display="flex" alignItems="center" maxW="200px">
                <FormLabel htmlFor="auto-scroll" mb="0" color="gray.300" fontSize="sm">
                  Auto-scroll:
                </FormLabel>
                <Switch
                  id="auto-scroll"
                  size="sm"
                  colorScheme="blue"
                  isChecked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
              </FormControl>
              
              <FormControl maxW="150px">
                <FormLabel color="gray.300" fontSize="sm">Display:</FormLabel>
                <Select
                  value={displayFormat}
                  onChange={(e) => setDisplayFormat(e.target.value)}
                  size="sm"
                  bg="gray.700"
                  color="white"
                >
                  <option value="table">Table</option>
                  <option value="grid">Grid</option>
                </Select>
              </FormControl>
            </HStack>
            
            <Box>
              <FormLabel color="gray.300" fontSize="sm" mb={2}>
                Refresh Rate: {refreshRate}ms ({(1000/refreshRate).toFixed(1)} Hz)
              </FormLabel>
              <Slider
                value={refreshRate}
                onChange={setRefreshRate}
                min={100}
                max={5000}
                step={100}
              >
                <SliderTrack bg="gray.600">
                  <SliderFilledTrack bg="blue.400" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </VStack>

          {/* Property Selection */}
          <Box>
            <Text color="gray.300" fontSize="sm" mb={2}>
              Monitored Properties ({monitoredProperties.length}):
            </Text>
            <Box maxH="100px" overflowY="auto" p={2} bg="gray.900" borderRadius="md">
              <SimpleGrid columns={2} spacing={1}>
                {availableProperties.map(property => (
                  <HStack key={property} spacing={2}>
                    <Switch
                      size="sm"
                      colorScheme="blue"
                      isChecked={monitoredProperties.includes(property)}
                      onChange={() => toggleProperty(property)}
                    />
                    <Text fontSize="xs" color="gray.300" fontFamily="mono">
                      {property}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </Box>
          </Box>

          {/* Live Data Display */}
          <Box>
            <Text color="white" fontWeight="bold" mb={2}>
              Current Values:
            </Text>
            
            {displayFormat === 'table' ? (
              <Box maxH="300px" overflowY="auto" bg="gray.900" borderRadius="md" p={3}>
                <VStack spacing={2} align="stretch">
                  {monitoredProperties.map(property => {
                    const value = getValueFromPath(odriveState, property)
                    return (
                      <HStack key={property} justify="space-between" p={2} bg="gray.800" borderRadius="sm">
                        <Text fontSize="sm" color="gray.300" fontFamily="mono" flex="1">
                          {property}
                        </Text>
                        <Text 
                          fontSize="sm" 
                          color={getValueColor(value, property)}
                          fontFamily="mono"
                          fontWeight="bold"
                          minW="100px"
                          textAlign="right"
                        >
                          {formatValue(value, property)}
                        </Text>
                      </HStack>
                    )
                  })}
                </VStack>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                {monitoredProperties.map(property => {
                  const value = getValueFromPath(odriveState, property)
                  return (
                    <Box key={property} p={3} bg="gray.900" borderRadius="md">
                      <Text fontSize="xs" color="gray.400" mb={1} fontFamily="mono">
                        {property}
                      </Text>
                      <Text 
                        fontSize="md" 
                        color={getValueColor(value, property)}
                        fontFamily="mono"
                        fontWeight="bold"
                      >
                        {formatValue(value, property)}
                      </Text>
                    </Box>
                  )
                })}
              </SimpleGrid>
            )}
          </Box>

          {/* Connection Status */}
          <HStack justify="space-between" p={2} bg="gray.900" borderRadius="sm">
            <Text fontSize="sm" color="gray.400">
              Monitor Status:
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="green" variant="outline">
                {monitoredProperties.length} properties
              </Badge>
              <Badge colorScheme="blue" variant="outline">
                {(1000/refreshRate).toFixed(1)} Hz
              </Badge>
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default LiveMonitor