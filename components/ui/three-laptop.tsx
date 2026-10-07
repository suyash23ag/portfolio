import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface LaptopTechnology {name:string; icon:string|null; color:string; command:string}
interface ThreeLaptopProps {technologies:LaptopTechnology[]; selected:number; yaw:number; onSelect:(index:number)=>void}
export function ThreeLaptop({technologies,selected,yaw,onSelect}:ThreeLaptopProps) {
  const host = useRef<HTMLDivElement>(null)
  const [unavailable,setUnavailable] = useState(false)
  const api = useRef<{select:(index:number)=>void; rotate:(angle:number)=>void}|null>(null)
  const selectHandler = useRef(onSelect)
  const initial = useRef({selected,yaw})
  useEffect(()=>{selectHandler.current=onSelect},[onSelect])
  useEffect(()=>{
    const container=host.current
    if(!container) return
    let renderer:THREE.WebGLRenderer
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'}) } catch {setUnavailable(true); return}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75))
    renderer.outputColorSpace=THREE.SRGBColorSpace
    renderer.setClearColor(0x000000,0)
    renderer.domElement.setAttribute('aria-label','Interactive 3D laptop. Select a technology on its screen, or use the accessible technology buttons below.')
    renderer.domElement.setAttribute('role','img')
    container.appendChild(renderer.domElement)
    const scene=new THREE.Scene()
    const camera=new THREE.PerspectiveCamera(36,1,.1,100)
    camera.position.set(0,3.9,8.4); camera.lookAt(0,1.2,0)
    scene.add(new THREE.HemisphereLight(0xdbeaff,0x202845,3))
    const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-3,5,4);scene.add(key)
    const rim=new THREE.DirectionalLight(0x728cff,3);rim.position.set(4,2,-2);scene.add(rim)
    const laptop=new THREE.Group();scene.add(laptop)
    const metal=new THREE.MeshStandardMaterial({color:0x9ca9bc,roughness:.34,metalness:.6})
    const dark=new THREE.MeshStandardMaterial({color:0x131c2b,roughness:.5,metalness:.3})
    const keyMaterial=new THREE.MeshStandardMaterial({color:0x263144,roughness:.55})
    const textures:THREE.Texture[]=[]
    function box(width:number,height:number,depth:number,material:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=laptop) {
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh
    }
    box(4.8,.14,3.05,metal,0,.1,.4)
    box(4.72,.025,3,dark,0,.02,.4)
    box(1.3,.014,.65,new THREE.MeshStandardMaterial({color:0x8698ac,roughness:.4,metalness:.55}),0,.18,1.2)
    for(let row=0;row<4;row++) for(let col=0;col<13;col++) box(.28,.025,.22,keyMaterial,-1.96+col*.325,.18,-.67+row*.27)
    box(1.55,.025,.19,keyMaterial,0,.18,.44)
    const lid=new THREE.Group();lid.position.set(0,.2,-1.1);lid.rotation.x=-.12;laptop.add(lid)
    box(4.8,3.08,.13,metal,0,1.54,0,lid)
    box(4.59,2.86,.035,dark,0,1.55,.075,lid)
    const makeTexture=(canvas:HTMLCanvasElement)=>{const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(texture);return texture}
    const screenCanvas=document.createElement('canvas');screenCanvas.width=1200;screenCanvas.height=750
    const screenContext=screenCanvas.getContext('2d')!
    const screenTexture=makeTexture(screenCanvas)
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.38,2.7),new THREE.MeshBasicMaterial({map:screenTexture}));screen.position.set(0,1.55,.103);lid.add(screen)
    function drawScreen(index:number) {
      const c=screenContext;c.fillStyle='#0b1323';c.fillRect(0,0,1200,750)
      const gradient=c.createRadialGradient(900,450,30,600,300,650);gradient.addColorStop(0,'#1d3050');gradient.addColorStop(1,'#0b1323');c.fillStyle=gradient;c.fillRect(0,0,1200,750)
      c.fillStyle='#19273c';c.fillRect(0,0,1200,48)
      ;['#f68583','#f5ce72','#83d5b4'].forEach((color,i)=>{c.fillStyle=color;c.beginPath();c.arc(25+i*22,24,6,0,Math.PI*2);c.fill()})
      c.fillStyle='#97abc5';c.font='18px monospace';c.textAlign='center';c.fillText('suyash / workspace',600,32)
      c.textAlign='left';c.font='18px monospace';c.fillStyle='#a6b7d4';c.fillText('MY TOOLKIT — SELECT A SYMBOL',65,109)
      c.font='bold 43px sans-serif';c.fillStyle='#f4f1e6';c.fillText('Pick a possibility.',62,170)
      c.fillStyle='#050d1a';c.fillRect(55,642,1090,67);c.font='23px monospace';c.fillStyle=technologies[index].color;c.fillText('> '+technologies[index].command,80,685)
      screenTexture.needsUpdate=true
    }
    const hitTargets:THREE.Mesh[]=[]

    technologies.forEach((technology,index)=>{
      const c=document.createElement('canvas');c.width=256;c.height=230;const ctx=c.getContext('2d')!
      ctx.fillStyle='#17253a';ctx.beginPath();ctx.roundRect(2,2,252,226,24);ctx.fill()
      ctx.strokeStyle='#354964';ctx.lineWidth=2;ctx.stroke()
      ctx.fillStyle=technology.color
      if(technology.icon){ctx.save();ctx.translate(88,35);ctx.scale(3.4,3.4);ctx.fill(new Path2D(technology.icon));ctx.restore()}
      else {ctx.font='bold 46px monospace';ctx.textAlign='center';ctx.fillText('SQL',128,95)}
      ctx.font='25px sans-serif';ctx.textAlign='center';ctx.fillStyle='#e1e8f5';ctx.fillText(technology.name,128,181)
      const material=new THREE.MeshBasicMaterial({map:makeTexture(c),transparent:true})
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.61,.59),material)
      mesh.position.set(-1.76+(index%6)*.705,1.99-Math.floor(index/6)*.75,.115)
      mesh.userData.index=index;lid.add(mesh);hitTargets.push(mesh)
    })
    const cameraDot=new THREE.Mesh(new THREE.SphereGeometry(.021,10,8),new THREE.MeshBasicMaterial({color:0xabc9e9}));cameraDot.position.set(0,3.025,.08);lid.add(cameraDot)
    const selection=new THREE.Mesh(new THREE.PlaneGeometry(.67,.65),new THREE.MeshBasicMaterial({color:technologies[initial.current.selected].color,transparent:true,opacity:.65}));lid.add(selection)
    const applySelected=(index:number)=>{const target=hitTargets[index];selection.position.copy(target.position);selection.position.z=.11;(selection.material as THREE.MeshBasicMaterial).color.set(technologies[index].color);drawScreen(index)}
    let targetYaw=THREE.MathUtils.degToRad(initial.current.yaw)
    laptop.rotation.y=targetYaw
    api.current={select:applySelected,rotate:(angle)=>{targetYaw=THREE.MathUtils.degToRad(angle)}}
    applySelected(initial.current.selected)
    const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2()
    const hit=(event:PointerEvent)=>{const bounds=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(hitTargets)[0]}
    const onPointerMove=(event:PointerEvent)=>{renderer.domElement.style.cursor=hit(event)?'pointer':'default'}
    let pointerStart:{x:number;y:number}|null=null
    const onPointerDown=(event:PointerEvent)=>{pointerStart={x:event.clientX,y:event.clientY}}
    const onPointerUp=(event:PointerEvent)=>{if(!pointerStart)return;const moved=Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y);pointerStart=null;if(moved>8)return;const target=hit(event);if(target)selectHandler.current(target.object.userData.index as number)}
    renderer.domElement.addEventListener('pointerdown',onPointerDown)
    renderer.domElement.addEventListener('pointermove',onPointerMove)
    renderer.domElement.addEventListener('pointerup',onPointerUp)
    const resize=()=>{const width=container.clientWidth;const height=container.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=width<500?10.6:8.4;camera.updateProjectionMatrix()}
    const observer=new ResizeObserver(resize);observer.observe(container);resize()
    let visible=true;let frame=0;let destroyed=false
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)')
    const render=()=>{if(destroyed||!visible)return;laptop.rotation.y=motion.matches?targetYaw:THREE.MathUtils.lerp(laptop.rotation.y,targetYaw,.1);renderer.render(scene,camera);frame=requestAnimationFrame(render)}
    const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;cancelAnimationFrame(frame);if(visible)render()},{rootMargin:'100px'});visibility.observe(container)
    const contextLost=(event:Event)=>{event.preventDefault();visible=false;cancelAnimationFrame(frame);renderer.domElement.style.display='none';setUnavailable(true)};renderer.domElement.addEventListener('webglcontextlost',contextLost)
    render()
    return ()=>{destroyed=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();renderer.domElement.removeEventListener('pointerdown',onPointerDown);renderer.domElement.removeEventListener('pointermove',onPointerMove);renderer.domElement.removeEventListener('pointerup',onPointerUp);renderer.domElement.removeEventListener('webglcontextlost',contextLost);api.current=null;scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(m=>m.dispose())}});textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()}
  },[technologies])
  useEffect(()=>{api.current?.select(selected)},[selected])
  useEffect(()=>{api.current?.rotate(yaw)},[yaw])
  return <div className="three-laptop-host" ref={host}>{unavailable&&<div className="three-fallback"><span>{'</>'}</span><p>Your toolkit, ready to explore.</p><small>Use the technology buttons below.</small></div>}</div>
}
