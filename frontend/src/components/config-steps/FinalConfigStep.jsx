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
  Collapse,
  useDisclosure,
  useToast,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

// Import our components
import CommandList from '../CommandList'
import ConfirmationModal from '../modals/ConfirmationModal'

// Import shared utilities
import { generateConfigCommands } from '../../utils/configCommandGenerator'
import { executeConfigAction, applyAndSaveConfiguration } from '../../utils/configurationActions'

const FinalConfigStep = () => {
  const toast = useToast()
  const { isOpen: isCommandsOpen, onToggle: onCommandsToggle } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [customCommands, setCustomCommands] = useState({})
  const [disabledCommands, setDisabledCommands] = useState(new Set())
  const [enableCommandEditing, setEnableCommandEditing] = useState(false)
  
  const { powerConfig, motorConfig, encoderConfig, controlConfig, interfaceConfig } = useSelector(state => state.config)
  const { isConnected } = useSelector(state => state.device)

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
      if (action === 'apply_and_save') {
        const deviceConfig = {
          power: powerConfig,
          motor: motorConfig,
          encoder: encoderConfig,
          control: controlConfig,
          interface: interfaceConfig
        }
        
        // Use the shared applyAndSaveConfiguration function
        await applyAndSaveConfiguration(deviceConfig, toast)
      } else {
        // Handle other actions (like erase)
        await executeConfigAction(action, { commands: finalCommands })
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

              {/* Single Column Layout for Configuration Actions */}
              <VStack spacing={4} w="100%" maxW="400px" mx="auto">
                
                <Text fontWeight="bold" color="blue.300" fontSize="lg" textAlign="center">
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
                  colorScheme="blue"
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