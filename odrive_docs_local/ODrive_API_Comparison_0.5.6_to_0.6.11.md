
# ODrive API Differences: v0.5.6 → v0.6.11

This document provides a **comprehensive comparison** between ODrive firmware API versions **0.5.6** and **0.6.11**. It includes all known changes, additions, removals, and deprecations.

---

## 🆕 New Features in 0.6.x

### 🔧 New Methods in `ODrive` Class
| Method | Description |
|--------|-------------|
| `test_function(delta)` | Test function accepting a delta parameter. |
| `get_adc_voltage(gpio)` | Reads ADC voltage from a specified GPIO. |
| `enter_dfu_mode2()` | Enters experimental DFU mode via CAN. |
| `disable_bootloader()` | Disables bootloader (useful for downgrades). |
| `identify_once()` | Blinks the LED once (for identifying devices). |
| `get_interrupt_status(irqn)` | Returns status of specified interrupt. |
| `get_dma_status(stream_num)` | Returns DMA stream information. |
| `set_gpio(num, status)` | Sets a GPIO's state (experimental). |
| `get_raw_8(address)` / `get_raw_32` / `get_raw_256` | Raw memory access for diagnostics. |

### 📊 New Properties in `ODrive`
| Property | Description |
|----------|-------------|
| `ibus_report_filter_k` | Filter gain for smoother `ibus` reporting. |
| `control_loop_hz` | Control loop frequency. |
| `bootloader_version` | Version of the installed bootloader. |
| `task_timers_armed` | Indicates profiler trigger. |
| `test_property` | Developer-use property. |
| `reboot_required` | Indicates if reboot is pending. |
| `identify` | LED identify toggle. |
| `issues`, `auth` | Experimental diagnostic and authentication interfaces. |

### 🧪 New Subsystems / Experimental Interfaces
- `ODrive.Auth`
- `ODrive.Issues`
- `ODrive.Debug`
- `ODrive.HistogramLogger`
- `ODrive.CircularLog`

### 🧰 New Substructures and Support Classes
- `ODrive.Endpoint`
- `ODrive.Mapper`
- `ODrive.Interpolator`
- `ODrive.MechanicalBrake`

### ⚙️ Motor & Brake Enhancements
| Property | Description |
|----------|-------------|
| `torque_estimate`, `mechanical_power`, `electrical_power`, `loss_power` | New power-related signals. |
| `effective_current_lim` | Internally computed current limit. |
| `additional_duty` | Additional brake resistor duty cycle. |
| `current_meas_status` | Status code for current measurement. |

### 🧭 Axis-Level Enhancements
| Property | Description |
|----------|-------------|
| `observed_encoder_scale_factor` | Debugging for encoder-motor mismatch. |
| `disarm_time`, `detailed_disarm_reason` | Enhanced diagnostics. |
| `procedure_result` | Standardized status response. |

### 📉 Harmonic Compensation
- `calib_vel`, `calib_turns`, `calib_settling_delay`
- `cosx_coef`, `sinx_coef`, `cos2x_coef`, `sin2x_coef`

### 🔄 Anticogging Enhancements
| Property | Description |
|----------|-------------|
| `calib_start_vel`, `calib_end_vel` | Fine-tuned calibration control. |
| `calib_bidirectional` | Run calibration in both directions. |
| `calib_coarse_integrator_gain` | Fine gain settings for calibration. |

---

## 🔁 Changed Behavior and APIs

### `clear_errors()`
- Now clears `disarm_reason` and `procedure_result`
- Re-arms brake resistor if needed

### `ODrive.Axis.set_abs_pos(pos)`
- ❗ **Deprecated**: Use `pos_estimate` instead

### Brake Resistor Configuration Changes
- New ramping logic: `enable_dc_bus_voltage_feedback`, `dc_bus_voltage_feedback_ramp_start`, `dc_bus_voltage_feedback_ramp_end`

### CAN Interface
- Added properties: `n_restarts`, `n_rx`, `effective_baudrate`

---

## 🗃️ New Configurations in `ODrive.Config`

| Property | Description |
|----------|-------------|
| `user_config_0` → `user_config_7` | General purpose persistent user storage |
| `dc_max_positive_current`, `dc_max_negative_current` | Power supply current constraints |
| `enable_uart_a`, `uart_a_baudrate` | UART configuration expanded |
| `usb_cdc_protocol`, `uart0_protocol` | Protocol selection per interface |

---

## 🧼 Removed or Deprecated Items

| Item | Status |
|------|--------|
| `ODrive.Axis.set_abs_pos()` | Deprecated |
| `config.enable_can_a` | Removed |
| `config.can.is_extended` | Removed |
| `brake_resistor0.is_saturated` | Renamed to `was_saturated` |
| `min_endstop.endstop_state` | Renamed to `min_endstop.state` (and same for max) |
| `amt21_encoder_group0` | Replaced by `rs485_encoder_group0` |

---

## 🧭 Endpoint & Structural Changes

### Added or Reorganized Axis Substructures
- `pos_vel_mapper`
- `commutation_mapper`
- `interpolator`
- `mechanical_brake`
- `enable_pin` (now exposed)

---

## 📌 Summary

- ✅ Major API expansion in 0.6.x for diagnostics, CAN, DFU, and encoder support
- ❗ A few deprecated and removed fields requiring migration attention
- 🔁 Existing APIs refined for reliability, especially around error reporting and position setting

Please refer to the official documentation or ODrive GitHub for specific implementation notes and firmware compatibility concerns.
