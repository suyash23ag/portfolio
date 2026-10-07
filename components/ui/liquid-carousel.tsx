import { useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { projects } from '@/src/data'

export function LiquidCarousel() {
  const [index, setIndex] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const displacement = useRef<SVGFEDisplacementMapElement>(null)
  const busy = useRef(false)
  const filterId = `liquid-${useId().replace(/:/g, '')}`
  const project = projects[index]
  useLayoutEffect(() => {
    busy.current = false
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo('.liquid-cover', { opacity: .3, scale: 1.05 }, { opacity: 1, scale: 1, duration: .85, ease: 'power3.out' })
      if (displacement.current) gsap.fromTo(displacement.current, { attr: { scale: 65 } }, { attr: { scale: 0 }, duration: 1, ease: 'power2.out' })
      gsap.from('.liquid-copy > *', { y: 14, opacity: 0, stagger: .055, duration: .55 })
    }, root)
    return () => context.revert()
  }, [index])
  const move = (direction: number) => {
    if (busy.current) return
    busy.current = true
    setIndex(current => (current + direction + projects.length) % projects.length)
  }
  return <div ref={root} className="liquid-carousel" role="region" aria-roledescription="carousel" aria-label="Selected projects" onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) } }}>
    <svg className="filter-defs" aria-hidden="true"><defs><filter id={filterId} x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".015 .025" numOctaves="2" seed="8" result="noise" /><feDisplacementMap ref={displacement} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
    <article className="liquid-slide" aria-roledescription="slide" aria-label={`${index + 1} of ${projects.length}: ${project.name}`}>
      <a className={`project-cover liquid-cover ${project.kind}`} style={{ filter: `url(#${filterId})` }} href={project.url} target="_blank" rel="noreferrer" aria-label={`${project.label}: ${project.name}`}><span className="project-number">{project.number} / {project.category}</span><div className="cover-title">{project.name}<span>{project.title}</span></div><span className="cover-arrow"><ArrowUpRight size={25} /></span><div className="cover-caption">CONCEPT VISUAL / {project.name.toUpperCase()}</div></a>
      <div className="project-details liquid-copy"><span className="eyebrow">{project.category}</span><h3>{project.name}</h3><p>{project.description}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a className="project-link" href={project.url} target="_blank" rel="noreferrer">{project.label} <ArrowUpRight size={15} /></a></div>
    </article>
    <div className="carousel-controls"><div className="carousel-dots">{projects.map((item, i) => <button aria-label={`Show ${item.name}`} aria-pressed={index === i} className={index === i ? 'active' : ''} key={item.name} onClick={() => setIndex(i)}><span />{item.number}</button>)}</div><div className="carousel-arrows"><span aria-live="polite" aria-atomic="true">{project.number} / 04 · {project.name}</span><button onClick={() => move(-1)} aria-label="Previous project"><ArrowLeft size={18} /></button><button onClick={() => move(1)} aria-label="Next project"><ArrowRight size={18} /></button></div></div>
  </div>
}
