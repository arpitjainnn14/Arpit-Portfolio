import {
  cover, about, work, toolkit, method, experience, education, contact, backCover,
} from '../data/book'
import ArchitectureFigure from './ArchitectureFigure'
import CVSheet from './CVSheet'

// The eleven 700x900 faces of the book. They live offscreen at left:-20000px
// and exist only so html2canvas can rasterise them into page textures.
//
// Face order is load-bearing — BookEngine maps them onto sheets as
// front = faces[i*2], back = faces[i*2+1], and face 10 onto the inside back board.

const PAGE = {
  width: 700,
  height: 900,
  background: '#f5eeddff',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative', // anchors the gutter shading
}
const DARK = { width: 700, height: 900, background: '#1a140c', position: 'relative' }
const MONO = "'IBM Plex Mono', monospace"
const chapter = {
  fontFamily: MONO, fontWeight: 500, fontSize: 16, letterSpacing: '.22em',
  textTransform: 'uppercase', color: '#33250b',
}
const caption = { fontFamily: MONO, fontWeight: 500, fontSize: 16, color: '#332a1c', lineHeight: 1.7 }
const plate = {
  flex: 1, background: '#e2d6bf', display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: '.2em',
  textTransform: 'uppercase', color: '#a08c6d',
  backgroundSize: 'cover', backgroundPosition: 'center',
}

