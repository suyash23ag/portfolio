import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react'
import gsap from 'gsap'
import { ArrowUpRight, Building2, Image, Leaf, ScanFace } from 'lucide-react'
import { projects } from '@/src/data'

const visualDetails = [
  { icon: Building2, color: '#a0e1c4', word: 'COMMUNITY', note: 'A voice for every neighbourhood.' },
  { icon: Image, color: '#ebc5ee', word: 'IMAGINATION', note: 'A new way to see the everyday.' },
  { icon: Leaf, color: '#d5e9a6', word: 'BREATHE', note: 'A little less noise. A little more focus.' },
  { icon: ScanFace, color: '#c4d3ff', word: 'AUTHENTICITY', note: 'Look closer. Question the pixels.' },
]

function ProjectCard({index}:{index:number}) {
  const project = projects[index]
  const visual = visualDetails[index]
  const Icon = visual.icon
  const art = useRef<HTMLDivElement>(null)
  const reduced = useRef(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reduced.current = media.matches }
    update(); media.addEventListener('change', update)
    const element = art.current
    return () => { media.removeEventListener('change', update); if(element)gsap.killTweensOf(element) }
  }, [])
  const move = (event:PointerEvent<HTMLElement>) => {
    if(reduced.current || event.pointerType === 'touch' || !art.current)return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX-rect.left)/rect.width, y = (event.clientY-rect.top)/rect.height
    event.currentTarget.style.setProperty('--spot-x',`${x*100}%`)
    event.currentTarget.style.setProperty('--spot-y',`${y*100}%`)
    gsap.to(art.current,{rotationY:(x-.5)*12,rotationX:-(y-.5)*9,x:(x-.5)*9,y:(y-.5)*6,duration:.5,overwrite:true,ease:'power3.out'})
  }
  const reset = () => { if(art.current)gsap.to(art.current,{rotationX:0,rotationY:0,x:0,y:0,duration:reduced.current?0:.7,overwrite:true,ease:'power3.out'}) }
  return <article className="animated-project-wrap">
    <a className={`animated-project-card card-${project.kind}`} href={project.url} target="_blank" rel="noreferrer" aria-label={`${project.name}: ${project.label}`} onPointerMove={move} onPointerLeave={reset} onBlur={reset} style={{'--card-tint':visual.color} as CSSProperties}>
      <div className={`card-art ${project.kind}`}>
        <div className="card-art-meta"><span>{project.number} / SELECTED PROJECT</span><span className="card-open"><ArrowUpRight size={20}/></span></div>
        <div className="card-art-object" ref={art} aria-hidden="true"><div className="card-orbit orbit-one"/><div className="card-orbit orbit-two"/><div className="card-symbol"><Icon size={52} strokeWidth={1.1}/></div><span className="card-art-word">{visual.word}</span></div>
        <div className="card-art-footer"><span>{visual.note}</span><span>↗</span></div>
      </div>
      <div className="card-content"><span className="card-category">{project.category}</span><div className="card-title-row"><h3>{project.name}</h3><ArrowUpRight size={21}/></div><p>{project.description}</p><div className="card-tags">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div><span className="card-cta">{project.label}<span aria-hidden="true">↗</span></span></div>
    </a>
  </article>
}

export function AnimatedProjects() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = root.current
    if(!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
    const cards = element.querySelectorAll<HTMLElement>('.animated-project-wrap')
    const observer = new IntersectionObserver(entries => {
      for(const entry of entries)if(entry.isIntersecting){
        gsap.fromTo(entry.target,{y:35,opacity:.25},{y:0,opacity:1,duration:.7,ease:'power3.out'})
        observer.unobserve(entry.target)
      }
    },{threshold:.12})
    cards.forEach(card=>observer.observe(card))
    return () => {observer.disconnect();gsap.killTweensOf(cards);gsap.set(cards,{clearProps:'all'})}
  }, [])
  return <div className="animated-project-grid" ref={root} aria-label="Selected projects">{projects.map((project,index)=><ProjectCard key={project.name} index={index}/>)}</div>
}
