import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
  Code,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Divider,
  IconButton,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

const FinalConfigStep = () => {
  const dispatch = useDispatch()
  const toast = useToast()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const [showCommands, setShowCommands] = useState(false)
  const [pendingAction, setPendingAction] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)
  const { isConnected } = useSelector(state => state.device)

  // Generate commands using useMemo to prevent infinite re-renders
  const generatedCommands = useMemo(() => {
    const commands = []

    // Power configuration commands (ODrive v0.5.6 syntax)
    commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${powerConfig.dc_bus_overvoltage_trip_level}`)
    commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${powerConfig.dc_bus_undervoltage_trip_level}`)
    commands.push(`odrv0.config.dc_max_positive_current = ${powerConfig.dc_max_positive_current}`)
    commands.push(`odrv0.config.dc_max_negative_current = ${powerConfig.dc_max_negative_current}`)
    commands.push(`odrv0.config.brake_resistance = ${powerConfig.brake_resistance}`)
    commands.push(`odrv0.config.enable_brake_resistor = ${powerConfig.brake_resistor_enabled ? 'True' : 'False'}`)

    // Motor configuration commands
    commands.push(`odrv0.axis0.motor.config.motor_type = ${motorConfig.motor_type}`)
    commands.push(`odrv0.axis0.motor.config.pole_pairs = ${motorConfig.pole_pairs}`)
    commands.push(`odrv0.axis0.motor.config.torque_constant = ${(60 / (2 * Math.PI * motorConfig.motor_kv)).toFixed(6)}`)
    commands.push(`odrv0.axis0.motor.config.current_lim = ${motorConfig.current_lim}`)
    commands.push(`odrv0.axis0.motor.config.calibration_current = ${motorConfig.calibration_current}`)
    commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${motorConfig.resistance_calib_max_voltage}`)
    
    // Add lock-in spin current if it exists in motorConfig
    if (motorConfig.lock_in_spin_current !== undefined) {
      commands.push(`odrv0.axis0.config.calibration_lockin.current = ${motorConfig.lock_in_spin_current}`)
    }

    if (motorConfig.motor_type === 1) { // GIMBAL motor type (corrected enum value)
      if (motorConfig.phase_resistance !== undefined) {
        commands.push(`odrv0.axis0.motor.config.phase_resistance = ${motorConfig.phase_resistance}`)
      }
      if (motorConfig.phase_inductance !== undefined) {
        commands.push(`odrv0.axis0.motor.config.phase_inductance = ${motorConfig.phase_inductance}`)
      }
    }

    // Encoder configuration commands
    commands.push(`odrv0.axis0.encoder.config.mode = ${encoderConfig.encoder_type}`)
    if (encoderConfig.encoder_type === 1) { // INCREMENTAL
      commands.push(`odrv0.axis0.encoder.config.cpr = ${encoderConfig.cpr}`)
      commands.push(`odrv0.axis0.encoder.config.bandwidth = ${encoderConfig.bandwidth}`)
      commands.push(`odrv0.axis0.encoder.config.use_index = ${encoderConfig.use_index ? 'True' : 'False'}`)
      commands.push(`odrv0.axis0.encoder.config.calib_range = ${encoderConfig.calib_range}`)
      commands.push(`odrv0.axis0.encoder.config.calib_scan_distance = ${encoderConfig.calib_scan_distance}`)
      commands.push(`odrv0.axis0.encoder.config.calib_scan_omega = ${encoderConfig.calib_scan_omega}`)
    }

    // Control configuration commands
    commands.push(`odrv0.axis0.controller.config.control_mode = ${controlConfig.control_mode}`)
    commands.push(`odrv0.axis0.controller.config.input_mode = ${controlConfig.input_mode}`)
    commands.push(`odrv0.axis0.controller.config.vel_limit = ${controlConfig.vel_limit}`)
    commands.push(`odrv0.axis0.controller.config.pos_gain = ${controlConfig.pos_gain}`)
    commands.push(`odrv0.axis0.controller.config.vel_gain = ${controlConfig.vel_gain}`)
    commands.push(`odrv0.axis0.controller.config.vel_integrator_gain = ${controlConfig.vel_integrator_gain}`)
    commands.push(`odrv0.axis0.controller.config.vel_limit_tolerance = ${controlConfig.vel_limit_tolerance}`)
    commands.push(`odrv0.axis0.controller.config.vel_ramp_rate = ${controlConfig.vel_ramp_rate}`)
    commands.push(`odrv0.axis0.controller.config.torque_ramp_rate = ${controlConfig.torque_ramp_rate}`)
    commands.push(`odrv0.axis0.controller.config.circular_setpoints = ${controlConfig.circular_setpoints ? 'True' : 'False'}`)
    commands.push(`odrv0.axis0.controller.config.inertia = ${controlConfig.inertia}`)
    commands.push(`odrv0.axis0.controller.config.input_filter_bandwidth = ${controlConfig.input_filter_bandwidth}`)

    // Interface configuration commands
    if (interfaceConfig.enable_can) {
      commands.push(`odrv0.axis0.config.can_node_id = ${interfaceConfig.can_node_id}`)
      commands.push(`odrv0.can.config.baud_rate = ${interfaceConfig.can_baudrate}`)
    }
    
    if (interfaceConfig.enable_uart) {
      commands.push(`odrv0.config.uart_baudrate = ${interfaceConfig.uart_baudrate}`)
    }

    if (interfaceConfig.enable_watchdog) {
      commands.push(`odrv0.axis0.config.watchdog_timeout = ${interfaceConfig.watchdog_timeout}`)
    }

    // GPIO configuration
    for (let i = 1; i <= 4; i++) {
      const gpioMode = interfaceConfig[`gpio${i}_mode`]
      if (gpioMode !== undefined) {
        commands.push(`odrv0.config.gpio${i}_mode = ${gpioMode}`)
      }
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
              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  flex="1"
                  onClick={() => handleAction('apply')}
                  isDisabled={!isConnected}
                  isLoading={isLoading && pendingAction === 'apply'}
                >
                  ⚙️ Apply New Configuration
                </Button>
                
                <IconButton
                  icon={showCommands ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  onClick={() => setShowCommands(!showCommands)}
                  variant="outline"
                  colorScheme="blue"
                  aria-label="Toggle command preview"
                />
              </HStack>

              <Collapse in={showCommands} animateOpacity>
                <Box mt={4} p={4} bg="gray.900" borderRadius="md" border="1px solid" borderColor="gray.600">
                  <Text fontSize="sm" fontWeight="bold" color="white" mb={2}>
                    Commands to be executed:
                  </Text>
                  <Box maxH="300px" overflowY="auto">
                    {generatedCommands.map((command, index) => (
                      <Code key={index} display="block" p={1} mb={1} fontSize="xs" bg="gray.800" color="green.300">
                        {command}
                      </Code>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>

            <Divider borderColor="gray.600" />

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
            <Alert status="warning" variant="left-accent">
              <AlertIcon />
              <Text>
                <strong>Safety:</strong> Ensure motor is mechanically secured before calibration. Motor will spin during calibration.
              </Text>
            </Alert>
          </VStack>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.600">
          <ModalHeader color="white">
            {getActionDetails(pendingAction).title}
          </ModalHeader>
          <ModalCloseButton color="gray.300" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.300">
                {getActionDetails(pendingAction).description}
              </Text>
              
              {pendingAction === 'apply' && (
                <Box p={3} bg="gray.900" borderRadius="md" maxH="200px" overflowY="auto">
                  <Text fontSize="sm" fontWeight="bold" color="white" mb={2}>
                    Commands to execute:
                  </Text>
                  {generatedCommands.map((command, index) => (
                    <Code key={index} display="block" p={1} mb={1} fontSize="xs" bg="gray.800" color="green.300">
                      {command}
                    </Code>
                  ))}
                </Box>
              )}

              {pendingAction === 'calibrate' && (
                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Warning:</Text>
                    <Text>The motor will spin during calibration. Ensure it is mechanically secure and safe to operate.</Text>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose} color="gray.300">
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