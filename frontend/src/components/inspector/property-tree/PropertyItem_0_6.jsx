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

const PropertyItem06 = memo(({
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
  firmware06 = true // Indicate this is 0.6.x variant
}) => {
  const [sliderValue, setSliderValue] = useState(value || 0)
  const [favourite, setFavourite] = useState(isFavourite(displayPath))

  // Listen for favouriteChanged events for this path
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.path === displayPath) {
        setFavourite(e.detail.isFavourite)
      }
    }
    
    window.addEventListener('favouriteChanged', handler)
    return () => window.removeEventListener('favouriteChanged', handler)
  }, [displayPath])

  // Update slider when value changes
  useEffect(() => {
    if (value !== undefined && value !== sliderValue) {
      setSliderValue(value)
    }
  }, [value, sliderValue])

  if (!prop) return null

  const handleFavouriteToggle = (e) => {
    e.stopPropagation()
    const newFavourite = !favourite
    
    if (newFavourite) {
      addFavourite(displayPath)
    } else {
      removeFavourite(displayPath)
    }
    
    setFavourite(newFavourite)
    onFavouriteChange?.()
  }

  const handleToggleChart = (e) => {
    e.stopPropagation()
    togglePropertyChart?.(displayPath)
  }

  const handleRefresh = (e) => {
    e.stopPropagation()
    refreshProperty(displayPath)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    startEditing(displayPath, value)
  }

  const handleSave = (e) => {
    e.stopPropagation()
    saveEdit()
  }

  const handleCancel = (e) => {
    e.stopPropagation()
    cancelEdit()
  }

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue)
    if (updateProperty) {
      updateProperty(displayPath, newValue)
    }
  }

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'null'
    if (typeof val === 'boolean') return val.toString()
    if (typeof val === 'number') {
      if (isNaN(val)) return 'NaN'
      if (!isFinite(val)) return val > 0 ? '+∞' : '-∞'
      // Format based on 0.6.x property precision
      if (prop.decimals !== undefined) {
        return val.toFixed(prop.decimals)
      }
      if (Math.abs(val) < 0.001 || Math.abs(val) > 1000) {
        return val.toExponential(3)
      }
      return val.toString()
    }
    if (typeof val === 'string') return val
    return JSON.stringify(val)
  }

  const getValueColor = (val) => {
    if (val === null || val === undefined) return 'gray.400'
    if (typeof val === 'boolean') return val ? 'green.300' : 'red.300'
    if (typeof val === 'number') {
      if (isNaN(val) || !isFinite(val)) return 'yellow.300'
      return 'blue.300'
    }
    if (typeof val === 'string') return 'purple.300'
    return 'gray.300'
  }

  const isSelected = selectedProperties?.includes(displayPath)
  const canEdit = prop.writable && isConnected
  const canChart = prop.type === 'number' && togglePropertyChart

  // 0.6.x specific property handling
  const is06Property = firmware06 && (
    displayPath.includes('harmonic_compensation') ||
    displayPath.includes('deskew') ||
    displayPath.includes('rs485_encoder') ||
    displayPath.includes('max_regen_current') ||
    displayPath.includes('init_pos') ||
    displayPath.includes('init_vel') ||
    displayPath.includes('init_torque') ||
    displayPath.includes('dI_dt_FF_enable') ||
    displayPath.includes('detailed_disarm_reason') ||
    displayPath.includes('can_data_baud_rate') ||
    displayPath.includes('passive_index_search')
  )

  const renderValueEditor = () => {
    if (!isEditing) return null

    switch (prop.type) {
      case 'boolean':
        return (
          <HStack spacing={2}>
            <Switch
              isChecked={editValue}
              onChange={(e) => setEditValue(e.target.checked)}
              colorScheme={firmware06 ? "green" : "blue"}
            />
            <IconButton
              icon={<CheckIcon />}
              size="xs"
              colorScheme="green"
              onClick={handleSave}
              aria-label="Save"
            />
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              colorScheme="red"
              onClick={handleCancel}
              aria-label="Cancel"
            />
          </HStack>
        )

      case 'number':
        if (prop.hasSlider && prop.min !== undefined && prop.max !== undefined) {
          return (
            <VStack spacing={1} align="stretch" minW="200px">
              <HStack spacing={2}>
                <NumberInput
                  value={editValue}
                  onChange={(valueString, valueNumber) => setEditValue(isNaN(valueNumber) ? 0 : valueNumber)}
                  size="xs"
                  min={prop.min}
                  max={prop.max}
                  step={prop.step || 0.1}
                  precision={prop.decimals || 2}
                  flex={1}
                >
                  <NumberInputField />
                </NumberInput>
                <IconButton
                  icon={<CheckIcon />}
                  size="xs"
                  colorScheme="green"
                  onClick={handleSave}
                  aria-label="Save"
                />
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  colorScheme="red"
                  onClick={handleCancel}
                  aria-label="Cancel"
                />
              </HStack>
              <Slider
                value={editValue}
                onChange={(value) => setEditValue(value)}
                min={prop.min}
                max={prop.max}
                step={prop.step || 0.1}
                colorScheme={firmware06 ? "green" : "blue"}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </VStack>
          )
        }
        
        return (
          <HStack spacing={2}>
            <NumberInput
              value={editValue}
              onChange={(valueString, valueNumber) => setEditValue(isNaN(valueNumber) ? 0 : valueNumber)}
              size="xs"
              min={prop.min}
              max={prop.max}
              step={prop.step || 0.1}
              precision={prop.decimals || 2}
            >
              <NumberInputField />
            </NumberInput>
            <IconButton
              icon={<CheckIcon />}
              size="xs"
              colorScheme="green"
              onClick={handleSave}
              aria-label="Save"
            />
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              colorScheme="red"
              onClick={handleCancel}
              aria-label="Cancel"
            />
          </HStack>
        )

      case 'string':
        return (
          <HStack spacing={2}>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              size="xs"
              maxW="200px"
            />
            <IconButton
              icon={<CheckIcon />}
              size="xs"
              colorScheme="green"
              onClick={handleSave}
              aria-label="Save"
            />
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              colorScheme="red"
              onClick={handleCancel}
              aria-label="Cancel"
            />
          </HStack>
        )

      default:
        if (prop.options) {
          return (
            <HStack spacing={2}>
              <Select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                size="xs"
                maxW="200px"
              >
                {prop.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <IconButton
                icon={<CheckIcon />}
                size="xs"
                colorScheme="green"
                onClick={handleSave}
                aria-label="Save"
              />
              <IconButton
                icon={<CloseIcon />}
                size="xs"
                colorScheme="red"
                onClick={handleCancel}
                aria-label="Cancel"
              />
            </HStack>
          )
        }
        
        return (
          <HStack spacing={2}>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              size="xs"
              maxW="200px"
            />
            <IconButton
              icon={<CheckIcon />}
              size="xs"
              colorScheme="green"
              onClick={handleSave}
              aria-label="Save"
            />
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              colorScheme="red"
              onClick={handleCancel}
              aria-label="Cancel"
            />
          </HStack>
        )
    }
  }

  return (
    <Box
      p={2}
      borderRadius="md"
      bg={isSelected ? "blue.900" : (is06Property ? "green.900" : "gray.700")}
      border={is06Property ? "1px solid" : "none"}
      borderColor={is06Property ? "green.400" : "transparent"}
      opacity={isRefreshing ? 0.6 : 1}
      _hover={{ bg: isSelected ? "blue.800" : (is06Property ? "green.800" : "gray.600") }}
      transition="all 0.2s"
    >
      <VStack spacing={2} align="stretch">
        {/* Header */}
        <HStack justify="space-between" spacing={2}>
          <HStack spacing={2} flex="1" minW="0">
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color="white"
              isTruncated
              title={displayPath}
            >
              {displayPath}
            </Text>
            
            {/* 0.6.x Feature Badge */}
            {is06Property && (
              <Badge colorScheme="green" variant="solid" fontSize="xs">
                0.6.x
              </Badge>
            )}
            
            {prop.writable && (
              <Badge colorScheme="orange" variant="outline" fontSize="xs">
                W
              </Badge>
            )}
            
            {prop.unit && (
              <Badge colorScheme="gray" variant="outline" fontSize="xs">
                {prop.unit}
              </Badge>
            )}
          </HStack>

          {/* Action Buttons */}
          <HStack spacing={1}>
            <IconButton
              icon={<StarIcon />}
              size="xs"
              variant={favourite ? "solid" : "ghost"}
              colorScheme="yellow"
              onClick={handleFavouriteToggle}
              aria-label={favourite ? "Remove from favourites" : "Add to favourites"}
            />
            
            {canChart && (
              <IconButton
                icon={<Box w={2} h={2} bg="currentColor" />}
                size="xs"
                variant={isSelected ? "solid" : "ghost"}
                colorScheme="purple"
                onClick={handleToggleChart}
                aria-label={isSelected ? "Remove from chart" : "Add to chart"}
              />
            )}
            
            <IconButton
              icon={isRefreshing ? <Spinner size="xs" /> : <RepeatIcon />}
              size="xs"
              variant="ghost"
              colorScheme="blue"
              onClick={handleRefresh}
              isDisabled={isRefreshing || !isConnected}
              aria-label="Refresh value"
            />
            
            {canEdit && !isEditing && (
              <IconButton
                icon={<EditIcon />}
                size="xs"
                variant="ghost"
                colorScheme="green"
                onClick={handleEdit}
                aria-label="Edit value"
              />
            )}
          </HStack>
        </HStack>

        {/* Description */}
        {prop.description && (
          <Text fontSize="xs" color="gray.400">
            {prop.description}
            {firmware06 && is06Property && " (Enhanced in 0.6.x)"}
          </Text>
        )}

        {/* Value Display/Editor */}
        <Box>
          {isEditing ? (
            renderValueEditor()
          ) : (
            <HStack justify="space-between" align="center">
              <Text
                fontSize="sm"
                color={getValueColor(value)}
                fontFamily="mono"
                wordBreak="break-all"
                flex="1"
              >
                {formatValue(value)}
              </Text>
              
              {/* Slider for numeric properties (read-only display) */}
              {prop.type === 'number' && 
               prop.hasSlider && 
               prop.min !== undefined && 
               prop.max !== undefined && 
               value !== undefined && 
               !isEditing && (
                <Box minW="100px" ml={2}>
                  <Slider
                    value={sliderValue}
                    onChange={handleSliderChange}
                    min={prop.min}
                    max={prop.max}
                    step={prop.step || 0.1}
                    colorScheme={firmware06 ? "green" : "blue"}
                    isDisabled={!canEdit}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
              )}
            </HStack>
          )}
        </Box>

        {/* 0.6.x specific additional info */}
        {firmware06 && is06Property && (
          <Text fontSize="xs" color="green.400" fontStyle="italic">
            ✨ This property has enhanced functionality in ODrive 0.6.x
          </Text>
        )}
      </VStack>
    </Box>
  )
})

PropertyItem06.displayName = 'PropertyItem06'

export default PropertyItem06