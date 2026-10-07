import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { CloudName } from './cloud-name'

const glyphs: Record<string, string[]> = {
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  U: ['10001','10001','10001','10001','10001','10001','01110'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  G: ['01111','10000','10000','10111','10001','10001','01110'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  W: ['10001','10001','10001','10101','10101','10101','01010'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
}
function ascii(word: string) {
  return Array.from({length: 7}, (_, row) => [...word].map(letter => glyphs[letter][row].replaceAll('1', '#').replaceAll('0', ' ')).join('  ')).join('\n')
}
export function WelcomeIntro({ open, onEnter, onStartMusic, children }: { open: boolean; onEnter: () => void; onStartMusic: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const enter = useRef<HTMLButtonElement>(null)
  const leaving = useRef(false)
  const complete = () => {
    onEnter()
  }
  const close = (withMusic = true) => {
    if (leaving.current) return
    leaving.current = true
    if (withMusic) onStartMusic()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return complete()
    gsap.to(root.current, { opacity: 0, yPercent: -3, duration: .55, ease: 'power2.inOut', onComplete: complete })
  }
  useEffect(() => {
    if (!open) return
    leaving.current = false
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    enter.current?.focus({preventScroll: true})
    return () => { document.body.style.overflow = previous }
  }, [open])
  useLayoutEffect(() => {
    if (!open) return
    const element = root.current
    if (!element) return
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('.welcome-ascii', { opacity: 0, y: 18, stagger: .2, duration: 1.3, ease: 'power3.out' })
      gsap.from('.welcome-bottom', { opacity: 0, y: 12, delay: .6, duration: .9 })
    }, element)
    return () => { context.revert(); gsap.killTweensOf(element) }
  }, [open])
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return
    if (event.key === 'Escape') { event.preventDefault(); close(false) }
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])') ?? [])
        .filter(element => element.getClientRects().length > 0 && !element.closest('[inert]') && getComputedStyle(element).visibility !== 'hidden')
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
  }
  return <div ref={dialog} role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined} aria-labelledby={open ? 'welcome-title' : undefined} aria-describedby={open ? 'welcome-description' : undefined} onKeyDown={keyboard}>
    {open && <div className="welcome" ref={root}>
    <img className="welcome-image" src="/ascii-clouds.png" alt="" fetchPriority="high" />
    <div className="welcome-shade" />
    <div className="welcome-top"><span className="welcome-brand" aria-label="Suyash Agarwal">sa<span>.</span></span><span>JAIPUR, INDIA ↗</span></div>
    <div className="welcome-composition"><div className="welcome-center"><p className="welcome-kicker">A SMALL CORNER OF THE INTERNET.</p><h1 id="welcome-title" className="sr-only">Suyash Agarwal Portfolio</h1><CloudName lines={[ascii('SUYASH'),ascii('AGARWAL')]} /></div>
    <div className="welcome-bottom"><p id="welcome-description">A curious mind. A builder at heart.<span className="sr-only"> Code, a little chaos, and things made with care.</span></p><CloudName sentence lines={['Code, a little chaos,', 'and things made with care.']} /><button ref={enter} onClick={() => close()} className="enter-portfolio">Enter portfolio <ArrowUpRight size={20} /></button></div>
    </div>
  </div>}
  {children}
  </div>
}
