import { useEffect, useRef, useState } from 'react'
interface Particle {hx:number;hy:number;x:number;y:number;vx:number;vy:number;line:number;seed:number}
/** Lightweight ASCII particles. Physics runs only while interacting or settling. */
export function CloudName({lines, sentence = false}:{lines:string[]; sentence?:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null)
  const [ready,setReady]=useState(false)
  const text=lines.join('\n\n')
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d')
    if(!el||!ctx)return
    const width=720,height=sentence?110:280,particles:Particle[]=[]
    if (sentence) {
      const mask = document.createElement('canvas')
      mask.width = width; mask.height = height
      const ink = mask.getContext('2d')
      if (!ink) return
      ink.font = '700 33px "Courier New", monospace'
      ink.textAlign = 'center'; ink.textBaseline = 'middle'
      text.split('\n\n').forEach((line,index)=>ink.fillText(line,width/2,34+index*42))
      const pixels = ink.getImageData(0,0,width,height).data
      for(let y=0;y<height;y+=2) for(let x=0;x<width;x+=2) {
        if(pixels[(y*width+x)*4+3]>55) particles.push({hx:x,hy:y,x,y,vx:0,vy:0,line:y>55?1:0,seed:particles.length*.71})
      }
    } else text.split('\n\n').forEach((word,line)=>word.split('\n').forEach((row,y)=>[...row].forEach((bit,x)=>{
      if(bit==='#'){const hx=(width-row.length*14)/2+x*14+7,hy=25+line*139+y*16;particles.push({hx,hy,x:hx,y:hy,vx:0,vy:0,line,seed:particles.length*.71})}
    })))
    const pointer={x:-1000,y:-1000,active:false},media=window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame=0,last=0,visible=true
    const draw=()=>{
      ctx.clearRect(0,0,width,height);ctx.font='bold 13px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle'
      for(const p of particles){const distance=Math.hypot(p.x-p.hx,p.y-p.hy);ctx.fillStyle=p.line?'#c7f0b3':'#b8c8ff';ctx.globalAlpha=Math.max(.45,1-distance/380);ctx.shadowColor=p.line?'#a3dca2':'#a5baff';ctx.shadowBlur=sentence?0:distance>3?9:3;if(sentence){ctx.fillRect(p.x,p.y,2,2)}else{ctx.fillText(distance>25?(Math.sin(p.seed)>0?'+':'·'):'#',p.x,p.y);if(distance>16){ctx.globalAlpha=.13;ctx.fillText('·',p.x-p.vx*3,p.y-p.vy*3)}}}
      ctx.globalAlpha=1;ctx.shadowBlur=0
    }
    const tick=(time:number)=>{
      if(!visible)return
      if(time-last<30){frame=requestAnimationFrame(tick);return}last=time
      let energy=0
      for(const p of particles){if(!media.matches){const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);if(pointer.active&&d<122){const force=(1-d/122)*2.7,angle=Math.atan2(dy,dx)+.6;p.vx+=Math.cos(angle)*force+Math.sin(p.seed+time*.002)*force*.55;p.vy+=Math.sin(angle)*force-Math.abs(Math.cos(p.seed))*force*.35}p.vx+=(p.hx-p.x)*.045;p.vy+=(p.hy-p.y)*.045;p.vx*=.82;p.vy*=.82;p.x+=p.vx;p.y+=p.vy;p.x=Math.max(6,Math.min(width-6,p.x));p.y=Math.max(6,Math.min(height-6,p.y));energy+=Math.abs(p.vx)+Math.abs(p.vy)}}
      draw();if(pointer.active||energy>.02)frame=requestAnimationFrame(tick);else{frame=0;particles.forEach(p=>{p.x=p.hx;p.y=p.hy;p.vx=p.vy=0});draw()}
    }
    const wake=()=>{if(!frame&&visible)frame=requestAnimationFrame(tick)}
    const resize=()=>{const rect=el.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);el.width=Math.round(rect.width*ratio);el.height=Math.round(rect.height*ratio);ctx.setTransform(el.width/width,0,0,el.height/height,0,0);draw()}
    const move=(event:PointerEvent)=>{if(media.matches)return;const rect=el.getBoundingClientRect();pointer.x=(event.clientX-rect.left)*width/rect.width;pointer.y=(event.clientY-rect.top)*height/rect.height;pointer.active=true;wake()}
    const leave=()=>{pointer.active=false;wake()}
    const up=(event:PointerEvent)=>{if(event.pointerType==='touch')leave()}
    const reset=()=>{pointer.active=false;particles.forEach(p=>{p.x=p.hx;p.y=p.hy;p.vx=p.vy=0});draw()}
    const visibility=()=>{visible=!document.hidden;cancelAnimationFrame(frame);frame=0;if(visible)wake()}
    const observer=new ResizeObserver(resize);observer.observe(el);resize();setReady(true)
    el.addEventListener('pointermove',move);el.addEventListener('pointerdown',move);el.addEventListener('pointerleave',leave);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',leave);media.addEventListener('change',reset);document.addEventListener('visibilitychange',visibility)
    return()=>{visible=false;cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener('pointermove',move);el.removeEventListener('pointerdown',move);el.removeEventListener('pointerleave',leave);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',leave);media.removeEventListener('change',reset);document.removeEventListener('visibilitychange',visibility)}
  },[text, sentence])
  return <div className={`cloud-name ${sentence?'cloud-name-sentence':'welcome-ascii'} ${ready?'is-ready':''}`} aria-hidden="true"><canvas ref={canvas} className="cloud-name-canvas"/><pre className="cloud-name-fallback">{sentence?lines.join('\n'):text}</pre></div>
}
