import React, { useState, useCallback, useEffect, memo, useMemo } from 'react'
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
  Skeleton
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { odrivePropertyTree } from '../../../utils/odrivePropertyTree'
import { usePropertyRefresh } from '../../../hooks/property-tree/usePropertyRefresh'
import { usePropertyEditor } from '../../../hooks/property-tree/usePropertyEditor'
import { usePropertyTreeFilter } from '../../../hooks/property-tree/usePropertyTreeFilter'
import PropertyItem from './PropertyItem'
import { getFavourites } from '../../../utils/propertyFavourites'
import Observer from '@researchgate/react-intersection-observer'

const PropertyTree = ({ 
  odriveState, 
  searchFilter: initialSearchFilter, 
  setSearchFilter: setInitialSearchFilter, 
  updateProperty, 
  isConnected,
  selectedProperties = [],
  togglePropertyChart,
  refreshTrigger
}) => {
  const [collapsedSections, setCollapsedSections] = useState(new Set())
  const [favouritesVersion, setFavouritesVersion] = useState(0)
  const [searchFilter, setSearchFilter] = useState(initialSearchFilter)
  const [debouncedSearch, setDebouncedSearch] = useState(searchFilter)

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

  const { filteredTree } = usePropertyTreeFilter(odrivePropertyTree, debouncedSearch)

  // Refresh all properties when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && isConnected) {
      refreshAllProperties()
    }
  }, [refreshTrigger, isConnected, refreshAllProperties])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchFilter])

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

  // Create a simple SectionHeader component
  const SectionHeader = memo(({ name, section, sectionPath, count }) => (
    <Box
      bg="gray.700"
      borderRadius="md"
      p={3}
      mb={2}
      border="1px solid"
      borderColor="gray.600"
      cursor="pointer"
      onClick={() => toggleSection(sectionPath)}
      _hover={{ bg: "gray.650" }}
      transition="all 0.2s"
    >
      <HStack justify="space-between">
        <HStack spacing={2}>
          <Text fontWeight="bold" color="blue.300" fontSize="sm">
            {collapsedSections.has(sectionPath) ? '▶' : '▼'} {name}
          </Text>
          <Badge colorScheme="purple" variant="outline" size="xs">
            {count !== undefined ? count : collectAllProperties(section).length}
          </Badge>
        </HStack>
      </HStack>
      {!collapsedSections.has(sectionPath) && section.description && (
        <Text fontSize="xs" color="gray.400" mt={1}>
          {section.description}
        </Text>
      )}
    </Box>
  ))

  SectionHeader.displayName = 'SectionHeader'

  // Helper to get valid favourites using the filteredTree
  const getFilteredFavouritePaths = useCallback(() => {
    // Collect all property paths from filteredTree
    const collectPaths = (node, basePath = '') => {
      let paths = []
      if (node.properties) {
        Object.keys(node.properties).forEach(propName => {
          const fullPath = basePath ? `${basePath}.${propName}` : propName
          paths.push(fullPath)
        })
      }
      if (node.children) {
        Object.entries(node.children).forEach(([childName, childNode]) => {
          const childPath = basePath ? `${basePath}.${childName}` : childName
          paths = paths.concat(collectPaths(childNode, childPath))
        })
      }
      return paths
    }
    // Get all filtered property paths
    const filteredPaths = []
    Object.entries(filteredTree).forEach(([sectionName, section]) => {
      filteredPaths.push(...collectPaths(section, sectionName))
    })
    // Only keep favourites that match the filtered property paths
    return getFavourites().filter(path => filteredPaths.includes(path))
  }, [filteredTree])

  // Memoize favourite paths to prevent unnecessary recalculations
  const favouritePaths = useMemo(() => getFilteredFavouritePaths(), [getFilteredFavouritePaths, favouritesVersion])

  // Listen for changes to localStorage favourites and trigger re-render
  useEffect(() => {
    const handler = () => setFavouritesVersion(v => v + 1)
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Optimized callback that doesn't change reference
  const handleFavouriteChange = useCallback(() => setFavouritesVersion(v => v + 1), [])

  // Function to render a section recursively with collapsible subsections
  const renderSection = (section, sectionPath = '', depth = 0) => {
    const sectionItems = []
    
    // Render direct properties first
    if (section.properties) {
      Object.entries(section.properties).forEach(([propName, prop]) => {
        const displayPath = sectionPath ? `${sectionPath}.${propName}` : propName
        const value = getValueFromState(displayPath)
        
        sectionItems.push(
          <LazyItem>
            <PropertyItem
              key={displayPath} // STABLE KEY - no version suffix
              prop={prop}
              value={value}
              displayPath={displayPath}
              isEditing={editingProperty === displayPath}
              editValue={editValue}
              setEditValue={setEditValue}
              startEditing={startEditing}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              refreshProperty={refreshProperty}
              isConnected={isConnected}
              isRefreshing={refreshingProperties.has(displayPath)}
              selectedProperties={selectedProperties}
              togglePropertyChart={togglePropertyChart}
              updateProperty={updateProperty}
              onFavouriteChange={handleFavouriteChange}
              // REMOVE favouritesVersion prop - handle internally
            />
          </LazyItem>
        )
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

      {/* Property Tree - Takes remaining space */}
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
        <CardBody py={2} flex="1" minH="0" overflow="hidden" p={0}>
          <Box h="100%" overflowY="auto" px={4} py={2}>
            <VStack spacing={2} align="stretch">
              {/* Favourites Section */}
              <Box>
                <SectionHeader
                  name="Favourites"
                  section={{ name: "Favourites", description: "Your favourite properties" }}
                  sectionPath="favourites"
                  count={favouritePaths.length} // <-- add this prop
                />
                {!collapsedSections.has("favourites") && (
                  <VStack spacing={1} align="stretch" ml={2}>
                    {favouritePaths.map(path => {
                      // Find property node for display (search in odrivePropertyTree, not filteredTree)
                      const parts = path.split('.')
                      let node = odrivePropertyTree
                      let prop = null
                      // Traverse: first part is section, then properties/children
                      for (let i = 0; i < parts.length; i++) {
                        const part = parts[i]
                        if (i === 0 && node[part]) {
                          node = node[part]
                        } else if (node.properties && node.properties[part]) {
                          prop = node.properties[part]
                          node = prop
                        } else if (node.children && node.children[part]) {
                          node = node.children[part]
                        } else {
                          prop = null
                          break
                        }
                      }
                      return (
                        <LazyItem>
                          <PropertyItem
                            key={path} // STABLE KEY - no version suffix
                            prop={prop}
                            value={prop ? getValueFromState(path) : undefined}
                            displayPath={path}
                            isEditing={editingProperty === path}
                            editValue={editValue}
                            setEditValue={setEditValue}
                            startEditing={startEditing}
                            saveEdit={saveEdit}
                            cancelEdit={cancelEdit}
                            refreshProperty={refreshProperty}
                            isConnected={isConnected}
                            isRefreshing={refreshingProperties.has(path)}
                            selectedProperties={selectedProperties}
                            togglePropertyChart={togglePropertyChart}
                            updateProperty={updateProperty}
                            onFavouriteChange={handleFavouriteChange}
                            // REMOVE favouritesVersion prop
                          />
                        </LazyItem>
                      )
                    })}
                  </VStack>
                )}
              </Box>
              {/* Render other sections */}
              {Object.entries(filteredTree).map(([sectionName, section]) => (
                <Box key={sectionName}>
                  <SectionHeader
                    name={sectionName}
                    section={section}
                    sectionPath={sectionName}
                  />
                  {!collapsedSections.has(sectionName) && (
                    <VStack spacing={1} align="stretch" ml={2}>
                      {renderSection(section, sectionName)}
                    </VStack>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  )
}

const LazyItem = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const handleChange = ({ isIntersecting }) => {
    if (isIntersecting) setVisible(true)
  }
  return (
    <Observer onChange={handleChange} rootMargin="100px">
      <Box minHeight="42px">
        {visible ? children : <Skeleton height="38px" borderRadius="md" my={1} />}
      </Box>
    </Observer>
  )
}

export default PropertyTree