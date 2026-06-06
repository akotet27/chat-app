import { useState } from 'react'
import JoinScreen from './components/JoinScreen'
import ChatRoom from './components/ChatRoom'

function App() {
  const [username, setUsername] = useState(null)

  return (
    <>
      {username
        ? <ChatRoom username={username} onLeave={() => setUsername(null)} />
        : <JoinScreen onJoin={name => setUsername(name)} />
      }
    </>
  )
}

export default App