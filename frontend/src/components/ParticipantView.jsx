import { useState, useEffect, useCallback } from 'react'
import { findNextBar, setAttendeeCurrentBar, getAttendee, leaveBar, updateAttendeeLocation, updateAttendeeGroup, getBarWaitingList, getBars } from '../services/barCrawlService'
import { startReminderMonitoring, stopReminderMonitoring, requestNotificationPermission } from '../services/reminderService'
import './ParticipantView.css'

function ParticipantView({ user, apiKey, onLogout }) {
  const [nextBar, setNextBar] = useState(null)
  const [currentBar, setCurrentBar] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  // Safety check
  if (!user || !user.username) {
    return (
      <div className="participant-view">
        <div className="participant-content">
          <div className="error-state">
            <p>Error: User information not available. Please log in again.</p>
          </div>
        </div>
      </div>
    )
  }

  // Ensure phoneNumber exists (for backward compatibility)
  if (!user.phoneNumber) {
    console.warn('User missing phoneNumber, reminders may not work')
  }

  const findNextAvailableBar = useCallback(async (location = null) => {
    setIsLoading(true)
    setError(null)
    try {
      const next = await findNextBar(user.username, location, apiKey)
      setNextBar(next)
    } catch (err) {
      setError('Unable to find next bar. Please try again.')
      console.error('Error finding next bar:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user.username, apiKey])

  const loadCurrentBar = useCallback(async () => {
    try {
      const attendee = await getAttendee(user.username)
      if (attendee.currentBarId) {
        // Get bar details - try API first, then fallback to localStorage
        const bars = await getBars()
        const bar = bars.find(b => b.id === attendee.currentBarId)
        setCurrentBar(bar || null)
        
        // If user has a current bar, start reminder monitoring
        if (bar) {
          try {
            startReminderMonitoring(
              user.username,
              user.phoneNumber || null,
              bar.name
            )
          } catch (err) {
            console.error('Error starting reminder monitoring:', err)
          }
        }
      } else {
        setCurrentBar(null)
        // Stop reminders if no current bar
        stopReminderMonitoring(user.username)
      }
    } catch (err) {
      console.error('Error loading current bar:', err)
      setCurrentBar(null)
    }
  }, [user.username, user.phoneNumber])

  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude]
          setUserLocation(location)
          updateAttendeeLocation(user.username, location)
          findNextAvailableBar(location)
        },
        (error) => {
          console.warn('Location access denied:', error)
          findNextAvailableBar(null)
        }
      )
    } else {
      findNextAvailableBar(null)
    }
  }, [findNextAvailableBar, user.username])

  useEffect(() => {
    // Request notification permission on mount
    const requestPermission = async () => {
      try {
        await requestNotificationPermission()
      } catch (err) {
        console.warn('Failed to request notification permission:', err)
      }
    }
    requestPermission()
    
    const initialize = async () => {
      try {
        await loadCurrentBar()
        requestLocation()
        // Store group in attendee data if available
        if (user.group) {
          await updateAttendeeGroup(user.username, user.group)
        }
      } catch (err) {
        console.error('Error in initial load:', err)
        setError('Error loading data. Please refresh the page.')
      }
    }
    initialize()
    
    // Cleanup: stop reminders when component unmounts
    return () => {
      stopReminderMonitoring(user.username)
    }
  }, [loadCurrentBar, requestLocation, user.username, user.group])

  useEffect(() => {
    // Refresh every 30 seconds to get updated capacity info
    const interval = setInterval(() => {
      loadCurrentBar()
      if (!currentBar) {
        findNextAvailableBar(userLocation)
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [currentBar, loadCurrentBar, findNextAvailableBar, userLocation])

  const handleArriveAtBar = () => {
    if (nextBar) {
      setAttendeeCurrentBar(user.username, nextBar.id)
      setCurrentBar(nextBar)
      setNextBar(null)
      
      // Start reminder monitoring when user arrives at a bar
      if (user.phoneNumber) {
        startReminderMonitoring(
          user.username,
          user.phoneNumber,
          nextBar.name
        )
      } else {
        // Still start monitoring for browser notifications even without phone
        startReminderMonitoring(
          user.username,
          null,
          nextBar.name
        )
      }
    }
  }

  const handleLeaveBar = () => {
    leaveBar(user.username)
    setCurrentBar(null)
    // Stop reminder monitoring when user leaves
    stopReminderMonitoring(user.username)
    findNextAvailableBar()
  }

  const handleRefresh = () => {
    requestLocation()
    if (!userLocation) {
      findNextAvailableBar()
    }
  }

  return (
    <div className="participant-view">
      <div className="participant-header">
        <div className="header-content">
          <div>
            <h1>🍺 Bar Crawl</h1>
            <p>Welcome, {user.username}! {user.isCoordinator === true && <span className="coordinator-badge">👑 Coordinator</span>}</p>
          </div>
          {onLogout && (
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="participant-content">
        {currentBar ? (
          <div className="current-bar-card">
            <div className="bar-status-badge current">You're Here</div>
            <h2>{currentBar.name}</h2>
            <p className="bar-address">{currentBar.address}</p>
            <div className="bar-stats">
              <div className="stat">
                <span className="stat-label">Capacity</span>
                <span className="stat-value">
                  {currentBar.currentAttendees || 0} / {currentBar.capacity}
                </span>
              </div>
            </div>
            {user.isCoordinator === true ? (
              <button 
                className="action-btn leave-btn"
                onClick={handleLeaveBar}
              >
                Leave This Bar
              </button>
            ) : (
              <div className="coordinator-only-notice">
                <p>Only coordinators can leave bars. Please contact your coordinator if you need to leave.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="next-bar-card">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Finding your next stop...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button className="action-btn" onClick={handleRefresh}>
                  Try Again
                </button>
              </div>
            ) : nextBar ? (
              <>
                <div className="bar-status-badge next">Next Stop</div>
                <h2>{nextBar.name}</h2>
                <p className="bar-address">{nextBar.address}</p>
                <div className="bar-stats">
                  <div className="stat">
                    <span className="stat-label">Available Spots</span>
                    <span className="stat-value available">
                      {nextBar.capacity - (nextBar.currentAttendees || 0)} / {nextBar.capacity}
                    </span>
                  </div>
                </div>
                {user.isCoordinator === true ? (
                  <>
                    <button 
                      className="action-btn arrive-btn"
                      onClick={handleArriveAtBar}
                    >
                      I've Arrived
                    </button>
                    <button 
                      className="action-btn secondary-btn"
                      onClick={handleRefresh}
                    >
                      Find Another Bar
                    </button>
                  </>
                ) : (
                  <div className="coordinator-only-notice">
                    <p>Only coordinators can mark arrival or find another bar. Please contact your coordinator.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="no-bars-state">
                <p>No bars available at the moment.</p>
                <p className="subtext">All bars may be at capacity, or no bars have been added yet.</p>
                <button className="action-btn" onClick={handleRefresh}>
                  Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ParticipantView

