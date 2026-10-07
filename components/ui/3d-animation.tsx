import { useEffect, useRef, useState } from 'react'

export interface PoemAnimationProps { paused?: boolean }
type Ripple = { x: number; y: number; age: number }
const symbolNames = ['CODE / CREATE', 'REACT / BUILD', 'JAVASCRIPT / EXPLORE', 'SQL / CONNECT', 'CAT / WORKS ON MY MACHINE']

/** A transparent liquid orb that bends, fades and ripples under the pointer. */
export function PoemAnimation({ paused = false }: PoemAnimationProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const surface = useRef<HTMLButtonElement>(null)
  const symbolIndex = useRef(0)
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    const el = canvas.current, target = surface.current
    const ctx = el?.getContext('2d')
    if (!el || !target || !ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = { x: 300, y: 240, active: false }
    const ripples: Ripple[] = []
    let width = 600, height = 470, frame = 0, last = 0, time = 0, impulse = 0
    let offsetX = 0, offsetY = 0, visible = true
    const motion = () => !paused && !reduced.matches
    const orb = (x: number, y: number, radius: number, phase: number, alpha = 1) => {
      ctx.save(); ctx.translate(x,y); ctx.globalAlpha = alpha
      const shape = () => {
        ctx.beginPath()
        for(let i=0;i<=160;i++) {
          const angle = i / 160 * Math.PI * 2
          const r = radius * (1 + Math.sin(angle*3+time*.7+phase)*.025 + Math.cos(angle*5-time*.9)*impulse*.026)
          const px = Math.cos(angle)*r, py = Math.sin(angle)*r
          if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py)
        }
        ctx.closePath()
      }
      shape()
      const glass = ctx.createRadialGradient(-radius*.35,-radius*.42,0,0,0,radius*1.1)
      glass.addColorStop(0,'rgba(212,241,255,.025)'); glass.addColorStop(.65,'rgba(90,174,213,.015)')
      glass.addColorStop(.87,'rgba(122,192,217,.10)'); glass.addColorStop(1,'rgba(198,234,242,.25)')
      ctx.fillStyle = glass; ctx.fill()
      const rim = ctx.createLinearGradient(-radius,-radius,radius,radius)
      rim.addColorStop(0,'rgba(233,251,255,.9)'); rim.addColorStop(.24,'rgba(151,200,255,.18)')
      rim.addColorStop(.5,'rgba(180,209,233,.06)'); rim.addColorStop(.8,'rgba(128,248,216,.55)'); rim.addColorStop(1,'rgba(196,188,255,.8)')
      ctx.strokeStyle = rim; ctx.lineWidth = 1.3; ctx.stroke()
      ctx.save(); ctx.clip()
      // Fine refracted water lines, visible through the transparent shell.
      for(let row=0;row<6;row++) {
        ctx.beginPath()
        for(let step=0;step<=50;step++) {
          const px = -radius + step*radius/25
          const py = radius*.4 + row*radius*.09 + Math.sin(step*.12+time*.8+row*.7)*radius*.12
          if(step===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)
        }
        ctx.strokeStyle = `rgba(155,224,224,${.025+row*.013})`;ctx.lineWidth = 1;ctx.stroke()
      }
      const shine = ctx.createRadialGradient(-radius*.4,-radius*.55,0,-radius*.4,-radius*.55,radius*.55)
      shine.addColorStop(0,'rgba(230,251,255,.21)');shine.addColorStop(1,'rgba(197,236,255,0)')
      ctx.fillStyle=shine;ctx.fillRect(-radius,-radius,radius*2,radius*2)
      ctx.restore()
      ctx.beginPath();ctx.ellipse(-radius*.08,-radius*.05,radius*.9,radius*.91,-.25,3.5,4.6)
      ctx.strokeStyle='rgba(231,250,255,.8)';ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke()
      ctx.beginPath();ctx.ellipse(radius*.06,radius*.08,radius*.84,radius*.83,-.25,.3,1.35)
      ctx.strokeStyle='rgba(157,246,221,.45)';ctx.lineWidth=1;ctx.stroke()
      ctx.restore()
    }
    const symbol = (x:number, y:number, size:number, index:number, alpha=1) => {
      ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;ctx.textAlign='center';ctx.textBaseline='middle'
      const colors=['#ccefe6','#8bdcf5','#f3dc85','#c4b7fb','#c4e8ef']
      ctx.fillStyle=colors[index];ctx.strokeStyle=colors[index];ctx.shadowColor=colors[index];ctx.shadowBlur=size*.09
      if(index===1) {
        ctx.lineWidth=Math.max(1,size*.023)
        for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,size*.47,size*.17,i*Math.PI/3,0,Math.PI*2);ctx.stroke()}
        ctx.beginPath();ctx.arc(0,0,size*.055,0,Math.PI*2);ctx.fill()
      } else if(index===4) {
        const cat=['1100000000011','1210000000121','1221111111221','1222222222221','1222332332221','1222032032221','1222224222221','1222222222221','0122244422210','0012222222100','0001111111000']
        const cell=size/14
        ctx.shadowBlur=0
        cat.forEach((row,iy)=>[...row].forEach((pixel,ix)=>{
          if(pixel==='0')return
          ctx.fillStyle=pixel==='1'?'#94becb':pixel==='2'?'#d8eee7':pixel==='3'?'#162534':'#ebaaa5'
          ctx.fillRect((ix-6.5)*cell,(iy-5.5)*cell,cell+.2,cell+.2)
        }))
      } else {
        ctx.font=`600 ${size*(index===3?.5:.62)}px "Courier New",monospace`
        ctx.fillText(index===0?'</>':index===2?'JS':'SQL',0,0)
      }
      ctx.restore()
    }
    const draw = () => {
      ctx.clearRect(0,0,width,height)
      const radius = Math.min(width*.28,height*.29), cx=width*.52+offsetX, cy=height*.47+offsetY
      const glow=ctx.createRadialGradient(cx,cy,radius*.2,cx,cy,radius*1.6)
      glow.addColorStop(0,'rgba(120,194,234,.045)');glow.addColorStop(1,'rgba(120,194,234,0)')
      ctx.fillStyle=glow;ctx.fillRect(0,0,width,height)
      for(let i=0;i<3;i++) {
        ctx.beginPath();ctx.ellipse(width*.5,height*.86,radius*(.7+i*.22),10+i*7,0,0,Math.PI*2)
        ctx.strokeStyle=`rgba(165,213,235,${.08-i*.018})`;ctx.lineWidth=1;ctx.stroke()
      }
      orb(cx-radius*.95,cy+radius*.57,radius*.29,2,.7)
      orb(cx+radius*.96,cy-radius*.77+Math.sin(time)*6,radius*.18,4,.8)
      const floatY=cy+Math.sin(time*.6)*7
      orb(cx,floatY,radius,0,1-impulse*.3)
      symbol(cx-radius*.95,cy+radius*.57,radius*.34,1,.65)
      symbol(cx+radius*.96,cy-radius*.77+Math.sin(time)*6,radius*.22,2,.7)
      symbol(cx+offsetX*.25,floatY+offsetY*.25,radius*.96,symbolIndex.current,.85-impulse*.18)
      ctx.save();ctx.textAlign='center';ctx.font=`${Math.max(7,radius*.065)}px monospace`;ctx.fillStyle='#a3bccb'
      ctx.fillText(symbolIndex.current===4?'works on my machine':symbolIndex.current===0?'ideas → interfaces':symbolNames[symbolIndex.current].split(' / ')[0].toLowerCase(),cx,floatY+radius*.65);ctx.restore()
      for(const ripple of ripples) {
        ctx.beginPath();ctx.ellipse(ripple.x,ripple.y,8+ripple.age*110,5+ripple.age*65,0,0,Math.PI*2)
        ctx.strokeStyle=`rgba(197,240,255,${Math.max(0,1-ripple.age/1.8)*.4})`;ctx.lineWidth=1;ctx.stroke()
      }
    }
    const tick = (now:number) => {
      frame=0
      if(!visible || document.hidden || !motion()) return
      const delta=Math.min((now-last)/1000,.04);last=now;time+=delta
      offsetX+=((pointer.active?(pointer.x-width*.5)*.065:0)-offsetX)*.07
      offsetY+=((pointer.active?(pointer.y-height*.5)*.045:0)-offsetY)*.07
      impulse*=.965
      for(let i=ripples.length-1;i>=0;i--){ripples[i].age+=delta;if(ripples[i].age>1.8)ripples.splice(i,1)}
      draw();frame=requestAnimationFrame(tick)
    }
    const sync = () => {cancelAnimationFrame(frame);frame=0;draw();if(visible&&!document.hidden&&motion()){last=performance.now();frame=requestAnimationFrame(tick)}}
    const resize = () => {
      const rect=target.getBoundingClientRect(), ratio=Math.min(devicePixelRatio||1,1.75)
      width=rect.width;height=rect.height;el.width=Math.round(width*ratio);el.height=Math.round(height*ratio)
      ctx.setTransform(ratio,0,0,ratio,0,0);draw()
    }
    const move = (event:PointerEvent) => {
      const rect=target.getBoundingClientRect();pointer.x=event.clientX-rect.left;pointer.y=event.clientY-rect.top;pointer.active=true
      if(motion())impulse=Math.max(impulse,.2)
    }
    const leave = () => {pointer.active=false}
    const touchEnd = (event:PointerEvent) => {if(event.pointerType!=='mouse')leave()}
    const splash = (event:MouseEvent) => {
      symbolIndex.current=(symbolIndex.current+1)%symbolNames.length
      setSelected(symbolIndex.current)
      if(!motion()){draw();return}
      const rect=target.getBoundingClientRect()
      const x=event.detail===0?width*.5:event.clientX-rect.left,y=event.detail===0?height*.47:event.clientY-rect.top
      impulse=1;ripples.push({x,y,age:0});if(ripples.length>8)ripples.shift()
    }
    const observer=new ResizeObserver(resize);observer.observe(target)
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});intersection.observe(target)
    target.addEventListener('pointermove',move);target.addEventListener('pointerleave',leave);target.addEventListener('pointerup',touchEnd);target.addEventListener('pointercancel',leave);target.addEventListener('click',splash)
    reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);resize();sync()
    return()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();target.removeEventListener('pointermove',move);target.removeEventListener('pointerleave',leave);target.removeEventListener('pointerup',touchEnd);target.removeEventListener('pointercancel',leave);target.removeEventListener('click',splash);reduced.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)}
  },[paused])
  return <div className="water-scene">
    <div className="water-scene-heading"><span>EXPERIMENT 01</span><span>CODE / PLAY</span></div>
    <button ref={surface} className="water-surface" aria-label="Change bubble symbol" aria-description="Click, tap, or press Enter to explore code, React, JavaScript, SQL, and a pixel cat. Move your pointer to bend the water bubble."><canvas ref={canvas} aria-hidden="true"/></button>
    <div className="water-scene-caption" aria-live="polite"><span className="water-dot"/>{symbolNames[selected]}</div>
  </div>
}
