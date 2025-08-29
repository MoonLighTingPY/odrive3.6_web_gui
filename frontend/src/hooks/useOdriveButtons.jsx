import { HStack, Button, useToast, VStack, useDisclosure } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import CalibrationModal from '../components/modals/CalibrationModal'
import { useCalibration } from './useCalibration'
import { saveAndRebootWithReconnect } from '../utils/configurationActions'
import { useAxisStateGuard } from './useAxisStateGuard'
import { generateCommand, getPathResolver } from '../utils/odrivePathResolver'

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

// Helper hook to get current error codes from both telemetry and device state
const useAxisErrors = (axisNumber = 0) => {
  const telemetry = useSelector(state => state.telemetry)
  const { odriveState } = useSelector(state => state.device)

  const axisData = odriveState.device?.[`axis${axisNumber}`]

  return {
    axis_error: telemetry?.axis_error || axisData?.error || 0,
    motor_error: telemetry?.motor_error || axisData?.motor?.error || 0,
    encoder_error: telemetry?.encoder_error || axisData?.encoder?.error || 0,
    controller_error: telemetry?.controller_error || axisData?.controller?.error || 0,
    sensorless_error: telemetry?.sensorless_error || axisData?.sensorless_estimator?.error || 0,
  }
}

// Base button component for calibration buttons - UPDATED WITH ERROR DETECTION
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

  // Use telemetry slice for real-time axis state updates
  const telemetry = useSelector(state => state.telemetry)

  // Get current errors from both sources
  const currentErrors = useAxisErrors(axisNumber)

  // Get axis state from telemetry first (real-time), fallback to odriveState
  const axisState = telemetry?.axis_state ?? odriveState.device?.[`axis${axisNumber}`]?.current_state ?? 0

  const handleCalibration = () => {
    // Use dynamic command generation instead of hardcoded commands
    const stateCommands = {
      'motor': 4, // AXIS_STATE_MOTOR_CALIBRATION
      'encoder_polarity': 10, // AXIS_STATE_ENCODER_DIR_FIND
      'encoder_offset': 7, // AXIS_STATE_ENCODER_OFFSET_CALIBRATION
      'encoder_index_search': 6 // AXIS_STATE_ENCODER_INDEX_SEARCH
    }

    const state = stateCommands[calibrationType]
    if (state) {
      const command = generateCommand('requested_state', state, axisNumber)
      sendCommand(command)
    }
  }

  const isMotorIdle = axisState === 1
  const hasAnyErrors = Object.values(currentErrors).some(error => error !== 0)
  const isAxisCalibrating = axisState >= 2 && axisState <= 7 // Calibration states (2-7)

  // FIXED: Don't disable for UNDEFINED state if connected
  const isButtonDisabled = !isConnected || hasAnyErrors || isAxisCalibrating || (!isMotorIdle && axisState !== 0)

  const getButtonTitle = () => {
    if (!isConnected) return "Not connected to ODrive"
    if (hasAnyErrors) return "Clear errors before calibration"
    if (isAxisCalibrating) return "Wait for calibration to complete"
    if (axisState === 0) return "Waiting for axis to initialize - button will enable when ready"
    if (!isMotorIdle) return "Motor must be in idle state for calibration"
    return title
  }

  return (
    <Button
      size={size}
      colorScheme={colorScheme}
      onClick={handleCalibration}
      isDisabled={isButtonDisabled}
      title={getButtonTitle()}
    >
      {children}
    </Button>
  )
}

export const CalibrationButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Use telemetry slice for real-time axis state updates
  const telemetry = useSelector(state => state.telemetry)

  // Get current errors from both sources
  const currentErrors = useAxisErrors(axisNumber)

  // Get axis state from telemetry first (real-time), fallback to odriveState
  const axisState = telemetry?.axis_state ?? odriveState.device?.[`axis${axisNumber}`]?.current_state ?? 0

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
  const hasAnyErrors = Object.values(currentErrors).some(error => error !== 0)
  const isAxisCalibrating = axisState >= 2 && axisState <= 7 // Calibration states (2-7)

  // FIXED: More lenient status checking
  const isButtonDisabled = !isConnected || hasAnyErrors || isAxisCalibrating || (!isMotorIdle && axisState !== 0)

  const getButtonTitle = () => {
    if (!isConnected) return "Not connected to ODrive"
    if (hasAnyErrors) return "Clear errors before calibration"
    if (isAxisCalibrating) return "Wait for calibration to complete"
    if (axisState === 0) return "Waiting for axis to initialize - button will enable when ready"
    if (!isMotorIdle) return "Motor must be in idle state for calibration"
    return "Start full calibration sequence (motor + encoder)"
  }

  return (
    <>
      <Button
        size={size}
        colorScheme="orange"
        onClick={handleCalibration}
        isDisabled={isButtonDisabled}
        title={getButtonTitle()}
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

  // Use telemetry slice for real-time axis state updates
  const telemetry = useSelector(state => state.telemetry)

  // Get current errors from both sources
  const currentErrors = useAxisErrors(axisNumber)

  // Get axis state from telemetry first (real-time), fallback to odriveState
  const axisState = telemetry?.axis_state ?? odriveState.device?.[`axis${axisNumber}`]?.current_state ?? 0

  const handleEnableMotor = () => {
    const command = generateCommand('requested_state', 8, axisNumber) // AXIS_STATE_CLOSED_LOOP_CONTROL
    sendCommand(command)
  }

  // State checking logic
  const isMotorEnabled = axisState === 8 // CLOSED_LOOP_CONTROL
  const hasAnyErrors = Object.values(currentErrors).some(error => error !== 0)
  const isAxisCalibrating = axisState >= 2 && axisState <= 7 // Calibration states (2-7)

  // FIXED: Allow UNDEFINED state if connected - don't treat as unknown
  const isButtonDisabled = !isConnected || isMotorEnabled || hasAnyErrors || isAxisCalibrating

  const getButtonTitle = () => {
    if (!isConnected) return "Not connected to ODrive"
    if (hasAnyErrors) return "Clear errors before enabling motor"
    if (isAxisCalibrating) return "Wait for calibration to complete"
    if (isMotorEnabled) return "Motor already enabled (in closed loop control)"
    if (axisState === 0) return "Waiting for axis to initialize - button will enable when ready"
    return "Enable motor (closed loop control)"
  }

  return (
    <Button
      size={size}
      colorScheme="green"
      onClick={handleEnableMotor}
      isDisabled={isButtonDisabled}
      title={getButtonTitle()}
    >
      Enable Motor
    </Button>
  )
}

