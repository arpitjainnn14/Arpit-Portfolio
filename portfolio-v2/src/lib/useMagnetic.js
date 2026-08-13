import { useEffect, useRef } from 'react'

/**
 * Nudges the attached element toward the cursor while hovered.
 *
 * Scoped to the element's own bounding box (mouseenter/mousemove/mouseleave)
 * rather than a page-wide 120px radius — with a fixed world-space radius,
 * two adjacent buttons both pull toward the cursor whenever it's near either
 * one, dragging them into each other. Reacting only to hover keeps each
 * button's pull independent of its neighbors.
 */
export function useMagnetic() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${dx * 0.25}px,${dy * 0.25}px)`
    }
    const onLeave = () => {
      el.style.transform = 'translate(0,0)'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return ref
}
