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
import BooleanParameterInput from '../buttons/BooleanParameterInput'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'

const DEFAULT_GROUPS = [
  'DC Bus Voltage Protection',
  'Current Limits',
  'Brake Resistor',
  'FET Thermistor Limits',
  'DC Bus Overvoltage Ramp',
  'Miscellaneous',
]


function getGroup(param) {
  if (param.uiGroup) return param.uiGroup
  if (param.configKey?.includes('voltage')) return 'DC Bus Voltage Protection'
  if (param.configKey?.includes('current')) return 'Current Limits'
  if (param.configKey?.includes('brake')) return 'Brake Resistor'
  // Add this line to catch the enable parameter for FET thermistor
  if (param.path?.includes('fet_thermistor')) return 'FET Thermistor Limits'
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


  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">

        {/* DC Bus Voltage Protection & Current Limits/Brake Resistor side by side */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {/* DC Bus Voltage Protection */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">DC Bus Voltage Protection</Heading>
            </CardHeader>
            <CardBody py={2}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {groupedParams['DC Bus Voltage Protection']?.map(param => {
                  const key = param.configKey
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

          {/* Current Limits & Brake Resistor */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">Current Limits & Brake Resistor</Heading>
            </CardHeader>
            <CardBody py={2}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* Current Limits */}
                <Box>
                  <VStack spacing={2} align="stretch">
                    {groupedParams['Current Limits']?.map(param => {
                      const key = param.configKey
                      return (
                        <FormControl key={key}>
                          <FormLabel color="white" mb={1} fontSize="sm">{param.name}</FormLabel>
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
                  </VStack>
                </Box>
                {/* Brake Resistor */}
                <Box>
                  <VStack spacing={2} align="stretch">
                    {groupedParams['Brake Resistor']?.map(param => {
                      const key = param.configKey
                      if (param.type === 'boolean') {
                        return (
                          <FormControl key={key}>
                            <HStack spacing={2} mb={1}>
                              <BooleanParameterInput
                                value={powerConfig[key]}
                                onChange={value => handleConfigChange(key, value)}
                                onRefresh={() => handleRefresh(key, param.odriveCommand)}
                                isLoading={isLoading(key)}
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
                          <FormLabel color="white" mb={1} fontSize="sm">{param.name}</FormLabel>
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
                  </VStack>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* FET Thermistor */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">FET Thermistor</Heading>
          </CardHeader>
          <CardBody py={2}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {groupedParams['FET Thermistor Limits']?.map(param => {
                const key = param.configKey
                if (param.type === 'boolean') {
                  return (
                    <FormControl key={key}>
                      <HStack spacing={2} mb={1}>
                        <BooleanParameterInput
                          value={powerConfig[key]}
                          onChange={value => handleConfigChange(key, value)}
                          onRefresh={() => handleRefresh(key, param.odriveCommand)}
                          isLoading={isLoading(key)}
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

        {/* DC Bus Overvoltage Ramp */}
        {groupedParams['DC Bus Overvoltage Ramp'] && (
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">DC Bus Overvoltage Ramp</Heading>
            </CardHeader>
            <CardBody py={2}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {groupedParams['DC Bus Overvoltage Ramp'].map(param => {
                  const key = param.configKey
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
        )}

        {/* Miscellaneous */}
        {groupedParams['Miscellaneous'] && (
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">Miscellaneous</Heading>
            </CardHeader>
            <CardBody py={2}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {groupedParams['Miscellaneous'].map(param => {
                  const key = param.configKey
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
        )}

      </VStack>
    </Box>
  )
}

export default PowerConfigStep