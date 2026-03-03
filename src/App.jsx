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

// ── Messages (retro mailbox) ─────────────────────────────────────────
const MESSAGES = [
  {
    id: 3,
    from: 'Marcel',
    subject: 'Marseille BB',
    date: '27/02/26',
    read: false,
    isAscii: true,
    body: `@@@@@@%%%%%%%%#######*******++++++++=====+###*#-......-----=--**-::*%@@@@@@@@%@@@@@@@@%+====++++++++*******#######%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@%%%%%%%%#######*******++++++++======+#%*++-....**+=-:::-===+%@@@@@@*-*%@@@@@@@@@*======+++++++*******#######%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@%%%%%%%%#######********++++++++======+###+=*=::--=#=**+*#%#***##@@+.:=#@@@@@@@@%========++++++*******#######%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@%%%%%%%%########*******++++++++======-+%##++*=::.....:-=----=*%@%+==-=#@@@@@@@@#====+++++++++*******########%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@%%%%%%%%########********+++++++======-:%@%#*++:.:......-+#%@%#*===+=*#%@@@@@@@@#=====++++++++*******########%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@%%%%%%%%########*******++++++++======.-@@%%%%*===:.....-=++=:..:=%%%@@@@@@@@@@#=====+++++++*******#########%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@%%%%%%%%########********++++++++====*=.=@@%%%#%##=.......::::-+*%@@@@@@@@@@@@@%+====+++++++*******########%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@%%%%%%%%%########*******++++++++===#@*..-@@@@##%*+#*--+=..:::+%@@@@@@:   .-@@@%@@++=++++++*******########%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@%%%%%%%%########********+++++++++*@@@:.::-. .=@@@@@@%#@#++#%@@@@@@@@:    .%+   :@*++++++********########%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@%%%%%%%%########********++++@@@@@@@%....    .=@@@@@@@@@@@@@@@@@@@@@:   .-#%   .=@%++++********########%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@%%%%%%%%#########********++%@@@@@@.   ..    -#@@@@@@@@@@@@@@@@@@@@@+   .:*@  .-+%@@%#********#########%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@%%%%%%%%%%########********%@@@@@@-         .=*#@☆*:.｡.oJUEo.｡.:*☆@@%    .=@. ..=%@@@@@@@++***########%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@%%%%%%%%%########*****#@@@@@@@@@   .::    .=:  .-#@@@@@@@@@@@@@@@@@     .%= ...+@@@@@@@@@@@#*######%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@%%%%%%%%%#########@@@@@@@@@@@@:   .:=    .==.. ....:-+*#%%@@@@@@@@     .**   .=#@@@@@@@@@@@@@@@@%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@%%%%%%%%%###%@@@@@@@@@@@@@@@@    .:-    .-%@#=.........:---+@@@@@     .=*   .-+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@%%%%%%%@@@@@@@@@@@@@@@@@@@@:    .=      -%@@@@@@%+:......=@@@@@@     .:+   .:=%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%.    .+     .=%@@@@@@@@@@@@@@@@@@@@@@     ..-:  .:=+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@-     .-     .-%@@@@@@@@@@@@@@@@@@@@@@.      .- ..::=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.    ...    .:=@@@@@@@@@@@@@@@@@@@@@@@.    ..+=  ..:+%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%.    .-.     =+@@@@@@@@@@@@@@@@@@@@@@@+    .:*+  ..:+#@@@@@@@@@@@@@%*--::::-#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*.    .-.    .:*%@+:.:*@@@@@@@@@@@@.  .:    .:*+   .:=%@@@@@@@@@@@=.......::=*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ %@@@@@@@@@@@@@@@@%:.....::-*@@@@@@@@@@+..   .-.   ..-*%@-. .:#@@@@@@@@@@.   ...   .:*=   ..=%%@@@@@@@@-......:-==+*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@:...:.::::--+@@@@@@@@+......-.   ..=%@+. ..:=- .*@@*... ...=%.   ..--.  ..:*#@@@@@@%.....:-*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@#****=-::-==--#@@@@@=......:.  ...=%@:   ..#. .:*.   ..          .::   ..-#@@@@@@=:...:-*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@*===--===+#@@%.     .:   ...-#%.  .-*%.  :-    .          ..:..  ..-@@@@@@%*-..:-*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@%+=----==:. .... ....    ..:==  ...-#  .-:   ..   ..    ..:-.....:=%@@@@@@*=-:-*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@=-::::............................*  .=.  ..     .    ...=--::-=*@@@@@@@*+=+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@*-:.......:...........::.........-:.:=.         .. .....=%#*+#%@@@@@@@@%**#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@*:::.....----=-:.....:::....:...::-=+..    .......:-==*@@@%%%@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%=:::::.:====--::::===:::.::-:::-=+*:........-::--+**#@@%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%+=----====++===+##*+=-=**===-=+*%=..:::::-====+#%%*%%@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##**+++++++==+**+==*#*=++**#%%%%:.:::::--===+#%%**#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:*##**+++++=+*#***###*++**####@@-::::---=++++*%%#*#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#**++++++**++###***##%%%%@@@*------==++***#%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#*+++***#%%%%%%%%%%@@@@@@@=-===++*######%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ %%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%@@@@@@@@@@@@@@@@@@@@@#*+++*####%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@ @@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@ @@@%@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@*+@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@#%@+*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@#*+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@#@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`,
  },
  {
    id: 2,
    from: 'Marcel',
    subject: 'Bonjour !',
    date: '26/02/26',
    read: false,
    body: '',
    showHeart: true,
  },
  {
    id: 1,
    from: 'Marcel',
    subject: 'Un mot d\'aventure',
    date: '25/02/26',
    read: false,
    body: `Le petit explorateur que je suis échangerait toutes les aventures sur terre.
Pour sentir ton parfum porté par de douces alizés.
Pour contempler tes lèvres me murmurer tes plus belles découvertes.
Pour parcourir ta peau et en faire la cartographie.
J'aime cette boule au ventre avant chaque grand voyage.
En regardant droit vers l'horizon, il m'apparaît que le prochain, porte ton nom.

— Marcel, ton explorateur en pixels`,
    showBoat: true,
  },
]

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

