import React, { useState, useEffect, useCallback } from 'react'
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
  Spinner
} from '@chakra-ui/react'
import PowerConfigStep from './config-steps/PowerConfigStep'
import MotorConfigStep from './config-steps/MotorConfigStep'
import EncoderConfigStep from './config-steps/EncoderConfigStep'
import ControlConfigStep from './config-steps/ControlConfigStep'
import InterfaceConfigStep from './config-steps/InterfaceConfigStep'
import FinalConfigStep from './config-steps/FinalConfigStep'
import { getAllConfigurationParams } from '../utils/odriveCommands'

const ConfigurationTab = () => {
  const dispatch = useDispatch()
  const toast = useToast()
  
  const { isConnected } = useSelector(state => state.device)
  const { activeConfigStep } = useSelector(state => state.ui)
  
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

  const steps = [
    { id: 1, name: 'Power', icon: '⚡', component: PowerConfigStep },
    { id: 2, name: 'Motor', icon: '🔧', component: MotorConfigStep },
    { id: 3, name: 'Encoder', icon: '📐', component: EncoderConfigStep },
    { id: 4, name: 'Control', icon: '🎮', component: ControlConfigStep },
    { id: 5, name: 'Interface', icon: '🔌', component: InterfaceConfigStep },
    { id: 6, name: 'Apply', icon: '✅', component: FinalConfigStep }
  ]

  const currentStep = steps.find(step => step.id === activeConfigStep)
  const CurrentStepComponent = currentStep?.component

  const pullBatchParams = useCallback(async (odriveParams) => {
    const promises = odriveParams.map(async (odriveParam) => {
      try {
        const response = await fetch('/api/odrive/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: `odrv0.${odriveParam}` })
        })

        if (response.ok) {
          const result = await response.json()
          return { param: odriveParam, value: result.result, success: true }
        } else {
          throw new Error('Failed to read parameter')
        }
      } catch (error) {
        return { param: odriveParam, error: error.message, success: false }
      }
    })

    const batchResults = await Promise.allSettled(promises)
    
    return batchResults.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return { param: 'unknown', error: result.reason.message, success: false }
      }
    })
  }, [])

  const convertTorqueConstantToKv = useCallback((torqueConstant) => {
    if (torqueConstant > 0) {
      return 60 / (2 * Math.PI * torqueConstant)
    }
    return 230
  }, [])

  const pullAllConfigInBackground = useCallback(async () => {
    if (!isConnected || isPullingConfig) return

    setIsPullingConfig(true)
    setPullProgress(0)

    try {
      const configParamMaps = getAllConfigurationParams()
      const totalParams = Object.values(configParamMaps).reduce((total, category) => {
        return total + Object.keys(category.params).length
      }, 0)

      let currentProgress = 0
      let successCount = 0
      const allConfig = {}

      for (const [categoryKey, category] of Object.entries(configParamMaps)) {
        const categoryConfig = {}
        const paramEntries = Object.entries(category.params)
        const batchSize = 10
        
        for (let i = 0; i < paramEntries.length; i += batchSize) {
          const batch = paramEntries.slice(i, i + batchSize)
          const odriveParams = batch.map(([, odriveParam]) => odriveParam)
          
          try {
            const batchResults = await pullBatchParams(odriveParams)
            
            batchResults.forEach((result, index) => {
              const [configKey, odriveParam] = batch[index]
              
              if (result.success) {
                let value = result.value
                
                // Handle special conversions
                if (configKey === 'motor_kv' && odriveParam.includes('torque_constant')) {
                  const kvValue = convertTorqueConstantToKv(value)
                  categoryConfig[configKey] = kvValue
                } else {
                  categoryConfig[configKey] = value
                }
                
                successCount++
              }

              currentProgress++
              setPullProgress((currentProgress / totalParams) * 100)
            })
                    
          } catch (error) {
            console.error('Batch pull error:', error)
            currentProgress += batch.length
            setPullProgress((currentProgress / totalParams) * 100)
          }
          
          // Small delay between batches
          if (i + batchSize < paramEntries.length) {
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }

        if (Object.keys(categoryConfig).length > 0) {
          allConfig[categoryKey] = categoryConfig
        }
      }

      // Update device config with pulled values
      setDeviceConfig(allConfig)

      toast({
        title: 'Configuration loaded',
        description: `${successCount}/${totalParams} parameters loaded from ODrive`,
        status: successCount > totalParams * 0.8 ? 'success' : 'warning',
        duration: 3000,
      })

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
  }, [isConnected, isPullingConfig, pullBatchParams, convertTorqueConstantToKv, toast])

  // Auto-pull configuration when connected
  useEffect(() => {
    if (isConnected) {
      pullAllConfigInBackground()
    } else {
      // Clear config when disconnected
      setDeviceConfig({
        power: {},
        motor: {},
        encoder: {},
        control: {},
        interface: {}
      })
    }
  }, [isConnected, pullAllConfigInBackground])

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

  // Generate configuration commands
  const generateConfigCommands = useCallback(() => {
    const { power, motor, encoder, control, interface: interfaceConfig } = deviceConfig
    const commands = []

    const safeValue = (value, defaultValue = 0) => {
      if (value === undefined || value === null || isNaN(value)) {
        return defaultValue
      }
      return value
    }

    const safeBool = (value, defaultValue = false) => {
      if (value === undefined || value === null) {
        return defaultValue
      }
      return Boolean(value)
    }

    // Power configuration commands
    commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${safeValue(power.dc_bus_overvoltage_trip_level, 56)}`)
    commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${safeValue(power.dc_bus_undervoltage_trip_level, 10)}`)
    commands.push(`odrv0.config.dc_max_positive_current = ${safeValue(power.dc_max_positive_current, 10)}`)
    commands.push(`odrv0.config.dc_max_negative_current = ${safeValue(power.dc_max_negative_current, -10)}`)
    commands.push(`odrv0.config.brake_resistance = ${safeValue(power.brake_resistance, 2)}`)
    commands.push(`odrv0.config.enable_brake_resistor = ${safeBool(power.brake_resistor_enabled) ? 'True' : 'False'}`)

    // Motor configuration commands
    commands.push(`odrv0.axis0.motor.config.motor_type = ${safeValue(motor.motor_type, 0)}`)
    commands.push(`odrv0.axis0.motor.config.pole_pairs = ${safeValue(motor.pole_pairs, 7)}`)
    
    const motorKv = safeValue(motor.motor_kv, 230)
    const torqueConstant = motorKv > 0 ? (60 / (2 * Math.PI * motorKv)) : 0.04
    commands.push(`odrv0.axis0.motor.config.torque_constant = ${torqueConstant.toFixed(6)}`)
    
    commands.push(`odrv0.axis0.motor.config.current_lim = ${safeValue(motor.current_lim, 10)}`)
    commands.push(`odrv0.axis0.motor.config.calibration_current = ${safeValue(motor.calibration_current, 10)}`)
    commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${safeValue(motor.resistance_calib_max_voltage, 4)}`)
    commands.push(`odrv0.axis0.config.calibration_lockin.current = ${safeValue(motor.lock_in_spin_current, 10)}`)

    if (safeValue(motor.motor_type, 0) === 1) {
      commands.push(`odrv0.axis0.motor.config.phase_resistance = ${safeValue(motor.phase_resistance, 0)}`)
      commands.push(`odrv0.axis0.motor.config.phase_inductance = ${safeValue(motor.phase_inductance, 0)}`)
    }

    // Encoder configuration commands
    commands.push(`odrv0.axis0.encoder.config.mode = ${safeValue(encoder.encoder_type, 1)}`)
    if (safeValue(encoder.encoder_type, 1) === 1) {
      commands.push(`odrv0.axis0.encoder.config.cpr = ${safeValue(encoder.cpr, 4000)}`)
      commands.push(`odrv0.axis0.encoder.config.bandwidth = ${safeValue(encoder.bandwidth, 1000)}`)
      commands.push(`odrv0.axis0.encoder.config.use_index = ${safeBool(encoder.use_index) ? 'True' : 'False'}`)
      commands.push(`odrv0.axis0.encoder.config.calib_range = ${safeValue(encoder.calib_range, 0.02)}`)
      commands.push(`odrv0.axis0.encoder.config.calib_scan_distance = ${safeValue(encoder.calib_scan_distance, 16384)}`)
      commands.push(`odrv0.axis0.encoder.config.calib_scan_omega = ${safeValue(encoder.calib_scan_omega, 12.566)}`)
    }

    // Control configuration commands
    commands.push(`odrv0.axis0.controller.config.control_mode = ${safeValue(control.control_mode, 3)}`)
    commands.push(`odrv0.axis0.controller.config.input_mode = ${safeValue(control.input_mode, 1)}`)
    commands.push(`odrv0.axis0.controller.config.vel_limit = ${safeValue(control.vel_limit, 20)}`)
    commands.push(`odrv0.axis0.controller.config.pos_gain = ${safeValue(control.pos_gain, 1)}`)
    commands.push(`odrv0.axis0.controller.config.vel_gain = ${safeValue(control.vel_gain, 0.228)}`)
    commands.push(`odrv0.axis0.controller.config.vel_integrator_gain = ${safeValue(control.vel_integrator_gain, 0.228)}`)
    commands.push(`odrv0.axis0.controller.config.vel_limit_tolerance = ${safeValue(control.vel_limit_tolerance, 1.2)}`)
    commands.push(`odrv0.axis0.controller.config.vel_ramp_rate = ${safeValue(control.vel_ramp_rate, 10)}`)
    commands.push(`odrv0.axis0.controller.config.torque_ramp_rate = ${safeValue(control.torque_ramp_rate, 0.01)}`)
    commands.push(`odrv0.axis0.controller.config.circular_setpoints = ${safeBool(control.circular_setpoints) ? 'True' : 'False'}`)
    commands.push(`odrv0.axis0.controller.config.inertia = ${safeValue(control.inertia, 0)}`)
    commands.push(`odrv0.axis0.controller.config.input_filter_bandwidth = ${safeValue(control.input_filter_bandwidth, 2)}`)

    // Interface configuration commands
    if (safeBool(interfaceConfig.enable_can)) {
      commands.push(`odrv0.axis0.config.can.node_id = ${safeValue(interfaceConfig.can_node_id, 0)}`)
    }
    
    if (safeBool(interfaceConfig.enable_watchdog)) {
      commands.push(`odrv0.axis0.config.watchdog_timeout = ${safeValue(interfaceConfig.watchdog_timeout, 0)}`)
    }

    for (let i = 1; i <= 4; i++) {
      const gpioMode = safeValue(interfaceConfig[`gpio${i}_mode`], 0)
      commands.push(`odrv0.config.gpio${i}_mode = ${gpioMode}`)
    }

    if (safeBool(interfaceConfig.enable_step_dir)) {
      commands.push(`odrv0.axis0.config.step_dir_always_on = ${safeBool(interfaceConfig.step_dir_always_on) ? 'True' : 'False'}`)
    }

    return commands
  }, [deviceConfig])

  // Apply and Save function
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

    setIsApplyingSave(true)
    try {
      const commands = generateConfigCommands()
      
      // Step 1: Apply configuration
      toast({
        title: 'Applying configuration...',
        description: `Sending ${commands.length} commands to ODrive`,
        status: 'info',
        duration: 2000,
      })

      const applyResponse = await fetch('/api/odrive/apply_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands })
      })

      if (!applyResponse.ok) {
        const error = await applyResponse.json()
        throw new Error(`Failed to apply configuration: ${error.message || 'Unknown error'}`)
      }

      // Step 2: Save to non-volatile memory
      toast({
        title: 'Saving to memory...',
        description: 'Saving configuration to non-volatile memory',
        status: 'info',
        duration: 2000,
      })

      const saveResponse = await fetch('/api/odrive/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(`Failed to save configuration: ${error.message || 'Unknown error'}`)
      }

      
      toast({
        title: 'Configuration Applied & Saved',
        description: `Configuration successfully applied and saved to non-volatile memory`,
        status: 'success',
        duration: 5000,
      })

    } catch (error) {
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

            {/* Apply & Save Button */}
            {activeConfigStep < steps.length && (
              <Button
                colorScheme="blue"
                size="md"
                onClick={handleApplyAndSave}
                isDisabled={!isConnected}
                isLoading={isApplyingSave}
                loadingText="Applying & Saving..."
                leftIcon={!isApplyingSave ? <Text>⚙️💾</Text> : undefined}
              >
                Apply & Save Configuration
              </Button>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Configuration Step Content */}
      <Box flex="1" overflow="hidden">
        {CurrentStepComponent && (
          <CurrentStepComponent
            deviceConfig={deviceConfig}
            onReadParameter={readParameter}
            onUpdateConfig={onUpdateConfig}
            loadingParams={loadingParams}
          />
        )}
      </Box>
    </Flex>
  )
}

export default ConfigurationTab