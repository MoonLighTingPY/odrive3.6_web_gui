import { 
  Box, 
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import PropertyTree from './property-tree/PropertyTree'
import LiveCharts from './LiveCharts'
import '../../../styles/InspectorTab.css'
import { useSelector } from 'react-redux'
import { useApiPropertyTree } from '../../../hooks/useApiPropertyTree'

const InspectorTab = ({ isConnected, odriveState }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedNodes, setExpandedNodes] = useState(new Set(['system', 'axis0']))
  
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const propertyTree = useApiPropertyTree()
  const { connectedDevice } = useSelector(s => s.device)

  return (
    <Box className="inspector-tab" h="100%" bg={bgColor}>
      {/* Header */}
      <VStack spacing={4} p={6} borderBottom="1px solid" borderColor={borderColor}>
        <HStack w="100%" justify="space-between" align="center">
          <VStack spacing={1} align="start">
            <Heading size="md" color="odrive.300">
              Inspector
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Explore ODrive properties and live telemetry
            </Text>
          </VStack>
          
          {/* Search */}
          <InputGroup maxW="20rem">
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.800"
              border="1px solid"
              borderColor="gray.600"
              _focus={{
                borderColor: 'odrive.300',
                boxShadow: '0 0 0 1px var(--chakra-colors-odrive-300)',
              }}
            />
          </InputGroup>
        </HStack>
      </VStack>

      {/* Main Content */}
      <Flex h="calc(100% - 8rem)" overflow="hidden">
        {/* Property Tree - 1/3 of screen */}
        <Box
          w="33.333%"
          minW="20rem"
          h="100%"
          borderRight="1px solid"
          borderColor={borderColor}
          bg="gray.800"
        >
          <PropertyTree
            searchTerm={searchTerm}
            expandedNodes={expandedNodes}
            setExpandedNodes={setExpandedNodes}
            isConnected={isConnected}
            odriveState={odriveState}
            propertyTree={propertyTree}
            deviceFwMajor={connectedDevice?.fw_version_major}
          />
        </Box>

        {/* Live Charts - 2/3 of screen */}
        <Box
          flex="1"
          h="100%"
          overflow="hidden"
        >
          <LiveCharts />
        </Box>
      </Flex>
    </Box>
  )
}

export default InspectorTab