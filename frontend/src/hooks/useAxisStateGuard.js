import { useDisclosure } from '@chakra-ui/react'
import { useAxisStates } from '../utils/axisStateChecker'
import AxisStateModal from '../components/modals/AxisStateModal'

/**
 * Hook to guard actions that require axes to be in idle state
 */
export const useAxisStateGuard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { areBothAxesIdle } = useAxisStates()

  /**
   * Execute an action with axis state checking
   * @param {Function} action - The action to execute
   * @param {string} actionName - Description of the action for the modal
   * @param {string} actionButtonText - Text for the continue button
   * @returns {Object} - Modal component and execution function
   */
  const executeWithAxisCheck = (action, actionName = "perform this action", actionButtonText = "Continue") => {
    const execute = () => {
      if (areBothAxesIdle) {
        // Both axes are idle, execute immediately
        action()
      } else {
        // Show modal for non-idle axes
        onOpen()
      }
    }

    const handleContinue = () => {
      onClose()
      action()
    }

    const AxisGuardModal = () => (
      <AxisStateModal
        isOpen={isOpen}
        onClose={onClose}
        onContinue={handleContinue}
        actionName={actionName}
        actionButtonText={actionButtonText}
      />
    )

    return {
      execute,
      AxisGuardModal
    }
  }

  return {
    executeWithAxisCheck,
    areBothAxesIdle
  }
}