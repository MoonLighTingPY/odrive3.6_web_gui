import { useState, useEffect } from 'react'
import '../styles/DeviceList.css'

function DeviceList({ connectedDevice, isConnected, onConnect, onDisconnect, odriveState }) {
  const [availableDevices, setAvailableDevices] = useState([])
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    scanForDevices()
  }, [])

  const scanForDevices = async () => {
    setIsScanning(true)
    try {
      const response = await fetch('/api/odrive/scan')
      if (response.ok) {
        const devices = await response.json()
        setAvailableDevices(devices)
      }
    } catch (error) {
      console.error('Failed to scan for devices:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const getAxisStateText = (state) => {
    const states = {
      0: 'UNDEFINED',
      1: 'IDLE',
      2: 'STARTUP_SEQUENCE',
      3: 'FULL_CALIBRATION_SEQUENCE',
      4: 'MOTOR_CALIBRATION',
      5: 'SENSORLESS_CONTROL',
      6: 'ENCODER_INDEX_SEARCH',
      7: 'ENCODER_OFFSET_CALIBRATION',
      8: 'CLOSED_LOOP_CONTROL'
    }
    return states[state] || 'UNKNOWN'
  }

  return (
    <div className="device-list">
      <div className="device-list-header">
        <h3>ODrive Devices</h3>
        <button 
          className="scan-button"
          onClick={scanForDevices}
          disabled={isScanning}
        >
          {isScanning ? 'Scanning...' : 'Scan'}
        </button>
      </div>

      <div className="devices">
        {availableDevices.length === 0 ? (
          <div className="no-devices">No devices found</div>
        ) : (
          availableDevices.map((device, index) => (
            <div 
              key={index}
              className={`device ${connectedDevice?.serial === device.serial ? 'connected' : ''}`}
            >
              <div className="device-info">
                <div className="device-name">{device.name || `ODrive ${device.serial}`}</div>
                <div className="device-serial">Serial: {device.serial}</div>
                <div className="device-fw">FW: {device.fw_version || 'v0.5.6'}</div>
              </div>
              
              {connectedDevice?.serial === device.serial ? (
                <button 
                  className="disconnect-button"
                  onClick={onDisconnect}
                >
                  Disconnect
                </button>
              ) : (
                <button 
                  className="connect-button"
                  onClick={() => onConnect(device)}
                >
                  Connect
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {isConnected && odriveState && (
        <div className="device-status">
          <h4>Device Status</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="label">DC Bus Voltage:</span>
              <span className="value">{(odriveState.vbus_voltage || 0).toFixed(2)}V</span>
            </div>
            <div className="status-item">
              <span className="label">DC Bus Current:</span>
              <span className="value">{(odriveState.ibus || 0).toFixed(2)}A</span>
            </div>
            <div className="status-item">
              <span className="label">Axis 0 State:</span>
              <span className="value">{getAxisStateText(odriveState.axis0_state)}</span>
            </div>
            <div className="status-item">
              <span className="label">Axis 1 State:</span>
              <span className="value">{getAxisStateText(odriveState.axis1_state)}</span>
            </div>
            {odriveState.axis0_error && (
              <div className="status-item error">
                <span className="label">Axis 0 Error:</span>
                <span className="value">0x{odriveState.axis0_error.toString(16)}</span>
              </div>
            )}
            {odriveState.axis1_error && (
              <div className="status-item error">
                <span className="label">Axis 1 Error:</span>
                <span className="value">0x{odriveState.axis1_error.toString(16)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviceList