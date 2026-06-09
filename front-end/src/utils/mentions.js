// Parse @mentions in message text
export function parseMentions(text, onlineUsers) {
  if (!text) return [{ text, isMention: false }]

  const parts = []
  const regex = /@(\w+)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    const mentionedUser = match[1]
    const isMention = onlineUsers.some(
      u => u.toLowerCase() === mentionedUser.toLowerCase()
    )

    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isMention: false })
    }

    parts.push({ text: match[0], isMention, username: mentionedUser })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isMention: false })
  }

  return parts
}

// Check if a message mentions a specific user
export function isMentioned(text, username) {
  if (!text || !username) return false
  const regex = new RegExp(`@${username}\\b`, 'i')
  return regex.test(text)
}