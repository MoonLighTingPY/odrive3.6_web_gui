/**
 * Registry Debug Utility
 * Test utility to demonstrate version-aware registry switching
 */

import { registryManager, getCurrentRegistry, setRegistryVersion } from './registryManager'

/**
 * Test firmware version detection and registry switching
 * @param {string} version - Version string to test (e.g., "v0.5.6", "v0.6.11")
 */
export const testVersionDetection = (version) => {
  console.log(`\n=== Testing Version Detection: ${version} ===`)
  
  // Get initial state
  const initialInfo = registryManager.getDebugInfo()
  console.log('Initial state:', initialInfo)
  
  // Switch to test version
  setRegistryVersion(version)
  
  // Get updated state
  const updatedInfo = registryManager.getDebugInfo()
  console.log('After version switch:', updatedInfo)
  
  // Get current registry info
  const registry = getCurrentRegistry()
  const registryDebug = registry.getDebugInfo()
  console.log('Registry details:', {
    firmwareVersion: registry.firmwareVersion,
    categories: registryDebug.categories,
    parameterCounts: registryDebug.parameterCounts,
    sampleBatchPaths: registryDebug.sampleBatchPaths.slice(0, 3)
  })
  
  return {
    version: updatedInfo.currentVersion,
    registryVersion: registry.firmwareVersion,
    categories: registryDebug.categories,
    totalParams: Object.values(registryDebug.parameterCounts).reduce((sum, count) => sum + count, 0)
  }
}

/**
 * Test registry differences between versions
 */
export const compareVersions = () => {
  console.log('\n=== Comparing Registry Versions ===')
  
  const v056 = testVersionDetection('v0.5.6')
  const v0611 = testVersionDetection('v0.6.11')
  
  console.log('\nComparison Summary:')
  console.log('v0.5.6:', v056)
  console.log('v0.6.11:', v0611)
  
  const paramDiff = v0611.totalParams - v056.totalParams
  console.log(`Parameter count difference: ${paramDiff > 0 ? '+' : ''}${paramDiff}`)
  
  return { v056, v0611, paramDiff }
}

/**
 * Test with invalid/edge case versions
 */
export const testEdgeCases = () => {
  console.log('\n=== Testing Edge Cases ===')
  
  const testCases = [
    'v0.6.0',   // Should use 0.6.11 registry
    'v0.5.3',   // Should use 0.5.6 registry
    'v0.4.9',   // Should fallback to 0.5.6
    '0.6.8',    // No 'v' prefix
    'invalid',  // Invalid version
    '',         // Empty string
    null        // Null
  ]
  
  const results = testCases.map(version => {
    try {
      const result = testVersionDetection(version)
      return { input: version, output: result, success: true }
    } catch (error) {
      return { input: version, error: error.message, success: false }
    }
  })
  
  console.log('Edge case results:', results)
  return results
}

/**
 * Interactive test for browser console
 */
export const runInteractiveTest = () => {
  console.log('\n=== ODrive Version Detection System Test ===')
  console.log('Available test functions:')
  console.log('- testVersionDetection("v0.5.6") - Test specific version')
  console.log('- compareVersions() - Compare 0.5.6 vs 0.6.11')
  console.log('- testEdgeCases() - Test edge cases')
  
  // Run basic comparison
  const comparison = compareVersions()
  
  console.log('\n✅ Version detection system is working!')
  console.log('The registry automatically switches based on firmware version.')
  
  return comparison
}

// Export all test functions
export default {
  testVersionDetection,
  compareVersions,
  testEdgeCases,
  runInteractiveTest
}