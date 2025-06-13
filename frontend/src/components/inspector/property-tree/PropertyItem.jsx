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
  const isChartable = typeof value === 'number' && !prop?.name?.toLowerCase().includes('error')
  const isCharted = selectedProperties.includes(displayPath)
  const propName = prop.name || displayPath.split('.').pop()
  const isSetpoint = prop.isSetpoint === true

  const getSliderProps = () => {
    const min = prop.min !== undefined ? prop.min : -100
    const max = prop.max !== undefined ? prop.max : 100
    const step = prop.step !== undefined ? prop.step : 0.1
    
    return { min, max, step }
  }

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue)
    // Update the property immediately when slider changes
    if (prop.writable && isConnected && window.updateProperty) {
      let formattedValue = newValue
      if (prop.decimals !== undefined) {
        formattedValue = parseFloat(newValue.toFixed(prop.decimals))
      }
      window.updateProperty(displayPath, formattedValue)
    }
  }

  const handleZeroClick = () => {
    handleSliderChange(0)
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
            {isChartable && togglePropertyChart && (
              <Checkbox
                size="sm"
                colorScheme="blue"
                isChecked={isCharted}
                onChange={() => togglePropertyChart(displayPath)}
              />
            )}
            
            <VStack align="start" spacing={0} flex="1" minW="0">
              <HStack spacing={1} align="center" w="100%">
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

        {/* Slider row for setpoint properties */}
        {isSetpoint && isWritable && prop.type === 'number' && isConnected && !isEditing && (
          <HStack spacing={2} w="100%">
            <Slider
              value={sliderValue}
              min={getSliderProps().min}
              max={getSliderProps().max}
              step={getSliderProps().step}
              onChange={handleSliderChange}
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