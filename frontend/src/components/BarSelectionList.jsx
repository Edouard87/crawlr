import { useState, useEffect } from 'react'
import { getBars } from '../services/barCrawlService'

function BarSelectionList({ eventCode, onBarSelect, onBack }) {
  const [bars, setBars] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBars = () => {
      try {
        const allBars = getBars()
        setBars(allBars)
      } catch (error) {
        console.error('Error loading bars:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBars()
  }, [])

  if (isLoading) {
    return <p>Loading bars...</p>
  }

  if (bars.length === 0) {
    return (
      <>
        <p>No bars available for this event.</p>
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
      </>
    )
  }

  return (
    <>
      <div className="bars-selection-list">
        {bars.map(bar => (
          <button
            key={bar.id}
            className="bar-select-btn"
            onClick={() => onBarSelect(bar.id)}
          >
            {bar.name}
            <span className="bar-address-small">{bar.address}</span>
          </button>
        ))}
      </div>
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
    </>
  )
}

export default BarSelectionList

