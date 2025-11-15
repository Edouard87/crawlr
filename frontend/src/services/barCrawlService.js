// Service to manage bar crawl data
// In production, this would connect to a backend API

const STORAGE_KEY = 'bar_crawl_data'

// Initialize default data structure
function getDefaultData() {
  return {
    bars: [],
    attendees: {}, // { userId: { currentBarId: null, visitedBars: [] } }
    lastUpdate: Date.now()
  }
}

// Bar management
export function getBars() {
  const data = getData()
  // Ensure all bars have waitingList initialized
  data.bars = data.bars.map(bar => ({
    ...bar,
    waitingList: bar.waitingList || []
  }))
  return data.bars
}

export function addBar(bar) {
  const data = getData()
  const newBar = {
    ...bar,
    id: bar.id || Date.now(),
    capacity: bar.capacity || 50, // Default capacity
    currentAttendees: 0,
    waitingList: [] // Array of group numbers waiting at this bar
  }
  data.bars.push(newBar)
  saveData(data)
  return newBar
}

export function updateBar(barId, updates) {
  const data = getData()
  const index = data.bars.findIndex(b => b.id === barId)
  if (index !== -1) {
    data.bars[index] = { ...data.bars[index], ...updates }
    saveData(data)
    return data.bars[index]
  }
  return null
}

export function removeBar(barId) {
  const data = getData()
  data.bars = data.bars.filter(b => b.id !== barId)
  // Remove from attendees' visited lists
  Object.keys(data.attendees).forEach(userId => {
    if (data.attendees[userId].currentBarId === barId) {
      data.attendees[userId].currentBarId = null
    }
    data.attendees[userId].visitedBars = data.attendees[userId].visitedBars.filter(id => id !== barId)
  })
  saveData(data)
}

// Attendee management
export function getAttendee(userId) {
  const data = getData()
  if (!data.attendees[userId]) {
    // Try to get group from saved user data
    const savedUser = localStorage.getItem('bar_crawl_user')
    let group = null
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        group = userData.group || null
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    data.attendees[userId] = {
      currentBarId: null,
      visitedBars: [],
      location: null,
      lastLocationUpdate: null,
      group: group
    }
    saveData(data)
  }
  return data.attendees[userId]
}

// Update attendee group
export function updateAttendeeGroup(userId, group) {
  const data = getData()
  const attendee = getAttendee(userId)
  attendee.group = group
  data.attendees[userId] = attendee
  saveData(data)
}

// Update attendee location
export function updateAttendeeLocation(userId, location) {
  const data = getData()
  const attendee = getAttendee(userId)
  attendee.location = location
  attendee.lastLocationUpdate = Date.now()
  data.attendees[userId] = attendee
  saveData(data)
}

// Get all active attendees with their locations
export function getAllAttendeeLocations() {
  const data = getData()
  const locations = []
  
  Object.keys(data.attendees).forEach(userId => {
    const attendee = data.attendees[userId]
    // Include all attendees, not just those with recent location updates
    // This is needed for coordinator view to see all groups
    locations.push({
      userId: userId,
      location: attendee.location || null,
      currentBarId: attendee.currentBarId || null,
      lastUpdate: attendee.lastLocationUpdate || null,
      group: attendee.group || null
    })
  })
  
  return locations
}

export function setAttendeeCurrentBar(userId, barId) {
  const data = getData()
  const attendee = getAttendee(userId)
  
  // Decrement old bar's count
  if (attendee.currentBarId) {
    const oldBar = data.bars.find(b => b.id === attendee.currentBarId)
    if (oldBar && oldBar.currentAttendees > 0) {
      oldBar.currentAttendees--
    }
  }
  
  // Set new bar and increment count
  attendee.currentBarId = barId
  if (barId) {
    const newBar = data.bars.find(b => b.id === barId)
    if (newBar) {
      newBar.currentAttendees = (newBar.currentAttendees || 0) + 1
      if (!attendee.visitedBars.includes(barId)) {
        attendee.visitedBars.push(barId)
      }
      
      // Remove group from waiting list when they arrive
      if (attendee.group) {
        removeGroupFromWaitingList(barId, attendee.group)
      }
    }
  }
  
  data.attendees[userId] = attendee
  saveData(data)
}

export function leaveBar(userId) {
  const data = getData()
  const attendee = getAttendee(userId)
  const oldBarId = attendee.currentBarId
  
  // Set current bar to null (this decrements the bar's count)
  setAttendeeCurrentBar(userId, null)
  
  // After someone leaves, check if we can process the next group in the waiting list
  if (oldBarId) {
    processNextWaitingGroup(oldBarId)
  }
}

// Leave bar without processing waiting groups (used when removing entire groups)
export function leaveBarWithoutProcessing(userId) {
  setAttendeeCurrentBar(userId, null)
}

