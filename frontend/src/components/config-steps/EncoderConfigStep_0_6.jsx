import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react'
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import ParameterSelect from '../config-parameter-fields/ParameterSelect'
import ParameterSwitch from '../config-parameter-fields/ParameterSwitch'
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'
import { useVersionedUtils } from '../../utils/versionSelection'
import { useSelector } from 'react-redux'

// Encoder parameter groups for 0.6.x API
const ENCODER_PARAM_GROUPS_06 = {
  // Essential Encoder Settings (enhanced in 0.6.x)
  encoder_use_index: { group: 'Index', subgroup: 'Index Configuration', importance: 'essential' },
  pre_calibrated: { group: 'Calibration', subgroup: 'Calibration Status', importance: 'essential' },
  encoder_cpr: { group: 'Encoder', subgroup: 'Basics', importance: 'essential' },
  encoder_bandwidth: { group: 'Encoder', subgroup: 'Filtering', importance: 'essential' },

  // Enhanced Incremental Encoder (0.6.x improvements)
  inc_encoder_enabled: { group: 'Incremental Encoder', subgroup: 'Configuration', importance: 'essential' },
  inc_encoder_cpr: { group: 'Incremental Encoder', subgroup: 'Configuration', importance: 'essential' },
  inc_encoder_filter: { group: 'Incremental Encoder', subgroup: 'Filtering', importance: 'advanced' }, // New in 0.6.x

  // Enhanced SPI Encoder (0.6.x features)  
  spi_encoder_enabled: { group: 'SPI Encoder', subgroup: 'Configuration', importance: 'advanced' },
  spi_encoder_mode: { group: 'SPI Encoder', subgroup: 'Configuration', importance: 'advanced' },
  spi_encoder_ncs_pin: { group: 'SPI Encoder', subgroup: 'Hardware', importance: 'advanced' },
  spi_encoder_cpr: { group: 'SPI Encoder', subgroup: 'Configuration', importance: 'advanced' },
  biss_c_multiturn_bits: { group: 'SPI Encoder', subgroup: 'BiSS-C', importance: 'advanced' }, // Enhanced in 0.6.x

  // New RS485 Encoder Support (0.6.x)
  rs485_encoder_enabled: { group: 'RS485 Encoder', subgroup: 'Configuration', importance: 'advanced' }, // New in 0.6.x
  rs485_encoder_mode: { group: 'RS485 Encoder', subgroup: 'Configuration', importance: 'advanced' }, // New in 0.6.x
  rs485_encoder_baudrate: { group: 'RS485 Encoder', subgroup: 'Communication', importance: 'advanced' }, // New in 0.6.x

  // Enhanced Hall Encoder (0.6.x improvements)
  hall_encoder_enabled: { group: 'Hall Encoder', subgroup: 'Configuration', importance: 'advanced' },
  hall_encoder_cpr: { group: 'Hall Encoder', subgroup: 'Configuration', importance: 'advanced' },

  // Enhanced Index Search (0.6.x changes)
  index_search_always_on: { group: 'Index Search', subgroup: 'Legacy', importance: 'advanced' }, // Deprecated in 0.6.x
  passive_index_search: { group: 'Index Search', subgroup: 'Configuration', importance: 'advanced' }, // New in 0.6.x

  // Calibration settings
  calib_range: { group: 'Calibration', subgroup: 'Range', importance: 'advanced' },
  calib_scan_distance: { group: 'Calibration', subgroup: 'Scanning', importance: 'advanced' },
  calib_scan_omega: { group: 'Calibration', subgroup: 'Scanning', importance: 'advanced' },

  // Harmonic Compensation (New in 0.6.x)
  harmonic_compensation_enabled: { group: 'Harmonic Compensation', subgroup: 'Configuration', importance: 'advanced' }, // New in 0.6.x
  harmonic_compensation_order: { group: 'Harmonic Compensation', subgroup: 'Configuration', importance: 'advanced' }, // New in 0.6.x
  
  // De-skewing (New in 0.6.x)
  deskew_enabled: { group: 'De-skewing', subgroup: 'Configuration', importance: 'advanced' }, // New in 0.6.x
  deskew_angle: { group: 'De-skewing', subgroup: 'Configuration', importance: 'advanced' }, // New in 0.6.x
}

