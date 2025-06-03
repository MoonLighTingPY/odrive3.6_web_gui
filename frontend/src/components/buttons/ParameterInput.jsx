import React from 'react'
import {
  HStack,
  NumberInput,
  NumberInputField,
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
  min,
  max,
  ...props 
}) => {
  return (
    <HStack spacing={1}>
      <NumberInput
        value={value || ''}
        onChange={onChange}
        step={step}
        precision={precision}
        min={min}
        max={max}
        size="sm"
        flex="1"
        {...props}
      >
        <NumberInputField 
          bg="gray.700" 
          border="1px solid" 
          borderColor="gray.600" 
          color="white" 
        />
      </NumberInput>
      
      {unit && (
        <Text color="gray.300" minW="40px" fontSize="sm">
          {unit}
        </Text>
      )}
      
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

export default ParameterInput