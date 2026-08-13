import { Suspense, lazy, useState } from 'react'
import FlatBook from './flat/FlatBook'

// Three.js + html2canvas are ~900kB. Phones never render the 3D book, so they
// should never pay to download it — hence the lazy import.
const Book3D = lazy(() => import('./book/Book3D'))

// The 3D book needs WebGL and a desk-sized window — the same thresholds the
// design used. Everything else gets the flat edition, which is a real read
// rather than a "come back on desktop" sign.
function canRender3D() {
  // ?view=flat / ?view=3d forces an edition — handy for checking the phone
  // edition on a laptop, where you can't shrink the window far enough.
  const forced = new URLSearchParams(window.location.search).get('view')
  if (forced === 'flat') return false
  if (forced === '3d') return true

  const hasGL = (() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  })()
  const tooSmall = window.innerWidth < 820 || window.innerHeight < 460
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  return hasGL && !tooSmall && !coarse
}

// Shown while the book chunk downloads. Matches the loader inside Book3D so the
// handover is invisible.
function Binding() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 18, background: '#0f0c08',
      }}
    >
      <div style={{ width: 26, height: 26, border: '1px solid rgba(203,160,102,.25)', borderTopColor: '#cba066', borderRadius: '50%', animation: 'spin 900ms linear infinite' }} />
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', color: '#8d7b5d' }}>
        binding the pages
      </div>
    </div>
  )
}

export default function App() {
  // Decided once at mount: swapping mid-session would tear down the WebGL scene.
  const [use3D] = useState(canRender3D)
  if (!use3D) return <FlatBook />
  return (
    <Suspense fallback={<Binding />}>
      <Book3D />
    </Suspense>
  )
}
