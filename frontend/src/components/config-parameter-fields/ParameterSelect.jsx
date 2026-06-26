import { HStack, Select, IconButton, Tooltip, Spinner } from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'

/**
 * Enum dropdown driven by { value, label } options, with an optional refresh.
 */
const ParameterSelect = ({
  value,
  onChange,
  onRefresh,
  isLoading = false,
  options = [],
  size = 'sm',
  isDisabled = false,
}) => (
  <HStack spacing={1}>
    <Select
      size={size}
      value={value ?? ''}
      isDisabled={isDisabled}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {value === undefined && <option value="">unknown</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Select>
    {onRefresh && (
      <Tooltip label="Read current value from device">
        <IconButton
          aria-label="Refresh"
          size={size}
          variant="ghost"
          icon={isLoading ? <Spinner size="xs" /> : <RepeatIcon />}
          onClick={onRefresh}
          isDisabled={isDisabled}
        />
      </Tooltip>
    )}
  </HStack>
)

export default ParameterSelect
