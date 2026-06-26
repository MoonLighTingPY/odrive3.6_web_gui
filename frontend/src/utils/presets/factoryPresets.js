// Built-in factory presets. Values use template axis paths (`axis{n}...`) so they
// apply to whichever axis is selected. Mirrors common motor profiles.

export const FACTORY_PRESETS = [
  {
    format: 'odrive-gui-preset',
    version: 1,
    name: 'High Current — D6374 150KV',
    factory: true,
    description: 'ODrive D6374 150KV high-current motor with a 4000 CPR encoder.',
    values: {
      'axis{n}.motor.config.motor_type': 0,
      'axis{n}.motor.config.pole_pairs': 7,
      'axis{n}.motor.config.torque_constant': 0.0551, // 8.27 / 150
      'axis{n}.motor.config.current_lim': 40,
      'axis{n}.motor.config.calibration_current': 10,
      'axis{n}.encoder.config.mode': 0,
      'axis{n}.encoder.config.cpr': 4000,
      'axis{n}.controller.config.control_mode': 2,
      'axis{n}.controller.config.vel_limit': 10,
    },
  },
  {
    format: 'odrive-gui-preset',
    version: 1,
    name: 'Gimbal — GBM2804 100KV',
    factory: true,
    description: 'Low-current gimbal motor. Use gimbal motor mode and a low current limit.',
    values: {
      'axis{n}.motor.config.motor_type': 2,
      'axis{n}.motor.config.pole_pairs': 7,
      'axis{n}.motor.config.torque_constant': 0.0827, // 8.27 / 100
      'axis{n}.motor.config.current_lim': 5,
      'axis{n}.motor.config.calibration_current': 2,
      'axis{n}.encoder.config.mode': 0,
      'axis{n}.encoder.config.cpr': 4000,
      'axis{n}.controller.config.control_mode': 2,
      'axis{n}.controller.config.vel_limit': 20,
    },
  },
  {
    format: 'odrive-gui-preset',
    version: 1,
    name: 'Hoverboard — 6.5" Wheel',
    factory: true,
    description: 'Hoverboard hub motor with Hall sensors (15 pole pairs, CPR = pole_pairs × 6).',
    values: {
      'axis{n}.motor.config.motor_type': 0,
      'axis{n}.motor.config.pole_pairs': 15,
      'axis{n}.motor.config.torque_constant': 0.517, // 8.27 / 16
      'axis{n}.motor.config.current_lim': 30,
      'axis{n}.motor.config.calibration_current': 10,
      'axis{n}.encoder.config.mode': 1, // Hall
      'axis{n}.encoder.config.cpr': 90, // 15 * 6
      'axis{n}.controller.config.control_mode': 2,
      'axis{n}.controller.config.vel_limit': 2,
    },
  },
]
