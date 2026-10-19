import { useEffect, useRef, useState } from 'react'
import BookEngine from './BookEngine'
import BookPages from './BookPages'
import CVPanel from './CVPanel'
import NotePanel from './NotePanel'
import { intro as introCopy, meta, SHEETS, LABELS } from '../data/book'

const MONO = "'IBM Plex Mono', monospace"

const pill = {
  padding: '7px 20px',
  borderRadius: 999,
  background: 'rgba(12,9,6,.72)',
  border: '1px solid rgba(203,160,102,.16)',
  backdropFilter: 'blur(6px)',
}

export default function Book3D() {
  const mount = useRef(null)
  const pages = useRef(null)
  const loader = useRef(null)
  const counter = useRef(null)
  const label = useRef(null)
  const prev = useRef(null)
  const next = useRef(null)
  const vignette = useRef(null)
  const sound = useRef(null)

  const [introActive, setIntroActive] = useState(false)
  // 0 nothing · 1 name in · 2 sub in · 3 everything dissolving
  const [introPhase, setIntroPhase] = useState(0)
  const [hintDone, setHintDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const [atShelf, setAtShelf] = useState(false) // false = still in the study
  const [atDesk, setAtDesk] = useState(false)
  // Which desk panel is showing: 'cv' | 'note' | null. The engine reads it
  // synchronously from its Escape handler, so it is a ref as well as state.
  const [panel, setPanel] = useState(null)
  const panelRef = useRef(null)
  const openPanel = (kind) => { panelRef.current = kind; setPanel(kind) }
  // Same test as BookEngine's `this.mobile` (perf tuning profile) — computed
  // independently here since the hint copy is plain React state, not
  // something the engine drives directly.
  const [mobile] = useState(
    () => window.innerWidth < 1100 || !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  )

  useEffect(() => {
    document.title = meta.title
    const engine = new BookEngine(
      {
        mount: mount.current,
        pages: pages.current,
        loader: loader.current,
        counter: counter.current,
        label: label.current,
        prev: prev.current,
        next: next.current,
        vignette: vignette.current,
        sound: sound.current,
      },
      {
        onIntroActive: setIntroActive,
        onIntroPhase: setIntroPhase,
        onHintDone: (v = true) => setHintDone(v),
        onFail: () => setFailed(true),
        onAtShelf: setAtShelf,
        onAtDesk: setAtDesk,
        onPanel: openPanel,
        isPanelOpen: () => panelRef.current !== null,
      }
    )
    engine.start()
    return () => engine.destroy()
  }, [])


  // The nav pill belongs to the book, so it stays hidden while the reader is
  // still standing in the study.
  const chromeOpacity = introActive || !atShelf ? 0 : 1
  const hintOpacity = introActive || (hintDone && !atDesk) ? 0 : 1
  const pillPE = introActive || !atShelf ? 'none' : 'auto'
  const hintAnim = introActive || hintDone ? 'none' : 'hintPulse 2.4s ease-in-out infinite'
  const hintText = atDesk
    ? 'esc to step back'
    : atShelf
      ? 'find my book on the shelf — click it'
      : mobile
        ? 'tap the bookcase · drag to look around'
        : 'click the bookcase · drag to look around'

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(120% 90% at 50% 0%, #33291d 0%, #191309 55%, #0d0a06 100%)',
        fontFamily: "'Newsreader', Georgia, serif",
      }}
    >
      <div ref={mount} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />

      <div
        ref={vignette}
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0,
          background: 'radial-gradient(58% 62% at 50% 46%, rgba(8,6,4,0) 0%, rgba(8,6,4,.72) 78%, rgba(8,6,4,.92) 100%)',
        }}
      />

      {/* the title card that plays once, then dissolves into the room */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 8,
          display: introActive ? 'flex' : 'none',
          background: introPhase >= 3
            ? 'radial-gradient(70% 70% at 50% 46%, rgba(9,7,4,0) 0%, rgba(9,7,4,0) 100%)'
            : 'radial-gradient(70% 70% at 50% 46%, rgba(9,7,4,.74) 0%, rgba(9,7,4,.92) 100%)',
          transition: 'background 1200ms linear',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 22, padding: 40, textAlign: 'center', pointerEvents: 'none',
        }}
      >
        <div
          style={{
            opacity: introPhase >= 1 && introPhase < 3 ? 1 : 0,
            transition: 'opacity 1200ms ease-out, transform 1600ms cubic-bezier(.2,.7,.2,1)',
            transform:
              introPhase >= 3 ? 'translateY(-10px)' : introPhase >= 1 ? 'none' : 'translateY(14px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase', color: '#9c8156' }}>
            {introCopy.eyebrow}
          </div>
          <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 46, lineHeight: 1.14, color: '#f0e2c9', maxWidth: 620, letterSpacing: '-.01em' }}>
            {introCopy.line[0]}<br />{introCopy.line[1]}
          </div>
        </div>
        <div
          style={{
            opacity: introPhase === 2 ? 1 : 0,
            transition: 'opacity 900ms ease-out',
            fontFamily: MONO, fontSize: 11, letterSpacing: '.26em',
            textTransform: 'uppercase', color: '#6f6046',
          }}
        >
          {introCopy.sub}
        </div>
      </div>

      <div
        ref={loader}
        style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 18,
          background: '#0f0c08', transition: 'opacity 700ms linear', zIndex: 5,
        }}
      >
        <div style={{ width: 26, height: 26, border: '1px solid rgba(203,160,102,.25)', borderTopColor: '#cba066', borderRadius: '50%', animation: 'spin 900ms linear infinite' }} />
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', color: '#8d7b5d' }}>
          {failed ? 'webgl unavailable — try a different browser' : 'binding the pages'}
        </div>
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 26,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          zIndex: 4, pointerEvents: 'none', opacity: chromeOpacity,
          transition: 'opacity 600ms linear', fontFamily: MONO,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, pointerEvents: pillPE, ...pill }}>
          <div ref={prev} className="book-btn" style={{ cursor: 'pointer', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#b9a37c', padding: '8px 6px', opacity: 0.3, transition: 'color 200ms, opacity 200ms' }}>
            ← back
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#8d7b5d', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase' }}>
            <span ref={counter} style={{ color: '#cba066' }}>01 / 0{SHEETS + 2}</span>
            <span style={{ width: 1, height: 12, background: 'rgba(185,163,124,.35)' }} />
            <span ref={label}>{LABELS[0]}</span>
          </div>
          <div ref={next} className="book-btn" style={{ cursor: 'pointer', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#b9a37c', padding: '8px 6px', transition: 'color 200ms, opacity 200ms' }}>
            turn →
          </div>
          <span style={{ width: 1, height: 14, background: 'rgba(185,163,124,.3)' }} />
          <div ref={sound} className="book-sound" style={{ cursor: 'pointer', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6f6046', padding: '8px 2px', transition: 'color 200ms' }}>
            sound off
          </div>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#b9a37c', padding: '5px 14px', borderRadius: 999, background: 'rgba(12,9,6,.72)', border: '1px solid rgba(203,160,102,.14)', backdropFilter: 'blur(6px)' }}>
          scroll · drag to look · arrow keys
        </div>
      </div>

      <div
        style={{
          // Right padding is wider than left so the hint's right edge always
          // clears the skip chip (hotspots.js: right:28px, ~210px wide) —
          // 28 + ~210 + a margin — instead of colliding with it on narrow
          // desktop widths. top:26 is deliberate (clears the wall clock) —
          // do not move it.
          position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', padding: '0 260px 0 200px',
          // The asymmetric padding clears the skip chip on the right, leaving
          // ~360px at the 820px minimum viewport. The longest string reachable
          // there is 'tap the bookcase · drag to look around' (38 chars — the
          // mobile branch always wins below 1100px, so the 40-char 'click'
          // variant cannot appear at this width), which needs ~297px once the
          // clamps bite. Clamping type size and tracking shrinks it only where
          // it is tight; at desktop widths both sit at their maxima, unchanged.
          fontFamily: MONO, fontSize: 'clamp(9px, 1.1vw, 11px)', letterSpacing: 'clamp(.14em, .3vw, .28em)', textTransform: 'uppercase',
          color: '#cba066', animation: hintAnim, opacity: hintOpacity,
          zIndex: 4, pointerEvents: 'none', transition: 'opacity 500ms linear',
        }}
      >
        <span style={{ padding: '6px 16px', borderRadius: 999, background: 'rgba(12,9,6,.72)', border: '1px solid rgba(203,160,102,.14)', backdropFilter: 'blur(6px)' }}>{hintText}</span>
      </div>

      <CVPanel open={panel === 'cv'} onClose={() => openPanel(null)} />
      {panel === 'note' ? <NotePanel onClose={() => openPanel(null)} /> : null}

      <BookPages innerRef={pages} />
    </div>
  )
}
