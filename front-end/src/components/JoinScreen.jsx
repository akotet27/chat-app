import { useState } from 'react'
import { Shield, Zap, MessageCircle, Users, Lock, Eye, EyeOff, Mail, User, Phone, KeyRound } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import SiniCupIcon from './SiniCupIcon'

function JoinScreen({ onJoin, savedName, onLogin, onRegister, loading, submitError }) {
  const [mode, setMode] = useState('register')
  const [name, setName] = useState(savedName || '')
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(true)
  const [logoClicks, setLogoClicks] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const { theme } = useTheme()
  const c = theme.colors

  const handleLogoClick = () => {
    setLogoClicks((prev) => prev + 1)
    setShowForm((prev) => !prev)
  }

  const handlePageClick = (e) => {
    if (e.target.closest('.logo-area')) return
    if (!showForm) setShowForm(true)
  }

  const handleJoin = async () => {
    if (onJoin) {
      if (!name.trim()) {
        setError('Please enter your name')
        return
      }
      if (name.trim().length < 2) {
        setError('Name must be at least 2 characters')
        return
      }
      onJoin(name.trim())
      return
    }

    if (mode === 'register') {
      if (!form.username.trim()) {
        setError('Please enter a username')
        return
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
        setError('Please enter a valid email')
        return
      }
      if (!/^\+?[0-9\s()-]{7,15}$/.test(form.phone.trim())) {
        setError('Please enter a valid phone number')
        return
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
        setError('Password must be 8+ chars with uppercase, lowercase, number and special character')
        return
      }
      await onRegister?.({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
      })
      return
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      setError('Please enter a valid email')
      return
    }
    if (!form.password) {
      setError('Please enter your password')
      return
    }
    await onLogin?.({ email: form.email.trim().toLowerCase(), password: form.password })
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
      `}</style>

      <div className="w-full max-w-sm relative z-10">
        <div className="logo-area text-center mb-8 cursor-pointer select-none" onClick={handleLogoClick}>
          <div className="relative inline-flex items-center justify-center mb-5">
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
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`,
                transform: showForm ? 'rotate(0deg)' : 'rotate(-5deg)',
                transition: 'transform 0.3s ease',
              }}
            >
              <div className="relative">
                <SiniCupIcon className="w-8 h-8" color={c.bg} strokeWidth={2} />
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: c.bg }}>
                  <MessageCircle className="w-3 h-3" style={{ color: c.primary }} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-black mb-1 tracking-tight" style={{ color: c.text }}>
            WereWere
          </h1>
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: c.primary }}>
            Where the gossip lives
          </p>

          {!showForm && (
            <p className="text-xs mt-3 animate-pulse" style={{ color: c.textFaint }}>
              tap anywhere to join
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6" style={{ opacity: showForm ? 1 : 0.6, transition: 'opacity 0.3s' }}>
          {[{ icon: <Lock className="w-4 h-4" />, label: 'Encrypted' }, { icon: <Zap className="w-4 h-4" />, label: 'Real-time' }, { icon: <Users className="w-4 h-4" />, label: 'Groups & DMs' }].map((f, i) => (
            <div key={i} className="rounded-2xl p-3 text-center border" style={{ background: c.bgTertiary, borderColor: c.border }}>
              <div className="flex justify-center mb-1" style={{ color: c.primaryLight }}>{f.icon}</div>
              <p className="text-xs font-medium" style={{ color: c.textMuted }}>{f.label}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            animation: showForm ? 'slide-up 0.3s ease forwards' : 'none',
            opacity: showForm ? 1 : 0,
            pointerEvents: showForm ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          <div className="rounded-3xl p-6 border shadow-2xl" style={{ background: c.bgSecondary, borderColor: c.border }} onClick={(e) => e.stopPropagation()}>
            <div className="flex rounded-2xl p-1 mb-4" style={{ background: c.bgTertiary }}>
              <button type="button" onClick={() => { setMode('register'); setError('') }} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: mode === 'register' ? c.primary : 'transparent', color: mode === 'register' ? c.bg : c.textMuted }}>
                Register
              </button>
              <button type="button" onClick={() => { setMode('login'); setError('') }} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: mode === 'login' ? c.primary : 'transparent', color: mode === 'login' ? c.bg : c.textMuted }}>
                Login
              </button>
            </div>

            <h2 className="font-bold text-lg mb-1" style={{ color: c.text }}>
              {mode === 'register' ? 'Yene Konjo, join the buna!' : 'Welcome back'}
            </h2>
            <p className="text-sm mb-5" style={{ color: c.textMuted }}>
              {mode === 'register' ? 'Create an account to start chatting' : 'Sign in to continue chatting'}
            </p>

            {mode === 'register' && (
              <>
                <div className="flex items-center rounded-2xl px-4 py-3 text-sm focus:outline-none mb-3 transition-all" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                  <User className="w-4 h-4 mr-2" style={{ color: c.textFaint }} />
                  <input value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} onKeyDown={handleKey} placeholder="Choose a username" className="w-full bg-transparent outline-none" style={{ color: c.text }} />
                </div>
                <div className="flex items-center rounded-2xl px-4 py-3 text-sm focus:outline-none mb-3 transition-all" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                  <Mail className="w-4 h-4 mr-2" style={{ color: c.textFaint }} />
                  <input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} onKeyDown={handleKey} placeholder="you@example.com" className="w-full bg-transparent outline-none" style={{ color: c.text }} />
                </div>
                <div className="flex items-center rounded-2xl px-4 py-3 text-sm focus:outline-none mb-3 transition-all" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                  <Phone className="w-4 h-4 mr-2" style={{ color: c.textFaint }} />
                  <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} onKeyDown={handleKey} placeholder="+251 911 234 567" className="w-full bg-transparent outline-none" style={{ color: c.text }} />
                </div>
              </>
            )}

            <div className="flex items-center rounded-2xl px-4 py-3 text-sm focus:outline-none mb-3 transition-all" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
              <KeyRound className="w-4 h-4 mr-2" style={{ color: c.textFaint }} />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} onKeyDown={handleKey} placeholder={mode === 'register' ? 'Create a strong password' : 'Your password'} className="w-full bg-transparent outline-none" style={{ color: c.text }} />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="ml-2" style={{ color: c.textFaint }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="flex items-center rounded-2xl px-4 py-3 text-sm focus:outline-none mb-3 transition-all" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                <Mail className="w-4 h-4 mr-2" style={{ color: c.textFaint }} />
                <input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} onKeyDown={handleKey} placeholder="your@email.com" className="w-full bg-transparent outline-none" style={{ color: c.text }} />
              </div>
            )}

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            {submitError && <p className="text-red-400 text-xs mb-3">{submitError}</p>}

            <button type="button" onClick={handleJoin} disabled={loading} className="w-full font-bold py-3 rounded-2xl text-sm transition-all hover:opacity-90 shadow-lg" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`, color: c.bg }}>
              {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
            </button>

            <p className="text-center text-xs mt-4" style={{ color: c.textFaint }}>
              🔒 AES-128 encrypted · {logoClicks > 3 ? ''.repeat(Math.min(logoClicks - 3, 5)) : 'All messages protected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinScreen
