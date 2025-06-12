import { useState, useMemo, useEffect } from 'react'
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
  useToast,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  SimpleGrid
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

// Import our new components
import CommandList from '../CommandList'
import CalibrationModal from '../modals/CalibrationModal'
import ConfirmationModal from '../modals/ConfirmationModal'

// Import shared utilities
import { generateConfigCommands } from '../../utils/configCommandGenerator'
import { executeConfigAction, applyAndSaveConfiguration } from '../../utils/configurationActions'

const FinalConfigStep = () => {
  const toast = useToast()
  const { isOpen: isCommandsOpen, onToggle: onCommandsToggle } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const { isOpen: isCalibrationOpen, onOpen: onCalibrationOpen, onClose: onCalibrationClose } = useDisclosure()
  
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [customCommands, setCustomCommands] = useState({})
  const [disabledCommands, setDisabledCommands] = useState(new Set())
  const [enableCommandEditing, setEnableCommandEditing] = useState(false)
  
  // Calibration state
  const [calibrationStatus, setCalibrationStatus] = useState(null)
  const [calibrationProgress, setCalibrationProgress] = useState(0)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationPhase, setCalibrationPhase] = useState('idle')
  const [calibrationSequence, setCalibrationSequence] = useState([])
  
  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)
  const { isConnected } = useSelector(state => state.device)
  

  // Poll calibration status when calibrating
  useEffect(() => {
    let interval = null
    if (isCalibrating) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('/api/odrive/calibration_status')
          if (response.ok) {
            const status = await response.json()
            console.log('Calibration status update:', status)
            setCalibrationStatus(status)
            setCalibrationProgress(status.progress_percentage || 0)
            setCalibrationPhase(status.calibration_phase || 'idle')
            
            // Check for errors FIRST before auto-continue
            const hasErrors = status.axis_error !== 0 || status.motor_error !== 0 || status.encoder_error !== 0
            
            if (hasErrors) {
              console.log('Calibration errors detected, stopping calibration:', {
                axis_error: status.axis_error,
                motor_error: status.motor_error, 
                encoder_error: status.encoder_error
              })
              
              setIsCalibrating(false)
              
              // Determine error messages based on error codes
              const errorMessages = []
              if (status.axis_error === 0x100) {
                errorMessages.push("Encoder subsystem failed")
              }
              if (status.encoder_error & 0x02) {
                errorMessages.push("Encoder CPR doesn't match motor pole pairs")
              }
              if (status.encoder_error & 0x200) {
                errorMessages.push("Hall sensors not calibrated")
              }
              
              const errorDescription = errorMessages.length > 0 
                ? errorMessages.join('; ')
                : `Axis: 0x${status.axis_error.toString(16)}, Motor: 0x${status.motor_error.toString(16)}, Encoder: 0x${status.encoder_error.toString(16)}`
              
              toast({
                title: 'Calibration Failed',
                description: errorDescription,
                status: 'error',
                duration: 8000,
                isClosable: true
              })
              
              return // Exit early, don't process auto-continue
            }
            
            // Auto-continue calibration sequence if needed (ONLY if no errors)
            if (status.auto_continue_action && status.calibration_phase === 'ready_for_offset') {
              console.log('Auto-continuing to encoder offset calibration...')
              
              // Add a state to prevent multiple auto-continue attempts
              if (!calibrationStatus?.auto_continue_in_progress) {
                setCalibrationStatus(prev => ({ ...prev, auto_continue_in_progress: true }))
                
                toast({
                  title: 'Auto-continuing calibration',
                  description: 'Encoder polarity complete, starting offset calibration...',
                  status: 'info',
                  duration: 3000,
                })
                
                // Wait a moment, then continue to offset calibration
                setTimeout(async () => {
                  try {
                    const continueResponse = await fetch('/api/odrive/auto_continue_calibration', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ step: 'encoder_offset' })
                    })
                    
                    if (continueResponse.ok) {
                      const result = await continueResponse.json()
                      console.log('Auto-continue result:', result)
                      toast({
                        title: 'Calibration continued',
                        description: result.message,
                        status: 'success',
                        duration: 3000,
                      })
                    }
                  } catch (error) {
                    console.error('Failed to auto-continue calibration:', error)
                    setIsCalibrating(false)
                    toast({
                      title: 'Auto-continue failed',
                      description: 'Failed to continue calibration sequence',
                      status: 'error',
                      duration: 5000,
                    })
                  } finally {
                    setCalibrationStatus(prev => ({ ...prev, auto_continue_in_progress: false }))
                  }
                }, 1000)
              }
            }
            
            // Check if calibration is complete
            if (status.calibration_phase === 'complete' || status.calibration_phase === 'full_calibration_complete') {
              console.log('Calibration completed successfully!')
              setIsCalibrating(false)
              setCalibrationProgress(100)
              toast({
                title: 'Calibration Complete!',
                description: 'Motor and encoder calibration completed successfully.',
                status: 'success',
                duration: 5000,
              })
            }
          } else {
            console.error('Failed to fetch calibration status:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Failed to fetch calibration status:', error)
        }
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isCalibrating, toast, calibrationStatus?.auto_continue_in_progress])

  // Generate base commands using shared utility
  const baseGeneratedCommands = useMemo(() => {
    const deviceConfig = {
      power: powerConfig,
      motor: motorConfig,
      encoder: encoderConfig,
      control: controlConfig,
      interface: interfaceConfig
    }
    return generateConfigCommands(deviceConfig)
  }, [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig])

  // Final commands list with custom edits applied
  const finalCommands = useMemo(() => {
    return baseGeneratedCommands.map((command, index) => {
      // Return custom command if edited, otherwise return original
      return customCommands[index] || command
    }).filter((_, index) => !disabledCommands.has(index))
  }, [baseGeneratedCommands, customCommands, disabledCommands])

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
      // Use the shared applyAndSaveConfiguration function for both actions
      if (action === 'save_and_reboot' || action === 'apply_and_save') {
        const deviceConfig = {
          power: powerConfig,
          motor: motorConfig,
          encoder: encoderConfig,
          control: controlConfig,
          interface: interfaceConfig
        }
        
        // Use the shared applyAndSaveConfiguration function from ConfigurationTab
        await applyAndSaveConfiguration(deviceConfig, toast)
      } else {
        const result = await executeConfigAction(action, { commands: finalCommands })
        
        // If this was a calibration action, start monitoring
        if (action.includes('calibrate')) {
          setIsCalibrating(true)
          setCalibrationProgress(0)
          setCalibrationPhase('starting')
          setCalibrationSequence(result.sequence || [])
          onCalibrationOpen()
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
      onConfirmClose()
    }
  }

  const handleAction = (action) => {
    setPendingAction(action)
    onConfirmOpen()
  }

  // Handler functions for child components
  const handleCustomCommandChange = (index, value) => {
    setCustomCommands(prev => {
      const newCustom = { ...prev }
      if (value === null) {
        delete newCustom[index]
      } else {
        newCustom[index] = value
      }
      return newCustom
    })
  }

  const handleCommandToggle = (index) => {
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

  const handleAddCustomCommand = () => {
    const newIndex = baseGeneratedCommands.length
    setCustomCommands(prev => ({
      ...prev,
      [newIndex]: '# Add your custom command here'
    }))
  }

    const getActionDetails = (action) => {
    const details = {
      erase: {
        title: 'Erase Configuration and Reboot',
        description: 'This will reset all ODrive settings to factory defaults and reboot the device.',
        color: 'red',
        confirmText: 'Yes, erase and reboot'
      },
      apply_and_save: {
        title: 'Apply & Save Configuration',
        description: 'This will apply all configuration commands to the ODrive and save them to non-volatile memory. The device will reboot automatically.',
        color: 'blue',
        confirmText: 'Apply and save configuration'
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
        title: 'Full Calibration Sequence',
        description: 'This will perform motor calibration, encoder polarity calibration, then encoder offset calibration in the correct order for ODrive v0.5.6.',
        color: 'orange',
        confirmText: 'Start full calibration'
      },
      calibrate_motor: {
        title: 'Motor Calibration Only',
        description: 'This will only perform motor resistance and inductance calibration.',
        color: 'orange',
        confirmText: 'Start motor calibration'
      },
      calibrate_encoder: {
        title: 'Encoder Calibration Sequence',
        description: 'This will perform encoder polarity calibration first, then encoder offset calibration. Motor must already be calibrated.',
        color: 'orange',
        confirmText: 'Start encoder calibration'
      },
      save: {
        title: 'Save to Non-Volatile Memory',
        description: 'This will save the current configuration to flash memory without rebooting.',
        color: 'green',
        confirmText: 'Save configuration'
      },
      clear_errors: {
        title: 'Clear All Errors',
        description: 'This will clear all error flags on the ODrive device. Use this to reset after fixing error conditions.',
        color: 'yellow',
        confirmText: 'Clear all errors'
      }
    }
    return details[action] || {}
  }

  const getCalibrationPhaseDescription = (phase) => {
    switch (phase) {
      case 'motor_calibration': return 'Measuring motor resistance and inductance...'
      case 'encoder_polarity': return 'Finding encoder direction/polarity...'
      case 'encoder_offset': return 'Calibrating encoder offset...'
      case 'full_calibration': return 'Running full calibration sequence...'
      case 'ready_for_polarity': return 'Ready to start encoder polarity calibration...'
      case 'ready_for_offset': return 'Ready to start encoder offset calibration...'
      case 'complete': return 'Calibration completed successfully!'
      case 'idle': return 'Calibration not running'
      default: return 'Unknown calibration state'
    }
  }

  const enabledCommandCount = baseGeneratedCommands.length - disabledCommands.size + Object.keys(customCommands).filter(key => parseInt(key) >= baseGeneratedCommands.length).length

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={4} align="stretch" maxW="1200px" mx="auto">

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="md" color="white" textAlign="center">Configuration Actions</Heading>
          </CardHeader>
          <CardBody py={3}>
            <VStack spacing={4} align="stretch">
              
              {/* Configuration Commands Preview */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold" color="white" fontSize="lg">
                    Configuration Commands Preview ({enabledCommandCount} commands)
                  </Text>
                  <HStack spacing={3}>
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
                    <CommandList
                      commands={baseGeneratedCommands}
                      customCommands={customCommands}
                      disabledCommands={disabledCommands}
                      enableEditing={enableCommandEditing}
                      onCustomCommandChange={handleCustomCommandChange}
                      onCommandToggle={handleCommandToggle}
                      onAddCustomCommand={handleAddCustomCommand}
                    />
                  </Box>
                </Collapse>
              </Box>

              {/* Main Action Buttons Grid */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                
                {/* Configuration Actions */}
                <VStack spacing={3}>
                  <Text fontWeight="bold" color="red.300" fontSize="sm" textAlign="center">
                    Configuration Management
                  </Text>
                  
                  <Button
                    colorScheme="red"
                    size="lg"
                    w="100%"
                    h="60px"
                    onClick={() => handleAction('erase')}
                    isDisabled={!isConnected}
                    isLoading={isLoading && pendingAction === 'erase'}
                  >
                    🗑️ Erase Old Configuration
                  </Button>

                  <Button
                    colorScheme="green"
                    size="lg"
                    w="100%"
                    h="60px"
                    onClick={() => handleAction('apply_and_save')}
                    isDisabled={!isConnected}
                    isLoading={isLoading && pendingAction === 'apply_and_save'}
                  >
                    ⚙️💾 Apply & Save Configuration
                  </Button>

                </VStack>

                {/* Calibration Actions */}
                <VStack spacing={3}>
                  <Text fontWeight="bold" color="orange.300" fontSize="sm" textAlign="center">
                    Calibration
                  </Text>
                  
                  <Button
                    colorScheme="orange"
                    size="lg"
                    w="100%"
                    h="60px"
                    onClick={() => handleAction('calibrate')}
                    isDisabled={!isConnected}
                    isLoading={isLoading && pendingAction === 'calibrate'}
                  >
                    🎯 Full Calibration
                  </Button>
                  
                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    h="60px"
                    onClick={() => handleAction('clear_errors')}
                    isDisabled={!isConnected}
                    isLoading={isLoading && pendingAction === 'clear_errors'}
                  >
                    🔄 Clear Errors
                  </Button>

                </VStack>
                                  

              </SimpleGrid>


            </VStack>
          </CardBody>
        </Card>

        {/* Use the new modal components */}
        <CalibrationModal
          isOpen={isCalibrationOpen}
          onClose={onCalibrationClose}
          isCalibrating={isCalibrating}
          calibrationProgress={calibrationProgress}
          calibrationPhase={calibrationPhase}
          calibrationSequence={calibrationSequence}
          calibrationStatus={calibrationStatus}
          getCalibrationPhaseDescription={getCalibrationPhaseDescription}
        />

        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          pendingAction={pendingAction}
          getActionDetails={getActionDetails}
          onConfirm={() => executeAction(pendingAction)}
          isLoading={isLoading}
          enabledCommandCount={enabledCommandCount}
          customCommandCount={Object.keys(customCommands).length}
        />
      </VStack>
    </Box>
  )
}

export default FinalConfigStep