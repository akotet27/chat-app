import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, Shield, Mic, X, AtSign, Hash, Users } from 'lucide-react'
import MessageBubble from './MessageBubble'
import SiniCupIcon from './SiniCupIcon'
import TypingIndicator from './TypingIndicator'
import Sidebar from './Sidebar'
import AppearanceMenu from './AppearanceMenu'
import ProfileCard from './ProfileCard'
import SearchPanel from './SearchPanel'
import { VoiceRecorder } from './VoiceNote'
import { useWebSocket } from '../hooks/useWebSocket'
import { useTheme } from '../hooks/useTheme'
import { Avatar } from './ProfileCard'

function ChatRoom({ username, onLeave, onGoHome }) {
  const { theme, themeName, setTheme } = useTheme()
  const c = theme.colors

  const [activeRoom, setActiveRoom] = useState('general')
  const [input, setInput] = useState('')
  const [showEncryption, setShowEncryption] = useState(false)
  const [channels, setChannels] = useState(['general'])
  const [groups, setGroups] = useState([])
  const [channelMessages, setChannelMessages] = useState({ general: [] })
  const [groupMessages2, setGroupMessages2] = useState({})
  const [showAppearance, setShowAppearance] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [status, setStatus] = useState(() =>
    localStorage.getItem('werewere_status') || 'online'
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const inputRef = useRef(null)

  const {
    connected, onlineUsers, groupMessages,
    privateMessages, typingUsers, unreadCounts,
    sendGroupMessage, sendPrivateMessage, sendVoiceNote,
    sendTyping, sendStopTyping, sendReaction,
    fetchPrivateHistory, clearUnread,
  } = useWebSocket(username)

  // Sync group messages into general channel
  useEffect(() => {
    setChannelMessages(prev => ({ ...prev, general: groupMessages }))
  }, [groupMessages])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages, privateMessages, groupMessages2, activeRoom])

  // Fetch private history when switching to DM
  useEffect(() => {
    const isDM = !channels.includes(activeRoom) && !activeRoom.startsWith('group:')
    if (isDM) {
      fetchPrivateHistory(activeRoom)
      clearUnread(activeRoom)
    }
  }, [activeRoom])

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isChannel = channels.includes(activeRoom)
  const isGroup = activeRoom.startsWith('group:')
  const isDM = !isChannel && !isGroup

  const getCurrentGroup = () => {
    if (!isGroup) return null
    const groupId = activeRoom.replace('group:', '')
    return groups.find(g => g.id === groupId)
  }

  const currentMessages = isChannel
    ? (channelMessages[activeRoom] || [])
    : isGroup
      ? (groupMessages2[activeRoom] || [])
      : (privateMessages[activeRoom] || [])

  const whoIsTyping = typingUsers[
    isChannel ? activeRoom : isDM ? activeRoom : activeRoom
  ]

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
    // @ mentions popup
    if (e.key === '@') {
      setShowMentions(true)
    } else if (showMentions && e.key === 'Escape') {
      setShowMentions(false)
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInput(val)

    // Show mentions popup when @ is typed
    const lastAtSign = val.lastIndexOf('@')
    if (lastAtSign !== -1) {
      const afterAt = val.slice(lastAtSign + 1)
      if (!afterAt.includes(' ')) {
        setShowMentions(true)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }

    // Typing indicator
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

  const insertMention = (user) => {
    const lastAt = input.lastIndexOf('@')
    const newInput = input.slice(0, lastAt) + `@${user} `
    setInput(newInput)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const handleSelectRoom = (room) => {
    setActiveRoom(room)
    if (!channels.includes(room) && !room.startsWith('group:')) {
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

  const handleCreateGroup = (name, members) => {
    const groupId = `${name}-${Date.now()}`
    const newGroup = {
      id: groupId,
      name,
      members: [username, ...members],
    }
    setGroups(prev => [...prev, newGroup])
    setGroupMessages2(prev => ({ ...prev, [`group:${groupId}`]: [] }))
    setActiveRoom(`group:${groupId}`)
  }


const handleVoiceSend = ({ audio, duration }) => {
  if (isDM) {
    //sends through WebSocket → server → other person receives it
    sendVoiceNote(activeRoom, audio, duration)
  } else {
    // For channels — add locally since group voice isn't on backend yet
    const msg = {
      id: Date.now(),
      from: username,
      voiceNote: audio,
      voiceDuration: duration,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit'
      }),
      reactions: {},
    }
    setChannelMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), msg],
    }))
  }
  setShowVoice(false)
}

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    localStorage.setItem('werewere_status', newStatus)
  }

  // Get room display info
  const getRoomInfo = () => {
    if (isChannel) return { name: `# ${activeRoom}`, sub: `${onlineUsers.length} online`, icon: <Hash className="w-4 h-4" /> }
    if (isGroup) {
      const g = getCurrentGroup()
      return { name: g?.name || 'Group', sub: `${g?.members.length || 0} members`, icon: <Users className="w-4 h-4" /> }
    }
    return { name: activeRoom, sub: 'Direct message', icon: <Avatar username={activeRoom} size={20} /> }
  }

  const roomInfo = getRoomInfo()

  // Mentions filter
  const mentionQuery = (() => {
    const lastAt = input.lastIndexOf('@')
    if (lastAt === -1) return ''
    return input.slice(lastAt + 1)
  })()

  const mentionSuggestions = onlineUsers.filter(u =>
    u !== username &&
    u.toLowerCase().startsWith(mentionQuery.toLowerCase())
  )

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: c.bg }}
    >
      {/* Sidebar — hidden on mobile unless toggled */}
      <div
        className={`
          flex-shrink-0 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
          md:w-64
        `}
      >
        <Sidebar
          username={username}
          status={status}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
          activeRoom={activeRoom}
          onSelectRoom={room => { handleSelectRoom(room); setSidebarOpen(false) }}
          showEncryption={showEncryption}
          onToggleEncryption={() => setShowEncryption(!showEncryption)}
          channels={channels}
          onCreateChannel={handleCreateChannel}
          groups={groups}
          onCreateGroup={handleCreateGroup}
          onLeave={onLeave}
          onGoHome={onGoHome}
          onOpenSearch={() => setShowSearch(true)}
          onOpenAppearance={() => setShowAppearance(true)}
          onOpenProfile={() => setShowProfile(true)}
          theme={theme}
        />
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: c.bgSecondary, borderBottom: `1px solid ${c.border}` }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: c.bgTertiary, color: c.textMuted }}
            >
              <Hash className="w-4 h-4" />
            </button>

            {/* Back button for DMs on mobile */}
            {isDM && (
              <button
                onClick={() => setActiveRoom('general')}
                className="md:hidden"
                style={{ color: c.primary }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Room info */}
            <div className="flex items-center gap-2">
              <div style={{ color: c.primary }}>
                {roomInfo.icon}
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: c.text }}>
                  {roomInfo.name}
                </h2>
                <p className="text-xs" style={{ color: c.textMuted }}>
                  {roomInfo.sub}
                </p>
              </div>
            </div>
          </div>

          {/* Right side — encrypted badge */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: c.bgTertiary, border: `1px solid ${c.border}` }}
          >
            <Shield className="w-3.5 h-3.5" style={{ color: c.primary }} />
            <span className="text-xs font-medium hidden sm:block" style={{ color: c.primary }}>
              Encrypted
            </span>
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: connected ? c.online : '#FF5252' }}
            />
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ background: c.bg }}
        >
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center select-none">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: c.bgSecondary }}
              >
                <SiniCupIcon className="w-8 h-8" color={c.primary} strokeWidth={2} />
              </div>
              <p className="font-semibold mb-1" style={{ color: c.textMuted }}>
                {isDM ? `Start a private chat with ${activeRoom}` : isGroup ? `Welcome to ${getCurrentGroup()?.name}!` : `Welcome to #${activeRoom}!`}
              </p>
              <p className="text-sm" style={{ color: c.textFaint }}>
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
              onlineUsers={onlineUsers}
              currentUser={username}
              theme={theme}
            />
          ))}

          {whoIsTyping && <TypingIndicator name={whoIsTyping} theme={theme} />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ background: c.bgSecondary, borderTop: `1px solid ${c.border}` }}
        >
          {/* Voice recorder */}
          {showVoice ? (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setShowVoice(false)}
              theme={theme}
            />
          ) : (
            <div className="relative">

              {/* Mention suggestions */}
              {showMentions && mentionSuggestions.length > 0 && (
                <div
                  className="absolute bottom-full mb-2 left-0 rounded-2xl border shadow-xl overflow-hidden z-20"
                  style={{ background: c.bgSecondary, borderColor: c.border, minWidth: '180px' }}
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold px-2 pb-1" style={{ color: c.textFaint }}>
                      Mention someone
                    </p>
                    {mentionSuggestions.map(user => (
                      <button
                        key={user}
                        onClick={() => insertMention(user)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors text-left"
                        style={{ color: c.text }}
                        onMouseEnter={e => e.currentTarget.style.background = c.bgTertiary}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Avatar username={user} size={24} />
                        <span className="text-sm font-medium">{user}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2">
                {/* Voice note button */}
                <button
                  onClick={() => setShowVoice(true)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: c.bgTertiary, color: c.textMuted }}
                  onMouseEnter={e => e.currentTarget.style.background = c.border}
                  onMouseLeave={e => e.currentTarget.style.background = c.bgTertiary}
                  title="Voice note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKey}
                    placeholder={
                      isDM ? `Message ${activeRoom}...`
                        : isGroup ? `Message ${getCurrentGroup()?.name}...`
                          : `Message #${activeRoom}...`
                    }
                    rows={1}
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm resize-none focus:outline-none transition-colors"
                    style={{
                      background: c.bgTertiary,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      minHeight: '42px',
                      maxHeight: '120px',
                    }}
                    onInput={e => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                  />
                  {/* @ mention button inside input */}
                  <button
                    onClick={() => {
                      setInput(prev => prev + '@')
                      inputRef.current?.focus()
                    }}
                    className="absolute right-3 bottom-2.5 transition-colors"
                    style={{ color: c.textFaint }}
                    onMouseEnter={e => e.currentTarget.style.color = c.primary}
                    onMouseLeave={e => e.currentTarget.style.color = c.textFaint}
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                </div>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !connected}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: c.primary }}
                  onMouseEnter={e => { if (input.trim()) e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Send className="w-4 h-4" style={{ color: c.bg }} />
                </button>
              </div>

              <p className="text-xs mt-2 text-center flex items-center justify-center gap-1" style={{ color: c.textFaint }}>
                <SiniCupIcon className="w-3.5 h-3.5" color={c.textFaint} strokeWidth={2} />
                WereWere · AES encrypted · Enter to send · @ to mention
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showAppearance && (
        <AppearanceMenu
          onClose={() => setShowAppearance(false)}
          currentTheme={themeName}
          onSelectTheme={setTheme}
          theme={theme}
        />
      )}

      {showProfile && (
        <ProfileCard
          username={username}
          status={status}
          onStatusChange={handleStatusChange}
          onClose={() => setShowProfile(false)}
          theme={theme}
        />
      )}

      {showSearch && (
        <SearchPanel
          onClose={() => setShowSearch(false)}
          groupMessages={groupMessages}
          privateMessages={privateMessages}
          username={username}
          onlineUsers={onlineUsers}
          onSelectRoom={handleSelectRoom}
          theme={theme}
        />
      )}
    </div>
  )
}

export default ChatRoom