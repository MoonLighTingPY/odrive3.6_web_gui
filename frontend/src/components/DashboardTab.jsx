import '../styles/DashboardTab.css'

function DashboardTab({ isConnected, odriveState }) {
  if (!isConnected) {
    return (
      <div className="dashboard-tab">
        <div className="not-connected">
          <h2>No ODrive Connected</h2>
          <p>Please connect to an ODrive device to view the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-tab">
      <h2>Dashboard</h2>
      <p>Dashboard functionality will be implemented here.</p>
      <div className="dashboard-placeholder">
        <div className="placeholder-item">Real-time motor position graphs</div>
        <div className="placeholder-item">Velocity monitoring</div>
        <div className="placeholder-item">Current consumption charts</div>
        <div className="placeholder-item">Temperature monitoring</div>
        <div className="placeholder-item">Error status indicators</div>
      </div>
    </div>
  )
}

export default DashboardTab