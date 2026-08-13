import { useEffect, useRef, useState } from 'react'
import BookEngine from './BookEngine'
import BookPages from './BookPages'
import CVPanel from './CVPanel'
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
  const [cvOpen, setCvOpen] = useState(false)
  // The engine reads this synchronously from its Escape handler, so it has to
  // be a ref as well as state.
  const cvOpenRef = useRef(false)
  const openCV = (v) => { cvOpenRef.current = v; setCvOpen(v) }

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
        onCV: openCV,
        isCVOpen: () => cvOpenRef.current,
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
          position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center',
          fontFamily: MONO, fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase',
          color: '#cba066', animation: hintAnim, opacity: hintOpacity,
          zIndex: 4, pointerEvents: 'none', transition: 'opacity 500ms linear',
        }}
      >
        {hintText}
      </div>

      <CVPanel open={cvOpen} onClose={() => openCV(false)} />

      <BookPages innerRef={pages} />
    </div>
  )
}
