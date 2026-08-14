import { useEffect, useRef, useState } from 'react'
import { note, contact } from '../data/book'
import useNoteSubmit from '../lib/useNoteSubmit'

// The page the notebook opens to. A ruled sheet you write on, not a form on a
// website — the labels sit in the margin, the rules run under what you type.

const MONO = "'IBM Plex Mono', monospace"
const SERIF = "'Newsreader', Georgia, serif"
const RULE = 'rgba(140,112,66,.28)'

const label = {
  fontFamily: MONO, fontWeight: 500, fontSize: 10, letterSpacing: '.22em',
  textTransform: 'uppercase', color: '#8a6f3f',
}

// Transparent input sitting directly on the page's ruled line.
const field = {
  width: '100%', border: 'none', outline: 'none', background: 'transparent',
  fontFamily: SERIF, fontSize: 20, color: '#241c11', padding: '6px 0',
  borderBottom: `1px solid ${RULE}`,
}

export default function NotePanel({ onClose }) {
  const { status, submit } = useNoteSubmit()
  const [fields, setFields] = useState({ name: '', email: '', message: '', website: '' })
  const firstRef = useRef(null)
  const email = contact.links.find((l) => l.label === 'email')

  // The panel is mounted only while it's open, so every visit starts on a
  // blank page. Just put the cursor in it once the modal has settled.
  useEffect(() => {
    const t = setTimeout(() => firstRef.current && firstRef.current.focus(), 120)
    return () => clearTimeout(t)
  }, [])

  // Once it's left on the desk, close the notebook by itself.
  useEffect(() => {
    if (status !== 'done') return
    const t = setTimeout(onClose, 2600)
    return () => clearTimeout(t)
  }, [status, onClose])

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))
  const ready = fields.message.trim() && fields.email.trim() && status !== 'sending'

  const onSubmit = (e) => {
    e.preventDefault()
    if (ready) submit(fields)
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'absolute', inset: 0, zIndex: 9,
        display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: 40, background: 'rgba(8,6,4,.72)',
      }}
    >
      <div
        style={{
          position: 'relative', width: 560, maxWidth: '92vw', maxHeight: '88vh', overflow: 'auto',
          background: 'linear-gradient(168deg, #f8f2e5 0%, #ece2cf 100%)',
          boxShadow: '0 40px 90px -30px rgba(0,0,0,.8)',
          padding: '48px 52px', fontFamily: SERIF,
        }}
      >
        {/* the notebook's stitched spine */}
        <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 1, background: RULE }} />

        <div
          onClick={onClose}
          className="book-btn"
          style={{
            position: 'absolute', top: 16, right: 20, cursor: 'pointer',
            fontFamily: MONO, fontSize: 11, letterSpacing: '.2em',
            textTransform: 'uppercase', color: '#8a6f3f', padding: 6,
          }}
        >
          close
        </div>

        {status === 'done' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '40px 0' }}>
            <div style={label}>{note.eyebrow}</div>
            <div style={{ fontSize: 34, lineHeight: 1.1, color: '#241c11', letterSpacing: '-.02em' }}>
              Thank you.
            </div>
            <div style={{ ...label, letterSpacing: '.16em', color: '#6b5a3c' }}>{note.done}</div>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={label}>{note.eyebrow}</div>
            <div style={{ fontSize: 34, lineHeight: 1.1, color: '#241c11', letterSpacing: '-.02em' }}>
              {note.heading}
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.5, color: '#4a3f2c' }}>{note.blurb}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={label}>{note.fields.name.label}</span>
              <input
                ref={firstRef}
                style={field}
                value={fields.name}
                onChange={set('name')}
                placeholder={note.fields.name.placeholder}
                autoComplete="name"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={label}>{note.fields.email.label}</span>
              <input
                style={field}
                type="email"
                required
                value={fields.email}
                onChange={set('email')}
                placeholder={note.fields.email.placeholder}
                autoComplete="email"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={label}>{note.fields.message.label}</span>
              <textarea
                style={{ ...field, minHeight: 104, resize: 'vertical', lineHeight: 1.7 }}
                required
                value={fields.message}
                onChange={set('message')}
                placeholder={note.fields.message.placeholder}
              />
            </div>

            {/* honeypot — off-screen rather than display:none, which some bots skip */}
            <input
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              value={fields.website}
              onChange={set('website')}
              style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
            />

            {status === 'failed' ? (
              <div style={{ fontSize: 15, lineHeight: 1.5, color: '#8a4a16' }}>
                {note.failed}{' '}
                <a href={email ? email.href : '#'} style={{ color: '#8a4a16', textDecoration: 'underline' }}>
                  {email ? email.text : ''}
                </a>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!ready}
              className="book-btn"
              style={{
                alignSelf: 'flex-start', marginTop: 4, cursor: ready ? 'pointer' : 'default',
                fontFamily: MONO, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase',
                color: '#14100a', background: '#cba066', padding: '12px 22px',
                border: 'none', borderRadius: 999, opacity: ready ? 1 : 0.45,
                transition: 'opacity 200ms',
              }}
            >
              {status === 'sending' ? note.sending : note.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
