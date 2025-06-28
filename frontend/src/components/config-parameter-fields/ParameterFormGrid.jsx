import React from 'react'
import { VStack, FormControl, FormLabel, Icon, Tooltip } from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from './ParameterInput'
import ParameterSwitch from './ParameterSwitch'

function ParameterFormGrid({ params, config, onChange, onRefresh, isLoading }) {
  return (
    <VStack spacing={4} align="stretch">
      {params.map(param => (
        <ParameterField
          key={param.path}
          param={param}
          config={config}
          onChange={onChange}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      ))}
    </VStack>
  )
}

function ParameterField({ param, config, onChange, onRefresh, isLoading }) {
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
        />
      )}
    </FormControl>
  )
}

export default ParameterFormGrid