import { useDispatch, useSelector } from 'react-redux'
import { ButtonGroup, Button, Text, HStack } from '@chakra-ui/react'
import { setSelectedAxis } from '../store/slices/uiSlice'

/**
 * Segmented axis selector (0 / 1). Hidden when no device is connected.
 */
const AxisSelector = ({ size = 'sm', showLabel = true, variant = 'outline' }) => {
  const dispatch = useDispatch()
  const selectedAxis = useSelector((s) => s.ui.selectedAxis)
  const { isConnected } = useSelector((s) => s.device)

  if (!isConnected) return null

  return (
    <HStack spacing={2}>
      {showLabel && <Text fontSize="sm" color="gray.300">Axis:</Text>}
      <ButtonGroup size={size} isAttached variant={variant}>
        {[0, 1].map((axisNum) => (
          <Button
            key={axisNum}
            colorScheme={selectedAxis === axisNum ? 'blue' : 'gray'}
            variant={selectedAxis === axisNum ? 'solid' : variant}
            onClick={() => dispatch(setSelectedAxis(axisNum))}
            minW="40px"
          >
            {axisNum}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}

export default AxisSelector
