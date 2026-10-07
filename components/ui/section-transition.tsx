import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function SectionTransition({label, onCovered, onDone}: {label:string; onCovered:()=>void; onDone:()=>void}) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = root.current
    const progress = element?.querySelector('.section-progress')
    if (!element || !progress) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root.current?.focus({preventScroll:true})
    const timeline = gsap.timeline({onComplete:onDone})
    timeline.to(progress, {scaleX:1,duration:reduced?.12:.6,ease:'power2.inOut'})
      .call(onCovered)
      .to(root.current, {opacity:0,duration:reduced?.08:.25})
    return () => {timeline.kill(); document.body.style.overflow=previousOverflow}
  }, [onCovered,onDone])
  return <div className="section-transition" ref={root} tabIndex={-1} role="status" aria-live="polite"><img src="/ascii-clouds.png" alt=""/><div className="transition-tint"/><div className="transition-content"><span>SUYASH AGARWAL / PORTFOLIO</span><p>OPENING CHAPTER</p><strong>{label}<span>_</span></strong><div className="section-progress-track"><div className="section-progress"/></div><span>LOADING YOUR NEXT PERSPECTIVE</span></div></div>
}
