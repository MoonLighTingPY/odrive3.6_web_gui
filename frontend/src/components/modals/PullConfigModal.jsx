import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Progress,
  Alert,
  AlertIcon,
  Box,
  Badge,
  Divider,
  useToast,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { CheckIcon, WarningIcon, CloseIcon } from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import { 
  updatePowerConfig, 
  updateMotorConfig, 
  updateEncoderConfig, 
  updateControlConfig, 
  updateInterfaceConfig 
} from '../../store/slices/configSlice'

const PullConfigModal = ({ isOpen, onClose, isConnected }) => {
  const dispatch = useDispatch()
  const toast = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 })

  // Configuration parameters to pull from ODrive v0.5.6
  const configParams = {
    power: {
      name: 'Power Configuration',
      params: {
        dc_bus_overvoltage_trip_level: 'config.dc_bus_overvoltage_trip_level',
        dc_bus_undervoltage_trip_level: 'config.dc_bus_undervoltage_trip_level',
        dc_max_positive_current: 'config.dc_max_positive_current',
        dc_max_negative_current: 'config.dc_max_negative_current',
        brake_resistance: 'config.brake_resistance',
        brake_resistor_enabled: 'config.enable_brake_resistor',
      }
    },
    motor: {
      name: 'Motor Configuration',
      params: {
        motor_type: 'axis0.motor.config.motor_type',
        pole_pairs: 'axis0.motor.config.pole_pairs',
        motor_kv: 'axis0.motor.config.torque_constant', // Will convert from Kt to Kv
        current_lim: 'axis0.motor.config.current_lim',
        calibration_current: 'axis0.motor.config.calibration_current',
        resistance_calib_max_voltage: 'axis0.motor.config.resistance_calib_max_voltage',
        lock_in_spin_current: 'axis0.config.calibration_lockin.current',
        phase_resistance: 'axis0.motor.config.phase_resistance',
        phase_inductance: 'axis0.motor.config.phase_inductance',
      }
    },
    encoder: {
      name: 'Encoder Configuration',
      params: {
        encoder_type: 'axis0.encoder.config.mode',
        cpr: 'axis0.encoder.config.cpr',
        bandwidth: 'axis0.encoder.config.bandwidth',
        use_index: 'axis0.encoder.config.use_index',
        calib_range: 'axis0.encoder.config.calib_range',
        calib_scan_distance: 'axis0.encoder.config.calib_scan_distance',
        calib_scan_omega: 'axis0.encoder.config.calib_scan_omega',
        pre_calibrated: 'axis0.encoder.config.pre_calibrated',
        use_index_offset: 'axis0.encoder.config.use_index_offset',
        find_idx_on_lockin_only: 'axis0.encoder.config.find_idx_on_lockin_only',
        abs_spi_cs_gpio_pin: 'axis0.encoder.config.abs_spi_cs_gpio_pin',
        direction: 'axis0.encoder.config.direction',
        enable_phase_interpolation: 'axis0.encoder.config.enable_phase_interpolation',
        hall_polarity: 'axis0.encoder.config.hall_polarity',
        hall_polarity_calibrated: 'axis0.encoder.config.hall_polarity_calibrated',
      }
    },
    control: {
      name: 'Control Configuration',
      params: {
        control_mode: 'axis0.controller.config.control_mode',
        input_mode: 'axis0.controller.config.input_mode',
        vel_limit: 'axis0.controller.config.vel_limit',
        pos_gain: 'axis0.controller.config.pos_gain',
        vel_gain: 'axis0.controller.config.vel_gain',
        vel_integrator_gain: 'axis0.controller.config.vel_integrator_gain',
        vel_limit_tolerance: 'axis0.controller.config.vel_limit_tolerance',
        vel_ramp_rate: 'axis0.controller.config.vel_ramp_rate',
        torque_ramp_rate: 'axis0.controller.config.torque_ramp_rate',
        circular_setpoints: 'axis0.controller.config.circular_setpoints',
        inertia: 'axis0.controller.config.inertia',
        input_filter_bandwidth: 'axis0.controller.config.input_filter_bandwidth',
        homing_speed: 'axis0.controller.config.homing_speed',
        anticogging_enabled: 'axis0.controller.config.anticogging.anticogging_enabled',
      }
    },
    // Update the interface section in configParams
    interface: {
    name: 'Interface Configuration',
    params: {
        can_node_id: 'axis0.config.can.node_id',
        can_node_id_extended: 'axis0.config.can.is_extended',
        can_baudrate: 'can.config.baud_rate',
        can_heartbeat_rate_ms: 'axis0.config.can.heartbeat_rate_ms',
        enable_uart_a: 'config.enable_uart_a',
        uart_a_baudrate: 'config.uart_a_baudrate',
        uart0_protocol: 'config.uart0_protocol',
        enable_uart_b: 'config.enable_uart_b',
        uart_b_baudrate: 'config.uart_b_baudrate',
        uart1_protocol: 'config.uart1_protocol',
        gpio1_mode: 'config.gpio1_mode',
        gpio2_mode: 'config.gpio2_mode',
        gpio3_mode: 'config.gpio3_mode',
        gpio4_mode: 'config.gpio4_mode',
        enable_watchdog: 'axis0.config.enable_watchdog',
        watchdog_timeout: 'axis0.config.watchdog_timeout',
        enable_step_dir: 'axis0.config.enable_step_dir',
        step_dir_always_on: 'axis0.config.step_dir_always_on',
        enable_sensorless: 'axis0.config.enable_sensorless_mode',
    }
    }
  }

