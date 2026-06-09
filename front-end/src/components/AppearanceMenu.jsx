import { X, Check } from 'lucide-react'
import { THEMES } from '../hooks/useTheme'

function AppearanceMenu({ onClose, currentTheme, onSelectTheme, theme }) {
  const c = theme.colors

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 border shadow-2xl z-10"
        style={{ background: c.bgSecondary, borderColor: c.border }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-lg" style={{ color: c.text }}>
              Appearance
            </h2>
            <p className="text-xs" style={{ color: c.textMuted }}>
              Choose your vibe
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: c.bgTertiary, color: c.textMuted }}
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => {
                onSelectTheme(key)
                onClose()
              }}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all text-left"
              style={{
                background: currentTheme === key ? c.bgTertiary : 'transparent',
                borderColor: currentTheme === key ? c.primary : c.border,
              }}
            >
              {/* Theme preview circles */}
              <div className="flex gap-1 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: t.colors.bg, border: `1px solid ${t.colors.border}` }}
                >
                  {t.emoji}
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.colors.primary }}/>
                    <div className="w-3 h-3 rounded-full" style={{ background: t.colors.bgTertiary }}/>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.colors.bgTertiary }}/>
                    <div className="w-3 h-3 rounded-full" style={{ background: t.colors.primaryLight }}/>
                  </div>
                </div>
              </div>

              {/* Theme info */}
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: c.text }}>
                  {t.emoji} {t.name}
                </p>
                <p className="text-xs" style={{ color: c.textMuted }}>
                  {t.description}
                </p>
              </div>

              {/* Active check */}
              {currentTheme === key && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: c.primary }}
                >
                  <Check className="w-3.5 h-3.5" style={{ color: c.bg }}/>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Font size row */}
        <div
          className="mt-4 p-4 rounded-2xl border"
          style={{ background: c.bgTertiary, borderColor: c.border }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: c.textMuted }}>
            FONT SIZE
          </p>
          <div className="flex gap-2">
            {['Small', 'Medium', 'Large'].map((size, i) => (
              <button
                key={size}
                onClick={() => {
                  const sizes = { Small: '13px', Medium: '15px', Large: '17px' }
                  document.documentElement.style.setProperty('--font-size', sizes[size])
                  localStorage.setItem('werewere_fontsize', sizes[size])
                }}
                className="flex-1 py-2 rounded-xl text-xs font-medium border transition-colors"
                style={{
                  background: c.bgSecondary,
                  color: c.text,
                  borderColor: c.border,
                  fontSize: `${12 + i * 1.5}px`
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AppearanceMenu