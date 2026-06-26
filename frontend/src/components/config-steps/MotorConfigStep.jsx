import { useMemo } from 'react'
import {
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react'
import ConfigStep from './ConfigStep'
import ParameterInput from '../config-parameter-fields/ParameterInput'
import {
  torqueConstantToKv,
  kvToTorqueConstant,
  torqueConstant as ktFromKv,
  maxTorque,
} from '../../utils/helpers/unitConversions'
import { resolvePath } from '../../utils/configSchema'
import { expandAxisPath } from '../../utils/odriveRegistry'

const MotorConfigStep = ({ wizard }) => {
  const tcPath = expandAxisPath(resolvePath('axis{n}.motor.config.torque_constant', wizard.fwLine), wizard.selectedAxis)
  const currentLimPath = expandAxisPath(resolvePath('axis{n}.motor.config.current_lim', wizard.fwLine), wizard.selectedAxis)

  const torqueConstant = wizard.valueOf(tcPath)
  const currentLim = wizard.valueOf(currentLimPath)
  const kv = useMemo(() => torqueConstantToKv(torqueConstant), [torqueConstant])

  const kt = ktFromKv(kv)
  const tMax = maxTorque(kv, currentLim)

  const kvCard = (
    <Card bg="gray.800" variant="outline" borderColor="gray.700" mb={4}>
      <CardBody>
        <Heading size="sm" color="odrive.300" mb={3}>Motor Kv</Heading>
        <HStack justify="space-between">
          <Text fontSize="sm">Motor Kv (RPM/V)</Text>
          <ParameterInput
            value={kv > 0 ? kv : undefined}
            decimals={1}
            step={10}
            unit="RPM/V"
            onChange={(newKv) => wizard.setValueByPath(tcPath, kvToTorqueConstant(newKv))}
          />
        </HStack>
        <Text fontSize="xs" color="gray.500" mt={1}>
          Sets torque constant: Kt = 8.27 / Kv. Find Kv on your motor&apos;s datasheet.
        </Text>
      </CardBody>
    </Card>
  )

  const calculatedCard = (
    <Card bg="gray.800" variant="outline" borderColor="green.800" mt={4}>
      <CardBody>
        <Heading size="sm" color="green.300" mb={3}>Calculated Values</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat>
            <StatLabel color="gray.400" fontSize="xs">Torque Constant (Kt)</StatLabel>
            <StatNumber color="green.300" fontSize="lg">{kt > 0 ? kt.toFixed(4) : '—'}</StatNumber>
            <StatHelpText mb={0}>Nm/A</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color="gray.400" fontSize="xs">Max Torque</StatLabel>
            <StatNumber color="green.300" fontSize="lg">{tMax > 0 ? tMax.toFixed(3) : '—'}</StatNumber>
            <StatHelpText mb={0}>Nm (at current limit)</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color="gray.400" fontSize="xs">Motor Kv</StatLabel>
            <StatNumber color="green.300" fontSize="lg">
              {kv > 0 ? Math.round(kv) : '—'} <Badge colorScheme="green">RPM/V</Badge>
            </StatNumber>
          </Stat>
        </SimpleGrid>
      </CardBody>
    </Card>
  )

  return <ConfigStep stepId="motor" wizard={wizard} extraTop={kvCard} extraBottom={calculatedCard} />
}

export default MotorConfigStep