export const DisableMotorButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected, odriveState } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()

  // Use telemetry slice for real-time axis state updates
  const telemetry = useSelector(state => state.telemetry)

  // Get axis state from telemetry first (real-time), fallback to odriveState
  const axisState = telemetry?.axis_state ?? odriveState.device?.[`axis${axisNumber}`]?.current_state ?? 0

  const handleDisableMotor = () => {
    const command = generateCommand('requested_state', 1, axisNumber) // AXIS_STATE_IDLE
    sendCommand(command)
  }

  // State checking logic
  const isMotorIdle = axisState === 1 // IDLE
  const isAxisCalibrating = axisState >= 2 && axisState <= 7 // Calibration states (2-7)

  // FIXED: Allow UNDEFINED state if connected
  const isButtonDisabled = !isConnected || isMotorIdle || isAxisCalibrating

  const getButtonTitle = () => {
    if (!isConnected) return "Not connected to ODrive"
    if (isAxisCalibrating) return "Wait for calibration to complete"
    if (isMotorIdle) return "Motor already disabled (idle state)"
    if (axisState === 0) return "Waiting for axis to initialize - button will enable when ready"
    return "Disable motor (idle state)"
  }

  return (
    <Button
      size={size}
      colorScheme="red"
      onClick={handleDisableMotor}
      isDisabled={isButtonDisabled}
      title={getButtonTitle()}
    >
      Disable Motor
    </Button>
  )
}

export const ClearErrorsButton = ({ axisNumber = 0, size = "sm" }) => {
  const { isConnected } = useSelector(state => state.device)
  const { sendCommand } = useODriveCommand()

  // Get current errors from both sources
  const currentErrors = useAxisErrors(axisNumber)

  const handleClearErrors = () => {
    const pathResolver = getPathResolver()
    const command = `${pathResolver.config.deviceName}.clear_errors()`
    sendCommand(command)
  }

  const hasAnyErrors = Object.values(currentErrors).some(error => error !== 0)

  return (
    <Button
      size={size}
      colorScheme="orange"
      variant={hasAnyErrors ? "solid" : "outline"}
      onClick={handleClearErrors}
      isDisabled={!isConnected || !hasAnyErrors}
      title={hasAnyErrors ? "Clear all axis errors" : "No errors to clear"}
    >
      Clear Errors
    </Button>
  )
}

// Individual calibration buttons - NO MODALS
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
    title="Start encoder hall polarity calibration"
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

export const SaveAndRebootButton = ({ size = "sm", gridColumn, ...props }) => {
  const { isConnected, connectedDevice } = useSelector(state => state.device)
  const dispatch = useDispatch()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { executeWithAxisCheck } = useAxisStateGuard()

  const handleSaveAndReboot = async () => {
    if (!isConnected) return

    setIsLoading(true)
    try {
      await saveAndRebootWithReconnect(toast, dispatch, connectedDevice)
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      // saveAndRebootWithReconnect already handles toasts
    } finally {
      setIsLoading(false)
    }
  }

  const { execute, AxisGuardModal } = executeWithAxisCheck(
    handleSaveAndReboot,
    "save and reboot the ODrive",
    "Save & Reboot"
  )

  return (
    <>
      <Button
        size={size}
        colorScheme="blue"
        onClick={execute}
        isDisabled={!isConnected}
        isLoading={isLoading}
        loadingText="Saving..."
        title={isConnected ? "Save configuration and reboot ODrive" : "Not connected to ODrive"}
        gridColumn={gridColumn}
        {...props}
      >
        Save & Reboot
      </Button>
      <AxisGuardModal />
    </>
  )
}