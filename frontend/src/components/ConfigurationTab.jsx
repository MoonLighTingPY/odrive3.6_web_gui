import React from 'react'
import { Box, HStack, VStack, Button, Progress, Text, Flex } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import { nextConfigStep, prevConfigStep } from '../store/slices/uiSlice'

// Import all step components
import PowerConfigStep from './config-steps/PowerConfigStep'
import MotorConfigStep from './config-steps/MotorConfigStep'
import EncoderConfigStep from './config-steps/EncoderConfigStep'
import ControlConfigStep from './config-steps/ControlConfigStep'
import InterfaceConfigStep from './config-steps/InterfaceConfigStep'
import FinalConfigStep from './config-steps/FinalConfigStep'

const ConfigurationTab = () => {
  const dispatch = useDispatch()
  const { activeConfigStep } = useSelector(state => state.ui)

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
        {CurrentStepComponent && <CurrentStepComponent />}
      </Box>
    </Flex>
  )
}

export default ConfigurationTab