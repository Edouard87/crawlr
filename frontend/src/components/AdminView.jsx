import { useState, useEffect } from 'react'
import BarInput from './BarInput'
import RouteMap from './RouteMap'
import RouteList from './RouteList'
import ApiKeyInput from './ApiKeyInput'
import { optimizeRoute } from '../utils/routeOptimizer'
import './AdminView.css'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import BarList from './BarList'

const API_URL = import.meta.env.VITE_API_URL

function AdminView({ user, apiKey, onLogout, onApiKeyChange }) {
  const [view, setView] = useState('selection') // 'selection', 'new', 'existing', 'active'
  const [bars, setBars] = useState([])
  const [events, setEvents] = useState([])
  const [stops, setStops] = useState([])
  const [barStopIDs, setBarStopIDs] = useState([])
  const [optimizedRoute, setOptimizedRoute] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [attendeeCounts, setAttendeeCounts] = useState({})
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [eventCode, setEventCode] = useState(null)
  const [eventCodeType, setEventCodeType] = useState(null) // 'created' or 'started'
  const [eventName, setEventName] = useState('')

  const [cookies, setCookie, removeCookie] = useCookies(['authCode', 'token'], {
  doNotParse: true,
});

  useEffect(() => {
    loadEvents()
    // const activeEvent = getActiveEvent()
    // if (activeEvent) {
    //   setView('active')
    //   loadEventData(activeEvent)
    // }
  }, [])

  useEffect(() => {
    if (view === 'active' || view === 'new') {
      loadBars()
      // Refresh attendee counts and waiting lists every 5 seconds
      const interval = setInterval(() => {
        loadBars()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [view])

  const loadEvents = () => {
    axios({
      url: `${API_URL}/event`,
      method: 'get',
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    }).then(res => {
      setEvents(res.data)
    }).then(err => {
      // TODO: Better error handling.
    })
  }

  // const loadEventData = (event) => {
  //   if (event && event.bars) {
  //     setBars(event.bars)
  //     setOptimizedRoute(event.route)
  //   }
  // }

  // Get all bars from the DB. 
  const loadBars = () => {
    axios.get(`${API_URL}/bar`).then(res => {
      setBars(res.data)
    }).catch(err => {
      // TODO: Error on network timeout.
    })
  }

  const handleAddBar = async (bar) => {
    // This bar does not exist yet in the system. We are creating it now.

    let coords = []

    try {
      coords = await geocodeAddress(bar.address)
    } catch (error) {
      console.error('Error geocoding address:', error)
    }

    const newBar = {
      name: bar.name,
      address: bar.address,
      coordinates: {
        latitude: coords[0],
        longitude: coords[1]
      }
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/bar`,
        newBar,
        {
          headers: {
            'authorization': `Bearer ${cookies.token}`
          }
        }
      )
      loadBars()
    } catch (error) {
      console.error('Error adding bar:', error)
      alert('Error adding bar. Please try again.')
    }
  }

  const handleRemoveBar = (id) => {
    axios.delete(`${API_URL}/bar/${id}`, {
      headers: {
        'authorization': `Bearer ${cookies.token}`
      }
    }).then(res => {
      loadBars()
    }).catch(err => {
      // TODO: Better error handling.
    })
    setOptimizedRoute(null)
  }

  const handleAddStop = (barID) => {
    let newStop = bars.find(bar => bar._id === barID)
    setBarStopIDs([...barStopIDs, barID]);
    setStops( // Replace the state
      [ // with a new array
        ...stops, // that contains all the old items
        newStop // and one new item at the end
      ]
    );
  }

  const handleRemoveStop = (barID) => {
    let newStops = stops.filter(bar => bar._id !== barID)
    setStops(newStops)
    let newBarStopIDs = barStopIDs.filter(id => id !== barID)
    setBarStopIDs(newBarStopIDs)
  }

  const createNewEvent = () => {
    if (stops.length === 0) {
      // TODO: Error handling
    }
    axios({
      method: 'post',
      headers: {
        'Authorization': `Bearer ${cookies.token}`
      },
      url: `${API_URL}/event`,
      data: {
        eventName: eventName,
        numGroups: 20, // TODO: This should be modifiable
      }
    }).then(res => {
      // Add stops to the event.
      axios({
        url: `${API_URL}/event/${res.data.id}`,
        headers: {
          'Authorization': `Bearer ${cookies.token}`
        },
        method: 'put',
        data: {
          stops: barStopIDs
        }
      }).then(res => {
        setView('existing')
        loadEvents()
      }).catch(err => {
        // TODO: More error handling
      })
    }).catch(err => {
      // TODO: ERROR Handling
    })
  }

  const handleOptimizeRoute = async () => {
    if (bars.length < 2) {
      alert('Please add at least 2 bars to create a route!')
      return
    }

    setIsLoading(true)
    setLoadingMessage('Geocoding addresses...')
    try {
      const route = await optimizeRoute(bars, apiKey, setLoadingMessage)
      setOptimizedRoute(route)
      
      const barsWithCoords = bars.map(bar => {
        const routeBar = route.bars.find(rb => rb.id === bar.id)
        return routeBar ? { ...bar, coordinates: routeBar.coordinates } : bar
      })
      setBars(barsWithCoords)
    } catch (error) {
      console.error('Error optimizing route:', error)
      alert('Error optimizing route. Please check that all addresses are valid.')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const handleClearAll = () => {
    bars.forEach(bar => removeBar(bar.id))
    setBars([])
    setOptimizedRoute(null)
  }

  const handleCreateEvent = () => {
    if (bars.length === 0) {
      alert('Please add at least one bar before creating an event!')
      return
    }

    const name = eventName.trim() || `Bar Crawl ${new Date().toLocaleDateString()}`
    const newEvent = createEvent(name, bars, optimizedRoute)
    
    // Show event code but don't start the event
    setEventCode(newEvent.code)
    setEventCodeType('created')
    setView('existing')
    loadEvents()
    
    // Reset form
    setBars([])
    setOptimizedRoute(null)
    setEventName('')
  }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    setShowStartConfirm(true)
  }

  const handleStartEvent = () => {
    if (!selectedEvent) return
    
    const startedEvent = startEvent(selectedEvent.id)
    if (startedEvent) {
      // setEventCode(startedEvent.code)
      // setEventCodeType('started')
      // setView('active')
      // loadEventData(startedEvent)
      // loadEvents()
    }
    setShowStartConfirm(false)
    setSelectedEvent(null)
  }

  // Selection screen
  if (view === 'selection') {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div>
              <h1>🍺 Bar Crawl Admin</h1>
              <p>Manage your events</p>
            </div>
            <div className="header-actions">
              <span className="user-info">Logged in as: {user.username}</span>
              <button className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <div className="app-container">
          <div className="selection-screen">
            <div className="selection-buttons">
              <button 
                className="selection-btn new-event-btn"
                onClick={() => setView('new')}
              >
                <h2>➕ New Event</h2>
                <p>Create a new bar crawl event</p>
              </button>
              
              <button 
                className="selection-btn existing-events-btn"
                onClick={() => {
                  setView('existing')
                  loadEvents()
                }}
              >
                <h2>📋 Existing Events</h2>
                <p>View and start saved events</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Existing events screen
  if (view === 'existing') {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div>
              <h1>🍺 Bar Crawl Admin</h1>
              <p>Existing Events</p>
            </div>
            <div className="header-actions">
              <button className="back-btn" onClick={() => setView('selection')}>
                ← Back
              </button>
              <button className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <div className="app-container">
          <div className="events-list">
            {events.length === 0 ? (
              <div className="empty-state">
                <p>No events found. Create a new event to get started!</p>
                <button className="create-btn" onClick={() => setView('new')}>
                  Create New Event
                </button>
              </div>
            ) : (
              <>
                <h2>Saved Events ({events.length})</h2>
                <div className="events-grid">
                  {events.map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <h3>{event.name}</h3>
                        {event.isActive && (
                          <span className="active-badge">ACTIVE</span>
                        )}
                      </div>
                      <div className="event-info">
                        <p><strong>Event Code:</strong> {event.code}</p>
                        {event.coordinatorCode && (
                          <>
                            <p><strong>Coordinator Code:</strong> <span className="coordinator-code-display">{event.coordinatorCode}</span></p>
                            <p><strong>Sign In Code:</strong> <span className="coordinator-code-display">{event.signInCode}</span></p>
                          </>
                        )}
                        <p><strong>Bars:</strong> {event.bars?.length || 0}</p>
                        <p><strong>Created:</strong> {new Date(event.createdAt).toLocaleDateString()}</p>
                        {event.startedAt && (
                          <p><strong>Started:</strong> {new Date(event.startedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                      {/* {!event.isActive && (
                        <button 
                          className="start-event-btn"
                          onClick={() => handleSelectEvent(event)}
                        >
                          Start Event
                        </button>
                      )} */}
                      {event.isActive && (
                        <button 
                          className="view-event-btn"
                          onClick={() => {
                            setView('active')
                            loadEventData(event)
                          }}
                        >
                          View Active Event
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {showStartConfirm && selectedEvent && (
          <div className="modal-overlay" onClick={() => setShowStartConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Start Event?</h2>
              <p>Are you sure you want to start <strong>{selectedEvent.name}</strong>?</p>
              <p>This will make it the active event that participants can join.</p>
              <div className="modal-buttons">
                <button className="confirm-btn" onClick={handleStartEvent}>
                  Yes, Start Event
                </button>
                <button className="cancel-btn" onClick={() => {
                  setShowStartConfirm(false)
                  setSelectedEvent(null)
                }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {eventCode && eventCodeType === 'created' && (
          <div className="modal-overlay" onClick={() => {
            setEventCode(null)
            setEventCodeType(null)
          }}>
            <div className="modal-content event-code-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Event Created!</h2>
              <p>Your event has been saved. Event code:</p>
              <div className="event-code-display">
                <h1>{eventCode}</h1>
              </div>
              <p className="event-code-hint">Go to "Existing Events" and click "Start Event" to make it active. Participants will need this code to join once the event is started.</p>
              <button className="confirm-btn" onClick={() => {
                setEventCode(null)
                setEventCodeType(null)
              }}>
                Got it!
              </button>
            </div>
          </div>
        )}
        
        {eventCode && eventCodeType === 'started' && (
          <div className="modal-overlay" onClick={() => {
            setEventCode(null)
            setEventCodeType(null)
          }}>
            <div className="modal-content event-code-modal" onClick={(e) => e.stopPropagation()}>
              <h2>🎉 Event Started!</h2>
              <p>Your event is now active. Share this code with participants:</p>
              <div className="event-code-display">
                <h1>{eventCode}</h1>
              </div>
              <p className="event-code-hint">Participants can enter this code to join the event</p>
              <button className="confirm-btn" onClick={() => {
                setEventCode(null)
                setEventCodeType(null)
              }}>
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // New event or active event view (current admin functionality)
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🍺 Bar Crawl Admin</h1>
            <p>{view === 'new' ? 'Create New Event' : 'Active Event Management'}</p>
            {view === 'active' && eventCode && (
              <p className="active-event-code">Event Code: <strong>{eventCode}</strong></p>
            )}
          </div>
          <div className="header-actions">
            <button className="back-btn" onClick={() => {
              if (view === 'new') {
                if (bars.length > 0 && !window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
                  return
                }
                setView('selection')
                setBars([])
                setOptimizedRoute(null)
                setEventName('')
              } else {
                setView('selection')
              }
            }}>
              ← Back
            </button>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="app-container">
        <div className="sidebar">
          <ApiKeyInput onApiKeyChange={onApiKeyChange} />
          {view === 'new' && (
            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                id="eventName"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="My Bar Crawl Event"
              />
            </div>
          )}
          <BarInput onAddBar={handleAddBar} apiKey={apiKey} />
          
          <BarList title="All bars" 
            bars={bars.filter(bar => !barStopIDs.includes(bar._id))}
            handleRemoveButton={handleRemoveBar}
            handleAddButton={handleAddStop} />

          {optimizedRoute && (
            <>
              <RouteList route={optimizedRoute} />
              {view === 'new' && (
                <button 
                  className="create-event-btn"
                  onClick={handleCreateEvent}
                >
                  ✅ Create Event
                </button>
              )}
            </>
          )}
        </div>

        <div className="sidebar">
          <BarList title="Selected Bars"
          bars={stops}
          handleRemoveButton={handleRemoveStop}
          submitButton={createNewEvent}
          buttonText="Create Event"
          ></BarList>
        </div>

        <div className="map-container">
          {/* <RouteMap bars={bars} route={optimizedRoute} apiKey={apiKey} /> */}
        </div>
      </div>
    </div>
  )
}

// Geocode address to coordinates using Nominatim (OpenStreetMap)
// Returns [lat, long]
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

export default AdminView
