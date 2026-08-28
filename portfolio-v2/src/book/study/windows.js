import * as THREE from 'three'
import { createWeather } from '../weather'
import { bevelBox } from './geom'

// The window, its frame bars, the curtains flanking it, the moonlight it lets
// in, the floor pool of light it throws, and the weather (rain, condensation
// streaks, lightning) animated across the pane.

const FL = -17.2 // floor level

export default function buildWindows(scene, tex, opts) {
  const T = THREE

  // curtains flanking the window
  const curtainMat = new T.MeshStandardMaterial({ color: 0x3a2a2e, roughness: 0.98 })
  ;[21, 47].forEach((z) => {
    const c = new T.Mesh(new T.BoxGeometry(0.6, 30, 5), curtainMat)
    c.position.set(56.4, FL + 30, z)
    c.castShadow = true
    scene.add(c)
  })

  // ——— sky, weather, and the hour of the day ——————————————————
  const weather = createWeather(THREE, tex, { mobile: !!opts.mobile })

  // ——— window & moonlight ————————————————————————————————————
  const win = new T.Mesh(new T.PlaneGeometry(22, 26), new T.MeshBasicMaterial({ map: weather.winTex }))
  win.position.set(57.2, FL + 30, 34)
  win.rotation.y = -Math.PI / 2
  scene.add(win)
  ;[[22, 0.7], [0.7, 26]].forEach(([w, h]) => {
    const bar = new T.Mesh(new T.PlaneGeometry(w, h), opts.trim)
    bar.position.set(57.1, FL + 30, 34)
    bar.rotation.y = -Math.PI / 2
    scene.add(bar)
  })
  const moon = new T.DirectionalLight(0x6f8cb8, 0.5)
  moon.position.set(40, FL + 40, 30)
  scene.add(moon)

  // ——— a second window, on the back wall, where the rain is actually in
  // frame (the side window above is too oblique from the default camera for
  // any of it to read). Transcribed from SRC:1751–1774, sampling the same
  // winTex as the side window.
  const bWin = new T.Mesh(new T.PlaneGeometry(17, 21), new T.MeshBasicMaterial({ map: weather.winTex }))
  bWin.position.set(26, FL + 30, -6.15)
  scene.add(bWin)
  const bFrame = new T.Mesh(bevelBox(19.4, 23.4, 0.8), opts.trim)
  bFrame.position.set(26, FL + 30, -6.7)
  bFrame.castShadow = true
  scene.add(bFrame)
  ;[[17, 0.6, 0, 0], [0.6, 21, 0, 0], [17, 0.5, 0, 7], [17, 0.5, 0, -7]].forEach(([w, h, dx, dy]) => {
    const bar = new T.Mesh(new T.PlaneGeometry(w, h), opts.trim)
    bar.position.set(26 + dx, FL + 30 + dy, -6.05)
    scene.add(bar)
  })
  const bSill = new T.Mesh(bevelBox(21, 0.9, 2.2), opts.trim)
  bSill.position.set(26, FL + 18.6, -5.8)
  bSill.castShadow = true
  scene.add(bSill)
  ;[16.2, 35.8].forEach((x) => {
    const c = new T.Mesh(new T.BoxGeometry(3.4, 26, 0.9), curtainMat)
    c.position.set(x, FL + 31, -5.4)
    c.castShadow = true
    scene.add(c)
  })

  // ——— the pool of light the window throws onto the floor ————————
  // Transcribed from SRC:1919–1935 (Ruling I — no pool existed in this repo).
  const poolC = document.createElement('canvas')
  poolC.width = poolC.height = 128
  {
    const g = poolC.getContext('2d')
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    gr.addColorStop(0, 'rgba(255,206,140,.55)')
    gr.addColorStop(0.55, 'rgba(255,196,124,.18)')
    gr.addColorStop(1, 'rgba(255,196,124,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, 128, 128)
  }
  const pool = new T.Mesh(
    new T.PlaneGeometry(46, 34),
    new T.MeshBasicMaterial({ map: tex(poolC), transparent: true, blending: T.AdditiveBlending, depthWrite: false })
  )
  pool.rotation.x = -Math.PI / 2
  pool.position.set(34, FL + 0.12, 30)
  scene.add(pool)

  // a second pool under the back-wall window, sharing pool's material so the
  // daylight/lightning updates that recolor `pool.material` reach it too.
  const pool2 = new T.Mesh(new T.PlaneGeometry(26, 22), pool.material)
  pool2.rotation.x = -Math.PI / 2
  pool2.position.set(26, FL + 0.1, 6)
  scene.add(pool2)

  // ——— the storm's own light, flashed on rare lightning ——————————
  const storm = new T.DirectionalLight(0xd6e4ff, 0)
  storm.position.set(26, FL + 42, 30)
  storm.castShadow = false
  scene.add(storm)

  const out = { moon, pool, pool2, storm, winTex: weather.winTex }

  // Ruling C — the engine's updater contract is `update(dt, ctx)`; weather's
  // own `update(dt, deps)` is an internal API kept separate from that, so it
  // is wrapped in a closure that captures `deps` rather than pushed directly
  // into `updaters` (which would silently pass it `ctx` instead).
  const deps = { renderer: opts.renderer, hemi: opts.hemi, moon, pool, storm, engine: opts.engine }
  out.applyDaylight = () => weather.applyDaylight(deps)
  out.update = (dt) => weather.update(dt, deps)

  return out
}
