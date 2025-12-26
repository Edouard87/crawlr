import { useState, useEffect } from 'react'
import './ApiKeyInput.css'

function ApiKeyInput({ onApiKeyChange }) {
  const [apiKey, setApiKey] = useState(() => {
    // Load from localStorage if available
    return localStorage.getItem('google_maps_api_key') || ''
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Save to localStorage when changed
    if (apiKey) {
      localStorage.setItem('google_maps_api_key', apiKey)
    } else {
      localStorage.removeItem('google_maps_api_key')
    }
    onApiKeyChange(apiKey)
  }, [apiKey, onApiKeyChange])

  return (
    <div className="api-key-input">
      <button
        className="api-key-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▼' : '▶'} Google Maps API Key {apiKey ? '✓' : '(Required)'}
      </button>
      
      {isExpanded && (
        <div className="api-key-content">
          <p className="api-key-info">
            For accurate walking times, enter your Google Maps API key.
            <br />
            <a 
              href="https://console.cloud.google.com/google/maps-apis" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Get your API key here
            </a>
            {' '}and enable "Directions API"
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Google Maps API key"
            className="api-key-field"
          />
          {apiKey && (
            <p className="api-key-status">✓ API key saved</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ApiKeyInput



