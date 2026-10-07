import { useLayoutEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Volume2, VolumeX } from 'lucide-react'

const TRACK = 'https://soundcloud.com/c418/moog-city'
const PLAYER = `https://w.soundcloud.com/player/?url=${encodeURIComponent(TRACK)}&auto_play=false&show_artwork=false&show_user=true&show_comments=false&show_playcount=false&visual=false&color=%238da6df`
const PREFERENCE = 'suyash-background-music'

interface WidgetEvent { currentPosition?: number }
interface Widget {
  bind: (event: string, callback: (event: WidgetEvent) => void) => void
  unbind: (event: string) => void
  play: () => void
  pause: () => void
  seekTo: (milliseconds: number) => void
  setVolume: (volume: number) => void
}
interface SoundCloud {
  Widget: ((iframe: HTMLIFrameElement) => Widget) & { Events: Record<string, string> }
}
export interface MusicHandle { startUnlessMuted: () => void }

let apiPromise: Promise<SoundCloud> | undefined
function loadPlayerApi() {
  const scWindow = window as Window & { SC?: SoundCloud }
  if (scWindow.SC) return Promise.resolve(scWindow.SC)
  if (apiPromise) return apiPromise
  apiPromise = new Promise<SoundCloud>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.async = true
    const timeout = window.setTimeout(fail, 12000)
    function fail() {
      window.clearTimeout(timeout)
      script.remove()
      apiPromise = undefined
      reject(new Error('Music player could not load'))
    }
    script.onerror = fail
    script.onload = () => {
      window.clearTimeout(timeout)
      if (scWindow.SC) resolve(scWindow.SC)
      else fail()
    }
    document.head.appendChild(script)
  })
  return apiPromise
}
function preference() {
  try { return localStorage.getItem(PREFERENCE) } catch { return null }
}
function remember(value: 'on' | 'off') {
  try { localStorage.setItem(PREFERENCE, value) } catch { /* Playback also works without storage. */ }
}

/** A single official player stays mounted through the intro and chapter transitions. */
export function MusicPlayer({ apiRef }: { apiRef: Ref<MusicHandle> }) {
  const iframe = useRef<HTMLIFrameElement>(null)
  const widget = useRef<Widget | null>(null)
  const ready = useRef(false)
  const wantsMusic = useRef(preference() === 'on')
  const muted = useRef(preference() === 'off')
  const volumeRef = useRef(30)
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [playing, setPlaying] = useState(false)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(30)
  const [seconds, setSeconds] = useState(0)
  const [attempt, setAttempt] = useState(0)

  function start() {
    if (failed) { setExpanded(true); return }
    muted.current = false
    wantsMusic.current = true
    remember('on')
    setPending(true)
    if (ready.current) widget.current?.play()
    clearTimeout(pendingTimer.current)
    // Browsers may require another tap instead of allowing automatic playback.
    pendingTimer.current = setTimeout(() => setPending(false), 4000)
  }
  function stop() {
    muted.current = true
    wantsMusic.current = false
    remember('off')
    clearTimeout(pendingTimer.current)
    setPending(false)
    widget.current?.pause()
  }
  useImperativeHandle(apiRef, () => ({
    startUnlessMuted() { if (!muted.current) start() },
  }))

  useLayoutEffect(() => {
    let disposed = false
    let connected: Widget | undefined
    let events: string[] = []
    ready.current = false
    const timeout = window.setTimeout(() => {
      if (!ready.current) { setFailed(true); setPending(false) }
    }, 18000)
    loadPlayerApi().then(api => {
      if (disposed || !iframe.current) return
      connected = api.Widget(iframe.current)
      widget.current = connected
      const bind = (name: string, callback: (event: WidgetEvent) => void) => {
        const event = api.Widget.Events[name]
        if (!event) return
        events.push(event)
        connected?.bind(event, value => { if (!disposed) callback(value) })
      }
      bind('READY', () => {
        window.clearTimeout(timeout)
        ready.current = true
        setFailed(false)
        connected?.setVolume(volumeRef.current)
        if (wantsMusic.current) connected?.play()
      })
      bind('PLAY', () => {
        clearTimeout(pendingTimer.current)
        wantsMusic.current = true
        muted.current = false
        remember('on')
        setPlaying(true)
        setPending(false)
        setFailed(false)
      })
      bind('PAUSE', () => {
        setPlaying(false)
        setPending(false)
      })
      bind('PLAY_PROGRESS', event => {
        if (typeof event.currentPosition === 'number') setSeconds(Math.floor(event.currentPosition / 1000))
      })
      bind('FINISH', () => {
        if (wantsMusic.current) { connected?.seekTo(0); connected?.play() }
      })
      bind('ERROR', () => {
        window.clearTimeout(timeout)
        setPlaying(false)
        setPending(false)
        setFailed(true)
      })
    }).catch(() => {
      if (!disposed) { setFailed(true); setPending(false) }
    })
    return () => {
      disposed = true
      clearTimeout(pendingTimer.current)
      window.clearTimeout(timeout)
      // An iframe can already be detached when React tears down a failed player.
      events.forEach(event => { try { connected?.unbind(event) } catch { /* Frame is gone. */ } })
      try { connected?.pause() } catch { /* Frame is gone. */ }
      widget.current = null
      ready.current = false
    }
  }, [attempt])

  const status = failed ? 'Player unavailable' : playing ? 'Sound on' : pending ? 'Starting music…' : 'Tap to play audio'
  const label = playing ? 'Turn music off' : pending ? 'Cancel music playback' : 'Play Moog City'
  return <aside className={`music-dock ${playing ? 'is-playing' : ''}`} aria-label="Background music">
    <div id="music-options" className="music-panel" data-open={expanded} aria-hidden={!expanded} inert={!expanded}>
      <div className="music-panel-heading"><span>THE SOUNDTRACK</span><a href={TRACK} target="_blank" rel="noreferrer">C418 · Moog City <ExternalLink size={12}/></a></div>
      <iframe key={attempt} ref={iframe} src={PLAYER} title="Moog City by C418 — official SoundCloud player" allow="autoplay" tabIndex={-1} scrolling="no"/>
      <label className="music-volume">Volume <input type="range" min="0" max="100" value={volume} onChange={event => {
        const next = Number(event.target.value)
        volumeRef.current = next
        setVolume(next)
        widget.current?.setVolume(next)
      }}/><output>{volume}%</output></label>
      {failed && <div className="music-error"><p>Music couldn’t load. You can retry or listen on SoundCloud.</p><button onClick={() => { setFailed(false); setAttempt(value => value + 1) }}>Retry player</button></div>}
      <p className="music-credit">Streaming from C418 on SoundCloud.</p>
    </div>
    <div className="music-pill">
      <button className="music-main" aria-label={label} aria-pressed={playing} onClick={() => playing || pending ? stop() : start()}>
        <span className="music-glyph" aria-hidden="true">{playing ? <Volume2 size={17}/> : <VolumeX size={17}/>}</span>
        <span className="music-copy"><strong>Moog City <span>/ C418</span></strong><span className="music-status" aria-live="polite">{status}</span></span>
        <span className="music-bars" aria-hidden="true"><i/><i/><i/><i/></span>
      </button>
      <span className="music-time" aria-label="Playback position">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
      <button className="music-options-toggle" aria-label={expanded ? 'Close music options' : 'Open music options'} aria-expanded={expanded} aria-controls="music-options" onClick={() => setExpanded(value => !value)}>{expanded ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}</button>
    </div>
  </aside>
}
