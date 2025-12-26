import { useState, useEffect, useCallback } from 'react'
import { findNextBar, setAttendeeCurrentBar, getAttendee, leaveBar, updateAttendeeLocation, updateAttendeeGroup, getBarWaitingList, getBars } from '../services/barCrawlService'
import { startReminderMonitoring, stopReminderMonitoring, requestNotificationPermission } from '../services/reminderService'
import axios from 'axios'
import './ParticipantView.css'
const API_URL = import.meta.env.VITE_API_URL

function ParticipantView({ user, apiKey, onLogout }) {
  const [currentBar, setCurrentBar] = useState(null)
  const [stop, setStop] = useState(null)

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

  function loadStop() {
    // axios({
    //     url: `${API_URL}/group/stop`,
    //     body: user.groupID || null,
    //   }).then(res => {
    //     setStop(res.data.stop)
    //   }).catch(err => {
    //     // TODO: Error checking
    //     console.error(err)
    //   });
    if (user.group === 1) {
      setStop({
        bar: {
          name: "Bar 1",
          address: "123 Some St."
        }
      });
    } else if (user.group === 2) {
      setStop({
        bar: {
          name: "Bar 2",
          address: "456 Main St."
        }
      });
    }
  }

  useEffect(() => {
    loadStop()
      // Refresh every 30 seconds to get updated capacity info
    const interval = setInterval(() => {
      loadStop();
    }, 30000)
      return () => clearInterval(interval)
  }, [])

  return (
    <div className="participant-view">
      <div className="participant-header">
        <div className="header-content">
          <div>
            <h1>Bar Crawl</h1>
            <p>Welcome, {user.username}</p>
          </div>
          {onLogout && (
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="participant-content">
        {stop ? (
          <div className="current-bar-card">
            <div className="bar-status-badge current">You're Here</div>
            <h2>{stop.bar.name}</h2>
            <p className="bar-address">{stop.bar.address}</p>
          </div>
        ) : (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Finding your next stop...</p>
              </div>
            )}
          </div>
      </div>
  )
}

export default ParticipantView

