import { useState } from 'react'
import { Lock, MessageCircle, Shield, Zap } from 'lucide-react'

function JoinScreen({ onJoin }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }
    onJoin(name.trim())
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SecureChat</h1>
          <p className="text-gray-400 text-sm">End-to-end encrypted messaging</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <Shield className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">AES Encrypted</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">Real-time</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <MessageCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">Private DMs</p>
          </div>
        </div>

        {/* Join Card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
          <h2 className="text-white font-semibold text-lg mb-1">Join the chat</h2>
          <p className="text-gray-500 text-sm mb-5">Enter your name to get started</p>

          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value)
              setError('')
            }}
            onKeyDown={handleKey}
            placeholder="Your name..."
            maxLength={20}
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-3 transition-colors"
          />

          {error && (
            <p className="text-red-400 text-xs mb-3">{error}</p>
          )}

          <button
            onClick={handleJoin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20"
          >
            Join SecureChat →
          </button>

          <p className="text-center text-gray-600 text-xs mt-4">
            🔒 All messages are encrypted before storage
          </p>
        </div>

      </div>
    </div>
  )
}

export default JoinScreen