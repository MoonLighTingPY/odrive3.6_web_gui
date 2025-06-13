import { HStack, Button, useToast, VStack, useDisclosure } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import CalibrationModal from './modals/CalibrationModal'
import { useCalibration } from '../hooks/useCalibration'

// Individual button components for reuse
export const EnableMotorButton = ({ axisNumber = 0, size = "sm" }) => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
  const sendCommand = async (command) => {
    try {
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Command failed')
      }
      
      const result = await response.json()
      let description = 'Command executed successfully'
      
      if (command.includes('requested_state = 8')) {
        description = 'Motor enabled (closed loop control)'
      } else if (command.includes('requested_state = 1')) {
        description = 'Motor disabled (idle state)'
      } else if (command.includes('clear_errors')) {
        description = 'Errors cleared'
      }
      
      toast({
        title: 'Command sent',
        description: description,
        status: 'success',
        duration: 2000,
      })
      
      return result
    } catch (error) {
      toast({
        title: 'Command failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
      throw error
    }
  }
  
  const handleEnableMotor = () => {
    sendCommand(`odrv0.axis${axisNumber}.requested_state = 8`)
  }
  
  const isMotorEnabled = axisState === 8 // CLOSED_LOOP_CONTROL
  const hasErrors = axisError !== 0
  const isAxisCalibrating = axisState >= 2 && axisState <= 7 // Calibration states
  
  return (
    <Button
      size={size}
      colorScheme="green"
      onClick={handleEnableMotor}
      isDisabled={!isConnected || isMotorEnabled || hasErrors || isAxisCalibrating}
      title={hasErrors ? "Clear errors before enabling motor" : isAxisCalibrating ? "Wait for calibration to complete" : "Enable motor (closed loop control)"}
    >
      Enable Motor
    </Button>
  )
}

export const DisableMotorButton = ({ axisNumber = 0, size = "sm" }) => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  
  const sendCommand = async (command) => {
    try {
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Command failed')
      }
      
      const result = await response.json()
      let description = 'Command executed successfully'
      
      if (command.includes('requested_state = 8')) {
        description = 'Motor enabled (closed loop control)'
      } else if (command.includes('requested_state = 1')) {
        description = 'Motor disabled (idle state)'
      } else if (command.includes('clear_errors')) {
        description = 'Errors cleared'
      }
      
      toast({
        title: 'Command sent',
        description: description,
        status: 'success',
        duration: 2000,
      })
      
      return result
    } catch (error) {
      toast({
        title: 'Command failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
      throw error
    }
  }
  
  const handleDisableMotor = () => {
    sendCommand(`odrv0.axis${axisNumber}.requested_state = 1`)
  }
  
  const isMotorIdle = axisState === 1 // IDLE
  
  return (
    <Button
      size={size}
      colorScheme="red"
      onClick={handleDisableMotor}
      isDisabled={!isConnected || isMotorIdle}
      title="Disable motor (idle state)"
    >
      Disable Motor
    </Button>
  )
}

export const CalibrationButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
  const {
    calibrationStatus,
    calibrationProgress,
    isCalibrating,
    calibrationPhase,
    calibrationSequence,
    startCalibration,
    getCalibrationPhaseDescription
  } = useCalibration()
  
  const handleFullCalibration = () => {
    startCalibration('full')
    onOpen()
  }
  
  const isMotorIdle = axisState === 1 // IDLE
  const hasErrors = axisError !== 0
  
  return (
    <>
      <Button
        size={size}
        colorScheme="orange"
        onClick={handleFullCalibration}
        isDisabled={!isConnected || !isMotorIdle || hasErrors}
        title={hasErrors ? "Clear errors before calibration" : "Start full calibration sequence (motor + encoder)"}
      >
        Full Calibration
      </Button>
      
      <CalibrationModal
        isOpen={isOpen}
        onClose={onClose}
        isCalibrating={isCalibrating}
        calibrationProgress={calibrationProgress}
        calibrationPhase={calibrationPhase}
        calibrationSequence={calibrationSequence}
        calibrationStatus={calibrationStatus}
        getCalibrationPhaseDescription={getCalibrationPhaseDescription}
      />
    </>
  )
}

export const ClearErrorsButton = ({ axisNumber = 0, size = "sm" }) => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
  const sendCommand = async (command) => {
    try {
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Command failed')
      }
      
      const result = await response.json()
      let description = 'Command executed successfully'
      
      if (command.includes('requested_state = 8')) {
        description = 'Motor enabled (closed loop control)'
      } else if (command.includes('requested_state = 1')) {
        description = 'Motor disabled (idle state)'
      } else if (command.includes('clear_errors')) {
        description = 'Errors cleared'
      }
      
      toast({
        title: 'Command sent',
        description: description,
        status: 'success',
        duration: 2000,
      })
      
      return result
    } catch (error) {
      toast({
        title: 'Command failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
      throw error
    }
  }
  
  const handleClearErrors = () => {
    sendCommand('odrv0.clear_errors()')
  }
  
  const hasErrors = axisError !== 0
  
  return (
    <Button
      size={size}
      colorScheme="blue"
      onClick={handleClearErrors}
      isDisabled={!isConnected || !hasErrors}
      title="Clear all ODrive errors"
    >
      Clear Errors
    </Button>
  )
}

const MotorControls = ({ axisNumber = 0, size = "sm", orientation = "horizontal" }) => {
  const ContainerComponent = orientation === "horizontal" ? HStack : VStack
  
  return (
    <ContainerComponent spacing={2}>
      <EnableMotorButton axisNumber={axisNumber} size={size} />
      <DisableMotorButton axisNumber={axisNumber} size={size} />
      <CalibrationButton axisNumber={axisNumber} size={size} />
      <ClearErrorsButton axisNumber={axisNumber} size={size} />
    </ContainerComponent>
  )
}

export default MotorControls