import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedAxis } from '../store/slices/uiSlice'
import {
  ButtonGroup,
  Button,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react'

const AxisSelector = ({ size = "sm", showLabel = true, variant = "outline" }) => {
  const dispatch = useDispatch()
  const selectedAxis = useSelector(state => state.ui.selectedAxis)
  const { isConnected, odriveState } = useSelector(state => state.device)
  
  // For ODrive 3.6, we have axis0 and axis1 available
  // Later we can make this dynamic based on device detection
  const availableAxes = [0, 1]

  const handleAxisSelect = (axisNumber) => {
    dispatch(setSelectedAxis(axisNumber))
  }

  // Don't show if not connected
  if (!isConnected) {
    return null
  }

  return (
    <HStack spacing={2}>
      {showLabel && <Text fontSize="sm" color="gray.300">Axis:</Text>}
      <ButtonGroup size={size} isAttached variant={variant}>
        {availableAxes.map(axisNum => (
          <Button
            key={axisNum}
            colorScheme={selectedAxis === axisNum ? "blue" : "gray"}
            variant={selectedAxis === axisNum ? "solid" : variant}
            onClick={() => handleAxisSelect(axisNum)}
            minW="40px"
          >
            {axisNum}
          </Button>
        ))}
      </ButtonGroup>
      <Badge colorScheme="blue" size="sm">
        Active: {selectedAxis}
      </Badge>
    </HStack>
  )
}

export default AxisSelector