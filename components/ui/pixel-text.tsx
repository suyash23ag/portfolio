import { useLayoutEffect, useRef, type PointerEvent } from 'react'
import gsap from 'gsap'

export function PixelText({ paused = false }: { paused?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useRef(false)
  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reduced.current = media.matches }
    update()
    media.addEventListener('change', update)
    const context = gsap.context(() => {
      if (!reduced.current && !paused) gsap.from('.pixel-letter', { opacity: 0, z: -180, rotationX: 80, y: 30, stagger: .025, duration: 1.1, ease: 'expo.out' })
    }, root)
    return () => { context.revert(); media.removeEventListener('change', update) }
  }, [paused])
  const reset = () => {
    if (root.current) gsap.to(root.current.querySelectorAll('.pixel-letter'), { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, duration: reduced.current || paused ? 0 : .8, overwrite: true, ease: 'elastic.out(1,.5)' })
  }
  const scatter = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced.current || paused || event.pointerType === 'touch' || !root.current) return
    const bounds = root.current.getBoundingClientRect()
    root.current.querySelectorAll<HTMLElement>('.pixel-cell').forEach(cell => {
      const letter = cell.firstElementChild
      if (!letter) return
      const box = cell.getBoundingClientRect()
      const dx = box.left + box.width / 2 - event.clientX
      const dy = box.top + box.height / 2 - event.clientY
      const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 120)
      gsap.to(letter, { x: dx * influence * .7, y: dy * influence * .8, z: influence * 95, rotationY: (event.clientX - bounds.left - bounds.width / 2) * influence * .15, rotationX: -dy * influence * .4, duration: .45, overwrite: true })
    })
  }
  return <div className="pixel-panel" ref={root} onPointerMove={scatter} onPointerLeave={reset} onBlur={reset} aria-label="Stay curious. Keep building."><div className="pixel-words" aria-hidden="true">{['STAY CURIOUS', 'KEEP BUILDING'].map((line, row) => <div className="pixel-row" key={line}>{[...line].map((letter, i) => <span className="pixel-cell" key={i}><span className={`pixel-letter ${row === 1 ? 'warm' : ''}`}>{letter === ' ' ? '\u00a0' : letter}</span></span>)}</div>)}</div></div>
}
