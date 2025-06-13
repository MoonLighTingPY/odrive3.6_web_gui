import { HStack, Button, useToast, VStack, useDisclosure } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import CalibrationModal from './modals/CalibrationModal'
import { useCalibration } from '../hooks/useCalibration'

const MotorControls = ({ axisNumber = 0, size = "sm", orientation = "horizontal" }) => {
  const toast = useToast()
  const { isConnected, odriveState } = useSelector(state => state.device)
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
  // Calibration modal disclosure
  const { isOpen: isCalibrationOpen, onOpen: onCalibrationOpen, onClose: onCalibrationClose } = useDisclosure()
  
  // Add calibration hook
  const {
    calibrationStatus,
    calibrationProgress,
    isCalibrating,
    calibrationPhase,
    calibrationSequence,
    startCalibration,
    getCalibrationPhaseDescription
  } = useCalibration()

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
  
  const handleDisableMotor = () => {
    sendCommand(`odrv0.axis${axisNumber}.requested_state = 1`)
  }
  
  const handleFullCalibration = () => {
    startCalibration('full')
    onCalibrationOpen()
  }
  
  const handleClearErrors = () => {
    sendCommand('odrv0.clear_errors()')
  }
  
  const isMotorEnabled = axisState === 8 // CLOSED_LOOP_CONTROL
  const isMotorIdle = axisState === 1 // IDLE
  const hasErrors = axisError !== 0
  const isAxisCalibrating = axisState >= 2 && axisState <= 7 // Calibration states
  
  const ContainerComponent = orientation === "horizontal" ? HStack : VStack
  
  return (
    <>
      <ContainerComponent spacing={2}>
        <Button
          size={size}
          colorScheme="green"
          onClick={handleEnableMotor}
          isDisabled={!isConnected || isMotorEnabled || hasErrors || isAxisCalibrating}
          title={hasErrors ? "Clear errors before enabling motor" : isAxisCalibrating ? "Wait for calibration to complete" : "Enable motor (closed loop control)"}
        >
          Enable Motor
        </Button>
        <Button
          size={size}
          colorScheme="red"
          onClick={handleDisableMotor}
          isDisabled={!isConnected || isMotorIdle}
          title="Disable motor (idle state)"
        >
          Disable Motor
        </Button>
        <Button
          size={size}
          colorScheme="orange"
          onClick={handleFullCalibration}
          isDisabled={!isConnected || !isMotorIdle || hasErrors}
          title={hasErrors ? "Clear errors before calibration" : "Start full calibration sequence (motor + encoder)"}
        >
          Full Calibration
        </Button>
        <Button
          size={size}
          colorScheme="blue"
          onClick={handleClearErrors}
          isDisabled={!isConnected || !hasErrors}
          title="Clear all ODrive errors"
        >
          Clear Errors
        </Button>
      </ContainerComponent>
      
      {/* Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={onCalibrationClose}
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

export default MotorControls