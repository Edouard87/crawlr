import { useState } from 'react'
import AddressAutocomplete from './AddressAutocomplete'
import './BarInput.css'

function BarInput({ onAddBar, apiKey }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [capacity, setCapacity] = useState(50)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && address.trim()) {
      onAddBar({
        name: name.trim(),
        address: address.trim()
      })
      setName('')
      setAddress('')
    }
  }

  return (
    <div className="bar-input">
      <h2>Add a Bar</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="bar-name">Bar Name</label>
          <input
            id="bar-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., The Local Pub"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bar-address">Address</label>
          <AddressAutocomplete
            id="bar-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., 123 Main St, City, State"
            apiKey={apiKey}
            required
          />
          <small className="address-hint">
            {apiKey ? (
              <>Using Google Places API for accurate addresses and postal codes</>
            ) : (
              <>Using OpenStreetMap - postal codes may be approximate</>
            )}
          </small>
        </div>
        <button type="submit" className="add-btn">
          Add Bar
        </button>
      </form>
    </div>
  )
}

export default BarInput

