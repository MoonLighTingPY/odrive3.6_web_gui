import React, { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Button,
  Progress,
  Text,
  Alert,
  AlertIcon,
  Flex,
  useToast,
  Spinner,
  useDisclosure
} from '@chakra-ui/react'
import PowerConfigStep from '../config-steps/PowerConfigStep'
import MotorConfigStep from '../config-steps/MotorConfigStep'
import EncoderConfigStep from '../config-steps/EncoderConfigStep'
import ControlConfigStep from '../config-steps/ControlConfigStep'
import InterfaceConfigStep from '../config-steps/InterfaceConfigStep'
import FinalConfigStep from '../config-steps/FinalConfigStep'
import DebugConfigStep from '../config-steps/DebugConfigStep'
import { convertTorqueConstantToKv } from '../../utils/valueHelpers'
import { applyAndSaveConfiguration } from '../../utils/configurationActions'
import {
  loadAllConfigurationBatch
} from '../../utils/configBatchApi'
import EraseConfigModal from '../modals/EraseConfigModal'
import { getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import { useAxisStateGuard } from '../../hooks/useAxisStateGuard'

// Configuration steps array
const CONFIGURATION_STEPS = [
  { id: 1, name: 'Power', icon: '⚡', component: PowerConfigStep },
  { id: 2, name: 'Motor', icon: '🔧', component: MotorConfigStep },
  { id: 3, name: 'Encoder', icon: '📐', component: EncoderConfigStep },
  { id: 4, name: 'Control', icon: '🎮', component: ControlConfigStep },
  { id: 5, name: 'Interface', icon: '🔌', component: InterfaceConfigStep },
  { id: 6, name: 'Apply', icon: '✅', component: FinalConfigStep },
]

const ConfigurationTab = memo(() => {
  const dispatch = useDispatch()
  const toast = useToast()

  const { isConnected, connectedDevice } = useSelector(state => state.device)
  const { activeConfigStep } = useSelector(state => state.ui)
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  
  // Add this at component level instead of inside handleApplyAndSave
  const reduxConfig = useSelector(state => state.config)

  const [deviceConfig, setDeviceConfig] = useState({
    power: {},
    motor: {},
    encoder: {},
    control: {},
    interface: {}
  })
  const [loadingParams, setLoadingParams] = useState(new Set())
  const [isPullingConfig, setIsPullingConfig] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [isApplyingSave, setIsApplyingSave] = useState(false)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)


  const { isOpen: isEraseOpen, onOpen: onEraseOpen, onClose: onEraseClose } = useDisclosure()

  const steps = useMemo(() => [
    ...CONFIGURATION_STEPS,
    ...(import.meta.env.DEV ? [{ id: 7, name: 'Debug', icon: '🐛', component: DebugConfigStep }] : [])
  ], [])

  const currentStep = steps.find(step => step.id === activeConfigStep)
  const CurrentStepComponent = currentStep?.component

  const pullBatchParams = useCallback(async () => {
    if (!isConnected || isPullingConfig) return

    setIsPullingConfig(true)
    setPullProgress(0)

    try {
      setPullProgress(50) // Show progress

      // Load ALL configuration in ONE batch request
      const allConfig = await loadAllConfigurationBatch()

      setPullProgress(90)

      // Update device config with pulled values
      setDeviceConfig(allConfig)

      // Update Redux store
      Object.entries(allConfig).forEach(([category, config]) => {
        const actionMap = {
          power: 'config/updatePowerConfig',
          motor: 'config/updateMotorConfig',
          encoder: 'config/updateEncoderConfig',
          control: 'config/updateControlConfig',
          interface: 'config/updateInterfaceConfig'
        }

        if (actionMap[category] && Object.keys(config).length > 0) {
          dispatch({ type: actionMap[category], payload: config })
        }
      })

      setHasAutoLoaded(true)
      setPullProgress(100)


    } catch (error) {
      console.error('Failed to pull configuration:', error)
      toast({
        title: 'Configuration load failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsPullingConfig(false)
      setPullProgress(0)
    }
  }, [isConnected, isPullingConfig, toast, dispatch])

  useEffect(() => {
    const handlePresetLoaded = (event) => {
      const { config } = event.detail

      // Update LOCAL deviceConfig state (this is what was missing!)
      setDeviceConfig(config)

      // Update Redux store with the loaded preset configuration
      if (config.power) dispatch({ type: 'config/updatePowerConfig', payload: config.power })
      if (config.motor) dispatch({ type: 'config/updateMotorConfig', payload: config.motor })
      if (config.encoder) dispatch({ type: 'config/updateEncoderConfig', payload: config.encoder })
      if (config.control) dispatch({ type: 'config/updateControlConfig', payload: config.control })
      if (config.interface) dispatch({ type: 'config/updateInterfaceConfig', payload: config.interface })

    }

    window.addEventListener('presetLoaded', handlePresetLoaded)

    return () => {
      window.removeEventListener('presetLoaded', handlePresetLoaded)
    }
  }, [dispatch, toast])

  // Auto-pull configuration when connected - only once per connection
  useEffect(() => {
    if (isConnected && !hasAutoLoaded && !isPullingConfig) {
      pullBatchParams() // Changed from pullAllConfigInBackground
    } else if (!isConnected) {
      // Clear config and reset auto-load flag when disconnected
      setDeviceConfig({
        power: {},
        motor: {},
        encoder: {},
        control: {},
        interface: {}
      })
      setHasAutoLoaded(false)
    }
  }, [isConnected, hasAutoLoaded, isPullingConfig, pullBatchParams])

  useEffect(() => {
    const handleDeviceReconnected = async () => {
      if (isConnected && !isPullingConfig) {
        console.log('Device reconnected, pulling configuration...')
        try {
          await pullBatchParams()

          // Only show toast if this was an unexpected reconnection
          const isExpectedReconnection = sessionStorage.getItem('expectingReconnection') === 'true'
          if (!isExpectedReconnection) {
            toast({
              title: 'Configuration Updated',
              description: 'Configuration has been pulled from the reconnected device',
              status: 'info',
              duration: 3000,
            })
          }
        } catch (error) {
          console.error('Failed to pull config after reconnection:', error)
        }
      }
    }

    window.addEventListener('deviceReconnected', handleDeviceReconnected)

    return () => {
      window.removeEventListener('deviceReconnected', handleDeviceReconnected)
    }
  }, [isConnected, isPullingConfig, pullBatchParams, toast])

  // Update the config update handler
  const handleUpdateConfig = useCallback((category, configKey, value, axisNumber = selectedAxis) => {
    setDeviceConfig(prev => {
      // For axis-specific categories, store config per axis
      if (category === 'motor' || category === 'encoder' || category === 'control') {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [`axis${axisNumber}`]: {
              ...prev[category]?.[`axis${axisNumber}`],
              [configKey]: value
            }
          }
        }
      } else {
        // Power and interface are global
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [configKey]: value
          }
        }
      }
    })
    
    // Dispatch to Redux with axis info
    const actionMap = {
      power: 'config/updatePowerConfig',
      motor: 'config/updateMotorConfig', 
      encoder: 'config/updateEncoderConfig',
      control: 'config/updateControlConfig',
      interface: 'config/updateInterfaceConfig'
    }
    
    if (actionMap[category]) {
      dispatch({
        type: actionMap[category],
        payload: { [configKey]: value, axisNumber }
      })
    }
  }, [selectedAxis, dispatch])

  // Update parameter reading to be axis-aware
  const handleReadParameter = useCallback(async (category, configKey, axisNumber = selectedAxis) => {
    if (!isConnected) return
    
    setLoadingParams(prev => new Set([...prev, `${category}.${configKey}`]))
    
    try {
      // Build the correct ODrive path based on category and axis
      let odriveCommand
      if (category === 'power' || category === 'interface') {
        // Power and interface are global, not axis-specific
        const param = getCategoryParameters(category).find(p => p.configKey === configKey)
        odriveCommand = param?.odriveCommand || `config.${configKey}`
      } else {
        // Motor, encoder, control are axis-specific
        const param = getCategoryParameters(category).find(p => p.configKey === configKey)
        if (param?.odriveCommand) {
          odriveCommand = param.odriveCommand.replace(/axis0/g, `axis${axisNumber}`)
        } else {
          odriveCommand = `axis${axisNumber}.${category}.config.${configKey}`
        }
      }
      
      const response = await fetch('/api/odrive/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: odriveCommand })
      })
      
      if (response.ok) {
        const data = await response.json()
        let value = data.value

        // Handle special conversions
        if (configKey === 'motor_kv' && odriveCommand.includes('torque_constant')) {
          value = convertTorqueConstantToKv(value)
        }

        // Update the device config
        handleUpdateConfig(category, configKey, value, axisNumber)
        

        toast({
          title: 'Parameter Read',
          description: `${configKey}: ${data.value} (axis${axisNumber})`,
          status: 'success',
          duration: 2000,
        })
      } else {
        throw new Error('Failed to read parameter')
      }
    } catch (error) {
      console.error(`Failed to read ${category}.${configKey}:`, error)
      toast({
        title: 'Read Failed',
        description: `Failed to read ${configKey}: ${error.message}`,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoadingParams(prev => {
        const newSet = new Set(prev)
        newSet.delete(`${category}.${configKey}`)
        return newSet
      })
    }
  }, [isConnected, selectedAxis, toast, handleUpdateConfig])

  // Apply and Save function using shared utility
  const handleApplyAndSave = async () => {
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'No ODrive connected',
        status: 'error',
        duration: 3000,
      })
      return
    }

    // Use the component-level reduxConfig instead of calling useSelector here
    const fullConfig = {
      power: reduxConfig.powerConfig,
      motor: reduxConfig.motorConfig,
      encoder: reduxConfig.encoderConfig,
      control: reduxConfig.controlConfig,
      interface: reduxConfig.interfaceConfig
    }

    // Check if we have any actual configuration values
    const hasValidConfig = Object.values(fullConfig).some(category =>
      Object.keys(category).length > 0 &&
      Object.values(category).some(value => value !== undefined && value !== null && value !== '')
    )

    if (!hasValidConfig) {
      toast({
        title: 'No Configuration to Apply',
        description: 'Please configure some parameters before applying. Use the configuration steps or load current values first.',
        status: 'warning',
        duration: 5000,
      })
      return
    }

    setIsApplyingSave(true)
    try {
      sessionStorage.setItem('expectingReconnection', 'true')
      await applyAndSaveConfiguration(fullConfig, toast, dispatch, connectedDevice, selectedAxis)
      setTimeout(() => {
        sessionStorage.removeItem('expectingReconnection')
      }, 5000)
    } catch (error) {
      sessionStorage.removeItem('expectingReconnection')
      toast({
        title: 'Apply & Save Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsApplyingSave(false)
    }
  }

  const { execute: executeApplyAndSave, AxisGuardModal } = executeWithAxisCheck(
    handleApplyAndSave,
    "apply and save the configuration",
    "Apply & Save"
  )

  const nextConfigStep = () => {
    if (activeConfigStep < steps.length) {
      dispatch({ type: 'ui/setConfigStep', payload: activeConfigStep + 1 })
    }
  }

  const prevConfigStep = () => {
    if (activeConfigStep > 1) {
      dispatch({ type: 'ui/setConfigStep', payload: activeConfigStep - 1 })
    }
  }

  // Check if we should show configuration steps
  const shouldShowConfigSteps = () => {
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
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
    <Flex
      direction="column"
      flex="1"            // fill its parent (the TabPanel)
      minH="0"            // allow shrinking
      overflow="hidden"   // clamp all scroll to inner Box
      bg="gray.900"
    >
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

          {/* Configuration Loading Indicator */}
          {isPullingConfig && (
            <VStack spacing={2} w="100%" maxW="400px">
              <HStack spacing={2} align="center">
                <Spinner size="sm" color="blue.400" />
                <Text color="blue.400" fontSize="sm">
                  Loading configuration from ODrive...
                </Text>
              </HStack>
              <Progress
                value={pullProgress}
                colorScheme="blue"
                size="sm"
                borderRadius="md"
                w="100%"
              />
              <Text color="gray.400" fontSize="xs">
                {Math.round(pullProgress)}% complete
              </Text>
            </VStack>
          )}

          {/* Sectioned Progress Bar and Navigation */}
          <VStack spacing={3} w="100%" maxW="800px">
            {/* Progress Sections */}
            <HStack spacing={2} justify="center" w="100%">
              {steps.map((step) => (
                <VStack key={step.id} spacing={1} minW="60px">
                  <Box w="100%" h="4px" bg="gray.600" borderRadius="md" overflow="hidden">
                    <Box
                      w="100%"
                      h="100%"
                      bg={
                        step.id < activeConfigStep ? "green.400" :
                          step.id === activeConfigStep ? "odrive.400" :
                            "gray.600"
                      }
                      transition="all 0.3s ease"
                    />
                  </Box>
                  <Text
                    fontSize="2xs"
                    color={
                      step.id < activeConfigStep ? "green.300" :
                        step.id === activeConfigStep ? "odrive.300" :
                          "gray.500"
                    }
                    fontWeight={step.id === activeConfigStep ? "bold" : "normal"}
                    textAlign="center"
                  >
                    {step.name}
                  </Text>
                </VStack>
              ))}
            </HStack>

            {/* Navigation and Step Info */}
            <HStack justify="center" align="center" w="100%" spacing={6}>
              <Button
                onClick={prevConfigStep}
                isDisabled={activeConfigStep === 1}
                variant="outline"
                colorScheme="gray"
                size="sm"
                minW="80px"
              >
                Previous
              </Button>

              <VStack spacing={0}>
                <Text fontSize="lg" color="white" fontWeight="bold">
                  Step {activeConfigStep}: {currentStep?.name}
                </Text>
              </VStack>

              <Button
                onClick={nextConfigStep}
                isDisabled={activeConfigStep === steps.length}
                variant="outline"
                colorScheme="gray"
                size="sm"
                minW="80px"
              >
                Next
              </Button>
            </HStack>

            {/* Pull Config and Apply & Save Buttons */}
            {activeConfigStep < steps.length && (
              <HStack spacing={3} justify="center">
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="md"
                  onClick={onEraseOpen}
                  isDisabled={!isConnected}
                  leftIcon={<Text>🗑️</Text>}
                >
                  Erase Config
                </Button>

                <Button
                  colorScheme="green"
                  variant="outline"
                  size="md"
                  onClick={pullBatchParams}
                  isDisabled={!isConnected}
                  isLoading={isPullingConfig}
                  loadingText="Pulling..."
                  leftIcon={!isPullingConfig ? <Text>📥</Text> : undefined}
                >
                  Pull Current Config
                </Button>

                <Button
                  colorScheme="blue"
                  size="md"
                  onClick={executeApplyAndSave}
                  isDisabled={!isConnected}
                  isLoading={isApplyingSave}
                  loadingText="Applying & Saving..."
                  leftIcon={!isApplyingSave ? <Text>⚙️💾</Text> : undefined}
                >
                  Apply & Save Configuration
                </Button>
              </HStack>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Configuration Step Content - Fixed height container */}
      <Box flex="1" minH="0" overflowY="auto" overflowX="hidden">
        {CurrentStepComponent && (
          <CurrentStepComponent
            deviceConfig={deviceConfig}
            onReadParameter={handleReadParameter}
            onUpdateConfig={handleUpdateConfig}
            loadingParams={loadingParams}
          />
        )}
      </Box>

      {/* Erase Configuration Modal */}
      <EraseConfigModal
        isOpen={isEraseOpen}
        onClose={onEraseClose}
      />
      <AxisGuardModal />
    </Flex>
  )
})

ConfigurationTab.displayName = 'ConfigurationTab'

export default ConfigurationTab