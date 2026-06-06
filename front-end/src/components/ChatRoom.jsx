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

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages, privateMessages, activeRoom])

  // fetch private history when switching to a DM
  useEffect(() => {
    if (activeRoom !== 'general') {
      fetchPrivateHistory(activeRoom)
      clearUnread(activeRoom)
    }
  }, [activeRoom])

  // get messages for current room
  const currentMessages = activeRoom === 'general'
    ? groupMessages
    : (privateMessages[activeRoom] || [])

  // who is typing in current room
  const whoIsTyping = typingUsers[activeRoom]

  const handleSend = () => {
    if (!input.trim()) return

    if (activeRoom === 'general') {
      sendGroupMessage(input)
    } else {
      sendPrivateMessage(activeRoom, input)
    }

    setInput('')

    // stop typing indicator
    sendStopTyping(activeRoom === 'general' ? 'general' : activeRoom)
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

    // send typing indicator
    if (!isTypingRef.current) {
      isTypingRef.current = true
      sendTyping(activeRoom === 'general' ? 'general' : activeRoom)
    }

    // reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      sendStopTyping(activeRoom === 'general' ? 'general' : activeRoom)
    }, 2000)
  }

  const handleSelectRoom = (room) => {
    setActiveRoom(room)
    if (room !== 'general') {
      clearUnread(room)
    }
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>

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
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">

        {/* Chat header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          darkMode
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            {activeRoom !== 'general' && (
              <button
                onClick={() => setActiveRoom('general')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Room avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
              activeRoom === 'general'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-white'
            }`}>
              {activeRoom === 'general' ? '#' : activeRoom[0].toUpperCase()}
            </div>

            <div>
              <h2 className={`font-semibold text-sm ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {activeRoom === 'general' ? '# general' : activeRoom}
              </h2>
              <p className="text-xs text-gray-500">
                {activeRoom === 'general'
                  ? `${onlineUsers.length} online`
                  : 'Direct message'
                }
              </p>
            </div>
          </div>

          {/* Encryption badge */}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-xs font-medium">Encrypted</span>
            {/* Connection dot */}
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400' : 'bg-red-400'
            }`} />
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">

          {/* Empty state */}
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-400 font-medium mb-1">
                {activeRoom === 'general'
                  ? 'Welcome to #general!'
                  : `Start a private chat with ${activeRoom}`
                }
              </p>
              <p className="text-gray-600 text-sm">
                All messages are AES encrypted 🔐
              </p>
            </div>
          )}

          {/* Messages */}
          {currentMessages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.from === username}
              onReact={activeRoom === 'general' ? sendReaction : null}
              showEncryption={showEncryption}
            />
          ))}

          {/* Typing indicator */}
          {whoIsTyping && (
            <TypingIndicator name={whoIsTyping} />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className={`px-4 py-4 border-t ${
          darkMode
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                placeholder={
                  activeRoom === 'general'
                    ? 'Message #general...'
                    : `Message ${activeRoom}...`
                }
                rows={1}
                className={`w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                  darkMode
                    ? 'bg-gray-800 text-white placeholder-gray-500 border border-gray-700'
                    : 'bg-gray-100 text-gray-800 placeholder-gray-400 border border-gray-200'
                }`}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          <p className="text-gray-600 text-xs mt-2 text-center">
            🔒 Messages encrypted with AES-128 · Press Enter to send
          </p>
        </div>

      </div>
    </div>
  )
}

export default ChatRoom