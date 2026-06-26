import { memo, useState, useEffect } from 'react'
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Input,
  Select,
  Switch,
  Spinner,
  Checkbox,
  Tooltip,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons'

// Writable numeric setpoints that benefit from a slider, with sensible ranges.
const SETPOINT_SLIDERS = {
  'controller.input_pos': { min: -10, max: 10, step: 0.1 },
  'controller.input_vel': { min: -50, max: 50, step: 0.5 },
  'controller.input_torque': { min: -2, max: 2, step: 0.05 },
}

function sliderConfig(path) {
  for (const [suffix, cfg] of Object.entries(SETPOINT_SLIDERS)) {
    if (path.endsWith(suffix)) return cfg
  }
  return null
}

// Derive a compact display type + base kind from the raw valueType string.
function getTypeInfo(prop) {
  const vt = prop?.valueType || ''
  if (prop?.selectOptions) return { base: 'enum', display: 'Enum' }
  if (/bool/i.test(vt)) return { base: 'boolean', display: 'Bool' }
  if (/float/i.test(vt)) return { base: 'number', display: 'Float32', isFloat: true }
  const intMatch = /(U?int)(\d+)/i.exec(vt)
  if (intMatch) {
    const unsigned = /^u/i.test(intMatch[1])
    return { base: 'number', display: `${unsigned ? 'UInt' : 'Int'}${intMatch[2]}`, isInteger: true }
  }
  if (prop?.type === 'number') return { base: 'number', display: 'Number' }
  if (prop?.type === 'boolean') return { base: 'boolean', display: 'Bool' }
  return { base: 'text', display: vt ? vt.replace('Property', '') : 'Text' }
}

function formatValue(value, prop, typeInfo) {
  if (value === undefined || value === null) return 'N/A'
  if (typeInfo.base === 'boolean') return value ? 'True' : 'False'
  if (typeInfo.base === 'enum' && prop.selectOptions) {
    const opt = prop.selectOptions.find((o) => o.value === value)
    return opt ? opt.label : String(value)
  }
  if (typeInfo.base === 'number') {
    const n = typeof value === 'number' ? value : parseFloat(value)
    if (Number.isNaN(n)) return String(value)
    if (typeInfo.isInteger) return String(Math.round(n))
    if (typeInfo.isFloat) return n.toFixed(3)
    return String(n)
  }
  return String(value)
}

// Coerce an edit-field string into the value type the backend expects.
function coerce(str, typeInfo) {
  if (typeInfo.base === 'boolean') return str === 'true' || str === true
  if (typeInfo.base === 'number' || typeInfo.base === 'enum') {
    const n = typeInfo.isInteger || typeInfo.base === 'enum' ? parseInt(str, 10) : parseFloat(str)
    return Number.isNaN(n) ? null : n
  }
  return str
}

/**
 * A single property row. Entirely props-driven — it does NOT subscribe to the
 * Redux store, so it never re-renders from the telemetry stream. The parent
 * tree passes the current value, chart/favourite flags and stable callbacks,
 * and `memo` bails out unless one of those actually changes.
 */
