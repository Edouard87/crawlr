// Route optimization utilities (extracted from App.jsx)
import { getDirections } from './googleMapsLoader'

// TSP solver using nearest neighbor heuristic with distance matrix
export async function optimizeRoute(bars, apiKey, setLoadingMessage) {
  // Step 1: Geocode all addresses to get coordinates
  if (setLoadingMessage) setLoadingMessage('Geocoding addresses...')
  const geocodedBars = await Promise.all(
    bars.map(async (bar) => {
      const coords = bar.coordinates || await geocodeAddress(bar.address)
      return { ...bar, coordinates: coords }
    })
  )

  // Step 2: Calculate distance matrix
  const n = geocodedBars.length
  const distanceMatrix = []
  const totalPairs = n * (n - 1) // Total number of distance calculations needed
  let completedPairs = 0
  
  // Helper function to add delay between API calls to avoid rate limiting
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  
  if (setLoadingMessage) setLoadingMessage('Calculating walking times...')
  
  for (let i = 0; i < n; i++) {
    distanceMatrix[i] = []
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distanceMatrix[i][j] = 0
      } else {
        // Calculate walking distance using Google Maps or approximate
        const result = await calculateWalkingDistance(
          geocodedBars[i].coordinates,
          geocodedBars[j].coordinates,
          apiKey
        )
        // Store both duration and polyline if available
        distanceMatrix[i][j] = typeof result === 'object' ? result.duration : result
        completedPairs++
        
        // Update loading message
        if (setLoadingMessage && apiKey && apiKey.trim()) {
          const progress = Math.round((completedPairs / totalPairs) * 100)
          setLoadingMessage(`Calculating routes... ${progress}%`)
        }
        
        // Add small delay between API calls to avoid rate limiting (only if using API key)
        if (apiKey && apiKey.trim() && completedPairs < totalPairs) {
          await delay(100) // 100ms delay between calls
        }
      }
    }
  }
  
  if (setLoadingMessage) setLoadingMessage('Optimizing route...')

  // Step 3: Solve TSP using nearest neighbor + 2-opt improvement
  const route = solveTSP(geocodedBars, distanceMatrix)

  // Calculate total time and fetch route paths
  let totalTime = 0
  const routePaths = []
  
  if (setLoadingMessage && apiKey && apiKey.trim()) {
    setLoadingMessage('Fetching walking routes...')
  }
  
  for (let i = 0; i < route.length - 1; i++) {
    const time = distanceMatrix[route[i].index][route[i + 1].index]
    totalTime += typeof time === 'object' ? time.duration : time
    
    // Fetch route path for this segment if we have API key
    if (apiKey && apiKey.trim()) {
      try {
        const pathResult = await getRoutePath(
          route[i].coordinates,
          route[i + 1].coordinates,
          apiKey
        )
        if (pathResult) {
          routePaths.push(pathResult)
          console.log(`Route path ${i + 1}/${route.length - 1} fetched successfully`)
        } else {
          // Fallback: will use straight line
          console.warn(`Route path ${i + 1}/${route.length - 1} failed, using straight line`)
          routePaths.push(null)
        }
        
        // Add delay to avoid rate limiting
        if (i < route.length - 2) {
          await delay(200) // 200ms delay between route path fetches
        }
      } catch (error) {
        console.error(`Error fetching route path ${i + 1}:`, error)
        routePaths.push(null)
      }
    } else {
      console.warn('No API key, using straight lines for routes')
      routePaths.push(null) // No API key, will use straight lines
    }
  }
  
  console.log('Route paths fetched:', routePaths.filter(p => p !== null).length, 'out of', routePaths.length)

  return {
    bars: route,
    totalTime: Math.round(totalTime / 60), // Convert seconds to minutes
    routePaths: routePaths // Array of encoded polylines for each segment
  }
}

// Geocode address to coordinates using Nominatim (OpenStreetMap)
async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'BarCrawlApp/1.0'
        }
      }
    )
    const data = await response.json()
    
    if (data.length === 0) {
      throw new Error(`Could not find coordinates for: ${address}`)
    }
    
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}

// Calculate walking distance using Google Maps JavaScript API (no CORS issues)
async function calculateWalkingDistance(coord1, coord2, apiKey) {
  // If API key is provided, use Google Maps JavaScript API
  if (apiKey && apiKey.trim()) {
    try {
      const result = await getDirections(coord1, coord2, apiKey)
      
      if (result && result.routes && result.routes.length > 0) {
        // Get duration in seconds from the first route
        const duration = result.routes[0].legs[0].duration.value
        // Also return the encoded polyline for the route path
        const overviewPolyline = result.routes[0].overview_polyline?.points || null
        return { duration, polyline: overviewPolyline } // Return both duration and polyline
      }
    } catch (error) {
      console.warn('Error calling Google Maps API:', error)
      // Fall through to Haversine calculation
    }
  }
  
  // Fallback to Haversine distance calculation if API key is missing or request fails
  return calculateHaversineDistance(coord1, coord2)
}

