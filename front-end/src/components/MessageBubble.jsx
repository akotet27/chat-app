import { useState } from 'react'
import { SmilePlus, Eye, EyeOff } from 'lucide-react'

const EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥']

function MessageBubble({ msg, isOwn, onReact, showEncryption }) {
  const [showEmojis, setShowEmojis] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const hasReactions = msg.reactions &&
    Object.keys(msg.reactions).some(e => msg.reactions[e].length > 0)

  return (
    <div className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'}`}>

      {/* Username */}
      {!isOwn && (
        <span className="text-xs mb-1 ml-1 font-medium"
          style={{ color: '#8B6914' }}>
          {msg.from}
        </span>
      )}

      <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: isOwn ? '#C17817' : '#2D1F0E',
            color: isOwn ? '#1A1208' : '#E8A838'
          }}>
          {msg.from[0].toUpperCase()}
        </div>

        {/* Bubble */}
        <div className="group relative max-w-xs">
          <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
            style={{
              background: isOwn ? '#C17817' : '#2D1F0E',
              color: isOwn ? '#1A1208' : '#F5E6CC',
              borderBottomRightRadius: isOwn ? '4px' : '16px',
              borderBottomLeftRadius: isOwn ? '16px' : '4px',
            }}>

            {/* Encrypted or plain text */}
            {showRaw && showEncryption ? (
              <div>
                <p className="text-xs mb-1 font-mono font-bold"
                  style={{ color: isOwn ? '#3D2A12' : '#E8A838' }}>
                  🔐 Encrypted:
                </p>
                <p className="text-xs font-mono break-all opacity-80"
                  style={{ color: isOwn ? '#3D2A12' : '#C17817' }}>
                  {msg.text_encrypted}
                </p>
              </div>
            ) : (
              <p>{msg.text}</p>
            )}

            {/* Timestamp */}
            <p className="text-xs mt-1"
              style={{ color: isOwn ? '#3D2A12' : '#5A3D10' }}>
              {msg.timestamp}
            </p>
          </div>

          {/* Hover actions */}
          <div className={`absolute top-0 ${
            isOwn
              ? 'left-0 -translate-x-full pr-2'
              : 'right-0 translate-x-full pl-2'
          } hidden group-hover:flex items-center gap-1`}>

            {/* Emoji react */}
            {onReact && (
              <div className="relative">
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: '#2D1F0E' }}
                >
                  <SmilePlus className="w-3.5 h-3.5" style={{ color: '#E8A838' }}/>
                </button>

                {showEmojis && (
                  <div className={`absolute bottom-8 ${
                    isOwn ? 'right-0' : 'left-0'
                  } rounded-xl p-2 flex gap-1 shadow-xl z-10`}
                    style={{ background: '#2D1F0E', border: '1px solid #3D2A12' }}>
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

            {/* Encryption toggle */}
            {showEncryption && (
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: '#2D1F0E' }}
                title={showRaw ? 'Show decrypted' : 'Show encrypted'}
              >
                {showRaw
                  ? <EyeOff className="w-3.5 h-3.5" style={{ color: '#E8A838' }}/>
                  : <Eye className="w-3.5 h-3.5" style={{ color: '#8B6914' }}/>
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
                className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1 transition-colors"
                style={{
                  background: '#2D1F0E',
                  border: '1px solid #3D2A12',
                  color: '#E8A838'
                }}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            )
          )}
        </div>
      )}

    </div>
  )
}

export default MessageBubble