/* eslint-disable no-unused-vars */
import React, { useState, useEffect, memo } from 'react'
import {
  HStack,
  Input,
  IconButton,
  Text,
  Tooltip,
  Spinner,
} from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'

const ParameterInput = ({
  value,
  onChange,
  onRefresh,
  isLoading,
  unit,
  step = 0.1,
  precision = 3,
  min, // Keep for legacy compatibility but don't enforce
  max, // Keep for legacy compatibility but don't enforce
  ...props
}) => {
  const [inputValue, setInputValue] = useState('')

  // Update input value when prop value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      // Format the value using precision for display
      const formattedValue = typeof value === 'number' ?
        parseFloat(value.toFixed(precision)).toString() :
        value.toString()
      setInputValue(formattedValue)
    } else {
      setInputValue('')
    }
  }, [value, precision])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Allow empty string or valid number strings (including intermediate states)
    if (newValue === '' || newValue === '-' || newValue === '.' || newValue === '-.') {
      // Don't call onChange for incomplete numbers
      return
    }

    // Parse and validate the number
    const numValue = parseFloat(newValue)
    if (!isNaN(numValue)) {
      // Pass the value directly without min/max constraints
      onChange(numValue)
    }
  }

  const handleBlur = () => {
    // On blur, ensure we have a valid number or clear the field
    const numValue = parseFloat(inputValue)
    if (isNaN(numValue)) {
      if (value !== undefined && value !== null) {
        const formattedValue = typeof value === 'number' ?
          parseFloat(value.toFixed(precision)).toString() :
          value.toString()
        setInputValue(formattedValue)
      } else {
        setInputValue('')
        onChange(0) // Default to 0 for empty fields
      }
    } else {
      // Format the final value using precision without constraints
      const formattedValue = parseFloat(numValue.toFixed(precision)).toString()
      setInputValue(formattedValue)
      onChange(numValue)
    }
  }

  const handleKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return
    }

    // Allow: numbers, decimal point, minus sign
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
      (e.keyCode < 96 || e.keyCode > 105) &&
      e.keyCode !== 190 && e.keyCode !== 110 && // decimal points
      e.keyCode !== 189 && e.keyCode !== 109) { // minus signs
      e.preventDefault()
    }
  }

  // Handle arrow key increments using step value
  const handleKeyUp = (e) => {
    if (e.keyCode === 38 || e.keyCode === 40) { // Arrow up or down
      e.preventDefault()
      const currentValue = parseFloat(inputValue) || 0
      const increment = e.keyCode === 38 ? step : -step
      const newValue = currentValue + increment

      // No min/max constraints - allow any value
      const formattedValue = parseFloat(newValue.toFixed(precision)).toString()
      setInputValue(formattedValue)
      onChange(newValue)
    }
  }

  return (
    <HStack spacing={1}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        bg="gray.700"
        border="1px solid"
        borderColor="gray.600"
        color="white"
        size="sm"
        width={props.width}
        placeholder="0"
        step={step}
        {...Object.fromEntries(Object.entries(props).filter(([k]) => k !== 'selectOptions'))}
      />

      {unit && (
        <Text color="gray.300" minW="40px" fontSize="sm">
          {unit}
        </Text>
      )}

      <Tooltip label={`Refresh from ODrive (Step: ${step})`}>
        <IconButton
          icon={isLoading ? <Spinner size="xs" /> : <RefreshCw size={12} />}
          onClick={onRefresh}
          isDisabled={isLoading}
          size="xs"
          variant="ghost"
          colorScheme="blue"
          aria-label="Refresh parameter"
        />
      </Tooltip>
    </HStack>
  )
}

export default ParameterInput