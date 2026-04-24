import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { emojis } from './data/emojis'

// ── Categories (warm retro palette) ──────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'TOUT',      icon: '∞',          color: '#e8c040' },
  { id: 'joy',       label: 'JOIE',      icon: '(◕‿◕)',      color: '#f0c848' },
  { id: 'sad',       label: 'TRISTE',    icon: '(╥﹏╥)',      color: '#b898e0' },
  { id: 'angry',     label: 'COLÈRE',    icon: '(╯°□°)',      color: '#e87050' },
  { id: 'surprise',  label: 'SURPRISE',  icon: 'Σ',           color: '#f0a070' },
  { id: 'malice',    label: 'MALICE',    icon: '( ͡~',        color: '#d0a0e0' },
  { id: 'lenny',     label: 'LENNY',     icon: '( ͡°',        color: '#e070b8' },
  { id: 'tableflip', label: 'FLIP',      icon: '┻━┻',        color: '#e88050' },
  { id: 'love',      label: 'AMOUR',     icon: '♡',           color: '#f06888' },
  { id: 'cool',      label: 'COOL',      icon: '(⌐■_■)',      color: '#78c8b8' },
  { id: 'think',     label: 'DOUTE',     icon: '(¬_¬)',       color: '#c8b070' },
  { id: 'tired',     label: 'FATIGUE',   icon: '(-.-)zzZ',    color: '#a0b8d0' },
  { id: 'victory',   label: 'VICTOIRE',  icon: '(ง •̀_•́)ง', color: '#98d048' },
  { id: 'shy',       label: 'GÊNE',      icon: '(⁄⁄>⁄⁄)',    color: '#f0a0b8' },
  { id: 'animals',   label: 'KAWAII',     icon: 'ʕ•ᴥ•ʔ',      color: '#80d0a0' },
  { id: 'actions',   label: 'ACTIONS',   icon: '(ノ ゜Д゜)',   color: '#d0a070' },
  { id: 'dark',      label: 'DARK',      icon: '(҂‾ ▵‾)',     color: '#888888' },
  { id: 'symbols',   label: 'SYMBOLES',  icon: '✦',           color: '#e8b040' },
  { id: 'misc',      label: 'DIVERS',    icon: '(•_•)',       color: '#b0b8c8' },
  { id: 'decor',     label: 'DÉCO',      icon: '✿',           color: '#60c0a8' },
  { id: 'fresque',   label: 'FRESQUE',   icon: '𓁺',           color: '#c87890' },
  { id: 'gothique',  label: 'GOTHIQUE',  icon: '𝔇',           color: '#808098' },
]

// ── Copy helper ──────────────────────────────────────────────────────
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

// ── Dots component (traffic lights) ──────────────────────────────────
function Dots({ size }) {
  const cls = size === 'sm' ? 'dot dot--sm' : 'dot'
  return (
    <>
      <span className={`${cls} dot--close`} />
      <span className={`${cls} dot--min`} />
      <span className={`${cls} dot--max`} />
    </>
  )
}

// ── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery]         = useState('')
  const [category, setCategory]   = useState('all')
  const [toast, setToast]         = useState(null)
  const [flashIdx, setFlashIdx]   = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallTip, setShowInstallTip] = useState(false)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true

  // PWA install prompt (Android Chrome)
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installTipTimer = useRef(null)
  const handleInstall = useCallback(async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setInstallPrompt(null)
    } else {
      // iOS / fallback — show tip
      clearTimeout(installTipTimer.current)
      setShowInstallTip(true)
      installTipTimer.current = setTimeout(() => setShowInstallTip(false), 5000)
    }
  }, [installPrompt])

  const toastTimer  = useRef(null)
  const flashTimer  = useRef(null)
  const searchRef   = useRef(null)

  // Category counts
  const catCounts = useMemo(() => {
    const c = { all: emojis.length }
    emojis.forEach(e => { c[e.category] = (c[e.category] || 0) + 1 })
    return c
  }, [])

  // Filtered list
  const filtered = useMemo(() => {
    let list = category === 'all' ? emojis : emojis.filter(e => e.category === category)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(e =>
        e.emoji.toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.includes(q)))
      )
    }
    return list
  }, [query, category])

  const activeCat = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]

  // Copy handler
  const handleCopy = useCallback(async (emoji, idx, catColor) => {
    await copyToClipboard(emoji)

    clearTimeout(flashTimer.current)
    setFlashIdx(idx)
    flashTimer.current = setTimeout(() => setFlashIdx(null), 500)

    clearTimeout(toastTimer.current)
    setToast({ emoji, color: catColor })
    toastTimer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  // Category switch
  const handleCategory = useCallback((id) => {
    setCategory(id)
    setQuery('')
  }, [])

  // Cleanup
  useEffect(() => () => {
    clearTimeout(toastTimer.current)
    clearTimeout(flashTimer.current)
  }, [])

  return (
    <div className="desktop">

      {/* ── PIXEL DECORATIONS (visible on wide screens) ── */}
      <div className="desktop-decor" aria-hidden="true">
        <span className="pixel-item">♥</span>
        <span className="pixel-item">★</span>
        <span className="pixel-item">♪</span>
        <span className="pixel-item">✦</span>
        <span className="pixel-item">◆</span>
        <span className="pixel-item">✿</span>
      </div>

      {/* ── WINDOW ────────────────────────────── */}
      <div className="window">

        {/* Title Bar */}
        <div className="titlebar">
          <div className="titlebar-left">
            <Dots />
          </div>
          <span className="titlebar-title">Emo-Jue</span>
          <span className="titlebar-badge">
            [{filtered.length}/{emojis.length}]
          </span>
          {!isStandalone && (
            <button className="notif-btn" onClick={handleInstall} aria-label="Install" title="Install app">
              <span className="floppy" aria-hidden="true" />
            </button>
          )}
          <span className="cute-heart" aria-hidden="true">♥</span>
        </div>

        {/* Toolbar: Search */}
        <div className="toolbar">
          <label className="search-field" htmlFor="search">
            <span className="search-icon">⌕</span>
            <input
              id="search"
              ref={searchRef}
              className="search-input"
              type="search"
              inputMode="text"
              placeholder="Search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {query && (
              <button className="search-clear" onClick={() => { setQuery(''); searchRef.current?.focus() }}>
                ✕
              </button>
            )}
          </label>
        </div>

        {/* Category Tabs */}
        <nav className="tabs" aria-label="Categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`tab ${category === cat.id ? 'tab--active' : ''}`}
              style={{ '--c': cat.color }}
              onClick={() => handleCategory(cat.id)}
              aria-pressed={category === cat.id}
            >
              <span className="tab-icon">{cat.icon}</span>
              <span className="tab-label">{cat.label}</span>
              <span className="tab-count">{catCounts[cat.id] ?? 0}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="window-body" aria-label="Emoji grid">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-window">
                <div className="empty-titlebar">
                  <Dots size="sm" />
                  <span className="empty-titlebar-text">Not Found</span>
                </div>
                <div className="empty-content">
                  <div className="empty-icon">?</div>
                  <div className="empty-face">¯\_(ツ)_/¯</div>
                  <div className="empty-msg">NO EMOJIS FOUND</div>
                  <button className="empty-btn" onClick={() => { setQuery(''); setCategory('all') }}>
                    OK → RESET
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid${category === 'fresque' ? ' grid--fresque' : ''}`}>
              {filtered.map((item, i) => {
                const catColor = CATEGORIES.find(c => c.id === item.category)?.color ?? '#e8c040'
                const isFlashing = flashIdx === i
                const isFresque = item.category === 'fresque'
                return (
                  <button
                    key={i}
                    className={`card${isFresque ? ' card--fresque' : ''} ${isFlashing ? 'card--flash' : ''}`}
                    style={{ '--c': catColor }}
                    onClick={() => handleCopy(item.emoji, i, catColor)}
                    aria-label={`Copy: ${item.emoji}`}
                    title={item.emoji}
                  >
                    <pre className={`card-emoji${isFresque ? ' card-emoji--fresque' : ''}`}>{item.emoji}</pre>
                    <span className="card-hint">COPY</span>
                  </button>
                )
              })}
            </div>
          )}
        </main>

        {/* Status Bar */}
        <div className="statusbar">
          <div className="statusbar-left">
            <span className="statusbar-dot" style={{ background: activeCat.color }} />
            <span>{activeCat.label}</span>
          </div>
          <span>{filtered.length} items</span>
        </div>
      </div>

      {/* ── INSTALL TIP (iOS / fallback) ──────────── */}
      {showInstallTip && (
        <div className="install-tip" onClick={() => setShowInstallTip(false)}>
          <div className="install-tip-bar">
            <Dots size="sm" />
            <span className="toast-title">Installer</span>
          </div>
          <div className="install-tip-body">
            <span className="floppy" aria-hidden="true" />
            <p className="install-tip-text">
              Appuie sur <strong>Partager</strong> (⎋) puis<br />
              <strong>Sur l'écran d'accueil</strong>
            </p>
          </div>
        </div>
      )}

      {/* ── TOAST (mini dialog) ────────────────── */}
      {toast && (
        <div className="toast" style={{ '--c': toast.color }} key={toast.emoji + Date.now()}>
          <div className="toast-bar">
            <Dots size="sm" />
            <span className="toast-title">Copied!</span>
          </div>
          <div className="toast-body">
            <span className="toast-emoji">{toast.emoji}</span>
            <span className="toast-label">✓ COPIED</span>
          </div>
        </div>
      )}
    </div>
  )
}
