import './RouteList.css'

function RouteList({ route }) {
  if (!route || !route.bars) return null

  return (
    <div className="route-list">
      <div className="route-header">
        <h2>✨ Optimized Route</h2>
        <div className="total-time">
          <span className="time-label">Total Walking Time:</span>
          <span className="time-value">{route.totalTime} min</span>
        </div>
      </div>
      
      <div className="route-steps">
        {route.bars.map((bar, index) => (
          <div key={bar.id} className="route-step">
            <div className="step-number">{bar.order}</div>
            <div className="step-content">
              <strong>{bar.name}</strong>
              <span className="step-address">{bar.address}</span>
            </div>
            {index < route.bars.length - 1 && (
              <div className="step-arrow">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RouteList

