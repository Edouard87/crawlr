import { useState, useEffect, useRef } from 'react'
import './AddressAutocomplete.css'

const API_URL = import.meta.env.VITE_API_URL

function AddressAutocomplete({ value, onChange, placeholder, apiKey, required, id }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch suggestions using Google Places API or Nominatim
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // Use Google Places Autocomplete if API key is available
    if (apiKey && apiKey.trim()) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&types=establishment|geocode`
        )
        const data = await response.json()

        if (data.status === 'OK' && data.predictions) {
          // Fetch detailed address info for better postal code accuracy
          const detailedSuggestions = await Promise.all(
            data.predictions.slice(0, 5).map(async (prediction) => {
              try {
                // Get place details for accurate postal code
                const detailsResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=formatted_address,address_components&key=${apiKey}`
                )
                const detailsData = await detailsResponse.json()
                
                if (detailsData.status === 'OK' && detailsData.result) {
                  // Use formatted address which should include accurate postal code
                  // Google's formatted_address is the most accurate representation
                  return {
                    description: detailsData.result.formatted_address,
                    placeId: prediction.place_id,
                    postalCode: detailsData.result.address_components?.find(
                      component => component.types.includes('postal_code')
                    )?.long_name || null
                  }
                }
              } catch (err) {
                console.warn('Error fetching place details:', err)
              }
              
              // Fallback to autocomplete description
              return {
                description: prediction.description,
                placeId: prediction.place_id,
                postalCode: null
              }
            })
          )
          
          setSuggestions(detailedSuggestions)
          setShowSuggestions(true)
        } else {
          // Fallback to Nominatim if Google fails
          fetchNominatimSuggestions(query)
        }
      } catch (error) {
        console.warn('Google Places API error:', error)
        fetchNominatimSuggestions(query)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Use Nominatim (OpenStreetMap) as fallback
      fetchNominatimSuggestions(query)
    }
  }

  // Fetch suggestions from Nominatim
  const fetchNominatimSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BarCrawlApp/1.0'
          }
        }
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const formattedSuggestions = data.map(item => ({
          description: item.display_name,
          placeId: item.place_id
        }))
        setSuggestions(formattedSuggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Nominatim error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(e)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300) // 300ms debounce
  }

  const handleSelectSuggestion = (suggestion) => {
    onChange({ target: { value: suggestion.description } })
    setShowSuggestions(false)
    setSuggestions([])
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="address-autocomplete" ref={wrapperRef}>
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className="autocomplete-input"
          autoComplete="off"
          required={required}
        />
        {isLoading && (
          <div className="autocomplete-spinner">
            <div className="spinner-small"></div>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.placeId || index}
              className="autocomplete-suggestion"
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              <div className="suggestion-icon">📍</div>
              <div className="suggestion-text">{suggestion.description}</div>
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && value.length >= 3 && !isLoading && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-no-results">
            No addresses found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete

