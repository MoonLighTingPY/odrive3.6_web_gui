class AxisState:
    UNDEFINED = 0
    IDLE = 1
    STARTUP_SEQUENCE = 2
    FULL_CALIBRATION_SEQUENCE = 3
    MOTOR_CALIBRATION = 4
    SENSORLESS_CONTROL = 5
    ENCODER_INDEX_SEARCH = 6
    ENCODER_OFFSET_CALIBRATION = 7
    CLOSED_LOOP_CONTROL = 8

class MotorType(Enum):
    HIGH_CURRENT = 0
    GIMBAL = 2

class ControlMode(Enum):
    VOLTAGE_CONTROL = 0
    CURRENT_CONTROL = 1
    VELOCITY_CONTROL = 2
    POSITION_CONTROL = 3

class InputMode(Enum):
    INACTIVE = 0
    PASSTHROUGH = 1
    VEL_RAMP = 2
    POS_FILTER = 3
    MIX_CHANNELS = 4
    TRAP_TRAJ = 5
    

class EncoderId(Enum):
    NONE = 0
    ENCODER_0 = 1
    ENCODER_1 = 2
    



settings = {
            "config.brake_resistance": {"value": 2.0, "unit": "Ω", "name": "Brake Resistance", "info": "The resistance of the brake resistor."},
            "config.dc_bus_overvoltage_trip_level": {"value": 56.0, "unit": "V", "name": "DC Bus Overvoltage Trip Level", "info": "The voltage level at which the ODrive will trip to protect against overvoltage."},
            "config.dc_bus_undervoltage_trip_level": {"value": 10.0, "unit": "V", "name": "DC Bus Undervoltage Trip Level", "info": "The voltage level at which the ODrive will trip to protect against undervoltage."},
            "config.dc_max_positive_current": {"value": 10.0, "unit": "A", "name": "Maximum Positive Current", "info": "The maximum positive current allowed on the DC bus."},
            "config.dc_max_negative_current": {"value": -10.0, "unit": "A", "name": "Maximum Negative Current", "info": "The maximum negative current allowed on the DC bus."},
            "axis0.motor.config.motor_type": {"value": 0, "unit": "", "name": "Motor Type", "info": "The type of motor connected to axis 0."},
            "axis0.motor.config.pole_pairs": {"value": 7, "unit": "", "name": "Motor Pole Pairs", "info": "The number of pole pairs in the motor."},
            "axis0.motor.config.resistance_calib_max_voltage": {"value": 4.0, "unit": "V", "name": "Motor Resistance Calib Max Voltage", "info": "The maximum voltage used during motor resistance calibration."},
            "axis0.motor.config.calibration_current": {"value": 10.0, "unit": "A", "name": "Motor Calibration Current", "info": "The current used for motor calibration."},
            "axis0.motor.config.current_lim": {"value": 10.0, "unit": "A", "name": "Motor Current Limit", "info": "The current limit for the motor."},
            "axis0.controller.config.control_mode": {"value": 3, "unit": "", "name": "Controller Control Mode", "info": "The control mode of the controller for axis 0."},
            "axis0.controller.config.input_mode": {"value": 1, "unit": "", "name": "Controller Input Mode", "info": "The input mode of the controller for axis 0."},
            "axis0.controller.config.vel_limit": {"value": 20, "unit": "counts/s", "name": "Velocity Limit", "info": "The velocity limit for the controller."},
            "axis0.encoder.config.mode": {"value": 0, "unit": "", "name": "Encoder Mode", "info": "The encoder mode for axis 0."},
            "axis0.encoder.config.cpr": {"value": 4000, "unit": "counts", "name": "Encoder CPR", "info": "The counts per revolution of the encoder."},
            "axis0.encoder.config.bandwidth": {"value": 1000, "unit": "Hz", "name": "Encoder Bandwidth", "info": "The bandwidth of the encoder for axis 0."},
            "axis0.controller.config.pos_gain": {"value": 20.0, "unit": "", "name": "Position Gain", "info": "The position gain for the controller."},
            "axis0.controller.config.vel_gain": {"value": 0.1667, "unit": "", "name": "Velocity Gain", "info": "The velocity gain for the controller."},
            "axis0.controller.config.vel_integrator_gain": {"value": 0.3333, "unit": "", "name": "Velocity Integrator Gain", "info": "The velocity integrator gain for the controller."},
            # Fixed parameter paths for v0.5.6
            "axis0.motor.config.torque_constant": {"value": 0.04, "unit": "Nm/A", "name": "Torque Constant", "info": "Motor torque constant in Nm/A."},
            "axis0.config.calibration_lockin.current": {"value": 10.0, "unit": "A", "name": "Lock-in Spin Current", "info": "Current used during calibration lock-in phase."},
            # Corrected thermistor parameters for v0.5.6
            "axis0.motor.motor_thermistor.config.enabled": {"value": False, "unit": "", "name": "Motor Thermistor Enabled", "info": "Enable motor thermistor temperature monitoring."},
            "axis0.motor.motor_thermistor.config.gpio_pin": {"value": 4, "unit": "", "name": "Thermistor GPIO Pin", "info": "GPIO pin used for thermistor (e.g., 4 for GPIO4)."},
            "axis0.motor.motor_thermistor.config.poly_coefficient_0": {"value": 0.0, "unit": "", "name": "Poly Coefficient 0", "info": "Polynomial coefficient 0 for thermistor calculation."},
            "axis0.motor.motor_thermistor.config.poly_coefficient_1": {"value": 0.0, "unit": "", "name": "Poly Coefficient 1", "info": "Polynomial coefficient 1 for thermistor calculation."},
            "axis0.motor.motor_thermistor.config.poly_coefficient_2": {"value": 0.0, "unit": "", "name": "Poly Coefficient 2", "info": "Polynomial coefficient 2 for thermistor calculation."},
            "axis0.motor.motor_thermistor.config.poly_coefficient_3": {"value": 0.0, "unit": "", "name": "Poly Coefficient 3", "info": "Polynomial coefficient 3 for thermistor calculation."},
            "axis0.motor.motor_thermistor.config.temp_limit_lower": {"value": 80.0, "unit": "°C", "name": "Temp Limit Lower", "info": "Lower temperature limit - current limiting starts."},
            "axis0.motor.motor_thermistor.config.temp_limit_upper": {"value": 100.0, "unit": "°C", "name": "Temp Limit Upper", "info": "Upper temperature limit - motor stops."},
            # FET thermistor limits (read-only temperatures, configurable limits)
            "axis0.motor.fet_thermistor.config.temp_limit_lower": {"value": 80.0, "unit": "°C", "name": "FET Temp Limit Lower", "info": "FET lower temperature limit - current limiting starts."},
            "axis0.motor.fet_thermistor.config.temp_limit_upper": {"value": 100.0, "unit": "°C", "name": "FET Temp Limit Upper", "info": "FET upper temperature limit - motor stops."},
}