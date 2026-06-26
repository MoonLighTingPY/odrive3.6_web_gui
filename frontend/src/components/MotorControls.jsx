import { useEffect, useState } from 'react'
import { SimpleGrid, Button, useDisclosure, Tooltip } from '@chakra-ui/react'
import { useMotorControl, AXIS_STATE } from '../hooks/useMotorControl'
import { useCalibration, CALIBRATION_TYPES } from '../hooks/useCalibration'
import CalibrationModal from './modals/CalibrationModal'

/**
 * Motor control buttons. `variant="basic"` shows enable/disable/calibrate/clear;
 * `variant="full"` adds the separate motor + encoder calibration steps and
 * save & reboot. `currentState` and `hasErrors` reflect the live axis state.
 */
const MotorControls = ({ currentState, hasErrors = false, columns = { base: 2, md: 3 }, variant = 'basic' }) => {
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
      <SimpleGrid columns={columns} spacing={2}>
        <Tooltip label={isClosedLoop ? 'Already in closed loop' : 'Enter closed-loop control'}>
          <Button size="sm" colorScheme="green" onClick={enable} isDisabled={isClosedLoop || hasErrors}>
            Enable Motor
          </Button>
        </Tooltip>
        <Tooltip label={isIdle ? 'Already idle' : 'Return to idle'}>
          <Button size="sm" colorScheme="orange" onClick={disable} isDisabled={isIdle}>
            Disable Motor
          </Button>
        </Tooltip>
        <Tooltip label={hasErrors ? 'Clear errors first' : 'Full motor + encoder calibration'}>
          <Button size="sm" colorScheme="blue" onClick={() => startCal('full')} isDisabled={calDisabled}>
            Full Calibration
          </Button>
        </Tooltip>

        {variant === 'full' && (
          <>
            <Tooltip label="Measure motor resistance & inductance">
              <Button size="sm" colorScheme="blue" variant="outline" onClick={() => startCal('motor')} isDisabled={calDisabled}>
                Motor Calibration
              </Button>
            </Tooltip>
            <Tooltip label="Calibrate Hall sensor polarity">
              <Button size="sm" colorScheme="purple" variant="outline" onClick={() => startCal('hall_polarity')} isDisabled={calDisabled}>
                Hall Calibration
              </Button>
            </Tooltip>
            <Tooltip label="Calibrate the encoder offset">
              <Button size="sm" colorScheme="purple" variant="outline" onClick={() => startCal('encoder_offset')} isDisabled={calDisabled}>
                Encoder Offset
              </Button>
            </Tooltip>
            <Tooltip label="Search for the encoder index pulse">
              <Button size="sm" colorScheme="purple" variant="outline" onClick={() => startCal('encoder_index')} isDisabled={calDisabled}>
                Index Search
              </Button>
            </Tooltip>
          </>
        )}

        <Button size="sm" variant="outline" onClick={clearErrors} isDisabled={!hasErrors}>
          Clear Errors
        </Button>
        <Button size="sm" variant="outline" onClick={saveAndReboot}>
          Save &amp; Reboot
        </Button>
      </SimpleGrid>

      <CalibrationModal isOpen={isOpen} onClose={onClose} calibration={calibration} title={calTitle} />
    </>
  )
}

export default MotorControls
