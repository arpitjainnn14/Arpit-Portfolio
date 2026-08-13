import * as THREE from 'three'
import html2canvas from 'html2canvas'
import { SHEETS, SLUGS, LABELS, meta } from '../data/book'
import buildStudy from './buildStudy'
import buildBookcase, { CASE } from './buildBookcase'

// A direct port of the scene logic from the claude.ai/design source
// ("Arpit Jain - Book Portfolio 3D.dc.html"). Every constant, easing curve and
// light intensity is kept as authored so the motion matches the design exactly.
//
// Deliberately framework-free: React owns the DOM chrome and the offscreen
// pages, this class owns the canvas and the rAF loop.

export default class BookEngine {
  /**
   * @param {object} els  DOM nodes React handed over
   * @param {object} hooks { onIntroActive(bool), onHintDone(), onFail(msg) }
   */
  constructor(els, hooks = {}) {
    this.els = els
    this.hooks = hooks
    this.mount = els.mount
    this.pages = els.pages
    this.loader = els.loader
    this.counterEl = els.counter
    this.labelEl = els.label
    this.prevEl = els.prev
    this.nextEl = els.next
    this.vignette = els.vignette
    this.soundEl = els.sound

    this.SHEETS = SHEETS
    this.SLUGS = SLUGS
    this.LABELS = LABELS
    // One step past the last sheet: the book shuts and goes back on the shelf.
    this.MAXF = SHEETS + 1

    this.f = 0
    this.fx = 0
    this.yaw = 0
    this.yawT = 0
    this.pitch = 0
    this.pitchT = 0
    this.dead = false
    // Three stages: the study (roomStage) → the shelf → the open book.
    this.roomStage = true
    this.orbit = 0
    this.lightsOn = true
    this.sips = 0
    this.signProgress = 0
    this.listeners = []
    this.timers = []

    this.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (this.mount) {
      this.mount.setAttribute(
        'aria-label',
        'Interactive 3D book portfolio. The full text is available below for screen readers.'
      )
    }
  }

  start() {
    this.bindUI()
    this.boot()
  }

  // ——— teardown ———————————————————————————————————————————————

