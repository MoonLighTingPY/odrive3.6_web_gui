import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Button,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons'
import * as backend from '../../../../api/backend'
import { toggleProperty } from '../../../../store/slices/telemetrySlice'
import {
  getFavourites,
  addFavourite,
  removeFavourite,
  isFavourite,
} from '../../../../utils/property-tree/propertyTreeFavourites'
import PropertyItem from './PropertyItem'

// ---- pure tree helpers -----------------------------------------------------

function matchesSearch(prop, search) {
  const s = search.toLowerCase()
  return (
    prop.path?.toLowerCase().includes(s) ||
    prop.name?.toLowerCase().includes(s) ||
    prop.description?.toLowerCase().includes(s)
  )
}

// Prune a node to only the leaves (and ancestors) matching the search term.
function filterNode(node, search) {
  const properties = {}
  if (node.properties) {
    for (const [k, p] of Object.entries(node.properties)) {
      if (matchesSearch(p, search)) properties[k] = p
    }
  }
  const children = {}
  if (node.children) {
    for (const [k, child] of Object.entries(node.children)) {
      const fc = filterNode(child, search)
      if (Object.keys(fc.properties).length || Object.keys(fc.children).length) children[k] = fc
    }
  }
  return { ...node, properties, children }
}

function filterTree(tree, search) {
  if (!search) return tree
  const out = {}
  for (const [name, section] of Object.entries(tree)) {
    const fs = filterNode(section, search)
    if (Object.keys(fs.properties).length || Object.keys(fs.children).length) out[name] = fs
  }
  return out
}

function countLeaves(node) {
  let n = node.properties ? Object.keys(node.properties).length : 0
  if (node.children) for (const c of Object.values(node.children)) n += countLeaves(c)
  return n
}

function collectAllPaths(tree) {
  const out = []
  const walk = (node) => {
    if (node.properties) for (const p of Object.values(node.properties)) out.push(p.path)
    if (node.children) for (const c of Object.values(node.children)) walk(c)
  }
  for (const section of Object.values(tree)) walk(section)
  return out
}

// Leaf paths the user can actually see right now (their section + every ancestor
// is expanded) — these are the only ones we eagerly fetch values for.
function collectVisiblePaths(tree, expandedKeys, favouritePaths, favExpanded) {
  const out = []
  if (favExpanded) out.push(...favouritePaths)
  const walk = (node, key) => {
    if (!expandedKeys.has(key)) return
    if (node.properties) for (const p of Object.values(node.properties)) out.push(p.path)
    if (node.children) for (const [name, child] of Object.entries(node.children)) walk(child, `${key}.${name}`)
  }
  for (const [name, section] of Object.entries(tree)) walk(section, name)
  return out
}

function buildPathIndex(tree) {
  const index = {}
  const walk = (node) => {
    if (node.properties) for (const p of Object.values(node.properties)) index[p.path] = p
    if (node.children) for (const c of Object.values(node.children)) walk(c)
  }
  for (const section of Object.values(tree)) walk(section)
  return index
}

const cleanValue = (v) => (v && typeof v === 'object' && 'error' in v ? undefined : v)

// ---- component -------------------------------------------------------------