// Process the next group in the waiting list when capacity becomes available
export function processNextWaitingGroup(barId) {
  const data = getData()
  const bar = data.bars.find(b => b.id === barId)
  if (!bar) return
  
  const currentCount = bar.currentAttendees || 0
  const capacity = bar.capacity || 50
  const hasCapacity = currentCount < capacity
  
  // If bar has capacity and there are groups waiting, process the first one (FIFO)
  // This function doesn't actually add groups - it just identifies that capacity is available
  // Groups will be automatically removed from waiting list when they check in
  // via setAttendeeCurrentBar
  if (hasCapacity) {
    const nextGroup = getNextWaitingGroup(barId)
    if (nextGroup) {
      // The group will be automatically removed from waiting list when they check in
      // via setAttendeeCurrentBar, so we don't need to do anything here
      // The participants will see the bar as available on their next refresh
    }
  }
}

// Get all bars visited by any member of a group
export function getGroupVisitedBars(groupNumber) {
  const data = getData()
  const visitedBarsSet = new Set()
  
  // Collect all bars visited by any member of this group
  Object.values(data.attendees).forEach(attendee => {
    if (attendee.group === groupNumber && attendee.visitedBars) {
      attendee.visitedBars.forEach(barId => {
        visitedBarsSet.add(barId)
      })
    }
  })
  
  return Array.from(visitedBarsSet)
}

// Find next bar for a group when they leave (simplified version for coordinator)
// This version automatically adds groups to waiting lists
export function findNextBarForGroup(groupNumber, currentBarId) {
  const data = getData()
  if (!data.bars || data.bars.length === 0) {
    return null
  }

  // Get bars already visited by this group
  const visitedBars = getGroupVisitedBars(groupNumber)

  // Get all bars that are not at capacity AND don't have groups waiting AND haven't been visited by this group
  const availableBars = data.bars.filter(bar => {
    const currentCount = bar.currentAttendees || 0
    const hasCapacity = currentCount < (bar.capacity || 50)
    const barHasWaitingGroups = hasWaitingGroups(bar.id)
    const notVisited = !visitedBars.includes(bar.id)
    return hasCapacity && !barHasWaitingGroups && notVisited
  })

  if (availableBars.length === 0) {
    // If no bars are available, find next unvisited bar in route
    let nextBarInRoute = null
    if (currentBarId) {
      // Try to find next unvisited bar in route
      let currentIndex = data.bars.findIndex(b => b.id === currentBarId)
      if (currentIndex === -1) currentIndex = 0
      
      // Check up to all bars in the route to find an unvisited one
      for (let i = 0; i < data.bars.length; i++) {
        const checkIndex = (currentIndex + 1 + i) % data.bars.length
        const candidateBar = data.bars[checkIndex]
        if (!visitedBars.includes(candidateBar.id)) {
          nextBarInRoute = candidateBar
          break
        }
      }
    } else {
      // Find first unvisited bar
      nextBarInRoute = data.bars.find(bar => !visitedBars.includes(bar.id)) || null
    }
    
    if (nextBarInRoute) {
      // Add group to waiting list
      addGroupToWaitingList(nextBarInRoute.id, groupNumber)
      return nextBarInRoute
    }
    return null // All bars have been visited
  }

  // If user has a current bar, find next unvisited bar after it in route
  if (currentBarId) {
    let currentIndex = data.bars.findIndex(b => b.id === currentBarId)
    if (currentIndex === -1) currentIndex = 0
    
    // Check bars in route order to find first unvisited available one
    for (let i = 0; i < data.bars.length; i++) {
      const checkIndex = (currentIndex + 1 + i) % data.bars.length
      const candidateBar = data.bars[checkIndex]
      if (availableBars.find(b => b.id === candidateBar.id)) {
        return candidateBar
      }
    }
  }

  // Return first available bar
  return availableBars[0] || null
}

