import { useState } from 'react'
import { SmilePlus, Eye, EyeOff } from 'lucide-react'
import { Avatar } from './ProfileCard'
import { VoicePlayer } from './VoiceNote'
import { parseMentions } from '../utils/mentions'

const EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥', '👏', '😍']

function MessageBubble({ msg, isOwn, onReact, showEncryption, onlineUsers, currentUser, theme }) {
  const c = theme.colors
  const [showEmojis, setShowEmojis] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const hasReactions = msg.reactions &&
    Object.keys(msg.reactions).some(e => msg.reactions[e].length > 0)

  const isMentioned = msg.text?.includes(`@${currentUser}`)

  // Parse mentions in text
  const renderText = (text) => {
    if (!text) return null
    const parts = parseMentions(text, onlineUsers || [])
    return parts.map((part, i) => (
      part.isMention
        ? <span
            key={i}
            className="font-bold rounded px-0.5"
            style={{
              color: isOwn ? c.bg : c.mention,
              background: isOwn ? c.bg + '33' : c.mention + '22',
            }}
          >
            {part.text}
          </span>
        : <span key={i}>{part.text}</span>
    ))
  }

  return (
    <div className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'}`}>

      {/* Mention highlight bar */}
      {isMentioned && !isOwn && (
        <div
          className="w-full rounded-lg px-3 py-1 mb-1 text-xs font-medium"
          style={{ background: c.mention + '18', color: c.mention, border: `1px solid ${c.mention}33` }}
        >
          You were mentioned
        </div>
      )}

      {/* Username */}
      {!isOwn && (
        <div className="flex items-center gap-2 mb-1 ml-9">
          <span className="text-xs font-semibold" style={{ color: c.primary }}>
            {msg.from}
          </span>
        </div>
      )}

      <div className={`flex items-end gap-2 max-w-xs sm:max-w-sm md:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        {!isOwn && (
          <Avatar username={msg.from} size={28} />
        )}

        {/* Bubble + actions */}
        <div className="group relative">
          <div
            className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
            style={{
              background: isOwn ? c.bubble : c.otherBubble,
              color: isOwn ? c.bubbleText : c.otherText,
              borderBottomRightRadius: isOwn ? '4px' : '18px',
              borderBottomLeftRadius: isOwn ? '18px' : '4px',
              border: isMentioned && !isOwn
                ? `1px solid ${c.mention}44`
                : 'none',
            }}
          >
            {/* Voice note */}
            {msg.voiceNote ? (
              <VoicePlayer
                audio={msg.voiceNote}
                duration={msg.voiceDuration}
                isOwn={isOwn}
                theme={theme}
              />
            ) : showRaw && showEncryption ? (
              // Encrypted view
              <div>
                <p className="text-xs mb-1 font-mono font-bold"
                  style={{ color: isOwn ? c.bg + 'CC' : c.primary }}>
                  🔐 Encrypted:
                </p>
                <p className="text-xs font-mono break-all opacity-80"
                  style={{ color: isOwn ? c.bg + 'AA' : c.textMuted }}>
                  {msg.text_encrypted}
                </p>
              </div>
            ) : (
              // Normal text with mentions
              <p className="whitespace-pre-wrap break-words">
                {renderText(msg.text)}
              </p>
            )}

            {/* Timestamp + read receipt */}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span
                className="text-xs"
                style={{ color: isOwn ? c.bubbleText + '99' : c.textFaint }}
              >
                {msg.timestamp}
              </span>
              {isOwn && (
                <span style={{ color: c.bubbleText + '99', fontSize: '11px' }}>✓✓</span>
              )}
            </div>
          </div>

          {/* Hover action buttons */}
          <div
            className={`absolute top-0 ${
              isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
            } hidden group-hover:flex items-center gap-1 z-10`}
          >
            {/* Emoji picker */}
            {onReact && !msg.voiceNote && (
              <div className="relative">
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm"
                  style={{ background: c.bgTertiary }}
                >
                  <SmilePlus className="w-3.5 h-3.5" style={{ color: c.primary }}/>
                </button>

                {showEmojis && (
                  <div
                    className={`absolute bottom-9 ${isOwn ? 'right-0' : 'left-0'} rounded-2xl p-2 flex gap-1 shadow-xl z-20 border`}
                    style={{ background: c.bgSecondary, borderColor: c.border }}
                  >
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { onReact(msg.id, emoji); setShowEmojis(false) }}
                        className="text-lg hover:scale-125 transition-transform p-0.5"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Encryption toggle */}
            {showEncryption && !msg.voiceNote && (
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm"
                style={{ background: c.bgTertiary }}
                title={showRaw ? 'Show message' : 'Show encrypted'}
              >
                {showRaw
                  ? <EyeOff className="w-3.5 h-3.5" style={{ color: c.primary }}/>
                  : <Eye className="w-3.5 h-3.5" style={{ color: c.textMuted }}/>
                }
              </button>
            )}
          </div>
        </div>

        {/* Own avatar */}
        {isOwn && (
          <Avatar username={msg.from} size={28}/>
        )}
      </div>

      {/* Reactions */}
      {hasReactions && (
        <div className={`flex gap-1 mt-1.5 flex-wrap ${isOwn ? 'mr-9' : 'ml-9'}`}>
          {Object.entries(msg.reactions).map(([emoji, users]) =>
            users.length > 0 && (
              <button
                key={emoji}
                onClick={() => onReact && onReact(msg.id, emoji)}
                className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1 transition-all hover:scale-105 border"
                style={{
                  background: users.includes(currentUser) ? c.primary + '22' : c.bgTertiary,
                  borderColor: users.includes(currentUser) ? c.primary : c.border,
                  color: c.text,
                }}
              >
                <span>{emoji}</span>
                <span style={{ color: c.textMuted }}>{users.length}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default MessageBubble