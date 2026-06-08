import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, Shield } from 'lucide-react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import Sidebar from './Sidebar'
import { useWebSocket } from '../hooks/useWebSocket'

function ChatRoom({ username, onLeave }) {
  const [activeRoom, setActiveRoom] = useState('general')
  const [input, setInput] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [showEncryption, setShowEncryption] = useState(false)
  const [channels, setChannels] = useState(['general'])
  const [channelMessages, setChannelMessages] = useState({ general: [] })
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  const {
    connected,
    onlineUsers,
    groupMessages,
    privateMessages,
    typingUsers,
    unreadCounts,
    sendGroupMessage,
    sendPrivateMessage,
    sendTyping,
    sendStopTyping,
    sendReaction,
    fetchPrivateHistory,
    clearUnread,
  } = useWebSocket(username)

  // sync group messages into general channel
  useEffect(() => {
    setChannelMessages(prev => ({ ...prev, general: groupMessages }))
  }, [groupMessages])

  // scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages, privateMessages, activeRoom])

  // fetch private history when switching to DM
  useEffect(() => {
    if (activeRoom !== 'general' && !channels.includes(activeRoom)) {
      fetchPrivateHistory(activeRoom)
      clearUnread(activeRoom)
    }
  }, [activeRoom])

  const isDM = !channels.includes(activeRoom)

  const currentMessages = isDM
    ? (privateMessages[activeRoom] || [])
    : (channelMessages[activeRoom] || [])

  const whoIsTyping = typingUsers[activeRoom]

  const handleSend = () => {
    if (!input.trim()) return
    if (isDM) {
      sendPrivateMessage(activeRoom, input)
    } else {
      sendGroupMessage(input)
    }
    setInput('')
    sendStopTyping(activeRoom)
    isTypingRef.current = false
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!isTypingRef.current) {
      isTypingRef.current = true
      sendTyping(activeRoom)
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      sendStopTyping(activeRoom)
    }, 2000)
  }

  const handleSelectRoom = (room) => {
    setActiveRoom(room)
    if (!channels.includes(room)) {
      clearUnread(room)
    }
  }

  const handleCreateChannel = (name) => {
    if (!channels.includes(name)) {
      setChannels(prev => [...prev, name])
      setChannelMessages(prev => ({ ...prev, [name]: [] }))
    }
    setActiveRoom(name)
  }

  const bg = darkMode ? '#0D0804' : '#FDF6EC'
  const headerBg = darkMode ? '#1A1208' : '#FFF8EE'
  const headerBorder = darkMode ? '#3D2A12' : '#E8D5B0'
  const inputBg = darkMode ? '#1A1208' : '#FFF8EE'
  const inputBorder = darkMode ? '#3D2A12' : '#E8D5B0'
  const textPrimary = darkMode ? '#F5E6CC' : '#1A1208'
  const textSecondary = darkMode ? '#8B6914' : '#8B6914'
  const messageBg = darkMode ? '#0D0804' : '#FDF6EC'

  return (
    <div className="flex h-screen" style={{ background: bg }}>

      {/* Sidebar */}
      <Sidebar
        username={username}
        onlineUsers={onlineUsers}
        unreadCounts={unreadCounts}
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        showEncryption={showEncryption}
        onToggleEncryption={() => setShowEncryption(!showEncryption)}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        channels={channels}
        onCreateChannel={handleCreateChannel}
        onLeave={onLeave}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}>
          <div className="flex items-center gap-3">

            {/* Back button for DMs */}
            {isDM && (
              <button
                onClick={() => setActiveRoom('general')}
                className="transition-colors hover:opacity-70"
                style={{ color: '#C17817' }}
              >
                <ArrowLeft className="w-5 h-5"/>
              </button>
            )}

            {/* Room avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                background: isDM ? '#2D1F0E' : '#C17817',
                color: isDM ? '#E8A838' : '#1A1208'
              }}>
              {isDM ? activeRoom[0].toUpperCase() : '#'}
            </div>

            <div>
              <h2 className="font-semibold text-sm" style={{ color: textPrimary }}>
                {isDM ? activeRoom : `# ${activeRoom}`}
              </h2>
              <p className="text-xs" style={{ color: textSecondary }}>
                {isDM ? 'Direct message' : `${onlineUsers.length} online`}
              </p>
            </div>
          </div>

          {/* Encrypted badge + connection */}
          <div className="flex items-center gap-2 rounded-full px-3 py-1"
            style={{ background: '#1A1208', border: '1px solid #3D2A12' }}>
            <Shield className="w-3.5 h-3.5" style={{ color: '#E8A838' }}/>
            <span className="text-xs font-medium" style={{ color: '#E8A838' }}>
              Encrypted
            </span>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}/>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4"
          style={{ background: messageBg }}>

          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#2D1F0E' }}>
                <span className="text-3xl">☕</span>
              </div>
              <p className="font-medium mb-1" style={{ color: '#8B6914' }}>
                {isDM
                  ? `Start a private chat with ${activeRoom}`
                  : `Welcome to #${activeRoom}!`
                }
              </p>
              <p className="text-sm" style={{ color: '#3D2A12' }}>
                All messages are AES encrypted 🔐
              </p>
            </div>
          )}

          {currentMessages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.from === username}
              onReact={!isDM ? sendReaction : null}
              showEncryption={showEncryption}
            />
          ))}

          {whoIsTyping && <TypingIndicator name={whoIsTyping}/>}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input */}
        <div className="px-4 py-4"
          style={{ background: headerBg, borderTop: `1px solid ${headerBorder}` }}>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                placeholder={isDM
                  ? `Message ${activeRoom}...`
                  : `Message #${activeRoom}...`
                }
                rows={1}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-colors"
                style={{
                  background: inputBg,
                  color: textPrimary,
                  border: `1px solid ${inputBorder}`,
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40"
              style={{ background: '#C17817' }}
            >
              <Send className="w-4 h-4" style={{ color: '#1A1208' }}/>
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: '#3D2A12' }}>
            WereWere · AES-128 encrypted · Press Enter to send
          </p>
        </div>

      </div>
    </div>
  )
}

export default ChatRoom