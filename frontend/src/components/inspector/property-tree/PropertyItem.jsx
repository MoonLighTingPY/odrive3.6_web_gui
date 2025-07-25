import React, { useState, useEffect, memo } from 'react'
import {
  HStack,
  VStack,
  Text,
  Box,
  Badge,
  IconButton,
  NumberInput,
  NumberInputField,
  Switch,
  Checkbox,
  Spinner,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  Input,
  Select,
  Tooltip
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons'
import { addFavourite, removeFavourite, isFavourite } from '../../../utils/propertyFavourites'

const PropertyItem = memo(({
  prop,
  value,
  displayPath,
  isEditing,
  editValue,
  setEditValue,
  startEditing,
  saveEdit,
  cancelEdit,
  refreshProperty,
  isConnected,
  isRefreshing,
  selectedProperties,
  togglePropertyChart,
  updateProperty,
  onFavouriteChange,
  favouritesVersion // <-- add this prop
}) => {
  const [sliderValue, setSliderValue] = useState(value || 0)
  const [favourite, setFavourite] = useState(isFavourite(displayPath))

  // Listen for favouriteChanged events for this path
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.path === displayPath) {
        setFavourite(e.detail.isFavourite)
      }
    }
    window.addEventListener('favouriteChanged', handler)
    return () => window.removeEventListener('favouriteChanged', handler)
  }, [displayPath])

  // Sync slider value with actual value when it changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setSliderValue(parseFloat(value) || 0)
    }
  }, [value])

  // Sync favourite state when displayPath or favouritesVersion changes
  useEffect(() => {
    setFavourite(isFavourite(displayPath))
  }, [displayPath, favouritesVersion])
  
  if (!prop || typeof prop !== 'object') {
    return (
      <Box key={displayPath} p={2} bg="red.900" borderRadius="md">
        <Text color="red.300" fontSize="sm">Invalid property: {displayPath}</Text>
      </Box>
    )
  }


  const isWritable = prop.writable || false
  const valueType = prop.valueType || 'Unknown'
  
  // Parse valueType to get the base type and constraints
  const getTypeInfo = (valueType) => {
    if (valueType.includes('BoolProperty')) {
      return { baseType: 'boolean', displayType: 'Bool' }
    } else if (valueType.includes('Float32Property')) {
      return { baseType: 'number', displayType: 'Float32', isFloat: true }
    } else if (valueType.includes('Int32Property')) {
      return { baseType: 'number', displayType: 'Int32', isInteger: true }
    } else if (valueType.includes('Uint32Property')) {
      return { baseType: 'number', displayType: 'UInt32', isInteger: true, isUnsigned: true }
    } else if (valueType.includes('Uint64Property')) {
      return { baseType: 'number', displayType: 'UInt64', isInteger: true, isUnsigned: true }
    } else if (valueType.includes('Uint16Property')) {
      return { baseType: 'number', displayType: 'UInt16', isInteger: true, isUnsigned: true }
    } else if (valueType.includes('Uint8Property')) {
      return { baseType: 'number', displayType: 'UInt8', isInteger: true, isUnsigned: true }
    } else if (valueType.includes('Int64Property')) {
      return { baseType: 'number', displayType: 'Int64', isInteger: true }
    } else if (valueType.includes('Property[')) {
      // Handle enum types like Property[ODrive.Controller.ControlMode]
      const enumMatch = valueType.match(/Property\[(.+)\]/)
      const enumType = enumMatch ? enumMatch[1].split('.').pop() : 'Enum'
      return { baseType: 'number', displayType: enumType, isEnum: true }
    } else {
      return { baseType: 'unknown', displayType: valueType }
    }
  }

  const typeInfo = getTypeInfo(valueType)
  
  const isActualError = (path, val) => {
    const errorRegisters = [
      '.error', 'axis_error', 'motor_error', 'encoder_error',
      'controller_error', 'sensorless_error'
    ]
    
    const configProperties = [
      'enable_overspeed_error', 'enable_current_limit_error', 
      'last_error_time', 'error_rate_ms'
    ]
    
    if (configProperties.some(config => path.includes(config))) {
      return false
    }
    
    return errorRegisters.some(errorReg => path.includes(errorReg)) && val !== 0 && val !== undefined
  }
  
  const isError = isActualError(displayPath, value)
  const isChartable = typeInfo.baseType === 'number' || typeInfo.baseType === 'boolean'
  const isCharted = selectedProperties.includes(displayPath)
  const propName = prop.name || displayPath.split('.').pop()
  const isSetpoint = prop.isSetpoint === true
  const shouldShowSlider = (prop.hasSlider === true || isSetpoint) && typeInfo.baseType === 'number'
  
  // Check if this property should be a select
  const hasSelectOptions = prop.selectOptions && Array.isArray(prop.selectOptions) && prop.selectOptions.length > 0
  const shouldShowSelect = hasSelectOptions && isWritable

  // Validate input based on type
  const validateInput = (inputValue) => {
    if (typeInfo.baseType === 'boolean') {
      return inputValue === 'true' || inputValue === 'false'
    } else if (typeInfo.baseType === 'number') {
      const num = parseFloat(inputValue)
      if (isNaN(num)) return false
      
      // Check integer constraints
      if (typeInfo.isInteger && !Number.isInteger(num)) return false
      
      // Check unsigned constraints
      if (typeInfo.isUnsigned && num < 0) return false
      
      // Check type-specific ranges
      if (typeInfo.displayType === 'UInt8' && (num < 0 || num > 255)) return false
      if (typeInfo.displayType === 'UInt16' && (num < 0 || num > 65535)) return false
      if (typeInfo.displayType === 'UInt32' && (num < 0 || num > 4294967295)) return false
      if (typeInfo.displayType === 'Int32' && (num < -2147483648 || num > 2147483647)) return false
      
      return true
    }
    return true
  }

  const formatValueForDisplay = (val) => {
    if (val === undefined || val === null) return 'N/A'
    
    if (typeInfo.baseType === 'boolean') {
      return val ? 'True' : 'False'
    } else if (typeInfo.baseType === 'number') {
      // For enum properties (both writable and read-only), show the label
      if (hasSelectOptions) {
        const option = prop.selectOptions.find(opt => opt.value === val)
        return option ? option.label : String(val)
      }
      
      // Ensure val is actually a number before calling toFixed
      const numVal = typeof val === 'number' ? val : parseFloat(val)
      if (isNaN(numVal)) {
        return String(val) // Return as string if not a valid number
      }
      
      if (typeInfo.isInteger) {
        return String(Math.round(numVal))
      } else if (typeInfo.isFloat) {
        const decimals = prop.decimals !== undefined ? prop.decimals : 3
        return numVal.toFixed(Math.min(decimals, 6))
      }
      return String(numVal)
    }
    return String(val)
  }

  const getSliderProps = () => {
    const min = prop.min !== undefined ? prop.min : -100
    const max = prop.max !== undefined ? prop.max : 100
    const step = prop.step !== undefined ? prop.step : (typeInfo.isInteger ? 1 : 0.1)
    
    return { min, max, step }
  }

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue)
  }

  const handleSliderChangeEnd = async (newValue) => {
    if (prop.writable && isConnected && updateProperty) {
      let formattedValue = newValue
      if (typeInfo.isInteger) {
        formattedValue = Math.round(newValue)
      } else if (prop.decimals !== undefined) {
        formattedValue = parseFloat(newValue.toFixed(prop.decimals))
      }
      
      let devicePath
      if (displayPath.startsWith('system.')) {
        const systemProp = displayPath.replace('system.', '')
        if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
             'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
          devicePath = `device.config.${systemProp}`
        } else {
          devicePath = `device.${systemProp}`
        }
      } else if (displayPath.startsWith('axis0.') || displayPath.startsWith('axis1.')) {
        devicePath = `device.${displayPath}`
      } else {
        devicePath = `device.${displayPath}`
      }
      
      try {
        await updateProperty(devicePath, formattedValue)
        await refreshProperty(displayPath)
      } catch (error) {
        console.error('Failed to update property via slider:', error)
        setSliderValue(parseFloat(value) || 0)
      }
    }
  }

  const handleZeroClick = async () => {
    setSliderValue(0)
    await handleSliderChangeEnd(0)
  }

  const handleSelectChange = async (e) => {
    const newValue = parseInt(e.target.value)
    
    if (prop.writable && isConnected && updateProperty) {
      let devicePath
      if (displayPath.startsWith('system.')) {
        const systemProp = displayPath.replace('system.', '')
        if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
             'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
          devicePath = `device.config.${systemProp}`
        } else {
          devicePath = `device.${systemProp}`
        }
      } else if (displayPath.startsWith('axis0.') || displayPath.startsWith('axis1.')) {
        devicePath = `device.${displayPath}`
      } else {
        devicePath = `device.${displayPath}`
      }
      
      try {
        await updateProperty(devicePath, newValue)
        await refreshProperty(displayPath)
      } catch (error) {
        console.error('Failed to update property via select:', error)
      }
    }
  }

  const isValidInput = editValue ? validateInput(editValue) : true



  const toggleFavourite = () => {
    let newState
    if (isFavourite(displayPath)) {
      removeFavourite(displayPath)
      setFavourite(false)
      newState = false
    } else {
      addFavourite(displayPath)
      setFavourite(true)
      newState = true
    }
    // Dispatch custom event for instant sync
    window.dispatchEvent(new CustomEvent('favouriteChanged', {
      detail: { path: displayPath, isFavourite: newState }
    }))
    if (onFavouriteChange) onFavouriteChange()
  }

  return (
    <Box
      bg={isError ? "red.900" : "gray.750"}
      borderRadius="md"
      border="1px solid"
      borderColor={isError ? "red.600" : "gray.600"}
      p={2}
      _hover={{ bg: isError ? "red.800" : "gray.700" }}
      transition="all 0.2s"
    >
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between" align="center" spacing={2}>
          <HStack spacing={2} flex="1" align="center" minW="0">
            <VStack align="start" spacing={0} flex="1" minW="0">
              <HStack spacing={2} align="center" w="100%">
                {isChartable && togglePropertyChart && (
                  <Checkbox
                    size="md"
                    colorScheme="blue"
                    isChecked={isCharted}
                    onChange={() => togglePropertyChart(displayPath)}
                  />
                )}
                
                <Badge size="xs" colorScheme={isWritable ? "green" : "gray"} variant="subtle">
                  {isWritable ? "RW" : "RO"}
                </Badge>
                
                <Tooltip label={`Type: ${valueType}`} placement="top">
                  <Badge size="xs" colorScheme="blue" variant="outline">
                    {typeInfo.displayType}
                  </Badge>
                </Tooltip>
                
                <Text 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  color="white" 
                  isTruncated
                  flex="1"
                >
                  {propName}
                </Text>
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
          
          <HStack spacing={1} minW="fit-content">
            {isEditing ? (
              <>
                {typeInfo.baseType === 'boolean' ? (
                  <Switch
                    size="sm"
                    isChecked={editValue === 'true'}
                    onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
                    colorScheme="blue"
                  />
                ) : shouldShowSelect ? (
                  <Select
                    size="sm"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    w="160px"
                    bg="gray.700"
                    color="white"
                    fontSize="xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        saveEdit()
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        cancelEdit()
                      }
                    }}
                  >
                    {prop.selectOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    size="sm"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    type={typeInfo.baseType === 'number' ? 'number' : 'text'}
                    step={typeInfo.isInteger ? 1 : (prop.step || 0.1)}
                    w="80px"
                    bg={isValidInput ? "gray.700" : "red.800"}
                    color="white"
                    fontSize="xs"
                    borderColor={isValidInput ? "gray.600" : "red.500"}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (isValidInput) saveEdit()
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        cancelEdit()
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                )}
                <IconButton
                  size="xs"
                  colorScheme="green"
                  icon={<CheckIcon />}
                  onClick={saveEdit}
                  isDisabled={!isConnected || !isValidInput}
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
                {/* Display value - show select label if applicable */}
                <Text 
                  fontSize="sm" 
                  fontFamily="mono" 
                  color={value !== undefined ? (isError ? "red.300" : "white") : "gray.500"}
                  fontWeight="semibold"
                  minW="60px"
                  textAlign="right"
                >
                  {formatValueForDisplay(value)}
                </Text>
                
                {/* Quick Select Dropdown for select properties - only show for writable */}
                {shouldShowSelect && isConnected && !isRefreshing && (
                  <Select
                    size="xs"
                    value={value ?? 0}
                    onChange={handleSelectChange}
                    w="140px"
                    bg="gray.700"
                    color="white"
                    fontSize="xs"
                    variant="filled"
                  >
                    {prop.selectOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                )}
                
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={isRefreshing ? <Spinner size="xs" /> : <RepeatIcon />}
                  onClick={() => refreshProperty(displayPath)}
                  isDisabled={!isConnected || isRefreshing}
                />
                
                {isWritable && isConnected && !shouldShowSelect && (
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<EditIcon />}
                    onClick={() => {
                      let initial
                      if (typeInfo.baseType === 'boolean') {
                        initial = value ? 'true' : 'false'
                      } else if (typeInfo.baseType === 'number') {
                        if (typeInfo.isInteger) {
                          initial = String(Math.round(value || 0))
                        } else {
                          const decimals = prop.decimals !== undefined ? prop.decimals : 6
                          initial = parseFloat(value || 0).toFixed(decimals)
                        }
                      } else {
                        initial = String(value || '')
                      }
                      startEditing(displayPath, initial)
                    }}
                  />
                )}
                <IconButton
                  size="xs"
                  variant={favourite ? "solid" : "ghost"}
                  colorScheme={favourite ? "yellow" : "gray"}
                  icon={<StarIcon />}
                  aria-label={favourite ? "Remove from favourites" : "Add to favourites"}
                  onClick={toggleFavourite}
                />
              </>
            )}
          </HStack>
        </HStack>

        {/* Type validation error message */}
        {isEditing && !isValidInput && (
          <Text fontSize="xs" color="red.300">
            Invalid {typeInfo.displayType} value
            {typeInfo.isUnsigned && ' (must be non-negative)'}
            {typeInfo.isInteger && ' (must be integer)'}
          </Text>
        )}

        {shouldShowSlider && isWritable && typeInfo.baseType === 'number' && isConnected && !isEditing && !shouldShowSelect && (
          <HStack spacing={2} w="100%">
            <Slider
              value={sliderValue}
              min={getSliderProps().min}
              max={getSliderProps().max}
              step={getSliderProps().step}
              onChange={handleSliderChange}
              onChangeEnd={handleSliderChangeEnd}
              colorScheme="blue"
              flex="1"
            >
              <SliderTrack bg="gray.600">
                <SliderFilledTrack bg="blue.400" />
              </SliderTrack>
              <SliderThumb boxSize={3} bg="blue.500" />
            </Slider>
            <Button
              size="xs"
              variant="outline"
              colorScheme="gray"
              onClick={handleZeroClick}
              minW="fit-content"
            >
              Zero
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  )
}, (prevProps, nextProps) => {
  // only re-compare editValue for the item that's editing
  const editValueSame = !nextProps.isEditing 
    || prevProps.editValue === nextProps.editValue

  return (
    prevProps.value === nextProps.value &&
    prevProps.isEditing === nextProps.isEditing &&
    editValueSame &&
    prevProps.isRefreshing === nextProps.isRefreshing &&
    prevProps.isConnected === nextProps.isConnected &&
    prevProps.selectedProperties.length === nextProps.selectedProperties.length &&
    prevProps.selectedProperties.every((p, i) => p === nextProps.selectedProperties[i])
  )
})

PropertyItem.displayName = 'PropertyItem'
export default PropertyItem