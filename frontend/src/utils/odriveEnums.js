// ODrive v0.5.6 Enums and Constants

export const MotorType = {
  HIGH_CURRENT: 0,
  GIMBAL: 2,
}

export const ControlMode = {
  VOLTAGE_CONTROL: 0,
  CURRENT_CONTROL: 1, 
  VELOCITY_CONTROL: 2,
  POSITION_CONTROL: 3,
}

export const InputMode = {
  INACTIVE: 0,
  PASSTHROUGH: 1,
  VEL_RAMP: 2,
  POS_FILTER: 3,
  MIX_CHANNELS: 4,
  TRAP_TRAJ: 5,
}

export const EncoderMode = {
  INCREMENTAL: 0,
  HALL: 1,
  SINCOS: 2,
  SPI_ABS_CUI: 256,
  SPI_ABS_AMS: 257,
  SPI_ABS_AEAT: 258,
}

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
}

export const GPIOMode = {
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
}

export const getMotorTypeName = (value) => {
  const names = { 0: 'High Current', 2: 'Gimbal' }
  return names[value] || 'Unknown'
}

export const getControlModeName = (value) => {
  const names = { 
    0: 'Voltage Control', 
    1: 'Current Control', 
    2: 'Velocity Control', 
    3: 'Position Control' 
  }
  return names[value] || 'Unknown'
}

export const getInputModeName = (value) => {
  const names = { 
    0: 'Inactive', 
    1: 'Passthrough', 
    2: 'Vel Ramp', 
    3: 'Pos Filter', 
    4: 'Mix Channels', 
    5: 'Trap Traj' 
  }
  return names[value] || 'Unknown'
}

export const getEncoderModeName = (value) => {
  const names = { 
    0: 'Incremental', 
    1: 'Hall Effect', 
    2: 'SinCos',
    256: 'SPI ABS CUI',
    257: 'SPI ABS AMS', 
    258: 'SPI ABS AEAT'
  }
  return names[value] || 'Unknown'
}

export const getAxisStateName = (value) => {
  const names = {
    0: 'Undefined',
    1: 'Idle',
    2: 'Startup Sequence',
    3: 'Full Calibration',
    4: 'Motor Calibration',
    5: 'Sensorless Control',
    6: 'Encoder Index Search',
    7: 'Encoder Offset Calibration',
    8: 'Closed Loop Control'
  }
  return names[value] || 'Unknown'
}