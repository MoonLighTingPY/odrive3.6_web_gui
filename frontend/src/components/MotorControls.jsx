import { useEffect, useState } from 'react'
import { SimpleGrid, Button, useDisclosure, Tooltip, VStack, Text } from '@chakra-ui/react'
import { useMotorControl, AXIS_STATE } from '../hooks/useMotorControl'
import { useCalibration, CALIBRATION_TYPES } from '../hooks/useCalibration'
import CalibrationModal from './modals/CalibrationModal'

/**
 * A uniform control button: fixed height, bold label + smaller caption beneath.
 * Reserving the caption line on every button keeps all buttons the same height
 * even when a caption is omitted, so grids stay aligned. In `compact` mode the
 * caption is dropped and the button shrinks to a single dense line.
 */
const ActionButton = ({ label, caption, tip, compact = false, ...props }) => {
  const btn = (
    <Button width="100%" h={compact ? '30px' : '48px'} px={2} {...props}>
      {compact ? (
        <Text fontSize="xs">{label}</Text>
      ) : (
        <VStack spacing={0} lineHeight="1.1">
          <Text fontSize="sm">{label}</Text>
          {caption && (
            <Text fontSize="2xs" fontWeight="normal" opacity={0.75}>
              {caption}
            </Text>
          )}
        </VStack>
      )}
    </Button>
  )
  return tip ? <Tooltip label={tip}>{btn}</Tooltip> : btn
}

/** A small uppercase section heading above a group of buttons. */
const SectionLabel = ({ children }) => (
  <Text fontSize="2xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" color="gray.500">
    {children}
  </Text>
)

/**
 * Motor control buttons. `variant="basic"` shows enable/disable/full-calibration/
 * clear; `variant="full"` adds the individual calibration steps and save & reboot.
 * `compact` renders a denser layout (smaller buttons, no captions/section labels)
 * for space-constrained places like the inspector tab. `currentState` and
 * `hasErrors` reflect the live axis state.
 *
 * Color/variant convention:
 *  - Solid buttons  = primary actions you reach for most (operation + full cal).
 *  - Outline buttons = secondary / advanced steps and destructive-ish actions.
 *  - green = go, orange = stop, blue = calibration, purple = advanced cal,
 *    red = errors, teal = persist to device.
 */
const MotorControls = ({ currentState, hasErrors = false, variant = 'basic', compact = false }) => {
  const { enable, disable, clearErrors, saveAndReboot } = useMotorControl()
  const calibration = useCalibration()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [calTitle, setCalTitle] = useState('Calibration')

  const isIdle = currentState === AXIS_STATE.IDLE
  const isClosedLoop = currentState === AXIS_STATE.CLOSED_LOOP_CONTROL
  const calDisabled = !isIdle || hasErrors

  // Open the modal whenever a calibration starts.
  useEffect(() => {
    if (calibration.isCalibrating) onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calibration.isCalibrating])

  const startCal = (type) => {
    setCalTitle(CALIBRATION_TYPES[type]?.label || 'Calibration')
    calibration.reset()
    calibration.start(type)
  }

  return (
    <>
      <VStack spacing={compact ? 2 : 4} align="stretch">
        {/* Operation */}
        <VStack spacing={1.5} align="stretch">
          {!compact && <SectionLabel>Operation</SectionLabel>}
          <SimpleGrid columns={2} spacing={2}>
            <ActionButton
              label="Enable Motor"
              caption="Closed Loop Control"
              tip={isClosedLoop ? 'Already in closed loop' : 'Enter closed-loop control'}
              colorScheme="green"
              compact={compact}
              onClick={enable}
              isDisabled={isClosedLoop || hasErrors}
            />
            <ActionButton
              label="Disable Motor"
              caption="Idle"
              tip={isIdle ? 'Already idle' : 'Return to idle'}
              colorScheme="orange"
              compact={compact}
              onClick={disable}
              isDisabled={isIdle}
            />
          </SimpleGrid>
        </VStack>

        {/* Calibration */}
        <VStack spacing={1.5} align="stretch">
          {!compact && <SectionLabel>Calibration</SectionLabel>}
          <ActionButton
            label="Full Calibration"
            caption="Motor + Encoder"
            tip={hasErrors ? 'Clear errors first' : 'Full motor + encoder calibration'}
            colorScheme="blue"
            compact={compact}
            onClick={() => startCal('full')}
            isDisabled={calDisabled}
          />
          {variant === 'full' && (
            <SimpleGrid columns={2} spacing={2}>
              <ActionButton
                label="Motor"
                caption="Resistance & Inductance"
                tip="Measure motor resistance & inductance"
                colorScheme="blue"
                variant="outline"
                compact={compact}
                onClick={() => startCal('motor')}
                isDisabled={calDisabled}
              />
              <ActionButton
                label="Hall Polarity"
                caption="Hall Sensor"
                tip="Calibrate Hall sensor polarity"
                colorScheme="purple"
                variant="outline"
                compact={compact}
                onClick={() => startCal('hall_polarity')}
                isDisabled={calDisabled}
              />
              <ActionButton
                label="Encoder Offset"
                caption="Offset Calibration"
                tip="Calibrate the encoder offset"
                colorScheme="purple"
                variant="outline"
                compact={compact}
                onClick={() => startCal('encoder_offset')}
                isDisabled={calDisabled}
              />
              <ActionButton
                label="Index Search"
                caption="Encoder Index"
                tip="Search for the encoder index pulse"
                colorScheme="purple"
                variant="outline"
                compact={compact}
                onClick={() => startCal('encoder_index')}
                isDisabled={calDisabled}
              />
            </SimpleGrid>
          )}
        </VStack>

        {/* System */}
        <VStack spacing={1.5} align="stretch">
          {!compact && <SectionLabel>System</SectionLabel>}
          <SimpleGrid columns={2} spacing={2}>
            <ActionButton
              label="Clear Errors"
              caption={hasErrors ? 'Active errors' : 'No errors'}
              tip="Clear axis, motor and encoder errors"
              colorScheme="red"
              variant="outline"
              compact={compact}
              onClick={clearErrors}
              isDisabled={!hasErrors}
            />
            <ActionButton
              label="Save & Reboot"
              caption="Persist to device"
              tip="Idle both axes, save to NVM, then reboot"
              colorScheme="teal"
              compact={compact}
              onClick={saveAndReboot}
            />
          </SimpleGrid>
        </VStack>
      </VStack>

      <CalibrationModal isOpen={isOpen} onClose={onClose} calibration={calibration} title={calTitle} />
    </>
  )
}

export default MotorControls
