import { useState, useEffect } from 'react'
import axios from 'axios'
import { useCookies } from 'react-cookie'

function BarSelectionList({ onBarSelect, onBack, bars: stops }) {

  if (!stops) {
    return <p>Loading bars...</p>
  }

  if (stops.length === 0) {
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
        {stops.map(stop => (
          <button
            key={stop._id}
            className="bar-select-btn"
            onClick={() => onBarSelect(stop._id)}
          >
            {stop.name}
            <span className="bar-address-small">{stop.bar.address}</span>
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

