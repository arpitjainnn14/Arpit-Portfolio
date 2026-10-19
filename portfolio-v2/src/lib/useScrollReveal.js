import { useEffect, useRef } from 'react'

/**
 * Fades + slides an element in the first time it enters the viewport.
 * Mirrors the design's IntersectionObserver reveal with a 2.5s fallback
 * (so content still appears if IO never fires, e.g. very short pages).
 */
export function useScrollReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'
    el.style.transition =
      'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)'

    const reveal = () => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal()
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)

    const fallback = setTimeout(reveal, 2500)

    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return ref
}
