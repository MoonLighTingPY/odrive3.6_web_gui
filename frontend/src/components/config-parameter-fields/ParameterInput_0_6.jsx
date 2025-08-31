import React, { useState, useEffect, useCallback } from 'react'
import {
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  HStack,
  IconButton,
  Text,
  Tooltip,
  Badge,
  Box,
} from '@chakra-ui/react'
import { RepeatIcon, InfoIcon } from '@chakra-ui/icons'
import { formatSafeValue } from '../../utils/valueHelpers'

const ParameterInput06 = ({
  label,
  configKey,
  value,
  onChange,
  onRefresh,
  unit = '',
  min,
  max,
  step = 0.1,
  precision = 3,
  isLoading = false,
  isDisabled = false,
  isReadOnly = false,
  helperText = '',
  width = '100%',
  parameterPath = '',
  format = 'decimal', // 'decimal', 'hex', 'binary'
  firmware06 = true, // Indicate this is 0.6.x variant
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)

  // Sync local value with prop value when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value)
    }
  }, [value, isFocused])

  const handleChange = useCallback((valueString, valueNumber) => {
    const newValue = isNaN(valueNumber) ? valueString : valueNumber
    setLocalValue(newValue)
    
    if (onChange) {
      onChange(configKey, newValue)
    }
  }, [configKey, onChange])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Ensure the final value is committed on blur
    if (onChange && localValue !== value) {
      onChange(configKey, localValue)
    }
  }, [configKey, onChange, localValue, value])

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh()
    }
  }, [onRefresh])

  const formatDisplayValue = useCallback((val) => {
    if (format === 'hex') {
      const num = typeof val === 'number' ? val : parseFloat(val)
      if (isNaN(num)) return val
      return `0x${Math.floor(num).toString(16).toUpperCase()}`
    }
    if (format === 'binary') {
      const num = typeof val === 'number' ? val : parseFloat(val)
      if (isNaN(num)) return val
      return `0b${Math.floor(num).toString(2)}`
    }
    return formatSafeValue(val, precision)
  }, [format, precision])

  // Check if this is a 0.6.x enhanced parameter
  const is06Parameter = firmware06 && (
    configKey?.includes('init_pos') ||
    configKey?.includes('init_vel') ||
    configKey?.includes('init_torque') ||
    configKey?.includes('max_regen_current') ||
    configKey?.includes('dI_dt_FF_enable') ||
    configKey?.includes('harmonic_compensation') ||
    configKey?.includes('deskew') ||
    configKey?.includes('can_data_baud_rate') ||
    configKey?.includes('input_vel_scale') ||
    configKey?.includes('input_torque_scale') ||
    configKey?.includes('inc_encoder_filter') ||
    configKey?.includes('passive_index_search')
  )

  const inputProps = {
    value: formatDisplayValue(localValue),
    onChange: (valueString, valueNumber) => {
      if (format === 'hex') {
        // Handle hex input
        const hexValue = valueString.replace(/^0x/i, '')
        const numValue = parseInt(hexValue, 16)
        handleChange(isNaN(numValue) ? 0 : numValue, numValue)
      } else if (format === 'binary') {
        // Handle binary input
        const binValue = valueString.replace(/^0b/i, '')
        const numValue = parseInt(binValue, 2)
        handleChange(isNaN(numValue) ? 0 : numValue, numValue)
      } else {
        handleChange(valueString, valueNumber)
      }
    },
    onBlur: handleBlur,
    onFocus: () => setIsFocused(true),
    isDisabled: isDisabled || isLoading,
    isReadOnly: isReadOnly,
    min,
    max,
    step,
    precision: format === 'decimal' ? precision : undefined,
    size: 'sm',
    ...props
  }

  return (
    <FormControl width={width}>
      <FormLabel fontSize="sm" color="white" mb={1}>
        <HStack spacing={2}>
          <Text>{label}</Text>
          
          {/* 0.6.x Enhancement Badge */}
          {is06Parameter && (
            <Badge colorScheme="green" variant="solid" fontSize="xs">
              0.6.x
            </Badge>
          )}
          
          {unit && (
            <Badge colorScheme="gray" variant="outline" fontSize="xs">
              {unit}
            </Badge>
          )}
          
          {parameterPath && (
            <Tooltip label={parameterPath} placement="top">
              <InfoIcon color="gray.400" boxSize={3} />
            </Tooltip>
          )}
        </HStack>
      </FormLabel>
      
      <HStack spacing={2}>
        {format === 'decimal' ? (
          <NumberInput {...inputProps} flex="1">
            <NumberInputField 
              bg={is06Parameter ? "green.900" : "gray.700"}
              borderColor={is06Parameter ? "green.400" : "gray.600"}
              _focus={{
                borderColor: is06Parameter ? "green.300" : "blue.400",
                boxShadow: `0 0 0 1px ${is06Parameter ? 'var(--chakra-colors-green-300)' : 'var(--chakra-colors-blue-400)'}`
              }}
            />
            {!isReadOnly && !isDisabled && (
              <NumberInputStepper>
                <NumberIncrementStepper color="gray.300" />
                <NumberDecrementStepper color="gray.300" />
              </NumberInputStepper>
            )}
          </NumberInput>
        ) : (
          <Input
            {...inputProps}
            flex="1"
            bg={is06Parameter ? "green.900" : "gray.700"}
            borderColor={is06Parameter ? "green.400" : "gray.600"}
            _focus={{
              borderColor: is06Parameter ? "green.300" : "blue.400",
              boxShadow: `0 0 0 1px ${is06Parameter ? 'var(--chakra-colors-green-300)' : 'var(--chakra-colors-blue-400)'}`
            }}
          />
        )}
        
        {onRefresh && (
          <IconButton
            icon={<RepeatIcon />}
            size="sm"
            variant="ghost"
            colorScheme={is06Parameter ? "green" : "blue"}
            onClick={handleRefresh}
            isLoading={isLoading}
            aria-label="Refresh parameter"
          />
        )}
      </HStack>
      
      {/* Helper Text */}
      {helperText && (
        <Text fontSize="xs" color="gray.400" mt={1}>
          {helperText}
          {is06Parameter && " (Enhanced in 0.6.x)"}
        </Text>
      )}
      
      {/* 0.6.x Feature Indicator */}
      {is06Parameter && (
        <Box mt={1}>
          <Text fontSize="xs" color="green.400" fontStyle="italic">
            ✨ Enhanced functionality in ODrive 0.6.x
          </Text>
        </Box>
      )}
    </FormControl>
  )
}

export default ParameterInput06