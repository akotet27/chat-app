import { useMemo, useState } from 'react'
import { Search, X, MessageCircle, Lock } from 'lucide-react'
import { Avatar } from './ProfileCard'

function SearchPanel({ onClose, groupMessages, privateMessages, username, onlineUsers, onSelectRoom, theme }) {
    const c = theme.colors
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('all')

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'messages', label: 'Messages' },
        { key: 'people', label: 'People' },
    ]

    const results = useMemo(() => {
        if (!query.trim()) return { messages: [], people: [] }

        const q = query.toLowerCase()
        const messages = []

        groupMessages
            .filter(message => message.text?.toLowerCase().includes(q))
            .slice(0, 10)
            .forEach(message => messages.push({ ...message, roomType: 'group' }))

        Object.entries(privateMessages).forEach(([user, msgs]) => {
            msgs
                .filter(message => message.text?.toLowerCase().includes(q))
                .slice(0, 5)
                .forEach(message => messages.push({ ...message, roomType: 'dm', dmUser: user }))
        })

        const people = onlineUsers.filter(user => user !== username && user.toLowerCase().includes(q))

        return { messages, people }
    }, [query, groupMessages, privateMessages, onlineUsers, username])

    const highlightText = (text, query) => {
        if (!query || !text) return text
        const parts = text.split(new RegExp(`(${query})`, 'gi'))
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? (
                    <mark key={i} style={{ background: `${c.primary}44`, color: c.primary, borderRadius: '3px', padding: '0 2px' }}>
                        {part}
                    </mark>
                )
                : part
        )
    }

    const showMessages = filter === 'all' || filter === 'messages'
    const showPeople = filter === 'all' || filter === 'people'
    const hasResults = results.messages.length > 0 || results.people.length > 0

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
            onClick={onClose}
        >
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            />

            <div
                className="relative w-full max-w-lg rounded-3xl border shadow-2xl z-10 overflow-hidden"
                style={{ background: c.bgSecondary, borderColor: c.border }}
                onClick={e => e.stopPropagation()}
            >
                <div
                    className="flex items-center gap-3 p-4 border-b"
                    style={{ borderColor: c.border }}
                >
                    <Search className="w-5 h-5 flex-shrink-0" style={{ color: c.textMuted }} />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search messages, people..."
                        className="flex-1 text-sm bg-transparent focus:outline-none"
                        style={{ color: c.text }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} style={{ color: c.textMuted }}>
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-xs px-3 py-1.5 rounded-xl border"
                        style={{ color: c.textMuted, borderColor: c.border }}
                    >
                        Cancel
                    </button>
                </div>

                <div
                    className="flex gap-2 px-4 py-3 border-b"
                    style={{ borderColor: c.border }}
                >
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                            style={{
                                background: filter === f.key ? c.primary : c.bgTertiary,
                                color: filter === f.key ? c.bg : c.textMuted,
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {!query && (
                        <div className="py-12 text-center">
                            <Search className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: c.textMuted }} />
                            <p className="text-sm" style={{ color: c.textFaint }}>
                                Search for messages or people
                            </p>
                        </div>
                    )}

                    {query && !hasResults && (
                        <div className="py-12 text-center">
                            <p className="text-sm" style={{ color: c.textFaint }}>
                                No results for "{query}"
                            </p>
                        </div>
                    )}

                    {showPeople && results.people.length > 0 && (
                        <div>
                            <p
                                className="text-xs font-semibold uppercase tracking-wider px-4 py-2"
                                style={{ color: c.textFaint }}
                            >
                                People
                            </p>
                            {results.people.map(user => (
                                <button
                                    key={user}
                                    onClick={() => {
                                        onSelectRoom(user)
                                        onClose()
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                                    onMouseEnter={e => e.currentTarget.style.background = c.bgTertiary}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Avatar username={user} size={36} showStatus status="online" />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: c.text }}>
                                            {highlightText(user, query)}
                                        </p>
                                        <p className="text-xs" style={{ color: c.textMuted }}>
                                            Online
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showMessages && results.messages.length > 0 && (
                        <div>
                            <p
                                className="text-xs font-semibold uppercase tracking-wider px-4 py-2"
                                style={{ color: c.textFaint }}
                            >
                                Messages
                            </p>
                            {results.messages.map((msg, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        onSelectRoom(msg.roomType === 'group' ? 'general' : msg.dmUser)
                                        onClose()
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                                    onMouseEnter={e => e.currentTarget.style.background = c.bgTertiary}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                        style={{ background: c.bgTertiary, color: c.primary }}
                                    >
                                        {msg.roomType === 'group' ? <MessageCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium" style={{ color: c.text }}>
                                            {highlightText(msg.text || 'Untitled message', query)}
                                        </p>
                                        <p className="text-xs" style={{ color: c.textMuted }}>
                                            {msg.roomType === 'group' ? 'Group message' : `Direct message · ${msg.dmUser}`}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchPanel