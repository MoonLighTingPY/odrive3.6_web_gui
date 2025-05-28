import { useState, useEffect } from 'react'
import './App.css'
import DeviceList from './components/DeviceList'
import ConfigurationTab from './components/ConfigurationTab'
import DashboardTab from './components/DashboardTab.jsx'
import InspectorTab from './components/InspectorTab'

function App() {
  const [activeTab, setActiveTab] = useState('configuration')
  const [connectedDevice, setConnectedDevice] = useState(null)
  const [odriveState, setOdriveState] = useState({})
  const [isConnected, setIsConnected] = useState(false)

  const tabs = [
    { id: 'configuration', name: 'Configuration' },
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'inspector', name: 'Inspector' }
  ]

  useEffect(() => {
    // Poll ODrive state when connected
    if (isConnected) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/odrive/state')
          if (response.ok) {
            const state = await response.json()
            setOdriveState(state)
          }
        } catch (error) {
          console.error('Failed to fetch ODrive state:', error)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isConnected])

  const handleDeviceConnect = async (device) => {
    try {
      const response = await fetch('/api/odrive/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device })
      })
      
      if (response.ok) {
        setConnectedDevice(device)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Failed to connect to ODrive:', error)
    }
  }

  const handleDeviceDisconnect = async () => {
    try {
      await fetch('/api/odrive/disconnect', { method: 'POST' })
      setConnectedDevice(null)
      setIsConnected(false)
      setOdriveState({})
    } catch (error) {
      console.error('Failed to disconnect from ODrive:', error)
    }
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>ODrive GUI v0.5.6</h2>
        <DeviceList 
          connectedDevice={connectedDevice}
          isConnected={isConnected}
          onConnect={handleDeviceConnect}
          onDisconnect={handleDeviceDisconnect}
          odriveState={odriveState}
        />
      </div>
      
      <div className="main-content">
        <nav className="tab-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        
        <div className="tab-content">
          {activeTab === 'configuration' && (
            <ConfigurationTab 
              isConnected={isConnected}
              odriveState={odriveState}
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              isConnected={isConnected}
              odriveState={odriveState}
            />
          )}
          {activeTab === 'inspector' && (
            <InspectorTab 
              isConnected={isConnected}
              odriveState={odriveState}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App