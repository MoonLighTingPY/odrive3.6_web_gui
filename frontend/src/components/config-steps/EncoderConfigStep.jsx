import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tooltip,
  Icon,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { updateEncoderConfig } from '../../store/slices/configSlice'
import { EncoderMode, getEncoderModeName } from '../../utils/odriveEnums'

const EncoderConfigStep = () => {
  const dispatch = useDispatch()
  const { encoderConfig } = useSelector(state => state.config)

  const handleConfigChange = (field, value) => {
    dispatch(updateEncoderConfig({ [field]: value }))
  }

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} h="100%" p={4} overflow="hidden">
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
                  value={encoderConfig.encoder_type}
                  onChange={(e) => handleConfigChange('encoder_type', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                  size="sm"
                >
                  <option value={EncoderMode.INCREMENTAL}>Incremental (Quadrature)</option>
                  <option value={EncoderMode.HALL}>Hall Effect</option>
                  <option value={EncoderMode.SINCOS}>SinCos</option>
                  <option value={EncoderMode.SPI_ABS_CUI}>SPI Absolute (CUI)</option>
                  <option value={EncoderMode.SPI_ABS_AMS}>SPI Absolute (AMS)</option>
                  <option value={EncoderMode.SPI_ABS_AEAT}>SPI Absolute (AEAT)</option>
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
                <Tab fontSize="xs">Incremental</Tab>
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
                        <NumberInput
                          value={encoderConfig.cpr}
                          onChange={(_, value) => handleConfigChange('cpr', value)}
                          step={1}
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                      </FormControl>

                      <FormControl flex="1">
                        <FormLabel color="white" mb={1} fontSize="sm">Bandwidth</FormLabel>
                        <HStack>
                          <NumberInput
                            value={encoderConfig.bandwidth}
                            onChange={(_, value) => handleConfigChange('bandwidth', value)}
                            step={100}
                            size="sm"
                          >
                            <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                          </NumberInput>
                          <Text color="gray.300" minW="30px" fontSize="sm">Hz</Text>
                        </HStack>
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
                      <FormLabel color="white" mb={1} fontSize="sm">Calibration Range</FormLabel>
                      <HStack>
                        <NumberInput
                          value={encoderConfig.calib_range}
                          onChange={(_, value) => handleConfigChange('calib_range', value)}
                          step={0.001}
                          precision={6}
                          size="sm"
                        >
                          <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                        </NumberInput>
                        <Text color="gray.300" minW="30px" fontSize="sm">rad</Text>
                      </HStack>
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Hall Settings */}
                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel color="white" mb={1} fontSize="sm">Hall Polarity</FormLabel>
                      <Select
                        value={encoderConfig.hall_polarity}
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
                  </VStack>
                </TabPanel>

                {/* SPI Settings */}
                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel color="white" mb={1} fontSize="sm">SPI CS GPIO Pin</FormLabel>
                      <Select
                        value={encoderConfig.abs_spi_cs_gpio_pin}
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
                  <NumberInput
                    value={encoderConfig.calib_scan_distance}
                    onChange={(_, value) => handleConfigChange('calib_scan_distance', value)}
                    step={1000}
                    size="sm"
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                </FormControl>

                <FormControl flex="1">
                  <FormLabel color="white" mb={1} fontSize="sm">Scan Omega</FormLabel>
                  <HStack>
                    <NumberInput
                      value={encoderConfig.calib_scan_omega}
                      onChange={(_, value) => handleConfigChange('calib_scan_omega', value)}
                      step={0.1}
                      precision={3}
                      size="sm"
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="40px" fontSize="sm">rad/s</Text>
                  </HStack>
                </FormControl>
              </HStack>
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
                {getEncoderModeName(encoderConfig.encoder_type)}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody py={2}>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Encoder Type:</Text>
                <Text fontWeight="bold" color="white" fontSize="sm">
                  {getEncoderModeName(encoderConfig.encoder_type)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">CPR (Incremental):</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {encoderConfig.cpr} counts/rev
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Angular Resolution:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {(360 / encoderConfig.cpr).toFixed(4)}°/count
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.300" fontSize="sm">Bandwidth:</Text>
                <Text fontWeight="bold" color="odrive.300" fontSize="sm">
                  {encoderConfig.bandwidth} Hz
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
                <Text color="gray.300" fontSize="sm">Separate Commutation:</Text>
                <Badge colorScheme={encoderConfig.use_separate_commutation_encoder ? "green" : "gray"} variant="subtle" fontSize="xs">
                  {encoderConfig.use_separate_commutation_encoder ? "Yes" : "No"}
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
              {encoderConfig.encoder_type === EncoderMode.INCREMENTAL && (
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
              {encoderConfig.encoder_type === EncoderMode.HALL && (
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
              {(encoderConfig.encoder_type === EncoderMode.SPI_ABS_CUI || 
                encoderConfig.encoder_type === EncoderMode.SPI_ABS_AMS || 
                encoderConfig.encoder_type === EncoderMode.SPI_ABS_AEAT) && (
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
              </Text>              <Text color="gray.300" fontSize="xs">
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
      </VStack>
    </SimpleGrid>
  )
}

export default EncoderConfigStep