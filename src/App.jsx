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

// ── Poem (easter egg) ────────────────────────────────────────────────
const POEM = `Le petit explorateur que je suis échangerait toutes les aventures sur terre.
Pour sentir ton parfum porté par de douces alizés.
Pour contempler tes lèvres me murmurer tes plus belles découvertes.
Pour parcourir ta peau et en faire la cartographie.
J'aime cette boule au ventre avant chaque grand voyage.
En regardant droit vers l'horizon, il m'apparaît que le prochain, porte ton nom.

— Marcel, ton explorateur en pixels`

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

// ── Typewriter hook (human-like rhythm) ─────────────────────────────
function useTypewriter(text, active) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) {
      setDisplayed('')
      setDone(false)
      return
    }
    let i = 0
    let cancelled = false
    setDisplayed('')
    setDone(false)

    function nextChar() {
      if (cancelled) return
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { setDone(true); return }

      const ch = text[i - 1]
      const next = text[i] || ''
      let delay = 55 + Math.random() * 45          // base 55–100ms
      if (ch === '.' || ch === '…') delay += 320 + Math.random() * 180  // full stop
      else if (ch === ',') delay += 120 + Math.random() * 80            // comma
      else if (ch === '\n') delay += 400 + Math.random() * 200          // new line
      else if (ch === '—') delay += 200 + Math.random() * 100           // dash
      else if (ch === ' ' && next === next.toUpperCase() && next !== next.toLowerCase())
        delay += 60 + Math.random() * 40            // before capital
      else if (Math.random() < 0.07) delay += 140   // occasional hesitation

      setTimeout(nextChar, delay)
    }

    const start = setTimeout(nextChar, 600) // initial pause
    return () => { cancelled = true; clearTimeout(start) }
  }, [text, active])

  return { displayed, done }
}

// ── ASCII Boat animation ─────────────────────────────────────────────
const WAVE_FRAMES = [
  ['     ⛵        ', '~∽~∽~∽~∽~∽~∽~∽~'],
  ['      ⛵       ', '∽~∽~∽~∽~∽~∽~∽~'],
  ['       ⛵      ', '~∽~∽~∽~∽~∽~∽~∽'],
  ['      ⛵       ', '∽~∽~∽~∽~∽~∽~∽~'],
  ['     ⛵        ', '~∽~∽~∽~∽~∽~∽~∽~'],
  ['    ⛵         ', '∽~∽~∽~∽~∽~∽~∽~'],
  ['   ⛵          ', '~∽~∽~∽~∽~∽~∽~∽'],
  ['    ⛵         ', '∽~∽~∽~∽~∽~∽~∽~'],
]

function AsciiBoat() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      setFrame(f => (f + 1) % WAVE_FRAMES.length)
    }, 350)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="boat-anim" aria-hidden="true">
      <div className="boat-frame">{WAVE_FRAMES[frame][0]}</div>
      <div className="boat-frame">{WAVE_FRAMES[frame][1]}</div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery]         = useState('')
  const [category, setCategory]   = useState('all')
  const [toast, setToast]         = useState(null)
  const [flashIdx, setFlashIdx]   = useState(null)
  const [showPoem, setShowPoem]   = useState(false)

  const toastTimer  = useRef(null)
  const flashTimer  = useRef(null)
  const searchRef   = useRef(null)

  const { displayed: poemText, done: poemDone } = useTypewriter(POEM, showPoem)

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
          <button className="notif-btn" onClick={() => setShowPoem(true)} aria-label="Message">
            <span className="notif-icon">✉</span>
            <span className="notif-dot" />
          </button>
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
            <div className="grid">
              {filtered.map((item, i) => {
                const catColor = CATEGORIES.find(c => c.id === item.category)?.color ?? '#e8c040'
                const isFlashing = flashIdx === i
                return (
                  <button
                    key={i}
                    className={`card ${isFlashing ? 'card--flash' : ''}`}
                    style={{ '--c': catColor }}
                    onClick={() => handleCopy(item.emoji, i, catColor)}
                    aria-label={`Copy: ${item.emoji}`}
                    title={item.emoji}
                  >
                    <span className="card-emoji">{item.emoji}</span>
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

      {/* ── POEM OVERLAY (easter egg) ─────────────── */}
      {showPoem && (
        <div className="poem-backdrop" onClick={() => setShowPoem(false)}>
          <div className="poem-window" onClick={e => e.stopPropagation()}>
            <div className="poem-titlebar">
              <div className="poem-titlebar-left">
                <Dots size="sm" />
              </div>
              <span className="poem-titlebar-text">lettre.txt</span>
              <button className="poem-close" onClick={() => setShowPoem(false)}>✕</button>
            </div>
            <div className="poem-body">
              <p className="poem-text">
                {poemText}
                {!poemDone && <span className="poem-cursor">█</span>}
              </p>
              {poemDone && <AsciiBoat />}
            </div>
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
