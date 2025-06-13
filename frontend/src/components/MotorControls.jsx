import React from 'react'
import { 
  EnableMotorButton,
  DisableMotorButton,
  ClearErrorsButton,
  CalibrationButton,
  MotorCalibrationButton,
  EncoderHallCalibrationButton,
  EncoderOffsetCalibrationButton,
  EncoderIndexSearchButton,
} from '../hooks/useOdriveButtons.jsx'
import { HStack, VStack } from '@chakra-ui/react'

const MotorControls = ({ axisNumber = 0, size = "sm", orientation = "horizontal", variant = "basic" }) => {
  const ContainerComponent = orientation === "horizontal" ? HStack : VStack
  
  if (variant === "full") {
    return (
      <VStack spacing={3}>
        {/* Basic Controls */}
        <ContainerComponent spacing={2}>
          <EnableMotorButton axisNumber={axisNumber} size={size} />
          <DisableMotorButton axisNumber={axisNumber} size={size} />
          <ClearErrorsButton axisNumber={axisNumber} size={size} />

        {/* Calibration Controls */}
          <CalibrationButton axisNumber={axisNumber} size={size} />
          <MotorCalibrationButton axisNumber={axisNumber} size={size} />

        {/* Encoder Calibration Controls */}
          <EncoderHallCalibrationButton axisNumber={axisNumber} size={size} />
          <EncoderOffsetCalibrationButton axisNumber={axisNumber} size={size} />
          <EncoderIndexSearchButton axisNumber={axisNumber} size={size} />

        </ContainerComponent>
      </VStack>
    )
  }
  
  // Basic variant (default)
  return (
    <ContainerComponent spacing={2}>
      <EnableMotorButton axisNumber={axisNumber} size={size} />
      <DisableMotorButton axisNumber={axisNumber} size={size} />
      <CalibrationButton axisNumber={axisNumber} size={size} />
      <ClearErrorsButton axisNumber={axisNumber} size={size} />
    </ContainerComponent>
  )
}

// Re-export individual buttons for use in other components
export {
  EnableMotorButton,
  DisableMotorButton,
  ClearErrorsButton,
  CalibrationButton,
  MotorCalibrationButton,
  EncoderHallCalibrationButton,
  EncoderOffsetCalibrationButton,
  EncoderIndexSearchButton,
}

export default MotorControls