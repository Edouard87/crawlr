// Service to manage bar crawl events
import { getData, saveData } from './barCrawlService'

const EVENTS_STORAGE_KEY = 'bar_crawl_events'
const ACTIVE_EVENT_KEY = 'bar_crawl_active_event'

// Generate a unique 6-character alphanumeric code
function generateEventCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Generate a random 4-digit code
function generateCoordinatorCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Get all events
export function getAllEvents() {
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading events:', error)
  }
  return []
}

// Save all events
function saveEvents(events) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Error saving events:', error)
  }
}

// Create a new event
export function createEvent(eventName, bars, route) {
  const events = getAllEvents()
  const eventCode = generateEventCode()
  
  // Ensure bars have all necessary fields
  const barsToSave = (bars || []).map(bar => ({
    ...bar,
    currentAttendees: 0, // Reset for new event
    waitingList: [] // Reset waiting list
  }))
  
  const newEvent = {
    id: Date.now(),
    code: eventCode,
    name: eventName || `Event ${eventCode}`,
    bars: barsToSave,
    route: route || null,
    createdAt: Date.now(),
    isActive: false,
    startedAt: null,
    coordinatorCode: generateCoordinatorCode() // Random 4-digit code for coordinators
  }
  
  events.push(newEvent)
  saveEvents(events)
  return newEvent
}

// Get event by code
export function getEventByCode(code) {
  const events = getAllEvents()
  return events.find(e => e.code === code.toUpperCase())
}

// Validate coordinator code for an event
export function validateCoordinatorCode(eventCode, coordinatorCode) {
  const event = getEventByCode(eventCode)
  if (!event) return false
  return event.coordinatorCode === coordinatorCode
}

// Get event by ID
export function getEventById(id) {
  const events = getAllEvents()
  return events.find(e => e.id === id)
}

// Update event
export function updateEvent(eventId, updates) {
  const events = getAllEvents()
  const index = events.findIndex(e => e.id === eventId)
  if (index !== -1) {
    events[index] = { ...events[index], ...updates }
    saveEvents(events)
    return events[index]
  }
  return null
}

// Delete event
export function deleteEvent(eventId) {
  const events = getAllEvents()
  const filtered = events.filter(e => e.id !== eventId)
  saveEvents(filtered)
}

// Start an event (set as active)
export function startEvent(eventId) {
  const events = getAllEvents()
  const event = events.find(e => e.id === eventId)
  if (!event) return null
  
  // Deactivate all other events
  events.forEach(e => {
    if (e.id !== eventId) {
      e.isActive = false
    }
  })
  
  // Activate this event
  event.isActive = true
  event.startedAt = Date.now()
  
  saveEvents(events)
  
  // Set as active event in storage
  localStorage.setItem(ACTIVE_EVENT_KEY, JSON.stringify(event))
  
  // Load event bars into barCrawlService storage
  if (event.bars && event.bars.length > 0) {
    const data = getData()
    data.bars = event.bars.map(bar => ({
      ...bar,
      waitingList: bar.waitingList || [],
      currentAttendees: 0 // Reset attendee counts when starting event
    }))
    saveData(data)
  }
  
  return event
}

// Get active event
export function getActiveEvent() {
  try {
    const stored = localStorage.getItem(ACTIVE_EVENT_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading active event:', error)
  }
  return null
}

// Stop active event
export function stopActiveEvent() {
  const event = getActiveEvent()
  if (event) {
    updateEvent(event.id, { isActive: false })
    localStorage.removeItem(ACTIVE_EVENT_KEY)
  }
}

