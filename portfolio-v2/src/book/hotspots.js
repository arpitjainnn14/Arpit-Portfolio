// HotspotLayer: pulsing dot+label pills projected from 3D world anchors onto
// screen space, plus the "n of 4 found" desk tracker and the skip-to-book
// chip. A direct port of SRC's spot0..spot8 / trackRef / skipRef markup and
// its updateSpots()/updateHud() logic.
//
// Builds its own DOM rather than taking nine ref callbacks the way SRC
// threads them through the component — React does not need to know about
// this layer's internals.

const LABEL = {
  cv: 'read the cv',
  lamp: 'the lamp',
  mug: 'the coffee',
  pen: 'sign the book',
  case: 'my book — click',
  desk: 'the desk · 4 things',
  vinyl: 'now playing',
  cat: "don't wake lindy",
  tail: 'touch the tail',
}

// Ring-pulse delay per kind — purely so pills don't all pulse in lockstep.
// `tail` gets no ring at all (SRC gives it a bare, un-pulsed dot).
const RING_DELAY = {
  cv: '0s', lamp: '.5s', mug: '1s', pen: '1.5s',
  case: '0s', desk: '0s', vinyl: '.8s', cat: '1.3s',
}

// World-space Y offset added to `obj.getWorldPosition()` before projecting.
// Anything not listed here (cv/mug/pen — "the other desk items") gets +1.9.
const Y_OFFSET = { lamp: -1.2, vinyl: 5.4, cat: 3.4, tail: 2.4 }

// The desk items sit close together on screen; fan their pills apart so no
// two labels collide.
const FAN = { cv: 0, lamp: -28, mug: 28, pen: 56, cat: -26, tail: 26 }

// Only these pills are ever clickable.
const INTERACTIVE = new Set(['desk', 'vinyl', 'cat', 'tail'])

const FOUND_KINDS = ['cv', 'lamp', 'mug', 'pen']

function buildPill(kind) {
  const el = document.createElement('div')
  el.style.cssText =
    'position:absolute; left:0; top:0; transform:translate(-50%,-50%); display:flex; ' +
    'align-items:center; gap:9px; opacity:0; transition:opacity 420ms linear; pointer-events:none;'
  if (INTERACTIVE.has(kind)) el.style.cursor = 'pointer'

  const dot = document.createElement('span')
  const label = document.createElement('span')
  label.textContent = LABEL[kind] || kind

  if (kind === 'case') {
    dot.style.cssText =
      'position:relative; width:12px; height:12px; flex:none; border-radius:50%; ' +
      'background:#e8b86a; box-shadow:0 0 16px 4px rgba(232,184,106,.55);'
    label.style.cssText =
      "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.2em; " +
      'text-transform:uppercase; color:#14100a; white-space:nowrap; padding:5px 11px; ' +
      'border-radius:999px; background:rgba(232,184,106,.92);'
    const ring = document.createElement('span')
    ring.style.cssText =
      'position:absolute; inset:-5px; border-radius:50%; border:1px solid rgba(232,184,106,.8); ' +
      'animation:ringPulse 2.2s ease-out infinite;'
    dot.appendChild(ring)
  } else if (kind === 'tail') {
    dot.style.cssText =
      'position:relative; width:8px; height:8px; flex:none; border-radius:50%; ' +
      'background:#f0cf95; box-shadow:0 0 10px 3px rgba(240,207,149,.4);'
    label.style.cssText =
      "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.2em; " +
      'text-transform:uppercase; color:#f2dfb8; white-space:nowrap; padding:4px 9px; ' +
      'border-radius:999px; background:rgba(14,10,6,.62); border:1px solid rgba(203,160,102,.22); ' +
      'backdrop-filter:blur(4px);'
  } else {
    dot.style.cssText =
      'position:relative; width:10px; height:10px; flex:none; border-radius:50%; ' +
      'background:#f0cf95; box-shadow:0 0 12px 3px rgba(240,207,149,.45);'
    label.style.cssText =
      "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.2em; " +
      'text-transform:uppercase; color:#f2dfb8; white-space:nowrap; padding:4px 9px; ' +
      'border-radius:999px; background:rgba(14,10,6,.62); border:1px solid rgba(203,160,102,.22); ' +
      'backdrop-filter:blur(4px);'
    const ring = document.createElement('span')
    ring.style.cssText =
      'position:absolute; inset:-4px; border-radius:50%; border:1px solid rgba(240,207,149,.7); ' +
      `animation:ringPulse 2.6s ease-out ${RING_DELAY[kind] || '0s'} infinite;`
    dot.appendChild(ring)
  }

  el.appendChild(dot)
  el.appendChild(label)
  return { el, label }
}

