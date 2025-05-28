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
  Alert,
  AlertIcon,
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

  const isIncrementalEncoder = encoderConfig.encoder_type === EncoderMode.INCREMENTAL
  const isHallEncoder = encoderConfig.encoder_type === EncoderMode.HALL
  const isSPIEncoder = encoderConfig.encoder_type >= 256

  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Encoder Configuration
        </Heading>
        <Text color="gray.300" mb={6}>
          Configure your position feedback encoder. Different encoder types require different parameters.
        </Text>
      </Box>

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Encoder Type & Basic Settings</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <HStack>
                <FormLabel color="white" mb={0}>Encoder Type</FormLabel>
                <Tooltip label="Select the type of encoder connected to your motor. This determines which configuration options are available.">
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
                  <FormLabel color="white" mb={0}>Use Separate Commutation Encoder</FormLabel>
                  <Tooltip label="Enable if you have a separate low-resolution encoder for commutation (like Hall sensors) and a high-resolution encoder for position feedback.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={encoderConfig.use_separate_commutation_encoder}
                  onChange={(e) => handleConfigChange('use_separate_commutation_encoder', e.target.checked)}
                  colorScheme="odrive"
                />
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {isIncrementalEncoder && (
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Incremental Encoder Settings</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={6} w="100%">
                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>Counts Per Revolution (CPR)</FormLabel>
                    <Tooltip label="Total encoder counts per full revolution. For quadrature encoders, this is typically 4x the encoder lines (PPR).">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <NumberInput
                    value={encoderConfig.cpr}
                    onChange={(_, value) => handleConfigChange('cpr', value)}
                    min={100}
                    max={20000}
                    step={1}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                </FormControl>

                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>Bandwidth</FormLabel>
                    <Tooltip label="Encoder signal processing bandwidth in Hz. Higher values give better tracking but more noise susceptibility.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={encoderConfig.bandwidth}
                      onChange={(_, value) => handleConfigChange('bandwidth', value)}
                      min={100}
                      max={5000}
                      step={100}
                    >
                      <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                    </NumberInput>
                    <Text color="gray.300" minW="30px">Hz</Text>
                  </HStack>
                </FormControl>
              </HStack>

              <HStack spacing={6} w="100%">
                <FormControl flex="1">
                  <HStack justify="space-between">
                    <HStack>
                      <FormLabel color="white" mb={0}>Use Index Signal</FormLabel>
                      <Tooltip label="Enable if your encoder has an index pulse for absolute position reference.">
                        <Icon as={InfoIcon} color="gray.400" />
                      </Tooltip>
                    </HStack>
                    <Switch
                      isChecked={encoderConfig.use_index}
                      onChange={(e) => handleConfigChange('use_index', e.target.checked)}
                      colorScheme="odrive"
                    />
                  </HStack>
                </FormControl>

                <FormControl flex="1">
                  <HStack>
                    <FormLabel color="white" mb={0}>Calibration Range</FormLabel>
                    <Tooltip label="Angular range for encoder offset calibration in radians. Default is ~1.1 degrees.">
                      <Icon as={InfoIcon} color="gray.400" />
                    </Tooltip>
                  </HStack>
                  <HStack>
                    <NumberInput
                      value={encoderConfig.calib_range}
                      onChange={(_, value) => handleConfigChange('calib_range', value)}
                      min={0.01}
                      max={0.1}
                      step={0.001}
                      precision={6}
                  >
                    <NumberInputField bg="gray.700" border="1px solid" borderColor="gray.600" color="white" />
                  </NumberInput>
                  <Text color="gray.300" minW="30px">rad</Text>
                </HStack>
              </FormControl>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
      )}

      {isHallEncoder && (
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">Hall Effect Encoder Settings</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              Hall effect encoders provide lower resolution but are more robust. They are typically used for commutation rather than precise position control.
            </Alert>
            <VStack spacing={4}>
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>Hall Polarity</FormLabel>
                  <Tooltip label="Polarity setting for Hall effect sensors. May need to be adjusted based on sensor wiring.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Select
                  value={encoderConfig.hall_polarity}
                  onChange={(e) => handleConfigChange('hall_polarity', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                >
                  <option value={0}>Normal</option>
                  <option value={1}>Inverted</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )}

      {isSPIEncoder && (
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="md" color="white">SPI Absolute Encoder Settings</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="info" mb={4}>
              <AlertIcon />
              SPI absolute encoders provide high-resolution absolute position feedback. Make sure your encoder is properly wired to the SPI pins.
            </Alert>
            <VStack spacing={4}>
              <FormControl>
                <HStack>
                  <FormLabel color="white" mb={0}>SPI CS GPIO Pin</FormLabel>
                  <Tooltip label="GPIO pin used for SPI Chip Select signal. Check your ODrive pinout diagram.">
                    <Icon as={InfoIcon} color="gray.400" />
                  </Tooltip>
                </HStack>
                <Select
                  value={encoderConfig.abs_spi_cs_gpio_pin}
                  onChange={(e) => handleConfigChange('abs_spi_cs_gpio_pin', parseInt(e.target.value))}
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                >
                  <option value={1}>GPIO1</option>
                  <option value={2}>GPIO2</option>
                  <option value={3}>GPIO3</option>
                  <option value={4}>GPIO4</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      )}

      <Card bg="gray.700" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Encoder Summary</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text color="gray.300">Encoder Type:</Text>
              <Text fontWeight="bold" color="white">
                {getEncoderModeName(encoderConfig.encoder_type)}
              </Text>
            </HStack>
            {isIncrementalEncoder && (
              <>
                <HStack justify="space-between">
                  <Text color="gray.300">Resolution:</Text>
                  <Text fontWeight="bold" color="odrive.300">
                    {encoderConfig.cpr} counts/rev
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.300">Angular Resolution:</Text>
                  <Text fontWeight="bold" color="odrive.300">
                    {(360 / encoderConfig.cpr).toFixed(4)}°/count
                  </Text>
                </HStack>
              </>
            )}
            <HStack justify="space-between">
              <Text color="gray.300">Separate Commutation:</Text>
              <Text fontWeight="bold" color={encoderConfig.use_separate_commutation_encoder ? "green.300" : "gray.300"}>
                {encoderConfig.use_separate_commutation_encoder ? "Enabled" : "Disabled"}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default EncoderConfigStep