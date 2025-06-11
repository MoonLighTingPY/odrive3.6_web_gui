import React, { useState, useCallback, useMemo } from 'react'
import {
  VStack,
  HStack,
  Text,
  Input,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  IconButton,
  Tooltip,
  NumberInput,
  NumberInputField,
  Switch,
  Button,
  Select,
  Checkbox,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons'
import { odrivePropertyTree } from '../../utils/odrivePropertyTree'

const PropertyTree = ({ 
  odriveState, 
  searchFilter, 
  setSearchFilter, 
  updateProperty, 
  isConnected,
  selectedProperties = [],
  togglePropertyChart
}) => {
  const [editingProperty, setEditingProperty] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [expandedSections, setExpandedSections] = useState(new Set(Object.keys(odrivePropertyTree)))
  const [sliderValues, setSliderValues] = useState({})

  const startEditing = (path, currentValue) => {
    setEditingProperty(path)
    setEditValue(String(currentValue))
  }

  const saveEdit = async () => {
    if (!editingProperty) return
    
    let parsedValue = editValue
    
    // Try to parse as number first
    if (!isNaN(editValue) && editValue.trim() !== '') {
      parsedValue = parseFloat(editValue)
    } else if (editValue.toLowerCase() === 'true') {
      parsedValue = true
    } else if (editValue.toLowerCase() === 'false') {
      parsedValue = false
    }
    
    // Build the correct device path for the API call
    let devicePath
    if (editingProperty.startsWith('system.')) {
      // System properties map to device.config.*
      const systemProp = editingProperty.replace('system.', '')
      devicePath = `device.config.${systemProp}`
    } else if (editingProperty.startsWith('axis0.') || editingProperty.startsWith('axis1.')) {
      // Axis properties map to device.axis0.* or device.axis1.*
      devicePath = `device.${editingProperty}`
    } else {
      // Direct device path
      devicePath = `device.${editingProperty}`
    }
    
    console.log('Updating property:', devicePath, 'with value:', parsedValue)
    
    try {
      // Call the correct updateProperty function that should handle the API call
      await updateProperty(devicePath, parsedValue)
      setEditingProperty(null)
      setEditValue('')
    } catch (error) {
      console.error('Failed to update property:', error)
    }
  }

  const cancelEdit = () => {
    setEditingProperty(null)
    setEditValue('')
  }

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }

  const getValueFromState = useCallback((path) => {
    if (!odriveState || !odriveState.device) {
      return undefined
    }
    
    // Handle normal path resolution
    let fullPath
    if (path.startsWith('system.')) {
      const systemProp = path.replace('system.', '')
      if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
           'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
        fullPath = `device.config.${systemProp}`
      } else {
        fullPath = `device.${systemProp}`
      }
    } else if (path.startsWith('axis0.') || path.startsWith('axis1.')) {
      fullPath = `device.${path}`
    } else {
      fullPath = `device.${path}`
    }
    
    const parts = fullPath.split('.')
    let current = odriveState
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part]
      } else {
        return undefined
      }
    }
    
    return current
  }, [odriveState])

  const isPropertyChartable = (value, prop) => {
    return typeof value === 'number' && !prop?.name?.toLowerCase().includes('error')
  }

  const isSetpointProperty = (prop) => {
    return prop.isSetpoint || prop.name?.toLowerCase().includes('input') || 
           prop.name?.toLowerCase().includes('setpoint')
  }

  const getSliderRange = (prop) => {
    if (prop.min !== undefined && prop.max !== undefined) {
      return { 
        min: prop.min, 
        max: prop.max, 
        step: prop.step || (prop.max - prop.min) / 100 
      }
    }
    
    // Default ranges based on property type
    if (prop.name?.includes('input_pos')) {
      return { min: -10, max: 10, step: 0.1 }
    } else if (prop.name?.includes('input_vel')) {
      return { min: -50, max: 50, step: 0.5 }
    } else if (prop.name?.includes('input_torque')) {
      return { min: -10, max: 10, step: 0.1 }
    }
    
    return { min: -100, max: 100, step: 1 }
  }

  const handleSliderChange = async (displayPath, value) => {
    setSliderValues(prev => ({ ...prev, [displayPath]: value }))
    
    // Build device path for API call
    let devicePath
    if (displayPath.startsWith('system.')) {
      const systemProp = displayPath.replace('system.', '')
      devicePath = `device.config.${systemProp}`
    } else if (displayPath.startsWith('axis0.') || displayPath.startsWith('axis1.')) {
      devicePath = `device.${displayPath}`
    } else {
      devicePath = `device.${displayPath}`
    }
    
    try {
      // Call the correct updateProperty function that should handle the API call
      await updateProperty(devicePath, value)
    } catch (error) {
      console.error('Failed to update setpoint:', error)
      setSliderValues(prev => {
        const { [displayPath]: _removed, ...rest } = prev
        return rest
      })
    }
  }

  const getCurrentSliderValue = (displayPath, actualValue) => {
    return sliderValues[displayPath] !== undefined ? sliderValues[displayPath] : (actualValue || 0)
  }

  const renderProperty = (prop, value, displayPath) => {
    // Add safety checks for prop structure
    if (!prop || typeof prop !== 'object') {
      console.warn(`Invalid property structure for ${displayPath}:`, prop)
      return (
        <Box key={displayPath} p={3} bg="red.900" borderRadius="md">
          <Text color="red.300">Invalid property: {displayPath}</Text>
        </Box>
      )
    }

    const isEditing = editingProperty === displayPath
    const displayValue = value !== undefined ? value : 'N/A'
    const isWritable = prop.writable || false
    const valueType = typeof value
    const isError = displayPath.includes('error') && value !== 0 && value !== undefined
    const isChartable = isPropertyChartable(value, prop)
    const isCharted = selectedProperties.includes(displayPath)
    const isSetpoint = isSetpointProperty(prop)
    const showSlider = isSetpoint && isWritable && isConnected && typeof value === 'number'

    // Use fallback values if prop fields are missing
    const propName = prop.name || displayPath.split('.').pop()

    return (
      <Box
        key={displayPath}
        bg={isError ? "red.900" : "gray.750"}
        borderRadius="lg"
        border="1px solid"
        borderColor={isError ? "red.500" : "gray.600"}
        p={4}
        _hover={{ bg: isError ? "red.800" : "gray.700", borderColor: isError ? "red.400" : "gray.500" }}
        transition="all 0.2s"
      >
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between" align="center">
            {/* Left side - Property info */}
            <HStack spacing={3} flex="1" align="center">
              {/* Chart Checkbox */}
              {isChartable && togglePropertyChart && (
                <Tooltip label={isCharted ? "Remove from chart" : "Add to chart"}>
                  <Checkbox
                    size="md"
                    colorScheme="blue"
                    isChecked={isCharted}
                    onChange={() => togglePropertyChart(displayPath)}
                  />
                </Tooltip>
              )}
              
              <VStack align="start" spacing={1} flex="1">
                <HStack spacing={2} align="center">
                  <Text fontSize="md" fontWeight="bold" color="white">
                    {propName}
                  </Text>
                  <Badge size="sm" colorScheme={isWritable ? "green" : "gray"}>
                    {isWritable ? "RW" : "RO"}
                  </Badge>
                  <Badge size="sm" colorScheme="blue" variant="subtle">
                    {valueType}
                  </Badge>
                  {isChartable && (
                    <Badge size="sm" colorScheme="purple" variant="subtle">
                      CHART
                    </Badge>
                  )}
                  {isSetpoint && (
                    <Badge size="sm" colorScheme="orange" variant="subtle">
                      SETPOINT
                    </Badge>
                  )}
                  {isError && (
                    <Badge size="sm" colorScheme="red">
                      ERROR
                    </Badge>
                  )}
                </HStack>
                
                <HStack spacing={4} align="center">
                  <Text fontSize="xs" color="gray.400" fontFamily="mono">
                    {displayPath}
                  </Text>
                  {prop.min !== undefined && prop.max !== undefined && (
                    <Text fontSize="xs" color="gray.500">
                      Range: {prop.min} to {prop.max}
                    </Text>
                  )}
                </HStack>
                
                {isError && value !== undefined && (
                  <Text fontSize="xs" color="red.400" fontWeight="bold">
                    Error Code: 0x{value.toString(16).toUpperCase()}
                  </Text>
                )}
              </VStack>
            </HStack>
            
            {/* Right side - Value display and editing */}
            <HStack spacing={3} minW="250px" justify="flex-end">
              {isEditing ? (
                <>
                  {valueType === 'boolean' ? (
                    <Switch
                      size="lg"
                      isChecked={editValue === 'true'}
                      onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
                      colorScheme="blue"
                    />
                  ) : prop.options ? (
                    <Select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      size="md"
                      bg="gray.700"
                      color="white"
                      minW="150px"
                    >
                      {Object.entries(prop.options).map(([val, label]) => (
                        <option key={val} value={val}>{val}: {label}</option>
                      ))}
                    </Select>
                  ) : (
                    <NumberInput
                      size="md"
                      value={editValue}
                      onChange={setEditValue}
                      min={prop.min}
                      max={prop.max}
                      step={prop.step}
                      precision={prop.decimals}
                      minW="120px"
                    >
                      <NumberInputField bg="gray.700" color="white" />
                    </NumberInput>
                  )}
                  <IconButton
                    size="md"
                    colorScheme="green"
                    icon={<CheckIcon />}
                    onClick={saveEdit}
                    isDisabled={!isConnected}
                  />
                  <IconButton
                    size="md"
                    colorScheme="red"
                    icon={<CloseIcon />}
                    onClick={cancelEdit}
                  />
                </>
              ) : (
                <>
                  <VStack align="end" spacing={0}>
                    <Text 
                      fontSize="lg" 
                      fontFamily="mono" 
                      color={value !== undefined ? (isError ? "red.300" : "white") : "gray.500"}
                      fontWeight="bold"
                      minW="120px"
                      textAlign="right"
                    >
                      {value !== undefined 
                        ? (typeof displayValue === 'number' 
                            ? displayValue.toFixed(prop.decimals || 3)
                            : prop.options && prop.options[displayValue] 
                              ? `${displayValue}: ${prop.options[displayValue]}`
                              : String(displayValue))
                        : 'N/A'
                      }
                    </Text>
                    {prop.options && typeof value === 'number' && prop.options[value] && (
                      <Text fontSize="xs" color="gray.400">
                        {prop.options[value]}
                      </Text>
                    )}
                  </VStack>
                  {isWritable && isConnected && !showSlider && (
                    <Tooltip label="Edit property">
                      <IconButton
                        size="md"
                        variant="ghost"
                        icon={<EditIcon />}
                        onClick={() => startEditing(displayPath, displayValue)}
                        _hover={{ bg: "gray.600" }}
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </HStack>
          </HStack>

          {/* Slider for setpoints */}
          {showSlider && (
            <Box w="100%">
              <VStack spacing={2} w="100%">
                <HStack justify="space-between" w="100%">
                  <Text fontSize="xs" color="gray.400">Interactive Control</Text>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleSliderChange(displayPath, 0)}
                  >
                    Zero
                  </Button>
                </HStack>
                
                {(() => {
                  const range = getSliderRange(prop)
                  const currentValue = getCurrentSliderValue(displayPath, value)
                  
                  return (
                    <Box w="100%" position="relative" pb={6}>
                      <Slider
                        value={currentValue}
                        min={range.min}
                        max={range.max}
                        step={range.step}
                        onChange={(val) => setSliderValues(prev => ({ ...prev, [displayPath]: val }))
                        }
                        onChangeEnd={(val) => handleSliderChange(displayPath, val)}
                        colorScheme="blue"
                      >
                        <SliderMark value={range.min} mt="1" ml="-2.5" fontSize="xs" color="gray.400">
                          {range.min}
                        </SliderMark>
                        <SliderMark value={0} mt="1" ml="-1" fontSize="xs" color="gray.300">
                          0
                        </SliderMark>
                        <SliderMark value={range.max} mt="1" ml="-2.5" fontSize="xs" color="gray.400">
                          {range.max}
                        </SliderMark>
                        <SliderMark
                          value={currentValue}
                          textAlign="center"
                          bg="blue.500"
                          color="white"
                          mt="-10"
                          ml="-5"
                          w="10"
                          borderRadius="md"
                          fontSize="xs"
                          px={1}
                        >
                          {currentValue.toFixed(range.step < 1 ? 1 : 0)}
                        </SliderMark>
                        <SliderTrack bg="gray.600">
                          <SliderFilledTrack bg="blue.400" />
                        </SliderTrack>
                        <SliderThumb bg="blue.500" />
                      </Slider>
                    </Box>
                  )
                })()}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    )
  }

  // Apply search filter
  const filteredTree = useMemo(() => {
    let filtered = { ...odrivePropertyTree }
    
    if (searchFilter) {
      const searchFiltered = {}
      
      Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
        const filteredSection = { ...section, properties: {} }
        let hasMatchingProps = false
        
        Object.entries(section.properties).forEach(([propName, prop]) => {
          if (!prop || typeof prop !== 'object') {
            console.warn(`Invalid property structure for ${propName}:`, prop)
            return
          }
          
          const searchTerm = searchFilter.toLowerCase()
          const propNameLower = propName.toLowerCase()
          const sectionNameLower = sectionName.toLowerCase()
          const propDisplayName = prop.name ? prop.name.toLowerCase() : propNameLower
          const propDescription = prop.description ? prop.description.toLowerCase() : ''
          
          if (
            propDisplayName.includes(searchTerm) ||
            propDescription.includes(searchTerm) ||
            propNameLower.includes(searchTerm) ||
            sectionNameLower.includes(searchTerm)
          ) {
            filteredSection.properties[propName] = prop
            hasMatchingProps = true
          }
        })
        
        if (hasMatchingProps || section.name.toLowerCase().includes(searchFilter.toLowerCase())) {
          searchFiltered[sectionName] = filteredSection
        }
      })
      
      filtered = searchFiltered
    }
    
    return filtered
  }, [searchFilter])

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Search Controls */}
      <Card bg="gray.800" variant="elevated">
        <CardBody>
          <HStack>
            <SearchIcon color="gray.400" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search properties..."
              bg="gray.700"
              border="1px solid"
              borderColor="gray.600"
              color="white"
              flex="1"
            />
            {searchFilter && (
              <Button size="sm" onClick={() => setSearchFilter('')}>
                Clear
              </Button>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Property Tree */}
      <Card bg="gray.800" variant="elevated" flex="1">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="white">ODrive Properties</Heading>
            <HStack spacing={2}>
              {selectedProperties.length > 0 && (
                <Badge colorScheme="blue">
                  {selectedProperties.length} charted
                </Badge>
              )}
              <Badge colorScheme="gray">
                {Object.keys(filteredTree).length} sections
              </Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box maxH="600px" overflowY="auto">
            <Accordion allowMultiple index={Array.from(expandedSections).map(section => 
              Object.keys(filteredTree).indexOf(section)
            ).filter(idx => idx !== -1)}>
              {Object.entries(filteredTree).map(([sectionName, section]) => (
                <AccordionItem key={sectionName} border="none">
                  <AccordionButton
                    onClick={() => toggleSection(sectionName)}
                    _expanded={{ bg: 'gray.700' }}
                    bg="gray.750"
                    borderRadius="md"
                    mb={2}
                    _hover={{ bg: 'gray.700' }}
                  >
                    <Box flex="1" textAlign="left">
                      <HStack>
                        <Text fontWeight="bold" color="white" fontSize="lg">
                          {section.name}
                        </Text>
                        <Badge colorScheme="blue" variant="solid">
                          {Object.keys(section.properties).length}
                        </Badge>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} px={0}>
                    <VStack spacing={3} align="stretch">
                      {Object.entries(section.properties).map(([propName, prop]) => {
                        const displayPath = sectionName === 'system' 
                          ? `system.${propName}` 
                          : `${sectionName}.${propName}`
                        const value = getValueFromState(displayPath)
                        
                        return renderProperty(prop, value, displayPath)
                      })}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default PropertyTree