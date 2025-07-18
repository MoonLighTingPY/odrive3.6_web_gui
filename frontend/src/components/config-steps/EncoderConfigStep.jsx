import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Switch,
  Icon,
  Tooltip,
  SimpleGrid,
  Alert,
  AlertIcon,
  Collapse,
  useDisclosure,
  Button,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import { EncoderMode } from '../../utils/odriveEnums'
import {
  getGroupedAdvancedParameters,
} from '../../utils/configParameterGrouping'
import { useSelector } from 'react-redux'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'

// Encoder parameter groups
const ENCODER_PARAM_GROUPS = {
  // Essential Encoder Settings
  encoder_type: { group: 'Encoder', subgroup: 'Basics', importance: 'essential' },
  cpr: { group: 'Encoder', subgroup: 'Basics', importance: 'essential' },
  bandwidth: { group: 'Encoder', subgroup: 'Basics', importance: 'essential' },
  direction: { group: 'Encoder', subgroup: 'Basics', importance: 'essential' },
  calib_range: { group: 'Calibration', subgroup: 'Settings', importance: 'essential' },
  calib_scan_distance: { group: 'Calibration', subgroup: 'Settings', importance: 'essential' },
  calib_scan_omega: { group: 'Calibration', subgroup: 'Settings', importance: 'essential' },
  
  // Advanced parameters
  pre_calibrated: { group: 'Calibration', subgroup: 'Advanced', importance: 'advanced' },
  use_index: { group: 'Index', subgroup: 'Index', importance: 'advanced' },
  use_index_offset: { group: 'Index', subgroup: 'Index', importance: 'advanced' },
  find_idx_on_lockin_only: { group: 'Index', subgroup: 'Index', importance: 'advanced' },
  enable_phase_interpolation: { group: 'Encoder', subgroup: 'Advanced', importance: 'advanced' },
  
  // Hall-specific
  hall_polarity: { group: 'Hall', subgroup: 'Hall', importance: 'advanced' },
  hall_polarity_calibrated: { group: 'Hall', subgroup: 'Hall', importance: 'advanced' },
  ignore_illegal_hall_state: { group: 'Hall', subgroup: 'Hall', importance: 'advanced' },
  
  // SPI-specific
  abs_spi_cs_gpio_pin: { group: 'SPI', subgroup: 'SPI', importance: 'advanced' },
  
  // SinCos-specific
  sincos_gpio_pin_sin: { group: 'SinCos', subgroup: 'SinCos', importance: 'advanced' },
  sincos_gpio_pin_cos: { group: 'SinCos', subgroup: 'SinCos', importance: 'advanced' },
  
  // Other advanced parameters
  index_offset: { group: 'Index', subgroup: 'Index', importance: 'advanced' },
  phase_offset: { group: 'Encoder', subgroup: 'Advanced', importance: 'advanced' },
  phase_offset_float: { group: 'Encoder', subgroup: 'Advanced', importance: 'advanced' },
}

