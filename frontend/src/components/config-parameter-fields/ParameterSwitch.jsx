import React from 'react'
import { HStack, Switch, IconButton, Tooltip, Spinner } from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'

const ParameterSwitch = ({
  value,
  onChange,
  onRefresh,
  isLoading,
  size = "sm", // Add size prop
  ...props
}) => (
  <HStack spacing={1}>
    <Switch
      isChecked={!!value}
      onChange={e => onChange(e.target.checked)}
      colorScheme="odrive"
      size={size} // Use size prop
      {...props}
    />
    <Tooltip label="Refresh from ODrive">
      <IconButton
        icon={isLoading ? <Spinner size="xs" /> : <RefreshCw size={size === "xs" ? 10 : 12} />}
        onClick={onRefresh}
        isDisabled={isLoading}
        size={size === "xs" ? "xs" : "xs"}
        variant="ghost"
        colorScheme="blue"
        aria-label="Refresh parameter"
      />
    </Tooltip>
  </HStack>
)

export default ParameterSwitch