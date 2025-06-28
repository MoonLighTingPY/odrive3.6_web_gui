import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import { POWER_PARAM_GROUPS, getParameterGroup, getParameterSubgroup } from '../../utils/configParameterGrouping'

function getGroup(param) {
  return getParameterGroup(param, POWER_PARAM_GROUPS)
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
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {/* DC Bus Voltage Protection */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">DC Bus Voltage Protection</Heading>
            </CardHeader>
            <CardBody py={2}>
              <ParameterFormGrid
                params={groupedParams['DC Bus Voltage Protection']}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                subgroup={param => getParameterSubgroup(param, POWER_PARAM_GROUPS)}
              />
            </CardBody>
          </Card>

          {/* Current Limits & Brake Resistor */}
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">Current Limits & Brake Resistor</Heading>
            </CardHeader>
            <CardBody py={2}>
              <ParameterFormGrid
                params={groupedParams['Current Limits & Brake Resistor']}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                subgroup={param => getParameterSubgroup(param, POWER_PARAM_GROUPS)}
              />
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* FET Thermistor */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">FET Thermistor</Heading>
          </CardHeader>
          <CardBody py={2}>
            <ParameterFormGrid
              params={groupedParams['FET Thermistor']}
              config={powerConfig}
              onChange={handleConfigChange}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              subgroup={param => getParameterSubgroup(param, POWER_PARAM_GROUPS)}
            />
          </CardBody>
        </Card>

        {/* Miscellaneous */}
        {groupedParams['Miscellaneous'] && (
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">Miscellaneous</Heading>
            </CardHeader>
            <CardBody py={2}>
              <ParameterFormGrid
                params={groupedParams['Miscellaneous']}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                subgroup={param => getParameterSubgroup(param, POWER_PARAM_GROUPS)}
              />
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  )
}

export default PowerConfigStep