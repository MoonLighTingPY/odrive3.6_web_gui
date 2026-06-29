import { useState, memo } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Progress,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Divider,
  Tooltip,
  Icon,
  useDisclosure,
} from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { getAxisStateName } from '../../../utils/configEnums'
import { getErrorDescription, isErrorCritical, describeErrors } from '../../../utils/odriveErrors'
import { troubleshootingFor } from '../../../utils/troubleshooting'
import ErrorTroubleshootingModal from '../../modals/ErrorTroubleshootingModal'
import MotorControlsCard from '../../MotorControlsCard'
import { LIVE_INITIAL_STATE } from '../../../store/slices/liveSlice'
import '../../../styles/DashboardTab.css'

const TelemetryDisplay = memo(({ label, value, unit, color = 'white' }) => (
  <Stat textAlign="center">
    <StatLabel color="gray.300">{label}</StatLabel>
    <StatNumber color={color} fontSize="2xl">
      <Box display="inline-block" minWidth="80px" textAlign="right">
        {typeof value === 'number' ? value.toFixed(2) : value}
      </Box>{' '}{unit}
    </StatNumber>
  </Stat>
))
TelemetryDisplay.displayName = 'TelemetryDisplay'

const VoltageProgress = memo(({ voltage }) => (
  <Box w="100%">
    <HStack justify="space-between" mb={2}>
      <Text color="gray.300">DC Bus Voltage</Text>
      <Text fontWeight="bold" color="white">{(voltage ?? 0).toFixed(1)} V</Text>
    </HStack>
    <Progress value={((voltage ?? 0) / 56) * 100} colorScheme={voltage > 50 ? 'red' : voltage > 40 ? 'yellow' : 'green'} size="sm" />
  </Box>
))
VoltageProgress.displayName = 'VoltageProgress'

const TemperatureDisplay = memo(({ temp, label, maxTemp = 100 }) => (
  <Box w="100%">
    <HStack justify="space-between" mb={2}>
      <Text color="gray.300">{label}</Text>
      <Text fontWeight="bold" color={(temp ?? 0) > 80 ? 'red.300' : 'white'}>{(temp ?? 0).toFixed(1)} °C</Text>
    </HStack>
    <Progress value={((temp ?? 0) / maxTemp) * 100} colorScheme={(temp ?? 0) > 80 ? 'red' : (temp ?? 0) > 60 ? 'yellow' : 'green'} size="sm" />
  </Box>
))
TemperatureDisplay.displayName = 'TemperatureDisplay'

