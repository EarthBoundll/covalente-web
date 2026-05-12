import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function embedSpotify(url) {
  const m = url.match(/spotify\.com(?:\/intl-[a-z-]+)?(?:\/embed)?\/(artist|album|track|playlist|episode|show)\/([A-Za-z0-9]+)/)
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0` : url
}

function igShortcode(url) {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?]+)/)
  return m ? m[1] : null
}

function fmtDate(str) {
  const d = new Date(str + 'T12:00:00')
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function fmtTime(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function useFadeIn(delay = 0) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) delay ? setTimeout(() => setVis(true), delay) : setVis(true)
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return [ref, vis]
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IGIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const YTIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2s-.3-1.9-1.1-2.6c-1-1.1-2.2-1.1-2.7-1.1C16.6 2.3 12 2.3 12 2.3s-4.6 0-7.7.2c-.5 0-1.7.1-2.7 1.1C.8 4.3.5 6.2.5 6.2S.3 8.3.3 10.4v2c0 2 .2 4.1.2 4.1s.3 1.9 1.1 2.6c1 1.1 2.4 1 3 1.1C6.6 20.4 12 20.4 12 20.4s4.6 0 7.7-.2c.5-.1 1.7-.1 2.7-1.1.8-.7 1.1-2.6 1.1-2.6s.2-2.1.2-4.1v-2c0-2-.2-4.2-.2-4.2zM9.7 15V8.4l6.6 3.3L9.7 15z"/>
  </svg>
)
const TikTokIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.03a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/>
  </svg>
)
const FBIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.03 4.388 11.025 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97H15.83c-1.49 0-1.955.928-1.955 1.88v2.253h3.328l-.532 3.49h-2.796v8.437C19.612 23.098 24 18.103 24 12.073z"/>
  </svg>
)
const ThreadsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.52.85-6.376 2.526-8.44C5.875 1.32 8.628.135 12.209.135h.017c2.78.018 5.153.857 6.86 2.429 1.637 1.504 2.58 3.616 2.814 6.283l-2.73.22c-.177-2.029-.83-3.59-1.94-4.595C15.968 3.316 14.2 2.741 12.22 2.73c-2.697.016-4.748.925-6.097 2.699-1.308 1.72-1.98 4.222-1.98 7.64 0 3.417.67 5.92 1.98 7.64 1.35 1.777 3.4 2.685 6.094 2.7 1.73.01 3.221-.353 4.435-1.082 1.337-.8 2.009-2.009 2.009-3.597 0-1.052-.307-1.901-.937-2.596-.648-.713-1.534-1.14-2.648-1.274-.153 1.066-.532 1.933-1.127 2.584-.63.69-1.473 1.063-2.495 1.108-.775.033-1.552-.152-2.065-.62-.66-.594-1.004-1.48-.9-2.413.1-.89.59-1.71 1.383-2.312.731-.554 1.716-.88 2.847-.97-.247-.867-.647-1.437-1.19-1.697-.537-.256-1.2-.195-1.9.154l-.925-2.472c1.153-.518 2.28-.604 3.34-.254 1.085.36 1.89 1.13 2.437 2.29.17-.004.34-.006.507-.006 1.62 0 2.987.537 3.963 1.553 1.006 1.049 1.527 2.507 1.527 4.214 0 2.407-1.058 4.354-2.977 5.473-1.567.913-3.476 1.372-5.535 1.36z"/>
  </svg>
)
const SpotifyIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

// ── Atoms ─────────────────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border border-c-accent/25 text-c-accent3 bg-c-accent/10">
      {children}
    </span>
  )
}

function SectionHead({ label, title }) {
  const [ref, vis] = useFadeIn()
  return (
    <div ref={ref}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.2em] text-c-accent2 mb-1 transition-all duration-500 ${vis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}>
        {label}
      </p>
      <h2 className={`text-3xl md:text-4xl font-black mb-4 transition-all duration-500 delay-75 ${vis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}>
        {title}
      </h2>
      <div className={`w-12 h-0.5 bg-gradient-to-r from-c-accent to-c-accent2 rounded-full mb-8 origin-left transition-all duration-700 delay-150 ${vis ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
    </div>
  )
}

function SocialLink({ href, icon, label }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-c-accent/30 text-c-muted hover:text-c-text hover:border-c-accent2 text-sm font-semibold transition-all">
      {icon} {label}
    </a>
  )
}

// ── Spotify embed with loading state ─────────────────────────────────────────

function SpotifyEmbed({ src, height = 352 }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="relative rounded-2xl overflow-hidden border border-c-accent/25" style={{ minHeight: height }}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-c-bg3">
          <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
            <SpotifyIcon />
          </div>
          <p className="text-c-muted text-sm">Cargando Spotify...</p>
        </div>
      )}
      <iframe src={src} width="100%" height={height} frameBorder="0" allowFullScreen loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className={`block transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)} />
    </div>
  )
}

