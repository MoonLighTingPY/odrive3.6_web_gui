import React from 'react'
import {
  Select,
  VStack,
  Text,
  Badge,
  HStack
} from '@chakra-ui/react'
import { getAllAvailablePresets, isFactoryPreset } from '../../utils/presetsManager'

const PresetSelector = ({
  value = '',
  onChange,
  placeholder = "Select a preset...",
  size = "md",
  isDisabled = false
}) => {
  const presets = getAllAvailablePresets()

  const formatPresetOption = (name) => {
    const isFactory = isFactoryPreset(name)
    const prefix = isFactory ? '[Factory] ' : '[User] '
    return `${prefix}${name}`
  }

  const presetOptions = Object.keys(presets).sort((a, b) => {
    // Factory presets first, then user presets alphabetically
    const aFactory = isFactoryPreset(a)
    const bFactory = isFactoryPreset(b)

    if (aFactory && !bFactory) return -1
    if (!aFactory && bFactory) return 1
    return a.localeCompare(b)
  })

  const selectedPreset = presets[value]

  return (
    <VStack spacing={2} align="stretch">
      <Select
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={size}
        isDisabled={isDisabled}
      >
        {presetOptions.map((name) => (
          <option key={name} value={name}>
            {formatPresetOption(name)}
          </option>
        ))}
      </Select>

      {value && selectedPreset && (
        <VStack spacing={1} align="start">
          <HStack>
            <Badge colorScheme={isFactoryPreset(value) ? 'blue' : 'green'} size="sm">
              {isFactoryPreset(value) ? 'Factory' : 'User'}
            </Badge>
            {selectedPreset.timestamp && (
              <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                {new Date(selectedPreset.timestamp).toLocaleDateString()}
              </Text>
            )}
          </HStack>

          {selectedPreset.description && (
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }} fontStyle="italic">
              {selectedPreset.description}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  )
}

export default PresetSelector