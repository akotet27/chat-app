import { MessageCircle, Eye, EyeOff, Users, Plus, X } from 'lucide-react'
import { useState } from 'react'

function SiniIconSmall() {
  return (
    <svg width="28" height="28" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="58" fill="#C17817"/>
      <rect x="14" y="8" width="28" height="22" rx="6" fill="#1A1208"/>
      <polygon points="20,30 15,40 28,30" fill="#1A1208"/>
      <circle cx="21" cy="19" r="2" fill="#C17817"/>
      <circle cx="28" cy="19" r="2" fill="#C17817"/>
      <circle cx="35" cy="19" r="2" fill="#C17817"/>
      <rect x="68" y="4" width="22" height="18" rx="5" fill="#2D1F0E"/>
      <polygon points="82,22 90,30 76,22" fill="#2D1F0E"/>
      <circle cx="74" cy="13" r="1.8" fill="#C17817"/>
      <circle cx="81" cy="13" r="1.8" fill="#C17817"/>
      <circle cx="88" cy="13" r="1.8" fill="#C17817"/>
      <ellipse cx="60" cy="98" rx="34" ry="5" fill="#8B5E10"/>
      <ellipse cx="60" cy="97" rx="30" ry="4" fill="#F5F0E8"/>
      <ellipse cx="60" cy="97" rx="30" ry="4" fill="none" stroke="#1A1208" stroke-width="1"/>
      <ellipse cx="60" cy="92" rx="10" ry="4" fill="#2D1F0E"/>
      <rect x="50" y="88" width="20" height="6" rx="3" fill="#1A1208"/>
      <path d="M28 56 Q26 48 60 45 Q94 48 92 56 Q96 66 92 76 Q87 87 76 91 Q70 93 60 93 Q50 93 44 91 Q33 87 28 76 Q24 66 28 56 Z" fill="#1A1208"/>
      <path d="M92 60 Q104 60 104 68 Q104 76 92 78" fill="none" stroke="#1A1208" stroke-width="4" stroke-linecap="round"/>
      <clipPath id="sc">
        <path d="M28 56 Q26 48 60 45 Q94 48 92 56 Q96 66 92 76 Q87 87 76 91 Q70 93 60 93 Q50 93 44 91 Q33 87 28 76 Q24 66 28 56 Z"/>
      </clipPath>
      <g clipPath="url(#sc)">
        <rect x="22" y="58" width="76" height="24" fill="#E8A838"/>
        <rect x="26" y="62" width="7" height="7" fill="#1A1208" transform="rotate(45 29 65)"/>
        <rect x="36" y="62" width="7" height="7" fill="#2D8C4E" transform="rotate(45 39 65)"/>
        <rect x="46" y="62" width="7" height="7" fill="#1A1208" transform="rotate(45 49 65)"/>
        <rect x="56" y="62" width="7" height="7" fill="#2D8C4E" transform="rotate(45 59 65)"/>
        <rect x="66" y="62" width="7" height="7" fill="#1A1208" transform="rotate(45 69 65)"/>
        <rect x="31" y="70" width="7" height="7" fill="#2D8C4E" transform="rotate(45 34 73)"/>
        <rect x="41" y="70" width="7" height="7" fill="#F5F0E8" transform="rotate(45 44 73)"/>
        <rect x="51" y="70" width="7" height="7" fill="#1A1208" transform="rotate(45 54 73)"/>
        <rect x="61" y="70" width="7" height="7" fill="#F5F0E8" transform="rotate(45 64 73)"/>
        <rect x="22" y="58" width="76" height="2" fill="#0D0804"/>
        <rect x="22" y="80" width="76" height="2" fill="#0D0804"/>
      </g>
      <ellipse cx="60" cy="53" rx="24" ry="7" fill="#1A1208"/>
      <ellipse cx="60" cy="51" rx="20" ry="5" fill="#080604"/>
    </svg>
  )
}