const EncoderConfigStep = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Get axis-specific encoder config
  const encoderConfig = deviceConfig.encoder?.[`axis${selectedAxis}`] || {}
  const encoderParams = getCategoryParameters('encoder')

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('encoder', configKey, value, selectedAxis)
  }

  const handleRefresh = (configKey) => {
    onReadParameter('encoder', configKey, selectedAxis)
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`encoder.${configKey}`)
  }

  // Get advanced parameters grouped by category
  const groupedAdvancedParams = getGroupedAdvancedParameters(encoderParams, ENCODER_PARAM_GROUPS)
  const totalAdvancedCount = Object.values(groupedAdvancedParams)
    .reduce((total, group) => total + Object.values(group).reduce((groupTotal, subgroup) => groupTotal + subgroup.length, 0), 0)

  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure()

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={3} align="stretch" maxW="1400px" mx="auto">

        {/* Basic Settings */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">Basic Settings</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack spacing={2} mb={1}>
                  <FormLabel color="white" mb={0} fontSize="sm">Encoder Type</FormLabel>
                  <Tooltip label="Select the type of encoder connected to your motor.">
                    <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                  </Tooltip>
                </HStack>
                <ParameterSelect
                  value={encoderConfig.encoder_type ?? ""}
                  onChange={(e) => handleConfigChange('encoder_type', parseInt(e.target.value))}
                  onRefresh={() => handleRefresh('encoder_type')}
                  isLoading={isLoading('encoder_type')}
                  parameterPath="axis0.encoder.config.mode"
                  configKey="encoder_type"
                  size="sm"
                  placeholder="Select encoder type"
                />
              </FormControl>

              {/* Type-specific helper info */}
              {encoderConfig.encoder_type === EncoderMode.HALL && (
                <Alert status="info" py={2} fontSize="xs">
                  <AlertIcon boxSize={3} />
                  <Text fontSize="xs">Hall encoders use CPR = pole_pairs × 6 and GPIO pins 9,10,11 (axis0) / 12,13,14 (axis1).</Text>
                </Alert>
              )}

              {(encoderConfig.encoder_type === EncoderMode.SPI_ABS_CUI || 
                encoderConfig.encoder_type === EncoderMode.SPI_ABS_AMS ||
                encoderConfig.encoder_type === EncoderMode.SPI_ABS_AEAT ||
                encoderConfig.encoder_type === EncoderMode.SPI_ABS_RLS ||
                encoderConfig.encoder_type === EncoderMode.SPI_ABS_MA732) && (
                <Alert status="info" py={2} fontSize="xs">
                  <AlertIcon boxSize={3} />
                  <Text fontSize="xs">SPI encoders require CS GPIO pin configuration. CUI encoders typically use CPR = 16384 or 4096.</Text>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Essential Encoder Configuration - Keep existing 3-column layout */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">Essential Encoder Configuration</Heading>
          </CardHeader>
          <CardBody py={2}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} gap={4}>

              {/* Left Column - General Settings */}
              <Box>
                <Text fontWeight="bold" color="blue.300" mb={2} fontSize="sm">General Settings</Text>
                <VStack spacing={2} align="stretch">
                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="xs">CPR</FormLabel>
                    <ParameterInput
                      value={encoderConfig.cpr}
                      onChange={(value) => handleConfigChange('cpr', parseInt(value) || 0)}
                      onRefresh={() => handleRefresh('cpr')}
                      isLoading={isLoading('cpr')}
                      precision={0}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="xs">Bandwidth</FormLabel>
                    <ParameterInput
                      value={encoderConfig.bandwidth}
                      onChange={(value) => handleConfigChange('bandwidth', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('bandwidth')}
                      isLoading={isLoading('bandwidth')}
                      unit="Hz"
                      precision={0}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="xs">Direction</FormLabel>
                    <ParameterSelect
                      value={encoderConfig.direction ?? ""}
                      onChange={(e) => handleConfigChange('direction', parseInt(e.target.value))}
                      onRefresh={() => handleRefresh('direction')}
                      isLoading={isLoading('direction')}
                      parameterPath="axis0.encoder.config.direction"
                      configKey="direction"
                      size="sm"
                      placeholder="Select direction"
                    >
                    </ParameterSelect>
                  </FormControl>
                </VStack>
              </Box>

              {/* Center Column - Calibration Settings */}
              <Box>
                <Text fontWeight="bold" color="green.300" mb={2} fontSize="sm">Calibration Settings</Text>
                <VStack spacing={2} align="stretch">
                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="xs">Calibration Range</FormLabel>
                    <ParameterInput
                      value={encoderConfig.calib_range}
                      onChange={(value) => handleConfigChange('calib_range', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('calib_range')}
                      isLoading={isLoading('calib_range')}
                      unit="rad"
                      precision={6}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="xs">Scan Distance</FormLabel>
                    <ParameterInput
                      value={encoderConfig.calib_scan_distance}
                      onChange={(value) => handleConfigChange('calib_scan_distance', parseInt(value) || 0)}
                      onRefresh={() => handleRefresh('calib_scan_distance')}
                      isLoading={isLoading('calib_scan_distance')}
                      precision={0}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="xs">Scan Omega</FormLabel>
                    <ParameterInput
                      value={encoderConfig.calib_scan_omega}
                      onChange={(value) => handleConfigChange('calib_scan_omega', parseFloat(value) || 0)}
                      onRefresh={() => handleRefresh('calib_scan_omega')}
                      isLoading={isLoading('calib_scan_omega')}
                      unit="rad/s"
                      precision={3}
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Right Column - Quick Settings */}
              <Box>
                <Text fontWeight="bold" color="purple.300" mb={2} fontSize="sm">Quick Settings</Text>
                <VStack spacing={2} align="stretch">
                  <HStack spacing={2}>
                    <Switch
                      isChecked={encoderConfig.use_index}
                      onChange={(e) => handleConfigChange('use_index', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                    <FormLabel color="white" mb={0} fontSize="xs">Use Index</FormLabel>
                    <Tooltip label="Enable if your encoder has an index pulse.">
                      <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                    </Tooltip>
                  </HStack>

                  <HStack spacing={2}>
                    <Switch
                      isChecked={encoderConfig.pre_calibrated}
                      onChange={(e) => handleConfigChange('pre_calibrated', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                    <FormLabel color="white" mb={0} fontSize="xs">Pre-calibrated</FormLabel>
                    <Tooltip label="Mark encoder as already calibrated to skip calibration on startup.">
                      <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                    </Tooltip>
                  </HStack>

                  <HStack spacing={2}>
                    <Switch
                      isChecked={encoderConfig.enable_phase_interpolation}
                      onChange={(e) => handleConfigChange('enable_phase_interpolation', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                    <FormLabel color="white" mb={0} fontSize="xs">Phase Interpolation</FormLabel>
                    <Tooltip label="Improve encoder resolution using motor phase information.">
                      <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                    </Tooltip>
                  </HStack>
                </VStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Advanced Settings - Collapsible with grouping */}
        {totalAdvancedCount > 0 && (
          <Card bg="gray.800" variant="elevated">
            <CardHeader py={2}>
              <HStack justify="space-between">
                <Heading size="sm" color="white">Advanced Settings</Heading>
                <Button size="sm" variant="ghost" onClick={onAdvancedToggle}>
                  {isAdvancedOpen ? 'Hide' : 'Show'} Advanced ({totalAdvancedCount} parameters)
                </Button>
              </HStack>
            </CardHeader>
            <Collapse in={isAdvancedOpen}>
              <CardBody py={3}>
                <VStack spacing={4} align="stretch">
                  {Object.entries(groupedAdvancedParams).map(([groupName, subgroups]) => (
                    <Box key={groupName}>
                      <Text fontWeight="bold" color="blue.200" fontSize="sm" mb={3}>
                        {groupName}
                      </Text>
                      <VStack spacing={3} align="stretch" pl={2}>
                        {Object.entries(subgroups).map(([subgroupName, params]) => (
                          <Box key={subgroupName}>
                            <Text fontWeight="semibold" color="blue.300" fontSize="xs" mb={2}>
                              {subgroupName}
                            </Text>
                            <ParameterFormGrid
                              params={params}
                              config={encoderConfig}
                              onChange={handleConfigChange}
                              onRefresh={handleRefresh}
                              isLoading={isLoading}
                              layout="compact"
                              showGrouping={false}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Collapse>
          </Card>
        )}
      </VStack>
    </Box>
  )
}

export default EncoderConfigStep