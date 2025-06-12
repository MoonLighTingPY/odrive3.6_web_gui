/**
 * ODrive v0.5.6 Enums - Legacy Interface
 * 
 * This file now imports from the central odriveRegistry.js to avoid duplication.
 * Kept for backward compatibility with existing code.
 */

import { 
  ODriveEnums as registryEnums,
  getMotorTypeName,
  getMotorTypeValue,
  getEncoderModeName,
  getEncoderModeValue,
  getControlModeName,
  getControlModeValue,
  getInputModeName,
  getInputModeValue,
  getAxisStateName,
  getAxisStateValue,
  getGpioModeName,
  getGpioModeValue
} from './odriveRegistry';

// Re-export enums from the registry for backward compatibility
export const MotorType = registryEnums.MotorType;
export const EncoderMode = registryEnums.EncoderMode;
export const ControlMode = registryEnums.ControlMode;
export const InputMode = registryEnums.InputMode;
export const AxisState = registryEnums.AxisState;
export const GpioMode = registryEnums.GpioMode;
export const StreamProtocolType = registryEnums.StreamProtocolType;
export const CanProtocol = registryEnums.CanProtocol;

// Re-export helper functions
export { 
  getMotorTypeName,
  getMotorTypeValue,
  getEncoderModeName,
  getEncoderModeValue,
  getControlModeName,
  getControlModeValue,
  getInputModeName,
  getInputModeValue,
  getAxisStateName,
  getAxisStateValue,
  getGpioModeName,
  getGpioModeValue
};