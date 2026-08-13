import { meta, contact, experience, toolkit, education } from '../data/book'

// The printed sheet lying on the desk. Rendered offscreen and rasterised onto a
// plane just above the paper stack, so the loose papers read as an actual CV
// rather than a blank slab — the same facts as CVPanel, set as one page.

const MONO = "'IBM Plex Mono', monospace"
const label = {
  fontFamily: MONO, fontWeight: 500, fontSize: 13, letterSpacing: '.22em',
  textTransform: 'uppercase', color: '#8a6f3f',
}

export default function CVSheet() {
  const email = contact.links.find((l) => l.label === 'email')

  return (
    <div
      data-cvsheet
      style={{
        width: 600, height: 800, background: '#f4eee1',
        padding: '54px 48px', display: 'flex', flexDirection: 'column', gap: 18,
        fontFamily: "'Newsreader', Georgia, serif",
      }}
    >
      <div style={{ ...label, fontSize: 12, letterSpacing: '.3em' }}>curriculum vitae</div>
      <div style={{ fontSize: 46, lineHeight: 1, color: '#241c11', letterSpacing: '-.02em' }}>{meta.name}</div>
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, color: '#5c4e35' }}>
        {meta.role}
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, color: '#5c4e35' }}>
        {email ? email.text : ''}
      </div>
      <div style={{ height: 1, background: 'rgba(140,112,66,.5)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={label}>experience</div>
        {experience.items.map((item) => (
          <div key={item.role} style={{ display: 'flex', gap: 14 }}>
            <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 13, color: '#7a6234', width: 86, flex: 'none', paddingTop: 3 }}>
              {item.period}
            </span>
            <span style={{ fontSize: 18, lineHeight: 1.4, color: '#33291b' }}>
              <strong style={{ fontWeight: 500 }}>{item.role}</strong>
              <br />
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 13, color: '#5c4e35' }}>{item.org}</span>
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(140,112,66,.5)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={label}>toolkit</div>
        <div style={{ fontSize: 17, lineHeight: 1.45, color: '#33291b' }}>
          {toolkit.groups.map((g) => g.value).join(' · ')}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        <div style={label}>education</div>
        <div style={{ fontSize: 17, lineHeight: 1.45, color: '#33291b' }}>
          {education.degree.title}
          <br />
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 13, color: '#5c4e35' }}>
            {education.degree.org}
          </span>
        </div>
      </div>
    </div>
  )
}