// The shadow the page block casts into its own spine. Without it an open
// spread reads as two flat sheets rather than a bound stack.
//
// Which edge is the gutter follows the design's asymmetric padding: left-hand
// pages carry the wider margin on the outside, so their gutter is on the right.
function Gutter({ side }) {
  return (
    <div
      style={{
        position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 54,
        pointerEvents: 'none',
        background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'},
          rgba(84,64,36,.20) 0%, rgba(84,64,36,.09) 38%, rgba(84,64,36,0) 100%)`,
      }}
    />
  )
}

// Cloth-bound boards go pale where they rub — along the trim and hardest at the
// corners. A pale outer edge with a dark roll just inside it reads as a board
// with a life, rather than a perfectly sharp box.
function WornEdge() {
  const corner = {
    position: 'absolute', width: 34, height: 34, pointerEvents: 'none',
    borderColor: 'rgba(214,178,120,.16)', borderStyle: 'solid',
  }
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(214,178,120,.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 3, border: '1px solid rgba(0,0,0,.3)', pointerEvents: 'none' }} />
      <div style={{ ...corner, left: 0, top: 0, borderWidth: '3px 0 0 3px' }} />
      <div style={{ ...corner, right: 0, top: 0, borderWidth: '3px 3px 0 0' }} />
      <div style={{ ...corner, left: 0, bottom: 0, borderWidth: '0 0 3px 3px' }} />
      <div style={{ ...corner, right: 0, bottom: 0, borderWidth: '0 3px 3px 0' }} />
    </>
  )
}

// `position` lets the portrait sit top-aligned so a cover-crop doesn't take
// the top of the subject's head off.
function Plate({ src, placeholder, position = 'center' }) {
  const style = src
    ? { ...plate, backgroundImage: `url("${src}")`, backgroundPosition: position }
    : plate
  return <div style={style}>{src ? '' : placeholder}</div>
}

export default function BookPages({ innerRef }) {
  return (
    <div ref={innerRef} style={{ position: 'absolute', left: -20000, top: 0, width: 700 }}>

      {/* 0 — front cover */}
      <div data-face="cover" style={{ ...DARK, padding: '70px 66px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <WornEdge />
        <div style={{ position: 'absolute', left: 30, top: 30, right: 30, bottom: 30, border: '1px solid rgba(203,160,102,.26)' }} />
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: '.34em', textTransform: 'uppercase', color: '#bb9a6b' }}>{cover.edition}</div>
        <div>
          <div style={{ fontSize: 100, lineHeight: .95, color: '#f0e2c9', letterSpacing: '-.02em' }}>
            {cover.name[0]}<br />{cover.name[1]}
          </div>
          <div style={{ width: 84, height: 1, background: '#c08a4a', margin: '34px 0 26px' }} />
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: '.16em', textTransform: 'uppercase', color: '#b9a37c', lineHeight: 2 }}>
            {cover.role[0]}<br />{cover.role[1]}
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 15, color: '#93794f' }}>{cover.nudge}</div>
      </div>

      {/* 1 — about, left */}
      <div data-face="about-l" style={{ ...PAGE, padding: '60px 58px 54px 66px', gap: 26 }}>
        <Gutter side="right" />
        <div style={chapter}>{about.chapter}</div>
        <Plate src={about.portrait} placeholder="portrait" position="center top" />
        <div style={caption}>{about.caption[0]}<br />{about.caption[1]}</div>
      </div>

      {/* 2 — about, right */}
      <div data-face="about-r" style={{ ...PAGE, padding: '68px 66px 54px 58px', gap: 24 }}>
        <Gutter side="left" />
        <div style={{ fontSize: 60, lineHeight: 1, color: '#241d14', letterSpacing: '-.02em' }}>{about.heading}</div>
        <div style={{ width: 60, height: 1, background: '#c08a4a' }} />
        {about.body.map((p) => (
          <div key={p} style={{ fontSize: 25, lineHeight: 1.6, color: '#3b3225' }}>{p}</div>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '22px 30px', fontFamily: MONO, fontWeight: 500, fontSize: 15, color: '#3b3225' }}>
          {about.facts.map((f) => (
            <div key={f.label} style={{ width: '44%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: '#33250b', fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 13 }}>{f.label}</span>
              <span>{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 — work, left */}
      <div data-face="work-l" style={{ ...PAGE, padding: '60px 58px 54px 66px', gap: 24 }}>
        <Gutter side="right" />
        <div style={chapter}>{work.chapter}</div>
        <div style={{ fontSize: 44, lineHeight: 1.06, color: '#241d14', letterSpacing: '-.02em' }}>{work.heading}</div>
        {/* Drop a file at public/ and set `work.image` in data/book.js to use a
            real screenshot instead of the drawn figure. */}
        {work.image ? <Plate src={work.image} placeholder={work.imagePlaceholder} /> : <ArchitectureFigure />}
        <div style={{ ...caption, lineHeight: 1.4 }}>{work.caption}</div>
      </div>

      {/* 4 — work, right */}
      <div data-face="work-r" style={{ ...PAGE, padding: '64px 66px 54px 58px', gap: 26 }}>
        <Gutter side="left" />
        {work.items.map((item, i) => (
          <div
            key={item.n}
            style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              paddingBottom: i === work.items.length - 1 ? 0 : 24,
              borderBottom: i === work.items.length - 1 ? 'none' : '1px solid rgba(140,116,78,.32)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 15, color: '#b0854c' }}>{item.n}</span>
              <span style={{ fontSize: 33, color: '#241d14' }}>{item.title}</span>
            </div>
            <div style={{ fontSize: 22, lineHeight: 1.5, color: '#3b3225' }}>{item.body}</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 16, color: '#342b1c' }}>{item.meta}</div>
          </div>
        ))}
      </div>

      {/* 5 — toolkit, left */}
      <div data-face="skills-l" style={{ ...PAGE, padding: '62px 58px 54px 66px', gap: 30 }}>
        <Gutter side="right" />
        <div style={chapter}>{toolkit.chapter}</div>
        <div style={{ fontSize: 50, lineHeight: 1.04, color: '#241d14', letterSpacing: '-.02em' }}>{toolkit.heading}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {toolkit.groups.map((g) => (
            <div key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase', color: '#33250b' }}>{g.label}</div>
              <div style={{ fontSize: 24, color: '#3b3225', lineHeight: 1.5 }}>{g.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', fontSize: 22, fontStyle: 'italic', color: '#3b3225', lineHeight: 1.5 }}>{toolkit.rule}</div>
      </div>

      {/* 6 — how I work, right */}
      <div data-face="skills-r" style={{ ...PAGE, padding: '62px 66px 54px 58px', gap: 28 }}>
        <Gutter side="left" />
        <div style={chapter}>{method.chapter}</div>
        <div style={{ fontSize: 50, lineHeight: 1.04, color: '#241d14', letterSpacing: '-.02em' }}>{method.heading}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, fontSize: 22, lineHeight: 1.5, color: '#3b3225' }}>
          {method.points.map((p) => <div key={p}>{p}</div>)}
        </div>
        <div style={{ marginTop: 'auto', fontFamily: MONO, fontWeight: 500, fontSize: 15, color: '#33250b' }}>{method.footer}</div>
      </div>

      {/* 7 — experience, left */}
      <div data-face="exp-l" style={{ ...PAGE, padding: '62px 58px 54px 66px', gap: 30 }}>
        <Gutter side="right" />
        <div style={chapter}>{experience.chapter}</div>
        <div style={{ fontSize: 48, lineHeight: 1.04, color: '#241d14', letterSpacing: '-.02em' }}>{experience.heading}</div>
        {experience.items.map((item) => (
          <div key={item.role} style={{ display: 'flex', gap: 22 }}>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 15, color: '#33250b', width: 96, flex: 'none', paddingTop: 8 }}>{item.period}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 28, color: '#241d14' }}>{item.role}</div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 16, color: '#342b1c' }}>{item.org}</div>
              <div style={{ fontSize: 21, lineHeight: 1.5, color: '#3b3225' }}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 8 — education, right */}
      <div data-face="edu-r" style={{ ...PAGE, padding: '62px 66px 54px 58px', gap: 28 }}>
        <Gutter side="left" />
        <div style={chapter}>{education.chapter}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 26, borderBottom: '1px solid rgba(140,116,78,.32)' }}>
          <div style={{ fontSize: 34, color: '#241d14', lineHeight: 1.2 }}>{education.degree.title}</div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 16, color: '#342b1c' }}>{education.degree.org}</div>
          <div style={{ fontSize: 21, lineHeight: 1.5, color: '#3b3225' }}>{education.degree.body}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase', color: '#33250b' }}>{education.alsoLabel}</div>
          <div style={{ fontSize: 22, lineHeight: 1.75, color: '#3b3225' }}>
            {education.also.map((line, i) => (
              <span key={line}>{line}{i < education.also.length - 1 ? <br /> : null}</span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase', color: '#33250b' }}>{education.cvLabel}</div>
          <div style={{ fontSize: 22, color: '#8a4a16' }}>{education.cvText}</div>
        </div>
      </div>

      {/* 9 — contact, left */}
      <div data-face="end-l" style={{ ...PAGE, padding: '68px 58px 54px 66px', gap: 24 }}>
        <Gutter side="right" />
        <div style={chapter}>{contact.chapter}</div>
        <div style={{ fontSize: 56, lineHeight: 1.02, color: '#241d14', letterSpacing: '-.02em' }}>{contact.heading}</div>
        <div style={{ fontSize: 24, lineHeight: 1.55, color: '#3b3225' }}>{contact.body}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
          {contact.links.map((l) => (
            <div key={l.label} style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: '.18em', textTransform: 'uppercase', color: '#33250b', width: 84 }}>{l.label}</span>
              <span style={{ fontSize: 23, color: '#8a4a16' }}>{l.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', fontFamily: MONO, fontWeight: 500, fontSize: 15, color: '#33250b' }}>{contact.footer}</div>
      </div>

      {/* 10 — inside back board */}
      <div data-face="back" style={{ ...DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <WornEdge />
        <div style={{ position: 'absolute', left: 30, top: 30, right: 30, bottom: 30, border: '1px solid rgba(203,160,102,.2)' }} />
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, letterSpacing: '.34em', textTransform: 'uppercase', color: '#93794f' }}>{backCover}</div>
      </div>

      {/* Not a book face — rasterised onto the loose papers on the desk. */}
      <CVSheet />
    </div>
  )
}
