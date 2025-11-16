import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import ParticipantView from './components/ParticipantView'
import AdminView from './components/AdminView'
import CoordinatorView from './components/CoordinatorView'
import ErrorBoundary from './components/ErrorBoundary'
import { useCookies } from 'react-cookie';
import './App.css'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [user, setUser] = useState(null)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('google_maps_api_key') || ''
  })
  const [cookies, setCookie, removeCookie] = useCookies(['authCode', 'token'], {
    doNotParse: true,
  });

  useEffect(() => {
    //console.log(cookies.token)
    // Check if user is already logged in
    if (cookies.token) {
      // The user has a token.
      axios.get(`${API_URL}/auth/verify`, {
        headers: {
          'authorization': `Bearer ${cookies.token}`
        }
      }).then(res => {
        setUser({ role: 'admin', username: res.data.name });
      }).catch(err => {
        console.log(err)
        if (err.response.status === 401) {
          // Token is invalid, logout.
          handleLogout()
        }
      })
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    removeCookie('token', { path: '/' });
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
        <CoordinatorView user={user} onLogout={handleLogout} currentBar={user?.currentBar}/>
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
