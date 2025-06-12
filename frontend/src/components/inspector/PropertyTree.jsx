import React, { useState, useCallback, useMemo, useEffect } from 'react'
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
  togglePropertyChart,
  refreshTrigger
}) => {
  const [editingProperty, setEditingProperty] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [refreshingProperties, setRefreshingProperties] = useState(new Set())
  const [propertyValues, setPropertyValues] = useState({})
  const [collapsedSections, setCollapsedSections] = useState(new Set())

  // Refresh all properties when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && isConnected) {
      refreshAllProperties()
    }
  }, [refreshTrigger, isConnected, refreshAllProperties])

  // Function to collect all properties recursively from the tree structure
  const collectAllProperties = useCallback((node, basePath = '') => {
    const properties = []
    
    // Add direct properties
    if (node.properties) {
      Object.entries(node.properties).forEach(([propName, prop]) => {
        const fullPath = basePath ? `${basePath}.${propName}` : propName
        properties.push({ path: fullPath, prop, propName })
      })
    }
    
    // Recursively add properties from children
    if (node.children) {
      Object.entries(node.children).forEach(([childName, childNode]) => {
        const childPath = basePath ? `${basePath}.${childName}` : childName
        properties.push(...collectAllProperties(childNode, childPath))
      })
    }
    
    return properties
  }, [])

  // Function to refresh all properties at once
  const refreshAllProperties = useCallback(async () => {
    const allPaths = []
    
    // Collect all property paths from the tree recursively
    Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
      const sectionProperties = collectAllProperties(section, sectionName)
      allPaths.push(...sectionProperties.map(p => p.path))
    })

    // Set all as refreshing
    setRefreshingProperties(new Set(allPaths))

    // Refresh each property
    const refreshPromises = allPaths.map(async (displayPath) => {
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
        console.error(`Failed to refresh property ${displayPath}:`, error)
      }
    })

    // Wait for all refreshes to complete
    await Promise.all(refreshPromises)
    
    // Clear refreshing state
    setRefreshingProperties(new Set())
  }, [collectAllProperties])

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

  const toggleSection = (sectionPath) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionPath)) {
        newSet.delete(sectionPath)
      } else {
        newSet.add(sectionPath)
      }
      return newSet
    })
  }

  const renderProperty = (prop, value, displayPath) => {
    if (!prop || typeof prop !== 'object') {
      console.warn(`Invalid property structure for ${displayPath}:`, prop)
      return (
        <Box key={displayPath} p={2} bg="red.900" borderRadius="md">
          <Text color="red.300" fontSize="sm">Invalid property: {displayPath}</Text>
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
        borderRadius="md"
        border="1px solid"
        borderColor={isError ? "red.600" : "gray.600"}
        p={2}
        _hover={{ bg: isError ? "red.800" : "gray.700" }}
        transition="all 0.2s"
      >
        <HStack justify="space-between" align="center" spacing={2}>
          {/* Left side - Compact property info */}
          <HStack spacing={2} flex="1" align="center" minW="0">
            {isChartable && togglePropertyChart && (
              <Checkbox
                size="sm"
                colorScheme="blue"
                isChecked={isCharted}
                onChange={() => togglePropertyChart(displayPath)}
              />
            )}
            
            <VStack align="start" spacing={0} flex="1" minW="0">
              <HStack spacing={1} align="center" w="100%">
                <Text 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  color="white" 
                  isTruncated
                  flex="1"
                >
                  {propName}
                </Text>
                <Badge size="xs" colorScheme={isWritable ? "green" : "gray"} variant="subtle">
                  {isWritable ? "RW" : "RO"}
                </Badge>
                {isError && (
                  <Badge size="xs" colorScheme="red" variant="solid">
                    ERR
                  </Badge>
                )}
              </HStack>
              
              <Text fontSize="xs" color="gray.500" fontFamily="mono" isTruncated w="100%">
                {displayPath}
              </Text>
            </VStack>
          </HStack>
          
          {/* Right side - Compact value and controls */}
          <HStack spacing={1} minW="fit-content">
            {isEditing ? (
              <>
                {valueType === 'boolean' ? (
                  <Switch
                    size="sm"
                    isChecked={editValue === 'true'}
                    onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
                    colorScheme="blue"
                  />
                ) : (
                  <NumberInput
                    size="sm"
                    value={editValue}
                    onChange={setEditValue}
                    min={prop.min}
                    max={prop.max}
                    step={prop.step}
                    precision={prop.decimals}
                    w="80px"
                  >
                    <NumberInputField bg="gray.700" color="white" fontSize="xs" />
                  </NumberInput>
                )}
                <IconButton
                  size="xs"
                  colorScheme="green"
                  icon={<CheckIcon />}
                  onClick={saveEdit}
                  isDisabled={!isConnected}
                />
                <IconButton
                  size="xs"
                  colorScheme="red"
                  icon={<CloseIcon />}
                  onClick={cancelEdit}
                />
              </>
            ) : (
              <>
                <Text 
                  fontSize="sm" 
                  fontFamily="mono" 
                  color={value !== undefined ? (isError ? "red.300" : "white") : "gray.500"}
                  fontWeight="semibold"
                  minW="60px"
                  textAlign="right"
                >
                  {value !== undefined 
                    ? (typeof displayValue === 'number' 
                        ? displayValue.toFixed(Math.min(prop.decimals || 2, 3))
                        : String(displayValue))
                    : 'N/A'
                  }
                </Text>
                
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={isRefreshing ? <Spinner size="xs" /> : <RepeatIcon />}
                  onClick={() => refreshProperty(displayPath)}
                  isDisabled={!isConnected || isRefreshing}
                />
                
                {isWritable && isConnected && (
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<EditIcon />}
                    onClick={() => startEditing(displayPath, displayValue)}
                  />
                )}
              </>
            )}
          </HStack>
        </HStack>
      </Box>
    )
  }

  // Function to render a section recursively with collapsible subsections
  const renderSection = (section, sectionPath = '', depth = 0) => {
    const sectionItems = []
    
    // Render direct properties first
    if (section.properties) {
      Object.entries(section.properties).forEach(([propName, prop]) => {
        const displayPath = sectionPath ? `${sectionPath}.${propName}` : propName
        const value = getValueFromState(displayPath)
        sectionItems.push(renderProperty(prop, value, displayPath))
      })
    }
    
    // Then render child sections
    if (section.children) {
      Object.entries(section.children).forEach(([childName, childSection]) => {
        const childPath = sectionPath ? `${sectionPath}.${childName}` : childName
        const isCollapsed = collapsedSections.has(childPath)
        const childPropertyCount = collectAllProperties(childSection).length
        
        sectionItems.push(
          <Box key={`section-${childPath}`} ml={depth > 0 ? 3 : 0}>
            {/* Collapsible section header */}
            <Box
              bg="gray.700"
              borderRadius="md"
              p={2}
              mb={2}
              border="1px solid"
              borderColor="gray.600"
              cursor="pointer"
              onClick={() => toggleSection(childPath)}
              _hover={{ bg: "gray.650" }}
              transition="all 0.2s"
            >
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Text fontWeight="bold" color="blue.300" fontSize="sm">
                    {isCollapsed ? '▶' : '▼'} {childSection.name}
                  </Text>
                  <Badge colorScheme="purple" variant="outline" size="xs">
                    {childPropertyCount}
                  </Badge>
                </HStack>
              </HStack>
              {!isCollapsed && childSection.description && (
                <Text fontSize="xs" color="gray.400" mt={1}>
                  {childSection.description}
                </Text>
              )}
            </Box>
            
            {/* Collapsible content */}
            {!isCollapsed && (
              <VStack spacing={1} align="stretch" ml={2}>
                {renderSection(childSection, childPath, depth + 1)}
              </VStack>
            )}
          </Box>
        )
      })
    }
    
    return sectionItems
  }

  // Apply search filter with recursive search
  const filteredTree = useMemo(() => {
    let filtered = { ...odrivePropertyTree }
    
    if (searchFilter) {
      const searchFiltered = {}
      
      Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
        // Collect all properties from this section recursively
        const allProperties = collectAllProperties(section, sectionName)
        
        const searchTerm = searchFilter.toLowerCase()
        const matchingProperties = allProperties.filter(({ path, prop, propName }) => {
          const propNameLower = propName.toLowerCase()
          const pathLower = path.toLowerCase()
          const propDisplayName = prop.name ? prop.name.toLowerCase() : propNameLower
          const propDescription = prop.description ? prop.description.toLowerCase() : ''
          
          return (
            propDisplayName.includes(searchTerm) ||
            propDescription.includes(searchTerm) ||
            propNameLower.includes(searchTerm) ||
            pathLower.includes(searchTerm)
          )
        })
        
        if (matchingProperties.length > 0 || section.name.toLowerCase().includes(searchTerm)) {
          // If we have matches, include the whole section
          // In a more advanced implementation, you could rebuild the tree with only matching branches
          searchFiltered[sectionName] = section
        }
      })
      
      filtered = searchFiltered
    }
    
    return filtered
  }, [searchFilter, collectAllProperties])

  return (
    <VStack spacing={3} align="stretch" h="100%">
      {/* Compact Search Controls */}
      <Card bg="gray.800" variant="elevated">
        <CardBody py={2}>
          <HStack spacing={2}>
            <SearchIcon color="gray.400" boxSize={4} />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search properties..."
              bg="gray.700"
              border="1px solid"
              borderColor="gray.600"
              color="white"
              size="sm"
              flex="1"
            />
            {searchFilter && (
              <Button size="xs" onClick={() => setSearchFilter('')}>
                Clear
              </Button>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Compact Property Tree */}
      <Card bg="gray.800" variant="elevated" flex="1">
        <CardHeader py={2}>
          <HStack justify="space-between">
            <Heading size="sm" color="white">ODrive Properties</Heading>
            <HStack spacing={1}>
              {selectedProperties.length > 0 && (
                <Badge colorScheme="blue" size="sm">
                  {selectedProperties.length} charted
                </Badge>
              )}
              <Badge colorScheme="gray" size="sm">
                {Object.keys(filteredTree).length} sections
              </Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Box maxH="70vh" overflowY="auto">
            <VStack spacing={2} align="stretch">
              {Object.entries(filteredTree).map(([sectionName, section]) => {
                const isCollapsed = collapsedSections.has(sectionName)
                const totalProperties = collectAllProperties(section).length
                
                return (
                  <Box key={sectionName}>
                    {/* Main section header */}
                    <Box
                      bg="gray.700"
                      borderRadius="md"
                      p={3}
                      mb={2}
                      border="2px solid"
                      borderColor="gray.600"
                      cursor="pointer"
                      onClick={() => toggleSection(sectionName)}
                      _hover={{ bg: "gray.650", borderColor: "gray.500" }}
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Text fontWeight="bold" color="white" fontSize="md">
                            {isCollapsed ? '▶' : '▼'} {section.name}
                          </Text>
                          <Badge colorScheme="blue" variant="solid" size="sm">
                            {totalProperties}
                          </Badge>
                        </HStack>
                      </HStack>
                    </Box>
                    
                    {/* Main section content */}
                    {!isCollapsed && (
                      <VStack spacing={1} align="stretch" ml={2}>
                        {renderSection(section, sectionName)}
                      </VStack>
                    )}
                  </Box>
                )
              })}
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default PropertyTree