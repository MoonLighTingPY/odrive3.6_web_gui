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
  Spinner,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, SearchIcon, RepeatIcon } from '@chakra-ui/icons'
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
  const [refreshingProperties, setRefreshingProperties] = useState(new Set())
  const [propertyValues, setPropertyValues] = useState({})

  // Refresh a single property
  const refreshProperty = async (displayPath) => {
    if (!isConnected) return
    
    setRefreshingProperties(prev => new Set([...prev, displayPath]))
    
    try {
      // Build device path
      let devicePath = displayPath
      if (displayPath.startsWith('system.')) {
        const systemProp = displayPath.replace('system.', '')
        if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
             'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
          devicePath = `config.${systemProp}`
        } else {
          devicePath = systemProp
        }
      }
      
      const response = await fetch('/api/odrive/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: devicePath })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPropertyValues(prev => ({
          ...prev,
          [displayPath]: data.value
        }))
      }
    } catch (error) {
      console.error('Failed to refresh property:', error)
    } finally {
      setRefreshingProperties(prev => {
        const newSet = new Set(prev)
        newSet.delete(displayPath)
        return newSet
      })
    }
  }

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
      const systemProp = editingProperty.replace('system.', '')
      if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
           'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
        devicePath = `device.config.${systemProp}`
      } else {
        devicePath = `device.${systemProp}`
      }
    } else if (editingProperty.startsWith('axis0.') || editingProperty.startsWith('axis1.')) {
      devicePath = `device.${editingProperty}`
    } else {
      devicePath = `device.${editingProperty}`
    }
    
    console.log('Updating property:', devicePath, 'with value:', parsedValue)
    
    try {
      await updateProperty(devicePath, parsedValue)
      setEditingProperty(null)
      setEditValue('')
      // Refresh the property after successful update
      await refreshProperty(editingProperty)
    } catch (error) {
      console.error('Failed to update property:', error)
    }
  }

  const cancelEdit = () => {
    setEditingProperty(null)
    setEditValue('')
  }

  const getValueFromState = useCallback((path) => {
    // First check if we have a refreshed value
    if (propertyValues[path] !== undefined) {
      return propertyValues[path]
    }
    
    // Fallback to state value (last known)
    if (!odriveState || !odriveState.device) {
      return undefined
    }
    
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
  }, [odriveState, propertyValues])

  const isPropertyChartable = (value, prop) => {
    return typeof value === 'number' && !prop?.name?.toLowerCase().includes('error')
  }

  const renderProperty = (prop, value, displayPath) => {
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
    const isRefreshing = refreshingProperties.has(displayPath)

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
        <HStack justify="space-between" align="center">
          {/* Left side - Property info with chart checkbox */}
          <HStack spacing={3} flex="1" align="center">
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
                {isError && (
                  <Badge size="sm" colorScheme="red">
                    ERROR
                  </Badge>
                )}
              </HStack>
              
              <Text fontSize="xs" color="gray.400" fontFamily="mono">
                {displayPath}
              </Text>
              
              {prop.description && (
                <Text fontSize="xs" color="gray.500">
                  {prop.description}
                </Text>
              )}
              
              {isError && value !== undefined && (
                <Text fontSize="xs" color="red.400" fontWeight="bold">
                  Error Code: 0x{value.toString(16).toUpperCase()}
                </Text>
              )}
            </VStack>
          </HStack>
          
          {/* Right side - Value display and controls */}
          <HStack spacing={3} minW="300px" justify="flex-end">
            {isEditing ? (
              <>
                {valueType === 'boolean' ? (
                  <Switch
                    size="lg"
                    isChecked={editValue === 'true'}
                    onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
                    colorScheme="blue"
                  />
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
                  size="sm"
                  colorScheme="green"
                  icon={<CheckIcon />}
                  onClick={saveEdit}
                  isDisabled={!isConnected}
                />
                <IconButton
                  size="sm"
                  colorScheme="red"
                  icon={<CloseIcon />}
                  onClick={cancelEdit}
                />
              </>
            ) : (
              <>
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
                        : String(displayValue))
                    : 'N/A'
                  }
                </Text>
                
                {/* Refresh button */}
                <Tooltip label="Refresh value">
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={isRefreshing ? <Spinner size="xs" /> : <RepeatIcon />}
                    onClick={() => refreshProperty(displayPath)}
                    isDisabled={!isConnected || isRefreshing}
                    _hover={{ bg: "gray.600" }}
                  />
                </Tooltip>
                
                {/* Edit button for writable properties */}
                {isWritable && isConnected && (
                  <Tooltip label="Edit property">
                    <IconButton
                      size="sm"
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
          if (!prop || typeof prop !== 'object') return
          
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
            <Accordion allowMultiple defaultIndex={Object.keys(filteredTree).map((_, index) => index)}>
              {Object.entries(filteredTree).map(([sectionName, section]) => (
                <AccordionItem key={sectionName} border="none">
                  <AccordionButton
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