import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react'

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Recording component — shown in input area
export function VoiceRecorder({ onSend, onCancel, theme }) {
  const c = theme.colors
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const timer = useRef(null)

  useEffect(() => {
    startRecording()
    return () => {
      stopTimer()
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop()
      }
    }
  }, [])

  const startTimer = () => {
    timer.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timer.current) clearInterval(timer.current)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunks.current = []

      mediaRecorder.current.ondataavailable = e => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setRecording(false)
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.current.start()
      setRecording(true)
      startTimer()
    } catch (err) {
      console.error('Microphone access denied:', err)
      onCancel()
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop()
      stopTimer()
    }
  }

  const handleSend = async () => {
    if (!audioBlob) return
    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      onSend({
        type: 'voice_note',
        audio: reader.result,
        duration: formatDuration(duration),
      })
    }
    reader.readAsDataURL(audioBlob)
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
      style={{ background: c.bgTertiary, borderColor: c.border }}
    >
      {/* Recording indicator or waveform */}
      <div className="flex items-center gap-2 flex-1">
        {recording ? (
          <>
            {/* Animated recording dot */}
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ background: '#FF4444' }}
            />
            {/* Fake waveform bars */}
            <div className="flex items-center gap-0.5 flex-1 h-8">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    background: c.primary,
                    height: `${20 + Math.sin(Date.now() / 200 + i) * 15}%`,
                    minHeight: '4px',
                    maxHeight: '100%',
                    opacity: 0.7 + (i % 3) * 0.1,
                    animation: `wave ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-mono font-bold" style={{ color: '#FF4444' }}>
              {formatDuration(duration)}
            </span>
          </>
        ) : (
          <>
            {/* Recorded — show static waveform */}
            <div className="flex items-center gap-0.5 flex-1 h-8">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    background: c.primary,
                    height: `${30 + Math.sin(i * 0.8) * 40}%`,
                    minHeight: '4px',
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-mono" style={{ color: c.textMuted }}>
              {formatDuration(duration)}
            </span>
          </>
        )}
      </div>

      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1.5); }
        }
      `}</style>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {recording ? (
          // Stop recording
          <button
            onClick={stopRecording}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#FF4444' }}
          >
            <Square className="w-4 h-4 text-white" fill="white"/>
          </button>
        ) : (
          // Send or discard
          <>
            <button
              onClick={onCancel}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: c.bgSecondary, color: c.textMuted }}
            >
              <Trash2 className="w-4 h-4"/>
            </button>
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: c.primary }}
            >
              <Send className="w-4 h-4" style={{ color: c.bg }}/>
            </button>
          </>
        )}

        {/* Cancel */}
        {recording && (
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: c.bgSecondary, color: c.textMuted }}
          >
            <Trash2 className="w-4 h-4"/>
          </button>
        )}
      </div>
    </div>
  )
}

// Playback component — shown in message bubble
export function VoicePlayer({ audio, duration, isOwn, theme }) {
  const c = theme.colors
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio(audio)
    audioRef.current.ontimeupdate = () => {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(pct || 0)
    }
    audioRef.current.onended = () => {
      setPlaying(false)
      setProgress(0)
    }
    return () => {
      audioRef.current?.pause()
    }
  }, [audio])

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <div className="flex items-center gap-3 min-w-48">
      {/* Play/pause button */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isOwn ? c.bg + '44' : c.primary,
          color: isOwn ? c.bg : c.bg,
        }}
      >
        {playing
          ? <Pause className="w-4 h-4" style={{ color: isOwn ? c.bubbleText : '#fff' }}/>
          : <Play className="w-4 h-4 ml-0.5" style={{ color: isOwn ? c.bubbleText : '#fff' }}/>
        }
      </button>

      {/* Waveform + progress */}
      <div className="flex-1">
        <div className="relative h-8 flex items-center gap-0.5">
          {[...Array(20)].map((_, i) => {
            const filled = (i / 20) * 100 < progress
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-colors"
                style={{
                  height: `${30 + Math.sin(i * 0.8) * 50}%`,
                  minHeight: '3px',
                  background: filled
                    ? (isOwn ? c.bg + 'CC' : c.primaryLight)
                    : (isOwn ? c.bg + '44' : c.border),
                }}
              />
            )
          })}
        </div>
        <p
          className="text-xs mt-0.5"
          style={{ color: isOwn ? c.bg + 'AA' : c.textMuted }}
        >
          {duration}
        </p>
      </div>
    </div>
  )
}