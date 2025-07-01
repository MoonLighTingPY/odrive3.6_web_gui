import React from 'react'
import { HStack, Select, IconButton, Tooltip, Spinner } from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'
import { findParameter } from '../../utils/odriveUnifiedRegistry'
import process from 'process'

const ParameterSelect = ({
  value,
  onChange,
  onRefresh,
  isLoading,
  children,
  parameterPath, // Add this prop to identify the parameter
  configKey, // Add alternative way to find parameter
  ...props
}) => {
  // If children are provided (manual options), use them
  if (children && React.Children.count(children) > 0) {
    return (
      <HStack spacing={1}>
        <Select
          value={value}
          onChange={onChange}
          bg="gray.700"
          border="1px solid"
          borderColor="gray.600"
          color="white"
          size="sm"
          flex="1"
          {...props}
        >
          {children}
        </Select>
        <Tooltip label="Refresh from ODrive">
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

  // Auto-generate options from property tree
  let parameter = null
  
  // Try multiple ways to find the parameter
  if (parameterPath) {
    parameter = findParameter(parameterPath)
  }
  
  if (!parameter && configKey) {
    parameter = findParameter(configKey)
  }
  
  // Debug logging
  if (!parameter) {
    console.warn(`ParameterSelect: Could not find parameter for path: ${parameterPath}, configKey: ${configKey}`)
  }
  
  const selectOptions = parameter?.selectOptions || parameter?.property?.selectOptions || []

  // If no options found, show warning in development
  if (selectOptions.length === 0 && process.env.NODE_ENV === 'development') {
    console.warn(`ParameterSelect: No select options found for ${parameterPath || configKey}`)
  }

  return (
    <HStack spacing={1}>
      <Select
        value={value}
        onChange={onChange}
        bg="gray.700"
        border="1px solid"
        borderColor="gray.600"
        color="white"
        size="sm"
        flex="1"
        {...props}
      >
        {selectOptions.length === 0 ? (
          <option value="">No options available</option>
        ) : (
          selectOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        )}
      </Select>
      <Tooltip label="Refresh from ODrive">
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

export default ParameterSelect