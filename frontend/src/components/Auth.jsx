import { useState } from 'react'
import BarSelectionList from './BarSelectionList'
import './Auth.css'
import axios from 'axios'
import { useCookies } from 'react-cookie'

const API_URL = import.meta.env.VITE_API_URL

function Auth({ onLogin }) {
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')

  const [eventCode, setEventCode] = useState('')
  const [eventName, setEventName] = useState('')
  const [coordinatorCode, setCoordinatorCode] = useState('')

  const [isAdmin, setIsAdmin] = useState(false)
  const [showGroupSelection, setShowGroupSelection] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [invalidEventCode, setInvalidEventCode] = useState(false)
  const [groups, setGroups] = useState([])
  const [showCoordinatorPrompt, setShowCoordinatorPrompt] = useState(false)

  const [showBarSelection, setShowBarSelection] = useState(false)
  const [invalidAdminCredentials, setInvalidAdminCredentials] = useState(false)
  const [submittingCoord, setSubmittingCoord] = useState(false)
  const [stops, setStops] = useState([])

  const [cookies, setCookie, removeCookie] = useCookies(['authCode', 'coordCode', 'token', 'coordinatorStopID'], {
    doNotParse: true,
  });

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    
    if (isAdmin) {
      axios.post(`${API_URL}/auth/login`, {
        email: username.trim(),
        password: password.trim()
      }).then(res => {
        setCookie('token', res.data, { path: '/' });
        onLogin({ role: 'admin', username });
      }).catch(err => {
        console.log(err)
        if (err.response.status === 401) {
          // Error message for invalid admin credentials.
          setInvalidAdminCredentials(true)
        }
      })
    } else {
      // Participant login - validate event code (required)
      if (!eventCode.trim()) {
        alert('Please enter an event code')
        return
      }
      
      // Event code must be exactly 6 alphanumeric characters
      const eventCodeRegex = /^[A-Z0-9]{6}$/
      if (!eventCodeRegex.test(eventCode.trim())) {
        alert('Event code must be exactly 6 alphanumeric characters (letters and numbers only)')
        return
      }
      
      // Phone number is optional - if provided, validate format
      if (phoneNumber.trim()) {
        // Basic phone number validation (only if provided)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/
        if (!phoneRegex.test(phoneNumber.trim())) {
          alert('Please enter a valid phone number or leave it blank')
          return
        }
      }

      axios.post(`${API_URL}/event/join/${eventCode.trim().toUpperCase()}`).then(res => {
        setGroups(res.data)
        setShowGroupSelection(true)
      }).catch(err => {
        if (err.response.status === 404) {
          setInvalidEventCode(true)
        }
      })
    }
  }

  const handleGroupSelect = (groupNumber) => {
    setSelectedGroup(groupNumber)
    onLogin({ 
      role: 'participant', 
      username: username.trim() || `User ${Date.now()}`,
      phoneNumber: phoneNumber.trim() || null,
      group: groupNumber,
      eventCode: eventCode.trim().toUpperCase(),
      isCoordinator: false
    })
  }

  const handleCoordinatorClick = () => {
    setShowCoordinatorPrompt(true)
  }

  const handleCoordinatorSubmit = async () => {
    if (!coordinatorCode.trim() || coordinatorCode.trim().length !== 6) {
      // TODO: Error message
    }

    // Verify code
    axios({
      method: 'get',
      url: `${API_URL}/event/code/${coordinatorCode.trim().toUpperCase()}`,
    }).then(res => {
      // Valid code
      setShowCoordinatorPrompt(false)
      setShowBarSelection(true)
      setEventName(res.data.name || 'Bar Crawl Event')
      setStops(res.data.stops || [])
    }).catch(err => {
      // invalid code or something went wrong.
      setInvalidEventCode(true);
    })

    // Show bar selection after code validation
    
  }

  const handleBackToUsername = () => {
    setShowGroupSelection(false)
    setSelectedGroup(null)
    // Keep username and phone when going back
  }

  const handleBarSelect = async (stopId) => {
    const selectedStop = stops.find(b => b._id === stopId)
    
    if (!selectedStop) {
      // TODO: Error handling
      throw new Error('Bar not found');
    }

    setCookie('coordCode', coordinatorCode.trim().toUpperCase(), { path: '/' });
    setCookie('coordinatorStopID', stopId, { path: '/' });

    // Login as coordinator
    onLogin({ 
      role: 'coordinator', 
      username: username.trim() || `Coordinator ${Date.now()}`,
      phoneNumber: phoneNumber.trim() || null,
      coordCode: coordinatorCode.trim().toUpperCase(),
      currentStop: selectedStop,
      isCoordinator: true
    })
  }

  // Show bar selection after coordinator code validation
  if (showBarSelection && !isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>{eventName}</h1>
          <p className="auth-subtitle">Select Your Bar</p>
          
          <div className="bar-selection-prompt">
            <p className="coordinator-instruction">
              Which bar are you coordinating at?
            </p>
            <BarSelectionList 
              eventCode={coordinatorCode.trim().toUpperCase()}
              bars={stops}
              onBarSelect={handleBarSelect}
              onBack={() => {
                setShowBarSelection(false)
                setShowCoordinatorPrompt(true)
                setCoordinatorCode('')
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  let handleResetEventCode = () => {
    setInvalidEventCode(false)
    setEventCode('')
  }

  if (invalidEventCode) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Invalid Event Code</h1>
          <p className="auth-subtitle">Ask your coordinator for another code.</p>

          <button 
            type="button" 
            className="back-button"
            onClick={handleResetEventCode}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // Show coordinator code prompt
  if (showCoordinatorPrompt && !isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Bar Crawl</h1>
          <p className="auth-subtitle">Become a Coordinator</p>
          
          <div className="coordinator-prompt">
            <p className="coordinator-instruction">
              Enter the 6-digit coordinator code
            </p>
            <p className="coordinator-hint">
              Coordinators manage groups at their assigned bar
            </p>
            
            <div className="form-group">
              <label htmlFor="coordinatorCode">Coordinator Code (6 digits)</label>
              <input
                id="coordinatorCode"
                type="text"
                value={coordinatorCode}
                onChange={(e) => {
                  // Only allow digits, max 4 characters
                  // const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCoordinatorCode(e.target.value.toUpperCase().slice(0, 6))
                }}
                placeholder="B2C3D4"
                maxLength={6}
                pattern="[0-9A-Z]{6}"
              />
            </div>

            <div className="coordinator-buttons">
              <button 
                type="button" 
                className="coordinator-submit-btn"
                onClick={handleCoordinatorSubmit}
                disabled={coordinatorCode.length !== 6}
              >
                Submit Code
              </button>
            </div>
          </div>

          <button 
            type="button" 
            className="back-button"
            onClick={() => {
              setShowCoordinatorPrompt(false)
              setCoordinatorCode('')
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // Show group selection for participants
  if (showGroupSelection && !isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Bar Crawl</h1>
          <p className="auth-subtitle">Select your group</p>
          {username.trim() && (
            <p className="group-username">Username: <strong>{username}</strong></p>
          )}
          
          <div className="group-selection">
            <p className="group-instruction">Choose your group number:</p>
            <div className="group-grid">
              {groups.map(({_id, number}) => (
                <button
                  key={_id}
                  type="button"
                  className={`group-button ${selectedGroup === _id ? 'selected' : ''}`}
                  onClick={() => handleGroupSelect(number)}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="button" 
            className="back-button"
            onClick={handleBackToUsername}
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // Regular screen for all participants.
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🍺 Bar Crawl</h1>
        <p className="auth-subtitle">Welcome! Please sign in to continue.</p>
        
        <div className="auth-toggle">
          <button
            type="button"
            className={!isAdmin ? 'active' : ''}
            onClick={() => {
              setIsAdmin(false)
              setShowGroupSelection(false)
              setSelectedGroup(null)
            }}
          >
            Participant
          </button>
          <button
            type="button"
            className={isAdmin ? 'active' : ''}
            onClick={() => {
              setIsAdmin(true)
              setShowGroupSelection(false)
              setSelectedGroup(null)
            }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleUsernameSubmit} className="auth-form">
          {!isAdmin && (
            <div className="form-group">
              <label htmlFor="eventCode">Event Code *</label>
              <input
                id="eventCode"
                type="text"
                value={eventCode}
                onChange={(e) => {
                  // Only allow alphanumeric characters, max 6 characters
                  const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()
                  setEventCode(value)
                }}
                placeholder="ABC123"
                required
                maxLength={6}
                pattern="[A-Za-z0-9]{6}"
              />
              <small className="form-hint">Enter the 6-character event code</small>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username {!isAdmin && '(Optional)'}</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isAdmin ? "admin" : "Enter your name (optional)"}
              required={isAdmin}
            />
          </div>
          
          {!isAdmin && (
            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567 (optional)"
              />
              <small className="form-hint">We'll send you reminders when it's time to leave your bar. Browser notifications will work even without a phone number.</small>
            </div>
          )}
          
          {isAdmin && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {isAdmin ? 'Login as Admin' : 'Continue'}
          </button>

          {!isAdmin && <div className="coordinator-option">
            <button 
              type="button" 
              className="coordinator-button"
              onClick={handleCoordinatorClick}
            >
              Coordinator
            </button>
          </div>}
        </form>
      </div>
    </div>
  )
}

export default Auth


