import React from 'react'
import {
  VStack,
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
} from '@chakra-ui/react'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import { MOTOR_PARAM_GROUPS, getParameterGroup } from '../../utils/configParameterGrouping'

function getGroup(param) {
  return getParameterGroup(param, MOTOR_PARAM_GROUPS)
}

const NUM_COLUMNS = 3

const MotorConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const motorConfig = deviceConfig.motor || {}
  const motorParams = getCategoryParameters('motor')

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('motor', configKey, value)
  }

  const handleRefresh = (configKey, odrivePath) => {
    onReadParameter(odrivePath, 'motor', configKey)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`motor.${configKey}`)
  }

  // Group parameters by logical UI section
  const groupedParams = {}
  motorParams.forEach(param => {
    const group = getGroup(param)
    if (!groupedParams[group]) groupedParams[group] = []
    groupedParams[group].push(param)
  })

  // Prepare cards for masonry layout
  const cards = Object.entries(groupedParams)
    .filter(([group]) => group !== 'Miscellaneous' && group !== 'Other')
    .map(([group, params]) => (
      <Card
        key={group}
        bg="gray.800"
        variant="elevated"
        sx={{
          breakInside: 'avoid',
          marginBottom: '24px',
          width: '100%',
          display: 'block',
        }}
      >
        <CardHeader py={1}>
          <Heading size="sm" color="white">{group}</Heading>
        </CardHeader>
        <CardBody py={2}>
          <ParameterFormGrid
            params={params}
            config={motorConfig}
            onChange={handleConfigChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </CardBody>
      </Card>
    ))

  // Calculated values card
  const calculatedKt = 8.27 / (motorConfig.motor_kv || 0)
  const maxTorque = calculatedKt * (motorConfig.current_lim || 0)
  const calculatedCard = (
    <Card
      bg="gray.800"
      variant="elevated"
      sx={{
        breakInside: 'avoid',
        marginBottom: '24px',
        width: '100%',
        display: 'block',
      }}
    >
      <CardHeader py={2}>
        <Heading size="sm" color="white">Calculated Values</Heading>
      </CardHeader>
      <CardBody py={2}>
        <VStack spacing={2} align="stretch">
          <Box display="flex" justifyContent="space-between">
            <Text color="gray.300" fontSize="sm">Torque Constant (Kt):</Text>
            <Text fontWeight="bold" color="green.300" fontSize="sm">
              {calculatedKt.toFixed(4)} Nm/A
            </Text>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text color="gray.300" fontSize="sm">Max Torque:</Text>
            <Text fontWeight="bold" color="green.300" fontSize="sm">
              {maxTorque.toFixed(2)} Nm
            </Text>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Text color="gray.300" fontSize="sm">Motor Type:</Text>
            <Badge colorScheme={motorConfig.motor_type === 0 ? "blue" : "purple"} fontSize="xs">
              {motorConfig.motor_type === 0 ? "High Current" : "Gimbal"}
            </Badge>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )

  // Miscellaneous card
  const miscCard = groupedParams['Miscellaneous'] && (
    <Card
      bg="gray.800"
      variant="elevated"
      sx={{
        breakInside: 'avoid',
        marginBottom: '24px',
        width: '100%',
        display: 'block',
      }}
    >
      <CardHeader py={1}>
        <Heading size="sm" color="white">Miscellaneous</Heading>
      </CardHeader>
      <CardBody py={2}>
        <ParameterFormGrid
          params={groupedParams['Miscellaneous']}
          config={motorConfig}
          onChange={handleConfigChange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      </CardBody>
    </Card>
  )

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">
        <Box
          sx={{
            columnCount: [1, 1, NUM_COLUMNS],
            columnGap: '24px',
            width: '100%',
          }}
        >
          {cards}
          {miscCard}
          {calculatedCard}
        </Box>
      </VStack>
    </Box>
  )
}

export default MotorConfigStep