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
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { usePropertyTreeFilter } from '../../../hooks/property-tree/usePropertyTreeFilter'
import { useVersionedUtils, getPropertyRefreshHook, getPropertyEditorHook } from '../../../utils/versionSelection'
import PropertyItem06 from './PropertyItem_0_6' // Import 0.6.x variant
import { getFavourites } from '../../../utils/propertyFavourites'
import Observer from '@researchgate/react-intersection-observer'

const PropertyTree06 = ({ 
  odriveState, 
  searchFilter: initialSearchFilter, 
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

  // Get firmware version info from Redux store - Force 0.6.x mode
  const { fw_is_0_6, fw_is_0_5, fw_version_string } = useSelector(state => state.device)
  
  // Force use 0.6.x utilities
  const { 
    propertyTree: selectedPropertyTree, 
    versionName 
  } = useVersionedUtils() // This will use fw_is_0_6 from Redux

  // Get 0.6.x specific hooks
  const usePropertyRefreshVersioned = getPropertyRefreshHook(true) // Force 0.6.x
  const usePropertyEditorVersioned = getPropertyEditorHook(true) // Force 0.6.x

  console.log(`PropertyTree06: Using ${versionName} property tree (fw: ${fw_version_string}) - 0.6.x variant`)

  // Function to collect all properties recursively from the tree structure (0.6.x specific)
  const collectAllProperties = useCallback((node, basePath = '') => {
    const properties = []
    
    // Add direct properties
    if (node.properties) {
      Object.entries(node.properties).forEach(([propName, prop]) => {
        const fullPath = basePath ? `${basePath}.${propName}` : propName
        properties.push({ path: fullPath, prop, propName })
      })
    }
    
    // Recursively add properties from children (0.6.x structure)
    if (node.children) {
      Object.entries(node.children).forEach(([childName, childNode]) => {
        const childPath = basePath ? `${basePath}.${childName}` : childName
        properties.push(...collectAllProperties(childNode, childPath))
      })
    }
    
    return properties
  }, [])

  // Custom hooks - using 0.6.x specific hooks
  const {
    refreshingProperties,
    propertyValues,
    refreshAllProperties,
    refreshProperty
  } = usePropertyRefreshVersioned(selectedPropertyTree, collectAllProperties, isConnected)

  const {
    editingProperty,
    editValue,
    setEditValue,
    startEditing,
    saveEdit,
    cancelEdit
  } = usePropertyEditorVersioned(updateProperty, refreshProperty)

  const { filteredTree } = usePropertyTreeFilter(selectedPropertyTree, debouncedSearch)

  // Refresh all properties when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && isConnected) {
      refreshAllProperties()
    }
  }, [refreshTrigger, isConnected, refreshAllProperties])

  // Refresh properties when firmware version changes (should auto-detect 0.6.x)
  useEffect(() => {
    if (isConnected && fw_is_0_6) {
      console.log('PropertyTree06: Refreshing properties for 0.6.x firmware')
      refreshAllProperties()
    }
  }, [fw_is_0_6, isConnected, refreshAllProperties])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchFilter])

  // Listen for favouriteChanged events
  useEffect(() => {
    const handleFavouriteChange = () => {
      setFavouritesVersion(prev => prev + 1)
    }
    
    window.addEventListener('favouriteChanged', handleFavouriteChange)
    return () => window.removeEventListener('favouriteChanged', handleFavouriteChange)
  }, [])

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

  const handleFavouriteChange = useCallback(() => {
    setFavouritesVersion(prev => prev + 1)
  }, [])

  // Get value from Redux state
  const getValueFromState = useCallback((path) => {
    return propertyValues[path]
  }, [propertyValues])

  // Get favourites (force refresh when version changes)
  const favouritePaths = useMemo(() => {
    // eslint-disable-next-line no-unused-vars
    const _ = favouritesVersion // Force re-computation
    return getFavourites()
  }, [favouritesVersion])

  // Lazy loading component for PropertyItem06
  const LazyItem = memo(({ children }) => {
    const [isInView, setIsInView] = useState(false)
    
    const handleChange = useCallback((event) => {
      if (event.isIntersecting) {
        setIsInView(true)
      }
    }, [])

    if (!isInView) {
      return (
        <Observer onChange={handleChange} rootMargin="200px 0px">
          <Box h="40px">
            <Skeleton height="32px" />
          </Box>
        </Observer>
      )
    }

    return children
  })

  // Section header component with 0.6.x specific styling
  const SectionHeader = memo(({ name, section, sectionPath, count }) => {
    const isCollapsed = collapsedSections.has(sectionPath)
    
    return (
      <HStack
        justify="space-between"
        p={2}
        bg="gray.700"
        borderRadius="md"
        cursor="pointer"
        onClick={() => toggleSection(sectionPath)}
        _hover={{ bg: "gray.600" }}
      >
        <HStack>
          <Heading size="sm" color="blue.300">
            {name} {section?.description && `- ${section.description}`}
          </Heading>
          {count !== undefined && (
            <Badge colorScheme="blue" variant="outline" fontSize="xs">
              {count}
            </Badge>
          )}
          <Badge colorScheme="green" variant="outline" fontSize="xs">
            0.6.x
          </Badge>
        </HStack>
        <Text fontSize="sm" color="gray.400">
          {isCollapsed ? '▶' : '▼'}
        </Text>
      </HStack>
    )
  })

  // Render properties recursively for 0.6.x
  const renderSection = useCallback((section, sectionPath = '') => {
    const sectionItems = []

    // First render properties
    if (section.properties) {
      Object.entries(section.properties).forEach(([propName, prop]) => {
        const displayPath = sectionPath ? `${sectionPath}.${propName}` : propName
        const value = getValueFromState(displayPath)
        
        sectionItems.push(
          <LazyItem key={displayPath}>
            <PropertyItem06
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
              // 0.6.x specific props
              firmware06={true}
            />
          </LazyItem>
        )
      })
    }
    
    // Then render child sections
    if (section.children) {
      Object.entries(section.children).forEach(([childName, childSection]) => {
        const childPath = sectionPath ? `${sectionPath}.${childName}` : childName
        sectionItems.push(
          <Box key={childPath} ml={4}>
            <SectionHeader
              name={childName}
              section={childSection}
              sectionPath={childPath}
              count={Object.keys(childSection.properties || {}).length}
            />
            {!collapsedSections.has(childPath) && (
              <Box ml={4}>
                {renderSection(childSection, childPath)}
              </Box>
            )}
          </Box>
        )
      })
    }

    return sectionItems
  }, [
    getValueFromState, 
    editingProperty, 
    editValue, 
    setEditValue, 
    startEditing, 
    saveEdit, 
    cancelEdit,
    refreshProperty, 
    isConnected, 
    refreshingProperties, 
    selectedProperties, 
    togglePropertyChart,
    updateProperty, 
    handleFavouriteChange, 
    collapsedSections
  ])

  if (!isConnected) {
    return (
      <Card bg="gray.800" h="100%">
        <CardBody>
          <Text color="gray.400" textAlign="center">
            Connect to an ODrive 0.6.x device to view properties
          </Text>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card bg="gray.800" h="100%">
      <CardHeader py={3}>
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <HStack>
              <Heading size="md" color="white">
                Property Tree (0.6.x)
              </Heading>
              <Badge colorScheme="green" variant="solid">
                ODrive 0.6.x
              </Badge>
            </HStack>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={refreshAllProperties}
              isLoading={refreshingProperties.size > 0}
              isDisabled={!isConnected}
            >
              Refresh All
            </Button>
          </HStack>

          {/* 0.6.x Feature Alert */}
          <Alert status="info" borderRadius="md" size="sm">
            <AlertIcon />
            <Text fontSize="sm">
              Using 0.6.x property tree with enhanced features: harmonic compensation, 
              de-skewing, RS485 encoders, and improved error reporting.
            </Text>
          </Alert>

          {/* Search Input */}
          <HStack>
            <SearchIcon color="gray.400" />
            <Input
              placeholder="Search 0.6.x properties..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              size="sm"
              bg="gray.700"
              borderColor="gray.600"
            />
          </HStack>
        </VStack>
      </CardHeader>
      <CardBody py={2} flex="1" minH="0" overflow="hidden" p={0}>
        <Box h="100%" overflowY="auto" px={4} py={2}>
          <VStack spacing={2} align="stretch">
            {/* Favourites Section */}
            <Box>
              <SectionHeader
                name="Favourites"
                section={{ name: "Favourites", description: "Your favourite 0.6.x properties" }}
                sectionPath="favourites"
                count={favouritePaths.length}
              />
              {!collapsedSections.has("favourites") && (
                <VStack spacing={1} align="stretch" ml={2}>
                  {favouritePaths.map(path => {
                    // Find property node for display (search in odrivePropertyTree06, not filteredTree)
                    const parts = path.split('.')
                    let node = selectedPropertyTree
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
                      <LazyItem key={path}>
                        <PropertyItem06
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
                          // 0.6.x specific props
                          firmware06={true}
                        />
                      </LazyItem>
                    )
                  })}
                  {favouritePaths.length === 0 && (
                    <Text fontSize="sm" color="gray.400" textAlign="center" py={2}>
                      No favourite 0.6.x properties yet. Click the star icon to add some!
                    </Text>
                  )}
                </VStack>
              )}
            </Box>

            {/* Main Property Tree Sections */}
            {filteredTree && Object.entries(filteredTree).map(([sectionName, section]) => (
              <Box key={sectionName}>
                <SectionHeader
                  name={sectionName}
                  section={section}
                  sectionPath={sectionName}
                  count={Object.keys(section.properties || {}).length}
                />
                {!collapsedSections.has(sectionName) && (
                  <Box ml={2}>
                    {renderSection(section, sectionName)}
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      </CardBody>
    </Card>
  )
}

export default memo(PropertyTree06)