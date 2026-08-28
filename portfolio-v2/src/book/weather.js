// Time-of-day lighting and the rain/lightning that plays across the study
// windows. Transcribed from the claude.ai/design source (SRC:767–855,
// SRC:2289–2301) — every value kept as authored.
//
// `createWeather` owns the two off-screen canvases (`skyBase`, `winCanvas`)
// and the texture both study windows sample. It does not touch the scene
// graph itself — `study/windows.js` builds the meshes/lights and hands this
// module the handles it needs to drive them via `deps`.

// Four phase records keyed by hour of day. Transcribed verbatim from
// SRC:767–780 — do not round or reinterpret.
export function dayPhase() {
  const d = new Date()
  const h = d.getHours() + d.getMinutes() / 60
  if (h >= 5 && h < 8) {
    return {
      key: 'dawn',
      sky: ['#2a3350', '#6b5a72', '#d8927a', '#f0c39a', '#f6dcc0'],
      sun: 0xffb27a, sunI: 0.95, hemi: 1.25, exposure: 1.22,
      pool: 0xffb98a, poolA: 0.4, lamp: 0.8, night: 0,
    }
  }
  if (h >= 8 && h < 16.5) {
    return {
      key: 'day',
      sky: ['#5b7fa8', '#8aa7c1', '#b7c6d3', '#d6dad6', '#e6e2d4'],
      sun: 0xfff4e2, sunI: 1.7, hemi: 1.85, exposure: 1.24,
      pool: 0xfff0d2, poolA: 0.5, lamp: 0.45, night: 0,
    }
  }
  if (h >= 16.5 && h < 20) {
    return {
      key: 'dusk',
      sky: ['#33456a', '#7f6f8c', '#d99a5c', '#f2cd8e', '#f8e3b6'],
      sun: 0xffc98a, sunI: 1.15, hemi: 1.4, exposure: 1.24,
      pool: 0xffce8c, poolA: 0.45, lamp: 0.9, night: 0.3,
    }
  }
  return {
    key: 'night',
    sky: ['#0c1320', '#1a2434', '#2b3345', '#383f4e', '#444954'],
    sun: 0x7f9ccc, sunI: 0.34, hemi: 0.82, exposure: 1.32,
    pool: 0x8fb0e0, poolA: 0.22, lamp: 1, night: 1,
  }
}