// Find next bar for a group without automatically adding to waiting list
// This gives the caller control over when to add groups to waiting lists
export function findNextBarForGroupWithoutAdding(groupNumber, currentBarId) {
  const data = getData()
  if (!data.bars || data.bars.length === 0) {
    return null
  }

  // Get bars already visited by this group
  const visitedBars = getGroupVisitedBars(groupNumber)

  // Get all bars that are not at capacity AND don't have groups waiting AND haven't been visited by this group
  const availableBars = data.bars.filter(bar => {
    const currentCount = bar.currentAttendees || 0
    const hasCapacity = currentCount < (bar.capacity || 50)
    const barHasWaitingGroups = hasWaitingGroups(bar.id)
    const notVisited = !visitedBars.includes(bar.id)
    return hasCapacity && !barHasWaitingGroups && notVisited
  })

  // If there are available bars, return the first one in route order
  if (availableBars.length > 0) {
    // If user has a current bar, find next unvisited bar after it in route
    if (currentBarId) {
      let currentIndex = data.bars.findIndex(b => b.id === currentBarId)
      if (currentIndex === -1) currentIndex = 0
      
      // Check bars in route order to find first unvisited available one
      for (let i = 0; i < data.bars.length; i++) {
        const checkIndex = (currentIndex + 1 + i) % data.bars.length
        const candidateBar = data.bars[checkIndex]
        if (availableBars.find(b => b.id === candidateBar.id)) {
          return candidateBar
        }
      }
    }

    // Return first available bar
    return availableBars[0] || null
  }

  // No available bars - return null (caller can find next unvisited bar if needed)
  return null
}

// Get current attendee counts for all bars
export function getBarAttendeeCounts() {
  const data = getData()
  const counts = {}
  data.bars.forEach(bar => {
    counts[bar.id] = bar.currentAttendees || 0
  })
  return counts
}

// Waiting list management
// Waiting list structure: [{ groupNumber: number, timestamp: number }, ...]
// Groups are stored with timestamps to maintain FIFO order

export function addGroupToWaitingList(barId, groupNumber) {
  const data = getData()
  const bar = data.bars.find(b => b.id === barId)
  if (bar) {
    if (!bar.waitingList) {
      bar.waitingList = []
    }
    // Check if group is already in waiting list
    const alreadyWaiting = bar.waitingList.some(item => 
      (typeof item === 'number' ? item : item.groupNumber) === groupNumber
    )
    if (!alreadyWaiting) {
      // Add with timestamp for FIFO ordering
      bar.waitingList.push({
        groupNumber: groupNumber,
        timestamp: Date.now()
      })
      saveData(data)
    }
  }
}

export function removeGroupFromWaitingList(barId, groupNumber) {
  const data = getData()
  const bar = data.bars.find(b => b.id === barId)
  if (bar && bar.waitingList) {
    // Support both old format (array of numbers) and new format (array of objects)
    bar.waitingList = bar.waitingList.filter(item => {
      const group = typeof item === 'number' ? item : item.groupNumber
      return group !== groupNumber
    })
    saveData(data)
  }
}

export function getBarWaitingList(barId) {
  const data = getData()
  const bar = data.bars.find(b => b.id === barId)
  if (!bar || !bar.waitingList) {
    return []
  }
  
  // Convert to array of group numbers, sorted by timestamp (FIFO - oldest first)
  // Support both old format (array of numbers) and new format (array of objects)
  const waitingList = bar.waitingList.map(item => {
    if (typeof item === 'number') {
      // Old format - convert to new format with current timestamp
      return { groupNumber: item, timestamp: Date.now() }
    }
    return item
  })
  
  // Sort by timestamp (oldest first for FIFO)
  waitingList.sort((a, b) => a.timestamp - b.timestamp)
  
  // Return just the group numbers for backward compatibility
  return waitingList.map(item => item.groupNumber)
}

export function getBarWaitingListWithTimestamps(barId) {
  const data = getData()
  const bar = data.bars.find(b => b.id === barId)
  if (!bar || !bar.waitingList) {
    return []
  }
  
  // Convert to array of objects, sorted by timestamp (FIFO - oldest first)
  const waitingList = bar.waitingList.map(item => {
    if (typeof item === 'number') {
      // Old format - convert to new format with current timestamp
      return { groupNumber: item, timestamp: Date.now() }
    }
    return item
  })
  
  // Sort by timestamp (oldest first for FIFO)
  waitingList.sort((a, b) => a.timestamp - b.timestamp)
  
  return waitingList
}

export function hasWaitingGroups(barId) {
  const waitingList = getBarWaitingList(barId)
  return waitingList.length > 0
}

// Get the next group in the waiting list (FIFO - oldest first)
export function getNextWaitingGroup(barId) {
  const waitingList = getBarWaitingListWithTimestamps(barId)
  if (waitingList.length === 0) {
    return null
  }
  return waitingList[0].groupNumber
}

// Get the next bar in the route after a given bar
export function getNextBarInRoute(currentBarId, bars) {
  if (!bars || bars.length === 0) return null
  
  // If we have an optimized route order, use that
  // Otherwise, find the index and return the next one
  const currentIndex = bars.findIndex(b => b.id === currentBarId)
  if (currentIndex === -1) return bars[0] // If not found, return first bar
  
  // Return next bar, wrapping around if at the end
  const nextIndex = (currentIndex + 1) % bars.length
  return bars[nextIndex]
}