export default class HotspotLayer {
  constructor(mount, THREE, { onDesk, onSkip, onSound, onVinyl, onCat, onTail } = {}) {
    this.mount = mount
    this.THREE = THREE
    this.onDesk = onDesk
    this.onSkip = onSkip
    this.onSound = onSound
    this.onVinyl = onVinyl
    this.onCat = onCat
    this.onTail = onTail

    this.anchors = [] // [{ kind, obj }]
    this.pills = {} // kind -> element, cached so update() never queries the DOM
    this.labels = {} // kind -> label span, so setLabel() never queries the DOM either
    this.found = {}
    this._v = new THREE.Vector3() // hoisted projection scratch — nothing allocated per frame
    this._listeners = []
    // kind -> half-width in px, measured lazily in update(). A pill's width
    // only changes when its label text changes or the viewport resizes, so
    // caching it avoids a forced-reflow read/write/read/write thrash across
    // the per-frame pill loop. Cleared in setLabel() and on 'resize'.
    this._pillHalf = {}

    this.el = document.createElement('div')
    this.el.style.cssText = 'position:absolute; inset:0; z-index:3; pointer-events:none;'
    mount.appendChild(this.el)

    this.tracker = this.buildTracker()
    this.el.appendChild(this.tracker.el)
    this.updateTracker()

    this.skipEl = document.createElement('div')
    this.skipEl.textContent = 'straight to the book →'
    this.skipEl.style.cssText =
      "position:absolute; right:28px; top:28px; z-index:5; cursor:pointer; opacity:0; " +
      'pointer-events:none; transition:opacity 500ms linear, color 200ms; ' +
      "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.22em; " +
      'text-transform:uppercase; color:#b9a37c; padding:8px 15px; border-radius:999px; ' +
      'background:rgba(12,9,6,.66); border:1px solid rgba(203,160,102,.2); backdrop-filter:blur(6px);'
    this._on(this.skipEl, 'click', (e) => {
      e.stopPropagation()
      if (this.onSkip) this.onSkip()
    })
    this.el.appendChild(this.skipEl)

    this.soundEl = document.createElement('div')
    this.soundEl.textContent = '○  sound off'
    this.soundEl.style.cssText =
      "position:absolute; right:28px; bottom:30px; z-index:5; cursor:pointer; opacity:0; " +
      'pointer-events:none; transition:opacity 500ms linear, color 200ms; ' +
      "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.22em; " +
      'text-transform:uppercase; color:#b9a37c; padding:8px 15px; border-radius:999px; ' +
      'background:rgba(12,9,6,.66); border:1px solid rgba(203,160,102,.2); backdrop-filter:blur(6px);'
    this._on(this.soundEl, 'click', (e) => {
      e.stopPropagation()
      if (this.onSound) this.onSound()
    })
    this.el.appendChild(this.soundEl)

    // Widths only change on resize (a pill's own text changes go through
    // setLabel(), which invalidates its single entry) — invalidate the whole
    // cache here rather than re-measuring every pill on every frame.
    this._on(window, 'resize', () => { this._pillHalf = {} })
  }

  // Reflects AmbientAudio's on/off state onto the chip's text and colour.
  // The engine calls this after AmbientAudio.toggle() so the chip stays in
  // sync whether it — or the in-book nav-pill toggle — was the one clicked.
  setSoundOn(on) {
    this.soundEl.textContent = on ? '●  rain · vinyl · room' : '○  sound off'
    this.soundEl.style.color = on ? '#f0dcb4' : '#b9a37c'
  }

  // Flips a pill's label text in place — the turntable uses this for the vinyl
  // pill's "now playing" / "drop the needle" flip, so callers never reach into
  // this layer's DOM to do it themselves.
  setLabel(kind, text) {
    const label = this.labels[kind]
    if (label) label.textContent = text
    delete this._pillHalf[kind] // text changed, so the pill's width did too
  }

  _on(target, type, fn) {
    target.addEventListener(type, fn)
    this._listeners.push([target, type, fn])
  }

  buildTracker() {
    const el = document.createElement('div')
    el.style.cssText =
      'position:absolute; left:28px; bottom:30px; z-index:4; display:flex; ' +
      'flex-direction:column; gap:9px; opacity:0; transition:opacity 500ms linear; ' +
      "pointer-events:none; font-family:'IBM Plex Mono',monospace;"

    const title = document.createElement('div')
    title.textContent = 'on the desk'
    title.style.cssText = 'font-size:10px; letter-spacing:.24em; text-transform:uppercase; color:#a08a63;'
    el.appendChild(title)

    const dotsRow = document.createElement('div')
    dotsRow.style.cssText = 'display:flex; gap:7px;'
    const dots = FOUND_KINDS.map(() => {
      const d = document.createElement('span')
      d.style.cssText =
        'width:8px; height:8px; border-radius:50%; border:1px solid rgba(203,160,102,.4); ' +
        'background:transparent; transition:background 300ms, border-color 300ms;'
      dotsRow.appendChild(d)
      return d
    })
    el.appendChild(dotsRow)

    const note = document.createElement('div')
    note.style.cssText = 'font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:#cba066;'
    note.textContent = '0 of 4 found'
    el.appendChild(note)

    return { el, dots, note }
  }

