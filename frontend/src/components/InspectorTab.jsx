import '../styles/InspectorTab.css'

function InspectorTab({ isConnected, odriveState }) {
  if (!isConnected) {
    return (
      <div className="inspector-tab">
        <div className="not-connected">
          <h2>No ODrive Connected</h2>
          <p>Please connect to an ODrive device to inspect its state.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="inspector-tab">
      <h2>Inspector</h2>
      <p>Inspector functionality will be implemented here.</p>
      <div className="inspector-placeholder">
        <div className="placeholder-item">Variable tree browser</div>
        <div className="placeholder-item">Read/write individual parameters</div>
        <div className="placeholder-item">Command console</div>
        <div className="placeholder-item">Memory dump viewer</div>
        <div className="placeholder-item">Error log viewer</div>
      </div>
    </div>
  )
}

export default InspectorTab