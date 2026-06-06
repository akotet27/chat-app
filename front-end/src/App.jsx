import { useState } from 'react'
import JoinScreen from './components/JoinScreen'
import ChatRoom from './components/ChatRoom'

function App() {
  const [username, setUsername] = useState(null)

  const handleJoin = (name) => {
    setUsername(name)
  }

  const handleLeave = () => {
    setUsername(null)
  }

  return (
    <>
      {username
        ? <ChatRoom username={username} onLeave={handleLeave} />
        : <JoinScreen onJoin={handleJoin} />
      }
    </>
  )
}

export default App