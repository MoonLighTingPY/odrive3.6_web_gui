/**
 * ODrive v0.5.6 Commands - Legacy Interface
 * 
 * This file now imports from the central odriveRegistry.js to avoid duplication.
 * Kept for backward compatibility with existing code.
 */

import { 
  ODriveCommands as registryCommands,
  ODrivePropertyMappings as registryPropertyMappings,
  getCommandsByCategory as registryGetCommandsByCategory,
  getAllCommands as registryGetAllCommands,
  searchCommands as registrySearchCommands,
  getConfigurationParams as registryGetConfigurationParams,
  getAllConfigurationParams as registryGetAllConfigurationParams
} from './odriveRegistry';

// Re-export the commands from the registry for backward compatibility
export const odriveCommands = registryCommands;

// Re-export utility functions
export const getCommandsByCategory = registryGetCommandsByCategory;
export const getAllCommands = registryGetAllCommands;
export const searchCommands = registrySearchCommands;

// Re-export configuration mappings
export const configurationMappings = registryPropertyMappings;
export const getConfigurationParams = registryGetConfigurationParams;
export const getAllConfigurationParams = registryGetAllConfigurationParams;