import { useState } from 'react'
import JoinScreen from './components/JoinScreen'
import ChatRoom from './components/ChatRoom'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme() // Apply theme CSS variables on load

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('werewere_username') || null
  })

  const handleJoin = (name) => {
    localStorage.setItem('werewere_username', name)
    setUsername(name)
  }

  const handleGoHome = () => {
    setUsername(null)
  }

  const handleLeave = () => {
    localStorage.removeItem('werewere_username')
    setUsername(null)
  }

  return (
    <>
      {username
        ? <ChatRoom
            username={username}
            onLeave={handleLeave}
            onGoHome={handleGoHome}
          />
        : <JoinScreen
            onJoin={handleJoin}
            savedName={localStorage.getItem('werewere_username')}
          />
      }
    </>
  )
}

export default App