const PropertyItem = memo(
  ({
    prop,
    displayPath,
    value,
    isConnected,
    isRefreshing,
    isCharted,
    isFav,
    onToggleChart,
    onRefresh,
    onWrite,
    onToggleFav,
  }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState('')
    const numericValue = typeof value === 'number' ? value : parseFloat(value)
    const [sliderValue, setSliderValue] = useState(Number.isFinite(numericValue) ? numericValue : 0)

    // Keep the slider synced to the live value while not dragging.
    useEffect(() => {
      if (Number.isFinite(numericValue)) setSliderValue(numericValue)
    }, [numericValue])

    if (!prop || typeof prop !== 'object') {
      return (
        <Box p={2} bg="red.900" borderRadius="md">
          <Text color="red.300" fontSize="sm">Invalid property: {displayPath}</Text>
        </Box>
      )
    }

    const typeInfo = getTypeInfo(prop)
    const isWritable = prop.writable !== false
    const isChartable = typeInfo.base === 'number' || typeInfo.base === 'boolean'
    const isError = /\.error$/.test(displayPath) && typeof value === 'number' && value !== 0
    const propName = prop.name || displayPath.split('.').pop()
    const hasSelect = Array.isArray(prop.selectOptions) && prop.selectOptions.length > 0
    const slider = isWritable && typeInfo.base === 'number' && !hasSelect ? sliderConfig(displayPath) : null

    const beginEdit = () => {
      if (typeInfo.base === 'boolean') setEditValue(value ? 'true' : 'false')
      else if (value === undefined || value === null) setEditValue('')
      else setEditValue(String(value))
      setIsEditing(true)
    }

    const commit = async () => {
      const v = coerce(editValue, typeInfo)
      setIsEditing(false)
      if (v === null) return
      await onWrite(displayPath, v)
    }

    const quickWrite = async (raw) => {
      const v = coerce(raw, typeInfo)
      if (v === null) return
      await onWrite(displayPath, v)
    }

    const commitSlider = async (n) => {
      const v = slider.step >= 1 ? Math.round(n) : parseFloat(n.toFixed(3))
      await onWrite(displayPath, v)
    }

    return (
      <Box
        bg={isError ? 'red.900' : 'gray.750'}
        borderRadius="md"
        border="1px solid"
        borderColor={isError ? 'red.600' : 'gray.600'}
        p={2}
        _hover={{ bg: isError ? 'red.800' : 'gray.700' }}
        transition="background 0.15s"
      >
        <VStack spacing={2} align="stretch">
        <HStack justify="space-between" align="center" spacing={2}>
          <HStack spacing={2} flex="1" align="center" minW="0">
            {isChartable && (
              <Checkbox
                size="md"
                colorScheme="blue"
                isChecked={isCharted}
                onChange={() => onToggleChart(displayPath)}
              />
            )}
            <Badge fontSize="0.6rem" colorScheme={isWritable ? 'green' : 'gray'} variant="subtle">
              {isWritable ? 'RW' : 'RO'}
            </Badge>
            <Tooltip label={prop.valueType || typeInfo.display} placement="top" openDelay={400}>
              <Badge fontSize="0.6rem" colorScheme="blue" variant="outline">
                {typeInfo.display}
              </Badge>
            </Tooltip>
            <VStack align="start" spacing={0} flex="1" minW="0">
              <Text fontSize="sm" fontWeight="semibold" color="white" isTruncated w="100%">
                {propName}
              </Text>
              <Text fontSize="xs" color="gray.500" fontFamily="mono" isTruncated w="100%">
                {displayPath}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={1} minW="fit-content">
            {isEditing ? (
              <>
                {typeInfo.base === 'boolean' ? (
                  <Switch
                    size="sm"
                    isChecked={editValue === 'true'}
                    onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
                    colorScheme="blue"
                  />
                ) : hasSelect ? (
                  <Select
                    size="xs"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    w="150px"
                    bg="gray.700"
                    color="white"
                  >
                    {prop.selectOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    size="xs"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    type={typeInfo.base === 'number' ? 'number' : 'text'}
                    w="90px"
                    bg="gray.700"
                    color="white"
                    fontFamily="mono"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commit()
                      else if (e.key === 'Escape') setIsEditing(false)
                    }}
                  />
                )}
                <IconButton size="xs" colorScheme="green" aria-label="Save" icon={<CheckIcon />} onClick={commit} isDisabled={!isConnected} />
                <IconButton size="xs" colorScheme="red" aria-label="Cancel" icon={<CloseIcon />} onClick={() => setIsEditing(false)} />
              </>
            ) : (
              <>
                <Text
                  fontSize="sm"
                  fontFamily="mono"
                  fontWeight="semibold"
                  color={value !== undefined && value !== null ? (isError ? 'red.300' : 'white') : 'gray.500'}
                  minW="56px"
                  textAlign="right"
                >
                  {formatValue(value, prop, typeInfo)}
                </Text>

                {/* Quick enum select for writable enums */}
                {hasSelect && isWritable && isConnected && !isRefreshing && (
                  <Select
                    size="xs"
                    value={value ?? ''}
                    onChange={(e) => quickWrite(e.target.value)}
                    w="130px"
                    bg="gray.700"
                    color="white"
                    variant="filled"
                  >
                    {prop.selectOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                )}

                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Refresh"
                  icon={isRefreshing ? <Spinner size="xs" /> : <RepeatIcon />}
                  onClick={() => onRefresh(displayPath)}
                  isDisabled={!isConnected || isRefreshing}
                />
                {isWritable && isConnected && !hasSelect && (
                  <IconButton size="xs" variant="ghost" aria-label="Edit" icon={<EditIcon />} onClick={beginEdit} />
                )}
                <IconButton
                  size="xs"
                  variant={isFav ? 'solid' : 'ghost'}
                  colorScheme={isFav ? 'yellow' : 'gray'}
                  aria-label={isFav ? 'Remove favourite' : 'Add favourite'}
                  icon={<StarIcon />}
                  onClick={() => onToggleFav(displayPath)}
                />
              </>
            )}
          </HStack>
        </HStack>

        {/* Setpoint slider for writable numeric setpoints */}
        {slider && isConnected && !isEditing && (
          <HStack spacing={2} w="100%">
            <Slider
              value={Number.isFinite(sliderValue) ? sliderValue : 0}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              onChange={setSliderValue}
              onChangeEnd={commitSlider}
              colorScheme="blue"
              flex="1"
            >
              <SliderTrack bg="gray.600"><SliderFilledTrack bg="blue.400" /></SliderTrack>
              <SliderThumb boxSize={3} bg="blue.500" />
            </Slider>
            <Button size="xs" variant="outline" onClick={() => { setSliderValue(0); commitSlider(0) }}>
              Zero
            </Button>
          </HStack>
        )}
        </VStack>
      </Box>
    )
  },
  (prev, next) =>
    prev.prop === next.prop &&
    prev.value === next.value &&
    prev.isConnected === next.isConnected &&
    prev.isRefreshing === next.isRefreshing &&
    prev.isCharted === next.isCharted &&
    prev.isFav === next.isFav &&
    prev.displayPath === next.displayPath
)

PropertyItem.displayName = 'PropertyItem'

export default PropertyItem
