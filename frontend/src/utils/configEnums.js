// Friendly display names for ODrive enum members.
//
// The data-driven registry already knows each enum's members and integer values
// (from the API reference). This module only adds human-friendly labels on top;
// anything without an explicit label falls back to title-casing the raw name.

import { getRegistry, enumTypeOf } from './odriveRegistry'

const FRIENDLY = {
  'ODrive.Motor.MotorType': {
    HIGH_CURRENT: 'High Current',
    GIMBAL: 'Gimbal',
    ACIM: 'ACIM (Induction)',
  },
  'ODrive.Encoder.Mode': {
    INCREMENTAL: 'Incremental (ABZ)',
    HALL: 'Hall Effect',
    SINCOS: 'SinCos',
    SPI_ABS_CUI: 'SPI Absolute (CUI)',
    SPI_ABS_AMS: 'SPI Absolute (AMS)',
    SPI_ABS_AEAT: 'SPI Absolute (AEAT)',
    SPI_ABS_RLS: 'SPI Absolute (RLS)',
    SPI_ABS_MA732: 'SPI Absolute (MA732)',
  },
  'ODrive.Controller.ControlMode': {
    VOLTAGE_CONTROL: 'Voltage Control',
    TORQUE_CONTROL: 'Torque Control',
    VELOCITY_CONTROL: 'Velocity Control',
    POSITION_CONTROL: 'Position Control',
  },
  'ODrive.Controller.InputMode': {
    INACTIVE: 'Inactive',
    PASSTHROUGH: 'Passthrough',
    VEL_RAMP: 'Velocity Ramp',
    POS_FILTER: 'Position Filter',
    MIX_CHANNELS: 'Mix Channels',
    TRAP_TRAJ: 'Trapezoidal Trajectory',
    TORQUE_RAMP: 'Torque Ramp',
    MIRROR: 'Mirror',
    TUNING: 'Tuning',
  },
  'ODrive.Axis.AxisState': {
    UNDEFINED: 'Undefined',
    IDLE: 'Idle',
    STARTUP_SEQUENCE: 'Startup Sequence',
    FULL_CALIBRATION_SEQUENCE: 'Full Calibration',
    MOTOR_CALIBRATION: 'Motor Calibration',
    ENCODER_INDEX_SEARCH: 'Encoder Index Search',
    ENCODER_OFFSET_CALIBRATION: 'Encoder Offset Calibration',
    CLOSED_LOOP_CONTROL: 'Closed Loop Control',
    LOCKIN_SPIN: 'Lock-in Spin',
    ENCODER_DIR_FIND: 'Encoder Direction Find',
    HOMING: 'Homing',
    ENCODER_HALL_POLARITY_CALIBRATION: 'Hall Polarity Calibration',
    ENCODER_HALL_PHASE_CALIBRATION: 'Hall Phase Calibration',
  },
}

const titleCase = (name) =>
  name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

// Axis-state value -> friendly name, usable without the registry/firmware line.
const AXIS_STATE_NAMES = {
  0: 'Undefined',
  1: 'Idle',
  2: 'Startup Sequence',
  3: 'Full Calibration',
  4: 'Motor Calibration',
  5: 'Sensorless Control',
  6: 'Encoder Index Search',
  7: 'Encoder Offset Calibration',
  8: 'Closed Loop Control',
  9: 'Lock-in Spin',
  10: 'Encoder Direction Find',
  11: 'Homing',
  12: 'Hall Polarity Calibration',
  13: 'Hall Phase Calibration',
}

/** Friendly name for an axis-state integer. */
export function getAxisStateName(state) {
  return AXIS_STATE_NAMES[Number(state)] || `State ${state}`
}

/** Friendly label for a raw enum member name within an enum type. */
export function friendlyEnumLabel(enumTypeName, memberName) {
  return FRIENDLY[enumTypeName]?.[memberName] || titleCase(memberName)
}

/**
 * Build select options for an enum property: [{ value:number, label:string }].
 * `enumTypeName` may be given explicitly or derived from the property meta.
 * Returns [] when the enum is unknown.
 */
export function enumSelectOptions(fwLine, enumTypeName, meta) {
  const typeName = enumTypeName || (meta && enumTypeOf(meta))
  if (!typeName) return []
  const reg = getRegistry(fwLine)
  const en = reg.enums[typeName]
  if (!en?.values) return []
  return Object.entries(en.values).map(([name, info]) => ({
    value: typeof info?.value === 'number' ? info.value : Number(info?.value ?? 0),
    label: friendlyEnumLabel(typeName, name),
  }))
}
