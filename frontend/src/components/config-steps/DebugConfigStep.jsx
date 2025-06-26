import { useState } from 'react'
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
  Progress,
  Badge,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon
} from '@chakra-ui/react'

import { loadAllConfigurationBatch } from '../../utils/configBatchApi'
import { generateAllCommands, getDebugInfo, getCategoryParameters } from '../../utils/odriveUnifiedRegistry'
import { executeConfigAction } from '../../utils/configurationActions'
import { saveAndRebootWithReconnect } from '../../utils/configurationActions'
const DebugConfigStep = () => {
  const toast = useToast()
  const dispatch = useDispatch()
  const { isConnected, connectedDevice } = useSelector(state => state.device)
  
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [debugResults, setDebugResults] = useState(null)
  const [logs, setLogs] = useState([])

  // Test configurations
  const testConfig1 = {
    power: {
      dc_bus_overvoltage_trip_level: 59.0,
      dc_bus_undervoltage_trip_level: 8.0,
      brake_resistance: 2.0,
      brake_resistor_enabled: false,
      dc_max_positive_current: 60.0,
      dc_max_negative_current: -50.0,
      max_regen_current: 0.0,
      fet_temp_limit_lower: 100,
      fet_temp_limit_upper: 120
    },
    motor: {
      pole_pairs: 7,
      motor_type: 0,
      motor_kv: 270,
      resistance_calib_max_voltage: 4.0,
      current_lim: 10.0,
      current_lim_margin: 8.0,
      torque_lim: 1000000,  // Use large number instead of 'inf'
      accel: 200,
      motor_thermistor_enabled: true,
      motor_temp_limit_lower: 100,
      motor_temp_limit_upper: 120
    },
    encoder: {
      encoder_type: 1,
      cpr: 4000,
      bandwidth: 100.0,
      calib_range: 0.02,
      calib_scan_distance: 150.0,
      calib_scan_omega: 12.566,
      pre_calibrated: false
    },
    control: {
      control_mode: 3,
      input_mode: 1,
      pos_gain: 20.0,
      vel_gain: 0.16,
      vel_integrator_gain: 0.32,
      vel_limit: 10.0,
      vel_limit_tolerance: 1.2,
      anticogging_enabled: false
    },
    interface: {
      can_node_id: 0,
      can_node_id_extended: false,
      can_baudrate: 250000,
      heartbeat_rate_ms: 100,
      enable_uart_a: false,
      uart_a_baudrate: 115200,
      enable_step_dir: false,
      enable_sensorless: false
    }
  }

  const testConfig2 = {
    power: {
      dc_bus_overvoltage_trip_level: 56.0,
      dc_bus_undervoltage_trip_level: 10.0,
      brake_resistance: 3.0,
      brake_resistor_enabled: true,
      dc_max_positive_current: 40.0,
      dc_max_negative_current: -30.0,
      max_regen_current: 5.0,
      fet_temp_limit_lower: 80,
      fet_temp_limit_upper: 100
    },
    motor: {
      pole_pairs: 14,
      motor_type: 0,
      motor_kv: 150,
      resistance_calib_max_voltage: 2.0,
      current_lim: 15.0,
      current_lim_margin: 12.0,
      torque_lim: 1000000,  // Use large number instead of 'inf'
      accel: 300,
      motor_thermistor_enabled: false,
      motor_temp_limit_lower: 80,
      motor_temp_limit_upper: 100
    },
    encoder: {
      encoder_type: 1,
      cpr: 8192,
      bandwidth: 1000.0,
      calib_range: 0.01,
      calib_scan_distance: 50.0,
      calib_scan_omega: 3.14159,
      pre_calibrated: true
    },
    control: {
      control_mode: 2,
      input_mode: 1,
      pos_gain: 50.0,
      vel_gain: 0.02,
      vel_integrator_gain: 0.1,
      vel_limit: 20.0,
      vel_limit_tolerance: 2.0,
      anticogging_enabled: true
    },
    interface: {
      can_node_id: 5,
      can_node_id_extended: true,
      can_baudrate: 500000,
      heartbeat_rate_ms: 50,
      enable_uart_a: true,
      uart_a_baudrate: 230400,
      enable_step_dir: true,
      enable_sensorless: true
    }
  }

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, type }])
  }

  // Helper: Wait for deviceReconnected event (with timeout)
