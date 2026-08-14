import { note } from '../data/book'

// The notebook's cover, rasterised onto the top face of the notebook on the
// desk. It does two jobs: it stops the notebook reading as a blank slab, and
// its pasted label says what happens if you click it — the only affordance the
// object gets before the cursor changes.

const MONO = "'IBM Plex Mono', monospace"

export default function NotebookCover() {
  return (
    <div
      data-notebook
      style={{
        width: 540, height: 740, background: '#2e3b44', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Newsreader', Georgia, serif",
      }}
    >
      {/* board edge, the same worn treatment the book's covers get */}
      <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(190,206,214,.07)' }} />
      <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(0,0,0,.3)' }} />

      {/* the elastic closure */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 62, width: 12, background: 'rgba(12,16,19,.55)' }} />

      {/* pasted label */}
      <div
        style={{
          width: 300, background: '#efe7d5', padding: '30px 26px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 0 rgba(0,0,0,.25)', marginRight: 40,
        }}
      >
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: '.3em', textTransform: 'uppercase', color: '#4c3814' }}>
          notes
        </div>
        <div style={{ width: 68, height: 1, background: '#b08a4c' }} />
        <div style={{ fontSize: 30, lineHeight: 1.15, color: '#241c11', textAlign: 'center' }}>
          {note.heading}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 15, color: '#5c4e35', textAlign: 'center' }}>
          click to open
        </div>
      </div>
    </div>
  )
}
