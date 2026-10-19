import { meta, contact, experience, toolkit, education } from '../data/book'

// The one-page CV that the loose papers on the desk open into.
// Same facts as the book, compressed to something you could actually print.

const MONO = "'IBM Plex Mono', monospace"
const label = {
  fontFamily: MONO, fontSize: 10, letterSpacing: '.2em',
  textTransform: 'uppercase', color: '#8a6f3f',
}
const hr = { height: 1, background: 'rgba(140,112,66,.38)' }

export default function CVPanel({ open, onClose }) {
  const email = contact.links.find((l) => l.label === 'email')

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'absolute', inset: 0, zIndex: 9,
        display: open ? 'flex' : 'none',
        alignItems: 'center', justifyContent: 'center',
        padding: 40, background: 'rgba(8,6,4,.72)',
      }}
    >
      <div
        style={{
          position: 'relative', width: 640, maxWidth: '92vw', maxHeight: '86vh', overflow: 'auto',
          background: 'linear-gradient(168deg, #f8f2e5 0%, #ece2cf 100%)',
          boxShadow: '0 40px 90px -30px rgba(0,0,0,.8)',
          padding: '52px 56px', display: 'flex', flexDirection: 'column', gap: 20,
          fontFamily: "'Newsreader', Georgia, serif",
        }}
      >
        <div
          onClick={onClose}
          className="book-btn"
          style={{
            position: 'absolute', top: 18, right: 22, cursor: 'pointer',
            fontFamily: MONO, fontSize: 11, letterSpacing: '.2em',
            textTransform: 'uppercase', color: '#8a6f3f', padding: 6,
          }}
        >
          close
        </div>

        <div style={{ ...label, letterSpacing: '.32em' }}>curriculum vitae · one page</div>
        <div style={{ fontSize: 40, lineHeight: 1, color: '#241c11', letterSpacing: '-.02em' }}>{meta.name}</div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: '#6b5a3c' }}>
          {meta.role} · India · {email ? email.text : ''}
        </div>
        <div style={hr} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={label}>experience</div>
          {experience.items.map((item) => (
            <div key={item.role} style={{ display: 'flex', gap: 18 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#8a6f3f', width: 84, flex: 'none', paddingTop: 4 }}>
                {item.period}
              </span>
              <span style={{ fontSize: 17, lineHeight: 1.5, color: '#392f20' }}>
                <strong style={{ fontWeight: 500 }}>{item.role}</strong> · {item.org}
                <br />
                {item.body}
              </span>
            </div>
          ))}
        </div>
        <div style={hr} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={label}>toolkit</div>
          <div style={{ fontSize: 17, lineHeight: 1.5, color: '#392f20' }}>
            {toolkit.groups.map((g) => g.value).join(' · ')}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={label}>education</div>
          <div style={{ fontSize: 17, lineHeight: 1.5, color: '#392f20' }}>
            {education.degree.title} · {education.degree.org}
          </div>
        </div>

        <a
          href={education.cvHref}
          target="_blank"
          rel="noreferrer"
          style={{
            alignSelf: 'flex-start', marginTop: 6, fontFamily: MONO, fontSize: 11,
            letterSpacing: '.2em', textTransform: 'uppercase', color: '#14100a',
            background: '#cba066', padding: '12px 22px', border: 'none', borderRadius: 999,
          }}
        >
          download pdf
        </a>
      </div>
    </div>
  )
}
