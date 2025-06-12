/**
 * ODrive v0.5.6 Error Codes - Legacy Interface
 * 
 * This file now imports from the central odriveRegistry.js to avoid duplication.
 * Kept for backward compatibility with existing code.
 */

import { 
  ODriveErrors as registryErrors,
  decodeODriveError,
  decodeAxisError,
  decodeMotorError,
  decodeEncoderError,
  decodeControllerError,
  getErrorDescription,
  isErrorCritical,
  getErrorColor,
  getErrorTroubleshootingGuide
} from './odriveRegistry';

// Re-export error codes from the registry for backward compatibility
export const ODriveError = registryErrors.ODriveError;
export const AxisError = registryErrors.AxisError;
export const MotorError = registryErrors.MotorError;
export const EncoderError = registryErrors.EncoderError;
export const ControllerError = registryErrors.ControllerError;
export const CanError = registryErrors.CanError;

// Re-export error decoding functions and utility functions
export { 
  decodeODriveError,
  decodeAxisError,
  decodeMotorError,
  decodeEncoderError,
  decodeControllerError,
  getErrorDescription,
  isErrorCritical,
  getErrorColor,
  getErrorTroubleshootingGuide
};