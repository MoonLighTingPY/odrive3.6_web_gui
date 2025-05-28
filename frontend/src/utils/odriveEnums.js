// ODrive v0.5.6 Enums based on firmware documentation

// Motor Types
export const MotorType = {
  HIGH_CURRENT: 0,
  GIMBAL: 1,
}

export const getMotorTypeName = (type) => {
  switch (type) {
    case MotorType.HIGH_CURRENT: return 'High Current'
    case MotorType.GIMBAL: return 'Gimbal'
    default: return 'Unknown'
  }
}

// Encoder Modes
export const EncoderMode = {
  INCREMENTAL: 1,
  HALL: 2,
  SINCOS: 3,
  SPI_ABS_CUI: 256,
  SPI_ABS_AMS: 257,
  SPI_ABS_AEAT: 258,
}

export const getEncoderModeName = (mode) => {
  switch (mode) {
    case EncoderMode.INCREMENTAL: return 'Incremental'
    case EncoderMode.HALL: return 'Hall Effect'
    case EncoderMode.SINCOS: return 'SinCos'
    case EncoderMode.SPI_ABS_CUI: return 'SPI Absolute (CUI)'
    case EncoderMode.SPI_ABS_AMS: return 'SPI Absolute (AMS)'
    case EncoderMode.SPI_ABS_AEAT: return 'SPI Absolute (AEAT)'
    default: return 'Unknown'
  }
}

// Control Modes
export const ControlMode = {
  VOLTAGE_CONTROL: 0,
  TORQUE_CONTROL: 1,
  VELOCITY_CONTROL: 2,
  POSITION_CONTROL: 3,
}

export const getControlModeName = (mode) => {
  switch (mode) {
    case ControlMode.VOLTAGE_CONTROL: return 'Voltage Control'
    case ControlMode.TORQUE_CONTROL: return 'Torque Control'
    case ControlMode.VELOCITY_CONTROL: return 'Velocity Control'
    case ControlMode.POSITION_CONTROL: return 'Position Control'
    default: return 'Unknown'
  }
}

// Input Modes
export const InputMode = {
  INACTIVE: 0,
  PASSTHROUGH: 1,
  VEL_RAMP: 2,
  POS_FILTER: 3,
  MIX_CHANNELS: 4,
  TRAP_TRAJ: 5,
  TORQUE_RAMP: 6,
  MIRROR: 7,
}

export const getInputModeName = (mode) => {
  switch (mode) {
    case InputMode.INACTIVE: return 'Inactive'
    case InputMode.PASSTHROUGH: return 'Passthrough'
    case InputMode.VEL_RAMP: return 'Velocity Ramp'
    case InputMode.POS_FILTER: return 'Position Filter'
    case InputMode.MIX_CHANNELS: return 'Mix Channels'
    case InputMode.TRAP_TRAJ: return 'Trapezoidal Trajectory'
    case InputMode.TORQUE_RAMP: return 'Torque Ramp'
    case InputMode.MIRROR: return 'Mirror'
    default: return 'Unknown'
  }
}

// Axis States
export const AxisState = {
  UNDEFINED: 0,
  IDLE: 1,
  STARTUP_SEQUENCE: 2,
  FULL_CALIBRATION_SEQUENCE: 3,
  MOTOR_CALIBRATION: 4,
  SENSORLESS_CONTROL: 5,
  ENCODER_INDEX_SEARCH: 6,
  ENCODER_OFFSET_CALIBRATION: 7,
  CLOSED_LOOP_CONTROL: 8,
  LOCKIN_SPIN: 9,
  ENCODER_DIR_FIND: 10,
  HOMING: 11,
}

export const getAxisStateName = (state) => {
  switch (state) {
    case AxisState.UNDEFINED: return 'Undefined'
    case AxisState.IDLE: return 'Idle'
    case AxisState.STARTUP_SEQUENCE: return 'Startup Sequence'
    case AxisState.FULL_CALIBRATION_SEQUENCE: return 'Full Calibration'
    case AxisState.MOTOR_CALIBRATION: return 'Motor Calibration'
    case AxisState.SENSORLESS_CONTROL: return 'Sensorless Control'
    case AxisState.ENCODER_INDEX_SEARCH: return 'Encoder Index Search'
    case AxisState.ENCODER_OFFSET_CALIBRATION: return 'Encoder Offset Calibration'
    case AxisState.CLOSED_LOOP_CONTROL: return 'Closed Loop Control'
    case AxisState.LOCKIN_SPIN: return 'Lockin Spin'
    case AxisState.ENCODER_DIR_FIND: return 'Encoder Direction Find'
    case AxisState.HOMING: return 'Homing'
    default: return `Unknown (${state})`
  }
}

// GPIO Modes
export const GpioMode = {
  DIGITAL: 0,
  DIGITAL_PULL_UP: 1,
  DIGITAL_PULL_DOWN: 2,
  ANALOG_IN: 3,
  UART_A: 4,
  UART_B: 5,
  UART_C: 6,
  CAN_A: 7,
  CAN_B: 8,
  I2C: 9,
  SPI: 10,
  PWM: 11,
  ENC0: 12,
  ENC1: 13,
  ENC2: 14,
  MECH_BRAKE: 15,
}

export const getGpioModeName = (mode) => {
  const modes = {
    [GpioMode.DIGITAL]: 'Digital',
    [GpioMode.DIGITAL_PULL_UP]: 'Digital (Pull-up)',
    [GpioMode.DIGITAL_PULL_DOWN]: 'Digital (Pull-down)',
    [GpioMode.ANALOG_IN]: 'Analog Input',
    [GpioMode.UART_A]: 'UART A',
    [GpioMode.UART_B]: 'UART B',
    [GpioMode.UART_C]: 'UART C',
    [GpioMode.CAN_A]: 'CAN A',
    [GpioMode.CAN_B]: 'CAN B',
    [GpioMode.I2C]: 'I2C',
    [GpioMode.SPI]: 'SPI',
    [GpioMode.PWM]: 'PWM',
    [GpioMode.ENC0]: 'Encoder 0',
    [GpioMode.ENC1]: 'Encoder 1',
    [GpioMode.ENC2]: 'Encoder 2',
    [GpioMode.MECH_BRAKE]: 'Mechanical Brake',
  }
  return modes[mode] || `Unknown (${mode})`
}