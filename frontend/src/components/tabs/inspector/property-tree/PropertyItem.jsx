import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Switch,
  NumberInput,
  NumberInputField,
  Select,
  Badge,
  Tooltip,
  Input,
  Button,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { 
  StarIcon, 
  RepeatIcon, 
  ViewIcon, 
  ViewOffIcon 
} from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addProperty, removeProperty } from '../../../../store/slices/telemetrySlice'
import { 
  isFavourite, 
  addFavourite, 
  removeFavourite 
} from '../../../../utils/property-tree/propertyTreeFavourites'

const PropertyItem = ({ 
  propertyKey, 
  property, 
  path, 
  isConnected, 
  searchTerm 
}) => {
  const dispatch = useDispatch()
  const toast = useToast()
  const { selectedProperties, samples } = useSelector(state => state.telemetry)
  const { connectedDevice } = useSelector(state => state.device)
  
  const [isFav, setIsFav] = useState(false)
  const [currentValue, setCurrentValue] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [localValue, setLocalValue] = useState('')

  const bgColor = useColorModeValue('gray.50', 'gray.750')
  const hoverBg = useColorModeValue('gray.100', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const isSelected = selectedProperties.includes(path)
  const isWritable = property.writable !== false
  const latestSample = samples[path]?.[samples[path].length - 1]

  useEffect(() => {
    setIsFav(isFavourite(path))
  }, [path])

  useEffect(() => {
    if (latestSample) {
      setCurrentValue(latestSample.v)
      setLocalValue(String(latestSample.v))
    }
  }, [latestSample])

  const handleToggleFavourite = () => {
    if (isFav) {
      removeFavourite(path)
      setIsFav(false)
    } else {
      addFavourite(path)
      setIsFav(true)
    }
  }

  const handleToggleTelemetry = () => {
    if (isSelected) {
      dispatch(removeProperty(path))
    } else {
      dispatch(addProperty(path))
    }
  }

  const handleRefresh = async () => {
    if (!isConnected || !connectedDevice) return
    
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/devices/${connectedDevice.serial_number}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: [path] })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data[path] !== undefined) {
          setCurrentValue(data[path])
          setLocalValue(String(data[path]))
        }
      }
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleWrite = async () => {
    if (!isConnected || !connectedDevice || !isWritable) return
    
    try {
      let value = localValue
      if (property.type === 'number') {
        value = parseFloat(localValue)
        if (isNaN(value)) return
      } else if (property.type === 'boolean') {
        value = localValue === 'true'
      }

      const response = await fetch(`/api/devices/${connectedDevice.serial_number}/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [{ path, value }]
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const result = data[0]
        if (result.status === 'ok') {
          setCurrentValue(value)
          toast({
            title: 'Value updated',
            status: 'success',
            duration: 2000,
          })
        } else {
          toast({
            title: 'Write failed',
            description: result.error,
            status: 'error',
            duration: 3000,
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Write failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const renderValueInput = () => {
    if (!isWritable) {
      return (
        <Text 
          fontSize="xs" 
          fontFamily="mono" 
          color="gray.300"
          minW="4rem"
          textAlign="right"
        >
          {currentValue !== null ? String(currentValue) : '—'}
        </Text>
      )
    }

    switch (property.type) {
      case 'boolean':
        return (
          <Switch
            size="sm"
            isChecked={localValue === 'true'}
            onChange={(e) => {
              const newValue = e.target.checked ? 'true' : 'false'
              setLocalValue(newValue)
              if (isConnected) handleWrite()
            }}
            colorScheme="odrive"
          />
        )
      
      case 'number':
        return (
          <NumberInput
            size="xs"
            w="5rem"
            value={localValue}
            onChange={setLocalValue}
            onBlur={handleWrite}
            onKeyPress={(e) => e.key === 'Enter' && handleWrite()}
          >
            <NumberInputField 
              fontSize="xs" 
              fontFamily="mono"
              textAlign="right"
            />
          </NumberInput>
        )
      
      default:
        if (property.selectOptions) {
          return (
            <Select
              size="xs"
              w="6rem"
              value={localValue}
              onChange={(e) => {
                setLocalValue(e.target.value)
                if (isConnected) handleWrite()
              }}
              fontSize="xs"
            >
              {property.selectOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          )
        }
        
        return (
          <Input
            size="xs"
            w="5rem"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleWrite}
            onKeyPress={(e) => e.key === 'Enter' && handleWrite()}
            fontSize="xs"
            fontFamily="mono"
            textAlign="right"
          />
        )
    }
  }

  const highlightText = (text, search) => {
    if (!search) return text
    const regex = new RegExp(`(${search})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) => 
      regex.test(part) ? 
        <span key={i} className="search-highlight">{part}</span> : 
        part
    )
  }

  return (
    <Box
      p={3}
      borderBottom="1px solid"
      borderColor={borderColor}
      _hover={{ bg: hoverBg }}
      bg={isSelected ? 'rgba(99, 179, 237, 0.1)' : bgColor}
    >
      <HStack spacing={2} align="start">
        {/* Property Info */}
        <VStack spacing={1} align="start" flex="1" minW="0">
          <HStack spacing={2} w="100%">
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color="white"
              noOfLines={1}
            >
              {highlightText(property.name || propertyKey, searchTerm)}
            </Text>
            <HStack spacing={1} ml="auto">
              <Badge 
                size="xs" 
                colorScheme={isWritable ? 'green' : 'gray'} 
                variant="outline"
              >
                {isWritable ? 'RW' : 'RO'}
              </Badge>
              {property.valueType && (
                <Badge size="xs" variant="outline">
                  {property.valueType.replace('Property', '')}
                </Badge>
              )}
            </HStack>
          </HStack>
          
          <Text 
            fontSize="xs" 
            color="gray.400" 
            fontFamily="mono"
            noOfLines={1}
          >
            {path}
          </Text>
          
          {property.description && (
            <Text 
              fontSize="xs" 
              color="gray.500"
              noOfLines={2}
            >
              {highlightText(property.description, searchTerm)}
            </Text>
          )}
        </VStack>

        {/* Value Input */}
        <Box minW="5rem">
          {renderValueInput()}
        </Box>

        {/* Controls */}
        <HStack spacing={1}>
          <Tooltip label="Refresh value">
            <IconButton
              size="xs"
              variant="ghost"
              icon={<RepeatIcon />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
              isDisabled={!isConnected}
              aria-label="Refresh"
            />
          </Tooltip>
          
          <Tooltip label={isSelected ? "Remove from charts" : "Add to charts"}>
            <IconButton
              size="xs"
              variant="ghost"
              icon={isSelected ? <ViewOffIcon /> : <ViewIcon />}
              onClick={handleToggleTelemetry}
              colorScheme={isSelected ? 'red' : 'odrive'}
              aria-label="Toggle telemetry"
            />
          </Tooltip>
          
          <Tooltip label={isFav ? "Remove from favourites" : "Add to favourites"}>
            <IconButton
              size="xs"
              variant="ghost"
              icon={<StarIcon />}
              onClick={handleToggleFavourite}
              color={isFav ? 'yellow.400' : 'gray.400'}
              aria-label="Toggle favourite"
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Box>
  )
}

export default PropertyItem