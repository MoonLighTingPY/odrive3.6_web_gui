import { useState, useEffect } from 'react'
import '../styles/ConfigurationTab.css'

function ConfigurationTab({ isConnected, odriveState }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState({
    // Step 1: Power Source
    dc_bus_overvoltage_trip_level: 56.0,
    dc_bus_undervoltage_trip_level: 10.0,
    dc_max_positive_current: 10.0,
    dc_max_negative_current: -10.0,
    brake_resistance: 2.0,
    enable_brake_resistor: true,
    
    // Step 2: Motor Configuration
    motor_type: 0, // 0: HIGH_CURRENT, 2: GIMBAL
    pole_pairs: 7,
    kv_rating: 270,
    current_lim: 10.0,
    calibration_current: 10.0,
    resistance_calib_max_voltage: 4.0,
    calibration_lockin_current: 10.0,
    phase_resistance: 0.0,
    
    // Step 3: Encoder Configuration
    encoder_mode: 0, // 0: INCREMENTAL, 1: HALL, 2: SINCOS, 3: SPI_ABS_AMS, 4: SPI_ABS_CUI, 5: SPI_ABS_AEAT
    encoder_cpr: 4000,
    encoder_bandwidth: 1000,
    use_index: false,
    pre_calibrated: false,
    use_separate_commutation_encoder: false,
    commutation_encoder_cpr: 4000,
    
    // Step 4: Control Mode
    control_mode: 3, // 0: VOLTAGE, 1: CURRENT, 2: VELOCITY, 3: POSITION
    input_mode: 1, // 0: INACTIVE, 1: PASSTHROUGH, 2: VEL_RAMP, 3: POS_FILTER, 4: MIX_CHANNELS, 5: TRAP_TRAJ
    vel_limit: 20.0,
    pos_gain: 20.0,
    vel_gain: 0.1667,
    vel_integrator_gain: 0.3333,
    
    // Step 5: Interfaces
    can_node_id: 0,
    can_enabled: false,
    uart_baudrate: 115200,
    uart_enabled: true,
    enable_watchdog: false,
    watchdog_timeout: 0.0,
    gpio_mode: 0
  })
  
  const [commandPreview, setCommandPreview] = useState([])
  const [showCommandPreview, setShowCommandPreview] = useState(false)

  const steps = [
    { id: 1, name: 'Power Source', icon: '⚡' },
    { id: 2, name: 'Motor Config', icon: '⚙️' },
    { id: 3, name: 'Encoder Config', icon: '📏' },
    { id: 4, name: 'Control Mode', icon: '🎛️' },
    { id: 5, name: 'Interfaces', icon: '🔌' },
    { id: 6, name: 'Apply & Save', icon: '💾' }
  ]

  // Calculate motor parameters
  const calculateKt = () => {
    if (config.kv_rating > 0) {
      return (8.27 / config.kv_rating).toFixed(4)
    }
    return '0.0000'
  }

  const calculateCurrentLimitTorque = () => {
    const kt = parseFloat(calculateKt())
    return (config.current_lim * kt).toFixed(2)
  }

  const generateCommands = () => {
    const commands = []
    
    // Power source commands
    commands.push(`odrv0.config.dc_bus_overvoltage_trip_level = ${config.dc_bus_overvoltage_trip_level}`)
    commands.push(`odrv0.config.dc_bus_undervoltage_trip_level = ${config.dc_bus_undervoltage_trip_level}`)
    commands.push(`odrv0.config.dc_max_positive_current = ${config.dc_max_positive_current}`)
    commands.push(`odrv0.config.dc_max_negative_current = ${config.dc_max_negative_current}`)
    commands.push(`odrv0.config.brake_resistance = ${config.brake_resistance}`)
    
    // Motor configuration commands
    commands.push(`odrv0.axis0.motor.config.motor_type = ${config.motor_type}`)
    commands.push(`odrv0.axis0.motor.config.pole_pairs = ${config.pole_pairs}`)
    commands.push(`odrv0.axis0.motor.config.current_lim = ${config.current_lim}`)
    commands.push(`odrv0.axis0.motor.config.calibration_current = ${config.calibration_current}`)
    commands.push(`odrv0.axis0.motor.config.resistance_calib_max_voltage = ${config.resistance_calib_max_voltage}`)
    commands.push(`odrv0.axis0.config.calibration_lockin.current = ${config.calibration_lockin_current}`)
    
    if (config.motor_type === 2) { // GIMBAL motor
      commands.push(`odrv0.axis0.motor.config.phase_resistance = ${config.phase_resistance}`)
    }
    
    // Encoder configuration commands
    commands.push(`odrv0.axis0.encoder.config.mode = ${config.encoder_mode}`)
    commands.push(`odrv0.axis0.encoder.config.cpr = ${config.encoder_cpr}`)
    commands.push(`odrv0.axis0.encoder.config.bandwidth = ${config.encoder_bandwidth}`)
    commands.push(`odrv0.axis0.encoder.config.use_index = ${config.use_index}`)
    commands.push(`odrv0.axis0.encoder.config.pre_calibrated = ${config.pre_calibrated}`)
    
    // Control mode commands
    commands.push(`odrv0.axis0.controller.config.control_mode = ${config.control_mode}`)
    commands.push(`odrv0.axis0.controller.config.input_mode = ${config.input_mode}`)
    commands.push(`odrv0.axis0.controller.config.vel_limit = ${config.vel_limit}`)
    commands.push(`odrv0.axis0.controller.config.pos_gain = ${config.pos_gain}`)
    commands.push(`odrv0.axis0.controller.config.vel_gain = ${config.vel_gain}`)
    commands.push(`odrv0.axis0.controller.config.vel_integrator_gain = ${config.vel_integrator_gain}`)
    
    // Interface commands
    if (config.can_enabled) {
      commands.push(`odrv0.axis0.config.can.node_id = ${config.can_node_id}`)
    }
    
    return commands
  }

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyConfiguration = async () => {
    const commands = generateCommands()
    setCommandPreview(commands)
    
    try {
      const response = await fetch('/api/odrive/apply_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands })
      })
      
      if (response.ok) {
        alert('Configuration applied successfully!')
      } else {
        alert('Failed to apply configuration')
      }
    } catch (error) {
      console.error('Failed to apply configuration:', error)
      alert('Failed to apply configuration')
    }
  }

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/odrive/save_config', {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Configuration saved to non-volatile memory!')
      } else {
        alert('Failed to save configuration')
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
      alert('Failed to save configuration')
    }
  }

  const handleCalibrate = async () => {
    try {
      const response = await fetch('/api/odrive/calibrate', {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Calibration started!')
      } else {
        alert('Failed to start calibration')
      }
    } catch (error) {
      console.error('Failed to start calibration:', error)
      alert('Failed to start calibration')
    }
  }

  const handleEraseAndReboot = async () => {
    if (window.confirm('This will erase all configuration and reboot the ODrive. Continue?')) {
      try {
        const response = await fetch('/api/odrive/erase_config', {
          method: 'POST'
        })
        
        if (response.ok) {
          alert('Configuration erased and ODrive rebooted!')
        } else {
          alert('Failed to erase configuration')
        }
      } catch (error) {
        console.error('Failed to erase configuration:', error)
        alert('Failed to erase configuration')
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="configuration-tab">
        <div className="not-connected">
          <h2>No ODrive Connected</h2>
          <p>Please connect to an ODrive device to configure it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="configuration-tab">
      <div className="step-nav">
        {steps.map(step => (
          <button
            key={step.id}
            className={`step-button ${currentStep === step.id ? 'active' : ''}`}
            onClick={() => setCurrentStep(step.id)}
          >
            <span className="step-icon">{step.icon}</span>
            <span className="step-name">{step.name}</span>
          </button>
        ))}
      </div>

      <div className="step-content">
        {currentStep === 1 && (
          <div className="step-panel">
            <h2>Step 1: Power Source Configuration</h2>
            <div className="config-grid">
              <div className="config-group">
                <label>DC Bus Overvoltage Trip Level (V)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.dc_bus_overvoltage_trip_level}
                  onChange={(e) => handleConfigChange('dc_bus_overvoltage_trip_level', parseFloat(e.target.value))}
                />
                <span className="help-text">Voltage level at which ODrive will trip to protect against overvoltage</span>
              </div>
              
              <div className="config-group">
                <label>DC Bus Undervoltage Trip Level (V)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.dc_bus_undervoltage_trip_level}
                  onChange={(e) => handleConfigChange('dc_bus_undervoltage_trip_level', parseFloat(e.target.value))}
                />
                <span className="help-text">Voltage level at which ODrive will trip to protect against undervoltage</span>
              </div>
              
              <div className="config-group">
                <label>DC Max Positive Current (A)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.dc_max_positive_current}
                  onChange={(e) => handleConfigChange('dc_max_positive_current', parseFloat(e.target.value))}
                />
                <span className="help-text">Maximum positive current allowed on the DC bus</span>
              </div>
              
              <div className="config-group">
                <label>DC Max Negative Current (A)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.dc_max_negative_current}
                  onChange={(e) => handleConfigChange('dc_max_negative_current', parseFloat(e.target.value))}
                />
                <span className="help-text">Maximum negative current allowed on the DC bus</span>
              </div>
              
              <div className="config-group">
                <label>Brake Resistance (Ω)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.brake_resistance}
                  onChange={(e) => handleConfigChange('brake_resistance', parseFloat(e.target.value))}
                />
                <span className="help-text">Resistance of the brake resistor</span>
              </div>
              
              <div className="config-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.enable_brake_resistor}
                    onChange={(e) => handleConfigChange('enable_brake_resistor', e.target.checked)}
                  />
                  Enable Brake Resistor
                </label>
                <span className="help-text">Enable the brake resistor for regenerative braking</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-panel">
            <h2>Step 2: Motor Configuration</h2>
            <div className="config-grid">
              <div className="config-group">
                <label>Motor Type</label>
                <select
                  value={config.motor_type}
                  onChange={(e) => handleConfigChange('motor_type', parseInt(e.target.value))}
                >
                  <option value={0}>High Current</option>
                  <option value={2}>Gimbal</option>
                </select>
                <span className="help-text">Type of motor connected to the ODrive</span>
              </div>
              
              <div className="config-group">
                <label>Pole Pairs</label>
                <input
                  type="number"
                  value={config.pole_pairs}
                  onChange={(e) => handleConfigChange('pole_pairs', parseInt(e.target.value))}
                />
                <span className="help-text">Number of pole pairs in the motor</span>
              </div>
              
              <div className="config-group">
                <label>Motor KV Rating (RPM/V)</label>
                <input
                  type="number"
                  value={config.kv_rating}
                  onChange={(e) => handleConfigChange('kv_rating', parseFloat(e.target.value))}
                />
                <span className="help-text">Motor KV rating in RPM per volt</span>
              </div>
              
              <div className="config-group">
                <label>Current Limit (A)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.current_lim}
                  onChange={(e) => handleConfigChange('current_lim', parseFloat(e.target.value))}
                />
                <span className="help-text">Maximum current allowed for the motor</span>
              </div>
              
              <div className="config-group">
                <label>Motor Calibration Current (A)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.calibration_current}
                  onChange={(e) => handleConfigChange('calibration_current', parseFloat(e.target.value))}
                />
                <span className="help-text">Current used for motor calibration</span>
              </div>
              
              <div className="config-group">
                <label>Motor Calib Voltage (V)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.resistance_calib_max_voltage}
                  onChange={(e) => handleConfigChange('resistance_calib_max_voltage', parseFloat(e.target.value))}
                />
                <span className="help-text">Maximum voltage used during motor resistance calibration</span>
              </div>
              
              <div className="config-group">
                <label>Lock-in Spin Current (A)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.calibration_lockin_current}
                  onChange={(e) => handleConfigChange('calibration_lockin_current', parseFloat(e.target.value))}
                />
                <span className="help-text">Current used during calibration lock-in phase</span>
              </div>
              
              {config.motor_type === 2 && (
                <div className="config-group">
                  <label>Phase Resistance (Ω)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={config.phase_resistance}
                    onChange={(e) => handleConfigChange('phase_resistance', parseFloat(e.target.value))}
                  />
                  <span className="help-text">Phase resistance for gimbal motors</span>
                </div>
              )}
              
              <div className="calculated-values">
                <h3>Calculated Values</h3>
                <div className="calc-grid">
                  <div className="calc-item">
                    <label>Calculated KT (Nm/A):</label>
                    <span>{calculateKt()}</span>
                  </div>
                  <div className="calc-item">
                    <label>Current Limit Torque (Nm):</label>
                    <span>{calculateCurrentLimitTorque()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-panel">
            <h2>Step 3: Encoder Configuration</h2>
            <div className="config-grid">
              <div className="config-group">
                <label>Encoder Type</label>
                <select
                  value={config.encoder_mode}
                  onChange={(e) => handleConfigChange('encoder_mode', parseInt(e.target.value))}
                >
                  <option value={0}>Incremental</option>
                  <option value={1}>Hall Effect</option>
                  <option value={2}>SinCos</option>
                  <option value={3}>SPI Absolute (AMS)</option>
                  <option value={4}>SPI Absolute (CUI)</option>
                  <option value={5}>SPI Absolute (AEAT)</option>
                </select>
                <span className="help-text">Type of encoder connected</span>
              </div>
              
              <div className="config-group">
                <label>Encoder CPR</label>
                <input
                  type="number"
                  value={config.encoder_cpr}
                  onChange={(e) => handleConfigChange('encoder_cpr', parseInt(e.target.value))}
                />
                <span className="help-text">Counts per revolution of the encoder</span>
              </div>
              
              <div className="config-group">
                <label>Encoder Bandwidth (Hz)</label>
                <input
                  type="number"
                  value={config.encoder_bandwidth}
                  onChange={(e) => handleConfigChange('encoder_bandwidth', parseFloat(e.target.value))}
                />
                <span className="help-text">Bandwidth of the encoder filter</span>
              </div>
              
              <div className="config-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.use_index}
                    onChange={(e) => handleConfigChange('use_index', e.target.checked)}
                  />
                  Use Index Signal
                </label>
                <span className="help-text">Use encoder index signal for absolute positioning</span>
              </div>
              
              <div className="config-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.pre_calibrated}
                    onChange={(e) => handleConfigChange('pre_calibrated', e.target.checked)}
                  />
                  Pre-calibrated
                </label>
                <span className="help-text">Skip encoder calibration if already calibrated</span>
              </div>
              
              <div className="config-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.use_separate_commutation_encoder}
                    onChange={(e) => handleConfigChange('use_separate_commutation_encoder', e.target.checked)}
                  />
                  Use Separate Commutation Encoder
                </label>
                <span className="help-text">Use a separate encoder for motor commutation</span>
              </div>
              
              {config.use_separate_commutation_encoder && (
                <div className="config-group">
                  <label>Commutation Encoder CPR</label>
                  <input
                    type="number"
                    value={config.commutation_encoder_cpr}
                    onChange={(e) => handleConfigChange('commutation_encoder_cpr', parseInt(e.target.value))}
                  />
                  <span className="help-text">CPR of the commutation encoder</span>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-panel">
            <h2>Step 4: Control Mode Configuration</h2>
            <div className="config-grid">
              <div className="config-group">
                <label>Control Mode</label>
                <select
                  value={config.control_mode}
                  onChange={(e) => handleConfigChange('control_mode', parseInt(e.target.value))}
                >
                  <option value={0}>Voltage Control</option>
                  <option value={1}>Current Control</option>
                  <option value={2}>Velocity Control</option>
                  <option value={3}>Position Control</option>
                </select>
                <span className="help-text">Primary control mode for the motor</span>
              </div>
              
              <div className="config-group">
                <label>Input Mode</label>
                <select
                  value={config.input_mode}
                  onChange={(e) => handleConfigChange('input_mode', parseInt(e.target.value))}
                >
                  <option value={0}>Inactive</option>
                  <option value={1}>Passthrough</option>
                  <option value={2}>Velocity Ramp</option>
                  <option value={3}>Position Filter</option>
                  <option value={4}>Mix Channels</option>
                  <option value={5}>Trap Trajectory</option>
                </select>
                <span className="help-text">Input processing mode</span>
              </div>
              
              <div className="config-group">
                <label>Velocity Limit (counts/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.vel_limit}
                  onChange={(e) => handleConfigChange('vel_limit', parseFloat(e.target.value))}
                />
                <span className="help-text">Maximum velocity allowed</span>
              </div>
              
              <div className="config-group">
                <label>Position Gain</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.pos_gain}
                  onChange={(e) => handleConfigChange('pos_gain', parseFloat(e.target.value))}
                />
                <span className="help-text">Position control loop gain</span>
              </div>
              
              <div className="config-group">
                <label>Velocity Gain</label>
                <input
                  type="number"
                  step="0.0001"
                  value={config.vel_gain}
                  onChange={(e) => handleConfigChange('vel_gain', parseFloat(e.target.value))}
                />
                <span className="help-text">Velocity control loop gain</span>
              </div>
              
              <div className="config-group">
                <label>Velocity Integrator Gain</label>
                <input
                  type="number"
                  step="0.0001"
                  value={config.vel_integrator_gain}
                  onChange={(e) => handleConfigChange('vel_integrator_gain', parseFloat(e.target.value))}
                />
                <span className="help-text">Velocity control integrator gain</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="step-panel">
            <h2>Step 5: Interface Configuration</h2>
            <div className="config-grid">
              <div className="config-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.can_enabled}
                    onChange={(e) => handleConfigChange('can_enabled', e.target.checked)}
                  />
                  Enable CAN Bus
                </label>
                <span className="help-text">Enable CAN bus communication</span>
              </div>
              
              {config.can_enabled && (
                <div className="config-group">
                  <label>CAN Node ID</label>
                  <input
                    type="number"
                    min="0"
                    max="63"
                    value={config.can_node_id}
                    onChange={(e) => handleConfigChange('can_node_id', parseInt(e.target.value))}
                  />
                  <span className="help-text">CAN node ID (0-63)</span>
                </div>
              )}
              
              <div className="config-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.uart_enabled}
                    onChange={(e) => handleConfigChange('uart_enabled', e.target.checked)}
                  />
                  Enable UART
                </label>
                <span className="help-text">Enable UART communication</span>
              </div>
              
              {config.uart_enabled && (
                <div className="config-group">
                  <label>UART Baudrate</label>
                  <select
                    value={config.uart_baudrate}
                    onChange={(e) => handleConfigChange('uart_baudrate', parseInt(e.target.value))}
                  >
                    <option value={9600}>9600</option>
                    <option value={19200}>19200</option>
                    <option value={38400}>38400</option>
                    <option value={57600}>57600</option>
                    <option value={115200}>115200</option>
                    <option value={230400}>230400</option>
                    <option value={460800}>460800</option>
                    <option value={921600}>921600</option>
                  </select>
                  <span className="help-text">UART communication speed</span>
                </div>
              )}
              
              <div className="config-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.enable_watchdog}
                    onChange={(e) => handleConfigChange('enable_watchdog', e.target.checked)}
                  />
                  Enable Watchdog Timer
                </label>
                <span className="help-text">Enable watchdog timer for safety</span>
              </div>
              
              {config.enable_watchdog && (
                <div className="config-group">
                  <label>Watchdog Timeout (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.watchdog_timeout}
                    onChange={(e) => handleConfigChange('watchdog_timeout', parseFloat(e.target.value))}
                  />
                  <span className="help-text">Watchdog timeout in seconds</span>
                </div>
              )}
              
              <div className="config-group">
                <label>GPIO Mode</label>
                <select
                  value={config.gpio_mode}
                  onChange={(e) => handleConfigChange('gpio_mode', parseInt(e.target.value))}
                >
                  <option value={0}>Digital</option>
                  <option value={1}>Digital Pull-up</option>
                  <option value={2}>Digital Pull-down</option>
                  <option value={3}>Analog In</option>
                  <option value={4}>UART A</option>
                  <option value={5}>UART B</option>
                </select>
                <span className="help-text">GPIO pin configuration mode</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="step-panel">
            <h2>Step 6: Apply Configuration & Calibration</h2>
            
            <div className="action-buttons">
              <button 
                className="action-button danger"
                onClick={handleEraseAndReboot}
              >
                🗑️ Erase Old Configuration and Reboot
              </button>
              
              <div className="apply-config-section">
                <button 
                  className="action-button primary"
                  onClick={() => {
                    setCommandPreview(generateCommands())
                    setShowCommandPreview(!showCommandPreview)
                  }}
                >
                  👁️ Preview Commands
                </button>
                
                <button 
                  className="action-button primary"
                  onClick={handleApplyConfiguration}
                >
                  ⚡ Apply New Configuration
                </button>
              </div>
              
              <button 
                className="action-button success"
                onClick={handleSaveConfig}
              >
                💾 Save to Non-Volatile Memory and Reboot
              </button>
              
              <button 
                className="action-button warning"
                onClick={handleCalibrate}
              >
                🎯 Calibrate
              </button>
              
              <button 
                className="action-button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/odrive/save_config_only', {
                      method: 'POST'
                    })
                    if (response.ok) {
                      alert('Configuration saved to non-volatile memory!')
                    }
                  } catch (error) {
                    console.error('Failed to save configuration:', error)
                  }
                }}
              >
                💾 Save to Non-Volatile Memory
              </button>
            </div>
            
            {showCommandPreview && (
              <div className="command-preview">
                <h3>Commands to be executed:</h3>
                <div className="command-list">
                  {commandPreview.map((command, index) => (
                    <div key={index} className="command-item">{command}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-navigation">
        <button 
          className="nav-button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          ← Previous
        </button>
        
        <span className="step-indicator">
          Step {currentStep} of {steps.length}
        </span>
        
        <button 
          className="nav-button"
          disabled={currentStep === steps.length}
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default ConfigurationTab