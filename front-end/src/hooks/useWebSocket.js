import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'ws://localhost:8000/ws'
    : 'wss://securechat-backend-4ahi.onrender.com/ws'
)

export function useWebSocket(username, authToken) {
  const ws = useRef(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [roomMessages, setRoomMessages] = useState({ general: [] })
  const [privateMessages, setPrivateMessages] = useState({})
  const [typingUsers, setTypingUsers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [channels, setChannels] = useState([{ id: 'general', name: 'general' }])
  const [lastSeen, setLastSeen] = useState({})
  const [authUser, setAuthUser] = useState(null)
  const typingTimers = useRef({})

  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.value = 880
      gain.gain.value = 0.04
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.08)
      setTimeout(() => ctx.close(), 100)
    } catch {
      // ignore browser audio restrictions
    }
  }, [])

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'auth_ok':
        setAuthUser(data.user)
        break

      case 'user_joined':
      case 'user_left':
        setOnlineUsers(data.users || [])
        break

      case 'history':
        setRoomMessages(prev => ({ ...prev, general: data.messages || [] }))
        break

      case 'channels_list':
        setChannels(data.channels || [])
        break

      case 'channel_created':
        setChannels(prev => prev.some(c => c.name === data.channel?.name) ? prev : [...prev, data.channel])
        setRoomMessages(prev => ({ ...prev, [data.channel?.name]: [] }))
        break

      case 'channel_history':
        setRoomMessages(prev => ({ ...prev, [data.room]: data.messages || [] }))
        break

      case 'group_message': {
        const room = data.room || 'general'
        setRoomMessages(prev => ({
          ...prev,
          [room]: [...(prev[room] || []), data]
        }))
        if (data.from !== username) playNotificationSound()
        break
      }

      case 'private_message':
        const otherUser = data.from === username ? data.to : data.from
        setPrivateMessages(prev => ({
          ...prev,
          [otherUser]: [...(prev[otherUser] || []), data]
        }))
        if (data.from !== username) {
          setUnreadCounts(prev => ({ ...prev, [data.from]: (prev[data.from] || 0) + 1 }))
          playNotificationSound()
        }
        break

      case 'private_history':
        setPrivateMessages(prev => ({ ...prev, [data.with]: data.messages || [] }))
        break

      case 'reaction': {
        const room = data.room || 'general'
        setRoomMessages(prev => ({
          ...prev,
          [room]: (prev[room] || []).map(msg =>
            msg.id === data.message_id ? { ...msg, reactions: data.reactions } : msg
          )
        }))
        break
      }

      case 'message_edited': {
        const room = data.room || 'general'
        setRoomMessages(prev => ({
          ...prev,
          [room]: (prev[room] || []).map(msg => msg.id === data.message?.id ? data.message : msg)
        }))
        break
      }

      case 'message_deleted': {
        const room = data.room || 'general'
        setRoomMessages(prev => ({
          ...prev,
          [room]: (prev[room] || []).filter(msg => msg.id !== data.message_id)
        }))
        break
      }

      case 'message_pinned': {
        const room = data.room || 'general'
        setRoomMessages(prev => ({
          ...prev,
          [room]: (prev[room] || []).map(msg => msg.id === data.message?.id ? data.message : msg)
        }))
        break
      }

      case 'message_forwarded': {
        const room = data.room || 'general'
        setRoomMessages(prev => ({
          ...prev,
          [room]: [...(prev[room] || []), data.message]
        }))
        break
      }

      case 'typing':
        const room = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => ({ ...prev, [room]: data.from }))
        if (typingTimers.current[room]) clearTimeout(typingTimers.current[room])
        typingTimers.current[room] = setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev }
            delete updated[room]
            return updated
          })
        }, 3000)
        break

      case 'stop_typing':
        const stopRoom = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => {
          const updated = { ...prev }
          delete updated[stopRoom]
          return updated
        })
        break

      case 'voice_note':
        const voiceOther = data.from === username ? data.to : data.from
        setPrivateMessages(prev => ({
          ...prev,
          [voiceOther]: [...(prev[voiceOther] || []), {
            id: data.id,
            from: data.from,
            to: data.to,
            voiceNote: data.audio,
            voiceDuration: data.duration,
            timestamp: data.timestamp,
            reactions: {},
          }]
        }))
        if (data.from !== username) {
          setUnreadCounts(prev => ({ ...prev, [data.from]: (prev[data.from] || 0) + 1 }))
          playNotificationSound()
        }
        break

      case 'last_seen':
        setLastSeen(prev => ({ ...prev, [data.username]: data.at }))
        break

      default:
        break
    }
  }, [username, playNotificationSound])

  useEffect(() => {
    if (!username) return

    ws.current = new WebSocket(`${WS_URL}/${encodeURIComponent(username)}`)

    ws.current.onopen = () => {
      setConnected(true)
      if (authToken) {
        ws.current.send(JSON.stringify({ type: 'auth', token: authToken }))
      }
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }

    ws.current.onclose = () => setConnected(false)

    return () => {
      ws.current?.close()
    }
  }, [username, authToken, handleMessage])

  const sendGroupMessage = useCallback((text, room = 'general') => {
    if (!ws.current || !text.trim()) return
    ws.current.send(JSON.stringify({
      type: 'group_message',
      room,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [])

  const sendPrivateMessage = useCallback((to, text) => {
    if (!ws.current || !text.trim()) return
    ws.current.send(JSON.stringify({
      type: 'private_message',
      to,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [])

  const sendVoiceNote = useCallback((to, audio, duration) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({
      type: 'voice_note',
      to,
      audio,
      duration,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [])

  const sendTyping = useCallback((to = 'general') => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'typing', to }))
  }, [])

  const sendStopTyping = useCallback((to = 'general') => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'stop_typing', to }))
  }, [])

  const sendReaction = useCallback((messageId, emoji, room = 'general') => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'reaction', room, message_id: messageId, emoji }))
  }, [])

  const fetchPrivateHistory = useCallback((withUser) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'fetch_private', with: withUser }))
  }, [])

  const createChannel = useCallback((name) => {
    if (!ws.current || !name.trim()) return
    ws.current.send(JSON.stringify({ type: 'create_channel', name }))
  }, [])

  const fetchChannelHistory = useCallback((room) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'fetch_channel_history', room }))
  }, [])

  const editMessage = useCallback((room, messageId, text) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'edit_message', room, message_id: messageId, text }))
  }, [])

  const deleteMessage = useCallback((room, messageId) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'delete_message', room, message_id: messageId }))
  }, [])

  const pinMessage = useCallback((room, messageId) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'pin_message', room, message_id: messageId }))
  }, [])

  const forwardMessage = useCallback((room, messageId, targetRoom) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'forward_message', room, message_id: messageId, target_room: targetRoom }))
  }, [])

  const sendFileMessage = useCallback((room, attachment, text = '') => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({
      type: 'file_message',
      room,
      text,
      attachment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [])

  const clearUnread = useCallback((usernameKey) => {
    setUnreadCounts(prev => ({ ...prev, [usernameKey]: 0 }))
  }, [])

  return {
    connected,
    onlineUsers,
    roomMessages,
    privateMessages,
    typingUsers,
    unreadCounts,
    channels,
    lastSeen,
    authUser,
    sendGroupMessage,
    sendPrivateMessage,
    sendVoiceNote,
    sendTyping,
    sendStopTyping,
    sendReaction,
    fetchPrivateHistory,
    createChannel,
    fetchChannelHistory,
    editMessage,
    deleteMessage,
    pinMessage,
    forwardMessage,
    sendFileMessage,
    clearUnread,
  }
}