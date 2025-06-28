import React from 'react'
import { HStack, Select, IconButton, Tooltip, Spinner } from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'

const ParameterSelect = ({
  value,
  onChange,
  onRefresh,
  isLoading,
  children,
  ...props
}) => (
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

export default ParameterSelect