const EncoderConfigStep06 = ({
  deviceConfig,
  onReadParameter,
  onUpdateConfig,
  loadingParams,
}) => {
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Get axis-specific encoder config
  const encoderConfig = deviceConfig.encoder?.[`axis${selectedAxis}`] || {}

  const { registry, grouping } = useVersionedUtils()

  // Get encoder parameters for 0.6.x
  const encoderParams = registry.getConfigCategories().encoder || []
  
  // Filter parameters by importance
  const essentialParams = grouping.getParametersByImportance(encoderParams, ENCODER_PARAM_GROUPS_06, 'essential')
  const advancedParams = grouping.getParametersByImportance(encoderParams, ENCODER_PARAM_GROUPS_06, 'advanced')
    .filter(param => grouping.getParameterImportance(param, ENCODER_PARAM_GROUPS_06) === 'advanced')

  // Group advanced parameters
  const groupedAdvancedParams = grouping.getGroupedAdvancedParameters(advancedParams, ENCODER_PARAM_GROUPS_06)

  const handleParameterChange = (configKey, value) => {
    onUpdateConfig('encoder', configKey, value)
  }

  const handleLoadDefaults = () => {
    // 0.6.x specific defaults
    const defaults = {
      encoder_use_index: true,
      pre_calibrated: false,
      encoder_cpr: 8192,
      encoder_bandwidth: 1000.0,
      inc_encoder_enabled: true,
      inc_encoder_cpr: 8192,
      inc_encoder_filter: 4.0, // New filtering option in 0.6.x
      spi_encoder_enabled: false,
      hall_encoder_enabled: false,
      rs485_encoder_enabled: false, // New in 0.6.x
      passive_index_search: true, // Replaces index_search_always_on in 0.6.x
      harmonic_compensation_enabled: false, // New in 0.6.x
      deskew_enabled: false, // New in 0.6.x
    }

    Object.entries(defaults).forEach(([key, value]) => {
      handleParameterChange(key, value)
    })
  }

  // Encoder mode options (may have additions in 0.6.x)
  const spiEncoderModeOptions = [
    { value: 0, label: 'AMT21' },
    { value: 1, label: 'AMS AS5047P' },
    { value: 2, label: 'AMS AS5048A' },
    { value: 3, label: 'AEAT-9000' },
    { value: 4, label: 'BiSS-C' },
    { value: 5, label: 'RLS RM08' },
  ]

  // New RS485 encoder modes (0.6.x)
  const rs485EncoderModeOptions = [
    { value: 0, label: 'Disabled' },
    { value: 1, label: 'AMT21 Polling' }, // Replaces old AMT21 mode
    { value: 2, label: 'AMT21 Event Driven' },
    { value: 3, label: 'OA1 Encoder' }, // New in 0.6.x
    { value: 4, label: 'Novohall RSC-2800' }, // Experimental in 0.6.x
  ]

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <HStack>
              <Heading size="md" color="purple.400">
                Encoder Configuration (0.6.x)
              </Heading>
              <Badge colorScheme="purple" variant="outline" fontSize="xs">
                Axis {selectedAxis}
              </Badge>
            </HStack>
            <Button
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={handleLoadDefaults}
              leftIcon={<RepeatIcon />}
            >
              Load 0.6.x Defaults
            </Button>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">ODrive 0.6.x Encoder Features</Text>
              <Text fontSize="sm">
                New harmonic compensation, encoder de-skewing, RS485 encoder support,
                enhanced incremental encoder filtering, and BiSS-C multiturn bits.
              </Text>
            </Box>
          </Alert>

          <VStack spacing={4} align="stretch">
            <Heading size="sm" color="white">Essential Encoder Settings</Heading>

            {/* Basic Encoder Configuration */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                Basic Configuration
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <ParameterSwitch
                  label="Use Index"
                  configKey="encoder_use_index"
                  value={encoderConfig.encoder_use_index}
                  onChange={handleParameterChange}
                  isLoading={loadingParams.has('encoder_use_index')}
                  helperText="Enable index pulse usage"
                />
                <ParameterInput
                  label="Encoder CPR"
                  configKey="encoder_cpr"
                  value={encoderConfig.encoder_cpr}
                  onChange={handleParameterChange}
                  min={1}
                  max={100000}
                  step={1}
                  isLoading={loadingParams.has('encoder_cpr')}
                  helperText="Counts per revolution"
                />
              </SimpleGrid>
            </Box>

            {/* Enhanced Incremental Encoder (0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Enhanced Incremental Encoder (0.6.x)
                </Text>
                <Tooltip label="Improved filtering and configuration options">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <VStack spacing={3} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <ParameterSwitch
                    label="Incremental Encoder Enabled"
                    configKey="inc_encoder_enabled"
                    value={encoderConfig.inc_encoder_enabled}
                    onChange={handleParameterChange}
                    isLoading={loadingParams.has('inc_encoder_enabled')}
                  />
                  <ParameterInput
                    label="Incremental CPR"
                    configKey="inc_encoder_cpr"
                    value={encoderConfig.inc_encoder_cpr}
                    onChange={handleParameterChange}
                    min={1}
                    max={100000}
                    step={1}
                    isLoading={loadingParams.has('inc_encoder_cpr')}
                    isDisabled={!encoderConfig.inc_encoder_enabled}
                  />
                  <Box>
                    <ParameterInput
                      label="Filter Setting"
                      configKey="inc_encoder_filter"
                      value={encoderConfig.inc_encoder_filter}
                      onChange={handleParameterChange}
                      min={1}
                      max={20}
                      step={1}
                      isLoading={loadingParams.has('inc_encoder_filter')}
                      isDisabled={!encoderConfig.inc_encoder_enabled}
                      helperText="NEW in 0.6.x"
                    />
                    <Text fontSize="xs" color="green.300" mt={1}>
                      ⭐ 0.6.x Feature
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Encoder Bandwidth */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={2}>
                Filtering & Bandwidth
              </Text>
              <ParameterInput
                label="Encoder Bandwidth"
                configKey="encoder_bandwidth"
                value={encoderConfig.encoder_bandwidth}
                onChange={handleParameterChange}
                unit="Hz"
                min={10}
                max={10000}
                step={10}
                isLoading={loadingParams.has('encoder_bandwidth')}
                helperText="Takes effect immediately in 0.6.x"
                width="200px"
              />
            </Box>

            {/* Enhanced Index Search (0.6.x) */}
            <Box>
              <HStack mb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.300">
                  Index Search (Updated 0.6.x)
                </Text>
                <Tooltip label="Passive index search replaces always-on mode">
                  <InfoIcon color="gray.400" boxSize={3} />
                </Tooltip>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <ParameterSwitch
                    label="Passive Index Search"
                    configKey="passive_index_search"
                    value={encoderConfig.passive_index_search}
                    onChange={handleParameterChange}
                    isLoading={loadingParams.has('passive_index_search')}
                    helperText="Replaces index_search_always_on"
                  />
                  <Text fontSize="xs" color="green.300" mt={1}>
                    ⭐ 0.6.x Update
                  </Text>
                </Box>
                <ParameterSwitch
                  label="Pre-calibrated"
                  configKey="pre_calibrated"
                  value={encoderConfig.pre_calibrated}
                  onChange={handleParameterChange}
                  isLoading={loadingParams.has('pre_calibrated')}
                  helperText="Skip calibration if already done"
                />
              </SimpleGrid>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* New RS485 Encoder Support (0.6.x) */}
      <Card>
        <CardHeader pb={2}>
          <HStack>
            <Heading size="sm" color="purple.400">
              RS485 Encoder Support (NEW 0.6.x)
            </Heading>
            <Badge colorScheme="green" variant="outline" fontSize="xs">
              New Feature
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="success" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">New RS485 Encoder Support</Text>
              <Text fontSize="sm">
                Replaces AMT21 encoder support with enhanced RS485 communication.
                Supports OA1 encoders and experimental Novohall RSC-2800.
              </Text>
            </Box>
          </Alert>

          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <ParameterSwitch
                label="RS485 Encoder Enabled"
                configKey="rs485_encoder_enabled"
                value={encoderConfig.rs485_encoder_enabled}
                onChange={handleParameterChange}
                isLoading={loadingParams.has('rs485_encoder_enabled')}
              />
              <ParameterSelect
                label="RS485 Mode"
                configKey="rs485_encoder_mode"
                value={encoderConfig.rs485_encoder_mode}
                onChange={handleParameterChange}
                options={rs485EncoderModeOptions}
                isLoading={loadingParams.has('rs485_encoder_mode')}
                isDisabled={!encoderConfig.rs485_encoder_enabled}
              />
            </SimpleGrid>

            {encoderConfig.rs485_encoder_enabled && (
              <ParameterInput
                label="RS485 Baudrate"
                configKey="rs485_encoder_baudrate"
                value={encoderConfig.rs485_encoder_baudrate}
                onChange={handleParameterChange}
                unit="bps"
                min={9600}
                max={2000000}
                step={1200}
                isLoading={loadingParams.has('rs485_encoder_baudrate')}
                helperText="Standard baudrates: 9600, 115200, 2000000"
                width="200px"
              />
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* New Harmonic Compensation (0.6.x) */}
      <Card>
        <CardHeader pb={2}>
          <HStack>
            <Heading size="sm" color="purple.400">
              Harmonic Compensation (NEW 0.6.x)
            </Heading>
            <Badge colorScheme="green" variant="outline" fontSize="xs">
              New Feature
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="success" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Harmonic Compensation</Text>
              <Text fontSize="sm">
                Significantly improves velocity control smoothness when using magnetic
                encoders with slightly misaligned magnets.
              </Text>
            </Box>
          </Alert>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <ParameterSwitch
              label="Harmonic Compensation Enabled"
              configKey="harmonic_compensation_enabled"
              value={encoderConfig.harmonic_compensation_enabled}
              onChange={handleParameterChange}
              isLoading={loadingParams.has('harmonic_compensation_enabled')}
            />
            <ParameterInput
              label="Harmonic Order"
              configKey="harmonic_compensation_order"
              value={encoderConfig.harmonic_compensation_order}
              onChange={handleParameterChange}
              min={1}
              max={10}
              step={1}
              isLoading={loadingParams.has('harmonic_compensation_order')}
              isDisabled={!encoderConfig.harmonic_compensation_enabled}
              helperText="Typically 1 or 2"
            />
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* New De-skewing (0.6.x) */}
      <Card>
        <CardHeader pb={2}>
          <HStack>
            <Heading size="sm" color="purple.400">
              Encoder De-skewing (NEW 0.6.x)
            </Heading>
            <Badge colorScheme="green" variant="outline" fontSize="xs">
              New Feature
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody py={2}>
          <Alert status="success" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Encoder De-skewing</Text>
              <Text fontSize="sm">
                Compensates for magnetic encoders mounted off-axis by design.
                For small misalignments, use Harmonic Compensation instead.
              </Text>
            </Box>
          </Alert>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <ParameterSwitch
              label="De-skew Enabled"
              configKey="deskew_enabled"
              value={encoderConfig.deskew_enabled}
              onChange={handleParameterChange}
              isLoading={loadingParams.has('deskew_enabled')}
            />
            <ParameterInput
              label="De-skew Angle"
              configKey="deskew_angle"
              value={encoderConfig.deskew_angle}
              onChange={handleParameterChange}
              unit="degrees"
              min={-180}
              max={180}
              step={0.1}
              precision={2}
              isLoading={loadingParams.has('deskew_angle')}
              isDisabled={!encoderConfig.deskew_enabled}
              helperText="Angle to compensate off-axis mounting"
            />
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Advanced Settings */}
      <AdvancedSettingsSection
        title="Advanced Encoder Settings (0.6.x)"
        groupedParams={groupedAdvancedParams}
        config={encoderConfig}
        onUpdateConfig={handleParameterChange}
        loadingParams={loadingParams}
      />

      {/* 0.6.x Specific Notes */}
      <Card>
        <CardBody>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">0.6.x Encoder Changes</Text>
              <VStack align="start" spacing={1} fontSize="sm" mt={2}>
                <Text>• AMT21 encoder support replaced by RS485 encoder with AMT21 modes</Text>
                <Text>• Passive index search replaces index_search_always_on</Text>
                <Text>• Encoder bandwidth changes take effect immediately (no reboot)</Text>
                <Text>• Enhanced BiSS-C support with multiturn bit configuration</Text>
                <Text>• New encoder filtering options for faster signals</Text>
              </VStack>
            </Box>
          </Alert>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default EncoderConfigStep06