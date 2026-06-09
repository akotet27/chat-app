import { useState } from 'react'
import { 
  MessageCircle, Users, Lock, Plus, X, 
  Search, Settings, Coffee, Hash,
  Eye, EyeOff, LogOut, ChevronDown,
  ChevronRight, Shield
} from 'lucide-react'
import { Avatar } from './ProfileCard'

function Sidebar({
  username, status, onlineUsers, unreadCounts,
  activeRoom, onSelectRoom, showEncryption,
  onToggleEncryption, channels, onCreateChannel,
  onLeave, onGoHome, onOpenSearch, onOpenAppearance,
  onOpenProfile, theme, groups, onCreateGroup,
}) {
  const c = theme.colors
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupMembers, setNewGroupMembers] = useState([])
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [groupsOpen, setGroupsOpen] = useState(true)
  const [dmsOpen, setDmsOpen] = useState(true)

  const statusColors = {
    online: '#4CAF50', busy: '#FF5722',
    away: '#FFC107', buna: '#C17817'
  }

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return
    onCreateChannel(newChannelName.trim().toLowerCase().replace(/\s+/g, '-'))
    setNewChannelName('')
    setShowNewChannel(false)
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) return
    onCreateGroup(newGroupName.trim(), newGroupMembers)
    setNewGroupName('')
    setNewGroupMembers([])
    setShowNewGroup(false)
  }

  const toggleGroupMember = (user) => {
    setNewGroupMembers(prev =>
      prev.includes(user) ? prev.filter(u => u !== user) : [...prev, user]
    )
  }

  const otherUsers = onlineUsers.filter(u => u !== username)

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: '260px',
        minWidth: '260px',
        background: c.bgSecondary,
        borderRight: `1px solid ${c.border}`,
      }}
    >
      {/* ── Header ── */}
      <div className="p-4" style={{ borderBottom: `1px solid ${c.border}` }}>

        {/* Logo — click to go home */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})` }}
          >
            <Coffee className="w-4 h-4" style={{ color: c.bg }} strokeWidth={2}/>
            <div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: c.bg }}
            >
              <MessageCircle className="w-2 h-2" style={{ color: c.primary }} strokeWidth={2.5}/>
            </div>
          </div>
          <span className="font-black text-base" style={{ color: c.text, letterSpacing: '-0.5px' }}>
            WereWere
          </span>
        </button>

        {/* Current user profile button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 rounded-xl px-3 py-2 w-full transition-colors"
          style={{ background: c.bgTertiary }}
          onMouseEnter={e => e.currentTarget.style.background = c.border}
          onMouseLeave={e => e.currentTarget.style.background = c.bgTertiary}
        >
          <div className="relative flex-shrink-0">
            <Avatar username={username} size={30}/>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: statusColors[status] || '#4CAF50',
                borderColor: c.bgSecondary,
              }}
            />
          </div>
          <span className="text-sm font-semibold truncate flex-1 text-left"
            style={{ color: c.text }}>
            {username}
          </span>
          <Settings className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.textFaint }}/>
        </button>
      </div>

      {/* ── Search button ── */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ background: c.bgTertiary, color: c.textMuted }}
          onMouseEnter={e => e.currentTarget.style.background = c.border}
          onMouseLeave={e => e.currentTarget.style.background = c.bgTertiary}
        >
          <Search className="w-4 h-4"/>
          <span>Search...</span>
          <span
            className="ml-auto text-xs px-1.5 py-0.5 rounded"
            style={{ background: c.border, color: c.textFaint }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">

        {/* ── CHANNELS section ── */}
        <div>
          <button
            onClick={() => setChannelsOpen(!channelsOpen)}
            className="flex items-center gap-1 w-full px-2 py-1.5 rounded-lg transition-colors"
            style={{ color: c.textFaint }}
            onMouseEnter={e => e.currentTarget.style.color = c.textMuted}
            onMouseLeave={e => e.currentTarget.style.color = c.textFaint}
          >
            {channelsOpen
              ? <ChevronDown className="w-3.5 h-3.5"/>
              : <ChevronRight className="w-3.5 h-3.5"/>
            }
            <span className="text-xs font-bold uppercase tracking-wider flex-1 text-left">
              Channels
            </span>
            <button
              onClick={e => { e.stopPropagation(); setShowNewChannel(!showNewChannel) }}
              className="w-5 h-5 rounded flex items-center justify-center hover:opacity-80"
              style={{ color: c.textFaint }}
            >
              <Plus className="w-3.5 h-3.5"/>
            </button>
          </button>

          {/* New channel input */}
          {showNewChannel && (
            <div className="flex gap-1 px-2 py-1">
              <input
                autoFocus
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateChannel()
                  if (e.key === 'Escape') setShowNewChannel(false)
                }}
                placeholder="channel-name"
                className="flex-1 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                style={{
                  background: c.bgTertiary,
                  color: c.text,
                  border: `1px solid ${c.primary}`,
                }}
              />
              <button
                onClick={handleCreateChannel}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: c.primary, color: c.bg }}
              >
                <Plus className="w-3.5 h-3.5"/>
              </button>
              <button
                onClick={() => setShowNewChannel(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ color: c.textFaint }}
              >
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>
          )}

          {channelsOpen && channels.map(channel => (
            <button
              key={channel}
              onClick={() => onSelectRoom(channel)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium mb-0.5"
              style={{
                background: activeRoom === channel ? c.primary + '22' : 'transparent',
                color: activeRoom === channel ? c.primary : c.textMuted,
                borderLeft: activeRoom === channel ? `3px solid ${c.primary}` : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeRoom !== channel) e.currentTarget.style.background = c.bgTertiary
              }}
              onMouseLeave={e => {
                if (activeRoom !== channel) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Hash className="w-4 h-4 flex-shrink-0"/>
              <span className="truncate">{channel}</span>
            </button>
          ))}
        </div>

        {/* ── GROUPS section ── */}
        <div>
          <button
            onClick={() => setGroupsOpen(!groupsOpen)}
            className="flex items-center gap-1 w-full px-2 py-1.5 rounded-lg transition-colors mt-2"
            style={{ color: c.textFaint }}
            onMouseEnter={e => e.currentTarget.style.color = c.textMuted}
            onMouseLeave={e => e.currentTarget.style.color = c.textFaint}
          >
            {groupsOpen
              ? <ChevronDown className="w-3.5 h-3.5"/>
              : <ChevronRight className="w-3.5 h-3.5"/>
            }
            <span className="text-xs font-bold uppercase tracking-wider flex-1 text-left">
              Groups
            </span>
            <button
              onClick={e => { e.stopPropagation(); setShowNewGroup(!showNewGroup) }}
              className="w-5 h-5 rounded flex items-center justify-center hover:opacity-80"
              style={{ color: c.textFaint }}
            >
              <Plus className="w-3.5 h-3.5"/>
            </button>
          </button>

          {/* New group form */}
          {showNewGroup && (
            <div
              className="mx-2 mb-2 p-3 rounded-xl border"
              style={{ background: c.bgTertiary, borderColor: c.border }}
            >
              <input
                autoFocus
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Group name..."
                className="w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none mb-2"
                style={{
                  background: c.bg,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                }}
              />
              <p className="text-xs mb-2" style={{ color: c.textFaint }}>
                Add members:
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {otherUsers.map(user => (
                  <button
                    key={user}
                    onClick={() => toggleGroupMember(user)}
                    className="text-xs px-2 py-1 rounded-full border transition-colors"
                    style={{
                      background: newGroupMembers.includes(user) ? c.primary : 'transparent',
                      color: newGroupMembers.includes(user) ? c.bg : c.textMuted,
                      borderColor: newGroupMembers.includes(user) ? c.primary : c.border,
                    }}
                  >
                    {user}
                  </button>
                ))}
                {otherUsers.length === 0 && (
                  <p className="text-xs" style={{ color: c.textFaint }}>
                    No other users online
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || newGroupMembers.length === 0}
                  className="flex-1 text-xs py-1.5 rounded-lg font-medium disabled:opacity-40"
                  style={{ background: c.primary, color: c.bg }}
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowNewGroup(false); setNewGroupMembers([]) }}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ color: c.textFaint }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {groupsOpen && groups && groups.map(group => (
            <button
              key={group.id}
              onClick={() => onSelectRoom(`group:${group.id}`)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium mb-0.5"
              style={{
                background: activeRoom === `group:${group.id}` ? c.primary + '22' : 'transparent',
                color: activeRoom === `group:${group.id}` ? c.primary : c.textMuted,
                borderLeft: activeRoom === `group:${group.id}` ? `3px solid ${c.primary}` : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeRoom !== `group:${group.id}`) e.currentTarget.style.background = c.bgTertiary
              }}
              onMouseLeave={e => {
                if (activeRoom !== `group:${group.id}`) e.currentTarget.style.background = 'transparent'
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: c.primary + '33', color: c.primary }}
              >
                {group.name[0].toUpperCase()}
              </div>
              <span className="truncate flex-1 text-left">{group.name}</span>
              <span
                className="text-xs flex-shrink-0"
                style={{ color: c.textFaint }}
              >
                {group.members.length}
              </span>
            </button>
          ))}

          {groupsOpen && (!groups || groups.length === 0) && (
            <p className="text-xs px-4 py-2" style={{ color: c.textFaint }}>
              No groups yet
            </p>
          )}
        </div>

        {/* ── DIRECT MESSAGES section ── */}
        <div>
          <button
            onClick={() => setDmsOpen(!dmsOpen)}
            className="flex items-center gap-1 w-full px-2 py-1.5 rounded-lg transition-colors mt-2"
            style={{ color: c.textFaint }}
          >
            {dmsOpen
              ? <ChevronDown className="w-3.5 h-3.5"/>
              : <ChevronRight className="w-3.5 h-3.5"/>
            }
            <span className="text-xs font-bold uppercase tracking-wider flex-1 text-left">
              Direct Messages
            </span>
            <span className="text-xs" style={{ color: c.textFaint }}>
              {otherUsers.length}
            </span>
          </button>

          {dmsOpen && otherUsers.length === 0 && (
            <p className="text-xs px-4 py-2" style={{ color: c.textFaint }}>
              No other users online
            </p>
          )}

          {dmsOpen && otherUsers.map(user => (
            <button
              key={user}
              onClick={() => onSelectRoom(user)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all mb-0.5"
              style={{
                background: activeRoom === user ? c.primary + '22' : 'transparent',
                borderLeft: activeRoom === user ? `3px solid ${c.primary}` : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeRoom !== user) e.currentTarget.style.background = c.bgTertiary
              }}
              onMouseLeave={e => {
                if (activeRoom !== user) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Avatar username={user} size={28} showStatus status="online"/>
              <span
                className="text-sm font-medium truncate flex-1 text-left"
                style={{ color: activeRoom === user ? c.primary : c.textMuted }}
              >
                {user}
              </span>
              {unreadCounts[user] > 0 && (
                <span
                  className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                  style={{ background: c.primary, color: c.bg }}
                >
                  {unreadCounts[user] > 9 ? '9+' : unreadCounts[user]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div
        className="p-3 space-y-1"
        style={{ borderTop: `1px solid ${c.border}` }}
      >
        {/* Encryption toggle */}
        <button
          onClick={onToggleEncryption}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{
            background: showEncryption ? c.primary + '22' : 'transparent',
            color: showEncryption ? c.primary : c.textFaint,
            border: showEncryption ? `1px solid ${c.primary}44` : '1px solid transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.background = c.bgTertiary}
          onMouseLeave={e => e.currentTarget.style.background = showEncryption ? c.primary + '22' : 'transparent'}
        >
          <Shield className="w-4 h-4"/>
          <span>{showEncryption ? 'Hide encryption' : 'Show encryption'}</span>
        </button>

        {/* Appearance */}
        <button
          onClick={onOpenAppearance}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: c.textFaint }}
          onMouseEnter={e => e.currentTarget.style.background = c.bgTertiary}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Settings className="w-4 h-4"/>
          <span>Appearance</span>
        </button>

        {/* Leave */}
        <button
          onClick={onLeave}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: '#FF5252' }}
          onMouseEnter={e => e.currentTarget.style.background = '#FF525218'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut className="w-4 h-4"/>
          <span>Leave WereWere</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar