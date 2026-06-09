import { useState, useEffect } from 'react'
import { Shield, Zap, MessageCircle, Coffee, Users, Lock } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

function JoinScreen({ onJoin, savedName }) {
  const [name, setName] = useState(savedName || '')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)
  const { theme } = useTheme()
  const c = theme.colors

  // clicking logo toggles the form
  const handleLogoClick = () => {
    setLogoClicks(prev => prev + 1)
    setShowForm(prev => !prev)
  }

  // clicking anywhere else on the page shows the form
  const handlePageClick = (e) => {
    if (e.target.closest('.logo-area')) return
    if (!showForm) setShowForm(true)
  }

  const handleJoin = () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return }
    onJoin(name.trim())
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${c.bg} 0%, ${c.bgSecondary} 50%, ${c.bg} 100%)` }}
      onClick={handlePageClick}
    >

      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${120 + i * 40}px`,
              height: `${120 + i * 40}px`,
              background: c.primary,
              left: `${(i * 37) % 90}%`,
              top: `${(i * 53) % 85}%`,
              animation: `float ${4 + i}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Coffee pattern background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-3"
            style={{
              left: `${(i * 41) % 95}%`,
              top: `${(i * 67) % 90}%`,
              transform: 'rotate(-15deg)',
              opacity: 0.03,
            }}
          >
            ☕
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo area — click to toggle form */}
        <div
          className="logo-area text-center mb-8 cursor-pointer select-none"
          onClick={handleLogoClick}
        >
          {/* Animated logo ring */}
          <div className="relative inline-flex items-center justify-center mb-5">
            {/* Outer pulse ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: '110px',
                height: '110px',
                border: `2px solid ${c.primary}`,
                opacity: 0.3,
                animation: 'pulse-ring 2s ease-in-out infinite',
              }}
            />
            {/* Inner ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: '95px',
                height: '95px',
                border: `1px solid ${c.primaryLight}`,
                opacity: 0.2,
              }}
            />
            {/* Icon circle */}
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`,
                transform: showForm ? 'rotate(0deg)' : 'rotate(-5deg)',
                transition: 'transform 0.3s ease',
              }}
            >
              <div className="relative">
                <Coffee className="w-8 h-8" style={{ color: c.bg }} strokeWidth={2}/>
                <div
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: c.bg }}
                >
                  <MessageCircle className="w-3 h-3" style={{ color: c.primary }} strokeWidth={2.5}/>
                </div>
              </div>
            </div>
          </div>

          {/* App name */}
          <h1
            className="text-5xl font-black mb-1 tracking-tight"
            style={{ color: c.text }}
          >
            WereWere
          </h1>
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: c.primary }}
          >
            Where the gossip lives
          </p>

          {/* Hint text */}
          {!showForm && (
            <p
              className="text-xs mt-3 animate-pulse"
              style={{ color: c.textFaint }}
            >
              tap anywhere to join
            </p>
          )}
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-2 mb-6"
          style={{
            opacity: showForm ? 1 : 0.6,
            transition: 'opacity 0.3s',
          }}
        >
          {[
            { icon: <Lock className="w-4 h-4"/>, label: 'Encrypted' },
            { icon: <Zap className="w-4 h-4"/>, label: 'Real-time' },
            { icon: <Users className="w-4 h-4"/>, label: 'Groups & DMs' },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-2xl p-3 text-center border"
              style={{ background: c.bgTertiary, borderColor: c.border }}
            >
              <div className="flex justify-center mb-1" style={{ color: c.primaryLight }}>
                {f.icon}
              </div>
              <p className="text-xs font-medium" style={{ color: c.textMuted }}>
                {f.label}
              </p>
            </div>
          ))}
        </div>

        {/* Join form — slides up when shown */}
        <div
          style={{
            animation: showForm ? 'slide-up 0.3s ease forwards' : 'none',
            opacity: showForm ? 1 : 0,
            pointerEvents: showForm ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          <div
            className="rounded-3xl p-6 border shadow-2xl"
            style={{ background: c.bgSecondary, borderColor: c.border }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg mb-1" style={{ color: c.text }}>
              Yene Konjo, join the buna! ☕
            </h2>
            <p className="text-sm mb-5" style={{ color: c.textMuted }}>
              Enter your name to start chatting
            </p>

            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={handleKey}
              placeholder="Your name..."
              maxLength={20}
              autoFocus={showForm}
              className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none mb-3 transition-all"
              style={{
                background: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
              }}
            />

            {error && (
              <p className="text-red-400 text-xs mb-3">{error}</p>
            )}

            <button
              onClick={handleJoin}
              className="w-full font-bold py-3 rounded-2xl text-sm transition-all hover:opacity-90 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`,
                color: c.bg,
              }}
            >
              ☕ Join WereWere
            </button>

            <p
              className="text-center text-xs mt-4"
              style={{ color: c.textFaint }}
            >
              🔒 AES-128 encrypted · {logoClicks > 3 ? '☕'.repeat(Math.min(logoClicks - 3, 5)) : 'All messages protected'}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default JoinScreen