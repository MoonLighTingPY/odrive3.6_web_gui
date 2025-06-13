import React, { useState, useEffect } from 'react'
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
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, RepeatIcon } from '@chakra-ui/icons'

const PropertyItem = ({
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
  const isError = displayPath.includes('error') && value !== 0 && value !== undefined
  const isChartable = true // Make all properties chartable
  const isCharted = selectedProperties.includes(displayPath)
  const propName = prop.name || displayPath.split('.').pop()
  const isSetpoint = prop.isSetpoint === true
  const shouldShowSlider = prop.hasSlider === true || isSetpoint

  const getSliderProps = () => {
    const min = prop.min !== undefined ? prop.min : -100
    const max = prop.max !== undefined ? prop.max : 100
    const step = prop.step !== undefined ? prop.step : 0.1
    
    return { min, max, step }
  }

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue)
    // Only update local slider state during dragging, don't send to device yet
  }

  const handleSliderChangeEnd = async (newValue) => {
    // Update the property when slider drag ends
    if (prop.writable && isConnected && updateProperty) {
      let formattedValue = newValue
      if (prop.decimals !== undefined) {
        formattedValue = parseFloat(newValue.toFixed(prop.decimals))
      }
      
      // Convert display path to device path format for the API
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
      
      console.log(`Slider updating: ${devicePath} = ${formattedValue}`)
      try {
        await updateProperty(devicePath, formattedValue)
        // Refresh the property value after successful update
        await refreshProperty(displayPath)
      } catch (error) {
        console.error('Failed to update property via slider:', error)
        // Reset slider to previous value on error
        setSliderValue(parseFloat(value) || 0)
      }
    }
  }

  const handleZeroClick = async () => {
    setSliderValue(0)
    await handleSliderChangeEnd(0)
  }

  return (
    <Box
      key={displayPath}
      bg={isError ? "red.900" : "gray.750"}
      borderRadius="md"
      border="1px solid"
      borderColor={isError ? "red.600" : "gray.600"}
      p={2}
      _hover={{ bg: isError ? "red.800" : "gray.700" }}
      transition="all 0.2s"
    >
      <VStack spacing={2} align="stretch">
        {/* Top row */}
        <HStack justify="space-between" align="center" spacing={2}>
          {/* Left side - Compact property info */}
          <HStack spacing={2} flex="1" align="center" minW="0">
            <VStack align="start" spacing={0} flex="1" minW="0">
              <HStack spacing={2} align="center" w="100%">
                {/* Chart checkbox - more prominent position */}
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
          
          {/* Right side - Compact value and controls */}
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
                ) : (
                  <NumberInput
                    size="sm"
                    value={editValue}
                    onChange={setEditValue}
                    min={prop.min}
                    max={prop.max}
                    step={prop.step}
                    precision={prop.decimals}
                    w="80px"
                  >
                    <NumberInputField bg="gray.700" color="white" fontSize="xs" />
                  </NumberInput>
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
                <Text 
                  fontSize="sm" 
                  fontFamily="mono" 
                  color={value !== undefined ? (isError ? "red.300" : "white") : "gray.500"}
                  fontWeight="semibold"
                  minW="60px"
                  textAlign="right"
                >
                  {value !== undefined 
                    ? (typeof displayValue === 'number' 
                        ? displayValue.toFixed(Math.min(prop.decimals || 2, 3))
                        : String(displayValue))
                    : 'N/A'
                  }
                </Text>
                
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={isRefreshing ? <Spinner size="xs" /> : <RepeatIcon />}
                  onClick={() => refreshProperty(displayPath)}
                  isDisabled={!isConnected || isRefreshing}
                />
                
                {isWritable && isConnected && (
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<EditIcon />}
                    onClick={() => startEditing(displayPath, displayValue)}
                  />
                )}
              </>
            )}
          </HStack>
        </HStack>

        {/* Slider row for properties with hasSlider or isSetpoint */}
        {shouldShowSlider && isWritable && prop.type === 'number' && isConnected && !isEditing && (
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
}

export default PropertyItem