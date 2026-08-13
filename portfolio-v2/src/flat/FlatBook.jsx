import { useEffect } from 'react'
import {
  meta, cover, about, work, toolkit, method, experience, education, contact, backCover,
} from '../data/book'

// The edition for phones and machines without WebGL. Same words as the 3D book,
// read the way a book actually reads on a small screen: top to bottom.

const MONO = "'IBM Plex Mono', monospace"
const SERIF = "'Newsreader', Georgia, serif"

const page = {
  background: '#f5eedd',
  padding: '44px 26px 40px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
}
const chapter = {
  fontFamily: MONO, fontSize: 11, letterSpacing: '.28em',
  textTransform: 'uppercase', color: '#5a4413', fontWeight: 500,
}
const h = { fontSize: 34, lineHeight: 1.08, color: '#241d14', letterSpacing: '-.02em', margin: 0 }
const body = { fontSize: 17, lineHeight: 1.62, color: '#3b3225' }
const smallMono = { fontFamily: MONO, fontSize: 12.5, color: '#3d3323', fontWeight: 500 }
const rule = { width: 56, height: 1, background: '#c08a4a' }

function Folio({ n, of }) {
  return (
    <div style={{ ...smallMono, letterSpacing: '.2em', color: '#b0a184', textAlign: 'center', paddingTop: 12 }}>
      {String(n).padStart(2, '0')} / {String(of).padStart(2, '0')}
    </div>
  )
}

