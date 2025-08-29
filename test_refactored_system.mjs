/**
 * Test script for the new ODrive path resolver and refactored registry system
 */

import { 
  ODrivePathResolver, 
  ODrivePathConfig,
  setPathResolverConfig,
  resolveToApiPath,
  resolveToPropertyPath,
  generateCommand,
  isPropertySupported,
  getCompatiblePath,
  getPathResolverDebugInfo
} from '../frontend/src/utils/odrivePathResolver.js'

import { 
  setActiveOdriveFirmwareVersion,
  getCurrentRegistry,
  getBatchPaths,
  getDebugInfo
} from '../frontend/src/utils/odriveUnifiedRegistry.js'

console.log("🧪 Testing ODrive Path Resolver and Registry System\n")

// Test 1: Basic path resolution for 0.5.6
console.log("📍 Test 1: Basic Path Resolution (0.5.6)")
setPathResolverConfig("0.5.6", "odrv0", 0)

const testPaths = [
  "system.vbus_voltage",
  "axis0.motor.config.pole_pairs", 
  "axis0.encoder.config.cpr",
  "axis0.controller.config.vel_limit",
  "config.dc_bus_overvoltage_trip_level"
]

testPaths.forEach(path => {
  const apiPath = resolveToApiPath(path)
  const propPath = resolveToPropertyPath(path)
  const command = generateCommand(path, 42)
  console.log(`  ${path}`)
  console.log(`    → API: ${apiPath}`)
  console.log(`    → Prop: ${propPath}`)  
  console.log(`    → Cmd: ${command}`)
})

console.log("\n📍 Test 2: Axis Switching")
// Test axis switching
testPaths.forEach(path => {
  if (path.includes('axis0') || !path.includes('system') && !path.includes('config')) {
    const axis1Command = generateCommand(path, 42, 1)
    console.log(`  ${path} (axis1) → ${axis1Command}`)
  }
})

console.log("\n📍 Test 3: Device Name Changes")
setPathResolverConfig("0.5.6", "my_odrive", 1)
testPaths.forEach(path => {
  const apiPath = resolveToApiPath(path)
  console.log(`  ${path} → ${apiPath}`)
})

console.log("\n📍 Test 4: Version-aware Registry System")
// Test 0.5.6
setActiveOdriveFirmwareVersion("0.5.6", "odrv0", 0)
let registry = getCurrentRegistry()
console.log(`Registry 0.5.6: ${registry.firmwareVersion}, ${registry.deviceName}, axis${registry.defaultAxis}`)

// Test 0.6.x  
setActiveOdriveFirmwareVersion("0.6.11", "odrv0", 1)
registry = getCurrentRegistry()
console.log(`Registry 0.6.11: ${registry.firmwareVersion}, ${registry.deviceName}, axis${registry.defaultAxis}`)

console.log("\n📍 Test 5: Property Support Checks")
const v06Properties = [
  "system.control_loop_hz",
  "system.bootloader_version", 
  "config.dc_max_positive_current",
  "axis0.pos_vel_mapper"
]

setPathResolverConfig("0.5.6")
console.log("0.5.6 support:")
v06Properties.forEach(prop => {
  console.log(`  ${prop}: ${isPropertySupported(prop)}`)
})

setPathResolverConfig("0.6.11") 
console.log("0.6.11 support:")
v06Properties.forEach(prop => {
  console.log(`  ${prop}: ${isPropertySupported(prop)}`)
})

console.log("\n📍 Test 6: Compatibility Path Corrections")
const renamedPaths = [
  "axis0.min_endstop.endstop_state",
  "brake_resistor0.is_saturated", 
  "amt21_encoder_group0"
]

setPathResolverConfig("0.6.11")
renamedPaths.forEach(path => {
  const compatible = getCompatiblePath(path)
  console.log(`  ${path} → ${compatible}`)
})

console.log("\n✅ All tests completed!")

// Debug info
console.log("\n🔧 Debug Info:")
console.log("Path Resolver:", getPathResolverDebugInfo())
console.log("Registry:", getDebugInfo())

const batchPaths = getBatchPaths()
console.log(`Batch paths count: ${batchPaths.length}`)
console.log("Sample batch paths:", batchPaths.slice(0, 5))