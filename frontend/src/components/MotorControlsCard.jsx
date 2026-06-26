import { Card, CardBody, Heading, HStack, Badge, Text } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { getAxisStateName } from '../utils/configEnums'
import { describeErrors } from '../utils/odriveErrors'
import { LIVE_INITIAL_STATE } from '../store/slices/liveSlice'
import MotorControls from './MotorControls'
import AxisSelector from './AxisSelector'

/**
 * Motor-controls card backed by the shared `live` status slice (populated by the
 * global poller), so it adds no extra polling of its own.
 *
 * When `isActive` is false (the parent tab is hidden) we subscribe to a frozen
 * constant instead of the live slice, so the ~6 Hz status updates don't re-render
 * this card while it isn't visible.
 */
const MotorControlsCard = ({ isActive = true }) => {
  const ax = useSelector((s) => s.ui.selectedAxis)
  const live = useSelector((s) => (isActive ? s.live : LIVE_INITIAL_STATE))

  const state = live.axis_state
  const hasErrors =
    describeErrors('axis', live.axis_error).length > 0 ||
    describeErrors('motor', live.motor_error).length > 0 ||
    describeErrors('encoder', live.encoder_error).length > 0

  const stateColor = state === 8 ? 'green' : state === 1 ? 'blue' : state >= 2 && state <= 7 ? 'yellow' : 'gray'

  return (
    <Card bg="gray.800" variant="outline" borderColor="gray.700">
      <CardBody>
        <HStack justify="space-between" mb={3}>
          <HStack spacing={3}>
            <Heading size="sm" color="odrive.300">Motor Controls · Axis {ax}</Heading>
            <AxisSelector showLabel={false} size="xs" />
          </HStack>
          <Badge colorScheme={stateColor}>{getAxisStateName(state)}</Badge>
        </HStack>
        <MotorControls currentState={typeof state === 'number' ? state : null} hasErrors={hasErrors} columns={{ base: 2, md: 3 }} variant="full" />
        {hasErrors && <Text fontSize="xs" color="red.300" mt={2}>Active errors — clear before enabling or calibrating.</Text>}
      </CardBody>
    </Card>
  )
}

export default MotorControlsCard
