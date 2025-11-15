import { useState } from 'react'
import BarSelectionList from './BarSelectionList'
import './Auth.css'

function Auth({ onLogin }) {
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [eventCode, setEventCode] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showGroupSelection, setShowGroupSelection] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showCoordinatorPrompt, setShowCoordinatorPrompt] = useState(false)
  const [coordinatorCode, setCoordinatorCode] = useState('')
  const [showBarSelection, setShowBarSelection] = useState(false)

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    
    if (isAdmin) {
      // Admin login - check credentials (no event code required)
      if (username === 'admin' && password === 'admin') {
        onLogin({ role: 'admin', username })
      } else {
        alert('Invalid admin credentials. Use: admin/admin')
      }
    } else {
      // Participant login - validate event code (required)
      if (!eventCode.trim()) {
        alert('Please enter an event code')
        return
      }
      
      // Event code must be exactly 6 alphanumeric characters
      const eventCodeRegex = /^[A-Za-z0-9]{6}$/
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
      setShowGroupSelection(true)
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
    if (!coordinatorCode.trim() || coordinatorCode.trim().length !== 4) {
      alert('Please enter a valid 4-digit coordinator code')
      return
    }

    // Validate coordinator code
    const { validateCoordinatorCode } = await import('../services/eventService')
    const isValid = validateCoordinatorCode(eventCode.trim().toUpperCase(), coordinatorCode.trim())
    
    if (!isValid) {
      alert('Invalid coordinator code. Please try again.')
      setCoordinatorCode('')
      return
    }

    // Show bar selection after code validation
    setShowCoordinatorPrompt(false)
    setShowBarSelection(true)
  }

  const handleBarSelect = async (barId) => {
    const { getBars } = await import('../services/barCrawlService')
    const bars = getBars()
    const selectedBar = bars.find(b => b.id === barId)
    
    if (!selectedBar) {
      alert('Bar not found')
      return
    }

    // Login as coordinator
    onLogin({ 
      role: 'coordinator', 
      username: username.trim() || `Coordinator ${Date.now()}`,
      phoneNumber: phoneNumber.trim() || null,
      eventCode: eventCode.trim().toUpperCase(),
      currentBarId: barId,
      isCoordinator: true
    })
  }

  const handleBackToUsername = () => {
    setShowGroupSelection(false)
    setSelectedGroup(null)
    // Keep username and phone when going back
  }

  // Show bar selection after coordinator code validation
  if (showBarSelection && !isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>🍺 Bar Crawl</h1>
          <p className="auth-subtitle">Select Your Bar</p>
          
          <div className="bar-selection-prompt">
            <p className="coordinator-instruction">
              Which bar are you coordinating at?
            </p>
            <BarSelectionList 
              eventCode={eventCode.trim().toUpperCase()}
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

  // Show coordinator code prompt
  if (showCoordinatorPrompt && !isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>🍺 Bar Crawl</h1>
          <p className="auth-subtitle">Become a Coordinator</p>
          
          <div className="coordinator-prompt">
            <p className="coordinator-instruction">
              Enter the 4-digit coordinator code
            </p>
            <p className="coordinator-hint">
              Coordinators manage groups at their assigned bar
            </p>
            
            <div className="form-group">
              <label htmlFor="coordinatorCode">Coordinator Code (4 digits)</label>
              <input
                id="coordinatorCode"
                type="text"
                value={coordinatorCode}
                onChange={(e) => {
                  // Only allow digits, max 4 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setCoordinatorCode(value)
                }}
                placeholder="1234"
                maxLength={4}
                pattern="[0-9]{4}"
              />
            </div>

            <div className="coordinator-buttons">
              <button 
                type="button" 
                className="coordinator-submit-btn"
                onClick={handleCoordinatorSubmit}
                disabled={coordinatorCode.length !== 4}
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
          <h1>🍺 Bar Crawl</h1>
          <p className="auth-subtitle">Select your group</p>
          {username.trim() && (
            <p className="group-username">Username: <strong>{username}</strong></p>
          )}
          
          <div className="group-selection">
            <p className="group-instruction">Choose your group number (1-20):</p>
            <div className="group-grid">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((groupNum) => (
                <button
                  key={groupNum}
                  type="button"
                  className={`group-button ${selectedGroup === groupNum ? 'selected' : ''}`}
                  onClick={() => handleGroupSelect(groupNum)}
                >
                  {groupNum}
                </button>
              ))}
            </div>
          </div>

          <div className="coordinator-option">
            <button 
              type="button" 
              className="coordinator-button"
              onClick={handleCoordinatorClick}
            >
              👑 Coordinator
            </button>
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
        </form>

        {isAdmin && (
          <div className="auth-hint">
            <p>Demo credentials: <strong>admin / admin</strong></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth


