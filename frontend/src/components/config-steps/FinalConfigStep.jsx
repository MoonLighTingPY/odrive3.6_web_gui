import React, { useState, useMemo } from 'react'
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
  useToast,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Checkbox,
  Badge,
  Tooltip,
  Icon
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'

// Import our components
import CommandList from '../CommandList'
import ConfirmationModal from '../modals/ConfirmationModal'

// Import shared utilities
import { generateConfigCommands } from '../../utils/configCommandGenerator'
import { generateChangedCommands, getChangeStatistics } from '../../utils/configChangesDetector'
import { executeConfigAction, saveAndRebootWithReconnect } from '../../utils/configurationActions'
import { useAxisStateGuard } from '../../hooks/useAxisStateGuard'

const FinalConfigStep = () => {
  const toast = useToast()
  const dispatch = useDispatch()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()

  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [customCommands, setCustomCommands] = useState({})
  const [disabledCommands, setDisabledCommands] = useState(new Set())
  const [enableCommandEditing, setEnableCommandEditing] = useState(false)
  const [applyToBothAxes, setApplyToBothAxes] = useState(false)
  const [onlyChangedParams, setOnlyChangedParams] = useState(true) // New toggle, defaulted to true
  const { executeWithAxisCheck } = useAxisStateGuard()

  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig, initialConfig } = useSelector(state => state.config)
  const { isConnected, connectedDevice } = useSelector(state => state.device)
  const { selectedAxis } = useSelector(state => state.ui)

  // Calculate change statistics
  const changeStats = useMemo(() => {
    const currentConfig = {
      power: powerConfig,
      motor: motorConfig,
      encoder: encoderConfig,
      control: controlConfig,
      interface: interfaceConfig
    }
    
    return getChangeStatistics(initialConfig, currentConfig)
  }, [initialConfig, powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig])

  // Update the command generation logic
  const baseGeneratedCommands = useMemo(() => {
    const currentConfig = {
      power: powerConfig,
      motor: motorConfig,
      encoder: encoderConfig,
      control: controlConfig,
      interface: interfaceConfig
    }
    
    const targetAxis = applyToBothAxes ? null : selectedAxis
    
    if (onlyChangedParams) {
      // Generate commands only for changed parameters
      return generateChangedCommands(initialConfig, currentConfig, targetAxis, applyToBothAxes)
    } else {
      // Generate all commands (existing behavior)
      return generateConfigCommands(currentConfig, targetAxis)
    }
  }, [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig, initialConfig, selectedAxis, applyToBothAxes, onlyChangedParams])

  // Final commands list with custom edits applied
  const finalCommands = useMemo(() => {
    return baseGeneratedCommands.map((command, index) => {
      // Return custom command if edited, otherwise return original
      return customCommands[index] || command
    }).filter((_, index) => !disabledCommands.has(index))
  }, [baseGeneratedCommands, customCommands, disabledCommands])

  // Update the executeAction function to ensure consistent reconnection behavior
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
      if (action === 'apply_and_save') {
        // Mark that we're expecting a reconnection
        sessionStorage.setItem('expectingReconnection', 'true')
        
        // Use the edited/filtered commands, not just the generated ones
        // Step 1: Apply configuration
        toast({
          title: 'Applying configuration...',
          description: `Sending ${finalCommands.length} commands to ODrive`,
          status: 'info',
          duration: 2000,
        })

        await executeConfigAction('apply', { commands: finalCommands })

        // Step 2: Save configuration (backend handles reboot and reconnection)
        toast({
          title: 'Saving configuration...',
          description: 'Saving to non-volatile memory. Device will reboot.',
          status: 'warning',
          duration: 3000,
        })

        try {
          await saveAndRebootWithReconnect(toast, dispatch, connectedDevice)
          
          // Clear the flag after successful operation
          setTimeout(() => {
            sessionStorage.removeItem('expectingReconnection')
          }, 5000)
          
        } catch (error) {
          // Handle save errors...
          if (
            error.message &&
            (error.message.includes('reboot') || error.message.includes('disconnect'))
          ) {
            // treat as success for disconnect/reboot errors
            sessionStorage.removeItem('expectingReconnection')
          } else {
            sessionStorage.removeItem('expectingReconnection')
            throw error
          }
        }
      } else {
        // Handle other actions (like erase)
        await executeConfigAction(action, { commands: finalCommands })
      }
    } catch (error) {
      // Clear the flag on any error
      sessionStorage.removeItem('expectingReconnection')
      
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
    const actionDetails = getActionDetails(action)
    
    const { execute, AxisGuardModal } = executeWithAxisCheck(
      () => {
        setPendingAction(action)
        onConfirmOpen()
      },
      actionDetails.description,
      actionDetails.confirmText
    )

    // Execute with axis check
    execute()
    
    // Store the modal component for rendering
    setAxisGuardModal(AxisGuardModal)
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
      apply_and_save: {
        title: 'Apply & Save Configuration',
        description: 'This will apply all configuration commands to the ODrive and save them to non-volatile memory. The device will reboot automatically.',
        color: 'blue',
        confirmText: 'Apply and save configuration'
      }
    }
    return details[action] || {}
  }

  // Update the axis display text function
  const getAxisDisplayText = () => {
    if (applyToBothAxes) {
      return 'Both Axes (Axis 0 & Axis 1)'
    }
    return `Axis ${selectedAxis} Only`
  }

  // Update the command count display
  const enabledCommandCount = finalCommands.length

  // Add state for the modal
  const [AxisGuardModal, setAxisGuardModal] = useState(null)

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={4} align="stretch" maxW="1200px" mx="auto">

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="md" color="white" textAlign="center">Configuration Management</Heading>
          </CardHeader>
          <CardBody py={3}>
            <VStack spacing={4} align="stretch">

              {/* Configuration Mode and Statistics */}
              <Box>
                <VStack spacing={3} align="stretch">
                  
                  {/* Changed Parameters Statistics */}
                  {changeStats.totalChanged > 0 && (
                    <Box p={3} bg="blue.900" borderRadius="md">
                      <HStack justify="space-between" align="center">
                        <Text color="white" fontWeight="semibold" fontSize="sm">
                          Configuration Changes Detected
                        </Text>
                        <Badge colorScheme="blue" fontSize="sm">
                          {changeStats.totalChanged} parameter{changeStats.totalChanged !== 1 ? 's' : ''} changed
                        </Badge>
                      </HStack>
                      
                      <HStack spacing={2} mt={2} flexWrap="wrap">
                        {Object.entries(changeStats.changesByCategory).map(([category, count]) => (
                          count > 0 && (
                            <Badge key={category} colorScheme="cyan" fontSize="xs">
                              {category}: {count}
                            </Badge>
                          )
                        ))}
                      </HStack>
                    </Box>
                  )}

                  {/* Configuration Mode Toggle */}
                  <HStack justify="space-between" align="center">
                    <HStack spacing={2}>
                      <FormLabel htmlFor="only-changed-params" mb="0" color="gray.300" fontSize="sm">
                        Only changed parameters
                      </FormLabel>
                      <Tooltip label={onlyChangedParams 
                        ? "Generate commands only for parameters you've modified in the wizard"
                        : "Generate commands for all configuration parameters (162 total)"
                      }>
                        <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                      </Tooltip>
                    </HStack>
                    <Switch
                      id="only-changed-params"
                      size="sm"
                      colorScheme="odrive"
                      isChecked={onlyChangedParams}
                      onChange={(e) => setOnlyChangedParams(e.target.checked)}
                    />
                  </HStack>

                  {/* Axis Selection */}
                  <HStack justify="space-between" align="center">
                    <FormControl display="flex" alignItems="center" w="auto">
                      <HStack spacing={2}>
                        <FormLabel htmlFor="apply-both-axes" mb="0" color="gray.300" fontSize="sm" mr={2}>
                          Apply to both axes
                        </FormLabel>
                      </HStack>
                      <Checkbox
                        id="apply-both-axes"
                        size="md"
                        colorScheme="blue"
                        isChecked={applyToBothAxes}
                        onChange={(e) => setApplyToBothAxes(e.target.checked)}
                      />
                    </FormControl>
                  </HStack>
                  
                </VStack>
              </Box>

              {/* Configuration Commands */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="white" fontSize="lg">
                      Configuration Commands
                    </Text>
                    <HStack spacing={2}>
                      <Badge colorScheme={onlyChangedParams ? "green" : "blue"} fontSize="xs">
                        {onlyChangedParams ? "Changed only" : "All parameters"}
                      </Badge>
                      <Badge colorScheme="gray" fontSize="xs">
                        {enabledCommandCount} commands for {getAxisDisplayText()}
                      </Badge>
                    </HStack>
                  </VStack>
                  <HStack spacing={2} align="center">
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
                  </HStack>
                </HStack>

                {/* Commands list */}
                <Box
                  bg="gray.900"
                  p={4}
                  borderRadius="md"
                  maxH="500px"
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
              </Box>

            </VStack>

            <VStack spacing={4} w="100%" maxW="400px" mx="auto">
              <Button
                colorScheme="blue"
                size="lg"
                w="100%"
                h="60px"
                onClick={() => handleAction('apply_and_save')}
                isDisabled={!isConnected}
                isLoading={isLoading && pendingAction === 'apply_and_save'}
                mt={4}
              >
                ⚙️💾 Apply & Save Configuration
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Render the axis guard modal if it exists */}
        {AxisGuardModal && typeof AxisGuardModal === "function" && <AxisGuardModal />}

        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          pendingAction={pendingAction}
          getActionDetails={getActionDetails}
          onConfirm={() => executeAction(pendingAction)}
          isLoading={isLoading}
          enabledCommandCount={enabledCommandCount}
          customCommandCount={Object.keys(customCommands).length}
          targetAxis={applyToBothAxes ? 'both' : selectedAxis}
        />
      </VStack>
    </Box>
  )
}

export default FinalConfigStep