import { useState } from 'react'
import { SmilePlus, Eye, EyeOff } from 'lucide-react'

const EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥']

function MessageBubble({ msg, isOwn, onReact, showEncryption }) {
  const [showEmojis, setShowEmojis] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const hasReactions = msg.reactions &&
    Object.keys(msg.reactions).length > 0

  return (
    <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>

      {/* Username (only for others) */}
      {!isOwn && (
        <span className="text-xs text-gray-500 mb-1 ml-1">{msg.from}</span>
      )}

      <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isOwn ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {msg.from[0].toUpperCase()}
        </div>

        {/* Bubble + actions */}
        <div className="group relative max-w-xs">

          {/* Message bubble */}
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-800 text-gray-100 rounded-bl-sm'
          }`}>

            {/* Show encrypted or plain text */}
            {showRaw && showEncryption ? (
              <div>
                <p className="text-xs text-yellow-300 mb-1 font-mono">
                  🔐 Encrypted:
                </p>
                <p className="text-xs font-mono break-all text-yellow-200 opacity-80">
                  {msg.text_encrypted}
                </p>
              </div>
            ) : (
              <p>{msg.text}</p>
            )}

            {/* Timestamp */}
            <p className={`text-xs mt-1 ${
              isOwn ? 'text-blue-200' : 'text-gray-500'
            }`}>
              {msg.timestamp}
            </p>
          </div>

          {/* Hover actions */}
          <div className={`absolute top-0 ${
            isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
          } hidden group-hover:flex items-center gap-1`}>

            {/* Emoji react button */}
            {onReact && (
              <div className="relative">
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <SmilePlus className="w-3.5 h-3.5 text-gray-300" />
                </button>

                {/* Emoji picker */}
                {showEmojis && (
                  <div className={`absolute bottom-8 ${
                    isOwn ? 'right-0' : 'left-0'
                  } bg-gray-700 rounded-xl p-2 flex gap-1 shadow-xl z-10 border border-gray-600`}>
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReact(msg.id, emoji)
                          setShowEmojis(false)
                        }}
                        className="text-lg hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Toggle encryption view */}
            {showEncryption && (
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                title={showRaw ? 'Show decrypted' : 'Show encrypted'}
              >
                {showRaw
                  ? <EyeOff className="w-3.5 h-3.5 text-yellow-400" />
                  : <Eye className="w-3.5 h-3.5 text-gray-300" />
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reactions */}
      {hasReactions && (
        <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? 'mr-9' : 'ml-9'}`}>
          {Object.entries(msg.reactions).map(([emoji, users]) =>
            users.length > 0 && (
              <button
                key={emoji}
                onClick={() => onReact && onReact(msg.id, emoji)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 transition-colors"
              >
                <span>{emoji}</span>
                <span className="text-gray-400">{users.length}</span>
              </button>
            )
          )}
        </div>
      )}

    </div>
  )
}

export default MessageBubble