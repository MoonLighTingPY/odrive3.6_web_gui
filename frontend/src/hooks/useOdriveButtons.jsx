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

// Base button component for calibration buttons
const CalibrationButtonBase = ({ 
  axisNumber = 0, 
  size = "sm", 
  colorScheme, 
  calibrationType, 
  children, 
  title 
}) => {
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
    startCalibration(calibrationType)
    onOpen()
  }
  
  const isMotorIdle = axisState === 1
  const hasErrors = axisError !== 0
  
  return (
    <>
      <Button
        size={size}
        colorScheme={colorScheme}
        onClick={handleCalibration}
        isDisabled={!isConnected || !isMotorIdle || hasErrors}
        title={hasErrors ? "Clear errors before calibration" : title}
      >
        {children}
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

// Individual button components
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
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()
  
  const axisState = odriveState.device?.[`axis${axisNumber}`]?.current_state || 0
  
  const handleDisableMotor = () => {
    sendCommand(`odrv0.axis${axisNumber}.requested_state = 1`)
  }
  
  const isMotorIdle = axisState === 1
  
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

export const ClearErrorsButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()
  
  const axisError = odriveState.device?.[`axis${axisNumber}`]?.error || 0
  
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

// Calibration buttons using the base component
export const CalibrationButton = ({ axisNumber = 0, size = "sm" }) => (
  <CalibrationButtonBase
    axisNumber={axisNumber}
    size={size}
    colorScheme="orange"
    calibrationType="full"
    title="Start full calibration sequence (motor + encoder)"
  >
    Full Calibration
  </CalibrationButtonBase>
)

export const MotorCalibrationButton = ({ axisNumber = 0, size = "sm" }) => (
  <CalibrationButtonBase
    axisNumber={axisNumber}
    size={size}
    colorScheme="orange"
    calibrationType="motor"
    title="Start motor calibration only"
  >
    Motor Calibration
  </CalibrationButtonBase>
)

export const EncoderHallCalibrationButton = ({ axisNumber = 0, size = "sm" }) => (
  <CalibrationButtonBase
    axisNumber={axisNumber}
    size={size}
    colorScheme="orange"
    calibrationType="encoder_polarity"
    title="Start encoder hall polarity calibration (required before offset calibration for hall encoders)"
  >
    Hall Polarity
  </CalibrationButtonBase>
)

export const EncoderOffsetCalibrationButton = ({ axisNumber = 0, size = "sm" }) => (
  <CalibrationButtonBase
    axisNumber={axisNumber}
    size={size}
    colorScheme="orange"
    calibrationType="encoder_offset"
    title="Start encoder offset calibration"
  >
    Encoder Offset
  </CalibrationButtonBase>
)

export const EncoderIndexSearchButton = ({ axisNumber = 0, size = "sm" }) => (
  <CalibrationButtonBase
    axisNumber={axisNumber}
    size={size}
    colorScheme="purple"
    calibrationType="encoder_index_search"
    title="Start encoder index search"
  >
    Index Search
  </CalibrationButtonBase>
)

export const RebootButton = ({ size = "sm" }) => {
  const { isConnected } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()
  
  const handleReboot = () => {
    if (window.confirm('Are you sure you want to reboot the ODrive? This will disconnect the device.')) {
      sendCommand('odrv0.reboot()')
    }
  }
  
  return (
    <Button
      size={size}
      colorScheme="red"
      variant="outline"
      onClick={handleReboot}
      isDisabled={!isConnected}
      title="Reboot ODrive device"
    >
      Reboot
    </Button>
  )
}

// Main component with all buttons
const MotorControls = ({ axisNumber = 0, size = "sm", orientation = "horizontal", variant = "basic" }) => {
  const ContainerComponent = orientation === "horizontal" ? HStack : VStack
  
  if (variant === "full") {
    return (
      <VStack spacing={2}>
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

        
        {/* System Controls */}
          <RebootButton size={size} />
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

export default MotorControls