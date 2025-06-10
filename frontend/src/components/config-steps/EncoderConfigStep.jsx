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
  Select,
  Switch,
  Icon,
  Tooltip,
  SimpleGrid,
  Alert,
  AlertIcon,
  Divider
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { configurationMappings } from '../../utils/odriveCommands'
import { EncoderMode} from '../../utils/odriveEnums'

const EncoderConfigStep = ({ 
  deviceConfig, 
  onReadParameter, 
  onUpdateConfig,
  loadingParams, 
}) => {
  const encoderConfig = deviceConfig.encoder || {}
  const encoderMappings = configurationMappings.encoder

  const handleConfigChange = (configKey, value) => {
    onUpdateConfig('encoder', configKey, value)
  }

  const handleRefresh = (configKey) => {
    const odriveParam = encoderMappings[configKey]
    if (odriveParam) {
      onReadParameter(odriveParam, 'encoder', configKey)
    }
  }

  const isLoading = (configKey) => {
    return loadingParams.has(`encoder.${configKey}`)
  }

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
                <Select
                  value={encoderConfig.mode ?? EncoderMode.HALL}
                  onChange={(e) => handleConfigChange('mode', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  size="sm"
                >
                  <option value={EncoderMode.INCREMENTAL}>Incremental</option>
                  <option value={EncoderMode.HALL}>Hall Effect</option>
                  <option value={EncoderMode.SINCOS}>SinCos</option>
                  <option value={EncoderMode.SPI_ABS_CUI}>SPI Absolute (CUI)</option>
                  <option value={EncoderMode.SPI_ABS_AMS}>SPI Absolute (AMS)</option>
                  <option value={EncoderMode.SPI_ABS_AEAT}>SPI Absolute (AEAT)</option>
                  <option value={EncoderMode.SPI_ABS_RLS}>SPI Absolute (RLS)</option>
                  <option value={EncoderMode.SPI_ABS_MA732}>SPI Absolute (MA732)</option>
                </Select>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="100%">
                <FormControl>
                  <HStack spacing={2} mb={1}>
                    <FormLabel color="white" mb={0} fontSize="sm">Hall Polarity</FormLabel>
                    <Tooltip label="Normal or inverted hall signal polarity. Hall encoders use CPR = pole_pairs × 6 and GPIO pins 9,10,11 (axis0) / 12,13,14 (axis1).">
                      <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                    </Tooltip>
                  </HStack>
                  <Select
                    value={encoderConfig.hall_polarity || 0}
                    onChange={(e) => handleConfigChange('hall_polarity', parseInt(e.target.value))}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    size="sm"
                  >
                    <option value={0}>Normal</option>
                    <option value={1}>Inverted</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <HStack spacing={2} mb={1}>
                    <FormLabel color="white" mb={0} fontSize="sm">SPI CS GPIO Pin</FormLabel>
                    <Tooltip label="GPIO pin for SPI chip select. Avoid GPIO1/2 if using UART_A. CUI encoders typically use CPR = 16384 or 4096.">
                      <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                    </Tooltip>
                  </HStack>
                  <Select
                    value={encoderConfig.abs_spi_cs_gpio_pin || 4}
                    onChange={(e) => handleConfigChange('abs_spi_cs_gpio_pin', parseInt(e.target.value))}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    size="sm"
                  >
                    <option value={1}>GPIO1</option>
                    <option value={2}>GPIO2</option>
                    <option value={3}>GPIO3</option>
                    <option value={4}>GPIO4</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Encoder Configuration */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={1}>
            <Heading size="sm" color="white">Encoder Configuration</Heading>
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
                </VStack>
              </Box>

              {/* Center Column - Calibration Settings */}
              <Box>
                <Text fontWeight="bold" color="green.300" mb={2} fontSize="sm">Calibration Settings</Text>
                <VStack spacing={2} align="stretch">
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

                  <FormControl>
                    <FormLabel color="white" mb={1} fontSize="xs">Direction</FormLabel>
                    <Select
                      value={encoderConfig.direction || 1}
                      onChange={(e) => handleConfigChange('direction', parseInt(e.target.value))}
                      bg="gray.700"
                      border="1px solid"
                      borderColor="gray.600"
                      color="white"
                      size="sm"
                      maxW="100px"
                    >
                      <option value={1}>Forward</option>
                      <option value={-1}>Reverse</option>
                    </Select>
                  </FormControl>
                </VStack>
              </Box>

              {/* Right Column - Advanced Settings */}
              <Box>
                <Text fontWeight="bold" color="purple.300" mb={2} fontSize="sm">Advanced Settings</Text>
                <VStack spacing={2} align="stretch">

                  <HStack spacing={2}>
                    <Switch
                      isChecked={encoderConfig.hall_polarity_calibrated}
                      onChange={(e) => handleConfigChange('hall_polarity_calibrated', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                    <FormLabel color="white" mb={0} fontSize="xs">Hall Polarity Calibrated</FormLabel>
                    <Tooltip label="Indicates if hall polarity calibration has been completed.">
                      <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                    </Tooltip>
                  </HStack>

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
                      isChecked={encoderConfig.use_index_offset}
                      onChange={(e) => handleConfigChange('use_index_offset', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                    <FormLabel color="white" mb={0} fontSize="xs">Use Index Offset</FormLabel>
                    <Tooltip label="Use stored index offset for faster startup.">
                      <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                    </Tooltip>
                  </HStack>

                  <HStack spacing={2}>
                    <Switch
                      isChecked={encoderConfig.find_idx_on_lockin_only}
                      onChange={(e) => handleConfigChange('find_idx_on_lockin_only', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                    <FormLabel color="white" mb={0} fontSize="xs">Find Index on Lockin</FormLabel>
                    <Tooltip label="Only search for index during motor lockin phase.">
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
      </VStack>
    </Box>
  )
}

export default EncoderConfigStep