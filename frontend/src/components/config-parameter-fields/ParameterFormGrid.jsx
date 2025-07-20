import React from 'react'
import { VStack, FormControl, FormLabel, Icon, Tooltip, Text, SimpleGrid, Collapse, Button, HStack, Switch } from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from './ParameterInput'
import ParameterSwitch from './ParameterSwitch'
import ParameterSelect from './ParameterSelect'

function ParameterFormGrid({ 
  params, 
  config, 
  onChange, 
  onRefresh, 
  isLoading, 
  subgroup = null,
  layout = 'auto',
  maxColumns = 2,
  showGrouping = false // New prop to show/hide subgroup headers
}) {
  // Auto-detect layout based on parameter count if layout is 'auto'
  const effectiveLayout = layout === 'auto' 
    ? (params.length > 8 ? 'compact' : 'standard')
    : layout

  // Group by subgroup if present
  let grouped = {}
  if (subgroup) {
    params.forEach(param => {
      const group = subgroup(param)
      if (!grouped[group]) grouped[group] = []
      grouped[group].push(param)
    })
  } else {
    grouped = { '': params }
  }

  if (effectiveLayout === 'compact') {
    return <CompactParameterList grouped={grouped} config={config} onChange={onChange} onRefresh={onRefresh} isLoading={isLoading} showGrouping={showGrouping} />
  }

  if (effectiveLayout === 'grid') {
    return <GridParameterLayout grouped={grouped} config={config} onChange={onChange} onRefresh={onRefresh} isLoading={isLoading} maxColumns={maxColumns} showGrouping={showGrouping} />
  }

  // Standard layout
  return (
    <VStack spacing={6} align="stretch">
      {Object.entries(grouped).map(([sub, subParams]) => (
        <VStack key={sub} spacing={4} align="stretch">
          {sub && showGrouping && <Text fontWeight="bold" color="blue.300" fontSize="sm" mb={1}>{sub}</Text>}
          {subParams.map(param => (
            <ParameterField
              key={param.path}
              param={param}
              config={config}
              onChange={onChange}
              onRefresh={onRefresh}
              isLoading={isLoading}
              inputWidth="100%"
            />
          ))}
        </VStack>
      ))}
    </VStack>
  )
}

function CompactParameterList({ grouped, config, onChange, onRefresh, isLoading, showGrouping = true }) {
  return (
    <VStack spacing={3} align="stretch">
      {Object.entries(grouped).map(([sub, subParams]) => (
        <VStack key={sub} spacing={2} align="stretch">
          {sub && showGrouping && <Text fontWeight="bold" color="blue.300" fontSize="xs" mb={1}>{sub}</Text>}
          {subParams.map(param => (
            <FormControl key={param.path} size="sm">
              <SimpleGrid columns={2} spacing={2} alignItems="center">
                <FormLabel color="white" mb={0} fontSize="xs" noOfLines={1}>
                  {param.name}
                  <Tooltip label={param.description}>
                    <Icon as={InfoIcon} color="gray.400" ml={1} boxSize={3} />
                  </Tooltip>
                </FormLabel>
                <ParameterControl
                  param={param}
                  config={config}
                  onChange={onChange}
                  onRefresh={onRefresh}
                  isLoading={isLoading}
                  size="sm"
                />
              </SimpleGrid>
            </FormControl>
          ))}
        </VStack>
      ))}
    </VStack>
  )
}

function GridParameterLayout({ grouped, config, onChange, onRefresh, isLoading, maxColumns, showGrouping = true }) {
  return (
    <VStack spacing={4} align="stretch">
      {Object.entries(grouped).map(([sub, subParams]) => (
        <VStack key={sub} spacing={3} align="stretch">
          {sub && showGrouping && <Text fontWeight="bold" color="blue.300" fontSize="sm" mb={1}>{sub}</Text>}
          <SimpleGrid columns={maxColumns} spacing={4}>
            {subParams.map(param => (
              <ParameterField
                key={param.path}
                param={param}
                config={config}
                onChange={onChange}
                onRefresh={onRefresh}
                isLoading={isLoading}
                inputWidth="100%"
                compact
              />
            ))}
          </SimpleGrid>
        </VStack>
      ))}
    </VStack>
  )
}

function ParameterField({ param, config, onChange, onRefresh, isLoading, inputWidth, compact = false }) {
  const key = param.configKey

  // Special layout for boolean: tumbler left, label right
  if (param.type === 'boolean') {
    return (
      <FormControl size={compact ? "sm" : "md"} display="flex" alignItems="center">
        <HStack spacing={2}>
          <ParameterSwitch
            value={config[key]}
            onChange={value => onChange(key, value)}
            onRefresh={() => onRefresh(key, param.odriveCommand)}
            isLoading={isLoading(key)}
            size={compact ? "xs" : "sm"}
          />
          <FormLabel
            color="white"
            mb={0}
            fontSize={compact ? "xs" : "sm"}
            htmlFor={param.path}
            cursor="pointer"
          >
            {param.name}
            <Tooltip label={param.description} ml={2}>
              <span>
                <Icon as={InfoIcon} color="gray.400" ml={1} boxSize={compact ? 3 : 4} />
              </span>
            </Tooltip>
          </FormLabel>
        </HStack>
      </FormControl>
    )
  }

  // ...existing code for non-boolean...
  return (
    <FormControl size={compact ? "sm" : "md"}>
      <FormLabel 
        color="white" 
        mb={1} 
        fontSize={compact ? "xs" : "sm"}
        noOfLines={compact ? 1 : undefined}
      >
        {param.name}
        <Tooltip label={param.description} ml={2}>
          <span>
            <Icon as={InfoIcon} color="gray.400" ml={1} boxSize={compact ? 3 : 4} />
          </span>
        </Tooltip>
      </FormLabel>
      <ParameterControl
        param={param}
        config={config}
        onChange={onChange}
        onRefresh={onRefresh}
        isLoading={isLoading}
        width={inputWidth}
      />
    </FormControl>
  )
}

function ParameterControl({ param, config, onChange, onRefresh, isLoading, width, size = "sm" }) {
  const key = param.configKey

  // Handle different parameter types
  if (param.type === 'boolean') {
    return (
      <ParameterSwitch
        value={config[key]}
        onChange={value => onChange(key, value)}
        onRefresh={() => onRefresh(key, param.odriveCommand)}
        isLoading={isLoading(key)}
        size={size}
      />
    )
  }

  // Check if this should be a select based on selectOptions in the property tree
  if (param.selectOptions && Array.isArray(param.selectOptions)) {
    return (
      <ParameterSelect
        value={config[key] ?? param.selectOptions[0]?.value ?? 0}
        onChange={e => onChange(key, parseInt(e.target.value))}
        onRefresh={() => onRefresh(key, param.odriveCommand)}
        isLoading={isLoading(key)}
        size={size}
      >
        {param.selectOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </ParameterSelect>
    )
  }

  // Default to input
  return (
    <ParameterInput
      value={config[key]}
      onChange={value => onChange(key, value)}
      onRefresh={() => onRefresh(key, param.odriveCommand)}
      isLoading={isLoading(key)}
      unit={param.unit}
      step={param.step || 0.1}
      precision={param.decimals ?? 2}
      min={param.min}
      max={param.max}
      width={width}
      size={size}
    />
  )
}

export default ParameterFormGrid