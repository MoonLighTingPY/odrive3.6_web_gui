import React, { useState } from 'react'
import { Box, HStack, VStack, Button, Progress, Text, Flex, Alert, AlertIcon, useDisclosure, useToast } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import { nextConfigStep, prevConfigStep } from '../store/slices/uiSlice'

// Import all step components
import PowerConfigStep from './config-steps/PowerConfigStep'
import MotorConfigStep from './config-steps/MotorConfigStep'
import EncoderConfigStep from './config-steps/EncoderConfigStep'
import ControlConfigStep from './config-steps/ControlConfigStep'
import InterfaceConfigStep from './config-steps/InterfaceConfigStep'
import FinalConfigStep from './config-steps/FinalConfigStep'
import PullConfigModal from './modals/PullConfigModal'

const ConfigurationTab = ({ isConnected }) => {
  const dispatch = useDispatch()
  const toast = useToast()
  const { activeConfigStep } = useSelector(state => state.ui)
  
  // Device configuration state - source of truth from ODrive
  const [deviceConfig, setDeviceConfig] = useState({
    power: {},
    motor: {},
    encoder: {},
    control: {},
    interface: {}
  })
  
  // Loading states for individual parameters
  const [loadingParams, setLoadingParams] = useState(new Set())

  const steps = [
    { id: 1, name: 'Power', icon: '⚡', component: PowerConfigStep },
    { id: 2, name: 'Motor', icon: '⚙️', component: MotorConfigStep },
    { id: 3, name: 'Encoder', icon: '📐', component: EncoderConfigStep },
    { id: 4, name: 'Control', icon: '🎮', component: ControlConfigStep },
    { id: 5, name: 'Interface', icon: '🔌', component: InterfaceConfigStep },
    { id: 6, name: 'Apply', icon: '✅', component: FinalConfigStep },
  ]

  const currentStep = steps.find(step => step.id === activeConfigStep)
  const CurrentStepComponent = currentStep?.component

  const { isOpen: isPullModalOpen, onOpen: onPullModalOpen, onClose: onPullModalClose } = useDisclosure()

  const onUpdateConfig = (category, key, value) => {
  setDeviceConfig(prev => ({
    ...prev,
    [category]: {
      ...prev[category],
      [key]: value
    }
  }))
}

  // Function to read a single parameter from ODrive
  const readParameter = async (odriveParam, configCategory, configKey) => {
    if (!isConnected) return

    const paramId = `${configCategory}.${configKey}`
    setLoadingParams(prev => new Set([...prev, paramId]))

    try {
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: `odrv0.${odriveParam}` })
      })

      if (response.ok) {
        const result = await response.json()
        let value = result.result

        // Handle special conversions
        if (configKey === 'motor_kv' && odriveParam.includes('torque_constant')) {
          // Convert torque constant to Kv
          value = value > 0 ? (60 / (2 * Math.PI * value)) : 230
        }

        setDeviceConfig(prev => ({
          ...prev,
          [configCategory]: {
            ...prev[configCategory],
            [configKey]: value
          }
        }))

        toast({
          title: 'Parameter refreshed',
          description: `${configKey} = ${value}`,
          status: 'success',
          duration: 2000,
        })
      } else {
        throw new Error('Failed to read parameter')
      }
    } catch (error) {
      toast({
        title: 'Read failed',
        description: `Failed to read ${configKey}: ${error.message}`,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoadingParams(prev => {
        const newSet = new Set(prev)
        newSet.delete(paramId)
        return newSet
      })
    }
  }


  // Handle pull modal completion
  const handlePullComplete = (pulledConfig) => {
    setDeviceConfig(pulledConfig)
    onPullModalClose()
  }

    // Check if we should show configuration steps
  // In development, always show steps; in production, only show when connected
  const shouldShowConfigSteps = () => {
    // Check if we're in development mode
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    // Show steps if in development OR if connected
    return isDevelopment || isConnected
  }

  // If we shouldn't show config steps, show the connection warning
  if (!shouldShowConfigSteps()) {
    return (
      <Box p={6} bg="gray.900" h="100%">
        <Alert status="warning" bg="orange.900" borderColor="orange.500">
          <AlertIcon />
          Connect to an ODrive device to access configuration settings.
        </Alert>
      </Box>
    )
  }

  return (
    <>
      <Flex direction="column" h="100%" bg="gray.900">
        {/* Combined Header with Navigation and Progress */}
        <Box bg="gray.800" borderBottom="1px solid" borderColor="gray.600" p={4}>
          <VStack spacing={4}>
            {/* Step Indicators */}
            <HStack spacing={2} justify="center" w="100%" overflowX="auto">
              {steps.map((step) => (
                <Button
                  key={step.id}
                  size="sm"
                  variant={activeConfigStep === step.id ? "solid" : "outline"}
                  colorScheme={activeConfigStep === step.id ? "odrive" : "gray"}
                  onClick={() => dispatch({ type: 'ui/setConfigStep', payload: step.id })}
                  minW="60px"
                  h="50px"
                  flexDirection="column"
                  fontSize="xs"
                >
                  <Text fontSize="md" mb={1}>{step.icon}</Text>
                  <Text fontSize="xs">{step.name}</Text>
                </Button>
              ))}
            </HStack>

            <Button
              colorScheme="green"
              variant="outline"
              size="sm"
              onClick={onPullModalOpen}
              isDisabled={!isConnected}
            >
              📥 Pull All Configuration
            </Button>

            {/* Combined Progress Bar and Navigation */}
            <HStack justify="space-between" align="center" w="100%" maxW="800px">
              <Button
                onClick={() => dispatch(prevConfigStep())}
                isDisabled={activeConfigStep === 1}
                variant="outline"
                colorScheme="gray"
                size="sm"
                minW="80px"
              >
                Previous
              </Button>
              
              <VStack spacing={1} flex="1" mx={4}>
                <Progress 
                  value={(activeConfigStep / steps.length) * 100} 
                  colorScheme="odrive" 
                  size="sm" 
                  borderRadius="md"
                  w="100%"
                />
                <Text fontSize="xs" color="gray.400">
                  Step {activeConfigStep} of {steps.length}: {currentStep?.name}
                </Text>
              </VStack>
              
              <Button
                onClick={() => dispatch(nextConfigStep())}
                isDisabled={activeConfigStep === steps.length}
                colorScheme="odrive"
                size="sm"
                minW="80px"
              >
                Next
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Step Content - Full remaining height */}
        <Box flex="1" overflow="hidden" bg="gray.900">
          {CurrentStepComponent && (
            <CurrentStepComponent 
              deviceConfig={deviceConfig}
              onReadParameter={readParameter}
              onUpdateConfig={onUpdateConfig}
              loadingParams={loadingParams}
              isConnected={isConnected}
            />
          )}
        </Box>
      </Flex>
      
      <PullConfigModal
        isOpen={isPullModalOpen}
        onClose={onPullModalClose}
        onComplete={handlePullComplete}
        isConnected={isConnected}
      />
    </>
  )
}

export default ConfigurationTab