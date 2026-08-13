// "fig. 2 — architecture, after the third rewrite."
//
// Drawn as plain DOM rather than an image or inline SVG: html2canvas rasterises
// divs and CSS borders reliably (its SVG/webfont handling is not), and DOM stays
// sharp at whatever scale the page texture is rendered at.

const MONO = "'IBM Plex Mono', monospace"

const INK = '#241d14'
const TAG = '#5c4e35'
const LINE = '#8a7550'
const ACCENT = '#8f6320'

const SOURCES = ['fundus images', 'speech audio', 'upi events']

const STAGES = [
  { title: 'ingest & clean', tag: 'pandas · numpy' },
  { title: 'features & augment', tag: 'opencv · torchaudio' },
  { title: 'train', tag: 'pytorch · tensorflow' },
  { title: 'evaluate', tag: 'held-out · auc' },
  { title: 'serve', tag: 'fastapi · docker' },
  { title: 'monitor', tag: 'drift · latency' },
]

function Arrow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
      <div style={{ width: 1, height: 13, background: LINE }} />
      <div
        style={{
          width: 0, height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `6px solid ${LINE}`,
        }}
      />
    </div>
  )
}

export default function ArchitectureFigure() {
  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        background: '#ece2ca',
        border: '1px solid rgba(140,116,78,.45)',
        padding: '22px 92px 22px 26px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* three sources feeding one pipeline */}
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        {SOURCES.map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              border: `1px dashed ${LINE}`,
              padding: '9px 4px',
              textAlign: 'center',
              fontFamily: MONO,
              fontWeight: 500,
              fontSize: 12,
              letterSpacing: '.04em',
              color: TAG,
            }}
          >
            {s}
          </div>
        ))}
      </div>

      <Arrow />

      {/* the pipeline itself */}
      {STAGES.map((stage, i) => (
        <div key={stage.title} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              border: `1px solid ${LINE}`,
              background: '#f7f1e2',
              padding: '11px 16px',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 16, letterSpacing: '.02em', color: INK }}>
              {stage.title}
            </span>
            <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 12, color: TAG }}>{stage.tag}</span>
          </div>
          {i < STAGES.length - 1 ? <Arrow /> : null}
        </div>
      ))}

      {/* retrain loop: monitor → train, bracketed down the right margin */}
      <div
        style={{
          position: 'absolute',
          right: 30,
          top: '46%',
          bottom: '7%',
          width: 42,
          borderTop: `1px solid ${ACCENT}`,
          borderRight: `1px solid ${ACCENT}`,
          borderBottom: `1px solid ${ACCENT}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', right: 60, top: '46%',
          transform: 'translateY(-4px)',
          width: 0, height: 0,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderRight: `6px solid ${ACCENT}`,
        }}
      />
      <div
        style={{
          position: 'absolute', right: 6, top: '60%',
          fontFamily: MONO, fontWeight: 500, fontSize: 12,
          letterSpacing: '.16em', textTransform: 'uppercase', color: ACCENT,
          writingMode: 'vertical-rl',
        }}
      >
        retrain
      </div>
    </div>
  )
}
