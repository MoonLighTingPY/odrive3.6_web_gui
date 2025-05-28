import { useState, useMemo } from 'react'
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
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, SearchIcon, InfoIcon } from '@chakra-ui/icons'
import { odrivePropertyTree } from '../../utils/odrivePropertyTree'

const PropertyTree = ({ odriveState, searchFilter, setSearchFilter, updateProperty, isConnected }) => {
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
    
    await updateProperty(editingProperty, parsedValue)
    setEditingProperty(null)
    setEditValue('')
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

  const getValueFromState = (path) => {
    const parts = path.split('.')
    let current = odriveState
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part]
      } else {
        return undefined
      }
    }
    
    return current
  }

  const hasError = (sectionPath) => {
    if (!odriveState) return false
    
    const errorValue = getValueFromState(`${sectionPath}.error`)
    return errorValue !== undefined && errorValue !== 0
  }

  const renderProperty = (prop, value, path) => {
    const isEditing = editingProperty === path
    const displayValue = value !== undefined ? value : 'N/A'
    const isWritable = prop.writable
    const valueType = typeof value
    const isError = path.includes('error') && value !== 0 && value !== undefined

    return (
      <HStack key={path} justify="space-between" p={3} bg={isError ? "red.900" : "gray.800"} borderRadius="md" border={isError ? "1px solid" : "none"} borderColor={isError ? "red.500" : "transparent"}>
        <VStack align="start" spacing={1} flex="1">
          <HStack>
            <Text fontSize="sm" fontWeight="bold" color="white">
              {prop.name}
            </Text>
            <Badge size="sm" colorScheme={isWritable ? "green" : "gray"}>
              {isWritable ? "RW" : "RO"}
            </Badge>
            <Badge size="sm" colorScheme="blue">
              {valueType}
            </Badge>
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
            device.{path}
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
                    onClick={() => startEditing(path, displayValue)}
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
          const searchTerm = searchFilter.toLowerCase()
          if (
            prop.name.toLowerCase().includes(searchTerm) ||
            prop.description.toLowerCase().includes(searchTerm) ||
            propName.toLowerCase().includes(searchTerm) ||
            sectionName.toLowerCase().includes(searchTerm)
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
  }, [searchFilter, viewMode, odriveState])

  const errorCount = useMemo(() => {
    let count = 0
    Object.keys(odrivePropertyTree).forEach(sectionName => {
      if (hasError(sectionName)) count++
    })
    return count
  }, [odriveState])

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
            <Badge colorScheme="blue">
              {Object.keys(filteredTree).length} sections
            </Badge>
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
                        const fullPath = sectionName === 'system' ? propName : `${sectionName}.${propName}`
                        const value = getValueFromState(fullPath.replace('axis0.', 'axis0.'))
                        return renderProperty(prop, value, fullPath)
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