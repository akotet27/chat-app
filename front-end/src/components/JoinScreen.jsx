import { useState } from 'react'
import { Shield, Zap, MessageCircle } from 'lucide-react'

function SiniIcon({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {/* Gold circle bg */}
      <circle cx="60" cy="60" r="58" fill="#C17817"/>

      {/* Speech bubble large */}
      <rect x="14" y="8" width="28" height="22" rx="6" fill="#1A1208"/>
      <polygon points="20,30 15,40 28,30" fill="#1A1208"/>
      <circle cx="21" cy="19" r="2" fill="#C17817"/>
      <circle cx="28" cy="19" r="2" fill="#C17817"/>
      <circle cx="35" cy="19" r="2" fill="#C17817"/>

      {/* Speech bubble small */}
      <rect x="68" y="4" width="22" height="18" rx="5" fill="#2D1F0E"/>
      <polygon points="82,22 90,30 76,22" fill="#2D1F0E"/>
      <circle cx="74" cy="13" r="1.8" fill="#C17817"/>
      <circle cx="81" cy="13" r="1.8" fill="#C17817"/>
      <circle cx="88" cy="13" r="1.8" fill="#C17817"/>

      {/* Saucer */}
      <ellipse cx="60" cy="98" rx="34" ry="5" fill="#8B5E10"/>
      <ellipse cx="60" cy="97" rx="30" ry="4" fill="#F5F0E8"/>
      <ellipse cx="60" cy="97" rx="30" ry="4" fill="none" stroke="#1A1208" stroke-width="1"/>
      <rect x="42" y="94" width="5" height="5" fill="#1A1208" transform="rotate(45 44 96)"/>
      <rect x="54" y="94" width="5" height="5" fill="#2D8C4E" transform="rotate(45 56 96)"/>
      <rect x="66" y="94" width="5" height="5" fill="#1A1208" transform="rotate(45 68 96)"/>
      <rect x="78" y="94" width="5" height="5" fill="#2D8C4E" transform="rotate(45 80 96)"/>

      {/* Round circular base */}
      <ellipse cx="60" cy="92" rx="10" ry="4" fill="#2D1F0E"/>
      <rect x="50" y="88" width="20" height="6" rx="3" fill="#1A1208"/>

      {/* Cup body */}
      <path d="M28 56 Q26 48 60 45 Q94 48 92 56 Q96 66 92 76 Q87 87 76 91 Q70 93 60 93 Q50 93 44 91 Q33 87 28 76 Q24 66 28 56 Z" fill="#1A1208"/>

      {/* Handle */}
      <path d="M92 60 Q104 60 104 68 Q104 76 92 78" fill="none" stroke="#1A1208" stroke-width="4" stroke-linecap="round"/>

      {/* Pattern band */}
      <clipPath id="sini-clip">
        <path d="M28 56 Q26 48 60 45 Q94 48 92 56 Q96 66 92 76 Q87 87 76 91 Q70 93 60 93 Q50 93 44 91 Q33 87 28 76 Q24 66 28 56 Z"/>
      </clipPath>
      <g clipPath="url(#sini-clip)">
        <rect x="22" y="58" width="76" height="24" fill="#E8A838"/>
        <rect x="26" y="62" width="7" height="7" fill="#1A1208" transform="rotate(45 29 65)"/>
        <rect x="36" y="62" width="7" height="7" fill="#2D8C4E" transform="rotate(45 39 65)"/>
        <rect x="46" y="62" width="7" height="7" fill="#1A1208" transform="rotate(45 49 65)"/>
        <rect x="56" y="62" width="7" height="7" fill="#2D8C4E" transform="rotate(45 59 65)"/>
        <rect x="66" y="62" width="7" height="7" fill="#1A1208" transform="rotate(45 69 65)"/>
        <rect x="76" y="62" width="7" height="7" fill="#2D8C4E" transform="rotate(45 79 65)"/>
        <rect x="31" y="70" width="7" height="7" fill="#2D8C4E" transform="rotate(45 34 73)"/>
        <rect x="41" y="70" width="7" height="7" fill="#F5F0E8" transform="rotate(45 44 73)"/>
        <rect x="51" y="70" width="7" height="7" fill="#1A1208" transform="rotate(45 54 73)"/>
        <rect x="61" y="70" width="7" height="7" fill="#F5F0E8" transform="rotate(45 64 73)"/>
        <rect x="71" y="70" width="7" height="7" fill="#2D8C4E" transform="rotate(45 74 73)"/>
        <rect x="22" y="58" width="76" height="2" fill="#0D0804"/>
        <rect x="22" y="80" width="76" height="2" fill="#0D0804"/>
      </g>

      {/* Rim */}
      <ellipse cx="60" cy="53" rx="24" ry="7" fill="#1A1208"/>
      <ellipse cx="60" cy="53" rx="24" ry="7" fill="none" stroke="#E8A838" stroke-width="1"/>
      <ellipse cx="60" cy="51" rx="20" ry="5" fill="#080604"/>
    </svg>
  )
}

function JoinScreen({ onJoin }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return }
    onJoin(name.trim())
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1A1208 0%, #2D1F0E 50%, #1A1208 100%)' }}>

      {/* Background coffee pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute opacity-5 text-5xl"
            style={{ left: `${(i * 41) % 95}%`, top: `${(i * 67) % 90}%` }}>
            ☕
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5">
            <SiniIcon size={100} />
          </div>
          <h1 className="text-5xl font-black mb-2"
            style={{ color: '#F5E6CC', letterSpacing: '-2px' }}>
            WereWere
          </h1>
          <p className="text-sm font-medium tracking-widest uppercase"
            style={{ color: '#C17817' }}>
            Where the gossip lives
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: <Shield className="w-5 h-5" />, label: 'Encrypted', color: '#E8A838' },
            { icon: <Zap className="w-5 h-5" />, label: 'Real-time', color: '#E8A838' },
            { icon: <MessageCircle className="w-5 h-5" />, label: 'Private DMs', color: '#E8A838' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-3 text-center border"
              style={{ background: '#2D1F0E', borderColor: '#3D2A12' }}>
              <div style={{ color: f.color }} className="flex justify-center mb-1">{f.icon}</div>
              <p className="text-xs" style={{ color: '#C17817' }}>{f.label}</p>
            </div>
          ))}
        </div>

        {/* Join card */}
        <div className="rounded-3xl p-7 border shadow-2xl"
          style={{ background: '#2D1F0E', borderColor: '#3D2A12' }}>
          <h2 className="font-bold text-xl mb-1" style={{ color: '#F5E6CC' }}>
            Yene Konjo, join the buna! ☕
          </h2>
          <p className="text-sm mb-6" style={{ color: '#8B6914' }}>
            Enter your name to start the gossip
          </p>

          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={handleKey}
            placeholder="Your name..."
            maxLength={20}
            className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none mb-3 transition-all"
            style={{ background: '#1A1208', color: '#F5E6CC', border: '1px solid #3D2A12' }}
          />

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button
            onClick={handleJoin}
            className="w-full font-bold py-3 rounded-2xl text-sm transition-all hover:opacity-90 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C17817, #E8A838)', color: '#1A1208' }}
          >
            ☕ Join WereWere
          </button>

          <p className="text-center text-xs mt-4" style={{ color: '#5A3D10' }}>
            🔒 All messages encrypted with AES-128
          </p>
        </div>

      </div>
    </div>
  )
}

export default JoinScreen