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
  FormLabel
} from '@chakra-ui/react'

// Import our components
import CommandList from '../CommandList'
import ConfirmationModal from '../modals/ConfirmationModal'

// Import shared utilities
import { generateAllCommands } from '../../utils/odriveUnifiedRegistry'
import { executeConfigAction, saveAndRebootWithReconnect } from '../../utils/configurationActions'

const FinalConfigStep = () => {
  const toast = useToast()
  const dispatch = useDispatch()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()

  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [customCommands, setCustomCommands] = useState({})
  const [disabledCommands, setDisabledCommands] = useState(new Set())
  const [enableCommandEditing, setEnableCommandEditing] = useState(false)

  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)
  const { isConnected, connectedDevice } = useSelector(state => state.device)
  const selectedAxis = useSelector(state => state.ui.selectedAxis)

  const baseGeneratedCommands = useMemo(() => {
  const config = {
    power: powerConfig,
    motor: motorConfig,
    encoder: encoderConfig,
    control: controlConfig,
    interface: interfaceConfig
  }
  
  return generateAllCommands(config, selectedAxis) // Pass selectedAxis
}, [powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig, selectedAxis])

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
      apply_and_save: {
        title: 'Apply & Save Configuration',
        description: 'This will apply all configuration commands to the ODrive and save them to non-volatile memory. The device will reboot automatically.',
        color: 'blue',
        confirmText: 'Apply and save configuration'
      }
    }
    return details[action] || {}
  }

  const enabledCommandCount = baseGeneratedCommands.length - disabledCommands.size + Object.keys(customCommands).filter(key => parseInt(key) >= baseGeneratedCommands.length).length

  return (
    <Box h="100%" p={3} overflow="auto">
      <VStack spacing={4} align="stretch" maxW="1200px" mx="auto">

        <Card bg="gray.800" variant="elevated">
          <CardHeader py={2}>
            <Heading size="md" color="white" textAlign="center">Configuration Management</Heading>
          </CardHeader>
          <CardBody py={3}>
            <VStack spacing={4} align="stretch">


              {/* Configuration Commands - Always visible now */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold" color="white" fontSize="lg">
                    Configuration Commands ({enabledCommandCount} commands)
                  </Text>
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

                {/* Commands list - no longer collapsible */}
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