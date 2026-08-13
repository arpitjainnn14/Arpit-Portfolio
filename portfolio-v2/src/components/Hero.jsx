import { useEffect, useRef } from 'react'
import { useMagnetic } from '../lib/useMagnetic'

const TEXT = 'ARPIT JAIN'
const INK = '22,19,15'
const ACCENT = '192,73,43'

function useDotCanvas(canvasRef, fadeRef) {
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const W = cv.clientWidth
      const H = cv.clientHeight
      if (!W || !H) return null
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const o = off.getContext('2d')
      let size = H * 0.86
      o.textBaseline = 'middle'
      o.textAlign = 'center'
      const fit = () => {
        o.font = `700 ${size}px "Space Grotesk", sans-serif`
        return o.measureText(TEXT).width
      }
      while (fit() > W * 0.94 && size > 10) size -= 4
      o.fillStyle = '#000'
      o.fillText(TEXT, W / 2, H / 2)

      const data = o.getImageData(0, 0, W, H).data
      const dots = []
      for (let y = 0; y < H; y += 5) {
        for (let x = 0; x < W; x += 5) {
          if (data[(y * W + x) * 4 + 3] > 128) {
            const a = Math.random() * Math.PI * 2
            dots.push({
              x,
              y,
              dx: Math.cos(a) * (40 + Math.random() * 340),
              dy: Math.sin(a) * (30 + Math.random() * 200) - Math.random() * 50,
              r: 1.5 + Math.random() * 0.9,
              s: Math.random() * Math.PI * 2,
              d: Math.random(),
              acc: Math.random() < 0.14,
            })
          }
        }
      }
      return { W, H, dots }
    }

    let rig = build()
    if (!rig) return

    // Draw once, statically, for users who've asked for reduced motion —
    // the continuously-drifting particle field is exactly the kind of
    // motion that trips vestibular sensitivity.
    const drawStatic = () => {
      const { dots } = rig
      ctx.clearRect(0, 0, rig.W, rig.H)
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        ctx.fillStyle = d.acc ? `rgba(${ACCENT},1)` : `rgba(${INK},1)`
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // The dot field is traced from rendered text — if Space Grotesk hasn't
    // loaded yet, this bakes in the fallback sans-serif's letterforms
    // permanently (nothing re-triggers `build()` once the font arrives).
    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => {
        const r = build()
        if (r) {
          rig = r
          if (reducedMotion) drawStatic()
        }
      })
    }

    const onResize = () => {
      const r = build()
      if (r) {
        rig = r
        if (reducedMotion) drawStatic()
      }
    }
    window.addEventListener('resize', onResize)

    let p = 0
    const onScroll = () => {
      p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.62)))
      const fo = fadeRef.current
      if (fo) {
        fo.style.opacity = String(Math.max(0, 1 - p * 1.7))
        fo.style.transform = `translateY(${p * -28}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    if (reducedMotion) {
      drawStatic()
      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onScroll)
      }
    }

    let raf
    const loop = (t) => {
      const { W, H, dots } = rig
      ctx.clearRect(0, 0, W, H)
      const ease = Math.pow(p, 3)
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        const drift = ease * (0.35 + d.d * 0.9)
        const idle = Math.sin(t / 900 + d.s) * 1.1 * (1 - ease)
        const x = d.x + d.dx * drift
        const y = d.y + d.dy * drift + ease * 90 * d.d + idle
        if (x < -40 || x > W + 40 || y < -60 || y > H + 60) continue
        const alpha = Math.max(0, 1 - ease * (0.55 + d.d * 0.75))
        ctx.fillStyle = d.acc ? `rgba(${ACCENT},${alpha})` : `rgba(${INK},${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, d.r * (1 + ease * 0.5), 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [canvasRef, fadeRef])
}

export default function Hero() {
  const canvasRef = useRef(null)
  const fadeRef = useRef(null)
  const workRef = useMagnetic()
  const resumeRef = useMagnetic()

  useDotCanvas(canvasRef, fadeRef)

  return (
    <div id="top" className="relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center px-6 md:px-11 z-[1] max-w-[1180px] mx-auto">
        <div
          className="absolute -right-10 top-[70px] w-[300px] h-[300px] rounded-full border pointer-events-none motion-safe:animate-[floaty_10s_ease-in-out_infinite]"
          style={{ borderColor: 'rgba(192,73,43,.28)' }}
        />

        <div className="flex justify-between items-baseline text-[10px] tracking-[.16em] uppercase mb-8 relative text-ink/40">
          <span>Software Engineer — AI &amp; Backend</span>
          <span>Gurugram, IN · 2026</span>
        </div>

        <h1 className="sr-only">Arpit Jain</h1>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Arpit Jain"
          className="w-full block relative"
          style={{ height: 'min(28vh, 230px)' }}
        />

        <div
          ref={fadeRef}
          className="grid md:grid-cols-[1.1fr_auto] gap-12 items-end mt-10 relative"
        >
          <p className="m-0 text-[15px] leading-[1.7] text-ink/60 max-w-[440px]">
            Retinal scan classifiers. Speech-therapy AI. Sub-50ms fraud detection. I take
            models from raw data to production endpoints — and I keep them running.
          </p>
          <div className="flex gap-3">
            <a
              ref={workRef}
              href="#work"
              className="inline-flex items-center gap-2 px-6 py-4 bg-ink text-cream rounded-full text-xs font-medium tracking-[.1em] uppercase whitespace-nowrap transition-colors duration-200 hover:bg-rust no-underline"
            >
              Selected work ↓
            </a>
            <a
              ref={resumeRef}
              href="/Resume/ArpitJain_DataScientist_Resume.pdf"
              download
              className="inline-flex items-center px-6 py-4 border border-ink/30 rounded-full text-xs font-medium tracking-[.1em] uppercase whitespace-nowrap transition-colors duration-200 hover:border-ink no-underline"
            >
              Résumé
            </a>
          </div>
        </div>
      </div>
      <div className="h-[70vh]" />
    </div>
  )
}
