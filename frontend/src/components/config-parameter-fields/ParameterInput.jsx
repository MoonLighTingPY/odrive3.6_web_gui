import { useEffect, useState } from 'react'
import {
  HStack,
  VStack,
  Input,
  InputGroup,
  InputRightAddon,
  IconButton,
  Tooltip,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'

/**
 * Numeric parameter input with an optional unit addon and a refresh button.
 * Keeps a local string so the user can type intermediate states ("-", "0.").
 */
const ParameterInput = ({
  value,
  onChange,
  onRefresh,
  isLoading = false,
  unit,
  step = 0.1,
  decimals = 2,
  min,
  max,
  size = 'sm',
  isInteger = false,
  isDisabled = false,
}) => {
  const [text, setText] = useState('')

  useEffect(() => {
    // Sync from external value unless the user is mid-edit on the same number.
    if (value === undefined || value === null || value === '') {
      setText('')
      return
    }
    const num = Number(value)
    if (Number.isFinite(num)) {
      setText(decimals != null ? String(roundTrim(num, decimals)) : String(num))
    } else {
      setText(String(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commit = (raw) => {
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return
    const num = Number(raw)
    if (Number.isFinite(num)) onChange(num)
  }

  // Inline, password-strength-style validation: never blocks typing, just flags
  // bad input so the user sees what's wrong and can fix it.
  const error = validationError(text, { min, max, isInteger })
  const isInvalid = error != null

  const input = (
    <Input
      size={size}
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={value === undefined ? 'unknown' : ''}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      errorBorderColor="red.400"
      onChange={(e) => {
        setText(e.target.value)
        commit(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          const cur = Number(text) || 0
          let next = cur + (e.key === 'ArrowUp' ? step : -step)
          if (min != null) next = Math.max(min, next)
          if (max != null) next = Math.min(max, next)
          next = roundTrim(next, decimals ?? 6)
          setText(String(next))
          onChange(next)
        }
      }}
      fontFamily="mono"
      textAlign="right"
    />
  )

  return (
    <VStack spacing={0.5} align="stretch">
      <HStack spacing={1}>
        {unit ? (
          <InputGroup size={size}>
            {input}
            <InputRightAddon px={2} fontSize="xs">{unit}</InputRightAddon>
          </InputGroup>
        ) : (
          input
        )}
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
      {isInvalid && (
        <Text fontSize="xs" color="red.300" textAlign="right">{error}</Text>
      )}
    </VStack>
  )
}

function validationError(text, { min, max, isInteger }) {
  // Empty or in-progress entries are not flagged.
  if (text === '' || text === '-' || text === '.' || text === '-.') return null
  const num = Number(text)
  if (!Number.isFinite(num)) return 'Must be a number'
  if (isInteger && !Number.isInteger(num)) return 'Must be a whole number'
  if (min != null && num < min) return `Must be ≥ ${min}`
  if (max != null && num > max) return `Must be ≤ ${max}`
  return null
}

function roundTrim(num, decimals) {
  const factor = 10 ** decimals
  return Math.round(num * factor) / factor
}

export default ParameterInput
