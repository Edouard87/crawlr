let directionsService = null
let loaderPromise = null
let currentApiKey = null

// Load Google Maps script directly
function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')))
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMapsCallback`
    script.async = true
    script.defer = true
    
    // Set up global callback
    window.initGoogleMapsCallback = () => {
      resolve()
      delete window.initGoogleMapsCallback
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'))
      delete window.initGoogleMapsCallback
    }
    
    document.head.appendChild(script)
  })
}

// Initialize Google Maps JavaScript API
export async function initGoogleMaps(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    console.warn('No API key provided for Google Maps')
    return null
  }

  // If API key changed, reset everything
  if (currentApiKey && currentApiKey !== apiKey) {
    directionsService = null
    loaderPromise = null
    currentApiKey = null
  }

  // Return existing service if already loaded with same key
  if (directionsService && currentApiKey === apiKey) {
    return directionsService
  }

  // Return existing promise if loading
  if (loaderPromise) {
    return loaderPromise
  }

  // Store current API key
  currentApiKey = apiKey

  // Load Google Maps JavaScript API
  loaderPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('Loading Google Maps API with key:', apiKey.substring(0, 10) + '...')
      
      // Load the script
      await loadGoogleMapsScript(apiKey)

      // Wait a bit to ensure google.maps is fully available
      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API not loaded - google.maps is undefined')
      }

      // Verify DirectionsService is available
      if (!google.maps.DirectionsService) {
        throw new Error('DirectionsService not available')
      }

      console.log('Creating DirectionsService...')
      // Create DirectionsService
      if (!directionsService) {
        directionsService = new google.maps.DirectionsService()
      }
      
      console.log('Google Maps API initialized successfully')
      resolve(directionsService)
    } catch (error) {
      console.error('Error loading Google Maps API:', error)
      directionsService = null
      loaderPromise = null
      currentApiKey = null
      reject(error)
    }
  })

  return loaderPromise
}

// Get directions using DirectionsService (no CORS issues)
export async function getDirections(origin, destination, apiKey) {
  try {
    const service = await initGoogleMaps(apiKey)
    if (!service) {
      return null
    }

    return new Promise((resolve, reject) => {
      service.route(
        {
          origin: new google.maps.LatLng(origin[0], origin[1]),
          destination: new google.maps.LatLng(destination[0], destination[1]),
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result)
          } else {
            console.warn('Directions request failed:', status)
            reject(new Error(`Directions request failed: ${status}`))
          }
        }
      )
    })
  } catch (error) {
    console.error('Error getting directions:', error)
    return null
  }
}

