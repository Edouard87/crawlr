import { useState, useEffect } from 'react'
import axios from 'axios'
import { useCookies } from 'react-cookie'

function BarSelectionList({ onBarSelect, onBack, bars }) {

  if (!bars) {
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
            key={bar._id}
            className="bar-select-btn"
            onClick={() => onBarSelect(bar._id)}
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