// `tex` is the engine's `(canvas) => THREE.CanvasTexture` helper (already
// bound to the renderer for anisotropy). `mobile` selects the rain redraw
// rate — 12fps vs 24fps — and defaults to false for callers that don't pass
// it; `study/windows.js` forwards `engine.mobile` here.
export function createWeather(THREE, tex, { mobile = false } = {}) {
  const weather = {
    mobile: !!mobile,
    phase: null,
    skyBase: document.createElement('canvas'),
    winCanvas: document.createElement('canvas'),
    drops: [],
    streaks: [],

    // Still sky for the current phase — five-stop gradient, rain haze, then
    // lit windows at night or a moon halo at dawn/dusk, then a ridge
    // silhouette. Transcribed from SRC:781–812.
    drawSky() {
      const p = (this.phase = dayPhase())
      const c = this.skyBase
      const g = c.getContext('2d')
      const sk = g.createLinearGradient(0, 0, 0, 320)
      ;[0, 0.4, 0.64, 0.84, 1].forEach((s, i) => sk.addColorStop(s, p.sky[i]))
      g.fillStyle = sk
      g.fillRect(0, 0, 256, 320)
      // rain haze
      g.fillStyle = 'rgba(180,190,205,.16)'
      g.fillRect(0, 0, 256, 320)
      if (p.key === 'night') {
        g.fillStyle = 'rgba(255,226,168,.5)'
        ;[[28, 268], [44, 260], [96, 276], [112, 264], [188, 272], [206, 258], [220, 280]].forEach(([x, y]) => {
          g.fillRect(x, y, 3, 4)
        })
      } else if (p.key !== 'day') {
        const mx = 176, my = 76
        const halo = g.createRadialGradient(mx, my, 0, mx, my, 90)
        halo.addColorStop(0, 'rgba(255,247,225,.5)')
        halo.addColorStop(1, 'rgba(255,247,225,0)')
        g.fillStyle = halo
        g.fillRect(0, 0, 256, 320)
      }
      // ridge line so there is something out there
      g.fillStyle = p.key === 'night' ? 'rgba(10,14,20,.92)' : 'rgba(48,44,52,.5)'
      g.beginPath()
      g.moveTo(0, 252)
      g.quadraticCurveTo(78, 226, 142, 250)
      g.quadraticCurveTo(202, 270, 256, 244)
      g.lineTo(256, 320)
      g.lineTo(0, 320)
      g.closePath()
      g.fill()
    },

    // Redraws winCanvas from skyBase plus drops, streaks and the lightning
    // flash. Transcribed from SRC:813–844.
    drawRain(dt, flash) {
      const c = this.winCanvas
      const g = c.getContext('2d')
      g.drawImage(this.skyBase, 0, 0)
      g.strokeStyle = 'rgba(226,236,248,.34)'
      g.lineWidth = 1
      g.beginPath()
      for (const d of this.drops) {
        d.y += d.v * dt
        d.x += 26 * dt
        if (d.y > 320) { d.y = -d.l; d.x = Math.random() * 256 }
        if (d.x > 262) d.x -= 264
        g.moveTo(d.x, d.y)
        g.lineTo(d.x - 3, d.y + d.l)
      }
      g.stroke()
      // condensation streaks crawling down the pane itself
      g.strokeStyle = 'rgba(240,248,255,.2)'
      for (const s of this.streaks) {
        s.y += s.v * dt
        if (s.y > 340) { s.y = -s.l; s.x = 12 + Math.random() * 232 }
        g.lineWidth = s.w
        g.beginPath()
        g.moveTo(s.x, s.y)
        g.lineTo(s.x + Math.sin(s.y * 0.05) * 3, s.y + s.l)
        g.stroke()
      }
      if (flash > 0.01) {
        g.fillStyle = 'rgba(226,238,255,' + Math.min(0.7, flash) + ')'
        g.fillRect(0, 0, 256, 320)
      }
      this.winTex.needsUpdate = true
    },

    // Pushes the current phase into the renderer exposure, hemi, moon light,
    // floor pool and the three ceilings that gate lamp/key/spot intensity.
    // Transcribed from SRC:845–855. `deps = { renderer, hemi, moon, pool,
    // storm, engine }` — called once at build time (study/index.js, after
    // every builder has run) and again every in-scene hour by `update()`.
    applyDaylight(deps = {}) {
      const p = (this.phase = dayPhase())
      this.drawSky()
      if (deps.renderer) deps.renderer.toneMappingExposure = p.exposure
      if (deps.hemi) deps.hemi.intensity = p.hemi
      if (deps.moon) {
        deps.moon.color.setHex(p.sun)
        deps.moon.intensity = p.sunI
      }
      if (deps.pool) {
        deps.pool.material.color.setHex(p.pool)
        deps.pool.material.opacity = p.poolA
      }
      if (deps.engine) {
        deps.engine.keyFull = 2.6 * (0.55 + 0.45 * p.lamp)
        deps.engine.floorLightFull = 120 * p.lamp
        deps.engine.lampSpotFull = 150 * (0.7 + 0.3 * p.lamp)
      }
    },

    // Per-frame: advances rain/streaks at 12/24fps, rolls the next lightning
    // bolt, drives `deps.storm`'s intensity, and re-applies daylight once an
    // in-scene hour. Transcribed from SRC:2289–2301. Kept as `update(dt,
    // deps)` — an internal API, distinct from the engine's `update(dt, ctx)`
    // updater contract. `study/windows.js` wraps this in a closure that
    // captures `deps` before pushing it into `updaters`.
    update(dt, deps = {}) {
      this._rainT = (this._rainT || 0) + dt
      const fps = this.mobile ? 12 : 24
      this._boltT = (this._boltT === undefined ? 12 : this._boltT) - dt
      if (this._boltT <= 0) { this._boltT = 24 + Math.random() * 34; this._bolt = 0.9 }
      this._bolt = Math.max(0, (this._bolt || 0) - dt * 3)
      if (this._rainT > 1 / fps) { this.drawRain(this._rainT, this._bolt); this._rainT = 0 }
      if (deps.storm) deps.storm.intensity = this._bolt * 2.4 * (0.4 + 0.6 * (this.phase ? this.phase.night : 1))
      this._hourT = (this._hourT || 0) + dt
      if (this._hourT > 60) { this._hourT = 0; this.applyDaylight(deps) }
    },
  }

  weather.skyBase.width = 256
  weather.skyBase.height = 320
  weather.winCanvas.width = 256
  weather.winCanvas.height = 320
  for (let i = 0; i < 90; i++) {
    weather.drops.push({ x: Math.random() * 256, y: Math.random() * 320, l: 14 + Math.random() * 30, v: 220 + Math.random() * 260 })
  }
  for (let i = 0; i < 14; i++) {
    weather.streaks.push({ x: 12 + Math.random() * 232, y: Math.random() * 320, l: 30 + Math.random() * 90, v: 8 + Math.random() * 26, w: 1 + Math.random() * 1.6 })
  }
  weather.winTex = tex(weather.winCanvas)
  weather.drawSky()
  weather.drawRain(0, 0)

  return weather
}