// ── Tab panel fade-in on mount ────────────────────────────────────────────────

function TabPanel({ children }) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 40)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`transition-opacity duration-500 ${vis ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  )
}

// ── FadeSection ───────────────────────────────────────────────────────────────

function FadeSection({ children, className = '', delay = 0 }) {
  const [ref, vis] = useFadeIn(delay)
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  )
}

// ── Audio player ──────────────────────────────────────────────────────────────

function TrackPlayer({ track }) {
  const [playing, setPlaying] = useState(false)
  const [time, setTime]       = useState(0)
  const [dur, setDur]         = useState(0)
  const [vol, setVol]         = useState(1)
  const [muted, setMuted]     = useState(false)
  const ref = useRef(null)
  const pct    = dur ? (time / dur) * 100 : 0
  const volPct = muted ? 0 : vol * 100

  function toggle() {
    if (playing) ref.current.pause(); else ref.current.play()
    setPlaying(p => !p)
  }

  function seek(e) {
    const r = e.currentTarget.getBoundingClientRect()
    ref.current.currentTime = ((e.clientX - r.left) / r.width) * dur
  }

  function changeVol(e) {
    const r = e.currentTarget.getBoundingClientRect()
    const v = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    setVol(v); setMuted(false)
    ref.current.volume = v
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    ref.current.volume = next ? 0 : vol
  }

  const volIcon = muted || vol === 0 ? '🔇' : vol < 0.5 ? '🔉' : '🔊'

  return (
    <div className="bg-c-bg2 border border-c-accent/25 rounded-2xl p-5 flex gap-4 items-center hover:border-c-accent2 hover:-translate-y-0.5 transition-all duration-300">
      <audio ref={ref} src={track.audio_url}
        onTimeUpdate={e => setTime(e.target.currentTime)}
        onLoadedMetadata={e => setDur(e.target.duration)}
        onEnded={() => setPlaying(false)} />

      <div className="flex-shrink-0">
        {track.cover_url
          ? <img src={track.cover_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
          : <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-c-accent to-c-accent2 flex items-center justify-center text-2xl">🎵</div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-c-text truncate">{track.title}</div>
        {track.description && <div className="text-c-muted text-sm mt-0.5">{track.description}</div>}

        <div className="flex items-center gap-2 mt-3">
          <button onClick={toggle}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-c-accent to-c-accent2 flex items-center justify-center text-white hover:opacity-90 flex-shrink-0 text-sm transition-opacity">
            {playing ? '⏸' : '▶'}
          </button>

          <div className="flex-1 h-1.5 bg-c-bg3 rounded-full cursor-pointer" onClick={seek}>
            <div className="h-full bg-gradient-to-r from-c-accent to-c-accent2 rounded-full transition-all pointer-events-none"
              style={{ width: `${pct}%` }} />
          </div>

          <span className="text-c-muted text-[11px] flex-shrink-0 tabular-nums hidden sm:inline">
            {fmtTime(time)}/{fmtTime(dur)}
          </span>

          <button onClick={toggleMute} className="text-sm flex-shrink-0 text-c-muted hover:text-c-text transition-colors">
            {volIcon}
          </button>
          <div className="w-14 h-1.5 bg-c-bg3 rounded-full cursor-pointer flex-shrink-0 hidden sm:block" onClick={changeVol}>
            <div className="h-full bg-c-muted/60 rounded-full pointer-events-none transition-all"
              style={{ width: `${volPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ tab, setTab, hasBlog }) {
  const [open, setOpen] = useState(false)
  const tabs = [
    { key: 'inicio',   label: 'Inicio'   },
    { key: 'booking',  label: 'Booking'  },
    { key: 'shows',    label: 'Shows'    },
    { key: 'videos',   label: 'Videos'   },
    ...(hasBlog ? [{ key: 'blog', label: 'Blog' }] : []),
  ]

  function go(key) { setTab(key); setOpen(false) }

  return (
    <nav className="sticky top-0 z-50 bg-c-bg/90 backdrop-blur-md border-b border-c-accent/25">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        <button onClick={() => go('inicio')}
          className="text-xl font-black uppercase tracking-widest hover:text-c-accent3 transition-colors">
          Co<span className="text-c-accent2">val</span>ente
        </button>

        {/* Desktop tabs */}
        <div className="hidden md:flex items-center gap-0.5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => go(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors ${tab === t.key ? 'text-c-accent3 bg-c-accent/15' : 'text-c-muted hover:text-c-text'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Hamburger button */}
        <button onClick={() => setOpen(o => !o)}
          className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg hover:bg-c-accent/10 transition-colors"
          aria-label="Menú">
          <span className={`block w-6 h-0.5 bg-c-text transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-c-text transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-c-text transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 space-y-1 border-t border-c-accent/15">
          {tabs.map(t => (
            <button key={t.key} onClick={() => go(t.key)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors ${tab === t.key ? 'text-c-accent3 bg-c-accent/15' : 'text-c-muted hover:text-c-text hover:bg-c-accent/8'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ settings }) {
  const [entered, setEntered] = useState(false)
  useEffect(() => { const t = setTimeout(() => setEntered(true), 80); return () => clearTimeout(t) }, [])

  const anim = 'transition-all duration-700 ease-out'
  const show = 'opacity-100 translate-y-0'
  const hide = 'opacity-0 translate-y-8'

  const genres = settings.band_genres
    ? settings.band_genres.split(',').map(g => g.trim()).filter(Boolean)
    : ['Rock Alternativo', 'Rock Fusion', 'Pop Punk', 'Indie Rock']
  const location = settings.band_location || 'Lima, Perú'

  const extraSocials = [
    { key: 'youtube_url',  icon: <YTIcon/>,      label: 'YouTube'  },
    { key: 'tiktok_url',   icon: <TikTokIcon/>,  label: 'TikTok'   },
    { key: 'facebook_url', icon: <FBIcon/>,       label: 'Facebook' },
    { key: 'threads_url',  icon: <ThreadsIcon/>, label: 'Threads'  },
    { key: 'spotify_url',  icon: <SpotifyIcon/>, label: 'Spotify'  },
  ].filter(s => settings[s.key])

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-8 pt-16 pb-14 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(123,47,190,0.3),transparent_70%)] pointer-events-none" />

      {/* Avatar */}
      <div className={`relative w-36 h-36 mb-6 ${anim} ${entered ? `${show} scale-100` : `${hide} scale-90`}`}
        style={{ transitionDelay: '0ms' }}>
        <div className="absolute -inset-2 rounded-full border border-c-accent2/25 animate-pulse" />
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-c-accent via-c-accent2 to-c-accent3" />
        <img src="/instagram/avatar.jpg" alt="Covalente"
          className="relative z-10 w-full h-full rounded-full object-cover border-[3px] border-c-bg" />
      </div>

      {/* Handle */}
      <p className={`text-sm text-c-muted tracking-widest mb-2 ${anim} ${entered ? show : hide}`}
        style={{ transitionDelay: '100ms' }}>
        @covalente.banda
      </p>

      {/* Title */}
      <h1 className={`text-[clamp(2.5rem,8vw,5.5rem)] font-black tracking-tight leading-none mb-4 bg-gradient-to-br from-white via-c-accent3 to-c-accent2 bg-clip-text text-transparent ${anim} ${entered ? show : hide}`}
        style={{ transitionDelay: '200ms' }}>
        Covalente
      </h1>

      {/* Genre tags */}
      <div className={`flex flex-wrap gap-2 justify-center mb-4 ${anim} ${entered ? show : hide}`}
        style={{ transitionDelay: '300ms' }}>
        {genres.map(t => <Tag key={t}>{t}</Tag>)}
      </div>

      {/* Location */}
      <p className={`text-sm text-c-muted tracking-wider mb-8 ${anim} ${entered ? show : hide}`}
        style={{ transitionDelay: '400ms' }}>
        📍 {location}
      </p>

      {/* Buttons */}
      <div className={`flex flex-wrap gap-3 justify-center ${anim} ${entered ? show : hide}`}
        style={{ transitionDelay: '500ms' }}>
        <a href="https://www.instagram.com/covalente.banda/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-c-accent to-c-accent2 text-white font-bold text-sm shadow-[0_0_25px_rgba(123,47,190,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(123,47,190,0.55)] transition-all">
          <IGIcon /> Instagram
        </a>
        {extraSocials.map(s => (
          <a key={s.key} href={settings[s.key]} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-c-accent/35 text-c-muted hover:text-c-text hover:border-c-accent2 hover:-translate-y-0.5 font-semibold text-sm transition-all">
            {s.icon} {s.label}
          </a>
        ))}
      </div>
    </section>
  )
}

// ── Members ───────────────────────────────────────────────────────────────────

function MemberThumb({ member, idx, active, onClick }) {
  const [ref, vis] = useFadeIn(idx * 80)
  return (
    <button ref={ref} onClick={onClick}
      className={`flex flex-col items-center gap-2 group focus:outline-none transition-all duration-500 ease-out ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all duration-300
        ${active
          ? 'ring-4 ring-c-accent2 ring-offset-2 ring-offset-c-bg scale-110 shadow-[0_0_25px_rgba(168,85,247,0.5)]'
          : 'ring-2 ring-c-accent/30 group-hover:ring-c-accent2 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
        }`}>
        {member.photo_url
          ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-c-accent to-c-accent2 flex items-center justify-center text-2xl">🎸</div>
        }
        {active && (
          <div className="absolute inset-0 bg-c-accent2/20 flex items-end justify-center pb-1">
            <div className="w-4 h-0.5 bg-c-accent3 rounded-full" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`font-bold text-sm transition-colors ${active ? 'text-c-accent3' : 'text-c-text group-hover:text-c-accent3'}`}>{member.name}</p>
        <p className="text-c-muted text-xs mt-0.5">{member.role}</p>
      </div>
    </button>
  )
}

function MemberDetail({ member }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 20); return () => clearTimeout(t) }, [])

  return (
    <div className={`transition-all duration-500 ease-out ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      mt-8 rounded-2xl overflow-hidden bg-c-bg2 border border-c-accent2/40 shadow-[0_0_40px_rgba(123,47,190,0.15)]`}>
      <div className="flex flex-col md:flex-row-reverse">
        <div className="md:w-2/5 flex-shrink-0">
          <div className="aspect-square">
            {member.photo_url
              ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-c-accent/40 to-c-accent2/30 flex items-center justify-center"><span className="text-8xl">🎸</span></div>
            }
          </div>
        </div>
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <p className="text-[11px] text-c-accent2 font-bold uppercase tracking-[0.25em] mb-2">{member.role}</p>
          <h3 className="text-3xl md:text-4xl font-black text-c-text mb-5 leading-tight">{member.name}</h3>
          {member.bio
            ? <p className="text-c-muted leading-[1.85] whitespace-pre-wrap text-[1.02rem]">{member.bio}</p>
            : <p className="text-c-muted italic text-sm opacity-60">Sin descripción añadida todavía.</p>
          }
        </div>
      </div>
    </div>
  )
}

function MembersSection({ members, settings }) {
  const [active, setActive] = useState(null)
  const [coverRef, coverVis] = useFadeIn()

  const coverUrl = settings.band_cover_url || '/instagram/post_3.jpg'

  function toggle(m) {
    setActive(prev => prev?.id === m.id ? null : m)
  }

  return (
    <section className="py-16 px-8 max-w-5xl mx-auto">
      <SectionHead label="Quiénes somos" title="La banda" />

      {/* Foto grupal */}
      <div ref={coverRef}
        className={`transition-all duration-700 ease-out ${coverVis ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}
          w-full aspect-video rounded-2xl overflow-hidden mb-10 shadow-[0_0_60px_rgba(123,47,190,0.2)]`}>
        <img src={coverUrl} alt="Covalente" className="w-full h-full object-cover" />
      </div>

      {/* Círculos */}
      <div className="flex flex-wrap gap-6 sm:gap-10 justify-center mb-2">
        {members.map((m, i) => (
          <MemberThumb key={m.id} member={m} idx={i}
            active={active?.id === m.id}
            onClick={() => toggle(m)} />
        ))}
      </div>

      {/* Panel expandido */}
      {active && <MemberDetail key={active.id} member={active} />}
    </section>
  )
}

// ── Instagram grid ────────────────────────────────────────────────────────────

function IGGridItem({ item, delay }) {
  const [ref, vis] = useFadeIn(delay)
  return (
    <a ref={ref} href={item.url} target="_blank" rel="noopener noreferrer"
      className={`aspect-square overflow-hidden rounded-lg group block transition-all duration-500 ease-out ${vis ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <img src={item.src} alt="" loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </a>
  )
}

function IGGrid({ igPosts }) {
  const items = igPosts.length
    ? igPosts.slice(0, 6).map((p, i) => ({ url: p.url, src: `/instagram/post_${i + 1}.jpg` }))
    : [1,2,3,4,5,6].map(n => ({ url: 'https://www.instagram.com/covalente.banda/', src: `/instagram/post_${n}.jpg` }))

  return (
    <section className="py-14 px-8 max-w-5xl mx-auto">
      <SectionHead label="Directo desde Instagram" title="Galería" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {items.map((item, i) => (
          <IGGridItem key={i} item={item} delay={i * 80} />
        ))}
      </div>
      <p className="text-center mt-5">
        <a href="https://www.instagram.com/covalente.banda/" target="_blank" rel="noopener noreferrer"
          className="text-c-accent3 text-sm hover:underline">Ver perfil completo en Instagram →</a>
      </p>
    </section>
  )
}

// ── Tabs content ──────────────────────────────────────────────────────────────

function InicioTab({ igPosts, tracks, members, settings }) {
  const spotifyUrl = settings.spotify_url
  const embed = spotifyUrl ? embedSpotify(spotifyUrl) : null

  return (
    <TabPanel>
      <Hero settings={settings} />
      {members.length > 0 && <MembersSection members={members} settings={settings} />}
      <IGGrid igPosts={igPosts} />

      {embed && (
        <FadeSection>
          <section className="py-14 px-8 max-w-5xl mx-auto">
            <SectionHead label="Escúchanos" title="Spotify" />
            <SpotifyEmbed src={embed} height={352} />
          </section>
        </FadeSection>
      )}

      {tracks.length > 0 && (
        <FadeSection>
          <section className="py-14 px-8 max-w-5xl mx-auto">
            <SectionHead label="Demos y maquetas" title="Música inédita" />
            <div className="space-y-3">
              {tracks.map((t, i) => (
                <FadeSection key={t.id} delay={i * 80}>
                  <TrackPlayer track={t} />
                </FadeSection>
              ))}
            </div>
          </section>
        </FadeSection>
      )}

      <footer className="text-center py-10 px-8 border-t border-c-accent/25 text-c-muted text-sm mt-8">
        <p className="mb-1"><strong className="text-c-text">Covalente</strong> · Rock Alternativo · Lima, Perú</p>
        <p><a href="https://www.instagram.com/covalente.banda/" target="_blank" rel="noopener noreferrer" className="text-c-accent3 hover:underline">@covalente.banda</a></p>
      </footer>
    </TabPanel>
  )
}

function BookingTab({ members, shows, tracks, settings }) {
  const genres      = (settings.band_genres || '').split(',').map(g => g.trim()).filter(Boolean)
  const location    = settings.band_location       || 'Lima, Perú'
  const bio         = settings.band_bio            || ''
  const highlights  = settings.booking_highlights  || ''
  const desc        = settings.booking_description || ''
  const manager     = settings.booking_manager     || ''
  const email       = settings.booking_email       || ''
  const phone       = settings.booking_phone       || ''
  const rider       = settings.booking_rider       || ''
  const spotifyUrl  = settings.spotify_url         || ''
  const hasContact  = manager || email || phone

  const spotifyEmbed = spotifyUrl ? embedSpotify(spotifyUrl) : null

  const showsByYear = shows.reduce((acc, s) => {
    const y = new Date(s.date + 'T12:00:00').getFullYear()
    ;(acc[y] = acc[y] || []).push(s)
    return acc
  }, {})
  const years = Object.keys(showsByYear).sort((a, b) => b - a)

  return (
    <TabPanel>
      <div className="py-14 px-8 max-w-4xl mx-auto space-y-8">

        {/* ── Hero banda ──────────────────────────── */}
        <FadeSection>
          <div className="relative rounded-3xl overflow-hidden bg-c-bg2 border border-c-accent/25">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(123,47,190,0.25),transparent_70%)] pointer-events-none" />
            <div className="relative flex flex-col md:flex-row gap-0 items-stretch">
              <div className="md:w-72 flex-shrink-0">
                <img src={settings.band_cover_url || '/instagram/avatar.jpg'} alt="Covalente"
                  className="w-full h-64 md:h-full object-cover" />
              </div>
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-c-accent2 mb-2">CV Musical · EPK</p>
                <h1 className="text-4xl md:text-5xl font-black leading-none mb-2">Covalente</h1>
                <p className="text-c-muted text-sm mb-5">@covalente.banda · 📍 {location}</p>
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {genres.map(g => <Tag key={g}>{g}</Tag>)}
                  </div>
                )}
                {bio && <p className="text-c-muted leading-relaxed whitespace-pre-wrap">{bio}</p>}
                <div className="flex flex-wrap gap-3 mt-6">
                  <SocialLink href="https://www.instagram.com/covalente.banda/" icon={<IGIcon/>} label="Instagram" />
                  {[
                    { key: 'youtube_url',  icon: <YTIcon/>,     label: 'YouTube'  },
                    { key: 'tiktok_url',   icon: <TikTokIcon/>, label: 'TikTok'   },
                    { key: 'facebook_url', icon: <FBIcon/>,     label: 'Facebook' },
                    { key: 'threads_url',  icon: <ThreadsIcon/>,label: 'Threads'  },
                    { key: 'spotify_url',  icon: <SpotifyIcon/>,label: 'Spotify'  },
                  ].filter(s => settings[s.key]).map(s => (
                    <SocialLink key={s.key} href={settings[s.key]} icon={s.icon} label={s.label} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeSection>

        {/* ── Descripción shows ───────────────────── */}
        {desc && (
          <FadeSection>
            <div className="bg-c-bg2 border border-c-accent/25 rounded-2xl p-8">
              <h2 className="font-black text-xl mb-4">Sobre nuestros shows</h2>
              <p className="text-c-muted leading-relaxed whitespace-pre-wrap text-[1.02rem]">{desc}</p>
            </div>
          </FadeSection>
        )}

        {/* ── Trayectoria ─────────────────────────── */}
        {(highlights || shows.length > 0) && (
          <FadeSection>
            <div className="bg-c-bg2 border border-c-accent/25 rounded-2xl p-8">
              <h2 className="font-black text-xl mb-2">Trayectoria en vivo</h2>
              <p className="text-c-muted text-sm mb-6">Escenarios y eventos donde hemos tocado.</p>

              {highlights && (
                <div className="bg-c-accent/10 border border-c-accent/25 rounded-xl p-5 mb-6">
                  <p className="text-c-text leading-relaxed whitespace-pre-wrap">{highlights}</p>
                </div>
              )}

              {years.length > 0 && (
                <div className="space-y-6">
                  {years.map(year => (
                    <div key={year}>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-c-accent2 mb-3">{year}</p>
                      <div className="space-y-2 pl-3 border-l border-c-accent/25">
                        {showsByYear[year].map(s => (
                          <div key={s.id} className="flex items-start gap-3 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-c-accent2 mt-2 flex-shrink-0 group-hover:bg-c-accent3 transition-colors" />
                            <div>
                              <p className="font-bold text-c-text leading-tight">{s.title}</p>
                              <p className="text-c-muted text-xs mt-0.5">
                                {fmtDate(s.date)}{[s.venue, s.city].filter(Boolean).length ? ' · ' + [s.venue, s.city].filter(Boolean).join(', ') : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeSection>
        )}

        {/* ── Integrantes ─────────────────────────── */}
        {members.length > 0 && (
          <FadeSection>
            <div className="bg-c-bg2 border border-c-accent/25 rounded-2xl p-8">
              <h2 className="font-black text-xl mb-6">La banda</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {members.map(m => (
                  <div key={m.id} className="text-center group">
                    <div className="w-20 h-20 mx-auto mb-2.5 rounded-xl overflow-hidden bg-gradient-to-br from-c-accent to-c-accent2 ring-2 ring-transparent group-hover:ring-c-accent2 transition-all">
                      {m.photo_url
                        ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🎸</div>
                      }
                    </div>
                    <p className="font-bold text-sm text-c-text">{m.name}</p>
                    <p className="text-c-accent3 text-xs mt-0.5">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>
        )}

        {/* ── Música ──────────────────────────────── */}
        {(spotifyEmbed || tracks.length > 0) && (
          <FadeSection>
            <div className="bg-c-bg2 border border-c-accent/25 rounded-2xl p-8">
              <h2 className="font-black text-xl mb-6">Música</h2>
              {spotifyEmbed && (
                <div className="mb-5">
                  <SpotifyEmbed src={spotifyEmbed} height={232} />
                </div>
              )}
              {tracks.length > 0 && (
                <div className="space-y-3">
                  {tracks.map(t => <TrackPlayer key={t.id} track={t} />)}
                </div>
              )}
            </div>
          </FadeSection>
        )}

        {/* ── Contacto ────────────────────────────── */}
        {hasContact && (
          <FadeSection>
            <div className="bg-gradient-to-br from-c-accent/15 to-c-accent2/5 border border-c-accent/30 rounded-2xl p-8">
              <h2 className="font-black text-xl mb-6">Contrataciones</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {manager && (
                  <div className="bg-c-bg2/50 rounded-xl p-4">
                    <p className="text-[10px] text-c-muted uppercase tracking-widest mb-1">Manager</p>
                    <p className="font-bold text-c-text">{manager}</p>
                  </div>
                )}
                {email && (
                  <div className="bg-c-bg2/50 rounded-xl p-4">
                    <p className="text-[10px] text-c-muted uppercase tracking-widest mb-1">Email</p>
                    <a href={`mailto:${email}`} className="font-bold text-c-accent3 hover:underline break-all">{email}</a>
                  </div>
                )}
                {phone && (
                  <div className="bg-c-bg2/50 rounded-xl p-4">
                    <p className="text-[10px] text-c-muted uppercase tracking-widest mb-1">WhatsApp</p>
                    <a href={`tel:${phone}`} className="font-bold text-c-accent3 hover:underline">{phone}</a>
                  </div>
                )}
              </div>
            </div>
          </FadeSection>
        )}

        {/* ── Rider ───────────────────────────────── */}
        {rider && (
          <FadeSection>
            <div className="bg-c-bg2 border border-c-accent/25 rounded-2xl p-8">
              <h2 className="font-black text-xl mb-4">Rider técnico</h2>
              <pre className="text-c-muted text-sm leading-relaxed whitespace-pre-wrap font-mono">{rider}</pre>
            </div>
          </FadeSection>
        )}

        {!hasContact && !desc && !highlights && shows.length === 0 && (
          <div className="border border-dashed border-c-accent/30 rounded-2xl p-12 text-center text-c-muted text-sm">
            <p className="text-lg font-black text-c-text mb-2">Próximamente</p>
            <p>Información de booking y contrataciones disponible pronto.</p>
          </div>
        )}

      </div>
    </TabPanel>
  )
}

function BlogTab({ posts }) {
  if (!posts.length) return (
    <TabPanel>
      <div className="text-center py-32 text-c-muted">
        <p className="text-2xl font-black text-c-text mb-2">Próximamente</p>
        <p>Aquí publicaremos novedades, letras y más.</p>
      </div>
    </TabPanel>
  )
  return (
    <TabPanel>
      <div className="py-14 px-8 max-w-3xl mx-auto">
        <SectionHead label="Novedades" title="Blog" />
        <div className="space-y-8">
          {posts.map((p, i) => (
            <FadeSection key={p.id} delay={i * 120}>
              <article className="bg-c-bg2 border border-c-accent/25 rounded-2xl overflow-hidden hover:border-c-accent2/50 transition-colors">
                {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" className="w-full aspect-video object-cover" />}
                <div className="p-6 md:p-8">
                  <p className="text-xs text-c-muted uppercase tracking-wider mb-3">{fmtDate(p.date)}</p>
                  {p.title && <h3 className="text-2xl font-black text-c-text mb-4 leading-tight">{p.title}</h3>}
                  <p className="text-c-muted leading-[1.85] whitespace-pre-wrap text-[1.05rem]">{p.content}</p>
                </div>
              </article>
            </FadeSection>
          ))}
        </div>
      </div>
    </TabPanel>
  )
}

function ShowsTab({ shows }) {
  return (
    <TabPanel>
      <div className="py-14 px-8 max-w-5xl mx-auto">
        <SectionHead label="En vivo" title="Shows" />
        {shows.length === 0
          ? <p className="text-c-muted">Próximamente nuevas fechas. Síguenos en <a href="https://www.instagram.com/covalente.banda/" target="_blank" rel="noopener noreferrer" className="text-c-accent3 hover:underline">@covalente.banda</a>.</p>
          : (
            <div className="space-y-3">
              {shows.map((s, i) => {
                const d = new Date(s.date + 'T12:00:00')
                return (
                  <FadeSection key={s.id} delay={i * 80}>
                    <div className="flex gap-5 items-start bg-c-bg2 border border-c-accent/25 rounded-2xl p-5 hover:border-c-accent2 hover:translate-x-1 hover:shadow-[0_0_20px_rgba(123,47,190,0.1)] transition-all duration-300">
                      <div className="flex-shrink-0 w-16 bg-gradient-to-br from-c-accent to-c-accent2 rounded-xl p-2 text-center">
                        <div className="text-2xl font-black text-white leading-none">{String(d.getDate()).padStart(2,'0')}</div>
                        <div className="text-[9px] uppercase tracking-wider text-white/80">{MONTHS[d.getMonth()]}</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{s.title}</div>
                        <div className="text-c-muted text-sm mt-0.5">
                          {[s.venue, s.address, s.city, s.time].filter(Boolean).join(' · ')}
                        </div>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-c-accent2/15 text-c-accent3 border border-c-accent2/30">
                          Live Show
                        </span>
                      </div>
                    </div>
                  </FadeSection>
                )
              })}
            </div>
          )
        }
      </div>
    </TabPanel>
  )
}

function VideosTab({ videos }) {
  if (!videos.length) return (
    <TabPanel>
      <div className="text-center py-32 text-c-muted">
        <p className="text-2xl font-black text-c-text mb-2">Próximamente</p>
        <p>Aquí subiremos videos inéditos.</p>
      </div>
    </TabPanel>
  )
  return (
    <TabPanel>
      <div className="py-14 px-8 max-w-5xl mx-auto">
        <SectionHead label="En acción" title="Videos" />
        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((v, i) => (
            <FadeSection key={v.id} delay={i * 100}>
              <div className="bg-c-bg2 border border-c-accent/25 rounded-2xl overflow-hidden hover:border-c-accent2 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(123,47,190,0.15)] transition-all duration-300">
                <video src={v.url} controls className="w-full aspect-video bg-black" preload="metadata" />
                <div className="p-4">
                  <div className="font-bold text-c-text">{v.title}</div>
                  {v.description && <p className="text-c-muted text-sm mt-1">{v.description}</p>}
                  <p className="text-c-muted text-xs mt-1">{fmtDate(v.date)}</p>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </TabPanel>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Landing() {
  const [tab, setTab] = useState('inicio')
  const [data, setData] = useState({
    posts: [], videos: [], shows: [], igPosts: [], tracks: [], members: [], settings: {}
  })

  useEffect(() => {
    if (!supabase) return
    Promise.all([
      supabase.from('posts').select().eq('published', true).order('created_at', { ascending: false }),
      supabase.from('videos').select().eq('published', true).order('created_at', { ascending: false }),
      supabase.from('shows').select().eq('published', true).order('date', { ascending: false }),
      supabase.from('instagram_posts').select().eq('published', true).order('sort_order').order('created_at', { ascending: false }),
      supabase.from('tracks').select().eq('published', true).order('created_at', { ascending: false }),
      supabase.from('members').select().eq('published', true).order('sort_order', { ascending: true }),
      supabase.from('settings').select(),
    ]).then(([p, v, s, ig, tr, mb, cfg]) => {
      const settings = {}
      ;(cfg.data ?? []).forEach(row => { settings[row.key] = row.value })
      setData({
        posts:    p.data  ?? [],
        videos:   v.data  ?? [],
        shows:    s.data  ?? [],
        igPosts:  ig.data ?? [],
        tracks:   tr.data ?? [],
        members:  mb.data ?? [],
        settings,
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="bg-c-bg text-c-text min-h-screen">
      <Nav tab={tab} setTab={setTab}
        hasBlog={data.posts.length > 0}
        hasVideos={data.videos.length > 0} />

      {tab === 'inicio'  && <InicioTab  igPosts={data.igPosts} tracks={data.tracks} members={data.members} settings={data.settings} />}
      {tab === 'booking' && <BookingTab members={data.members} shows={data.shows} tracks={data.tracks} settings={data.settings} />}
      {tab === 'blog'    && <BlogTab    posts={data.posts} />}
      {tab === 'shows'   && <ShowsTab   shows={data.shows} />}
      {tab === 'videos'  && <VideosTab  videos={data.videos} />}
    </div>
  )
}
