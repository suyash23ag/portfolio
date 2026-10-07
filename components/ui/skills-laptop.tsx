import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Database, ArrowLeft, ArrowRight, RotateCcw, MoveHorizontal, Circle } from 'lucide-react'
import { siReact, siJavascript, siNextdotjs, siNodedotjs, siMongodb, siHtml5, siCss, siTailwindcss, siExpress, siCplusplus, siConvex } from '@/src/technology-icons'
const ThreeLaptop = lazy(() => import('./three-laptop').then(module => ({default:module.ThreeLaptop})))
const tech = [
  {name:'React', icon:siReact.path, color:'#61dafb', type:'FRONTEND', line:'Building interfaces from small, reusable pieces.', use:'Used in UrbanTrack and Pixer.', command:'render(idea)'},
  {name:'JavaScript', icon:siJavascript.path, color:'#f7df1e', type:'LANGUAGE', line:'The language connecting interactions, data, and application logic.', use:'Part of my frontend and Node.js toolkit.', command:'const idea = build()'},
  {name:'Next.js', icon:siNextdotjs.path, color:'#e8eaf0', type:'FRAMEWORK', line:'Building React applications with a structured approach to routes and pages.', use:'Used to build Pixer.', command:'npm run dev'},
  {name:'Node.js', icon:siNodedotjs.path, color:'#82c968', type:'BACKEND', line:'Taking JavaScript behind the interface to power web applications.', use:'Part of the UrbanTrack backend.', command:'node server.js'},
  {name:'Express', icon:siExpress.path, color:'#c6b5f2', type:'BACKEND', line:'Connecting routes, middleware, authentication, and API workflows.', use:'Used with Node.js in UrbanTrack.', command:'app.get("/ideas")'},
  {name:'MongoDB', icon:siMongodb.path, color:'#61c88e', type:'DATABASE', line:'Organizing application data as flexible documents.', use:'Used for UrbanTrack’s data layer.', command:'db.ideas.find()'},
  {name:'SQL', icon:null, color:'#70b6ec', type:'DATABASE', line:'Working with relational data, queries, and database fundamentals.', use:'Part of my database and core CS foundation.', command:'SELECT * FROM ideas;'},
  {name:'Convex', icon:siConvex.path, color:'#ef847a', type:'BACKEND & DATA', line:'Exploring application development with a connected backend and database.', use:'Part of my full-stack toolkit.', command:'query → interface'},
  {name:'HTML5', icon:siHtml5.path, color:'#f08359', type:'WEB FOUNDATION', line:'Giving content a meaningful, accessible structure.', use:'The starting point for web interfaces.', command:'<main>build</main>'},
  {name:'CSS', icon:siCss.path, color:'#b995ed', type:'WEB FOUNDATION', line:'Turning layout, typography, and motion into a clear visual experience.', use:'Responsive layouts and interface styling.', command:'ideas { display: grid; }'},
  {name:'Tailwind', icon:siTailwindcss.path, color:'#52d2ed', type:'STYLING', line:'Composing responsive interfaces with utility classes.', use:'Used across UrbanTrack and Pixer.', command:'flex · grid · responsive'},
  {name:'C++', icon:siCplusplus.path, color:'#75a9e0', type:'LANGUAGE', line:'Practicing algorithms, data structures, and problem-solving fundamentals.', use:'Part of my programming foundation.', command:'while (curious) learn();'},
]
function TechIcon({path, size = 24}: {path:string | null; size?:number}) {
  return path ? <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={path}/></svg> : <Database aria-hidden="true" size={size}/>
}
export function SkillsLaptop() {
  const [selected, setSelected] = useState(0)
  const sceneContainer=useRef<HTMLDivElement>(null)
  const [sceneReady,setSceneReady]=useState(false)
  useEffect(()=>{const element=sceneContainer.current;if(!element)return;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setSceneReady(true);observer.disconnect()}},{rootMargin:'350px'});observer.observe(element);return()=>observer.disconnect()},[])
  const [yaw, setYaw] = useState(-7)

  const current = tech[selected]
  const rotate = (value: number) => setYaw(Math.max(-25, Math.min(25, value)))
  const drag = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const rect = event.currentTarget.getBoundingClientRect()
    rotate(((event.clientX - rect.left) / rect.width - .5) * 50)
  }
  const resetView = () => { setYaw(-7) }
  return <div className="skills-experience">
    <div className="three-workspace" ref={sceneContainer}><div className="workspace-label"><span>THE INTERACTIVE WORKSPACE</span><span>CLICK A SYMBOL TO EXPLORE ↗</span></div>{sceneReady ? <Suspense fallback={<div className="three-laptop-host three-fallback">Opening your workspace…</div>}><ThreeLaptop technologies={tech} selected={selected} yaw={yaw} onSelect={setSelected}/></Suspense> : <div className="three-laptop-host three-fallback">Your workspace is just ahead.</div>}</div>
    <div className="laptop-interaction"><button aria-label="Rotate laptop left" onClick={() => rotate(yaw - 8)}><ArrowLeft size={15}/></button><button className="laptop-drag" aria-label="Drag to rotate laptop, or use left and right arrow keys" onPointerDown={event => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={drag} onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)} onKeyDown={event => {if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault(); rotate(yaw + (event.key === 'ArrowLeft' ? -8 : 8))}}}><MoveHorizontal size={16}/> DRAG TO ROTATE</button><button aria-label="Rotate laptop right" onClick={() => rotate(yaw + 8)}><ArrowRight size={15}/></button><button aria-label="Reset laptop view" onClick={resetView}><RotateCcw size={14}/></button></div>
    <div className="tech-grid tech-grid-controls" role="group" aria-label="Explore technologies">{tech.map((item,index)=><button key={item.name} aria-pressed={selected===index} aria-label={`Explore ${item.name}`} onClick={()=>setSelected(index)} className={`tech-icon ${selected===index?'selected':''}`} style={{'--tech-color':item.color} as CSSProperties}><TechIcon path={item.icon}/><span>{item.name}</span></button>)}</div>
    <div className="tech-inspector" aria-live="polite" aria-atomic="true" style={{'--tech-color':current.color} as CSSProperties}><div className="inspector-symbol"><TechIcon path={current.icon} size={36}/></div><div><span className="inspector-category"><Circle size={6} fill="currentColor"/> {current.type}</span><h3>{current.name}</h3><p>{current.line}</p><span className="inspector-use">{current.use}</span></div><span className="inspector-number">{String(selected+1).padStart(2,'0')} / 12</span></div>
  </div>
}