  destroy() {
    this.dead = true
    if (this.raf) cancelAnimationFrame(this.raf)
    this.listeners.forEach(([target, type, fn]) => target.removeEventListener(type, fn))
    this.listeners = []
    this.timers.forEach(clearTimeout)
    this.timers = []
    if (this.sheets) this.sheets.forEach((s) => s.geo.dispose())
    if (this.scene) {
      this.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        mats.forEach((m) => {
          if (m.map) m.map.dispose()
          m.dispose()
        })
      })
    }
    if (this.renderer) {
      this.renderer.dispose()
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
      }
    }
    if (this.actx && this.actx.state !== 'closed') this.actx.close()
    if (window.__book === this) delete window.__book
  }

  on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts)
    this.listeners.push([target, type, fn])
  }

  after(ms, fn) {
    const id = setTimeout(fn, ms)
    this.timers.push(id)
    return id
  }

  // ——— input —————————————————————————————————————————————————

  // Page-turn input is ignored while a desk interaction owns the screen —
  // otherwise scrolling the CV panel flips pages behind it.
  get inputBusy() {
    return this.deskFocus || !!(this.hooks.isCVOpen && this.hooks.isCVOpen())
  }

  bindUI() {
    this.onKey = (e) => {
      if (this.inputBusy) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') this.go(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this.go(-1)
    }
    this.acc = 0
    this.lock = 0
    this.onWheel = (e) => {
      if (this.inputBusy) return
      const now = Date.now()
      if (now < this.lock) return
      this.acc += e.deltaY
      if (Math.abs(this.acc) > 80) {
        this.go(this.acc > 0 ? 1 : -1)
        this.acc = 0
        this.lock = now + 520
      }
    }
    this.on(window, 'keydown', this.onKey)
    this.on(window, 'wheel', this.onWheel, { passive: true })

    if (this.prevEl) this.on(this.prevEl, 'click', () => this.go(-1))
    if (this.nextEl) this.on(this.nextEl, 'click', () => this.go(1))

    this.soundOn = false
    if (this.soundEl) {
      this.on(this.soundEl, 'click', (e) => {
        e.stopPropagation()
        this.soundOn = !this.soundOn
        this.soundEl.textContent = this.soundOn ? 'sound on' : 'sound off'
        this.soundEl.style.color = this.soundOn ? '#cba066' : '#6f6046'
        if (this.soundOn) this.rustle()
      })
    }

    this.on(window, 'hashchange', () => this.fromHash())

    // Escape walks back out: CV panel → desk close-up → book → shelf → room.
    this.on(window, 'keydown', (e) => {
      if (e.key !== 'Escape') return
      if (this.hooks.isCVOpen && this.hooks.isCVOpen()) {
        if (this.hooks.onCV) this.hooks.onCV(false)
        return
      }
      if (this.deskFocus) {
        this.deskFocus = false
        if (this.hooks.onAtDesk) this.hooks.onAtDesk(false)
        return
      }
      if (this.f > 0) {
        this.go(-this.f)
        if (this.hooks.onHintDone) this.hooks.onHintDone(false)
      } else if (!this.roomStage) {
        this.roomStage = true
        if (this.hooks.onAtShelf) this.hooks.onAtShelf(false)
        if (this.hooks.onHintDone) this.hooks.onHintDone(false)
      }
    })

    if (this.mount) {
      // drag anywhere to orbit — clamped in step() so it can't pass the walls
      this.on(this.mount, 'pointerdown', (e) => {
        this.dragging = true
        this.dragX = e.clientX
        this.dragMoved = 0
      })
      this.on(window, 'pointerup', () => { this.dragging = false })
      this.on(window, 'pointermove', (e) => {
        if (!this.dragging) return
        const dx = e.clientX - this.dragX
        this.dragX = e.clientX
        this.dragMoved += Math.abs(dx)
        this.orbit = Math.max(-1.15, Math.min(1.15, (this.orbit || 0) - dx * 0.0055))
      })

      this.on(this.mount, 'click', (e) => {
        if (this.dragMoved > 8) { this.dragMoved = 0; return } // that was a drag
        if (this.roomStage) {
          if (this.deskHover) { this.deskAction(this.deskHover); return }
          if (this.deskFocus) {
            this.deskFocus = false
            if (this.hooks.onAtDesk) this.hooks.onAtDesk(false)
            return
          }
          if (this.caseHover) {
            this.roomStage = false
            if (this.hooks.onAtShelf) this.hooks.onAtShelf(true)
            this.rustle()
          }
          return
        }
        if (this.f === 0 && !this.hovering) return
        const r = this.mount.getBoundingClientRect()
        this.go(this.f === 0 || e.clientX - r.left > r.width * 0.42 ? 1 : -1)
      })
      this.on(this.mount, 'pointermove', (e) => {
        const r = this.mount.getBoundingClientRect()
        this.yawT = ((e.clientX - r.left) / r.width - 0.5) * 0.5
        this.pitchT = ((e.clientY - r.top) / r.height - 0.5) * 0.22
        this.ndc = {
          x: ((e.clientX - r.left) / r.width) * 2 - 1,
          y: -(((e.clientY - r.top) / r.height) * 2 - 1),
        }
      })
      this.on(this.mount, 'pointerleave', () => {
        this.yawT = 0
        this.pitchT = 0
      })
    }
  }

  // ——— page-turn sound ————————————————————————————————————————

  rustle() {
    if (!this.soundOn) return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      this.actx = this.actx || new AC()
      const ctx = this.actx
      if (ctx.state === 'suspended') ctx.resume()
      if (!this.noise) {
        const len = Math.floor(ctx.sampleRate * 0.5)
        this.noise = ctx.createBuffer(1, len, ctx.sampleRate)
        const d = this.noise.getChannelData(0)
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
      }
      const src = ctx.createBufferSource()
      src.buffer = this.noise
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.Q.value = 0.8
      const t = ctx.currentTime
      bp.frequency.setValueAtTime(900, t)
      bp.frequency.exponentialRampToValueAtTime(3200, t + 0.26)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
      src.connect(bp)
      bp.connect(g)
      g.connect(ctx.destination)
      src.start(t)
      src.stop(t + 0.5)
    } catch {
      /* audio is a nicety */
    }
  }

  // ——— navigation ————————————————————————————————————————————

  fromHash() {
    const s = (window.location.hash || '').replace('#', '')
    const i = this.SLUGS.indexOf(s)
    if (i < 0 || i === this.f) return
    // A deep link means "take me to that spread", so step past the room rather
    // than depositing the reader in front of the bookcase.
    if (this.roomStage && i > 0) {
      this.roomStage = false
      if (this.hooks.onAtShelf) this.hooks.onAtShelf(true)
    }
    this.go(i - this.f)
  }

  go(d) {
    // From the room, a forward step walks the camera to the shelf.
    if (this.roomStage) {
      if (d > 0) {
        this.roomStage = false
        if (this.hooks.onAtShelf) this.hooks.onAtShelf(true)
        this.rustle()
      }
      return
    }
    const n = Math.min(this.MAXF, Math.max(0, this.f + d))
    if (n === this.f) return
    this.f = n
    this.pump()
    this.rustle()
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + this.SLUGS[n])
    }
    if (this.counterEl) {
      this.counterEl.textContent =
        String(n + 1).padStart(2, '0') + ' / ' + String(this.MAXF + 1).padStart(2, '0')
    }
    if (this.labelEl) this.labelEl.textContent = this.LABELS[n]
    if (this.prevEl) this.prevEl.style.opacity = n > 0 ? '1' : '.3'
    if (this.nextEl) this.nextEl.style.opacity = n < this.MAXF ? '1' : '.3'
    if (this.hooks.onHintDone) this.hooks.onHintDone()
  }

  // ——— boot ——————————————————————————————————————————————————

  async boot() {
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready
      if (this.dead) return

      const faces = Array.from(this.pages.querySelectorAll('[data-face]'))
      // The design used *1.1. Pages are read at an angle, so the texture needs
      // headroom above its on-screen size or the type goes soft — 700px wide
      // faces rasterise to ~2450px here.
      const scale = Math.min(2, window.devicePixelRatio || 1) * 1.75
      const opts = { scale, backgroundColor: null, logging: false, useCORS: true }

      const ph = document.createElement('canvas')
      ph.width = 8
      ph.height = 8
      const pg = ph.getContext('2d')
      pg.fillStyle = '#f5eedd'
      pg.fillRect(0, 0, 8, 8)

      // Rasterise what the reader sees first; the rest streams in behind them.
      const first = [0, 1, 2, 3, 10]
      const canvases = new Array(faces.length).fill(ph)
      for (const i of first) canvases[i] = await html2canvas(faces[i], opts)
      if (this.dead) return

      this.buildScene(canvases)
      this.faceEls = faces
      this.rOpts = opts
      this.pending = []
      for (let i = 0; i < faces.length; i++) if (first.indexOf(i) === -1) this.pending.push(i)
      this.pump()
      this.paintCVSheet(opts)

      if (this.loader) {
        this.loader.style.opacity = '0'
        this.after(700, () => {
          if (this.loader) this.loader.style.display = 'none'
        })
      }
      this.startIntro()
      this.fromHash()
    } catch (err) {
      console.error('3D book failed to build:', err)
      if (this.hooks.onFail) this.hooks.onFail(err)
    }
  }

  tex(canvas) {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    // Anisotropic filtering is what keeps text legible on a surface tilted away
    // from the camera. The design hard-coded 8; ask the GPU for its ceiling
    // (usually 16) since every page is viewed at an angle.
    t.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 8
    t.needsUpdate = true
    return t
  }

  startIntro() {
    // ?intro=1 replays the entrance regardless — it's meant to be seen once per
    // visitor, which makes it awkward to look at while you're building it.
    const always = new URLSearchParams(window.location.search).get('intro') === '1'
    let seen = false
    try {
      seen = localStorage.getItem('ajBookIntroSeen') === '1'
    } catch {
      /* private mode */
    }
    if ((!always && seen) || this.reduced || (!always && window.location.hash)) {
      this.intro = 1
      return
    }
    // The engine owns only the camera arrival (`this.intro`, eased in step()).
    // The title card itself is DOM, so React drives it — animating it
    // imperatively from here fights React's own style reconciliation.
    this.intro = 0
    this.introT = 0
    const phase = (n) => { if (this.hooks.onIntroPhase) this.hooks.onIntroPhase(n) }
    if (this.hooks.onIntroActive) this.hooks.onIntroActive(true)
    phase(0)
    this.after(260, () => phase(1)) // name rises
    this.after(1500, () => phase(2)) // subtitle joins it
    this.after(3600, () => phase(3)) // everything dissolves into the room
    this.after(4700, () => {
      if (this.hooks.onIntroActive) this.hooks.onIntroActive(false)
      try {
        localStorage.setItem('ajBookIntroSeen', '1')
      } catch {
        /* fine */
      }
    })
  }

  // Print the CV onto the loose papers on the desk. Fire-and-forget: it's a
  // background detail, so it must never hold up the book.
  async paintCVSheet(opts) {
    const el = this.pages && this.pages.querySelector('[data-cvsheet]')
    if (!el || !this.cvSheetMat) return
    try {
      const canvas = await html2canvas(el, opts)
      if (this.dead) return
      this.cvSheetMat.map = this.tex(canvas)
      this.cvSheetMat.needsUpdate = true
    } catch {
      /* the blank sheet is a fine fallback */
    }
  }

  // ——— desk interactions ——————————————————————————————————————

  // Every desk click first moves the camera into a close-up, then acts.
  deskAction(kind) {
    this.deskFocus = true
    if (this.hooks.onAtDesk) this.hooks.onAtDesk(true)

    if (kind === 'cv') {
      clearTimeout(this._cvT)
      // Registered with `after` so destroy() cancels it — otherwise an unmount
      // during the 900ms camera move fires setState on a dead component.
      this._cvT = this.after(900, () => {
        if (!this.dead && this.hooks.onCV) this.hooks.onCV(true)
      })
      return
    }
    if (kind === 'lamp') {
      this.lightsOn = !this.lightsOn
      return
    }
    if (kind === 'mug') {
      this.sips = Math.min(4, (this.sips || 0) + 1)
      return
    }
    if (kind === 'pen') {
      // second click wipes the signature
      if (this.signProgress > 0) { this.signProgress = 0; return }
      this.ensureSignFont().then(() => { this.signProgress = 0.0001 })
    }
  }

  // The script face must be loaded before measureText is meaningful.
  ensureSignFont() {
    if (this._signFontP) return this._signFontP
    this._signFontP =
      document.fonts && document.fonts.load
        ? document.fonts.load('190px "Mrs Saint Delafield"').catch(() => null)
        : Promise.resolve(null)
    return this._signFontP
  }

  // Ink the name across the desk book, revealed left to right by a clip rect.
  drawSignature(p) {
    const c = this.signCanvas
    const g = c.getContext('2d')
    g.clearRect(0, 0, c.width, c.height)
    const pad = 40
    const avail = c.width - pad * 2
    let size = 190
    g.font = size + 'px "Mrs Saint Delafield", cursive'
    const w0 = g.measureText(meta.name).width || avail
    if (w0 > avail) {
      // derive the size from the measurement so it always fits
      size = Math.max(60, Math.floor((size * avail) / w0))
      g.font = size + 'px "Mrs Saint Delafield", cursive'
    }
    const inkW = g.measureText(meta.name).width
    const x0 = (c.width - inkW) / 2
    const baseY = 300
    g.save()
    g.beginPath()
    g.rect(0, 0, x0 + inkW * Math.min(1, p) + 6, c.height)
    g.clip()
    g.fillStyle = 'rgba(28,22,44,.9)'
    g.textBaseline = 'alphabetic'
    g.fillText(meta.name, x0, baseY)
    g.restore()
    if (p >= 1) {
      g.strokeStyle = 'rgba(28,22,44,.4)'
      g.lineWidth = 3
      g.beginPath()
      g.moveTo(x0 - 4, baseY + 64)
      g.lineTo(x0 + inkW + 4, baseY + 56)
      g.stroke()
    }
    this.signTex.needsUpdate = true
  }

  // Rasterise remaining faces, always picking the one nearest to where the
  // reader is currently looking.
  async pump() {
    if (this.pumping || !this.pending || !this.pending.length) return
    this.pumping = true
    while (this.pending.length && !this.dead) {
      let best = 0
      let bestD = Infinity
      for (let k = 0; k < this.pending.length; k++) {
        const d = Math.abs(Math.floor(this.pending[k] / 2) - this.f)
        if (d < bestD) {
          bestD = d
          best = k
        }
      }
      const i = this.pending.splice(best, 1)[0]
      try {
        this.setFace(i, await html2canvas(this.faceEls[i], this.rOpts))
      } catch {
        /* keep placeholder */
      }
      // rAF stalls in background tabs — race it with a timer so the queue keeps draining
      await new Promise((r) => {
        let done = false
        const go = () => {
          if (!done) {
            done = true
            r()
          }
        }
        requestAnimationFrame(go)
        setTimeout(go, 60)
      })
    }
    this.pumping = false
  }

  setFace(i, canvas) {
    const entry = this.faceSlots && this.faceSlots[i]
    if (!entry || !canvas) return
    // A face can drive more than one material (the back plate is on both sides
    // of the back board), so normalise to a list.
    const slots = Array.isArray(entry) ? entry : [entry]
    for (const slot of slots) {
      const t = this.tex(canvas)
      if (slot.mirror) {
        t.wrapS = THREE.RepeatWrapping
        t.repeat.x = -1
        t.offset.x = 1
      }
      if (slot.mat.map) slot.mat.map.dispose()
      slot.mat.map = t
      slot.mat.needsUpdate = true
    }
  }

  // ——— scene —————————————————————————————————————————————————

  buildScene(canvases) {
    const T = THREE
    this.faceSlots = []
    const W = 7, H = 9, COLS = 46
    this.W = W
    this.H = H
    this.COLS = COLS

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    // The design capped at 1.6, which renders below native on a Retina display
    // and softens everything. Render at full density instead.
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = T.PCFSoftShadowMap
    renderer.toneMapping = T.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.34
    renderer.outputColorSpace = T.SRGBColorSpace
    this.mount.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    this.renderer = renderer

    const scene = new T.Scene()
    this.scene = scene
    const camera = new T.PerspectiveCamera(34, 1, 0.1, 200)
    this.camera = camera

    scene.add(new T.HemisphereLight(0xffe6c2, 0x24190d, 1.45))
    // Raised from the design's 0.9 — this is what lifts the key light's
    // self-shadow off the open spread so the page underneath stays readable.
    const fill = new T.DirectionalLight(0xfff0d8, 1.45)
    fill.position.set(6, 10, 14)
    scene.add(fill)
    const key = new T.DirectionalLight(0xffe3b4, 2.6)
    this.key = key
    this.keyFull = 2.6
    key.position.set(-9, 17, 10)
    key.castShadow = true
    // The frustum has to cover the whole study, or the room casts a hard black
    // polygon on the back wall where the shadow map runs out.
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.radius = 8
    key.shadow.camera.left = -60
    key.shadow.camera.right = 60
    key.shadow.camera.top = 60
    key.shadow.camera.bottom = -60
    key.shadow.camera.near = 1
    key.shadow.camera.far = 200
    key.shadow.camera.updateProjectionMatrix()
    key.shadow.bias = -0.0012
    scene.add(key)
    const rim = new T.PointLight(0xc98b3f, 30, 60)
    rim.position.set(10, 6, -10)
    scene.add(rim)

    const floor = new T.Mesh(
      new T.PlaneGeometry(200, 200),
      new T.MeshStandardMaterial({ color: 0x140e08, roughness: 0.98 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -17.2
    floor.receiveShadow = true
    scene.add(floor)

    // — the bookcase and its neighbours —
    buildBookcase(scene, (c) => this.tex(c))
    const { w: caseW, h: caseH, d: caseD } = CASE

    // ——— the study around the bookcase ———————————————————————
    const trimMat = new T.MeshStandardMaterial({ color: 0x231810, roughness: 0.9 })
    const study = buildStudy(scene, (c) => this.tex(c), { trim: trimMat, caseW, caseH, caseD })
    Object.assign(this, study)

    const lamp = new T.PointLight(0xffbe76, 90, 60, 2)
    lamp.position.set(-4, 16, 16)
    scene.add(lamp)
    this.lamp = lamp
    this.lampFull = 90
    const glow = new T.PointLight(0xffd9a0, 26, 26, 2)
    glow.position.set(3.5, 0, 9)
    scene.add(glow)
    this.bookGlow = glow

    // — the book —
    const book = new T.Group()
    scene.add(book)
    this.book = book

    const boardMat = new T.MeshStandardMaterial({ color: 0x181109, roughness: 0.82 })
    const boardGeo = new T.BoxGeometry(W, 0.3, H + 0.4)
    this.frontBoard = new T.Group()
    const fb = new T.Mesh(new T.BoxGeometry(W + 0.2, 0.26, H + 0.4), boardMat)
    fb.position.set((W + 0.2) / 2 - 0.08, -0.22, 0)
    fb.castShadow = true
    fb.receiveShadow = true
    this.frontBoard.add(fb)
    this.fbMesh = fb
    book.add(this.frontBoard)

    // The back board carries the same plate on both faces: the +Y face is the
    // inside back you see with the book open, the -Y face becomes the outward
    // back cover once the board swings shut at the end. Box UVs already read the
    // right way round on both, so one material serves both.
    const insideBackMat = new T.MeshStandardMaterial({ map: this.tex(canvases[10]), roughness: 0.78 })
    this.faceSlots[10] = { mat: insideBackMat, mirror: false }

    const rightMats = [boardMat, boardMat, insideBackMat, insideBackMat, boardMat, boardMat]
    // Wrapped in a group pivoted at the spine so it can hinge like a real board.
    this.backBoard = new T.Group()
    const rightBoard = new T.Mesh(boardGeo, rightMats)
    rightBoard.position.set(W / 2 + 0.06, -0.2, 0)
    rightBoard.castShadow = true
    rightBoard.receiveShadow = true
    this.rbMesh = rightBoard
    this.backBoard.add(rightBoard)
    book.add(this.backBoard)

    const spine = new T.Mesh(new T.BoxGeometry(0.5, 0.34, H + 0.4), boardMat)
    spine.position.set(0, -0.2, 0)
    spine.castShadow = true
    book.add(spine)

    this.sheets = []
    for (let i = 0; i < this.SHEETS; i++) {
      const geo = new T.PlaneGeometry(W, H, COLS, 1)
      const frontMap = this.tex(canvases[i * 2])
      const backCanvasTex = this.tex(canvases[i * 2 + 1])
      backCanvasTex.wrapS = T.RepeatWrapping
      backCanvasTex.repeat.x = -1
      backCanvasTex.offset.x = 1
      const front = new T.Mesh(
        geo,
        new T.MeshStandardMaterial({
          map: frontMap,
          roughness: i === 0 ? 0.42 : 0.9,
          metalness: i === 0 ? 0.22 : 0,
          side: T.FrontSide,
        })
      )
      const back = new T.Mesh(
        geo,
        new T.MeshStandardMaterial({ map: backCanvasTex, roughness: 0.9, side: T.BackSide })
      )
      front.castShadow = true
      back.castShadow = true
      front.receiveShadow = true
      back.receiveShadow = true
      book.add(front)
      book.add(back)
      this.faceSlots[i * 2] = { mat: front.material, mirror: false }
      this.faceSlots[i * 2 + 1] = { mat: back.material, mirror: true }
      this.sheets.push({ geo, front, back })
    }

    // — dust in the lamplight —
    const dustGeo = new T.BufferGeometry()
    const N = 180
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26
      pos[i * 3 + 1] = Math.random() * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    dustGeo.setAttribute('position', new T.BufferAttribute(pos, 3))
    this.dust = new T.Points(
      dustGeo,
      new T.PointsMaterial({ color: 0xffd9a0, size: 0.04, transparent: true, opacity: 0.3, depthWrite: false })
    )
    scene.add(this.dust)

    this.onResize = () => {
      const w = this.mount.clientWidth
      const h = this.mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    this.on(window, 'resize', this.onResize)
    this.onResize()

    this.glint = new T.PointLight(0xffe6b0, 22, 18, 2)
    this.glint.position.set(-3, 4, 8)
    scene.add(this.glint)
    this.clock = new T.Clock()
    this.frames = 0
    window.__book = this // debug handle, as in the design source
    this.loop()
  }

  // Bend one sheet: walk the width in COLS steps, turning by a base angle plus a
  // sine bulge, so the page curls rather than folding flat.
  updateSheet(s, a) {
    const W = this.W, COLS = this.COLS
    const base = Math.min(1, Math.max(0, a)) * Math.PI
    const amp = Math.sin(Math.min(1, Math.max(0, a)) * Math.PI) * 0.62
    // Reused across every sheet, every frame — allocating these here was ~600
    // throwaway typed arrays a second.
    if (!this._xs) {
      this._xs = new Float32Array(COLS + 1)
      this._ys = new Float32Array(COLS + 1)
    }
    const xs = this._xs
    const ys = this._ys
    const step = W / COLS
    let x = 0, y = 0
    xs[0] = 0
    ys[0] = 0
    for (let c = 1; c <= COLS; c++) {
      const u = (c - 0.5) / COLS
      const th = base + amp * Math.sin(Math.PI * u)
      x += Math.cos(th) * step
      y += Math.sin(th) * step
      xs[c] = x
      ys[c] = y
    }
    const arr = s.geo.attributes.position.array
    const rows = 2
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= COLS; c++) {
        const idx = (r * (COLS + 1) + c) * 3
        arr[idx] = xs[c]
        arr[idx + 1] = ys[c] + 0.002 * c
        arr[idx + 2] = r === 0 ? -this.H / 2 : this.H / 2
      }
    }
    s.geo.attributes.position.needsUpdate = true
    s.geo.computeVertexNormals()
  }

  loop() {
    if (this.dead) return
    this.raf = requestAnimationFrame(() => this.loop())
    this.step()
  }

  step() {
    if (this.dead || !this.renderer) return
    const dt = Math.min(0.05, this.clock.getDelta())
    if (this.reduced) this.fx = this.f
    else this.fx += (this.f - this.fx) * Math.min(1, dt * 6.5)

    for (let i = 0; i < this.SHEETS; i++) {
      const s = this.sheets[i]
      const a = Math.min(1, Math.max(0, this.fx - i))
      const lift = a < 0.5 ? 0.032 * (this.SHEETS - i) : 0.032 * (i + 1)
      this.updateSheet(s, a)
      s.front.position.y = lift
      s.back.position.y = lift
      if (i === 0 && this.frontBoard) {
        this.frontBoard.rotation.z = a * Math.PI
        this.fbMesh.position.y = -0.22 * Math.cos(a * Math.PI)
      }
    }

    // hover test — the bookcase and desk objects in the room, the book at the shelf
    if (this.ndc && this.f === 0 && this.intro >= 0.98) {
      this.ray = this.ray || new THREE.Raycaster()
      this._ndc2 = this._ndc2 || new THREE.Vector2()
      this.ray.setFromCamera(this._ndc2.set(this.ndc.x, this.ndc.y), this.camera)
      if (this.roomStage) {
        this.hovering = false
        const dh = this.deskHits ? this.ray.intersectObjects(this.deskHits, false) : []
        this.deskHover = dh.length ? dh[0].object.userData.deskKind : null
        this.caseHover =
          !this.deskHover && this.caseHit
            ? this.ray.intersectObject(this.caseHit, false).length > 0
            : false
        this.mount.style.cursor = this.caseHover || this.deskHover ? 'pointer' : 'default'
        // desk objects answer a hover with a warm emissive glow
        if (this.deskTargets) {
          for (const t of this.deskTargets) {
            const on = this.deskHover === t.kind
            t.tint.forEach((m) => {
              if (!m.emissive) return
              m.emissive.setHex(0xffcf8a)
              m.emissiveIntensity =
                (m.emissiveIntensity || 0) +
                ((on ? 0.42 : 0) - (m.emissiveIntensity || 0)) * Math.min(1, dt * 9)
            })
          }
        }
      } else {
        this.caseHover = false
        this.deskHover = null
        this.hovering = this.ray.intersectObject(this.book, true).length > 0
        this.mount.style.cursor = this.hovering ? 'pointer' : 'default'
      }
    } else if (this.f !== 0) {
      this.hovering = false
      this.mount.style.cursor = 'pointer'
    }

    this.yaw += (this.yawT - this.yaw) * Math.min(1, dt * 4)
    this.pitch += (this.pitchT - this.pitch) * Math.min(1, dt * 4)
    const auto = this.autoRotate ? Math.sin(this.clock.elapsedTime * 0.25) * 0.18 : 0
    this.book.rotation.y = this.yaw * 0.5 + auto

    if (this.intro === undefined) this.intro = 1
    if (this.intro < 1) {
      this.introT = (this.introT || 0) + dt
      const a = Math.min(1, Math.max(0, (this.introT - 0.5) / 3.6))
      this.intro = a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2
    }
    const arrive = this.intro
    if (this.lamp) this.lamp.intensity = this.lampFull * (0.06 + 0.94 * Math.min(1, arrive * 1.4))

    // The closing act: past the last sheet, the back board hinges over the page
    // block and the book settles back into its slot.
    const closeT = Math.min(1, Math.max(0, this.fx - this.SHEETS))
    const closeE = closeT < 0.5 ? 4 * closeT * closeT * closeT : 1 - Math.pow(-2 * closeT + 2, 3) / 2
    if (this.backBoard) {
      this.backBoard.rotation.z = closeE * Math.PI
      // Sink it as it swings so it lands cleanly on top of the turned pages
      // instead of intersecting them.
      this.rbMesh.position.y = -0.2 - 0.42 * closeE
    }

    // lift off the shelf and open into reading position
    const SHELF_Y = -0.8, READ_Y = 0.6, READ_Z = 8.5, EL_READ = 0.14, EL_SHELF = 0.1
    const rawPick = Math.min(1, Math.max(0, this.fx * 2.2))
    // (1 - closeE) walks the whole pick-up animation backwards as it shuts.
    const pick = (1 - Math.pow(1 - rawPick, 3)) * (1 - closeE)
    this._hoverEase =
      (this._hoverEase || 0) +
      (((this.hovering && this.f === 0) ? 1 : 0) - (this._hoverEase || 0)) * Math.min(1, dt * 8)
    // Closed at the end, the page block sits on the far side of the spine, so
    // slide the group by one page width to put it back in its slot on the shelf.
    this.book.position.x = closeE * this.W
    this.book.position.y = SHELF_Y + pick * (READ_Y - SHELF_Y)
    this.book.position.z = pick * READ_Z + (1 - pick) * this._hoverEase * 1.1
    this.book.rotation.x = Math.PI / 2 - pick * (EL_READ + 0.07)

    const spreadX = this.fx > this.SHEETS - 0.5 ? -this.W / 2 : this.fx < 0.5 ? this.W / 2 : 0
    const targetX = spreadX * pick
    const aspect = this.camera.aspect
    const tanHalf = Math.tan((this.camera.fov * Math.PI / 180) / 2)
    const needW = 33 + pick * (this.W * 2 + 3 - 33)
    const needH = 23 + pick * (this.H * 1.02 + 4.6 - 23)

    // `room` eases 1 → 0 as the reader walks from the study to the bookcase.
    const roomTarget = this.roomStage ? 1 : 0
    if (this._room === undefined) this._room = 1
    this._room += (roomTarget - this._room) * Math.min(1, dt * 2.1)
    const room = this.reduced ? roomTarget : this._room
    if (this.deskGlow) this.deskGlow.intensity = 40 * Math.min(1, arrive * 1.4) * (0.25 + 0.75 * room)

    const dist =
      Math.max(needH / (2 * tanHalf), needW / (2 * tanHalf * aspect)) *
      1.06 * (1 + (1 - arrive) * 0.62) * (1 + room * 1.75)
    if (this.reduced) {
      this._tx = targetX
      this._d = dist
    } else {
      this._tx = this._tx === undefined ? targetX : this._tx + (targetX - this._tx) * Math.min(1, dt * 3)
      this._d = this._d === undefined ? dist : this._d + (dist - this._d) * Math.min(1, dt * 2.2)
    }
    const focusY = SHELF_Y + pick * (READ_Y - SHELF_Y) - room * 4.6
    const focusZ = pick * READ_Z + room * 3
    const el = EL_SHELF + pick * (EL_READ - EL_SHELF) - this.pitch + (1 - arrive) * 0.16 + room * 0.04
    const camX = this._tx * 0.3 - room * 6
    const radius = this._d * Math.cos(el)
    // Cap the orbit against the side walls rather than at a fixed angle, so the
    // swing stays generous when the camera is close and tightens when it's far.
    const maxSide = 40
    const maxAngle = Math.min(0.42, Math.asin(Math.min(1, maxSide / Math.max(1, radius * 0.9))))
    const orbit = Math.max(-maxAngle, Math.min(maxAngle, (this.orbit || 0) * (0.5 + 0.5 * room)))
    let px = camX + Math.sin(orbit) * radius * 0.9
    let py = focusY + this._d * Math.sin(el)
    let pz = focusZ + Math.cos(orbit) * radius
    let lx = this._tx - room * 4
    let ly = focusY
    let lz = focusZ

    // desk close-up, blended in on top of whatever the room camera is doing
    const dfT = this.deskFocus ? 1 : 0
    this._df = this._df === undefined ? 0 : this._df + (dfT - this._df) * Math.min(1, dt * 2.6)
    const df = this.reduced ? dfT : this._df
    if (df > 0.001) {
      const DX = -38, DY = -5.4, DZ = 14
      const dEl = 0.62 - this.pitch * 0.5
      const dYaw = 0.34 + (this.orbit || 0) * 0.5
      const dDist = 24
      px += (DX + Math.sin(dYaw) * dDist * Math.cos(dEl) - px) * df
      py += (DY + dDist * Math.sin(dEl) - py) * df
      pz += (DZ + Math.cos(dYaw) * dDist * Math.cos(dEl) - pz) * df
      lx += (DX - lx) * df
      ly += (DY - ly) * df
      lz += (DZ - lz) * df
    }
    this.camera.position.set(px, py, pz)
    this.camera.lookAt(lx, ly, lz)

    if (this.vignette) this.vignette.style.opacity = String(pick * 0.92)
    if (this.glint) {
      const sweep = (this.clock.elapsedTime % 7) / 7
      this.glint.position.set(-5 + sweep * 16, 3.4, 7.5)
      this.glint.intensity = (1 - pick) * 26 * Math.sin(sweep * Math.PI)
    }
    if (this.bookGlow) {
      // On the shelf the glow sits to the right, over the book's slot. Slide it
      // to the gutter as the book opens so both pages are lit evenly.
      this.bookGlow.position.set(3.5 * (1 - pick), focusY + 1, focusZ + 7)
      // The design faded this out as the book opened (`- pick * 10`), which is
      // exactly when you need light on the page. Brighten into reading instead.
      this.bookGlow.intensity = 18 + this._hoverEase * 26 + pick * 30
    }

    const dp = this.dust.geometry.attributes.position.array
    for (let i = 1; i < dp.length; i += 3) {
      dp[i] += dt * 0.16
      if (dp[i] > 12) dp[i] = 0
    }
    this.dust.geometry.attributes.position.needsUpdate = true

    // ——— lamp switch: the whole room dims, the bulb with it ———
    const lit = this.lightsOn === false ? 0 : 1
    this._lit = this._lit === undefined ? 1 : this._lit + (lit - this._lit) * Math.min(1, dt * 3.4)
    if (this.key) this.key.intensity = this.keyFull * (0.12 + 0.88 * this._lit)
    if (this.bookGlow) this.bookGlow.intensity *= 0.2 + 0.8 * this._lit
    if (this.lamp) this.lamp.intensity *= 0.14 + 0.86 * this._lit
    if (this.bulb) this.bulb.material.emissiveIntensity = 0.18 + 2.1 * this._lit
    if (this.deskGlow) this.deskGlow.intensity *= 0.08 + 0.92 * this._lit

    // ——— the mug: four sips, then an empty cup and a ring stain ———
    if (this.coffee) {
      const s = this.sips || 0
      this.coffee.position.y = this.coffeeTop - s * 0.44
      this.coffee.visible = s < 4
      if (this.crema) this.crema.material.opacity = 0.5 * (1 - s / 4)
      if (this.stain) this.stain.material.opacity = s >= 4 ? 0.72 : 0
    }

    // ——— the pen inking a signature across the desk book ———
    if (this.signProgress > 0 && this.signProgress < 1) {
      this.signProgress = Math.min(1, this.signProgress + dt * 0.55)
      this.drawSignature(this.signProgress)
      if (this.signPlane) this.signPlane.material.opacity = 1
    } else if (this.signProgress === 0 && this.signPlane && this.signPlane.material.opacity > 0) {
      this.signPlane.material.opacity = Math.max(0, this.signPlane.material.opacity - dt * 2)
    }

    // ——— steam, thinning as the cup empties ———
    if (this.steam) {
      const near = (0.35 + 0.65 * room) * (1 - (this.sips || 0) / 4)
      for (const p of this.steam) {
        p.t += dt * 0.19
        if (p.t > 1) p.t -= 1
        const t = p.t
        p.sp.position.set(
          p.x0 + Math.sin(p.sway + t * 5.2) * (0.22 + t * 0.7),
          p.y0 + t * 5.2,
          p.z0 + Math.cos(p.sway * 1.3 + t * 4.1) * (0.18 + t * 0.5)
        )
        p.sp.scale.setScalar(0.55 + t * 2.5)
        p.sp.material.opacity =
          Math.sin(Math.min(1, t / 0.85) * Math.PI) * 0.32 * near * Math.min(1, arrive * 1.2)
      }
    }

    this.frames++
    this.renderer.render(this.scene, this.camera)
  }
}
