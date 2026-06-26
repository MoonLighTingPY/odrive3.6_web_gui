import { HStack, Switch, IconButton, Tooltip, Spinner } from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'

/** Boolean toggle with an optional refresh button. */
const ParameterSwitch = ({
  value,
  onChange,
  onRefresh,
  isLoading = false,
  size = 'sm',
  isDisabled = false,
}) => (
  <HStack spacing={2}>
    <Switch
      size={size}
      isChecked={Boolean(value)}
      isDisabled={isDisabled}
      onChange={(e) => onChange(e.target.checked)}
      colorScheme="teal"
    />
    {onRefresh && (
      <Tooltip label="Read current value from device">
        <IconButton
          aria-label="Refresh"
          size="sm"
          variant="ghost"
          icon={isLoading ? <Spinner size="xs" /> : <RepeatIcon />}
          onClick={onRefresh}
          isDisabled={isDisabled}
        />
      </Tooltip>
    )}
  </HStack>
)

export default ParameterSwitch
