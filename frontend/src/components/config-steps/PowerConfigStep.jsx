import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Switch,
  Icon,
  Tooltip,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'

const DEFAULT_GROUPS = [
  'DC Bus Voltage Protection',
  'Current Limits',
  'Brake Resistor',
  'FET Thermistor Limits',
  'DC Bus Overvoltage Ramp',
  'Miscellaneous',
]

const groupOrder = {
  'DC Bus Voltage Protection': 0,
  'Current Limits': 1,
  'Brake Resistor': 2,
  'FET Thermistor Limits': 3,
  'DC Bus Overvoltage Ramp': 4,
  'Miscellaneous': 5,
}

function getGroup(param) {
  // Prefer explicit uiGroup, fallback to group by key
  if (param.uiGroup) return param.uiGroup
  // Fallback grouping by configKey
  if (param.configKey?.includes('voltage')) return 'DC Bus Voltage Protection'
  if (param.configKey?.includes('current')) return 'Current Limits'
  if (param.configKey?.includes('brake')) return 'Brake Resistor'
  if (param.configKey?.includes('fet_temp')) return 'FET Thermistor Limits'
  if (param.configKey?.includes('ramp')) return 'DC Bus Overvoltage Ramp'
  return 'Miscellaneous'
}

const PowerConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const powerConfig = deviceConfig.power || {}
  const powerParams = getCategoryParameters('power')

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('power', configKey, value)
  }

  const handleRefresh = (configKey, odrivePath) => {
    // Pass the correct ODrive property path
    onReadParameter(odrivePath, 'power', configKey)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`power.${configKey}`)
  }

  // Group parameters by logical UI section
  const groupedParams = {}
  powerParams.forEach(param => {
    const group = getGroup(param)
    if (!groupedParams[group]) groupedParams[group] = []
    groupedParams[group].push(param)
  })

  // Sort groups and params within each group
  const sortedGroups = Object.keys(groupedParams)
    .sort((a, b) => (groupOrder[a] ?? 99) - (groupOrder[b] ?? 99))

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">
        {sortedGroups.map(group => (
          <Card key={group} bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">{group}</Heading>
            </CardHeader>
            <CardBody py={2}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {groupedParams[group]
                  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name))
                  .map(param => {
                  const key = param.configKey
                  if (param.type === 'boolean') {
                    return (
                      <FormControl key={key}>
                        <HStack spacing={2} mb={1}>
                          <Switch
                            isChecked={!!powerConfig[key]}
                            onChange={e => handleConfigChange(key, e.target.checked)}
                            colorScheme="odrive"
                            size="sm"
                          />
                          <FormLabel color="white" mb={0} fontSize="sm">{param.name}</FormLabel>
                          <Tooltip label={param.description}>
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                      </FormControl>
                    )
                  }
                  return (
                    <FormControl key={key}>
                      <HStack spacing={2} mb={1}>
                        <FormLabel color="white" mb={0} fontSize="sm">{param.name}</FormLabel>
                        <Tooltip label={param.description}>
                          <Icon as={InfoIcon} color="gray.400" />
                        </Tooltip>
                      </HStack>
                      <ParameterInput
                        value={powerConfig[key]}
                        onChange={value => handleConfigChange(key, value)}
                        onRefresh={() => handleRefresh(key, param.odriveCommand)}
                        isLoading={isLoading(key)}
                        unit={param.unit}
                        step={param.step || 0.1}
                        precision={param.decimals ?? 2}
                        min={param.min}
                        max={param.max}
                      />
                    </FormControl>
                  )
                })}
              </SimpleGrid>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  )
}

export default PowerConfigStep