// Find next available bar for an attendee
export async function findNextBar(userId, currentLocation, apiKey) {
  try {
    const data = getData()
    
    // Check if there are any bars at all
    if (!data.bars || data.bars.length === 0) {
      return null
    }
    
    const attendee = getAttendee(userId)
    const visitedBars = attendee.visitedBars || []
    const userGroup = attendee.group
    
    // If user is in a group, get all bars visited by the group
    let groupVisitedBars = []
    if (userGroup) {
      groupVisitedBars = getGroupVisitedBars(userGroup)
    }
    
    // Get all bars that are not at capacity AND don't have groups waiting AND haven't been visited
    const availableBars = data.bars.filter(bar => {
      const currentCount = bar.currentAttendees || 0
      const hasCapacity = currentCount < (bar.capacity || 50)
      const barHasWaitingGroups = hasWaitingGroups(bar.id)
      // For groups, check group-level visited bars; for individuals, check personal visited bars
      const notVisited = userGroup 
        ? !groupVisitedBars.includes(bar.id)
        : !visitedBars.includes(bar.id)
      
      // Bar is available if it has capacity AND no groups are waiting AND hasn't been visited
      return hasCapacity && !barHasWaitingGroups && notVisited
    })
    
    if (availableBars.length === 0) {
      // If no bars are available (all have waiting groups or are full),
      // find the next unvisited bar in route after current bar
      let nextBarInRoute = null
      const barsToCheck = userGroup ? groupVisitedBars : visitedBars
      
      if (attendee.currentBarId) {
        // Try to find next unvisited bar in route
        let currentIndex = data.bars.findIndex(b => b.id === attendee.currentBarId)
        if (currentIndex === -1) currentIndex = 0
        
        // Check up to all bars in the route to find an unvisited one
        for (let i = 0; i < data.bars.length; i++) {
          const checkIndex = (currentIndex + 1 + i) % data.bars.length
          const candidateBar = data.bars[checkIndex]
          if (!barsToCheck.includes(candidateBar.id)) {
            nextBarInRoute = candidateBar
            break
          }
        }
      } else {
        // Find first unvisited bar
        nextBarInRoute = data.bars.find(bar => !barsToCheck.includes(bar.id)) || null
      }
      
      if (nextBarInRoute) {
        // If user has a group, add them to waiting list
        if (userGroup) {
          addGroupToWaitingList(nextBarInRoute.id, userGroup)
        }
        return nextBarInRoute
      }
      return null // All bars have been visited
    }
    
    // If user has a current bar, use its coordinates as starting point
    let startCoords = currentLocation
    if (attendee.currentBarId) {
      const currentBar = data.bars.find(b => b.id === attendee.currentBarId)
      if (currentBar && currentBar.coordinates) {
        startCoords = currentBar.coordinates
      }
    }
    
    // If no start location, return first available bar
    if (!startCoords) {
      return availableBars[0]
    }
    
    // Calculate distances to all available bars
    const distances = await Promise.all(
      availableBars.map(async (bar) => {
        if (!bar.coordinates) {
          // Geocode if needed
          try {
            const coords = await geocodeAddress(bar.address)
            bar.coordinates = coords
            updateBar(bar.id, { coordinates: coords })
          } catch (error) {
            console.error('Geocoding error:', error)
            return { bar, distance: Infinity }
          }
        }
        
        const distance = await calculateWalkingDistance(
          startCoords,
          bar.coordinates,
          apiKey
        )
        return { bar, distance }
      })
    )
    
    // Sort by distance and return closest
    distances.sort((a, b) => a.distance - b.distance)
    return distances[0]?.bar || null
  } catch (error) {
    console.error('Error in findNextBar:', error)
    // Return first available bar as fallback, or null if error
    const data = getData()
    if (data.bars && data.bars.length > 0) {
      const availableBars = data.bars.filter(bar => {
        const currentCount = bar.currentAttendees || 0
        return currentCount < (bar.capacity || 50)
      })
      return availableBars[0] || null
    }
    return null
  }
}

// Helper functions (reused from App.jsx)
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

async function calculateWalkingDistance(coord1, coord2, apiKey) {
  if (apiKey && apiKey.trim()) {
    try {
      // Use Google Maps JavaScript API to avoid CORS issues
      const { getDirections } = await import('../utils/googleMapsLoader')
      const result = await getDirections(coord1, coord2, apiKey)
      
      if (result && result.routes && result.routes.length > 0) {
        return result.routes[0].legs[0].duration.value // seconds
      }
    } catch (error) {
      console.warn('Error calling Google Maps API:', error)
      // Fall through to Haversine calculation
    }
  }
  
  // Fallback to Haversine
  return calculateHaversineDistance(coord1, coord2)
}

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

  const walkingSpeed = 1.39 // meters per second
  return distance / walkingSpeed // time in seconds
}

