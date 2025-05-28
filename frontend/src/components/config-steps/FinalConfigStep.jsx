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
  Input,
  IconButton,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, EditIcon, CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'

const FinalConfigStep = () => {
  const toast = useToast()
  const { isOpen: isCommandsOpen, onToggle: onCommandsToggle } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const { isOpen: isVerificationOpen, onOpen: onVerificationOpen, onClose: onVerificationClose } = useDisclosure()
  
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editingCommand, setEditingCommand] = useState('')
  const [customCommands, setCustomCommands] = useState({})
  const [disabledCommands, setDisabledCommands] = useState(new Set())
  const [enableCommandEditing, setEnableCommandEditing] = useState(false)
  const [verificationResults, setVerificationResults] = useState([])
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  
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

  // Generate base commands using useMemo to prevent infinite re-renders
  const baseGeneratedCommands = useMemo(() => {
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

    // Interface configuration commands (ODrive v0.5.6 specific)
    
    // CAN configuration (v0.5.6 syntax)
    if (safeBool(interfaceConfig.enable_can)) {
      commands.push(`odrv0.axis0.config.can.node_id = ${safeValue(interfaceConfig.can_node_id, 0)}`)
      // Note: CAN baudrate is typically set via DIP switches or other methods in v0.5.6
    }
    
    // UART configuration is done via GPIO pins in v0.5.6, not a global baudrate setting
    // Skip UART baudrate configuration as it's not available in this firmware version
    
    // Watchdog configuration
    if (safeBool(interfaceConfig.enable_watchdog)) {
      commands.push(`odrv0.axis0.config.watchdog_timeout = ${safeValue(interfaceConfig.watchdog_timeout, 0)}`)
    }

    // GPIO configuration (v0.5.6 syntax)
    for (let i = 1; i <= 4; i++) {
      const gpioMode = safeValue(interfaceConfig[`gpio${i}_mode`], 0)
      commands.push(`odrv0.config.gpio${i}_mode = ${gpioMode}`)
    }

    // Step/Direction interface (if enabled)
    if (safeBool(interfaceConfig.enable_step_dir)) {
      commands.push(`odrv0.axis0.config.step_dir_always_on = ${safeBool(interfaceConfig.step_dir_always_on) ? 'True' : 'False'}`)
    }

    return commands
  }, [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig])

  // Final commands list with custom edits applied
  const finalCommands = useMemo(() => {
    return baseGeneratedCommands.map((command, index) => {
      // Return custom command if edited, otherwise return original
      return customCommands[index] || command
    }).filter((_, index) => !disabledCommands.has(index))
  }, [baseGeneratedCommands, customCommands, disabledCommands])

  // Extract property path and expected value from command
  const parseCommand = (command) => {
    const match = command.match(/^(.+?)\s*=\s*(.+)$/)
    if (match) {
      let property = match[1].trim()
      let expectedValue = match[2].trim()
      
      // Convert odrv0 syntax to device syntax for reading
      property = property.replace(/^odrv0\./, 'device.')
      
      // Parse expected value - keep the original string format for better comparison
      let parsedExpectedValue = expectedValue
      if (expectedValue === 'True') {
        parsedExpectedValue = true
      } else if (expectedValue === 'False') {
        parsedExpectedValue = false
      } else if (!isNaN(parseFloat(expectedValue))) {
        parsedExpectedValue = parseFloat(expectedValue)
      }
      
      return { 
        property, 
        expectedValue: parsedExpectedValue,
        originalExpectedValue: expectedValue // Keep original for display
      }
    }
    return null
  }

  // Verify applied configuration
  const verifyConfiguration = async (appliedCommands) => {
    setIsVerifying(true)
    setVerificationProgress(0)
    setVerificationResults([])
    
    const results = []
    const totalCommands = appliedCommands.length
    
    for (let i = 0; i < appliedCommands.length; i++) {
      const command = appliedCommands[i]
      const parsed = parseCommand(command)
      
      if (!parsed) {
        results.push({
          command,
          status: 'skipped',
          reason: 'Cannot parse command for verification'
        })
        setVerificationProgress(((i + 1) / totalCommands) * 100)
        continue
      }
      
      try {
        // Read the actual value from the device
        const response = await fetch('/api/odrive/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: parsed.property })
        })
        
        if (response.ok) {
          const result = await response.json()
          let actualValue = result.result
          
          // Parse the actual value based on its type
          if (typeof actualValue === 'string') {
            if (actualValue === 'True') {
              actualValue = true
            } else if (actualValue === 'False') {
              actualValue = false
            } else if (!isNaN(parseFloat(actualValue))) {
              actualValue = parseFloat(actualValue)
            }
          }
          
          // Compare values with proper type handling
          let matches = false
          let reason = ''
          
          if (typeof parsed.expectedValue === 'boolean' && typeof actualValue === 'boolean') {
            matches = parsed.expectedValue === actualValue
            reason = matches ? 'Boolean value matches' : `Expected ${parsed.expectedValue}, got ${actualValue}`
          } else if (typeof parsed.expectedValue === 'number' && typeof actualValue === 'number') {
            // Use tolerance for floating point numbers
            const tolerance = Math.abs(parsed.expectedValue) * 0.001 // 0.1% tolerance
            const minTolerance = 1e-6 // Minimum tolerance for very small numbers
            matches = Math.abs(actualValue - parsed.expectedValue) <= Math.max(tolerance, minTolerance)
            reason = matches ? 'Numeric value within tolerance' : `Expected ${parsed.expectedValue}, got ${actualValue} (diff: ${Math.abs(actualValue - parsed.expectedValue).toFixed(6)})`
          } else if (typeof parsed.expectedValue === 'number' && typeof actualValue === 'boolean') {
            // Handle case where we expect a number but get a boolean (should not match)
            matches = false
            reason = `Type mismatch: expected number ${parsed.expectedValue}, got boolean ${actualValue}`
          } else if (typeof parsed.expectedValue === 'boolean' && typeof actualValue === 'number') {
            // Handle case where we expect a boolean but get a number (should not match)
            matches = false
            reason = `Type mismatch: expected boolean ${parsed.expectedValue}, got number ${actualValue}`
          } else {
            // String comparison or other types
            matches = String(parsed.expectedValue) === String(actualValue)
            reason = matches ? 'String value matches' : `Expected "${parsed.expectedValue}", got "${actualValue}"`
          }
          
          results.push({
            command,
            property: parsed.property,
            expectedValue: parsed.expectedValue,
            actualValue,
            status: matches ? 'success' : 'mismatch',
            reason
          })
        } else {
          const error = await response.json()
          results.push({
            command,
            property: parsed.property,
            expectedValue: parsed.expectedValue,
            actualValue: null,
            status: 'error',
            reason: `Failed to read: ${error.error || 'Unknown error'}`
          })
        }
      } catch (error) {
        results.push({
          command,
          property: parsed.property,
          expectedValue: parsed.expectedValue,
          actualValue: null,
          status: 'error',
          reason: `Network error: ${error.message}`
        })
      }
      
      setVerificationProgress(((i + 1) / totalCommands) * 100)
      setVerificationResults([...results])
      
      // Small delay to prevent overwhelming the device
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    setIsVerifying(false)
    
    // Show summary toast
    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length
    const mismatchCount = results.filter(r => r.status === 'mismatch').length
    
    if (errorCount === 0 && mismatchCount === 0) {
      toast({
        title: 'Verification Complete',
        description: `All ${successCount} commands verified successfully!`,
        status: 'success',
        duration: 5000,
      })
    } else {
      toast({
        title: 'Verification Complete',
        description: `${successCount} success, ${mismatchCount} mismatches, ${errorCount} errors`,
        status: mismatchCount > 0 || errorCount > 0 ? 'warning' : 'info',
        duration: 5000,
      })
    }
  }

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
          payload = { commands: finalCommands }
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
        
        // If this was an apply action, offer verification
        if (action === 'apply') {
          setTimeout(() => {
            onVerificationOpen()
          }, 1000) // Give device a moment to settle
        }
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

  const startEditing = (index) => {
    setEditingIndex(index)
    setEditingCommand(customCommands[index] || baseGeneratedCommands[index])
  }

  const saveEdit = () => {
    if (editingCommand.trim()) {
      setCustomCommands(prev => ({
        ...prev,
        [editingIndex]: editingCommand.trim()
      }))
    }
    setEditingIndex(-1)
    setEditingCommand('')
  }

  const cancelEdit = () => {
    setEditingIndex(-1)
    setEditingCommand('')
  }

  const resetCommand = (index) => {
    setCustomCommands(prev => {
      const newCustom = { ...prev }
      delete newCustom[index]
      return newCustom
    })
  }

  const toggleCommand = (index) => {
    setDisabledCommands(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const addCustomCommand = () => {
    const newIndex = baseGeneratedCommands.length
    setCustomCommands(prev => ({
      ...prev,
      [newIndex]: '# Add your custom command here'
    }))
    setEditingIndex(newIndex)
    setEditingCommand('# Add your custom command here')
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green'
      case 'mismatch': return 'orange'
      case 'error': return 'red'
      case 'skipped': return 'gray'
      default: return 'gray'
    }
  }

  const enabledCommandCount = baseGeneratedCommands.length - disabledCommands.size + Object.keys(customCommands).filter(key => parseInt(key) >= baseGeneratedCommands.length).length

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
                <Text fontWeight="bold" color="white">
                  Configuration Commands Preview ({enabledCommandCount} commands)
                </Text>
                <HStack>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="enable-editing" mb="0" color="gray.300" fontSize="sm">
                      Enable Editing
                    </FormLabel>
                    <Switch
                      id="enable-editing"
                      size="sm"
                      colorScheme="odrive"
                      isChecked={enableCommandEditing}
                      onChange={(e) => setEnableCommandEditing(e.target.checked)}
                    />
                  </FormControl>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCommandsToggle}
                    rightIcon={isCommandsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    color="gray.300"
                  >
                    {isCommandsOpen ? 'Hide' : 'Show'} Commands
                  </Button>
                </HStack>
              </HStack>
              
              <Collapse in={isCommandsOpen}>
                <Box
                  bg="gray.900"
                  p={4}
                  borderRadius="md"
                  maxH="400px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.600"
                >
                  <VStack spacing={2} align="stretch">
                    {baseGeneratedCommands.map((command, index) => {
                      const isEditing = editingIndex === index
                      const isCustom = customCommands[index] !== undefined
                      const isDisabled = disabledCommands.has(index)
                      const displayCommand = customCommands[index] || command

                      return (
                        <HStack key={index} spacing={2} opacity={isDisabled ? 0.5 : 1}>
                          {enableCommandEditing && (
                            <Tooltip label={isDisabled ? "Enable command" : "Disable command"}>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                icon={<input type="checkbox" checked={!isDisabled} onChange={() => toggleCommand(index)} style={{ accentColor: '#00d4aa' }} />}
                                aria-label="Toggle command"
                              />
                            </Tooltip>
                          )}
                          
                          {isEditing ? (
                            <HStack flex={1} spacing={1}>
                              <Input
                                size="sm"
                                value={editingCommand}
                                onChange={(e) => setEditingCommand(e.target.value)}
                                bg="gray.800"
                                border="1px solid"
                                borderColor="blue.400"
                                color="white"
                                fontFamily="mono"
                                fontSize="sm"
                              />
                              <IconButton
                                size="xs"
                                colorScheme="green"
                                icon={<CheckIcon />}
                                onClick={saveEdit}
                                aria-label="Save edit"
                              />
                              <IconButton
                                size="xs"
                                colorScheme="red"
                                icon={<CloseIcon />}
                                onClick={cancelEdit}
                                aria-label="Cancel edit"
                              />
                            </HStack>
                          ) : (
                            <Code
                              display="block"
                              whiteSpace="pre"
                              color={isCustom ? "yellow.300" : "green.300"}
                              bg="transparent"
                              p={1}
                              fontSize="sm"
                              flex={1}
                              textDecoration={isDisabled ? "line-through" : "none"}
                            >
                              {displayCommand}
                            </Code>
                          )}
                          
                          {enableCommandEditing && !isEditing && (
                            <HStack spacing={1}>
                              <Tooltip label="Edit command">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  icon={<EditIcon />}
                                  onClick={() => startEditing(index)}
                                  aria-label="Edit command"
                                  color="gray.400"
                                />
                              </Tooltip>
                              {isCustom && (
                                <Tooltip label="Reset to original">
                                  <IconButton
                                    size="xs"
                                    variant="ghost"
                                    icon={<DeleteIcon />}
                                    onClick={() => resetCommand(index)}
                                    aria-label="Reset command"
                                    color="gray.400"
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          )}
                        </HStack>
                      )
                    })}
                    
                    {/* Custom commands */}
                    {Object.keys(customCommands)
                      .filter(key => parseInt(key) >= baseGeneratedCommands.length)
                      .map(key => {
                        const index = parseInt(key)
                        const isEditing = editingIndex === index
                        const isDisabled = disabledCommands.has(index)

                        return (
                          <HStack key={index} spacing={2} opacity={isDisabled ? 0.5 : 1}>
                            {enableCommandEditing && (
                              <Tooltip label={isDisabled ? "Enable command" : "Disable command"}>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  icon={<input type="checkbox" checked={!isDisabled} onChange={() => toggleCommand(index)} style={{ accentColor: '#00d4aa' }} />}
                                  aria-label="Toggle command"
                                />
                              </Tooltip>
                            )}
                            
                            {isEditing ? (
                              <HStack flex={1} spacing={1}>
                                <Input
                                  size="sm"
                                  value={editingCommand}
                                  onChange={(e) => setEditingCommand(e.target.value)}
                                  bg="gray.800"
                                  border="1px solid"
                                  borderColor="blue.400"
                                  color="white"
                                  fontFamily="mono"
                                  fontSize="sm"
                                />
                                <IconButton
                                  size="xs"
                                  colorScheme="green"
                                  icon={<CheckIcon />}
                                  onClick={saveEdit}
                                  aria-label="Save edit"
                                />
                                <IconButton
                                  size="xs"
                                  colorScheme="red"
                                  icon={<CloseIcon />}
                                  onClick={cancelEdit}
                                  aria-label="Cancel edit"
                                />
                              </HStack>
                            ) : (
                              <Code
                                display="block"
                                whiteSpace="pre"
                                color="cyan.300"
                                bg="transparent"
                                p={1}
                                fontSize="sm"
                                flex={1}
                                textDecoration={isDisabled ? "line-through" : "none"}
                              >
                                {customCommands[index]}
                              </Code>
                            )}
                            
                            {enableCommandEditing && !isEditing && (
                              <HStack spacing={1}>
                                <Tooltip label="Edit command">
                                  <IconButton
                                    size="xs"
                                    variant="ghost"
                                    icon={<EditIcon />}
                                    onClick={() => startEditing(index)}
                                    aria-label="Edit command"
                                    color="gray.400"
                                  />
                                </Tooltip>
                                <Tooltip label="Delete custom command">
                                  <IconButton
                                    size="xs"
                                    variant="ghost"
                                    icon={<DeleteIcon />}
                                    onClick={() => resetCommand(index)}
                                    aria-label="Delete command"
                                    color="gray.400"
                                  />
                                </Tooltip>
                              </HStack>
                            )}
                          </HStack>
                        )
                      })}
                    
                    {enableCommandEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={addCustomCommand}
                        leftIcon={<EditIcon />}
                        mt={2}
                      >
                        Add Custom Command
                      </Button>
                    )}
                  </VStack>
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
                <strong>Command Editing:</strong> Toggle "Enable Editing" to modify, disable, or add custom commands before applying.
              </Text>
            </Alert>
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <Text>
                <strong>Verification:</strong> After applying configuration, you'll be prompted to verify that all values were set correctly.
              </Text>
            </Alert>
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <Text>
                <strong>ODrive v0.5.6 Notes:</strong> UART configuration is handled via GPIO pin modes. Some newer firmware features may not be available.
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
                  Commands to execute: {enabledCommandCount}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  This will send all enabled configuration commands shown in the preview above.
                </Text>
                {Object.keys(customCommands).length > 0 && (
                  <Text color="yellow.400" fontSize="sm" mt={2}>
                    ⚠️ Includes {Object.keys(customCommands).length} custom/modified commands
                  </Text>
                )}
                <Text color="blue.400" fontSize="sm" mt={2}>
                  ℹ️ After applying, you'll be prompted to verify the configuration was set correctly.
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

      {/* Verification Modal */}
      <Modal isOpen={isVerificationOpen} onClose={onVerificationClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.600" maxW="900px">
          <ModalHeader color="white">
            Verify Applied Configuration
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.300">
                Would you like to verify that all configuration values were applied correctly? 
                This will read back each property from the ODrive to confirm the settings match what was intended.
              </Text>
              
              {isVerifying && (
                <Box>
                  <Text color="white" mb={2}>Verification Progress:</Text>
                  <Progress value={verificationProgress} colorScheme="blue" size="lg" />
                  <Text color="gray.400" fontSize="sm" mt={1}>
                    {Math.round(verificationProgress)}% complete
                  </Text>
                </Box>
              )}
              
              {verificationResults.length > 0 && (
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text color="white" fontWeight="bold">Verification Results:</Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="green">
                        {verificationResults.filter(r => r.status === 'success').length} Success
                      </Badge>
                      <Badge colorScheme="orange">
                        {verificationResults.filter(r => r.status === 'mismatch').length} Mismatch
                      </Badge>
                      <Badge colorScheme="red">
                        {verificationResults.filter(r => r.status === 'error').length} Error
                      </Badge>
                    </HStack>
                  </HStack>
                  
                  <Box
                    maxH="400px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                  >
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.700">
                        <Tr>
                          <Th color="gray.300" borderColor="gray.600">Status</Th>
                          <Th color="gray.300" borderColor="gray.600">Command</Th>
                          <Th color="gray.300" borderColor="gray.600">Expected (Type)</Th>
                          <Th color="gray.300" borderColor="gray.600">Actual (Type)</Th>
                          <Th color="gray.300" borderColor="gray.600">Details</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {verificationResults.map((result, index) => (
                          <Tr key={index}>
                            <Td borderColor="gray.600">
                              <Badge colorScheme={getStatusColor(result.status)} variant="solid">
                                {result.status.toUpperCase()}
                              </Badge>
                            </Td>
                            <Td borderColor="gray.600">
                              <Code fontSize="xs" bg="transparent" color="gray.300">
                                {result.command.length > 40 ? result.command.substring(0, 40) + '...' : result.command}
                              </Code>
                            </Td>
                            <Td borderColor="gray.600" color="white" fontSize="sm">
                              <VStack spacing={0} align="start">
                                <Text>
                                  {result.expectedValue !== null && result.expectedValue !== undefined
                                    ? (typeof result.expectedValue === 'boolean' 
                                       ? (result.expectedValue ? 'true' : 'false')
                                       : typeof result.expectedValue === 'number' 
                                       ? result.expectedValue.toString() 
                                       : String(result.expectedValue))
                                    : 'N/A'}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  ({typeof result.expectedValue})
                                </Text>
                              </VStack>
                            </Td>
                            <Td borderColor="gray.600" color="white" fontSize="sm">
                              <VStack spacing={0} align="start">
                                <Text>
                                  {result.actualValue !== null && result.actualValue !== undefined
                                    ? (typeof result.actualValue === 'boolean' 
                                       ? (result.actualValue ? 'true' : 'false')
                                       : typeof result.actualValue === 'number' 
                                       ? result.actualValue.toString() 
                                       : String(result.actualValue))
                                    : 'N/A'}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  ({typeof result.actualValue})
                                </Text>
                              </VStack>
                            </Td>
                            <Td borderColor="gray.600" color="gray.400" fontSize="xs">
                              {result.reason}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onVerificationClose} isDisabled={isVerifying}>
              {verificationResults.length > 0 ? 'Close' : 'Skip Verification'}
            </Button>
            {verificationResults.length === 0 && (
              <Button
                colorScheme="blue"
                onClick={() => verifyConfiguration(finalCommands)}
                isLoading={isVerifying}
                loadingText="Verifying..."
              >
                Start Verification
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default FinalConfigStep