// Get route path (polyline) between two coordinates using Google Maps JavaScript API
async function getRoutePath(coord1, coord2, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    console.warn('No API key provided for route path')
    return null
  }
  
  try {
    const result = await getDirections(coord1, coord2, apiKey)
    
    if (result && result.routes && result.routes.length > 0) {
      const route = result.routes[0]
      
      // Debug: log the route structure
      console.log('Route structure:', {
        hasOverviewPolyline: !!route.overview_polyline,
        overviewPolylineType: typeof route.overview_polyline,
        routeKeys: Object.keys(route)
      })
      
      // Try different ways to get the polyline
      let polyline = null
      
      // Method 1: overview_polyline.points (standard)
      if (route.overview_polyline && route.overview_polyline.points) {
        polyline = route.overview_polyline.points
      }
      // Method 2: overview_polyline might be the encoded string directly
      else if (route.overview_polyline && typeof route.overview_polyline === 'string') {
        polyline = route.overview_polyline
      }
      // Method 3: Check if it's encoded_polyline
      else if (route.overview_polyline && route.overview_polyline.encoded) {
        polyline = route.overview_polyline.encoded
      }
      // Method 4: Build from legs
      else if (route.legs && route.legs.length > 0) {
        // Extract polyline from each leg and combine
        const legPolylines = route.legs
          .map(leg => leg.steps.map(step => step.polyline?.points).filter(Boolean))
          .flat()
        if (legPolylines.length > 0) {
          // For now, use the first leg's polyline
          polyline = route.legs[0].steps[0]?.polyline?.points || null
        }
      }
      
      if (polyline) {
        console.log('Successfully extracted polyline, length:', polyline.length)
        return polyline
      } else {
        console.warn('Route found but no polyline in response. Route object:', route)
        // Try to get coordinates from the route path
        if (route.legs && route.legs.length > 0) {
          const path = []
          route.legs.forEach(leg => {
            leg.steps.forEach(step => {
              if (step.path) {
                step.path.forEach(point => {
                  path.push([point.lat(), point.lng()])
                })
              }
            })
          })
          if (path.length > 0) {
            console.log('Extracted path from steps, points:', path.length)
            // Return as a special marker that we'll handle in RouteMap
            return { type: 'coordinates', path }
          }
        }
        return null
      }
    } else {
      console.warn('Google Directions API error: No routes returned')
      return null
    }
  } catch (error) {
    console.error('Error fetching route path:', error)
    return null
  }
}

// Haversine formula for great-circle distance (approximation)
function calculateHaversineDistance(coord1, coord2) {
  const R = 6371000 // Earth radius in meters
  const lat1 = coord1[0] * Math.PI / 180
  const lat2 = coord2[0] * Math.PI / 180
  const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180
  const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // in meters

  // Approximate walking time: 5 km/h = 1.39 m/s
  const walkingSpeed = 1.39 // meters per second
  return distance / walkingSpeed // time in seconds
}

// Solve TSP using nearest neighbor + 2-opt
function solveTSP(bars, distanceMatrix) {
  const n = bars.length
  
  // Nearest neighbor starting from first bar
  let route = [0]
  let unvisited = Array.from({ length: n - 1 }, (_, i) => i + 1)
  
  while (unvisited.length > 0) {
    let current = route[route.length - 1]
    let nearest = unvisited[0]
    let minDist = distanceMatrix[current][nearest]
    
    for (let i = 1; i < unvisited.length; i++) {
      const dist = distanceMatrix[current][unvisited[i]]
      if (dist < minDist) {
        minDist = dist
        nearest = unvisited[i]
      }
    }
    
    route.push(nearest)
    unvisited = unvisited.filter(i => i !== nearest)
  }
  
  // 2-opt improvement
  route = twoOpt(route, distanceMatrix)
  
  // Convert to bar objects with order
  return route.map((index, order) => ({
    ...bars[index],
    index,
    order: order + 1
  }))
}

// 2-opt local search improvement
function twoOpt(route, distanceMatrix) {
  let improved = true
  let bestRoute = [...route]
  let bestDistance = calculateRouteDistance(route, distanceMatrix)
  
  while (improved) {
    improved = false
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length; j++) {
        if (j - i === 1) continue
        
        // Try reversing segment between i and j
        const newRoute = [...bestRoute]
        const segment = newRoute.slice(i, j + 1).reverse()
        newRoute.splice(i, j - i + 1, ...segment)
        
        const newDistance = calculateRouteDistance(newRoute, distanceMatrix)
        if (newDistance < bestDistance) {
          bestRoute = newRoute
          bestDistance = newDistance
          improved = true
        }
      }
    }
  }
  
  return bestRoute
}

function calculateRouteDistance(route, distanceMatrix) {
  let distance = 0
  for (let i = 0; i < route.length - 1; i++) {
    distance += distanceMatrix[route[i]][route[i + 1]]
  }
  return distance
}

