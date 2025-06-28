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
  Icon,
  Tooltip,
  SimpleGrid,
} from '@chakra-ui/react'
import ParameterFormGrid from '../buttons/ParameterFormGrid'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'




function getGroup(param) {
  if (param.uiGroup) return param.uiGroup
  if (
    param.configKey === 'enable_dc_bus_overvoltage_ramp' ||
    param.configKey?.includes('voltage') ||
    param.configKey?.includes('ramp')
  ) {
    return 'DC Bus Voltage Protection'
  }
  if (param.configKey?.includes('current')) return 'Current Limits'
  if (param.configKey?.includes('brake')) return 'Brake Resistor'
  if (param.path?.includes('fet_thermistor')) return 'FET Thermistor Limits'
  if (param.configKey?.includes('fet_temp')) return 'FET Thermistor Limits'
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
                params={[
                  ...(groupedParams['Current Limits'] || []),
                  ...(groupedParams['Brake Resistor'] || [])
                ]}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
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
              params={groupedParams['FET Thermistor Limits']}
              config={powerConfig}
              onChange={handleConfigChange}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </CardBody>
        </Card>

        {/* DC Bus Overvoltage Ramp */}
        {groupedParams['DC Bus Overvoltage Ramp'] && (
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={1}>
              <Heading size="sm" color="white">DC Bus Overvoltage Ramp</Heading>
            </CardHeader>
            <CardBody py={2}>
              <ParameterFormGrid
                params={groupedParams['DC Bus Overvoltage Ramp']}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
              />
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
              <ParameterFormGrid
                params={groupedParams['Miscellaneous']}
                config={powerConfig}
                onChange={handleConfigChange}
                onRefresh={handleRefresh}
                isLoading={isLoading}
              />
            </CardBody>
          </Card>
        )}

      </VStack>
    </Box>
  )
}

export default PowerConfigStep