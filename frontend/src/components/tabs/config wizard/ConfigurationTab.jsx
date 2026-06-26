import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Alert,
  AlertIcon,
  Progress,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { STEPS } from '../../../utils/configSchema'
import { Zap, Cog, Compass, Gamepad2, Cable, CheckCircle2, Trash2, DownloadCloud, ClipboardList, Save } from 'lucide-react'
import { useConfigWizard } from '../../../hooks/useConfigWizard'
import ConfigStep from '../../config-steps/ConfigStep'
import MotorConfigStep from '../../config-steps/MotorConfigStep'
import ControlConfigStep from '../../config-steps/ControlConfigStep'
import ApplyConfigStep from '../../config-steps/ApplyConfigStep'
import EraseConfigModal from '../../modals/EraseConfigModal'

const STEP_ICONS = {
  power: Zap,
  motor: Cog,
  encoder: Compass,
  control: Gamepad2,
  interface: Cable,
  apply: CheckCircle2,
}

const StepIcon = ({ id }) => {
  const Icon = STEP_ICONS[id] || CheckCircle2
  return <Icon size={18} />
}

const ConfigurationTab = () => {
  const wizard = useConfigWizard()
  const toast = useToast()
  const [stepIndex, setStepIndex] = useState(0)
  const [applying, setApplying] = useState(false)
  const { isOpen: isEraseOpen, onOpen: onEraseOpen, onClose: onEraseClose } = useDisclosure()

  const step = STEPS[stepIndex]
  const isApplyStep = step.id === 'apply'

  const handleApplySave = async () => {
    setApplying(true)
    try {
      const { written, failed } = await wizard.applyChanges()
      if (failed.length) {
        toast({ title: `${failed.length} write(s) failed`, description: failed.map((x) => `${x.path}: ${x.error}`).join('; '), status: 'warning' })
      } else if (written === 0) {
        toast({ title: 'No changes to apply', status: 'info', duration: 2000 })
      } else {
        toast({ title: `Applied & saved ${written} change(s)`, status: 'success' })
      }
    } catch (err) {
      toast({ title: 'Apply failed', description: String(err.message || err), status: 'error' })
    } finally {
      setApplying(false)
    }
  }

  if (!wizard.isConnected) {
    return (
      <Box p={6} bg="gray.900" h="100%">
        <Alert status="warning" bg="orange.900" borderColor="orange.500">
          <AlertIcon />
          Connect to an ODrive device to access configuration settings.
        </Alert>
      </Box>
    )
  }

  const renderStep = () => {
    switch (step.id) {
      case 'motor':
        return <MotorConfigStep wizard={wizard} />
      case 'control':
        return <ControlConfigStep wizard={wizard} />
      case 'apply':
        return <ApplyConfigStep wizard={wizard} />
      default:
        return <ConfigStep stepId={step.id} wizard={wizard} />
    }
  }

  return (
    <Flex direction="column" flex="1" minH="0" overflow="hidden" bg="gray.900">
      {/* Header: step indicators, progress, navigation, action buttons */}
      <Box bg="gray.800" borderBottom="1px solid" borderColor="gray.600" p={4}>
        <VStack spacing={4}>
          {/* Step indicator buttons */}
          <HStack spacing={2} justify="center" w="100%" overflowX="auto">
            {STEPS.map((s, i) => (
              <Button
                key={s.id}
                size="sm"
                variant={i === stepIndex ? 'solid' : 'outline'}
                colorScheme={i === stepIndex ? 'odrive' : 'gray'}
                onClick={() => setStepIndex(i)}
                minW="60px"
                h="50px"
                flexDirection="column"
                fontSize="xs"
              >
                <StepIcon id={s.id} />
                <Text fontSize="xs" mt={1}>{s.label}</Text>
              </Button>
            ))}
          </HStack>

          {/* Pull progress */}
          {wizard.loading && (
            <VStack spacing={2} w="100%" maxW="400px">
              <HStack spacing={2}><Spinner size="sm" color="blue.400" /><Text color="blue.400" fontSize="sm">Loading configuration from ODrive…</Text></HStack>
              <Progress isIndeterminate colorScheme="blue" size="sm" borderRadius="md" w="100%" />
            </VStack>
          )}

          {/* Progress bars per step */}
          <HStack spacing={2} justify="center" w="100%" maxW="800px">
            {STEPS.map((s, i) => (
              <VStack key={s.id} spacing={1} minW="60px" flex="1">
                <Box w="100%" h="4px" bg="gray.600" borderRadius="md" overflow="hidden">
                  <Box w="100%" h="100%" transition="all 0.3s ease"
                    bg={i < stepIndex ? 'green.400' : i === stepIndex ? 'odrive.400' : 'gray.600'} />
                </Box>
                <Text fontSize="2xs" textAlign="center" fontWeight={i === stepIndex ? 'bold' : 'normal'}
                  color={i < stepIndex ? 'green.300' : i === stepIndex ? 'odrive.300' : 'gray.500'}>
                  {s.label}
                </Text>
              </VStack>
            ))}
          </HStack>

          {/* Navigation */}
          <HStack justify="center" align="center" w="100%" spacing={6}>
            <Button onClick={() => setStepIndex((i) => Math.max(0, i - 1))} isDisabled={stepIndex === 0} variant="outline" colorScheme="gray" size="sm" minW="80px">
              Previous
            </Button>
            <Text fontSize="lg" color="white" fontWeight="bold">Step {stepIndex + 1}: {step.label}</Text>
            <Button onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))} isDisabled={stepIndex === STEPS.length - 1} variant="outline" colorScheme="gray" size="sm" minW="80px">
              Next
            </Button>
          </HStack>

          {/* Action buttons (hidden on the Apply step, which has its own apply button) */}
          {!isApplyStep && (
            <HStack spacing={3} justify="center" flexWrap="wrap">
              <Button colorScheme="red" variant="outline" size="md" onClick={onEraseOpen} isDisabled={!wizard.isConnected} leftIcon={<Trash2 size={16} />}>
                Erase Config
              </Button>
              <Button colorScheme="green" variant="outline" size="md" onClick={wizard.pullConfig} isDisabled={!wizard.isConnected} isLoading={wizard.loading} loadingText="Pulling…" leftIcon={!wizard.loading ? <DownloadCloud size={16} /> : undefined}>
                Pull Current Config
              </Button>
              <Button colorScheme="blue" variant="outline" size="md" onClick={() => setStepIndex(STEPS.length - 1)} isDisabled={!wizard.isConnected} leftIcon={<ClipboardList size={16} />}>
                Review in Apply
              </Button>
              <Button colorScheme="blue" size="md" onClick={handleApplySave} isDisabled={!wizard.isConnected || wizard.changes.length === 0} isLoading={applying} loadingText="Applying…" leftIcon={<Save size={16} />}>
                Apply &amp; Save
                {wizard.changes.length > 0 && <Badge ml={2} colorScheme="teal">{wizard.changes.length}</Badge>}
              </Button>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Step content */}
      <Box flex="1" minH="0" overflowY="auto" overflowX="hidden" p={4}>
        {renderStep()}
      </Box>

      <EraseConfigModal isOpen={isEraseOpen} onClose={onEraseClose} />
    </Flex>
  )
}

export default ConfigurationTab