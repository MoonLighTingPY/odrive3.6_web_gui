import { HStack, Button, useToast, VStack, useDisclosure } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import CalibrationModal from '../components/modals/CalibrationModal'
import { useCalibration } from './useCalibration'

// Custom hook for shared command functionality
const useODriveCommand = () => {
  const toast = useToast()
  
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
      } else if (command.includes('reboot')) {
        description = 'ODrive rebooting...'
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
  
  return { sendCommand }
}

// Base button component for calibration buttons - REMOVED MODAL
const CalibrationButtonBase = ({ 
  axisNumber = 0, 
  size = "sm", 
  colorScheme, 
  calibrationType, 
  children, 
  title 
}) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
  const handleCalibration = () => {
    // Direct command execution without modal
    const commands = {
      'motor': `odrv0.axis${axisNumber}.requested_state = 4`,
      'encoder_polarity': `odrv0.axis${axisNumber}.requested_state = 10`, 
      'encoder_offset': `odrv0.axis${axisNumber}.requested_state = 7`,
      'encoder_index_search': `odrv0.axis${axisNumber}.requested_state = 6`
    }
    
    const command = commands[calibrationType]
    if (command) {
      sendCommand(command)
    }
  }
  
  const isMotorIdle = axisState === 1
  const hasErrors = axisError !== 0
  const isStatusUnknown = axisState === 0 // AXIS_STATE_UNDEFINED
  
  return (
    <Button
      size={size}
      colorScheme={colorScheme}
      onClick={handleCalibration}
      isDisabled={!isConnected || !isMotorIdle || hasErrors || isStatusUnknown}
      title={
        isStatusUnknown ? "Unknown axis status - check connection" :
        hasErrors ? "Clear errors before calibration" : 
        title
      }
    >
      {children}
    </Button>
  )
}

// Full Calibration button - KEEPS MODAL
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
  
  const handleCalibration = () => {
    startCalibration('full')
    onOpen()
  }
  
  const isMotorIdle = axisState === 1
  const hasErrors = axisError !== 0
  const isStatusUnknown = axisState === 0 // AXIS_STATE_UNDEFINED
  
  return (
    <>
      <Button
        size={size}
        colorScheme="orange"
        onClick={handleCalibration}
        isDisabled={!isConnected || !isMotorIdle || hasErrors || isStatusUnknown}
        title={
          isStatusUnknown ? "Unknown axis status - check connection" :
          hasErrors ? "Clear errors before calibration" : 
          "Start full calibration sequence (motor + encoder)"
        }
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

export const EnableMotorButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
  const handleEnableMotor = () => {
    sendCommand(`odrv0.axis${axisNumber}.requested_state = 8`)
  }
  
  const isMotorEnabled = axisState === 8
  const hasErrors = axisError !== 0
  const isAxisCalibrating = axisState >= 2 && axisState <= 7
  const isStatusUnknown = axisState === 0 // AXIS_STATE_UNDEFINED
  
  return (
    <Button
      size={size}
      colorScheme="green"
      onClick={handleEnableMotor}
      isDisabled={!isConnected || isMotorEnabled || hasErrors || isAxisCalibrating || isStatusUnknown}
      title={
        isStatusUnknown ? "Unknown axis status - check connection" :
        hasErrors ? "Clear errors before enabling motor" : 
        isAxisCalibrating ? "Wait for calibration to complete" : 
        "Enable motor (closed loop control)"
      }
    >
      Enable Motor
    </Button>
  )
}

export const DisableMotorButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  
  const handleDisableMotor = () => {
    sendCommand(`odrv0.axis${axisNumber}.requested_state = 1`)
  }
  
  const isMotorIdle = axisState === 1
  const isStatusUnknown = axisState === 0 // AXIS_STATE_UNDEFINED
  
  return (
    <Button
      size={size}
      colorScheme="red"
      onClick={handleDisableMotor}
      isDisabled={!isConnected || isMotorIdle || isStatusUnknown}
      title={
        isStatusUnknown ? "Unknown axis status - check connection" :
        "Disable motor (idle state)"
      }
    >
      Disable Motor
    </Button>
  )
}

export const ClearErrorsButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
  const handleClearErrors = () => {
    sendCommand('odrv0.clear_errors()')
  }
  
  const hasErrors = axisError !== 0
  const isStatusUnknown = axisState === 0 // AXIS_STATE_UNDEFINED
  
  return (
    <Button
      size={size}
      colorScheme="blue"
      onClick={handleClearErrors}
      isDisabled={!isConnected || (!hasErrors && !isStatusUnknown) || isStatusUnknown}
      title={
        isStatusUnknown ? "Unknown axis status - check connection" :
        "Clear all ODrive errors"
      }
    >
      Clear Errors
    </Button>
  )
}

