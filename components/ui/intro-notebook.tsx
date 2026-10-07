import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, RotateCcw } from 'lucide-react'
import gsap from 'gsap'
import { usePointerTilt } from '@/hooks/use-pointer-tilt'
const pages = [
  { number: '01', title: 'Hey, I’m Suyash.', note: 'Developer. Student. Perpetually curious.', body: 'I’m a final-year B.Tech Computer Science student at JECRC University, Jaipur. I turn everyday problems into thoughtful web and mobile experiences.', quote: 'Every good idea begins with a little curiosity.', margin: 'start with curiosity.' },
  { number: '02', title: 'How I like to build.', note: 'A useful idea is always a good beginning.', body: 'I enjoy connecting the interface to the systems behind it. My projects span civic technology, creative tools, and mindfulness. I learn by building, testing, and working with other developers.', quote: 'Build something useful. Learn something new.', margin: 'make it work. make it matter.' },
  { number: '03', title: 'Away from the editor.', note: 'There’s always something else to learn.', body: 'I enjoy running, creating fitness content, volunteering, and taking part in hackathons. I want to explore the world, meet new people, and build meaningful connections—learning from different places, stories, and perspectives along the way.', quote: 'Step away from the screen. Come back with a new perspective.', margin: 'stay a little curious.' },
]
function PageContent({index}:{index:number}) {const page=pages[index];return <><span className="notebook-page">INTRODUCTION / {page.number}</span><h3>{page.title}</h3><p className="handwritten">{page.note}</p><p className="notebook-body">{page.body}</p><blockquote className="notebook-quote">“{page.quote}”</blockquote><span className="margin-note">{page.margin}</span></>}
export function IntroNotebook() {
  const [page,setPage]=useState(0)
  const [open,setOpen]=useState(true)
  const [flip,setFlip]=useState<{from:number;to:number;direction:number}|null>(null)
  const busy=useRef(false)
  const wheelAmount=useRef(0)
  const touch=useRef<{x:number;y:number}|null>(null)
  const spread=useRef<HTMLDivElement>(null)
  const leaf=useRef<HTMLDivElement>(null)
  const {model,move,reset}=usePointerTilt(5)
  const turn=useCallback((direction:number)=>{
    const next=page+direction
    if(busy.current||!open||next<0||next>=pages.length)return
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setPage(next);return}
    busy.current=true;reset();setFlip({from:page,to:next,direction})
  },[page,open,reset])
  useLayoutEffect(()=>{
    if(!flip||!leaf.current)return
    const context=gsap.context(()=>{
      gsap.fromTo(leaf.current,{rotationY:flip.direction>0?0:-180},{rotationY:flip.direction>0?-180:0,duration:.85,ease:'power2.inOut',onComplete:()=>{setPage(flip.to);setFlip(null);busy.current=false}})
    })
    return()=>context.revert()
  },[flip])
  useEffect(()=>{
    const element=spread.current
    if(!element)return
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey)return
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?400:1)
      const direction=delta>0?1:-1
      if(!busy.current&&((page===0&&direction<0)||(page===pages.length-1&&direction>0)))return
      event.preventDefault()
      if(busy.current)return
      wheelAmount.current+=delta
      if(Math.abs(wheelAmount.current)>55){turn(wheelAmount.current>0?1:-1);wheelAmount.current=0}
    }
    element.addEventListener('wheel',wheel,{passive:false})
    return()=>element.removeEventListener('wheel',wheel)
  },[page,open,turn])
  const visiblePage=flip&&flip.direction>0?flip.to:page
  return <div className="notebook-area">

    <div className="notebook-stage" onPointerMove={event=>{if(!busy.current)move(event)}} onPointerLeave={reset}>
      <div ref={model} className={`notebook-model ${open?'book-open':'book-closed'}`}>
        {open?<div className="notebook-spread" ref={spread} tabIndex={0} role="group" aria-label="Introduction notebook. Scroll over the pages, swipe horizontally, or use arrow keys to turn pages." onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();turn(event.key==='ArrowLeft'?-1:1)}}} onTouchStart={event=>{touch.current={x:event.touches[0].clientX,y:event.touches[0].clientY}}} onTouchEnd={event=>{if(!touch.current)return;const dx=event.changedTouches[0].clientX-touch.current.x;const dy=event.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))turn(dx<0?1:-1);touch.current=null}}>
          <div className="notebook-left"><span className="notebook-edition">PERSONAL NOTES · VOL. 01</span><span className="book-doodle" aria-hidden="true">{'{ sa }'}</span><h3>A work <br/>in <em>progress.</em></h3><p>Ideas, observations,<br/>and a few things about me.</p><span className="notebook-signature">Suyash Agarwal</span><span className="book-sticker">KEEP<br/>BUILDING ↗</span></div>
          <div className="notebook-right" aria-live="polite" aria-atomic="true"><PageContent index={visiblePage}/>{page<pages.length-1&&<button className="page-corner" aria-label="Turn notebook page" onClick={()=>turn(1)} disabled={!!flip}><ArrowRight size={16}/></button>}</div>
          {flip&&<div className="turning-leaf" ref={leaf} aria-hidden="true"><div className="leaf-front notebook-right"><PageContent index={flip.direction>0?flip.from:flip.to}/></div><div className="leaf-back"><span>NOTES FROM A CURIOUS MIND</span><strong>{'{ sa }'}</strong><em>Keep turning the page.</em><span>SUYASH AGARWAL / {pages[flip.from].number}</span></div></div>}
        </div>:<button className="notebook-cover" onClick={()=>setOpen(true)}><span>THE PERSONAL NOTEBOOK OF</span><strong>Suyash<br/><em>Agarwal.</em></strong><span>OPEN TO GET TO KNOW ME ↗</span></button>}
        <span className="book-ribbon" aria-hidden="true"/>
      </div>
    </div>
    <div className="notebook-controls"><button disabled={!!flip} onClick={()=>setOpen(!open)}><BookOpen size={15}/>{open?'Close notebook':'Open notebook'}</button><span>{open?`${pages[page].number} / 03`:'A few pages about me'}</span>{open&&<div><button aria-label="Previous notebook page" disabled={page===0||!!flip} onClick={()=>turn(-1)}><ArrowLeft size={16}/></button><button aria-label="Next notebook page" disabled={page===pages.length-1||!!flip} onClick={()=>turn(1)}><ArrowRight size={16}/></button></div>}<button aria-label="Reset notebook tilt" onClick={reset}><RotateCcw size={14}/></button></div>

  </div>
}
