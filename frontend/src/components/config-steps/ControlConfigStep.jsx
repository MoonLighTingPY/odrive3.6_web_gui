import { Button, Card, CardBody, HStack, Heading, Text, VStack, Tooltip } from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'
import ConfigStep from './ConfigStep'
import { calculateGains, torqueConstantToKv } from '../../utils/helpers/unitConversions'
import { resolvePath } from '../../utils/configSchema'
import { expandAxisPath } from '../../utils/odriveRegistry'

const ControlConfigStep = ({ wizard }) => {
  const p = (template) => expandAxisPath(resolvePath(template, wizard.fwLine), wizard.selectedAxis)

  const tcPath = p('axis{n}.motor.config.torque_constant')
  const cprPath = p('axis{n}.encoder.config.cpr')
  const posGainPath = p('axis{n}.controller.config.pos_gain')
  const velGainPath = p('axis{n}.controller.config.vel_gain')
  const velIntPath = p('axis{n}.controller.config.vel_integrator_gain')

  const motorKv = torqueConstantToKv(wizard.valueOf(tcPath))
  const cpr = wizard.valueOf(cprPath)

  const suggested = calculateGains({ motorKv, cpr })
  const canCalc = suggested.velGain > 0

  const applyCalculated = () => {
    wizard.setValueByPath(posGainPath, round(suggested.posGain, 4))
    wizard.setValueByPath(velGainPath, round(suggested.velGain, 6))
    wizard.setValueByPath(velIntPath, round(suggested.velIntegratorGain, 6))
  }

  const gainsHelper = (
    <Card bg="gray.800" variant="outline" borderColor="gray.700" mb={4}>
      <CardBody>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={0}>
            <Heading size="sm" color="odrive.300">Suggested Gains</Heading>
            <Text fontSize="xs" color="gray.500">
              {canCalc
                ? `pos ${fmt(suggested.posGain)} · vel ${fmt(suggested.velGain)} · vel_int ${fmt(suggested.velIntegratorGain)}`
                : 'Set motor Kv, current limit and encoder CPR first.'}
            </Text>
          </VStack>
          <Tooltip label="Apply the suggested starting gains">
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<RepeatIcon />}
              onClick={applyCalculated}
              isDisabled={!canCalc}
            >
              Use Calculated
            </Button>
          </Tooltip>
        </HStack>
      </CardBody>
    </Card>
  )

  return <ConfigStep stepId="control" wizard={wizard} extraTop={gainsHelper} />
}

const round = (n, d) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}
const fmt = (n) => (Number.isFinite(n) ? n.toPrecision(3) : '—')

export default ControlConfigStep
