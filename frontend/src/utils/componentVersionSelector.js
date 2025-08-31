/**
 * Component Version Selector for ODrive 0.5.x vs 0.6.x variants
 * 
 * This utility provides automatic component selection based on firmware version.
 * It enables a dual-app architecture where 0.5.x components remain untouched
 * and 0.6.x variants are used for 0.6.x devices.
 */

import { useSelector } from 'react-redux'

// Config Steps Components
import ControlConfigStep from '../components/config-steps/ControlConfigStep'
import ControlConfigStep06 from '../components/config-steps/ControlConfigStep_0_6'

import PowerConfigStep from '../components/config-steps/PowerConfigStep'
import PowerConfigStep06 from '../components/config-steps/PowerConfigStep_0_6'

import MotorConfigStep from '../components/config-steps/MotorConfigStep'
import MotorConfigStep06 from '../components/config-steps/MotorConfigStep_0_6'

import EncoderConfigStep from '../components/config-steps/EncoderConfigStep'
import EncoderConfigStep06 from '../components/config-steps/EncoderConfigStep_0_6'

import InterfaceConfigStep from '../components/config-steps/InterfaceConfigStep'
import InterfaceConfigStep06 from '../components/config-steps/InterfaceConfigStep_0_6'

// Property Tree Components
import PropertyTree from '../components/inspector/property-tree/PropertyTree'
import PropertyTree06 from '../components/inspector/property-tree/PropertyTree_0_6'

import PropertyItem from '../components/inspector/property-tree/PropertyItem'
import PropertyItem06 from '../components/inspector/property-tree/PropertyItem_0_6'

// Preset Components
import PresetManager from '../components/presets/PresetManager'
import PresetManager06 from '../components/presets/PresetManager_0_6'

// Config Parameter Fields
import ParameterInput from '../components/config-parameter-fields/ParameterInput'
import ParameterInput06 from '../components/config-parameter-fields/ParameterInput_0_6'

/**
 * Component mapping for automatic version selection
 */
const COMPONENT_MAPPINGS = {
  // Config Steps
  ControlConfigStep: {
    '0.5.x': ControlConfigStep,
    '0.6.x': ControlConfigStep06
  },
  PowerConfigStep: {
    '0.5.x': PowerConfigStep,
    '0.6.x': PowerConfigStep06
  },
  MotorConfigStep: {
    '0.5.x': MotorConfigStep,
    '0.6.x': MotorConfigStep06
  },
  EncoderConfigStep: {
    '0.5.x': EncoderConfigStep,
    '0.6.x': EncoderConfigStep06
  },
  InterfaceConfigStep: {
    '0.5.x': InterfaceConfigStep,
    '0.6.x': InterfaceConfigStep06
  },

  // Property Tree
  PropertyTree: {
    '0.5.x': PropertyTree,
    '0.6.x': PropertyTree06
  },
  PropertyItem: {
    '0.5.x': PropertyItem,
    '0.6.x': PropertyItem06
  },

  // Presets
  PresetManager: {
    '0.5.x': PresetManager,
    '0.6.x': PresetManager06
  },

  // Parameter Fields
  ParameterInput: {
    '0.5.x': ParameterInput,
    '0.6.x': ParameterInput06
  },
}

/**
 * Get the appropriate component variant based on firmware version
 * @param {string} componentName - Name of the component
 * @param {boolean} is0_6 - Whether firmware is 0.6.x (optional, will read from Redux if not provided)
 * @returns {React.Component} The appropriate component variant
 */
export const getVersionedComponent = (componentName, is0_6 = null) => {
  // If is0_6 not provided, we need to get it from Redux in a React component context
  if (is0_6 === null) {
    // This will be handled by the hook version below
    throw new Error('getVersionedComponent requires is0_6 parameter or use useVersionedComponent hook')
  }

  const mapping = COMPONENT_MAPPINGS[componentName]
  if (!mapping) {
    console.warn(`No version mapping found for component: ${componentName}`)
    return null
  }

  const version = is0_6 ? '0.6.x' : '0.5.x'
  const Component = mapping[version]

  if (!Component) {
    console.warn(`No ${version} variant found for component: ${componentName}, falling back to 0.5.x`)
    return mapping['0.5.x'] || null
  }

  console.log(`ComponentVersionSelector: Using ${version} variant of ${componentName}`)
  return Component
}

/**
 * React hook to get versioned component with automatic firmware detection
 * @param {string} componentName - Name of the component
 * @returns {React.Component} The appropriate component variant
 */
export const useVersionedComponent = (componentName) => {
  const { fw_is_0_6 } = useSelector(state => state.device)
  return getVersionedComponent(componentName, fw_is_0_6)
}

/**
 * Higher-order component that automatically selects the correct variant
 * @param {string} componentName - Name of the component
 * @returns {React.Component} A component that renders the correct variant
 */
export const createVersionedComponent = (componentName) => {
  return (props) => {
    const Component = useVersionedComponent(componentName)
    
    if (!Component) {
      console.error(`Failed to resolve component variant for: ${componentName}`)
      return null
    }

    return <Component {...props} />
  }
}

/**
 * Utility to get version info for debugging
 * @returns {Object} Version information
 */
export const useVersionInfo = () => {
  const { fw_is_0_6, fw_is_0_5, fw_version_string } = useSelector(state => state.device)
  
  return {
    is0_6: fw_is_0_6,
    is0_5: fw_is_0_5,
    versionString: fw_version_string,
    displayName: fw_is_0_6 ? '0.6.x' : (fw_is_0_5 ? '0.5.x' : 'Unknown'),
    availableComponents: Object.keys(COMPONENT_MAPPINGS)
  }
}

/**
 * Get all available component variants for debugging
 * @returns {Object} All component mappings
 */
export const getComponentMappings = () => {
  return COMPONENT_MAPPINGS
}

// Pre-created versioned components for convenience
export const VersionedControlConfigStep = createVersionedComponent('ControlConfigStep')
export const VersionedPowerConfigStep = createVersionedComponent('PowerConfigStep')
export const VersionedMotorConfigStep = createVersionedComponent('MotorConfigStep')
export const VersionedEncoderConfigStep = createVersionedComponent('EncoderConfigStep')
export const VersionedInterfaceConfigStep = createVersionedComponent('InterfaceConfigStep')
export const VersionedPropertyTree = createVersionedComponent('PropertyTree')
export const VersionedPropertyItem = createVersionedComponent('PropertyItem')
export const VersionedPresetManager = createVersionedComponent('PresetManager')
export const VersionedParameterInput = createVersionedComponent('ParameterInput')

export default {
  getVersionedComponent,
  useVersionedComponent,
  createVersionedComponent,
  useVersionInfo,
  getComponentMappings,
  // Convenience exports
  VersionedControlConfigStep,
  VersionedPowerConfigStep,
  VersionedMotorConfigStep,
  VersionedEncoderConfigStep,
  VersionedInterfaceConfigStep,
  VersionedPropertyTree,
  VersionedPropertyItem,
  VersionedPresetManager,
  VersionedParameterInput,
}