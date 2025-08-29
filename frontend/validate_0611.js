/**
 * Validation test for 0.6.11 support
 * This file can be imported in the frontend to verify 0.6.11 features
 */

import { createRegistryForVersion } from './src/utils/odriveUnifiedRegistry.js'

export const validate0611Support = () => {
  console.log('🔍 Validating ODrive 0.6.11 Support...')
  
  try {
    // Create both registries for comparison
    const registry056 = createRegistryForVersion('0.5.6')
    const registry0611 = createRegistryForVersion('0.6.11')
    
    // Basic stats comparison
    const stats056 = {
      version: registry056.firmwareVersion,
      totalParams: Object.values(registry056.configCategories).reduce((sum, params) => sum + params.length, 0),
      batchPaths: registry056.batchPaths.length,
      categories: Object.keys(registry056.configCategories)
    }
    
    const stats0611 = {
      version: registry0611.firmwareVersion,
      totalParams: Object.values(registry0611.configCategories).reduce((sum, params) => sum + params.length, 0),
      batchPaths: registry0611.batchPaths.length,
      categories: Object.keys(registry0611.configCategories)
    }
    
    console.log('📊 Registry Comparison:')
    console.log('  0.5.6:', stats056)
    console.log('  0.6.11:', stats0611)
    
    // Check for key 0.6.11 features
    const key0611Features = [
      'load_mapper', 'commutation_mapper', 'pos_vel_mapper',
      'harmonic_compensation', 'detailed_disarm_reason',
      'init_pos', 'thermal_current_limiter', 'brake_resistor0'
    ]
    
    console.log('🔧 Key 0.6.11 Features Check:')
    const featureResults = {}
    
    key0611Features.forEach(feature => {
      const foundInBatch = registry0611.batchPaths.some(path => path.includes(feature))
      const foundInCategories = Object.values(registry0611.configCategories)
        .flat()
        .some(param => param.path.includes(feature))
      
      const result = foundInBatch || foundInCategories
      featureResults[feature] = result
      console.log(`  ${feature}: ${result ? '✓' : '✗'}`)
    })
    
    // Test path resolution for critical paths
    console.log('🔗 Path Resolution Test:')
    const testPaths = [
      'axis0.load_mapper.config.cpr',
      'axis0.commutation_mapper.config.pole_pairs', 
      'axis0.config.init_pos',
      'system.identify'
    ]
    
    const pathResults = {}
    testPaths.forEach(path => {
      try {
        const resolved = registry0611.pathResolver.resolve(path)
        pathResults[path] = { success: true, resolved }
        console.log(`  ${path} → ${resolved} ✓`)
      } catch (error) {
        pathResults[path] = { success: false, error: error.message }
        console.log(`  ${path} → ERROR: ${error.message} ✗`)
      }
    })
    
    // Summary
    const allFeaturesFound = Object.values(featureResults).every(found => found)
    const allPathsResolved = Object.values(pathResults).every(result => result.success)
    
    const overallSuccess = allFeaturesFound && allPathsResolved
    
    console.log(`\n${overallSuccess ? '✅' : '❌'} 0.6.11 Support Validation ${overallSuccess ? 'PASSED' : 'FAILED'}`)
    
    return {
      success: overallSuccess,
      stats056,
      stats0611,
      featureResults,
      pathResults
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Auto-run validation if this module is imported
if (typeof window !== 'undefined') {
  // Browser environment - add to window for manual testing
  window.validate0611Support = validate0611Support
  console.log('💡 Run validate0611Support() in console to test 0.6.11 support')
}