export default function FlatBook() {
  useEffect(() => {
    document.title = meta.title
  }, [])

  const of = 8

  return (
    <div style={{ background: '#0f0c08', fontFamily: SERIF, minHeight: '100vh' }}>
      {/* Capped so the line length stays readable if this edition is ever seen
          on a tablet or a narrow desktop window. */}
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

      {/* cover */}
      <section
        style={{
          minHeight: '100vh', background: '#1a140c', position: 'relative',
          padding: '54px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'absolute', left: 16, top: 16, right: 16, bottom: 16, border: '1px solid rgba(203,160,102,.26)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9c8156' }}>
          {cover.edition}
        </div>
        <div>
          <div style={{ fontSize: 'clamp(56px, 19vw, 92px)', lineHeight: .95, color: '#f0e2c9', letterSpacing: '-.02em' }}>
            {cover.name[0]}<br />{cover.name[1]}
          </div>
          <div style={{ ...rule, width: 72, margin: '26px 0 20px' }} />
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: '#b9a37c', lineHeight: 1.9 }}>
            {cover.role[0]}<br />{cover.role[1]}
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6d5c40' }}>
          scroll to read ↓
        </div>
      </section>

      {/* about */}
      <section style={page}>
        <div style={chapter}>{about.chapter}</div>
        <div
          style={{
            width: '100%', aspectRatio: '3 / 4', background: '#e2d6bf',
            backgroundImage: `url("${about.portrait}")`, backgroundSize: 'cover', backgroundPosition: 'center top',
          }}
        />
        <div style={{ fontFamily: MONO, fontSize: 12, color: '#3d3323', lineHeight: 1.7 }}>
          {about.caption[0]} {about.caption[1]}
        </div>
        <h1 style={{ ...h, fontSize: 40, marginTop: 10 }}>{about.heading}</h1>
        <div style={rule} />
        {about.body.map((p) => <p key={p} style={{ ...body, margin: 0 }}>{p}</p>)}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 24px', fontFamily: MONO, fontSize: 13, color: '#3b3225', marginTop: 6 }}>
          {about.facts.map((f) => (
            <div key={f.label} style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ color: '#5a4413', letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10 }}>{f.label}</span>
              <span>{f.value}</span>
            </div>
          ))}
        </div>
        <Folio n={2} of={of} />
      </section>

      {/* selected work */}
      <section style={page}>
        <div style={chapter}>{work.chapter}</div>
        <h2 style={h}>{work.heading}</h2>
        <div style={rule} />
        {work.items.map((item) => (
          <div key={item.n} style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 18, borderTop: '1px solid rgba(140,116,78,.32)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 13, color: '#b0854c' }}>{item.n}</span>
              <span style={{ fontSize: 24, color: '#241d14', lineHeight: 1.2 }}>{item.title}</span>
            </div>
            <div style={body}>{item.body}</div>
            <div style={smallMono}>{item.meta}</div>
          </div>
        ))}
        <Folio n={3} of={of} />
      </section>

      {/* toolkit */}
      <section style={page}>
        <div style={chapter}>{toolkit.chapter}</div>
        <h2 style={h}>{toolkit.heading}</h2>
        <div style={rule} />
        {toolkit.groups.map((g) => (
          <div key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#5a4413' }}>{g.label}</div>
            <div style={{ ...body, fontSize: 18 }}>{g.value}</div>
          </div>
        ))}
        <div style={{ fontSize: 18, fontStyle: 'italic', color: '#3b3225', lineHeight: 1.5, marginTop: 6 }}>{toolkit.rule}</div>
        <Folio n={4} of={of} />
      </section>

      {/* how I work */}
      <section style={page}>
        <div style={chapter}>{method.chapter}</div>
        <h2 style={h}>{method.heading}</h2>
        <div style={rule} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {method.points.map((p) => <div key={p} style={body}>{p}</div>)}
        </div>
        <div style={{ ...smallMono, color: '#5a4413', marginTop: 6 }}>{method.footer}</div>
        <Folio n={5} of={of} />
      </section>

      {/* experience */}
      <section style={page}>
        <div style={chapter}>{experience.chapter}</div>
        <h2 style={h}>{experience.heading}</h2>
        <div style={rule} />
        {experience.items.map((item) => (
          <div key={item.role} style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 18, borderTop: '1px solid rgba(140,116,78,.32)' }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5a4413' }}>{item.period}</div>
            <div style={{ fontSize: 23, color: '#241d14', lineHeight: 1.25 }}>{item.role}</div>
            <div style={smallMono}>{item.org}</div>
            <div style={body}>{item.body}</div>
          </div>
        ))}
        <Folio n={6} of={of} />
      </section>

      {/* education */}
      <section style={page}>
        <div style={chapter}>{education.chapter}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontSize: 26, color: '#241d14', lineHeight: 1.22 }}>{education.degree.title}</div>
          <div style={smallMono}>{education.degree.org}</div>
          <div style={body}>{education.degree.body}</div>
        </div>
        <div style={{ height: 1, background: 'rgba(140,116,78,.32)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#5a4413' }}>{education.alsoLabel}</div>
          <div style={{ ...body, lineHeight: 1.8 }}>
            {education.also.map((line, i) => (
              <span key={line}>{line}{i < education.also.length - 1 ? <br /> : null}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#5a4413' }}>{education.cvLabel}</div>
          <a href={education.cvHref} target="_blank" rel="noreferrer" style={{ fontSize: 19, color: '#8a4a16' }}>{education.cvText}</a>
        </div>
        <Folio n={7} of={of} />
      </section>

      {/* contact */}
      <section style={page}>
        <div style={chapter}>{contact.chapter}</div>
        <h2 style={h}>{contact.heading}</h2>
        <div style={rule} />
        <div style={{ ...body, fontSize: 19 }}>{contact.body}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
          {contact.links.map((l) => (
            <div key={l.label} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5a4413', fontWeight: 500, width: 66, flex: 'none' }}>{l.label}</span>
              <a href={l.href} target="_blank" rel="noreferrer" style={{ fontSize: 17, color: '#8a4a16', wordBreak: 'break-word' }}>{l.text}</a>
            </div>
          ))}
        </div>
        <div style={{ ...smallMono, color: '#5a4413', marginTop: 10 }}>{contact.footer}</div>
        <Folio n={8} of={of} />
      </section>

      {/* back cover */}
      <section style={{ background: '#1a140c', position: 'relative', padding: '80px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '46vh' }}>
        <div style={{ position: 'absolute', left: 16, top: 16, right: 16, bottom: 16, border: '1px solid rgba(203,160,102,.2)' }} />
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: '#6d5c40' }}>{backCover}</div>
      </section>
      </div>
    </div>
  )
}
