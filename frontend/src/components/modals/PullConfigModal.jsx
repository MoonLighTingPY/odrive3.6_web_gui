import React, { useState, useRef } from 'react'
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
  useToast,
  Code,
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
import { getAllConfigurationParams } from '../../utils/odriveCommands'

const PullConfigModal = ({ isOpen, onClose, isConnected }) => {
  const dispatch = useDispatch()
  const toast = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 })
  
  // Use refs to control the pulling process
  const shouldPauseRef = useRef(false)
  const shouldStopRef = useRef(false)

  // Get configuration parameters from utils
  const configParamMaps = getAllConfigurationParams()

  // Add store action mappings
  const storeActionMap = {
    power: updatePowerConfig,
    motor: updateMotorConfig,
    encoder: updateEncoderConfig,
    control: updateControlConfig,
    interface: updateInterfaceConfig
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
      message,
      id: Date.now() + Math.random()
    }])
  }

  const pullBatchParams = async (odriveParams) => {
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
    if (torqueConstant > 0) {
      return 60 / (2 * Math.PI * torqueConstant)
    }
    return 230
  }

  const waitForResume = async () => {
    while (shouldPauseRef.current && !shouldStopRef.current) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
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
    setIsPaused(false)
    setProgress(0)
    setLogs([])
    setStats({ total: 0, success: 0, failed: 0 })
    shouldPauseRef.current = false
    shouldStopRef.current = false

    const totalParams = Object.values(configParamMaps).reduce((total, category) => {
      return total + Object.keys(category.params).length
    }, 0)

    let currentProgress = 0
    let successCount = 0
    let failedCount = 0

    addLog('info', 'System', 'Pull Started', '', null, `Starting fast pull of ${totalParams} parameters...`)

    try {
      for (const [categoryKey, category] of Object.entries(configParamMaps)) {
        if (shouldStopRef.current) break

        const categoryConfig = {}
        
        addLog('info', category.name, 'Category Started', '', null, `Pulling ${category.name} (${Object.keys(category.params).length} params)...`)

        const paramEntries = Object.entries(category.params)
        const batchSize = 10
        
        for (let i = 0; i < paramEntries.length; i += batchSize) {
          if (shouldStopRef.current) break

          // Wait if paused
          await waitForResume()
          if (shouldStopRef.current) break

          const batch = paramEntries.slice(i, i + batchSize)
          const odriveParams = batch.map(([paramKey, odriveParam]) => odriveParam)
          
          try {
            const batchResults = await pullBatchParams(odriveParams)
            
            batchResults.forEach((result, index) => {
              const [paramKey, odriveParam] = batch[index]
              
              if (result.success) {
                let value = result.value
                
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
              setStats({ 
                total: totalParams, 
                success: successCount, 
                failed: failedCount 
              })
            })
                    
          } catch (error) {
            batch.forEach(([paramKey, odriveParam]) => {
              addLog('error', category.name, paramKey, odriveParam, null, error.message)
              failedCount++
              currentProgress++
              setProgress((currentProgress / totalParams) * 100)
              setStats({ 
                total: totalParams, 
                success: successCount, 
                failed: failedCount 
              })
            })
          }
          
          if (i + batchSize < paramEntries.length && !shouldStopRef.current) {
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }

        // Update store for this category
        if (!shouldStopRef.current && Object.keys(categoryConfig).length > 0) {
          try {
            const storeAction = storeActionMap[categoryKey]
            if (storeAction) {
              dispatch(storeAction(categoryConfig))
              addLog('info', category.name, 'Store Updated', '', null, `Updated ${Object.keys(categoryConfig).length} parameters`)
            }
          } catch (error) {
            addLog('error', category.name, 'Store Update', '', null, `Failed to update store: ${error.message}`)
          }
        }
      }

      if (!shouldStopRef.current) {
        addLog('info', 'System', 'Pull Completed', '', null, 
          `Completed! ${successCount} successful, ${failedCount} failed out of ${totalParams} total parameters`)

        toast({
          title: 'Configuration Pull Complete',
          description: `${successCount}/${totalParams} parameters pulled successfully`,
          status: successCount === totalParams ? 'success' : 'warning',
          duration: 5000,
        })
      } else {
        addLog('info', 'System', 'Pull Stopped', '', null, 'Pull operation was stopped by user')
        toast({
          title: 'Pull Stopped',
          description: `Stopped at ${successCount}/${totalParams} parameters`,
          status: 'info',
          duration: 3000,
        })
      }

    } catch (error) {
      addLog('error', 'System', 'Pull Failed', '', null, `Unexpected error: ${error.message}`)
      toast({
        title: 'Pull Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }

    setIsLoading(false)
    setIsPaused(false)
  }

  const handlePauseResume = () => {
    if (isPaused) {
      shouldPauseRef.current = false
      setIsPaused(false)
      addLog('info', 'System', 'Pull Resumed', '', null, 'Configuration pull resumed')
    } else {
      shouldPauseRef.current = true
      setIsPaused(true)
      addLog('info', 'System', 'Pull Paused', '', null, 'Configuration pull paused')
    }
  }

  const handleStop = () => {
    shouldStopRef.current = true
    shouldPauseRef.current = false
    setIsPaused(false)
    addLog('info', 'System', 'Pull Stopping', '', null, 'Stopping configuration pull...')
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
              Fast batch pull using ODrive v0.5.6 parameter mappings
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
                {isPaused && (
                  <Badge colorScheme="orange" variant="solid">
                    PAUSED
                  </Badge>
                )}
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
              <Progress 
                value={progress} 
                colorScheme={isPaused ? "orange" : "blue"} 
                size="sm" 
              />
            )}

            {/* Control Buttons */}
            {isLoading && (
              <HStack spacing={3} justify="center">
                <Button
                  colorScheme={isPaused ? "green" : "orange"}
                  size="sm"
                  onClick={handlePauseResume}
                >
                  {isPaused ? "▶️ Resume" : "⏸️ Pause"}
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleStop}
                >
                  ⏹️ Stop
                </Button>
              </HStack>
            )}

            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="sm">
                  Pulling from centralized command mappings:
                </Text>
                <Text fontSize="xs">
                  • All parameter paths defined in utils/odriveCommands.js
                </Text>
                <Text fontSize="xs">
                  • Batch processing with pause/resume controls
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
              Close
            </Button>
            <Button
              colorScheme="blue"
              onClick={pullAllConfig}
              isLoading={isLoading}
              isDisabled={!isConnected}
              loadingText={isPaused ? "Paused..." : "Fast Pulling..."}
            >
              🚀 Start Pull
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PullConfigModal