function Sidebar({
  username,
  onlineUsers,
  unreadCounts,
  activeRoom,
  onSelectRoom,
  showEncryption,
  onToggleEncryption,
  darkMode,
  onToggleDark,
  channels,
  onCreateChannel,
  onLeave,
}) {
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return
    onCreateChannel(newChannelName.trim().toLowerCase().replace(/\s+/g, '-'))
    setNewChannelName('')
    setShowNewChannel(false)
  }

  return (
    <div className="w-64 flex flex-col h-full"
      style={{ background: '#1A1208', borderRight: '1px solid #3D2A12' }}>

      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid #3D2A12' }}>
        <div className="flex items-center gap-2 mb-3">
          <SiniIconSmall />
          <span className="font-black text-lg" style={{ color: '#F5E6CC', letterSpacing: '-0.5px' }}>
            WereWere
          </span>
        </div>

        {/* Current user */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: '#2D1F0E' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#C17817', color: '#1A1208' }}>
            {username[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium truncate flex-1" style={{ color: '#F5E6CC' }}>
            {username}
          </span>
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/>
        </div>
      </div>

      {/* Channels */}
      <div className="p-3" style={{ borderBottom: '1px solid #3D2A12' }}>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#5A3D10' }}>
            Channels
          </p>
          <button
            onClick={() => setShowNewChannel(!showNewChannel)}
            className="rounded-lg p-1 transition-colors hover:opacity-80"
            style={{ color: '#C17817' }}
            title="Create channel"
          >
            <Plus className="w-3.5 h-3.5"/>
          </button>
        </div>

        {/* New channel input */}
        {showNewChannel && (
          <div className="mb-2 flex gap-1">
            <input
              autoFocus
              value={newChannelName}
              onChange={e => setNewChannelName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateChannel()}
              placeholder="channel-name"
              className="flex-1 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
              style={{
                background: '#2D1F0E',
                color: '#F5E6CC',
                border: '1px solid #C17817'
              }}
            />
            <button
              onClick={handleCreateChannel}
              className="rounded-lg px-2 text-xs font-bold"
              style={{ background: '#C17817', color: '#1A1208' }}
            >
              +
            </button>
            <button
              onClick={() => setShowNewChannel(false)}
              className="rounded-lg px-1"
              style={{ color: '#5A3D10' }}
            >
              <X className="w-3 h-3"/>
            </button>
          </div>
        )}

        {/* Channel list */}
        {channels.map(channel => (
          <button
            key={channel}
            onClick={() => onSelectRoom(channel)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors mb-1 text-sm font-medium"
            style={{
              background: activeRoom === channel ? '#C17817' : 'transparent',
              color: activeRoom === channel ? '#1A1208' : '#8B6914',
            }}
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0"/>
            <span># {channel}</span>
          </button>
        ))}
      </div>

      {/* DMs */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Users className="w-3.5 h-3.5" style={{ color: '#5A3D10' }}/>
          <p className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#5A3D10' }}>
            Direct Messages
          </p>
          <span className="ml-auto text-xs" style={{ color: '#5A3D10' }}>
            {onlineUsers.filter(u => u !== username).length}
          </span>
        </div>

        {onlineUsers.filter(u => u !== username).length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: '#3D2A12' }}>
            No other users online
          </p>
        ) : (
          onlineUsers.filter(u => u !== username).map(user => (
            <button
              key={user}
              onClick={() => onSelectRoom(user)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1"
              style={{
                background: activeRoom === user ? '#C17817' : 'transparent',
                color: activeRoom === user ? '#1A1208' : '#8B6914',
              }}
            >
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: activeRoom === user ? '#1A1208' : '#2D1F0E',
                    color: activeRoom === user ? '#C17817' : '#E8A838'
                  }}>
                  {user[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2"
                  style={{ borderColor: '#1A1208' }}/>
              </div>
              <span className="text-sm font-medium truncate flex-1 text-left">{user}</span>
              {unreadCounts[user] > 0 && (
                <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                  style={{ background: '#E8A838', color: '#1A1208' }}>
                  {unreadCounts[user] > 9 ? '9+' : unreadCounts[user]}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-3" style={{ borderTop: '1px solid #3D2A12' }}>

        {/* Encryption toggle */}
        <button
          onClick={onToggleEncryption}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors mb-2"
          style={{
            background: showEncryption ? '#3D2A12' : 'transparent',
            color: showEncryption ? '#E8A838' : '#5A3D10',
            border: showEncryption ? '1px solid #C17817' : '1px solid transparent'
          }}
        >
          {showEncryption ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
          <span>{showEncryption ? 'Hide encryption' : 'Show encryption'}</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors mb-2"
          style={{ color: '#5A3D10' }}
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* Leave button */}
        <button
          onClick={onLeave}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: '#8B3A3A' }}
        >
          <span>🚪</span>
          <span>Leave WereWere</span>
        </button>

      </div>
    </div>
  )
}

export default Sidebar