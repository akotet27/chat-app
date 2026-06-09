import { useState, useEffect } from 'react'

export const THEMES = {
  buna: {
    name: 'Buna',
    emoji: '☕',
    description: 'Ethiopian coffee warmth',
    colors: {
      bg:           '#0D0804',
      bgSecondary:  '#1A1208',
      bgTertiary:   '#2D1F0E',
      border:       '#3D2A12',
      primary:      '#C17817',
      primaryLight: '#E8A838',
      text:         '#F5E6CC',
      textMuted:    '#8B6914',
      textFaint:    '#5A3D10',
      bubble:       '#C17817',
      bubbleText:   '#1A1208',
      otherBubble:  '#2D1F0E',
      otherText:    '#F5E6CC',
      online:       '#4CAF50',
      mention:      '#E8A838',
    }
  },
  midnight: {
    name: 'Midnight',
    emoji: '🌙',
    description: 'Deep dark blue',
    colors: {
      bg:           '#080C14',
      bgSecondary:  '#0F1520',
      bgTertiary:   '#1A2438',
      border:       '#243048',
      primary:      '#4A90E2',
      primaryLight: '#6AAFF5',
      text:         '#E8F0FF',
      textMuted:    '#6B82A8',
      textFaint:    '#3D5070',
      bubble:       '#4A90E2',
      bubbleText:   '#FFFFFF',
      otherBubble:  '#1A2438',
      otherText:    '#E8F0FF',
      online:       '#00E676',
      mention:      '#FFD740',
    }
  },
  forest: {
    name: 'Forest',
    emoji: '🌿',
    description: 'Natural calm green',
    colors: {
      bg:           '#080E08',
      bgSecondary:  '#0F1A0F',
      bgTertiary:   '#1A2E1A',
      border:       '#243824',
      primary:      '#4CAF50',
      primaryLight: '#81C784',
      text:         '#E8F5E9',
      textMuted:    '#66BB6A',
      textFaint:    '#388E3C',
      bubble:       '#4CAF50',
      bubbleText:   '#FFFFFF',
      otherBubble:  '#1A2E1A',
      otherText:    '#E8F5E9',
      online:       '#69F0AE',
      mention:      '#FFD54F',
    }
  },
  ember: {
    name: 'Ember',
    emoji: '🔥',
    description: 'Warm fiery energy',
    colors: {
      bg:           '#0E0806',
      bgSecondary:  '#1C100A',
      bgTertiary:   '#2E1A10',
      border:       '#3E2415',
      primary:      '#E64A19',
      primaryLight: '#FF7043',
      text:         '#FBE9E7',
      textMuted:    '#FF8A65',
      textFaint:    '#BF360C',
      bubble:       '#E64A19',
      bubbleText:   '#FFFFFF',
      otherBubble:  '#2E1A10',
      otherText:    '#FBE9E7',
      online:       '#69F0AE',
      mention:      '#FFD740',
    }
  },
  frost: {
    name: 'Frost',
    emoji: '❄️',
    description: 'Clean light mode',
    colors: {
      bg:           '#F5F8FF',
      bgSecondary:  '#FFFFFF',
      bgTertiary:   '#E8F0FF',
      border:       '#D0DDF5',
      primary:      '#2979FF',
      primaryLight: '#5C9CFF',
      text:         '#1A2540',
      textMuted:    '#5570A0',
      textFaint:    '#8899BB',
      bubble:       '#2979FF',
      bubbleText:   '#FFFFFF',
      otherBubble:  '#E8F0FF',
      otherText:    '#1A2540',
      online:       '#00C853',
      mention:      '#FF6D00',
    }
  }
}

export function useTheme() {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('werewere_theme') || 'buna'
  })

  const theme = THEMES[themeName] || THEMES.buna

  const setTheme = (name) => {
    localStorage.setItem('werewere_theme', name)
    setThemeName(name)
  }

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement
    const c = theme.colors
    root.style.setProperty('--bg', c.bg)
    root.style.setProperty('--bg-secondary', c.bgSecondary)
    root.style.setProperty('--bg-tertiary', c.bgTertiary)
    root.style.setProperty('--border', c.border)
    root.style.setProperty('--primary', c.primary)
    root.style.setProperty('--primary-light', c.primaryLight)
    root.style.setProperty('--text', c.text)
    root.style.setProperty('--text-muted', c.textMuted)
    root.style.setProperty('--text-faint', c.textFaint)
    root.style.setProperty('--bubble', c.bubble)
    root.style.setProperty('--bubble-text', c.bubbleText)
    root.style.setProperty('--other-bubble', c.otherBubble)
    root.style.setProperty('--other-text', c.otherText)
    root.style.setProperty('--online', c.online)
    root.style.setProperty('--mention', c.mention)
  }, [themeName])

  return { theme, themeName, setTheme, themes: THEMES }
}