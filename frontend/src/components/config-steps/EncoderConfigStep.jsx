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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import ParameterInput from '../buttons/ParameterInput'
import { configurationMappings } from '../../utils/odriveCommands'
import { EncoderMode } from '../../utils/odriveEnums'

const EncoderConfigStep = ({ 
  deviceConfig, 
  onReadParameter, 
  onUpdateConfig,
  loadingParams, 
  isConnected 
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

  // Encoder mode names for display
  const getEncoderModeName = (mode) => {
    switch (mode) {
      case 0: return 'Incremental'
      case 1: return 'Hall Effect'
      case 2: return 'SinCos'
      case 3: return 'SPI Absolute (CUI)'
      case 4: return 'SPI Absolute (AMS)'
      case 5: return 'SPI Absolute (AEAT)'
      default: return 'Unknown'
    }
  }

  // Calculate derived values
  const angularResolution = encoderConfig.cpr ? (360 / encoderConfig.cpr).toFixed(4) : '0.0900'
  const hallCpr = encoderConfig.encoder_type === 1 ? (encoderConfig.pole_pairs || 15) * 6 : null

  // Update the encoder mode Select component (around line 150):
  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} h="100%" p={4} overflow="auto">
      {/* Left Column */}
      <VStack spacing={3} align="stretch">
        <Box>
          <Heading size="md" color="white" mb={1}>
            Encoder Configuration
          </Heading>
          <Text color="gray.300" fontSize="sm">
            Configure your position feedback encoder and calibration settings.
          </Text>
        </Box>

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Basic Settings</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={1} fontSize="sm">Encoder Type</FormLabel>
                  <Tooltip label="Select the type of encoder connected to your motor.">
                    <Icon as={InfoIcon} color="gray.400" />
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

              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={1} fontSize="sm">Use Separate Commutation Encoder</FormLabel>
                    <Tooltip label="Enable if you have a separate low-resolution encoder for commutation.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={encoderConfig.use_separate_commutation_encoder}
                    onChange={(e) => handleConfigChange('use_separate_commutation_encoder', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Encoder Type Specific Settings */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Encoder Type Settings</Heading>
          </CardHeader>
          <CardBody py={2}>
            <Tabs variant="soft-rounded" colorScheme="odrive" size="sm">
              <TabList mb={3}>
                <Tab fontSize="xs">General</Tab>
                <Tab fontSize="xs">Hall</Tab>
                <Tab fontSize="xs">SPI</Tab>
              </TabList>
              <TabPanels>
                {/* Incremental Settings */}
                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <HStack spacing={3} w="100%">
                      <FormControl flex="1">
                        <FormLabel color="white" mb={1} fontSize="sm">CPR</FormLabel>
                        <ParameterInput
                          value={encoderConfig.cpr}
                          onChange={(value) => handleConfigChange('cpr', parseInt(value) || 0)}
                          onRefresh={() => handleRefresh('cpr')}
                          isLoading={isLoading('cpr')}
                          step={1}
                          precision={0}
                          min={1}
                          max={65536}
                        />
                      </FormControl>

                      <FormControl flex="1">
                        <FormLabel color="white" mb={1} fontSize="sm">Bandwidth</FormLabel>
                        <ParameterInput
                          value={encoderConfig.bandwidth}
                          onChange={(value) => handleConfigChange('bandwidth', parseFloat(value) || 0)}
                          onRefresh={() => handleRefresh('bandwidth')}
                          isLoading={isLoading('bandwidth')}
                          unit="Hz"
                          step={100}
                          precision={0}
                          min={100}
                          max={10000}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={1} fontSize="sm">Use Index Signal</FormLabel>
                          <Tooltip label="Enable if your encoder has an index pulse.">
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                        <Switch
                          isChecked={encoderConfig.use_index}
                          onChange={(e) => handleConfigChange('use_index', e.target.checked)}
                          colorScheme="odrive"
                          size="sm"
                        />
                      </HStack>
                    </FormControl>

                    <FormControl>
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={1} fontSize="sm">Use Index Offset</FormLabel>
                          <Tooltip label="Use stored index offset for faster startup.">
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                        <Switch
                          isChecked={encoderConfig.use_index_offset}
                          onChange={(e) => handleConfigChange('use_index_offset', e.target.checked)}
                          colorScheme="odrive"
                          size="sm"
                        />
                      </HStack>
                    </FormControl>

                    <FormControl>
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={1} fontSize="sm">Find Index on Lockin Only</FormLabel>
                          <Tooltip label="Only search for index during motor lockin phase.">
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                        <Switch
                          isChecked={encoderConfig.find_idx_on_lockin_only}
                          onChange={(e) => handleConfigChange('find_idx_on_lockin_only', e.target.checked)}
                          colorScheme="odrive"
                          size="sm"
                        />
                      </HStack>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="white" mb={1} fontSize="sm">Calibration Range</FormLabel>
                      <ParameterInput
                        value={encoderConfig.calib_range}
                        onChange={(value) => handleConfigChange('calib_range', parseFloat(value) || 0)}
                        onRefresh={() => handleRefresh('calib_range')}
                        isLoading={isLoading('calib_range')}
                        unit="rad"
                        step={0.001}
                        precision={6}
                        min={0.001}
                        max={1.0}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Hall Settings */}
                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel color="white" mb={1} fontSize="sm">Hall Polarity</FormLabel>
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
                      <HStack justify="space-between">
                        <HStack>
                          <FormLabel color="white" mb={1} fontSize="sm">Hall Polarity Calibrated</FormLabel>
                          <Tooltip label="Indicates if hall polarity calibration has been completed.">
                            <Icon as={InfoIcon} color="gray.400" />
                          </Tooltip>
                        </HStack>
                        <Switch
                          isChecked={encoderConfig.hall_polarity_calibrated}
                          onChange={(e) => handleConfigChange('hall_polarity_calibrated', e.target.checked)}
                          colorScheme="odrive"
                          size="sm"
                        />
                      </HStack>
                    </FormControl>

                    <Alert status="info" py={2}>
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">Hall Effect Encoder Configuration:</Text>
                        <Text fontSize="xs">• CPR = pole_pairs × 6 (for hoverboard: 15 × 6 = 90)</Text>
                        <Text fontSize="xs">• Run hall polarity calibration before offset calibration</Text>
                        <Text fontSize="xs">• GPIO pins 9,10,11 for axis0 / 12,13,14 for axis1</Text>
                      </VStack>
                    </Alert>
                  </VStack>
                </TabPanel>

                {/* SPI Settings */}
                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel color="white" mb={1} fontSize="sm">SPI CS GPIO Pin</FormLabel>
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

                    <Alert status="warning" py={2}>
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">SPI Absolute Encoder Notes:</Text>
                        <Text fontSize="xs">• Avoid GPIO1/2 if using UART_A</Text>
                        <Text fontSize="xs">• CUI: CPR = 2^14 (16384) or 2^12 (4096) for AMT232A/233A</Text>
                        <Text fontSize="xs">• AMS: CPR = 2^14 (16384) for AS5047P/AS5048A</Text>
                        <Text fontSize="xs">• Magnet must be centered on motor shaft</Text>
                      </VStack>
                    </Alert>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* Advanced Settings */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Calibration Settings</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3}>
              <HStack spacing={3} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Scan Distance</FormLabel>
                  <ParameterInput
                    value={encoderConfig.calib_scan_distance}
                    onChange={(value) => handleConfigChange('calib_scan_distance', parseInt(value) || 0)}
                    onRefresh={() => handleRefresh('calib_scan_distance')}
                    isLoading={isLoading('calib_scan_distance')}
                    step={1000}
                    precision={0}
                    min={1000}
                    max={50000}
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Scan Omega</FormLabel>
                  <ParameterInput
                    value={encoderConfig.calib_scan_omega}
                    onChange={(value) => handleConfigChange('calib_scan_omega', parseFloat(value) || 0)}
                    onRefresh={() => handleRefresh('calib_scan_omega')}
                    isLoading={isLoading('calib_scan_omega')}
                    unit="rad/s"
                    step={0.1}
                    precision={3}
                    min={1}
                    max={50}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={3} w="100%">
                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Direction</FormLabel>
                  <Select
                    value={encoderConfig.direction || 1}
                    onChange={(e) => handleConfigChange('direction', parseInt(e.target.value))}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    size="sm"
                  >
                    <option value={1}>Forward</option>
                    <option value={-1}>Reverse</option>
                  </Select>
                </FormControl>

                <FormControl flex="1">
                  <HStack justify="space-between">
                    <HStack>
                      <FormLabel color="white" mb={1} fontSize="sm">Enable Phase Interpolation</FormLabel>
                      <Tooltip label="Improve encoder resolution using motor phase information.">
                        <Icon as={InfoIcon} color="gray.400" />
                      </Tooltip>
                    </HStack>
                    <Switch
                      isChecked={encoderConfig.enable_phase_interpolation}
                      onChange={(e) => handleConfigChange('enable_phase_interpolation', e.target.checked)}
                      colorScheme="odrive"
                      size="sm"
                    />
                  </HStack>
                </FormControl>
              </HStack>

              <FormControl>
                <HStack justify="space-between">
                  <HStack>
                    <FormLabel color="white" mb={1} fontSize="sm">Pre-Calibrated</FormLabel>
                    <Tooltip label="Set to true after successful calibration to skip calibration on startup.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <Switch
                    isChecked={encoderConfig.pre_calibrated}
                    onChange={(e) => handleConfigChange('pre_calibrated', e.target.checked)}
                    colorScheme="odrive"
                    size="sm"
                  />
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Right Column - Summary and Status */}
      <VStack spacing={3} align="stretch">
        <Box>
          <Heading size="md" color="white" mb={1}>
            Encoder Summary
          </Heading>
          <Text color="gray.300" fontSize="sm">
            Current encoder configuration overview.
          </Text>
        </Box>

        <Card bg="gray.700" variant="elevated">
          <CardHeader py={2}>
            <HStack justify="space-between">
              <Heading size="sm" color="white">Configuration Status</Heading>
              <Badge colorScheme="odrive" variant="subtle">
                {getEncoderModeName(encoderConfig.encoder_type || 0)}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Encoder Type:</Text>
                <Text fontWeight="bold" color="white" fontSize="sm">
                  {getEncoderModeName(encoderConfig.encoder_type || 0)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">CPR:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {hallCpr ? `${hallCpr} (Hall)` : `${encoderConfig.cpr || 4000} counts/rev`}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Angular Resolution:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {angularResolution}°/count
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Bandwidth:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {encoderConfig.bandwidth || 1000} Hz
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Use Index:</Text>
                <Badge colorScheme={encoderConfig.use_index ? "green" : "gray"} variant="subtle" fontSize="xs">
                  {encoderConfig.use_index ? "Yes" : "No"}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Hall Polarity:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {encoderConfig.hall_polarity === 0 ? "Normal" : "Inverted"}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Direction:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {encoderConfig.direction === -1 ? "Reverse" : "Forward"}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Pre-Calibrated:</Text>
                <Badge colorScheme={encoderConfig.pre_calibrated ? "green" : "gray"} variant="subtle" fontSize="xs">
                  {encoderConfig.pre_calibrated ? "Yes" : "No"}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Encoder Type Information */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Encoder Information</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={3} align="stretch">
              {encoderConfig.encoder_type === 0 && (
                <VStack spacing={2} align="stretch">
                  <Text color="odrive.300" fontWeight="bold" fontSize="sm">Incremental Encoder</Text>
                  <Text color="gray.300" fontSize="xs">
                    Most common encoder type. Provides quadrature signals (A/B) and optionally an index pulse (Z).
                    CPR = 4 × encoder lines (PPR).
                  </Text>
                  <Text color="gray.300" fontSize="xs">
                    <strong>Typical CPR values:</strong> 1000-8000 for most motors
                  </Text>
                </VStack>
              )}
              {encoderConfig.encoder_type === 1 && (
                <VStack spacing={2} align="stretch">
                  <Text color="odrive.300" fontWeight="bold" fontSize="sm">Hall Effect Encoder</Text>
                  <Text color="gray.300" fontSize="xs">
                    Low resolution encoder using Hall effect sensors. Provides 6 states per pole pair.
                    CPR = pole_pairs × 6.
                  </Text>
                  <Text color="gray.300" fontSize="xs">
                    <strong>For hoverboard motors:</strong> CPR = 15 × 6 = 90
                  </Text>
                </VStack>
              )}
              {(encoderConfig.encoder_type === 3 || 
                encoderConfig.encoder_type === 4 || 
                encoderConfig.encoder_type === 5) && (
                <VStack spacing={2} align="stretch">
                  <Text color="odrive.300" fontWeight="bold" fontSize="sm">SPI Absolute Encoder</Text>
                  <Text color="gray.300" fontSize="xs">
                    High resolution absolute position encoder using SPI communication.
                    Provides absolute position without calibration.
                  </Text>
                  <Text color="gray.300" fontSize="xs">
                    <strong>Requires:</strong> SPI bus connection and CS pin configuration
                  </Text>
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Calibration Guidelines */}
        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="sm" color="white">Calibration Guidelines</Heading>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="stretch">
              <Text color="gray.300" fontSize="xs">
                <strong>Scan Distance:</strong> Distance to scan during calibration. 
                Higher values give better accuracy but take longer.
              </Text>
              <Text color="gray.300" fontSize="xs">
                <strong>Scan Omega:</strong> Angular velocity during calibration. 
                Lower values are more accurate but slower.
              </Text>
              <Text color="gray.300" fontSize="xs">
                <strong>Index Signal:</strong> If enabled, encoder will search for 
                index pulse during calibration for absolute reference.
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Alert status="info" variant="left-accent">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="sm">ODrive v0.5.6 Encoder Tips:</Text>
            <Text fontSize="xs">• Use refresh buttons to read current values from ODrive</Text>
            <Text fontSize="xs">• Changes are applied immediately to the device</Text>
            <Text fontSize="xs">• Test encoder with shadow_count before calibration</Text>
            <Text fontSize="xs">• Hall encoders require polarity calibration first</Text>
          </VStack>
        </Alert>
      </VStack>
    </SimpleGrid>
  )
}

export default EncoderConfigStep