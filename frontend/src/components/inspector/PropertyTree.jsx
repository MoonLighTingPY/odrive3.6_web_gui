import { useState, useMemo, useCallback } from 'react'
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
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Checkbox,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, SearchIcon, InfoIcon } from '@chakra-ui/icons'
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
  const [expandedSections, setExpandedSections] = useState(new Set(['system', 'axis0']))
  const [viewMode, setViewMode] = useState('all') // all, writable, errors

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
  // The odriveState should contain the device data structure
  if (!odriveState || !odriveState.device) {
    console.log('No device data in odriveState:', odriveState)
    return undefined
  }
  
  // Build the full device path - the data is already under device.*
  let fullPath
  if (path.startsWith('system')) {
    // System properties map to device.config.* or device.*
    const systemProp = path.replace('system.', '')
    // Check if it's a config property or direct device property
    if (['hw_version_major', 'hw_version_minor', 'fw_version_major', 'fw_version_minor', 'serial_number'].includes(systemProp)) {
      fullPath = `device.${systemProp}`
    } else {
      fullPath = `device.config.${systemProp}`
    }
  } else if (path.startsWith('axis0') || path.startsWith('axis1')) {
    // Axis properties map to device.axis0.* or device.axis1.*
    fullPath = `device.${path}`
  } else {
    // Direct device path
    fullPath = `device.${path}`
  }
  
  console.log('Looking for path:', fullPath, 'in state:', odriveState)
  
  const parts = fullPath.split('.')
  let current = odriveState
  
  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part]
    } else {
      console.log(`Part ${part} not found in current object:`, current)
      return undefined
    }
  }
  
  console.log(`Found value for ${fullPath}:`, current)
  return current
}, [odriveState])

  const hasError = useCallback((sectionPath) => {
    if (!odriveState) return false
    
    const errorValue = getValueFromState(`${sectionPath}.error`)
    return errorValue !== undefined && errorValue !== 0
  }, [odriveState, getValueFromState])

  const isPropertyChartable = (value, prop) => {
    return typeof value === 'number' && prop.type === 'number'
  }

  const renderProperty = (prop, value, displayPath, devicePath) => {
  const isEditing = editingProperty === displayPath
  const displayValue = value !== undefined ? value : 'N/A'
  const isWritable = prop.writable
  const valueType = typeof value
  const isError = displayPath.includes('error') && value !== 0 && value !== undefined
  const isChartable = isPropertyChartable(value, prop)
  const isCharted = selectedProperties.includes(displayPath)

  return (
    <HStack key={displayPath} justify="space-between" p={3} bg={isError ? "red.900" : "gray.800"} borderRadius="md" border={isError ? "1px solid" : "none"} borderColor={isError ? "red.500" : "transparent"}>
      <VStack align="start" spacing={1} flex="1">
        <HStack>
          {/* Chart Checkbox */}
          {isChartable && togglePropertyChart && (
            <Tooltip label={isCharted ? "Remove from chart" : "Add to chart"}>
              <Checkbox
                size="sm"
                colorScheme="blue"
                isChecked={isCharted}
                onChange={() => togglePropertyChart(displayPath)}
              />
            </Tooltip>
          )}
          
          <Text fontSize="sm" fontWeight="bold" color="white">
            {prop.name}
          </Text>
          <Badge size="sm" colorScheme={isWritable ? "green" : "gray"}>
            {isWritable ? "RW" : "RO"}
          </Badge>
          <Badge size="sm" colorScheme="blue">
            {valueType}
          </Badge>
          {isChartable && (
            <Badge size="sm" colorScheme="purple">
              CHART
            </Badge>
          )}
          {isError && (
            <Badge size="sm" colorScheme="red">
              ERROR
            </Badge>
          )}
          {prop.min !== undefined && prop.max !== undefined && (
            <Tooltip label={`Range: ${prop.min} to ${prop.max}`}>
              <InfoIcon color="gray.400" boxSize={3} />
            </Tooltip>
          )}
        </HStack>
        <Text fontSize="xs" color="gray.400">
          {prop.description}
        </Text>
        <Text fontSize="xs" color="gray.500" fontFamily="mono">
          {devicePath}
        </Text>
        {isError && value !== undefined && (
          <Text fontSize="xs" color="red.400" fontWeight="bold">
            Error Code: 0x{value.toString(16).toUpperCase()}
          </Text>
        )}
      </VStack>
      
      <HStack spacing={2} minW="200px">
        {isEditing ? (
          <>
            {valueType === 'boolean' ? (
              <Switch
                isChecked={editValue === 'true'}
                onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
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
              fontSize="sm" 
              fontFamily="mono" 
              color={value !== undefined ? (isError ? "red.300" : "white") : "gray.500"}
              minW="100px"
              textAlign="right"
            >
              {value !== undefined 
                ? (typeof displayValue === 'number' 
                    ? displayValue.toFixed(prop.decimals || 3)
                    : String(displayValue))
                : 'N/A'
              }
            </Text>
            {isWritable && isConnected && (
              <Tooltip label="Edit property">
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<EditIcon />}
                  onClick={() => startEditing(displayPath, displayValue)}
                />
              </Tooltip>
            )}
          </>
        )}
      </HStack>
    </HStack>
  )
}

  const filteredTree = useMemo(() => {
    let filtered = { ...odrivePropertyTree }
    
    // Apply search filter
    if (searchFilter) {
      const searchFiltered = {}
      
      Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
        const filteredSection = { ...section, properties: {} }
        let hasMatchingProps = false
        
        Object.entries(section.properties).forEach(([propName, prop]) => {
          // Add safety check for prop structure
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
    
    // Apply view mode filter
    if (viewMode === 'writable') {
      const writableFiltered = {}
      
      Object.entries(filtered).forEach(([sectionName, section]) => {
        const writableSection = { ...section, properties: {} }
        let hasWritableProps = false
        
        Object.entries(section.properties).forEach(([propName, prop]) => {
          // Add safety check
          if (!prop || typeof prop !== 'object') return
          
          if (prop.writable) {
            writableSection.properties[propName] = prop
            hasWritableProps = true
          }
        })
        
        if (hasWritableProps) {
          writableFiltered[sectionName] = writableSection
        }
      })
      
      filtered = writableFiltered
    } else if (viewMode === 'errors') {
      const errorFiltered = {}
      
      Object.entries(filtered).forEach(([sectionName, section]) => {
        if (hasError(sectionName)) {
          errorFiltered[sectionName] = section
        }
      })
      
      filtered = errorFiltered
    }
    
    return filtered
  }, [searchFilter, viewMode, hasError])

  const errorCount = useMemo(() => {
    let count = 0
    Object.keys(odrivePropertyTree).forEach(sectionName => {
      if (hasError(sectionName)) count++
    })
    return count
  }, [hasError])

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Search and Filters */}
      <Card bg="gray.800" variant="elevated">
        <CardBody>
          <VStack spacing={3}>
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
            
            <HStack w="100%">
              <FormControl>
                <FormLabel fontSize="sm" color="gray.300">View Mode:</FormLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  size="sm"
                  bg="gray.700"
                  color="white"
                >
                  <option value="all">All Properties</option>
                  <option value="writable">Writable Only</option>
                  <option value="errors">Errors Only</option>
                </Select>
              </FormControl>
              
              {errorCount > 0 && (
                <Alert status="error" variant="left-accent" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">{errorCount} section(s) with errors</Text>
                </Alert>
              )}
            </HStack>
          </VStack>
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
                <AccordionItem key={sectionName}>
                  <AccordionButton
                    onClick={() => toggleSection(sectionName)}
                    _expanded={{ bg: 'gray.700' }}
                  >
                    <Box flex="1" textAlign="left">
                      <HStack>
                        <Text fontWeight="bold" color="white">
                          {section.name}
                        </Text>
                        <Badge colorScheme="blue">
                          {Object.keys(section.properties).length}
                        </Badge>
                        {hasError(sectionName) && (
                          <Badge colorScheme="red">
                            ERROR
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color="gray.400">
                        {section.description}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <VStack spacing={2} align="stretch">
                      {Object.entries(section.properties).map(([propName, prop]) => {
                        // Build the correct display and device paths
                        let displayPath, devicePath
                        
                        if (sectionName === 'system') {
                          // System properties
                          displayPath = `system.${propName}`
                          devicePath = `device.config.${propName}`
                        } else if (sectionName.startsWith('axis0') || sectionName.startsWith('axis1')) {
                          // Axis properties - these should already include the full path
                          displayPath = `${sectionName}.${propName}`
                          devicePath = `device.${sectionName}.${propName}`
                        } else {
                          // Other properties
                          displayPath = `${sectionName}.${propName}`
                          devicePath = `device.${displayPath}`
                        }
                        
                        console.log('Rendering property:', { sectionName, propName, displayPath, devicePath })
                        
                        const value = getValueFromState(displayPath)
                        return renderProperty(prop, value, displayPath, devicePath)
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