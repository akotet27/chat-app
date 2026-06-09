import { useState } from 'react'
import { X, Check, Coffee, Wifi, Moon, MinusCircle } from 'lucide-react'

const STATUSES = [
    { key: 'online', label: 'Online', color: '#4CAF50', icon: <Wifi className="w-3.5 h-3.5" /> },
    { key: 'busy', label: 'Busy', color: '#FF5722', icon: <MinusCircle className="w-3.5 h-3.5" /> },
    { key: 'away', label: 'Away', color: '#FFC107', icon: <Moon className="w-3.5 h-3.5" /> },
    { key: 'buna', label: 'At coffee ☕', color: '#C17817', icon: <Coffee className="w-3.5 h-3.5" /> },
]

const AVATAR_GRADIENTS = [
    ['#C17817', '#E8A838'],
    ['#4A90E2', '#6AAFF5'],
    ['#4CAF50', '#81C784'],
    ['#E64A19', '#FF7043'],
    ['#9C27B0', '#CE93D8'],
    ['#00BCD4', '#80DEEA'],
    ['#FF4081', '#FF80AB'],
    ['#607D8B', '#90A4AE'],
]

export function getAvatarGradient(username) {
    if (!username) return AVATAR_GRADIENTS[0]
    const index = username.charCodeAt(0) % AVATAR_GRADIENTS.length
    return AVATAR_GRADIENTS[index]
}

export function Avatar({ username, size = 36, showStatus = false, status = 'online' }) {
    const gradient = getAvatarGradient(username)
    const statusColor = STATUSES.find(s => s.key === status)?.color || '#4CAF50'

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <div
                className="w-full h-full rounded-full flex items-center justify-center font-bold"
                style={{
                    background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                    fontSize: size * 0.38,
                    color: '#fff',
                }}
            >
                {username?.[0]?.toUpperCase() || '?'}
            </div>
            {showStatus && (
                <div
                    className="absolute bottom-0 right-0 rounded-full border-2"
                    style={{
                        width: size * 0.3,
                        height: size * 0.3,
                        background: statusColor,
                        borderColor: 'var(--bg-secondary)',
                    }}
                />
            )}
        </div>
    )
}

function ProfileCard({ username, status, onStatusChange, onClose, theme }) {
    const c = theme.colors
    const gradient = getAvatarGradient(username)
    const [customStatus, setCustomStatus] = useState(
        typeof window !== 'undefined' ? localStorage.getItem('werewere_custom_status') || '' : ''
    )
    const [editingStatus, setEditingStatus] = useState(false)

    const saveCustomStatus = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('werewere_custom_status', customStatus)
        }
        setEditingStatus(false)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            />

            <div
                className="relative w-full max-w-sm rounded-3xl overflow-hidden border shadow-2xl z-10"
                style={{ background: c.bgSecondary, borderColor: c.border }}
                onClick={e => e.stopPropagation()}
            >
                <div
                    className="h-24 relative"
                    style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    <div className="relative -mt-10 mb-3">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl border-4 shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                                color: '#fff',
                                borderColor: c.bgSecondary,
                            }}
                        >
                            {username?.[0]?.toUpperCase() || '?'}
                        </div>
                    </div>

                    <h2 className="font-bold text-xl mb-1" style={{ color: c.text }}>
                        {username}
                    </h2>

                    <p className="text-sm mb-4" style={{ color: c.textMuted }}>
                        {customStatus || 'Set a personal status to share with your crew.'}
                    </p>

                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textFaint }}>
                            Availability
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {STATUSES.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => onStatusChange?.(item.key)}
                                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm"
                                    style={{
                                        background: status === item.key ? c.primary : c.bgTertiary,
                                        color: status === item.key ? c.bg : c.text,
                                    }}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textFaint }}>
                                Custom status
                            </p>
                            {!editingStatus && (
                                <button
                                    onClick={() => setEditingStatus(true)}
                                    className="text-xs font-medium"
                                    style={{ color: c.primary }}
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {editingStatus ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={customStatus}
                                    onChange={e => setCustomStatus(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveCustomStatus()}
                                    placeholder="What's on your mind?"
                                    maxLength={40}
                                    className="flex-1 text-sm rounded-xl px-3 py-2 focus:outline-none"
                                    style={{
                                        background: c.bg,
                                        color: c.text,
                                        border: `1px solid ${c.primary}`,
                                    }}
                                />
                                <button
                                    onClick={saveCustomStatus}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: c.primary }}
                                >
                                    <Check className="w-4 h-4" style={{ color: c.bg }} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditingStatus(true)}
                                className="text-sm text-left w-full rounded-xl px-3 py-2"
                                style={{ background: c.bgTertiary, color: c.textMuted }}
                            >
                                {customStatus || 'Tap to set a custom status'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileCard