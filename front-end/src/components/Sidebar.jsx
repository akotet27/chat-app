import { MessageCircle, Lock, Eye, EyeOff, Users } from 'lucide-react'

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
}) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">

      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">SecureChat</span>
        </div>

        {/* Logged in as */}
        <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {username[0].toUpperCase()}
          </div>
          <span className="text-gray-300 text-sm font-medium truncate">{username}</span>
          <div className="w-2 h-2 bg-green-400 rounded-full ml-auto flex-shrink-0" />
        </div>
      </div>

      {/* General Room */}
      <div className="p-3 border-b border-gray-800">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
          Channels
        </p>
        <button
          onClick={() => onSelectRoom('general')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
            activeRoom === 'general'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium"># general</span>
        </button>
      </div>

      {/* Online Users / DMs */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Users className="w-3.5 h-3.5 text-gray-600" />
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
            Direct Messages
          </p>
          <span className="ml-auto text-xs text-gray-600">
            {onlineUsers.filter(u => u !== username).length}
          </span>
        </div>

        {onlineUsers.filter(u => u !== username).length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-4">
            No other users online
          </p>
        ) : (
          onlineUsers
            .filter(u => u !== username)
            .map(user => (
              <button
                key={user}
                onClick={() => onSelectRoom(user)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1 ${
                  activeRoom === user
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {user[0].toUpperCase()}
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900" />
                </div>

                <span className="text-sm font-medium truncate flex-1 text-left">
                  {user}
                </span>

                {/* Unread badge */}
                {unreadCounts[user] > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {unreadCounts[user] > 9 ? '9+' : unreadCounts[user]}
                  </span>
                )}
              </button>
            ))
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-3 border-t border-gray-800 space-y-2">

        {/* Encryption toggle */}
        <button
          onClick={onToggleEncryption}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
            showEncryption
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
          }`}
        >
          {showEncryption
            ? <Eye className="w-4 h-4" />
            : <EyeOff className="w-4 h-4" />
          }
          <span>{showEncryption ? 'Hide encryption' : 'Show encryption'}</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>

      </div>
    </div>
  )
}

export default Sidebar