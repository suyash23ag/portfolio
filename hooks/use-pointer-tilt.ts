import { useEffect, useRef, type PointerEvent } from 'react'
import gsap from 'gsap'

/** Tilt only the model, leaving the pointer surface stable. */
export function usePointerTilt(strength = 8) {
  const model = useRef<HTMLDivElement>(null)
  const reduced = useRef(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      reduced.current = media.matches
      if (media.matches && model.current) gsap.set(model.current, { rotationX: 0, rotationY: 0 })
    }
    update()
    media.addEventListener('change', update)
    const element = model.current
    return () => { media.removeEventListener('change', update); if (element) gsap.killTweensOf(element) }
  }, [])
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reduced.current || event.pointerType === 'touch' || !model.current) return
    // Keep click targets still while the pointer is over a control.
    if (event.target instanceof Element && event.target.closest('button, a')) { gsap.killTweensOf(model.current); return }
    const rect = event.currentTarget.getBoundingClientRect()
    gsap.to(model.current, { rotationY: ((event.clientX - rect.left) / rect.width - .5) * strength * 2, rotationX: -((event.clientY - rect.top) / rect.height - .5) * strength, duration: .6, ease: 'power3.out', overwrite: true })
  }
  const reset = () => { if (model.current) gsap.to(model.current, { rotationX: 0, rotationY: 0, duration: reduced.current ? 0 : .7, overwrite: true }) }
  return { model, move, reset }
}
