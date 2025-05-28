import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  Collapse,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Code,
  Divider,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

const FinalConfigStep = () => {
  const toast = useToast()
  const { isOpen: isCommandsOpen, onToggle: onCommandsToggle } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  
  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)
  const { isConnected } = useSelector(state => state.device)

  // Helper function to safely format numbers and handle undefined values
  const safeValue = (value, defaultValue = 0) => {
    if (value === undefined || value === null || isNaN(value)) {
      return defaultValue
    }
    return value
  }

  // Helper function to format boolean values
  const safeBool = (value, defaultValue = false) => {
    if (value === undefined || value === null) {
      return defaultValue
    }
    return Boolean(value)
  }

  // Generate commands using useMemo to prevent infinite re-renders
  const generatedCommands = useMemo(() => {
    const commands = []

    // Power configuration commands (ODrive v0.5.6 syntax)
    commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${safeValue(powerConfig.dc_bus_overvoltage_trip_level, 56)}`)
    commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${safeValue(powerConfig.dc_bus_undervoltage_trip_level, 10)}`)
    commands.push(`odrv0.config.dc_max_positive_current = ${safeValue(powerConfig.dc_max_positive_current, 10)}`)
    commands.push(`odrv0.config.dc_max_negative_current = ${safeValue(powerConfig.dc_max_negative_current, -10)}`)
    commands.push(`odrv0.config.brake_resistance = ${safeValue(powerConfig.brake_resistance, 2)}`)
    commands.push(`odrv0.config.enable_brake_resistor = ${safeBool(powerConfig.brake_resistor_enabled) ? 'True' : 'False'}`)

    // Motor configuration commands
    commands.push(`odrv0.axis0.motor.config.motor_type = ${safeValue(motorConfig.motor_type, 0)}`)
    commands.push(`odrv0.axis0.motor.config.pole_pairs = ${safeValue(motorConfig.pole_pairs, 7)}`)
    
    // Calculate torque constant safely
    const motorKv = safeValue(motorConfig.motor_kv, 230)
    const torqueConstant = motorKv > 0 ? (60 / (2 * Math.PI * motorKv)) : 0.04
    commands.push(`odrv0.axis0.motor.config.torque_constant = ${torqueConstant.toFixed(6)}`)
    
    commands.push(`odrv0.axis0.motor.config.current_lim = ${safeValue(motorConfig.current_lim, 10)}`)
    commands.push(`odrv0.axis0.motor.config.calibration_current = ${safeValue(motorConfig.calibration_current, 10)}`)
    commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${safeValue(motorConfig.resistance_calib_max_voltage, 4)}`)
    
    // Add lock-in spin current if it exists in motorConfig
    const lockInCurrent = safeValue(motorConfig.lock_in_spin_current, 10)
    commands.push(`odrv0.axis0.config.calibration_lockin.current = ${lockInCurrent}`)

    if (safeValue(motorConfig.motor_type, 0) === 1) { // GIMBAL motor type
      commands.push(`odrv0.axis0.motor.config.phase_resistance = ${safeValue(motorConfig.phase_resistance, 0)}`)
      commands.push(`odrv0.axis0.motor.config.phase_inductance = ${safeValue(motorConfig.phase_inductance, 0)}`)
    }

    // Encoder configuration commands
    commands.push(`odrv0.axis0.encoder.config.mode = ${safeValue(encoderConfig.encoder_type, 1)}`)
    if (safeValue(encoderConfig.encoder_type, 1) === 1) { // INCREMENTAL
      commands.push(`odrv0.axis0.encoder.config.cpr = ${safeValue(encoderConfig.cpr, 4000)}`)
      commands.push(`odrv0.axis0.encoder.config.bandwidth = ${safeValue(encoderConfig.bandwidth, 1000)}`)
      commands.push(`odrv0.axis0.encoder.config.use_index = ${safeBool(encoderConfig.use_index) ? 'True' : 'False'}`)
      commands.push(`odrv0.axis0.encoder.config.calib_range = ${safeValue(encoderConfig.calib_range, 0.02)}`)
      commands.push(`odrv0.axis0.encoder.config.calib_scan_distance = ${safeValue(encoderConfig.calib_scan_distance, 16384)}`)
      commands.push(`odrv0.axis0.encoder.config.calib_scan_omega = ${safeValue(encoderConfig.calib_scan_omega, 12.566)}`)
    }

    // Control configuration commands
    commands.push(`odrv0.axis0.controller.config.control_mode = ${safeValue(controlConfig.control_mode, 3)}`)
    commands.push(`odrv0.axis0.controller.config.input_mode = ${safeValue(controlConfig.input_mode, 1)}`)
    commands.push(`odrv0.axis0.controller.config.vel_limit = ${safeValue(controlConfig.vel_limit, 20)}`)
    commands.push(`odrv0.axis0.controller.config.pos_gain = ${safeValue(controlConfig.pos_gain, 1)}`)
    commands.push(`odrv0.axis0.controller.config.vel_gain = ${safeValue(controlConfig.vel_gain, 0.228)}`)
    commands.push(`odrv0.axis0.controller.config.vel_integrator_gain = ${safeValue(controlConfig.vel_integrator_gain, 0.228)}`)
    commands.push(`odrv0.axis0.controller.config.vel_limit_tolerance = ${safeValue(controlConfig.vel_limit_tolerance, 1.2)}`)
    commands.push(`odrv0.axis0.controller.config.vel_ramp_rate = ${safeValue(controlConfig.vel_ramp_rate, 10)}`)
    commands.push(`odrv0.axis0.controller.config.torque_ramp_rate = ${safeValue(controlConfig.torque_ramp_rate, 0.01)}`)
    commands.push(`odrv0.axis0.controller.config.circular_setpoints = ${safeBool(controlConfig.circular_setpoints) ? 'True' : 'False'}`)
    commands.push(`odrv0.axis0.controller.config.inertia = ${safeValue(controlConfig.inertia, 0)}`)
    commands.push(`odrv0.axis0.controller.config.input_filter_bandwidth = ${safeValue(controlConfig.input_filter_bandwidth, 2)}`)

    // Interface configuration commands
    if (safeBool(interfaceConfig.enable_can)) {
      commands.push(`odrv0.axis0.config.can_node_id = ${safeValue(interfaceConfig.can_node_id, 0)}`)
      commands.push(`odrv0.can.config.baud_rate = ${safeValue(interfaceConfig.can_baudrate, 250000)}`)
    }
    
    if (safeBool(interfaceConfig.enable_uart)) {
      commands.push(`odrv0.config.uart_baudrate = ${safeValue(interfaceConfig.uart_baudrate, 115200)}`)
    }

    if (safeBool(interfaceConfig.enable_watchdog)) {
      commands.push(`odrv0.axis0.config.watchdog_timeout = ${safeValue(interfaceConfig.watchdog_timeout, 0)}`)
    }

    // GPIO configuration
    for (let i = 1; i <= 4; i++) {
      const gpioMode = safeValue(interfaceConfig[`gpio${i}_mode`], 0)
      commands.push(`odrv0.config.gpio${i}_mode = ${gpioMode}`)
    }

    return commands
  }, [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig])

  const executeAction = async (action) => {
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'No ODrive connected',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    try {
      let endpoint = ''
      let payload = {}

      switch (action) {
        case 'erase':
          endpoint = '/api/odrive/erase_config'
          break
        case 'apply':
          endpoint = '/api/odrive/apply_config'
          payload = { commands: generatedCommands }
          break
        case 'save_and_reboot':
          endpoint = '/api/odrive/save_and_reboot'
          break
        case 'calibrate':
          endpoint = '/api/odrive/calibrate'
          break
        case 'save':
          endpoint = '/api/odrive/save_config'
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Success',
          description: result.message || 'Action completed successfully',
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Action failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
    setIsLoading(false)
    onConfirmClose()
  }

  const handleAction = (action) => {
    setPendingAction(action)
    onConfirmOpen()
  }

  const getActionDetails = (action) => {
    const details = {
      erase: {
        title: 'Erase Configuration and Reboot',
        description: 'This will reset all ODrive settings to factory defaults and reboot the device.',
        color: 'red',
        confirmText: 'Yes, erase and reboot'
      },
      apply: {
        title: 'Apply New Configuration',
        description: 'This will send all configuration commands to the ODrive without saving to non-volatile memory.',
        color: 'blue',
        confirmText: 'Apply configuration'
      },
      save_and_reboot: {
        title: 'Save to Non-Volatile Memory and Reboot',
        description: 'This will save the current configuration to flash memory and reboot the device.',
        color: 'green',
        confirmText: 'Save and reboot'
      },
      calibrate: {
        title: 'Calibrate Motor and Encoder',
        description: 'This will perform motor resistance, inductance, and encoder offset calibration.',
        color: 'orange',
        confirmText: 'Start calibration'
      },
      save: {
        title: 'Save to Non-Volatile Memory',
        description: 'This will save the current configuration to flash memory without rebooting.',
        color: 'green',
        confirmText: 'Save configuration'
      }
    }
    return details[action] || {}
  }

  return (
    <VStack spacing={6} align="stretch" maxW="800px">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Apply Configuration
        </Heading>
        <Text color="gray.300" mb={6}>
          Review and apply your ODrive configuration. Choose the appropriate action based on your needs.
        </Text>
      </Box>

      {!isConnected && (
        <Alert status="error">
          <AlertIcon />
          ODrive not connected. Please connect to a device before applying configuration.
        </Alert>
      )}

      <Card bg="gray.800" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Configuration Actions</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Button
              colorScheme="red"
              size="lg"
              onClick={() => handleAction('erase')}
              isDisabled={!isConnected}
              isLoading={isLoading && pendingAction === 'erase'}
            >
              🗑️ Erase Old Configuration and Reboot
            </Button>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" color="white">Configuration Commands Preview</Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCommandsToggle}
                  rightIcon={isCommandsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  color="gray.300"
                >
                  {isCommandsOpen ? 'Hide' : 'Show'} Commands ({generatedCommands.length})
                </Button>
              </HStack>
              
              <Collapse in={isCommandsOpen}>
                <Box
                  bg="gray.900"
                  p={4}
                  borderRadius="md"
                  maxH="300px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.600"
                >
                  {generatedCommands.map((command, index) => (
                    <Code key={index} display="block" whiteSpace="pre" color="green.300" bg="transparent" p={1}>
                      {command}
                    </Code>
                  ))}
                </Box>
              </Collapse>
            </Box>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => handleAction('apply')}
              isDisabled={!isConnected}
              isLoading={isLoading && pendingAction === 'apply'}
            >
              ⚙️ Apply New Configuration
            </Button>

            <Divider />

            <Button
              colorScheme="green"
              size="lg"
              onClick={() => handleAction('save_and_reboot')}
              isDisabled={!isConnected}
              isLoading={isLoading && pendingAction === 'save_and_reboot'}
            >
              💾 Save to Non-Volatile Memory and Reboot
            </Button>

            <Button
              colorScheme="orange"
              variant="outline"
              size="lg"
              onClick={() => handleAction('calibrate')}
              isDisabled={!isConnected}
              isLoading={isLoading && pendingAction === 'calibrate'}
            >
              🎯 Calibrate Motor and Encoder
            </Button>

            <Button
              colorScheme="green"
              variant="outline"
              size="lg"
              onClick={() => handleAction('save')}
              isDisabled={!isConnected}
              isLoading={isLoading && pendingAction === 'save'}
            >
              💾 Save to Non-Volatile Memory
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="gray.700" variant="elevated">
        <CardHeader>
          <Heading size="md" color="white">Important Notes</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Alert status="warning" variant="left-accent">
              <AlertIcon />
              <Text>
                <strong>Calibration:</strong> Must be performed after applying motor and encoder configuration for the first time.
              </Text>
            </Alert>
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <Text>
                <strong>Apply vs Save:</strong> Apply sends commands temporarily. Save makes them permanent across reboots.
              </Text>
            </Alert>
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <Text>
                <strong>Reboot Behavior:</strong> Device will disconnect briefly during reboot and reconnect automatically.
              </Text>
            </Alert>
          </VStack>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.600">
          <ModalHeader color="white">
            {getActionDetails(pendingAction).title}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text color="gray.300" mb={4}>
              {getActionDetails(pendingAction).description}
            </Text>
            {pendingAction === 'apply' && (
              <Box>
                <Text color="white" fontWeight="bold" mb={2}>
                  Commands to execute: {generatedCommands.length}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  This will send all configuration commands shown in the preview above.
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose}>
              Cancel
            </Button>
            <Button
              colorScheme={getActionDetails(pendingAction).color}
              onClick={() => executeAction(pendingAction)}
              isLoading={isLoading}
            >
              {getActionDetails(pendingAction).confirmText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default FinalConfigStep