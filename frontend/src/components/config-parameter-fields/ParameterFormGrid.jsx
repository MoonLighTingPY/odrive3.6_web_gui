import React from 'react'
import { VStack, FormControl, FormLabel, Icon, Tooltip, Text } from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from './ParameterInput'
import ParameterSwitch from './ParameterSwitch'

function ParameterFormGrid({ params, config, onChange, onRefresh, isLoading, subgroup = null }) {
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

  return (
    <VStack spacing={6} align="stretch">
      {Object.entries(grouped).map(([sub, subParams]) => {
        // Compute the max label width for this subgroup
        // const maxLabelLength = Math.max(...subParams.map(p => (p.name || '').length), 0)
        // const inputWidth = `${maxLabelLength + 4}ch`
        return (
          <VStack key={sub} spacing={4} align="stretch">
            {sub && <Text fontWeight="bold" color="blue.300" fontSize="sm" mb={1}>{sub}</Text>}
            {subParams.map(param => (
              <ParameterField
                key={param.path}
                param={param}
                config={config}
                onChange={onChange}
                onRefresh={onRefresh}
                isLoading={isLoading}
                inputWidth={"100%"}
              />
            ))}
          </VStack>
        )
      })}
    </VStack>
  )
}

function ParameterField({ param, config, onChange, onRefresh, isLoading, inputWidth }) {
  const key = param.configKey
  return (
    <FormControl>
      <FormLabel color="white" mb={1} fontSize="sm">
        {param.name}
        <Tooltip label={param.description} ml={2}>
          <span>
            <Icon as={InfoIcon} color="gray.400" ml={1} />
          </span>
        </Tooltip>
      </FormLabel>
      {param.type === 'boolean' ? (
        <ParameterSwitch
          value={config[key]}
          onChange={value => onChange(key, value)}
          onRefresh={() => onRefresh(key, param.odriveCommand)}
          isLoading={isLoading(key)}
        />
      ) : (
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
          width={inputWidth}
        />
      )}
    </FormControl>
  )
}

export default ParameterFormGrid