  updateTracker() {
    let n = 0
    FOUND_KINDS.forEach((k, i) => {
      const on = !!this.found[k]
      if (on) n++
      const d = this.tracker.dots[i]
      if (!d) return
      d.style.background = on ? '#e8b86a' : 'transparent'
      d.style.borderColor = on ? '#e8b86a' : 'rgba(203,160,102,.4)'
    })
    this.tracker.note.textContent = n >= 4 ? 'all four — now the shelf' : n + ' of 4 found'
  }

  // The turntable and cat modules call this for `vinyl`, `cat` and `tail`;
  // the engine calls it for the six anchors it owns right after buildStudy.
  addAnchor({ kind, obj }) {
    const { el: pill, label } = buildPill(kind)
    this.el.appendChild(pill)
    this.pills[kind] = pill
    this.labels[kind] = label
    this.anchors.push({ kind, obj })
    if (kind === 'desk') {
      this._on(pill, 'click', (e) => {
        e.stopPropagation()
        if (this.onDesk) this.onDesk()
      })
    } else if (kind === 'vinyl') {
      this._on(pill, 'click', (e) => {
        e.stopPropagation()
        if (this.onVinyl) this.onVinyl()
      })
    } else if (kind === 'cat') {
      this._on(pill, 'click', (e) => {
        e.stopPropagation()
        if (this.onCat) this.onCat()
      })
    } else if (kind === 'tail') {
      this._on(pill, 'click', (e) => {
        e.stopPropagation()
        if (this.onTail) this.onTail()
      })
    }
    return pill
  }

  // The engine calls this on each desk object used, so the tracker fills in
  // and the found item's pill stops competing for attention.
  setFound(kind) {
    this.found[kind] = true
    this.updateTracker()
  }

  update(ctx, { deskFocus, deskHover, caseHover }) {
    const live = ctx.room > 0.5 && ctx.arrive > 0.94

    this.tracker.el.style.opacity = live && !deskFocus ? '1' : '0'

    const skipOn = live && !deskFocus
    this.skipEl.style.opacity = skipOn ? '1' : '0'
    this.skipEl.style.pointerEvents = skipOn ? 'auto' : 'none'

    // Unlike the tracker/skip chip, SRC keeps the sound chip up through a
    // desk close-up too — it isn't gated on !deskFocus.
    this.soundEl.style.opacity = live ? '1' : '0'
    this.soundEl.style.pointerEvents = live ? 'auto' : 'none'

    const allFound = FOUND_KINDS.every((k) => this.found[k])
    const w = this.mount.clientWidth
    const h = this.mount.clientHeight
    const v = this._v

    for (let i = 0; i < this.anchors.length; i++) {
      const { kind, obj } = this.anchors[i]
      const el = this.pills[kind]
      if (!el) continue

      let on = live
      if (kind === 'case') on = on && !deskFocus
      else if (kind === 'desk') on = on && !deskFocus && !allFound
      else if (kind === 'vinyl') on = on && !deskFocus
      else if (kind === 'cat') on = on && !deskFocus && deskHover !== 'tail'
      else if (kind === 'tail') on = on && !deskFocus && deskHover === 'tail'
      else on = on && deskFocus && !this.found[kind]

      if (!on) {
        el.style.opacity = '0'
        el.style.pointerEvents = 'none'
        continue
      }

      if (kind === 'case') v.set(0, 3.2, 5.5)
      else if (kind === 'desk') v.set(-38, -1.5, 14)
      else {
        obj.getWorldPosition(v)
        v.y += Y_OFFSET[kind] !== undefined ? Y_OFFSET[kind] : 1.9
      }
      v.project(ctx.camera)

      if (v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 0.94) {
        el.style.opacity = '0'
        el.style.pointerEvents = 'none'
        continue
      }

      // clamp so the whole pill stays on screen, and flip the label to the
      // other side of its dot once it's pinned against the right edge.
      // offsetWidth is a forced-layout read; cache it per kind so the
      // per-pill loop below doesn't interleave reads and writes across
      // pills (each read-after-write forces a synchronous reflow).
      let half = this._pillHalf[kind]
      if (half === undefined) {
        half = (el.offsetWidth || 160) / 2
        this._pillHalf[kind] = half
      }
      const cx = Math.min(w - half - 12, Math.max(half + 12, (v.x * 0.5 + 0.5) * w))
      el.style.left = cx + 'px'
      const lowCap = cx > w - 260 ? h - 76 : h - 34 // clears the sound chip
      el.style.top = Math.min(lowCap, Math.max(28, (-v.y * 0.5 + 0.5) * h)) + 'px'
      el.style.flexDirection = (v.x * 0.5 + 0.5) * w > w - half - 12 ? 'row-reverse' : 'row'
      el.style.marginTop = (FAN[kind] || 0) + 'px'
      const hot = deskHover === kind || (kind === 'case' && caseHover)
      el.style.opacity = hot ? '1' : '0.72'
      el.style.pointerEvents = INTERACTIVE.has(kind) ? 'auto' : 'none'
    }
  }

  dispose() {
    this._listeners.forEach(([target, type, fn]) => target.removeEventListener(type, fn))
    this._listeners = []
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el)
  }
}