const PropertyTree = ({ propertyTree, searchTerm = '', isConnected, serial, updateProperty }) => {
  const dispatch = useDispatch()
  const selectedProperties = useSelector((s) => s.telemetry.selectedProperties)

  const [search, setSearch] = useState(searchTerm)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
  const [expandedKeys, setExpandedKeys] = useState(() => new Set(['favourites', 'system', 'axis0']))
  const [propertyValues, setPropertyValues] = useState({})
  const [refreshing, setRefreshing] = useState(() => new Set())
  const [favouritesVersion, setFavouritesVersion] = useState(0)

  const valuesRef = useRef(propertyValues)
  valuesRef.current = propertyValues

  // Debounce the search box so we don't refilter the whole tree on each keypress.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  // Reset cached values when the device changes.
  useEffect(() => {
    setPropertyValues({})
  }, [serial])

  const pathIndex = useMemo(() => buildPathIndex(propertyTree), [propertyTree])
  const filteredTree = useMemo(() => filterTree(propertyTree, debouncedSearch), [propertyTree, debouncedSearch])
  const filteredPathSet = useMemo(() => new Set(collectAllPaths(filteredTree)), [filteredTree])

  const selectedSet = useMemo(() => new Set(selectedProperties), [selectedProperties])
  const favSet = useMemo(() => {
    void favouritesVersion // recompute when favourites change
    return new Set(getFavourites())
  }, [favouritesVersion])
  const favouritePaths = useMemo(() => {
    const all = getFavourites().filter((p) => pathIndex[p])
    return debouncedSearch ? all.filter((p) => filteredPathSet.has(p)) : all
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathIndex, debouncedSearch, filteredPathSet, favouritesVersion])

  const isExpanded = useCallback(
    (key) => (debouncedSearch ? true : expandedKeys.has(key)),
    [debouncedSearch, expandedKeys]
  )

  const toggleSection = useCallback((key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const refreshPaths = useCallback(
    async (paths) => {
      if (!serial || !paths.length) return
      try {
        const data = await backend.readProperties(serial, paths)
        setPropertyValues((prev) => {
          const next = { ...prev }
          for (const p of paths) next[p] = cleanValue(data[p])
          return next
        })
      } catch {
        // Mark as attempted (undefined) so we don't hammer a failing path.
        setPropertyValues((prev) => {
          const next = { ...prev }
          for (const p of paths) if (!(p in next)) next[p] = undefined
          return next
        })
      }
    },
    [serial]
  )

  const refreshProperty = useCallback(
    async (path) => {
      if (!serial) return
      setRefreshing((prev) => new Set(prev).add(path))
      try {
        const data = await backend.readProperties(serial, [path])
        setPropertyValues((prev) => ({ ...prev, [path]: cleanValue(data[path]) }))
      } finally {
        setRefreshing((prev) => {
          const next = new Set(prev)
          next.delete(path)
          return next
        })
      }
    },
    [serial]
  )

  const onWrite = useCallback(
    async (path, value) => {
      await updateProperty(path, value)
      await refreshProperty(path)
    },
    [updateProperty, refreshProperty]
  )

  const handleToggleChart = useCallback((path) => dispatch(toggleProperty(path)), [dispatch])

  const toggleFav = useCallback((path) => {
    if (isFavourite(path)) removeFavourite(path)
    else addFavourite(path)
    setFavouritesVersion((v) => v + 1)
  }, [])

  // Lazily fetch values for the currently-visible properties.
  useEffect(() => {
    if (!isConnected || !serial) return undefined
    const visible = debouncedSearch
      ? collectAllPaths(filteredTree)
      : collectVisiblePaths(filteredTree, expandedKeys, favouritePaths, expandedKeys.has('favourites'))
    const missing = visible.filter((p) => !(p in valuesRef.current))
    if (!missing.length) return undefined
    const t = setTimeout(() => refreshPaths(missing), 120)
    return () => clearTimeout(t)
  }, [filteredTree, expandedKeys, debouncedSearch, isConnected, serial, favouritePaths, refreshPaths])

  const handleRefreshVisible = useCallback(() => {
    const visible = debouncedSearch
      ? collectAllPaths(filteredTree)
      : collectVisiblePaths(filteredTree, expandedKeys, favouritePaths, expandedKeys.has('favourites'))
    refreshPaths(visible)
  }, [debouncedSearch, filteredTree, expandedKeys, favouritePaths, refreshPaths])

  const renderItem = useCallback(
    (prop) => (
      <PropertyItem
        key={prop.path}
        prop={prop}
        displayPath={prop.path}
        value={propertyValues[prop.path]}
        isConnected={isConnected}
        isRefreshing={refreshing.has(prop.path)}
        isCharted={selectedSet.has(prop.path)}
        isFav={favSet.has(prop.path)}
        onToggleChart={handleToggleChart}
        onRefresh={refreshProperty}
        onWrite={onWrite}
        onToggleFav={toggleFav}
      />
    ),
    [propertyValues, isConnected, refreshing, selectedSet, favSet, handleToggleChart, refreshProperty, onWrite, toggleFav]
  )

  const renderSectionHeader = ({ name, sectionKey, count, description }) => (
    <Box
      bg="gray.700"
      borderRadius="md"
      p={2}
      border="1px solid"
      borderColor="gray.600"
      cursor="pointer"
      onClick={() => toggleSection(sectionKey)}
      _hover={{ bg: 'gray.650' }}
      transition="background 0.15s"
    >
      <HStack justify="space-between">
        <HStack spacing={2}>
          <Text fontWeight="bold" color="blue.300" fontSize="sm">
            {isExpanded(sectionKey) ? '▼' : '▶'} {name}
          </Text>
          <Badge colorScheme="purple" variant="outline" fontSize="0.6rem">
            {count}
          </Badge>
        </HStack>
      </HStack>
      {isExpanded(sectionKey) && description && (
        <Text fontSize="xs" color="gray.400" mt={1}>{description}</Text>
      )}
    </Box>
  )

  const renderNode = (node, nodeKey, depth = 0) => {
    if (!isExpanded(nodeKey)) return null
    const props = node.properties ? Object.values(node.properties) : []
    const childEntries = node.children ? Object.entries(node.children) : []
    return (
      <VStack spacing={1} align="stretch" pl={depth > 0 ? 2 : 0}>
        {props.map(renderItem)}
        {childEntries.map(([childName, child]) => {
          const childKey = `${nodeKey}.${childName}`
          return (
            <Box key={childKey}>
              {renderSectionHeader({
                name: child.name || childName,
                sectionKey: childKey,
                count: countLeaves(child),
                description: child.description,
              })}
              {isExpanded(childKey) && <Box mt={1}>{renderNode(child, childKey, depth + 1)}</Box>}
            </Box>
          )
        })}
      </VStack>
    )
  }

  const loadedCount = Object.keys(propertyValues).length

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Search */}
      <Card bg="gray.800" variant="elevated" flexShrink={0} mb={3}>
        <CardBody py={2}>
          <HStack spacing={2}>
            <SearchIcon color="gray.400" boxSize={4} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
              bg="gray.700"
              border="1px solid"
              borderColor="gray.600"
              color="white"
              size="sm"
              flex="1"
            />
            {search && (
              <Button size="xs" onClick={() => setSearch('')}>Clear</Button>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Tree */}
      <Card bg="gray.800" variant="elevated" flex="1" minH="0" display="flex" flexDirection="column" overflow="hidden">
        <CardHeader py={2} flexShrink={0}>
          <HStack justify="space-between">
            <Heading size="sm" color="white">ODrive Properties</Heading>
            <HStack spacing={2}>
              <Badge colorScheme="green" fontSize="0.6rem">{loadedCount} loaded</Badge>
              <Tooltip label="Refresh visible values">
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Refresh visible"
                  icon={<RepeatIcon />}
                  onClick={handleRefreshVisible}
                  isDisabled={!isConnected}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody py={2} flex="1" minH="0" overflow="hidden" p={0}>
          <Box h="100%" overflowY="auto" px={3} py={2}>
            <VStack spacing={2} align="stretch">
              {/* Favourites */}
              <Box>
                {renderSectionHeader({
                  name: 'Favourites',
                  sectionKey: 'favourites',
                  count: favouritePaths.length,
                  description: 'Your starred properties',
                })}
                {isExpanded('favourites') && (
                  <VStack spacing={1} align="stretch" pl={2} mt={1}>
                    {favouritePaths.length === 0 ? (
                      <Text fontSize="xs" color="gray.500" px={2} py={1}>No favourites yet — star a property to pin it here.</Text>
                    ) : (
                      favouritePaths.map((p) => (pathIndex[p] ? renderItem(pathIndex[p]) : null))
                    )}
                  </VStack>
                )}
              </Box>

              {/* Sections */}
              {Object.entries(filteredTree).map(([name, section]) => (
                <Box key={name}>
                  {renderSectionHeader({
                    name: section.name || name,
                    sectionKey: name,
                    count: countLeaves(section),
                    description: section.description,
                  })}
                  {isExpanded(name) && <Box mt={1}>{renderNode(section, name)}</Box>}
                </Box>
              ))}

              {Object.keys(filteredTree).length === 0 && (
                <Text fontSize="sm" color="gray.500" px={2} py={4} textAlign="center">
                  No properties match “{debouncedSearch}”.
                </Text>
              )}
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  )
}

export default PropertyTree
