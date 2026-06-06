import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = 'wss://securechat-backend-4ahi.onrender.com/ws'

export function useWebSocket(username) {
  const ws = useRef(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [groupMessages, setGroupMessages] = useState([])
  const [privateMessages, setPrivateMessages] = useState({})
  const [typingUsers, setTypingUsers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const typingTimers = useRef({})

  useEffect(() => {
    if (!username) return

    ws.current = new WebSocket(`${WS_URL}/${username}`)

    ws.current.onopen = () => {
      setConnected(true)
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }

    ws.current.onclose = () => {
      setConnected(false)
    }

    return () => {
      ws.current?.close()
    }
  }, [username])

  const handleMessage = useCallback((data) => {
    switch (data.type) {

      // someone joined or left — update user list
      case 'user_joined':
      case 'user_left':
        setOnlineUsers(data.users)
        break

      // load message history when first joining
      case 'history':
        setGroupMessages(data.messages)
        break

      // new group message
      case 'group_message':
        setGroupMessages(prev => [...prev, data])
        break

      // new private message
      case 'private_message':
        const otherUser = data.from === username ? data.to : data.from
        setPrivateMessages(prev => ({
          ...prev,
          [otherUser]: [...(prev[otherUser] || []), data]
        }))
        // add unread badge if message is FROM someone else
        if (data.from !== username) {
          setUnreadCounts(prev => ({
            ...prev,
            [data.from]: (prev[data.from] || 0) + 1
          }))
        }
        break

      // private message history loaded
      case 'private_history':
        setPrivateMessages(prev => ({
          ...prev,
          [data.with]: data.messages
        }))
        break

      // emoji reaction updated
      case 'reaction':
        setGroupMessages(prev =>
          prev.map(msg =>
            msg.id === data.message_id
              ? { ...msg, reactions: data.reactions }
              : msg
          )
        )
        break

      // someone is typing
      case 'typing':
        const room = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => ({ ...prev, [room]: data.from }))
        // clear typing after 3 seconds automatically
        if (typingTimers.current[room]) {
          clearTimeout(typingTimers.current[room])
        }
        typingTimers.current[room] = setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev }
            delete updated[room]
            return updated
          })
        }, 3000)
        break

      // someone stopped typing
      case 'stop_typing':
        const stopRoom = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => {
          const updated = { ...prev }
          delete updated[stopRoom]
          return updated
        })
        break

      default:
        break
    }
  }, [username])

  // ── SEND FUNCTIONS ────────────────────────────────────

  const sendGroupMessage = useCallback((text) => {
    if (!ws.current || !text.trim()) return
    ws.current.send(JSON.stringify({
      type: 'group_message',
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit'
      })
    }))
  }, [])

  const sendPrivateMessage = useCallback((to, text) => {
    if (!ws.current || !text.trim()) return
    ws.current.send(JSON.stringify({
      type: 'private_message',
      to,
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit'
      })
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

  const sendReaction = useCallback((messageId, emoji) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({
      type: 'reaction',
      message_id: messageId,
      emoji
    }))
  }, [])

  const fetchPrivateHistory = useCallback((withUser) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({
      type: 'fetch_private',
      with: withUser
    }))
  }, [])

  const clearUnread = useCallback((username) => {
    setUnreadCounts(prev => ({ ...prev, [username]: 0 }))
  }, [])

  return {
    connected,
    onlineUsers,
    groupMessages,
    privateMessages,
    typingUsers,
    unreadCounts,
    sendGroupMessage,
    sendPrivateMessage,
    sendTyping,
    sendStopTyping,
    sendReaction,
    fetchPrivateHistory,
    clearUnread,
  }
}