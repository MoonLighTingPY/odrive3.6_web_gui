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

  // Update the encoder mode Select component (around line 150):
  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} h="100%" p={4} overflow="auto">
      {/* Left Column */}
      <VStack spacing={3} align="stretch">

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
      </VStack>
    </SimpleGrid>
  )
}

export default EncoderConfigStep