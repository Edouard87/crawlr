import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import ParticipantView from './components/ParticipantView'
import AdminView from './components/AdminView'
import CoordinatorView from './components/CoordinatorView'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('google_maps_api_key') || ''
  })

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('bar_crawl_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Ensure isCoordinator is explicitly set for participants
        if (parsedUser.role === 'participant' && parsedUser.isCoordinator === undefined) {
          parsedUser.isCoordinator = false
        }
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing saved user:', error)
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('bar_crawl_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('bar_crawl_user')
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <Auth onLogin={handleLogin} />
      </ErrorBoundary>
    )
  }

  if (user.role === 'coordinator') {
    return (
      <ErrorBoundary>
        <CoordinatorView user={user} onLogout={handleLogout} />
      </ErrorBoundary>
    )
  }

  if (user.role === 'participant') {
    return (
      <ErrorBoundary>
        <ParticipantView user={user} apiKey={apiKey} onLogout={handleLogout} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <AdminView user={user} apiKey={apiKey} onLogout={handleLogout} onApiKeyChange={setApiKey} />
    </ErrorBoundary>
  )
}

export default App
