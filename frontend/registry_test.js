// Test 0.6.11 registry features - run in browser console
import { createRegistryForVersion } from './src/utils/odriveUnifiedRegistry.js';

window.test0611Registry = () => {
  console.log('=== 0.6.11 Registry Test ===');
  
  const registry = createRegistryForVersion('0.6.11');
  
  console.log(`Firmware Version: ${registry.firmwareVersion}`);
  console.log(`Total Parameters: ${Object.values(registry.configCategories).reduce((sum, params) => sum + params.length, 0)}`);
  console.log(`Batch Paths: ${registry.batchPaths.length}`);
  console.log(`Categories: ${Object.keys(registry.configCategories)}`);

  // Check for key 0.6.11 features
  const keyFeatures = [
    'load_mapper', 'commutation_mapper', 'pos_vel_mapper',
    'harmonic_compensation', 'detailed_disarm_reason', 'init_pos',
    'init_vel', 'init_torque', 'thermal_current_limiter'
  ];

  console.log('\n=== Key Features Check ===');
  keyFeatures.forEach(feature => {
    const found = registry.batchPaths.some(path => path.includes(feature));
    console.log(`${feature}: ${found ? '✓' : '✗'}`);
  });

  return registry;
};

console.log('Run window.test0611Registry() to test 0.6.11 support');