const addLog = (type, category, param, odriveParam, value = null, message = null) => {
  const timestamp = new Date().toLocaleTimeString()
  setLogs(prev => [...prev, {
    timestamp,
    type,
    category,
    param,
    odriveParam,
    value,
    message, // Use message instead of error for info logs
    id: Date.now() + Math.random()
  }])
}

  // Batch pull multiple parameters at once to speed up the process
  const pullBatchParams = async (odriveParams) => {
    const results = []
    
    // Use Promise.allSettled to pull multiple parameters simultaneously
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
  }

  const convertTorqueConstantToKv = (torqueConstant) => {
    // Kt = 60/(2π * Kv), so Kv = 60/(2π * Kt)
    if (torqueConstant > 0) {
      return 60 / (2 * Math.PI * torqueConstant)
    }
    return 230 // Default fallback
  }

  const pullAllConfig = async () => {
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'Not connected to ODrive',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    setProgress(0)
    setLogs([])
    setStats({ total: 0, success: 0, failed: 0 })

    // Calculate total parameters
    const totalParams = Object.values(configParams).reduce((total, category) => {
      return total + Object.keys(category.params).length
    }, 0)

    let currentProgress = 0
    let successCount = 0
    let failedCount = 0

    addLog('info', 'System', 'Pull Started', '', null, `Starting fast pull of ${totalParams} parameters...`)

    // Process each category with batch pulling
    for (const [categoryKey, category] of Object.entries(configParams)) {
      const categoryConfig = {}
      
      addLog('info', category.name, 'Category Started', '', null, `Pulling ${category.name} (${Object.keys(category.params).length} params)...`)

      // Prepare batch of parameters for this category
      const paramEntries = Object.entries(category.params)
      const batchSize = 10 // Pull 10 parameters at once
      
      // Process in batches
      for (let i = 0; i < paramEntries.length; i += batchSize) {
        const batch = paramEntries.slice(i, i + batchSize)
        const odriveParams = batch.map(([paramKey, odriveParam]) => odriveParam)
        
        try {
          // Pull batch of parameters simultaneously
          const batchResults = await pullBatchParams(odriveParams)
          
          // Process results
          batchResults.forEach((result, index) => {
            const [paramKey, odriveParam] = batch[index]
            
            if (result.success) {
              let value = result.value
              
              // Special handling for torque constant -> Kv conversion
              if (paramKey === 'motor_kv' && odriveParam.includes('torque_constant')) {
                const kvValue = convertTorqueConstantToKv(value)
                categoryConfig[paramKey] = kvValue
                addLog('success', category.name, paramKey, odriveParam, `${kvValue.toFixed(1)} RPM/V (from Kt: ${value})`)
              } else {
                categoryConfig[paramKey] = value
                addLog('success', category.name, paramKey, odriveParam, value)
              }
              
              successCount++
            } else {
              addLog('error', category.name, paramKey, odriveParam, null, result.error)
              failedCount++
            }

            currentProgress++
            setProgress((currentProgress / totalParams) * 100)
          })
          
        } catch (error) {
          // Handle batch failure
          batch.forEach(([paramKey, odriveParam]) => {
            addLog('error', category.name, paramKey, odriveParam, null, error.message)
            failedCount++
            currentProgress++
            setProgress((currentProgress / totalParams) * 100)
          })
        }
        
        // Small delay between batches to prevent overwhelming the ODrive
        if (i + batchSize < paramEntries.length) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      // Update the store for this category
      try {
        switch (categoryKey) {
          case 'power':
            if (Object.keys(categoryConfig).length > 0) {
              dispatch(updatePowerConfig(categoryConfig))
              addLog('info', category.name, 'Store Updated', '', null, `Updated ${Object.keys(categoryConfig).length} parameters`)
            }
            break
          case 'motor':
            if (Object.keys(categoryConfig).length > 0) {
              dispatch(updateMotorConfig(categoryConfig))
              addLog('info', category.name, 'Store Updated', '', null, `Updated ${Object.keys(categoryConfig).length} parameters`)
            }
            break
          case 'encoder':
            if (Object.keys(categoryConfig).length > 0) {
              dispatch(updateEncoderConfig(categoryConfig))
              addLog('info', category.name, 'Store Updated', '', null, `Updated ${Object.keys(categoryConfig).length} parameters`)
            }
            break
          case 'control':
            if (Object.keys(categoryConfig).length > 0) {
              dispatch(updateControlConfig(categoryConfig))
              addLog('info', category.name, 'Store Updated', '', null, `Updated ${Object.keys(categoryConfig).length} parameters`)
            }
            break
          case 'interface':
            if (Object.keys(categoryConfig).length > 0) {
              dispatch(updateInterfaceConfig(categoryConfig))
              addLog('info', category.name, 'Store Updated', '', null, `Updated ${Object.keys(categoryConfig).length} parameters`)
            }
            break
        }
      } catch (error) {
        addLog('error', category.name, 'Store Update', '', null, `Failed to update store: ${error.message}`)
      }
    }

    setStats({ total: totalParams, success: successCount, failed: failedCount })
    setIsLoading(false)

    addLog('info', 'System', 'Pull Completed', '', null, 
      `Completed! ${successCount} successful, ${failedCount} failed out of ${totalParams} total parameters`)

    toast({
      title: 'Configuration Pull Complete',
      description: `${successCount}/${totalParams} parameters pulled successfully`,
      status: successCount === totalParams ? 'success' : 'warning',
      duration: 5000,
    })
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckIcon color="green.400" />
      case 'error': return <CloseIcon color="red.400" />
      case 'info': return <WarningIcon color="blue.400" />
      default: return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" maxH="90vh">
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <Text>Pull Configuration from ODrive</Text>
            <Text fontSize="sm" color="gray.300">
              Fast batch pull of current ODrive configuration
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Stats and Progress */}
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Badge colorScheme="blue" variant="solid">
                  Total: {stats.total}
                </Badge>
                <Badge colorScheme="green" variant="solid">
                  Success: {stats.success}
                </Badge>
                <Badge colorScheme="red" variant="solid">
                  Failed: {stats.failed}
                </Badge>
              </HStack>
              
              {isLoading && (
                <HStack>
                  <Text fontSize="sm" color="gray.300">
                    {progress.toFixed(0)}%
                  </Text>
                </HStack>
              )}
            </HStack>

            {isLoading && (
              <Progress value={progress} colorScheme="blue" size="sm" />
            )}

            {/* Configuration Categories */}
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="sm">
                  Fast batch pulling from:
                </Text>
                <Text fontSize="xs">
                  • Power, Motor, Encoder, Control, and Interface settings
                </Text>
                <Text fontSize="xs">
                  • Using parallel requests for maximum speed
                </Text>
              </VStack>
            </Alert>

            {/* Log Display */}
            {logs.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>Pull Log:</Text>
                <Box
                  maxH="300px"
                  overflowY="auto"
                  bg="gray.900"
                  p={3}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.600"
                >
                  <VStack spacing={1} align="stretch">
                    {logs.slice(-50).map((log) => (
                      <HStack
                        key={log.id}
                        spacing={2}
                        p={2}
                        bg={log.type === 'error' ? 'red.900' : log.type === 'success' ? 'green.900' : 'gray.800'}
                        borderRadius="sm"
                        fontSize="xs"
                      >
                        {getLogIcon(log.type)}
                        <Text color="gray.400" minW="60px">
                          {log.timestamp}
                        </Text>
                        <Badge size="sm" colorScheme={log.type === 'error' ? 'red' : log.type === 'success' ? 'green' : 'blue'}>
                          {log.category}
                        </Badge>
                        <Text flex="1">
                            {log.param && <Code fontSize="xs" mr={2}>{log.param}</Code>}
                            {log.value !== null && log.value !== undefined && (
                                <Text as="span" color="green.300">
                                = {typeof log.value === 'boolean' ? (log.value ? 'true' : 'false') : log.value}
                                </Text>
                            )}
                            {log.error && (
                                <Text as="span" color="red.300">
                                Error: {log.error}
                                </Text>
                            )}
                            {log.message && (
                                <Text as="span" color={log.type === 'info' ? 'blue.300' : 'gray.300'}>
                                {log.message}
                                </Text>
                            )}
                            {!log.value && !log.error && !log.message && log.odriveParam && (
                                <Text as="span" color="gray.400">
                                {log.odriveParam}
                                </Text>
                            )}
                            </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={isLoading}
            >
              {isLoading ? 'Pulling...' : 'Close'}
            </Button>
            <Button
              colorScheme="blue"
              onClick={pullAllConfig}
              isLoading={isLoading}
              isDisabled={!isConnected}
              loadingText="Fast Pulling..."
            >
              🚀 Fast Pull All Config
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PullConfigModal