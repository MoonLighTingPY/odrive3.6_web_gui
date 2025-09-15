import {
  Box,
  VStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Icon,
  Badge,
  useColorModeValue
} from '@chakra-ui/react'
import { InfoIcon, SettingsIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import PropertyItem from './PropertyItem'

const PropertyTree = ({ 
  searchTerm, 
  expandedNodes, 
  setExpandedNodes, 
  isConnected,
  propertyTree
}) => {
  const { selectedProperties } = useSelector(state => state.telemetry)
  
  const hoverBg = useColorModeValue('gray.200', 'gray.700')

  const filterProperties = (properties, search) => {
    if (!search) return properties
    const filtered = {}
    Object.entries(properties).forEach(([key, prop]) => {
      if (
        key.toLowerCase().includes(search.toLowerCase()) ||
        prop.name?.toLowerCase().includes(search.toLowerCase()) ||
        prop.description?.toLowerCase().includes(search.toLowerCase())
      ) {
        filtered[key] = prop
      }
    })
    return filtered
  }

  const renderPropertySection = (sectionKey, section) => {
    if (!section.properties) return null
    
    const filteredProps = filterProperties(section.properties, searchTerm)
    if (Object.keys(filteredProps).length === 0 && searchTerm) return null

    const isExpanded = expandedNodes.has(sectionKey)
    const propertyCount = Object.keys(filteredProps).length
    const selectedCount = Object.keys(filteredProps).filter(key => 
      selectedProperties.includes(`${sectionKey}.${key}`)
    ).length

    return (
      <AccordionItem key={sectionKey} border="none">
        <AccordionButton
          p={3}
          _hover={{ bg: hoverBg }}
          onClick={() => {
            const newExpanded = new Set(expandedNodes)
            if (isExpanded) {
              newExpanded.delete(sectionKey)
            } else {
              newExpanded.add(sectionKey)
            }
            setExpandedNodes(newExpanded)
          }}
        >
          <HStack flex="1" spacing={3} align="center">
            <Icon 
              as={sectionKey.includes('axis') ? SettingsIcon : InfoIcon} 
              color="odrive.300" 
              boxSize={4}
            />
            <VStack spacing={0} align="start" flex="1">
              <Text 
                fontSize="sm" 
                fontWeight="medium" 
                color="white"
                textAlign="left"
              >
                {section.name || sectionKey}
              </Text>
              {section.description && (
                <Text 
                  fontSize="xs" 
                  color="gray.400" 
                  textAlign="left"
                  noOfLines={1}
                >
                  {section.description}
                </Text>
              )}
            </VStack>
            <HStack spacing={2}>
              {selectedCount > 0 && (
                <Badge colorScheme="green" size="sm">
                  {selectedCount}
                </Badge>
              )}
              <Badge variant="outline" size="sm">
                {propertyCount}
              </Badge>
            </HStack>
          </HStack>
          <AccordionIcon />
        </AccordionButton>
        
        <AccordionPanel p={0}>
          <VStack spacing={0} align="stretch">
            {Object.entries(filteredProps).map(([propKey, prop]) => (
              <PropertyItem
                key={propKey}
                propertyKey={propKey}
                property={prop}
                path={prop.path}   // use actual backend path
                isConnected={isConnected}
                searchTerm={searchTerm}
              />
            ))}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    )
  }

  return (
    <Box h="100%" overflow="hidden" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottom="1px solid" borderColor="gray.600">
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.300">
            Properties
          </Text>
          <Badge variant="outline" colorScheme="odrive">
            {selectedProperties.length} selected
          </Badge>
        </HStack>
      </Box>

      {/* Tree Content */}
      <Box flex="1" overflow="auto">
        <Accordion 
          allowMultiple 
          index={Array.from(expandedNodes).map(node => 
            Object.keys(propertyTree).indexOf(node)
          ).filter(i => i >= 0)}
        >
          {Object.entries(propertyTree).map(([sectionKey, section]) => 
            renderPropertySection(sectionKey, section)
          )}
        </Accordion>
      </Box>
    </Box>
  )
}

export default PropertyTree