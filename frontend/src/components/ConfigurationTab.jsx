import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { setConfigStep, nextConfigStep, prevConfigStep } from '../store/slices/uiSlice'
import PowerConfigStep from './config-steps/PowerConfigStep'
import MotorConfigStep from './config-steps/MotorConfigStep'
import EncoderConfigStep from './config-steps/EncoderConfigStep'
import ControlConfigStep from './config-steps/ControlConfigStep'
import InterfaceConfigStep from './config-steps/InterfaceConfigStep'
import FinalConfigStep from './config-steps/FinalConfigStep'
import '../styles/ConfigurationTab.css'

const steps = [
  { id: 1, name: 'Power', icon: '⚡', component: PowerConfigStep },
  { id: 2, name: 'Motor', icon: '🔧', component: MotorConfigStep },
  { id: 3, name: 'Encoder', icon: '📊', component: EncoderConfigStep },
  { id: 4, name: 'Control', icon: '🎮', component: ControlConfigStep },
  { id: 5, name: 'Interface', icon: '🔌', component: InterfaceConfigStep },
  { id: 6, name: 'Apply', icon: '✅', component: FinalConfigStep },
]

const ConfigurationTab = ({ isConnected }) => {
  const dispatch = useDispatch()
  const { activeConfigStep } = useSelector(state => state.ui)

  const currentStep = steps.find(step => step.id === activeConfigStep)
  const CurrentStepComponent = currentStep?.component

  if (!isConnected) {
    return (
      <Box className="configuration-tab" p={8} textAlign="center">
        <Alert status="warning" variant="subtle" borderRadius="md">
          <AlertIcon />
          Please connect to an ODrive device to access configuration.
        </Alert>
      </Box>
    )
  }

  return (
    <Box className="configuration-tab" h="100%">
      {/* Step Navigation */}
      <HStack className="step-nav" p={0} bg="gray.800" borderBottom="1px solid" borderColor="gray.600">
        {steps.map((step) => (
          <Button
            key={step.id}
            variant="ghost"
            className={`step-button ${activeConfigStep === step.id ? 'active' : ''}`}
            onClick={() => dispatch(setConfigStep(step.id))}
            bg={activeConfigStep === step.id ? 'odrive.600' : 'transparent'}
            color={activeConfigStep === step.id ? 'white' : 'gray.300'}
            _hover={{ bg: activeConfigStep === step.id ? 'odrive.500' : 'gray.700' }}
            borderRadius={0}
            borderBottom={activeConfigStep === step.id ? '3px solid' : '3px solid transparent'}
            borderBottomColor={activeConfigStep === step.id ? 'odrive.400' : 'transparent'}
            minW="120px"
            p={4}
            h="auto"
            flexDirection="column"
          >
            <Text fontSize="xl" mb={1}>{step.icon}</Text>
            <Text fontSize="sm">{step.name}</Text>
          </Button>
        ))}
      </HStack>

      {/* Progress Bar */}
      <Box px={6} py={4} bg="gray.900">
        <Progress 
          value={(activeConfigStep / steps.length) * 100} 
          colorScheme="odrive" 
          size="sm" 
          borderRadius="md"
        />
        <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
          Step {activeConfigStep} of {steps.length}: {currentStep?.name}
        </Text>
      </Box>

      {/* Step Content */}
      <Box className="step-content" flex="1" overflowY="auto" p={6}>
        {CurrentStepComponent && <CurrentStepComponent />}
      </Box>

      {/* Navigation Buttons */}
      <HStack className="step-navigation" justify="space-between" p={6} bg="gray.800" borderTop="1px solid" borderColor="gray.600">
        <Button
          onClick={() => dispatch(prevConfigStep())}
          isDisabled={activeConfigStep === 1}
          variant="outline"
          colorScheme="gray"
        >
          Previous
        </Button>
        
        <Text className="step-indicator" color="gray.300" fontWeight="medium">
          {activeConfigStep} / {steps.length}
        </Text>
        
        <Button
          onClick={() => dispatch(nextConfigStep())}
          isDisabled={activeConfigStep === steps.length}
          colorScheme="odrive"
        >
          Next
        </Button>
      </HStack>
    </Box>
  )
}

export default ConfigurationTab