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
  Select
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, RepeatIcon } from '@chakra-ui/icons'

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
  updateProperty
}) => {
  const [sliderValue, setSliderValue] = useState(value || 0)
  
  // Sync slider value with actual value when it changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setSliderValue(parseFloat(value) || 0)
    }
  }, [value])
  
  if (!prop || typeof prop !== 'object') {
    return (
      <Box key={displayPath} p={2} bg="red.900" borderRadius="md">
        <Text color="red.300" fontSize="sm">Invalid property: {displayPath}</Text>
      </Box>
    )
  }

  const displayValue = value !== undefined ? value : 'N/A'
  const isWritable = prop.writable || false
  const valueType = typeof value
  
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
  const isChartable = true
  const isCharted = selectedProperties.includes(displayPath)
  const propName = prop.name || displayPath.split('.').pop()
  const isSetpoint = prop.isSetpoint === true
  const shouldShowSlider = prop.hasSlider === true || isSetpoint
  
  // Check if this property should be a select
  const hasSelectOptions = prop.selectOptions && Array.isArray(prop.selectOptions) && prop.selectOptions.length > 0
  const shouldShowSelect = hasSelectOptions && isWritable

  const getSliderProps = () => {
    const min = prop.min !== undefined ? prop.min : -100
    const max = prop.max !== undefined ? prop.max : 100
    const step = prop.step !== undefined ? prop.step : 0.1
    
    return { min, max, step }
  }

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue)
  }

  const handleSliderChangeEnd = async (newValue) => {
    if (prop.writable && isConnected && updateProperty) {
      let formattedValue = newValue
      if (prop.decimals !== undefined) {
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

  const getSelectDisplayValue = () => {
    if (hasSelectOptions && value !== undefined) {
      const option = prop.selectOptions.find(opt => opt.value === value)
      return option ? option.label : String(value)
    }
    return String(displayValue)
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
                {valueType === 'boolean' ? (
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
                    w="120px"
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
                    type="number"
                    step={prop.step}
                    w="80px"
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
                    onFocus={(e) => e.target.select()}
                  />
                )}
                <IconButton
                  size="xs"
                  colorScheme="green"
                  icon={<CheckIcon />}
                  onClick={saveEdit}
                  isDisabled={!isConnected}
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
                  {value !== undefined 
                    ? (shouldShowSelect 
                        ? getSelectDisplayValue()
                        : (typeof displayValue === 'number' 
                            ? displayValue.toFixed(Math.min(prop.decimals || 2, 3))
                            : String(displayValue)))
                    : 'N/A'
                  }
                </Text>
                
                {/* Quick Select Dropdown for select properties */}
                {shouldShowSelect && isConnected && !isRefreshing && (
                  <Select
                    size="xs"
                    value={value ?? ''}
                    onChange={handleSelectChange}
                    w="100px"
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
                      // round initial editValue without limiting further precision
                      const initial = valueType === 'number'
                        ? // use prop.decimals for display rounding, default to 6
                          parseFloat(displayValue)
                            .toFixed(prop.decimals != null ? prop.decimals : 6)
                        : displayValue
                      startEditing(displayPath, initial)
                    }}
                  />
                )}
              </>
            )}
          </HStack>
        </HStack>

        {shouldShowSlider && isWritable && prop.type === 'number' && isConnected && !isEditing && !shouldShowSelect && (
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