const waitForDeviceReconnect = (timeout = 15000) => {
  return new Promise((resolve, reject) => {
    let timer
    const handler = () => {
      clearTimeout(timer)
      window.removeEventListener('deviceReconnected', handler)
      resolve()
    }
    window.addEventListener('deviceReconnected', handler)
    timer = setTimeout(() => {
      window.removeEventListener('deviceReconnected', handler)
      reject(new Error('Timed out waiting for device to reconnect'))
    }, timeout)
  })
}

// Helper: Actively try to reconnect to the device after reboot and fire deviceReconnected event
const reconnectAfterReboot = async (connectedDevice, dispatch, addLog) => {
  // Try to reconnect up to 5 times, 2s apart
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch('/api/odrive/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: connectedDevice })
      })
      if (response.ok) {
        dispatch && dispatch({ type: 'device/setConnectedDevice', payload: connectedDevice })
        window.dispatchEvent(new Event('deviceReconnected'))
        addLog && addLog('Device reconnected (manual trigger)', 'success')
        return true
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // ignore
    }
    await new Promise(res => setTimeout(res, 2000))
  }
  addLog && addLog('Device did not reconnect after reboot', 'warning')
  return false
}

  const runFullDebugTest = async () => {
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'No ODrive connected',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsRunning(true)
    setProgress(0)
    setLogs([])
    setDebugResults({})

    try {
      // Step 1: Get unified registry debug info
      addLog('🔍 Getting unified registry debug info...', 'info')
      setCurrentStep('Analyzing unified registry')
      setProgress(5)
      
      const registryInfo = getDebugInfo()
      addLog(`Found ${registryInfo.batchPathsCount} batch paths`, 'success')
      addLog(`Categories: ${registryInfo.categories.join(', ')}`, 'info')
      
      Object.entries(registryInfo.parameterCounts).forEach(([cat, count]) => {
        addLog(`${cat}: ${count} parameters`, 'info')
      })

      // Step 2: Pull ALL current configuration
      addLog('📥 Pulling ALL current configuration...', 'info')
      setCurrentStep('Pulling current configuration')
      setProgress(15)

      const initialConfig = await loadAllConfigurationBatch()
      addLog(`Pulled configuration with ${Object.keys(initialConfig).length} categories`, 'success')
      
      Object.entries(initialConfig).forEach(([cat, config]) => {
        addLog(`${cat}: ${Object.keys(config).length} parameters pulled`, 'info')
      })

      // Step 3: Apply Test Config 1
      addLog('⚙️ Applying Test Configuration 1...', 'info')
      setCurrentStep('Applying test config 1')
      setProgress(30)

      const commands1 = generateAllCommands(testConfig1)
      addLog(`Generated ${commands1.length} commands for test config 1`, 'info')
      
      await executeConfigAction('apply', { commands: commands1 })
      addLog('Applied test config 1 successfully', 'success')
      
      // Save and reboot, but don't abort if it fails
      try {
        await saveAndRebootWithReconnect(toast, dispatch, connectedDevice)
        addLog('Saved configuration and triggered reconnect', 'success')
      } catch (e) {
        addLog(`Save & Reboot Failed: ${e.message}`, 'warning')
      }

      // Wait for reboot and reconnection
      addLog('🔄 Waiting for device reboot...', 'warning')
      setProgress(40)
      await new Promise(resolve => setTimeout(resolve, 1000))
      addLog('⏳ Attempting to reconnect to device...', 'info')
      const reconnected = await reconnectAfterReboot(connectedDevice, dispatch, addLog)
      if (reconnected) {
        addLog('✅ Device reconnected', 'success')
      } else {
        try {
          await waitForDeviceReconnect()
          addLog('✅ Device reconnected (event)', 'success')
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
          addLog('⚠️ Device did not reconnect in time', 'warning')
        }
      }

      // Step 4: Pull config after Test 1
      addLog('📥 Pulling configuration after test 1...', 'info')
      setCurrentStep('Verifying test config 1')
      setProgress(50)

      const config1Result = await loadAllConfigurationBatch()
      addLog('Pulled configuration after test 1', 'success')

      // Step 5: Apply Test Config 2
      addLog('⚙️ Applying Test Configuration 2...', 'info')
      setCurrentStep('Applying test config 2')
      setProgress(60)

      const commands2 = generateAllCommands(testConfig2)
      addLog(`Generated ${commands2.length} commands for test config 2`, 'info')
      
      await executeConfigAction('apply', { commands: commands2 })
      addLog('Applied test config 2 successfully', 'success')
      
      // Save and reboot, but don't abort if it fails
      try {
        await saveAndRebootWithReconnect(toast, dispatch, connectedDevice)
        addLog('Saved configuration and triggered reconnect', 'success')
      } catch (e) {
        addLog(`Save & Reboot Failed: ${e.message}`, 'warning')
      }
      
      // Wait for reboot and reconnection
      addLog('🔄 Waiting for device reboot...', 'warning')
      setProgress(70)
      await new Promise(resolve => setTimeout(resolve, 1000))
      addLog('⏳ Attempting to reconnect to device...', 'info')
      const reconnected2 = await reconnectAfterReboot(connectedDevice, dispatch, addLog)
      if (reconnected2) {
        addLog('✅ Device reconnected', 'success')
      } else {
        try {
          await waitForDeviceReconnect()
          addLog('✅ Device reconnected (event)', 'success')
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
          addLog('⚠️ Device did not reconnect in time', 'warning')
        }
      }

      // Step 6: Pull config after Test 2
      addLog('📥 Pulling configuration after test 2...', 'info')
      setCurrentStep('Verifying test config 2')
      setProgress(85)

      const config2Result = await loadAllConfigurationBatch()
      addLog('Pulled configuration after test 2', 'success')

      // Step 7: Analyze results
      addLog('🔍 Analyzing test results...', 'info')
      setCurrentStep('Analyzing results')
      setProgress(95)

      const analysis = analyzeResults(
        initialConfig,
        testConfig1,
        config1Result,
        testConfig2,
        config2Result
      )

      setDebugResults({
        registryInfo,
        initialConfig,
        testConfig1,
        config1Result,
        testConfig2,
        config2Result,
        analysis,
        commands1,
        commands2
      })

      addLog('✅ Debug test completed successfully!', 'success')
      setProgress(100)

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error')
      toast({
        title: 'Debug Test Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsRunning(false)
      setCurrentStep('')
    }
  }

  const analyzeResults = (initial, test1Expected, test1Actual, test2Expected, test2Actual) => {
    const analysis = {
      parametersNotPulled: [],
      parametersNotSet: [],
      unexpectedChanges: [],
      workingParameters: [],
      categoryAnalysis: {}
    }

    // Analyze each category
    ;['power', 'motor', 'encoder', 'control', 'interface'].forEach(category => {
      const categoryParams = getCategoryParameters(category)
      const categoryAnalysis = {
        totalParams: categoryParams.length,
        pulledParams: 0,
        workingParams: 0,
        failedParams: []
      }

      categoryParams.forEach(param => {
        const key = param.configKey
        
        // Check if parameter was pulled
        const wasPulled = (
          initial[category] && initial[category][key] !== undefined &&
          test1Actual[category] && test1Actual[category][key] !== undefined &&
          test2Actual[category] && test2Actual[category][key] !== undefined
        )

        if (wasPulled) {
          categoryAnalysis.pulledParams++
          
          // Check if parameter changes as expected
          const test1ExpectedVal = test1Expected[category] ? test1Expected[category][key] : undefined
          const test1ActualVal = test1Actual[category] ? test1Actual[category][key] : undefined
          const test2ExpectedVal = test2Expected[category] ? test2Expected[category][key] : undefined
          const test2ActualVal = test2Actual[category] ? test2Actual[category][key] : undefined

          // Special comparison logic
          const test1Works = compareValues(test1ExpectedVal, test1ActualVal, param)
          const test2Works = compareValues(test2ExpectedVal, test2ActualVal, param)

          if (test1Works && test2Works) {
            categoryAnalysis.workingParams++
            analysis.workingParameters.push({
              category,
              parameter: key,
              path: param.path,
              test1: { expected: test1ExpectedVal, actual: test1ActualVal },
              test2: { expected: test2ExpectedVal, actual: test2ActualVal }
            })
          } else {
            categoryAnalysis.failedParams.push({
              parameter: key,
              path: param.path,
              test1Works,
              test2Works,
              test1: { expected: test1ExpectedVal, actual: test1ActualVal },
              test2: { expected: test2ExpectedVal, actual: test2ActualVal }
            })
            analysis.parametersNotSet.push({
              category,
              parameter: key,
              path: param.path,
              issue: !test1Works ? 'Test 1 failed' : 'Test 2 failed'
            })
          }
        } else {
          analysis.parametersNotPulled.push({
            category,
            parameter: key,
            path: param.path
          })
        }
      })

      analysis.categoryAnalysis[category] = categoryAnalysis
    })

    return analysis
  }

  // Helper function for value comparison
const compareValues = (expected, actual, param) => {
  if (expected === undefined) return true

  let actualVal = actual
  if (typeof actual === 'string') {
    const n = parseFloat(actual)
    if (!isNaN(n) && param.property.type === 'number') {
      actualVal = n
    } else if (actual === 'True' || actual === 'False') {
      actualVal = actual === 'True'
    }
  }

  if (param.type === 'boolean' || typeof expected === 'boolean') {
    const expectedBool = Boolean(expected)
    const actualBool = Boolean(actual)
    return expectedBool === actualBool
  }

  // infinite torque_lim special case
  if (param.configKey === 'torque_lim') {
    if (expected >= 1e6 && actualVal >= 1e6) return true
    if ((expected === 'inf' || expected === Infinity) && actualVal >= 1e6) return true
  }

  // motor_kv is stored and pulled as KV directly, so compare KV→KV
  if (param.configKey === 'motor_kv') {
    return Math.abs(expected - actualVal) < 1e-3
  }

  // numeric tolerance fallback
  if (typeof expected === 'number' && typeof actualVal === 'number') {
    return Math.abs(expected - actualVal) < 1e-3
  }

  return expected === actualVal
}

  const renderAnalysis = () => {
    if (!debugResults?.analysis) return null

    const { analysis } = debugResults

    return (
      <VStack spacing={4} align="stretch">
        {/* Summary Cards */}
        <HStack spacing={4} wrap="wrap">
          <Card bg="green.900" minW="200px">
            <CardBody>
              <Text fontSize="2xl" fontWeight="bold" color="green.300">
                {analysis.workingParameters.length}
              </Text>
              <Text color="green.100">Working Parameters</Text>
            </CardBody>
          </Card>
          
          <Card bg="red.900" minW="200px">
            <CardBody>
              <Text fontSize="2xl" fontWeight="bold" color="red.300">
                {analysis.parametersNotPulled.length}
              </Text>
              <Text color="red.100">Not Pulled</Text>
            </CardBody>
          </Card>
          
          <Card bg="orange.900" minW="200px">
            <CardBody>
              <Text fontSize="2xl" fontWeight="bold" color="orange.300">
                {analysis.parametersNotSet.length}
              </Text>
              <Text color="orange.100">Not Set Correctly</Text>
            </CardBody>
          </Card>
        </HStack>

        {/* Category Analysis */}
        <Card bg="gray.800">
          <CardHeader>
            <Heading size="md" color="white">Category Analysis</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.300">Category</Th>
                  <Th color="gray.300">Total</Th>
                  <Th color="gray.300">Pulled</Th>
                  <Th color="gray.300">Working</Th>
                  <Th color="gray.300">Failed</Th>
                  <Th color="gray.300">Success Rate</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(analysis.categoryAnalysis).map(([category, data]) => (
                  <Tr key={category}>
                    <Td color="white" fontWeight="bold">{category}</Td>
                    <Td color="gray.300">{data.totalParams}</Td>
                    <Td color="blue.300">{data.pulledParams}</Td>
                    <Td color="green.300">{data.workingParams}</Td>
                    <Td color="red.300">{data.failedParams.length}</Td>
                    <Td>
                      <Badge colorScheme={data.workingParams / data.totalParams > 0.8 ? 'green' : 'red'}>
                        {((data.workingParams / data.totalParams) * 100).toFixed(1)}%
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Detailed Issues */}
        <Accordion allowMultiple>
          {analysis.parametersNotPulled.length > 0 && (
            <AccordionItem>
              <AccordionButton bg="red.900" _expanded={{ bg: 'red.800' }}>
                <Box flex="1" textAlign="left" color="white">
                  Parameters Not Pulled ({analysis.parametersNotPulled.length})
                </Box>
                <AccordionIcon color="white" />
              </AccordionButton>
              <AccordionPanel bg="gray.900">
                <VStack align="stretch" spacing={2}>
                  {analysis.parametersNotPulled.map((param, idx) => (
                    <Box key={idx} p={2} bg="gray.800" borderRadius="md">
                      <Text color="white" fontWeight="bold">{param.category}.{param.parameter}</Text>
                      <Text color="gray.400" fontSize="sm">{param.path}</Text>
                    </Box>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          )}

          {analysis.parametersNotSet.length > 0 && (
            <AccordionItem>
              <AccordionButton bg="orange.900" _expanded={{ bg: 'orange.800' }}>
                <Box flex="1" textAlign="left" color="white">
                  Parameters Not Set Correctly ({analysis.parametersNotSet.length})
                </Box>
                <AccordionIcon color="white" />
              </AccordionButton>
              <AccordionPanel bg="gray.900">
                <VStack align="stretch" spacing={2}>
                  {analysis.parametersNotSet.map((param, idx) => (
                    <Box key={idx} p={2} bg="gray.800" borderRadius="md">
                      <Text color="white" fontWeight="bold">{param.category}.{param.parameter}</Text>
                      <Text color="gray.400" fontSize="sm">{param.path}</Text>
                      <Text color="orange.300" fontSize="sm">{param.issue}</Text>
                    </Box>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          )}

          <AccordionItem>
            <AccordionButton bg="blue.900" _expanded={{ bg: 'blue.800' }}>
              <Box flex="1" textAlign="left" color="white">
                Generated Commands
              </Box>
              <AccordionIcon color="white" />
            </AccordionButton>
            <AccordionPanel bg="gray.900">
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text color="white" fontWeight="bold" mb={2}>Test Config 1 Commands ({debugResults.commands1?.length})</Text>
                  <Textarea
                    value={debugResults.commands1?.join('\n') || ''}
                    readOnly
                    rows={10}
                    bg="gray.800"
                    color="gray.300"
                    fontSize="sm"
                  />
                </Box>
                <Box>
                  <Text color="white" fontWeight="bold" mb={2}>Test Config 2 Commands ({debugResults.commands2?.length})</Text>
                  <Textarea
                    value={debugResults.commands2?.join('\n') || ''}
                    readOnly
                    rows={10}
                    bg="gray.800"
                    color="gray.300"
                    fontSize="sm"
                  />
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    )
  }

  return (
    <Box h="100%" p={4} overflow="auto">
      <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
        
        <Card bg="gray.800" variant="elevated">
          <CardHeader>
            <Heading size="lg" color="white" textAlign="center">🐛 Debug Configuration Test</Heading>
            <Text color="gray.300" textAlign="center" mt={2}>
              Comprehensive testing of the unified registry system
            </Text>
          </CardHeader>
          <CardBody>
            
            <Alert status="info" bg="blue.900" mb={4}>
              <AlertIcon />
              <Text color="blue.100">
                This debug test will pull all parameters, apply two different test configurations, 
                save and reboot between each, then analyze what worked and what didn't.
              </Text>
            </Alert>

            <VStack spacing={4} align="stretch">
              
              <Button
                colorScheme="blue"
                size="lg"
                onClick={runFullDebugTest}
                isLoading={isRunning}
                loadingText={currentStep}
                isDisabled={!isConnected}
              >
                🚀 Run Full Debug Test
              </Button>

              {isRunning && (
                <Box>
                  <Text color="white" mb={2}>{currentStep}</Text>
                  <Progress value={progress} colorScheme="blue" />
                </Box>
              )}

              {/* Live Logs */}
              {logs.length > 0 && (
                <Card bg="gray.900">
                  <CardHeader>
                    <Heading size="md" color="white">Live Logs</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box maxH="300px" overflowY="auto">
                      <VStack align="stretch" spacing={1}>
                        {logs.map((log, idx) => (
                          <HStack key={idx} spacing={2}>
                            <Text color="gray.500" fontSize="xs" minW="80px">
                              {log.timestamp}
                            </Text>
                            <Text 
                              color={
                                log.type === 'error' ? 'red.300' :
                                log.type === 'success' ? 'green.300' :
                                log.type === 'warning' ? 'orange.300' :
                                'gray.300'
                              }
                              fontSize="sm"
                            >
                              {log.message}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </CardBody>
                </Card>
              )}

              {/* Results Analysis */}
              {debugResults && (
                <Card bg="gray.800">
                  <CardHeader>
                    <Heading size="md" color="white">Test Results Analysis</Heading>
                  </CardHeader>
                  <CardBody>
                    {renderAnalysis()}
                  </CardBody>
                </Card>
              )}

            </VStack>
          </CardBody>
        </Card>

      </VStack>
    </Box>
  )
}

export default DebugConfigStep