// ── Line-reveal hook (for ASCII art messages) ─────────────────────────
function useLineReveal(lineCount, active) {
  const [count, setCount] = useState(0)
  const [done, setDone]   = useState(false)

  useEffect(() => {
    if (!active) { setCount(lineCount); setDone(true); return }
    setCount(0)
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setCount(i)
      if (i >= lineCount) { clearInterval(id); setDone(true) }
    }, 220)
    return () => clearInterval(id)
  }, [active, lineCount])

  return { count, done }
}

// ── ASCII Heart animation (beating with moving stars) ────────────────
// Helper: pad each line to W chars for perfect alignment
const W = 52
const pad = s => s.padEnd(W)
const BORDER_TOP = '^'.repeat(W)
const BORDER_BOT = '()'.repeat(W / 2)

const HEART_1 = [
  BORDER_TOP,
  '< :::::::::::::::::::::::::::::::::::::::::::::::: >',
  '< ::::::::         ::::::::         :::::::::::::: >',
  '< ::::::   ****     ::::::::    ****    ::::::::::: >',
  '< :::::  ****        ::::::      ****   :::::::::: >',
  '< ::::  ****                      ****   ::::::::: >',
  '< :::  ****                        ****  ::::::::: >',
  '< :::  ****                        ****  ::::::::: >',
  '< ::::  ****                      ****   ::::::::: >',
  '< :::::  ****                    ****   :::::::::: >',
  '< ::::::  ****                  ****   ::::::::::: >',
  '< :::::::  ****                ****   :::::::::::: >',
  '< ::::::::   ****            ****   :::::::::::::: >',
  '< ::::::::::   ****        ****   :::::::::::::::: >',
  '< ::::::::::::   ****    ****   :::::::::::::::::: >',
  '< ::::::::::::::   ********   :::::::::::::::::::: >',
  '< ::::::::::::::::   ****   :::::::::::::::::::::: >',
  '< ::::::::::::::::::  **  ::::::::::::::::::::::::  >',
  '< :::::::::::::::::::::::::::::::::::::::::::::::: >',
  BORDER_BOT,
].map(pad).join('\n')

const HEART_2 = [
  BORDER_TOP,
  '< :::::::::::::::::::::::::::::::::::::::::::::::: >',
  '< :::::::          ::::::::          ::::::::::::: >',
  '< ::::   ****       ::::::::      ****   ::::::::: >',
  '< :::  ****           ::::::        ****  :::::::: >',
  '< ::  ****                           **** :::::::: >',
  '< ::  ****                            ****:::::::: >',
  '< ::  ****                            ****:::::::: >',
  '< ::  ****                           **** :::::::: >',
  '< :::  ****                         ****  :::::::: >',
  '< ::::  ****                       ****  ::::::::: >',
  '< :::::  ****                     ****  :::::::::: >',
  '< ::::::   ****                 ****  :::::::::::: >',
  '< ::::::::   ****             ****  :::::::::::::: >',
  '< ::::::::::   ****         ****  :::::::::::::::: >',
  '< ::::::::::::   *********   ::::::::::::::::::::: >',
  '< ::::::::::::::   *****   ::::::::::::::::::::::: >',
  '< ::::::::::::::::  ***  ::::::::::::::::::::::::::  >',
  '< :::::::::::::::::::::::::::::::::::::::::::::::: >',
  BORDER_BOT,
].map(pad).join('\n')

