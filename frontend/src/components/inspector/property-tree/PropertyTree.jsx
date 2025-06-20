import React, { useState, useCallback, useEffect, memo } from 'react'
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
  Badge,
  Button,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { odrivePropertyTree } from '../../../utils/odrivePropertyTree'
import { usePropertyRefresh } from '../../../hooks/property-tree/usePropertyRefresh'
import { usePropertyEditor } from '../../../hooks/property-tree/usePropertyEditor'
import { usePropertyTreeFilter } from '../../../hooks/property-tree/usePropertyTreeFilter'
import { useFlattenedProperties } from '../../../hooks/property-tree/useFlattenedProperties'
import VirtualizedPropertyTree from './VirtualizedPropertyTree'

const PropertyTree = memo(({ 
  odriveState, 
  searchFilter, 
  setSearchFilter, 
  updateProperty, 
  isConnected,
  selectedProperties = [],
  togglePropertyChart,
  refreshTrigger
}) => {
  const [collapsedSections, setCollapsedSections] = useState(new Set())

  // Function to collect all properties recursively from the tree structure
  const collectAllProperties = useCallback((node, basePath = '') => {
    const properties = []
    
    if (node.properties) {
      Object.entries(node.properties).forEach(([propName, prop]) => {
        const fullPath = basePath ? `${basePath}.${propName}` : propName
        properties.push({ path: fullPath, prop, propName })
      })
    }
    
    if (node.children) {
      Object.entries(node.children).forEach(([childName, childNode]) => {
        const childPath = basePath ? `${basePath}.${childName}` : childName
        properties.push(...collectAllProperties(childNode, childPath))
      })
    }
    
    return properties
  }, [])

  // Custom hooks
  const {
    refreshingProperties,
    propertyValues,
    refreshAllProperties,
    refreshProperty
  } = usePropertyRefresh(odrivePropertyTree, collectAllProperties, isConnected)

  const {
    editingProperty,
    editValue,
    setEditValue,
    startEditing,
    saveEdit,
    cancelEdit
  } = usePropertyEditor(updateProperty, refreshProperty)

  const { filteredTree } = usePropertyTreeFilter(odrivePropertyTree, searchFilter)

  // Get value from state with optimized lookup
  const getValueFromState = useCallback((path) => {
    if (propertyValues[path] !== undefined) {
      return propertyValues[path]
    }
    
    if (!odriveState?.device) {
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
      if (current?.[part] !== undefined) {
        current = current[part]
      } else {
        return undefined
      }
    }
    
    return current
  }, [odriveState, propertyValues])

  // Flatten properties for virtual scrolling
  const flattenedItems = useFlattenedProperties(filteredTree, collapsedSections, getValueFromState)

  // Toggle section collapsed state
  const toggleSection = useCallback((sectionPath) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionPath)) {
        newSet.delete(sectionPath)
      } else {
        newSet.add(sectionPath)
      }
      return newSet
    })
  }, [])

  // Refresh all properties when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && isConnected) {
      refreshAllProperties()
    }
  }, [refreshTrigger, isConnected, refreshAllProperties])

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Search Controls - Fixed height */}
      <Card bg="gray.800" variant="elevated" flexShrink={0} mb={3}>
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

      {/* Property Tree - Takes remaining space with virtual scrolling */}
      <Card 
        bg="gray.800" 
        variant="elevated" 
        flex="1" 
        minH="0" 
        display="flex" 
        flexDirection="column"
        overflow="hidden"
      >
        <CardHeader py={2} flexShrink={0}>
          <HStack justify="space-between">
            <Heading size="sm" color="white">ODrive Properties</Heading>
            <HStack spacing={1}>
              <Badge colorScheme="green" size="sm">
                {Object.values(propertyValues).length} loaded
              </Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody py={0} flex="1" minH="0" overflow="hidden" p={0}>
          <VirtualizedPropertyTree
            flattenedItems={flattenedItems}
            height={window.innerHeight - 300} // Adjust based on your layout
            editingProperty={editingProperty}
            editValue={editValue}
            setEditValue={setEditValue}
            startEditing={startEditing}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            refreshProperty={refreshProperty}
            isConnected={isConnected}
            refreshingProperties={refreshingProperties}
            selectedProperties={selectedProperties}
            togglePropertyChart={togglePropertyChart}
            updateProperty={updateProperty}
            toggleSection={toggleSection}
          />
        </CardBody>
      </Card>
    </Box>
  )
})

PropertyTree.displayName = 'PropertyTree'
export default PropertyTree