import { useEffect, useState } from 'react'
import JoinScreen from './components/JoinScreen'
import ChatRoom from './components/ChatRoom'
import { useTheme } from './hooks/useTheme'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  useTheme()

  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('werewere_user') || 'null')
    } catch {
      return null
    }
  })
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('werewere_token'))
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!authToken || authUser) return
    fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Session expired')
        const data = await res.json()
        setAuthUser(data.user)
        localStorage.setItem('werewere_user', JSON.stringify(data.user))
      })
      .catch(() => {
        localStorage.removeItem('werewere_token')
        localStorage.removeItem('werewere_user')
        setAuthToken(null)
        setAuthUser(null)
      })
  }, [authToken, authUser])

  const handleAuthSuccess = (user, token) => {
    localStorage.setItem('werewere_user', JSON.stringify(user))
    localStorage.setItem('werewere_token', token)
    setAuthUser(user)
    setAuthToken(token)
    setSubmitError('')
  }

  const handleLogin = async (payload) => {
    setLoading(true)
    setSubmitError('')
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(Array.isArray(data.detail) ? data.detail.join(' ') : data.detail || 'Unable to sign in')
      }
      handleAuthSuccess(data.user, data.token)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (payload) => {
    setLoading(true)
    setSubmitError('')
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(Array.isArray(data.detail) ? data.detail.join(' ') : data.detail || 'Unable to create account')
      }
      handleAuthSuccess(data.user, data.token)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = () => {
    localStorage.removeItem('werewere_token')
    localStorage.removeItem('werewere_user')
    setAuthUser(null)
    setAuthToken(null)
  }

  return authUser && authToken ? (
    <ChatRoom
      username={authUser.username}
      authToken={authToken}
      onLeave={handleLeave}
      onGoHome={handleLeave}
      onLogout={handleLeave}
    />
  ) : (
    <JoinScreen
      onLogin={handleLogin}
      onRegister={handleRegister}
      loading={loading}
      submitError={submitError}
    />
  )
}

export default App