const DashboardTab = ({ isActive = true }) => {
  const { connectedDevice, isConnected } = useSelector((s) => s.device)
  const live = useSelector((s) => (isActive ? s.live : LIVE_INITIAL_STATE))
  const selectedAxis = useSelector((s) => s.ui.selectedAxis)

  const [selectedError, setSelectedError] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const currentErrors = {
    axis_error: live.axis_error,
    motor_error: live.motor_error,
    encoder_error: live.encoder_error,
    controller_error: live.controller_error,
    sensorless_error: live.sensorless_error,
  }
  const hasAnyErrors = Object.values(currentErrors).some((e) => e !== 0)

  const stateColor = (state) => {
    if (state === 8) return 'green'
    if (state === 1) return 'blue'
    if (state >= 2 && state <= 7) return 'yellow'
    return 'red'
  }

  const handleErrorClick = (code, kind) => {
    const decoded = describeErrors(kind, code)[0]
    if (decoded) {
      setSelectedError({ ...decoded, group: kind })
      onOpen()
    }
  }

  const renderErrorCard = (title, code, kind, color = 'red') => {
    if (!code) return null
    const critical = isErrorCritical(code, kind)
    return (
      <Alert status={critical ? 'error' : 'warning'} variant="left-accent">
        <AlertIcon />
        <Box flex="1">
          <HStack justify="space-between" mb={1}>
            <Text fontWeight="bold" fontSize="sm">{title}</Text>
            <HStack>
              <Badge colorScheme={color} fontSize="xs" cursor="pointer" _hover={{ opacity: 0.8 }} onClick={() => handleErrorClick(code, kind)}>
                0x{code.toString(16).toUpperCase()}
              </Badge>
              {critical && (
                <Tooltip label="Critical error - immediate attention required">
                  <Icon as={WarningIcon} color="red.500" boxSize={3} />
                </Tooltip>
              )}
            </HStack>
          </HStack>
          <Text fontSize="xs" mb={1}>{getErrorDescription(code, kind)}</Text>
        </Box>
      </Alert>
    )
  }

  const fw = connectedDevice
    ? `v${connectedDevice.fw_version_major ?? 0}.${connectedDevice.fw_version_minor ?? 0}.${connectedDevice.fw_version_revision ?? 0}`
    : '—'

  if (!isConnected) {
    return (
      <Box p={6}>
        <Heading size="md" color="odrive.300">Dashboard</Heading>
        <Text mt={2} color="gray.400">Connect a device to see live telemetry.</Text>
      </Box>
    )
  }

  return (
    <Box p={4} h="100%" maxW="1400px" mx="auto" overflow="hidden">
      <VStack spacing={4} align="stretch" h="100%">
        <Box flex="1" overflow="auto">
          <VStack spacing={6} align="stretch">

            {/* Device Status */}
            <Card bg="gray.800" variant="elevated">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color="white">Device Status</Heading>
                  <Badge colorScheme={stateColor(live.axis_state)} variant="solid" fontSize="sm" px={3} py={1}>
                    {getAxisStateName(live.axis_state)}
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Stat>
                    <StatLabel color="gray.300">Serial</StatLabel>
                    <StatNumber color="white" fontSize="md" fontFamily="mono">{connectedDevice?.serial_number || 'Unknown'}</StatNumber>
                    <StatHelpText color="gray.400">ODrive</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.300">Firmware</StatLabel>
                    <StatNumber color="white" fontSize="md">{fw}</StatNumber>
                    <StatHelpText color="gray.400">Axis {selectedAxis}</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.300">Error States</StatLabel>
                    <StatNumber color="white" fontSize="md">
                      <HStack spacing={1}>
                        <Badge colorScheme={currentErrors.axis_error ? 'red' : 'green'} fontSize="xs">
                          Axis: {currentErrors.axis_error ? `0x${currentErrors.axis_error.toString(16).toUpperCase()}` : 'OK'}
                        </Badge>
                        <Badge colorScheme={currentErrors.motor_error ? 'orange' : 'green'} fontSize="xs">
                          Motor: {currentErrors.motor_error ? `0x${currentErrors.motor_error.toString(16).toUpperCase()}` : 'OK'}
                        </Badge>
                        <Badge colorScheme={currentErrors.encoder_error ? 'yellow' : 'green'} fontSize="xs">
                          Enc: {currentErrors.encoder_error ? `0x${currentErrors.encoder_error.toString(16).toUpperCase()}` : 'OK'}
                        </Badge>
                      </HStack>
                    </StatNumber>
                    <StatHelpText color="gray.400">
                      <HStack spacing={1} mt={1}>
                        <Badge colorScheme={currentErrors.controller_error ? 'purple' : 'green'} fontSize="xs">
                          Ctrl: {currentErrors.controller_error ? `0x${currentErrors.controller_error.toString(16).toUpperCase()}` : 'OK'}
                        </Badge>
                        <Badge colorScheme={currentErrors.sensorless_error ? 'blue' : 'green'} fontSize="xs">
                          S-less: {currentErrors.sensorless_error ? `0x${currentErrors.sensorless_error.toString(16).toUpperCase()}` : 'OK'}
                        </Badge>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.300">Axis State</StatLabel>
                    <StatNumber color="white" fontSize="md">{live.axis_state}</StatNumber>
                    <StatHelpText color="gray.400">{getAxisStateName(live.axis_state)}</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Errors */}
            {hasAnyErrors && (
              <Card bg="red.900" variant="elevated">
                <CardHeader>
                  <HStack><Icon as={WarningIcon} color="red.300" /><Heading size="md" color="red.300">Errors!</Heading></HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {renderErrorCard('Axis Error', currentErrors.axis_error, 'axis', 'red')}
                    {renderErrorCard('Motor Error', currentErrors.motor_error, 'motor', 'orange')}
                    {renderErrorCard('Encoder Error', currentErrors.encoder_error, 'encoder', 'yellow')}
                    {renderErrorCard('Controller Error', currentErrors.controller_error, 'controller', 'purple')}
                    {renderErrorCard('Sensorless Error', currentErrors.sensorless_error, 'sensorless', 'blue')}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Power & Thermal */}
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <Card bg="gray.800" variant="elevated">
                <CardHeader><Heading size="md" color="white">Power & Voltage</Heading></CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <VoltageProgress voltage={live.vbus_voltage} />
                    <Divider />
                    <TelemetryDisplay label="Motor Current (measured)" value={live.motor_current} unit="A"
                      color={Math.abs(live.motor_current) > 5 ? 'red.300' : 'odrive.300'} />
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="gray.800" variant="elevated">
                <CardHeader><Heading size="md" color="white">Temperature Monitoring</Heading></CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <TemperatureDisplay temp={live.motor_temp ?? 0} label="Motor Temperature" />
                    <TemperatureDisplay temp={live.fet_temp ?? 0} label="FET Temperature" />
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="gray.800" variant="elevated">
                <CardHeader><Heading size="md" color="white">Encoder Feedback</Heading></CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <TelemetryDisplay label="Position (turns)" value={live.encoder_pos} unit="" color="odrive.300" />
                    <TelemetryDisplay label="Velocity (turns/s)" value={live.encoder_vel} unit="" color="odrive.300" />
                    <TelemetryDisplay label="Iq (measured)" value={live.motor_current} unit="A" color="odrive.300" />
                  </SimpleGrid>
                </CardBody>
              </Card>
            </SimpleGrid>

            <MotorControlsCard isActive={isActive} />
          </VStack>
        </Box>
      </VStack>

      <ErrorTroubleshootingModal
        isOpen={isOpen}
        onClose={onClose}
        error={selectedError}
        guide={selectedError ? troubleshootingFor(selectedError.group, selectedError.flag) : null}
      />
    </Box>
  )
}

export default DashboardTab
