import { useEffect, useState, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  Icon,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { fetchDevices, connectDevice, disconnectDevice } from '../store/slices/deviceSlice'
import { useMotorControl } from '../hooks/useMotorControl'
import { getAxisStateName } from '../utils/configEnums'
import { getErrorDescription, getErrorColor, isErrorCritical, describeErrors } from '../utils/odriveErrors'
import { troubleshootingFor } from '../utils/troubleshooting'
import ErrorTroubleshootingModal from './modals/ErrorTroubleshootingModal'
import AxisSelector from './AxisSelector'
import '../styles/DeviceList.css'

const StatusBadge = memo(({ connected }) => (
  <Badge colorScheme={connected ? 'green' : 'gray'} variant="solid" fontSize="xs" px={2} py={1}>
    {connected ? 'Connected' : 'Available'}
  </Badge>
))
StatusBadge.displayName = 'StatusBadge'

const DeviceCard = memo(({ device, index, connected, onConnect, onDisconnect }) => (
  <Card w="100%" className="device-card" bg={connected ? 'odrive.700' : 'gray.700'} variant="elevated">
    <CardBody>
      <HStack justify="space-between" align="start">
        <VStack align="start" spacing={1} flex="1" minW={0}>
          <Text fontWeight="bold">{device.path || `ODrive ${index + 1}`}</Text>
          <Text fontSize="sm" color="gray.300" fontFamily="mono" noOfLines={1}>
            Serial: {device.serial_number || 'Unknown'}
          </Text>
          <Text fontSize="sm" color="gray.400">FW: {device.fw_version || '?'}</Text>
        </VStack>
        <VStack>
          <StatusBadge connected={connected} />
          {connected ? (
            <Button size="sm" colorScheme="red" onClick={onDisconnect}>Disconnect</Button>
          ) : (
            <Button size="sm" colorScheme="green" onClick={() => onConnect(device)}>Connect</Button>
          )}
        </VStack>
      </HStack>
    </CardBody>
  </Card>
))
DeviceCard.displayName = 'DeviceCard'

const ErrorRow = memo(({ label, code, kind, onClick }) => {
  if (!code) {
    return (
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">{label}:</Text>
        <Text fontSize="sm" fontWeight="bold" color="green.300">None</Text>
      </HStack>
    )
  }
  const colorScheme = getErrorColor(code, kind)
  const critical = isErrorCritical(code, kind)
  return (
    <VStack spacing={1} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.300">{label}:</Text>
        <HStack>
          <Badge
            colorScheme={colorScheme}
            variant="solid"
            fontSize="xs"
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
            onClick={() => onClick(code, kind)}
          >
            0x{code.toString(16).toUpperCase()}
          </Badge>
          {critical && (
            <Tooltip label="Critical error - immediate attention required">
              <Icon as={InfoIcon} color="red.400" boxSize={3} />
            </Tooltip>
          )}
        </HStack>
      </HStack>
      <Text fontSize="xs" color={`${colorScheme}.300`} textAlign="right" maxW="220px">
        {getErrorDescription(code, kind)}
      </Text>
    </VStack>
  )
})
ErrorRow.displayName = 'ErrorRow'

const DeviceList = () => {
  const dispatch = useDispatch()
  const { availableDevices, connectedDevice, isConnected, isLoading } = useSelector((s) => s.device)
  const live = useSelector((s) => s.live)
  const selectedAxis = useSelector((s) => s.ui.selectedAxis)
  const { clearErrors } = useMotorControl()
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedError, setSelectedError] = useState(null)

  // Stable callbacks so the memoized DeviceCard / ErrorRow children can bail out
  // of re-rendering when only live-status numbers change.
  const handleConnect = useCallback(
    (d) => {
      dispatch(connectDevice(d))
      toast({ title: 'Connected', description: `ODrive ${d.serial_number || ''}`.trim(), status: 'success', duration: 2000 })
    },
    [dispatch, toast]
  )
  const handleDisconnect = useCallback(() => {
    dispatch(disconnectDevice())
    toast({ title: 'Disconnected', status: 'info', duration: 2000 })
  }, [dispatch, toast])

  // Scan only while disconnected; once connected the telemetry WebSocket is the
  // heartbeat, so we stop polling /api/devices to avoid the periodic scan lag.
  useEffect(() => {
    dispatch(fetchDevices())
    if (isConnected) return undefined
    const interval = setInterval(() => dispatch(fetchDevices()), 3000)
    return () => clearInterval(interval)
  }, [dispatch, isConnected])

  const errors = {
    axis: live.axis_error,
    motor: live.motor_error,
    encoder: live.encoder_error,
    controller: live.controller_error,
    sensorless: live.sensorless_error,
  }
  const hasAnyErrors = Object.values(errors).some((e) => e !== 0)

  const handleErrorClick = useCallback((code, kind) => {
    const decoded = describeErrors(kind, code)[0]
    if (decoded) {
      setSelectedError({ ...decoded, group: kind })
      onOpen()
    }
  }, [onOpen])

  const axisColor = (state) => {
    if (state === 8) return 'green'
    if (state === 1) return 'blue'
    if (state >= 2 && state <= 7) return 'yellow'
    return 'red'
  }

  return (
    <Box className="device-list">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold" color="odrive.300">ODrive Devices</Text>
            {isConnected && <AxisSelector size="xs" />}
          </VStack>
          <Button size="sm" colorScheme="odrive" onClick={() => dispatch(fetchDevices())} isLoading={isLoading} loadingText="Scanning">
            Scan
          </Button>
        </HStack>

        <Box>
          {availableDevices.length === 0 ? (
            <Alert status="info" variant="subtle">
              <AlertIcon />
              No ODrive devices found. Make sure your device is connected.
            </Alert>
          ) : (
            <VStack spacing={3}>
              {availableDevices.map((device, index) => (
                <DeviceCard
                  key={device.serial_number || `device-${index}`}
                  device={device}
                  index={index}
                  connected={isConnected && connectedDevice?.serial_number === device.serial_number}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </VStack>
          )}
        </Box>

        {isConnected && (
          <>
            <Divider />
            <Box>
              <Text fontSize="md" fontWeight="bold" mb={2} color="white">Device Status</Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Vbus Voltage:</Text>
                  <Text fontSize="sm" fontWeight="bold">{live.vbus_voltage.toFixed(1)} V</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Axis {selectedAxis} State:</Text>
                  <Badge colorScheme={axisColor(live.axis_state)}>{getAxisStateName(live.axis_state)}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Motor Current:</Text>
                  <Text fontSize="sm" fontWeight="bold">{live.motor_current.toFixed(2)} A</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.300">Encoder Pos:</Text>
                  <Text fontSize="sm" fontWeight="bold">{live.encoder_pos.toFixed(2)}</Text>
                </HStack>
              </VStack>

              {hasAnyErrors && (
                <Button size="xs" colorScheme="red" variant="outline" width="100%" mt={3} onClick={clearErrors}>
                  Clear All Errors
                </Button>
              )}

              <VStack spacing={2} align="stretch" mt={3}>
                <ErrorRow label="Error" code={errors.axis} kind="axis" onClick={handleErrorClick} />
                {errors.motor !== 0 && (
                  <>
                    <Divider />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Motor Errors:</Text>
                    <ErrorRow label="Motor" code={errors.motor} kind="motor" onClick={handleErrorClick} />
                  </>
                )}
                {errors.encoder !== 0 && (
                  <>
                    <Divider />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Encoder Errors:</Text>
                    <ErrorRow label="Encoder" code={errors.encoder} kind="encoder" onClick={handleErrorClick} />
                  </>
                )}
                {errors.controller !== 0 && (
                  <>
                    <Divider />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Controller Errors:</Text>
                    <ErrorRow label="Controller" code={errors.controller} kind="controller" onClick={handleErrorClick} />
                  </>
                )}
                {errors.sensorless !== 0 && (
                  <>
                    <Divider />
                    <Text fontSize="sm" fontWeight="bold" color="orange.300">Sensorless Errors:</Text>
                    <ErrorRow label="Sensorless" code={errors.sensorless} kind="sensorless" onClick={handleErrorClick} />
                  </>
                )}
              </VStack>
            </Box>
          </>
        )}
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

export default DeviceList