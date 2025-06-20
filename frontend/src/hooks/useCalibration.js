import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

export const useCalibration = () => {
  const toast = useToast()
  
  // Calibration state
  const [calibrationStatus, setCalibrationStatus] = useState(null)
  const [calibrationProgress, setCalibrationProgress] = useState(0)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationPhase, setCalibrationPhase] = useState('idle')
  const [calibrationSequence, setCalibrationSequence] = useState([])

  // Poll calibration status when calibrating
  useEffect(() => {
    let interval = null
    if (isCalibrating) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('/api/odrive/calibration_status')
          if (response.ok) {
            const status = await response.json()
            console.log('Calibration status update:', status)
            setCalibrationStatus(status)
            setCalibrationProgress(status.progress_percentage || 0)
            setCalibrationPhase(status.calibration_phase || 'idle')
            
            // Check for errors FIRST before auto-continue
            const hasErrors = status.axis_error !== 0 || status.motor_error !== 0 || status.encoder_error !== 0
            
            if (hasErrors) {
              console.log('Calibration errors detected, stopping calibration:', {
                axis_error: status.axis_error,
                motor_error: status.motor_error, 
                encoder_error: status.encoder_error
              })
              
              setIsCalibrating(false)
              
              // Determine error messages based on error codes
              const errorMessages = []
              if (status.axis_error === 0x100) {
                errorMessages.push("Encoder subsystem failed")
              }
              if (status.encoder_error & 0x02) {
                errorMessages.push("Encoder CPR doesn't match motor pole pairs")
              }
              if (status.encoder_error & 0x200) {
                errorMessages.push("Hall sensors not calibrated")
              }
              
              const errorDescription = errorMessages.length > 0 
                ? errorMessages.join('; ')
                : `Axis: 0x${status.axis_error.toString(16)}, Motor: 0x${status.motor_error.toString(16)}, Encoder: 0x${status.encoder_error.toString(16)}`
              
              toast({
                title: 'Calibration Failed',
                description: errorDescription,
                status: 'error',
                duration: 8000,
                isClosable: true
              })
              
              return // Exit early, don't process auto-continue
            }
            
            // Auto-continue calibration sequence if needed (ONLY if no errors)
            if (status.auto_continue_action && status.calibration_phase === 'ready_for_offset') {
              console.log('Auto-continuing to encoder offset calibration...')
              
              // Add a state to prevent multiple auto-continue attempts
              if (!calibrationStatus?.auto_continue_in_progress) {
                setCalibrationStatus(prev => ({ ...prev, auto_continue_in_progress: true }))
                
                toast({
                  title: 'Auto-continuing calibration',
                  description: 'Encoder polarity complete, starting offset calibration...',
                  status: 'info',
                  duration: 3000,
                })
                
                // Wait a moment, then continue to offset calibration
                setTimeout(async () => {
                  try {
                    const continueResponse = await fetch('/api/odrive/auto_continue_calibration', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ step: 'encoder_offset' })
                    })
                    
                    if (continueResponse.ok) {
                      const result = await continueResponse.json()
                      console.log('Auto-continue result:', result)
                      toast({
                        title: 'Calibration continued',
                        description: result.message,
                        status: 'success',
                        duration: 3000,
                      })
                    }
                  } catch (error) {
                    console.error('Failed to auto-continue calibration:', error)
                    setIsCalibrating(false)
                    toast({
                      title: 'Auto-continue failed',
                      description: 'Failed to continue calibration sequence',
                      status: 'error',
                      duration: 5000,
                    })
                  } finally {
                    setCalibrationStatus(prev => ({ ...prev, auto_continue_in_progress: false }))
                  }
                }, 1000)
              }
            }
            
            // Check if calibration is complete
            if (status.calibration_phase === 'complete' || status.calibration_phase === 'full_calibration_complete') {
              console.log('Calibration completed successfully!')
              setIsCalibrating(false)
              setCalibrationProgress(100)
              toast({
                title: 'Calibration Complete!',
                description: 'Motor and encoder calibration completed successfully.',
                status: 'success',
                duration: 200,
              })
            }
          } else {
            console.error('Failed to fetch calibration status:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Failed to fetch calibration status:', error)
        }
      }, 500)
      
      return () => clearInterval(interval)
    }
  }, [isCalibrating, toast, calibrationStatus?.auto_continue_in_progress])

  const startCalibration = async (type = 'full') => {
    try {
      const response = await fetch('/api/odrive/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        const result = await response.json()
        setIsCalibrating(true)
        setCalibrationProgress(0)
        setCalibrationPhase('starting')
        setCalibrationSequence(result.sequence || [])
        
        toast({
          title: 'Calibration Started',
          description: result.message,
          status: 'info',
          duration: 3000,
        })
        
        return { success: true, sequence: result.sequence }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start calibration')
      }
    } catch (error) {
      toast({
        title: 'Calibration Failed to Start',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
      return { success: false, error: error.message }
    }
  }

  const stopCalibration = () => {
    setIsCalibrating(false)
    setCalibrationProgress(0)
    setCalibrationPhase('idle')
    setCalibrationSequence([])
    setCalibrationStatus(null)
  }

  const getCalibrationPhaseDescription = (phase) => {
    switch (phase) {
      case 'motor_calibration': return 'Measuring motor resistance and inductance...'
      case 'encoder_polarity': return 'Finding encoder direction/polarity...'
      case 'encoder_offset': return 'Calibrating encoder offset...'
      case 'encoder_index_search': return 'Searching for encoder index pulse...'
      case 'full_calibration': return 'Running full calibration sequence...'
      case 'ready_for_polarity': return 'Ready to start encoder polarity calibration...'
      case 'ready_for_offset': return 'Ready to start encoder offset calibration...'
      case 'complete': return 'Calibration completed successfully!'
      case 'idle': return 'Calibration not running'
      default: return 'Unknown calibration state'
    }
  }

  return {
    // State
    calibrationStatus,
    calibrationProgress,
    isCalibrating,
    calibrationPhase,
    calibrationSequence,
    
    // Actions
    startCalibration,
    stopCalibration,
    getCalibrationPhaseDescription
  }
}