// Heartbeat timing: lub (expand) - dub (expand) - pause
const BEAT_SEQUENCE = [
  { frame: 0, dur: 600 },  // resting
  { frame: 1, dur: 150 },  // lub (expand)
  { frame: 0, dur: 200 },  // back
  { frame: 1, dur: 150 },  // dub (expand)
  { frame: 0, dur: 800 },  // long rest
]

function AsciiHeart() {
  const lines1 = HEART_1.split('\n')
  const totalLines = lines1.length
  const [revealed, setRevealed] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [step, setStep] = useState(0)

  // Phase 1: line-by-line CRT loading
  useEffect(() => {
    if (loaded) return
    if (revealed >= totalLines) {
      // small pause before heartbeat starts
      const t = setTimeout(() => setLoaded(true), 400)
      return () => clearTimeout(t)
    }
    const delay = revealed === 0 ? 300 : 60 + Math.random() * 50 // 60-110ms per line
    const t = setTimeout(() => setRevealed(r => r + 1), delay)
    return () => clearTimeout(t)
  }, [revealed, loaded, totalLines])

  // Phase 2: heartbeat animation
  useEffect(() => {
    if (!loaded) return
    const beat = BEAT_SEQUENCE[step]
    const t = setTimeout(() => {
      setStep(s => (s + 1) % BEAT_SEQUENCE.length)
    }, beat.dur)
    return () => clearTimeout(t)
  }, [step, loaded])

  if (!loaded) {
    // Build loading display: revealed lines + blank lines for the rest
    const visibleLines = lines1.slice(0, revealed)
    const blankLines = Array(totalLines - revealed).fill(' '.repeat(W))
    const display = [...visibleLines, ...blankLines].join('\n')
    return (
      <div className="heart-anim" aria-hidden="true">
        <pre className="heart-frame heart-loading">{display}</pre>
      </div>
    )
  }

  const heart = BEAT_SEQUENCE[step].frame === 0 ? HEART_1 : HEART_2
  return (
    <div className="heart-anim" aria-hidden="true">
      <pre className="heart-frame">{heart}</pre>
    </div>
  )
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
  const [swipeDir, setSwipeDir]   = useState(null) // 'left' | 'right' | null
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

  // ── Mailbox state ──
  const [showMailbox, setShowMailbox] = useState(false)
  const [openMsgId, setOpenMsgId]     = useState(null)
  const [readIds, setReadIds]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('mail_read') || '[]') } catch { return [] }
  })

  const openMsg = MESSAGES.find(m => m.id === openMsgId)
  const alreadyRead = openMsg ? readIds.includes(openMsg.id) : false
  const unreadCount = MESSAGES.filter(m => !readIds.includes(m.id)).length

  // Preprocess ASCII body into lines (stable as long as openMsg doesn't change)
  const asciiLines = openMsg?.isAscii
    ? openMsg.body.replace(/ (?=[@%]{4,})/g, '\n').split('\n')
    : []

  // Line-reveal for ASCII messages
  const { count: asciiCount, done: asciiDone } = useLineReveal(
    asciiLines.length, openMsgId !== null && openMsg?.isAscii && !alreadyRead
  )

  // Typewriter for non-ASCII messages
  const { displayed: msgText, done: msgDone } = useTypewriter(
    openMsg?.body || '', openMsgId !== null && !alreadyRead && !openMsg?.isAscii
  )

  // Mark as read once reveal/typewriter finishes
  useEffect(() => {
    const isDone = openMsg?.isAscii ? asciiDone : msgDone
    if (isDone && openMsg && !readIds.includes(openMsg.id)) {
      const next = [...readIds, openMsg.id]
      setReadIds(next)
      try { localStorage.setItem('mail_read', JSON.stringify(next)) } catch {}
    }
  }, [msgDone, asciiDone])

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

  // Category switch — also scroll the active tab into view
  const tabsRef = useRef(null)
  const handleCategory = useCallback((id) => {
    setCategory(id)
    setQuery('')
    // Scroll the selected tab into view
    requestAnimationFrame(() => {
      const container = tabsRef.current
      if (!container) return
      const btn = container.querySelector(`[data-cat="${id}"]`)
      if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    })
  }, [])

  // Swipe between categories
  const touchRef = useRef(null)
  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!touchRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    const dt = Date.now() - touchRef.current.time
    touchRef.current = null

    // Must be horizontal enough, fast enough, and far enough
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.7 || dt > 400) return

    const currentIdx = CATEGORIES.findIndex(c => c.id === category)
    if (dx < 0 && currentIdx < CATEGORIES.length - 1) {
      // Swipe left → next category
      setSwipeDir('left')
      setTimeout(() => { handleCategory(CATEGORIES[currentIdx + 1].id); setSwipeDir(null) }, 180)
    } else if (dx > 0 && currentIdx > 0) {
      // Swipe right → previous category
      setSwipeDir('right')
      setTimeout(() => { handleCategory(CATEGORIES[currentIdx - 1].id); setSwipeDir(null) }, 180)
    }
  }, [category, handleCategory])

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
          <button className="notif-btn" onClick={() => { setShowMailbox(true); setOpenMsgId(null) }} aria-label="Message">
            <span className="notif-icon">✉</span>
            {unreadCount > 0 && <span className="notif-dot" />}
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
        <nav className="tabs" aria-label="Categories" ref={tabsRef}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              data-cat={cat.id}
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
        <main
          className="window-body"
          aria-label="Emoji grid"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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
            <div className={`grid${category === 'fresque' ? ' grid--fresque' : ''}${swipeDir ? ` grid--swipe-${swipeDir}` : ''}`}>
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

      {/* ── MAILBOX OVERLAY ─────────────────────────── */}
      {showMailbox && (
        <div className="mail-backdrop" onClick={() => { setShowMailbox(false); setOpenMsgId(null) }}>
          <div className="mail-window" onClick={e => e.stopPropagation()}>

            {/* Mail titlebar */}
            <div className="mail-titlebar">
              <div className="mail-titlebar-left">
                <Dots size="sm" />
              </div>
              <span className="mail-titlebar-text">
                {openMsgId ? '✉ message' : '✉ boîte de réception'}
              </span>
              <button className="poem-close" onClick={() => { setShowMailbox(false); setOpenMsgId(null) }}>✕</button>
            </div>

            {/* Inbox list OR message view */}
            {openMsgId === null ? (
              <div className="mail-inbox">
                <div className="mail-toolbar">
                  <span className="mail-toolbar-label">INBOX</span>
                  <span className="mail-toolbar-count">
                    {MESSAGES.length} msg{MESSAGES.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mail-list">
                  {MESSAGES.map(m => {
                    const isRead = readIds.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        className={`mail-row ${isRead ? 'mail-row--read' : ''}`}
                        onClick={() => setOpenMsgId(m.id)}
                      >
                        <span className="mail-row-status">{isRead ? '◇' : '◆'}</span>
                        <span className="mail-row-from">{m.from}</span>
                        <span className="mail-row-subject">{m.subject}</span>
                        <span className="mail-row-date">{m.date}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mail-statusbar">
                  <span>{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</span>
                  <span>▪ Emo-Jue Mail v1.0</span>
                </div>
              </div>
            ) : (
              <div className="mail-reader">
                <div className="mail-reader-header">
                  <button className="mail-back" onClick={() => setOpenMsgId(null)}>
                    ← retour
                  </button>
                  <div className="mail-meta">
                    <span className="mail-meta-from">De : <strong>{openMsg?.from}</strong></span>
                    <span className="mail-meta-subject">Objet : {openMsg?.subject}</span>
                    <span className="mail-meta-date">{openMsg?.date}</span>
                  </div>
                </div>
                <div className="mail-reader-body">
                  {openMsg?.body && (
                    openMsg.isAscii ? (
                      <pre className="poem-text poem-text--ascii">
                        {(alreadyRead ? asciiLines : asciiLines.slice(0, asciiCount)).join('\n')}
                        {!alreadyRead && !asciiDone && <span className="poem-cursor">█</span>}
                      </pre>
                    ) : (
                      <p className="poem-text">
                        {alreadyRead ? openMsg.body : msgText}
                        {!alreadyRead && !msgDone && <span className="poem-cursor">█</span>}
                      </p>
                    )
                  )}
                  {(openMsg?.body ? (alreadyRead || msgDone) : true) && openMsg?.showBoat && <AsciiBoat />}
                  {(openMsg?.body ? (alreadyRead || msgDone) : true) && openMsg?.showHeart && <AsciiHeart />}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

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
