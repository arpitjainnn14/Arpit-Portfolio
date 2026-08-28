import * as THREE from 'three'
import { bevelBox } from './geom'

// Non-interactive set dressing: the framed ridge print, the wall clock, the
// corner plant and the leaning stack of floor books. Moved verbatim out of
// the old buildStudy.js. Everything here is deliberately quiet: it should
// read as a lived-in room in peripheral vision, never compete with the book
// for attention.

const FL = -17.2 // floor level

export default function buildDressing(scene, tex, { caseH, materials }) {
  const T = THREE
  // Task R1: brassMat/ladderMat used to be same-values duplicates of
  // instances desk.js and turntable.js minted independently — now one
  // shared instance apiece, owned by study/materials.js.
  const trim = materials.shared.trimDark
  const brassMat = materials.shared.brass

  // a framed print on the back wall, beside the bookcase — a moonlit ridge
  // line, drawn on a canvas so it shares the window's dusk palette rather than
  // sitting there as a flat coloured rectangle.
  // Sits on the left (SRC's x = -42) rather than the repo's earlier +25: the
  // back-wall window (windows.js, x = 26, 19.4 wide) now occupies the right
  // side of this wall, so the print moved to the free left side instead of
  // colliding with it. Height stays at the repo's FL + 35 (level with the
  // wall clock), not SRC's FL + 33.
  const art = new T.Group()
  art.position.set(-42, FL + 35, -6.3)
  art.rotation.z = 0.012 // hung by hand, not by CAD
  scene.add(art)

  const frame = new T.Mesh(bevelBox(12, 15.5, 0.5), trim)
  frame.castShadow = true
  art.add(frame)
  // An inner lip standing proud of the frame face, so the moulding reads as
  // bevelled instead of one flat slab. It has to be four bars rather than one
  // inset box: a box spans the whole opening, and since it sits forward of the
  // frame face it would cover the mount and the print entirely.
  const lipMat = new T.MeshStandardMaterial({ color: 0x3a2617, roughness: 0.7 })
  ;[[11.3, 0.85, 0, 7.0], [11.3, 0.85, 0, -7.0], [0.85, 14.9, -5.2, 0], [0.85, 14.9, 5.2, 0]]
    .forEach(([w, h, x, y]) => {
      const bar = new T.Mesh(new T.BoxGeometry(w, h, 0.4), lipMat)
      bar.position.set(x, y, 0.25)
      bar.castShadow = true
      art.add(bar)
    })

  // Everything from here forward sits ahead of the frame's front face (z 0.25)
  // and inside the lip's 9.6 × 13.2 opening, spaced far enough apart not to
  // z-fight at this camera distance. The mount overshoots the opening so its
  // edges tuck under the lip.
  const mount = new T.Mesh(
    new T.PlaneGeometry(10.1, 13.7),
    new T.MeshStandardMaterial({ color: 0xb9ab8c, roughness: 0.95 })
  )
  mount.position.z = 0.3
  art.add(mount)

  // gallery margins: even on the sides and top, deeper along the bottom
  const printW = 7.7
  const printH = 9.6
  const printC = document.createElement('canvas')
  printC.width = 512
  printC.height = Math.round((512 * printH) / printW)
  drawMoonlitPrint(printC)
  // This wall gets almost no light, so a plain lit material crushed the print to
  // black. Feeding the same canvas back as a low emissive map lets the picture
  // hold its own values without reading as a glowing screen.
  const printTex = tex(printC)
  const print = new T.Mesh(
    new T.PlaneGeometry(printW, printH),
    new T.MeshStandardMaterial({
      map: printTex,
      emissive: 0xffffff,
      emissiveMap: printTex,
      emissiveIntensity: 0.3,
      roughness: 0.92,
    })
  )
  print.position.set(0, 0.9, 0.36)
  art.add(print)

  // glass: a single diagonal highlight, faint enough that it only registers as
  // the camera swings past
  const glassC = document.createElement('canvas')
  glassC.width = glassC.height = 128
  const gctx = glassC.getContext('2d')
  const ggrad = gctx.createLinearGradient(0, 128, 128, 0)
  ggrad.addColorStop(0, 'rgba(255,255,255,0)')
  ggrad.addColorStop(0.42, 'rgba(255,255,255,0)')
  ggrad.addColorStop(0.55, 'rgba(255,255,255,0.5)')
  ggrad.addColorStop(0.68, 'rgba(255,255,255,0)')
  ggrad.addColorStop(1, 'rgba(255,255,255,0)')
  gctx.fillStyle = ggrad
  gctx.fillRect(0, 0, 128, 128)
  const glass = new T.Mesh(
    new T.PlaneGeometry(10.1, 13.7),
    new T.MeshBasicMaterial({
      map: tex(glassC), transparent: true, opacity: 0.07, depthWrite: false,
    })
  )
  glass.position.z = 0.42
  art.add(glass)

  // A working wall clock, hung opposite the print so the back wall isn't
  // lopsided. The hands are driven from the real clock via this module's
  // `update`, which is the one thing in the room that proves it's live rather
  // than a pretty still life.
  const clockFace = document.createElement('canvas')
  clockFace.width = clockFace.height = 512
  {
    const g = clockFace.getContext('2d')
    g.fillStyle = '#efe7d5'
    g.beginPath()
    g.arc(256, 256, 256, 0, Math.PI * 2)
    g.fill()
    // minute ticks, with the hours longer and darker
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2
      const hour = i % 5 === 0
      const r1 = hour ? 198 : 214
      g.strokeStyle = hour ? 'rgba(52,40,24,.85)' : 'rgba(52,40,24,.3)'
      g.lineWidth = hour ? 8 : 3
      g.beginPath()
      g.moveTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1)
      g.lineTo(256 + Math.cos(a) * 230, 256 + Math.sin(a) * 230)
      g.stroke()
    }
    g.fillStyle = '#3a2812'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '500 64px "IBM Plex Mono", monospace'
    ;[[12, 0], [3, 90], [6, 180], [9, 270]].forEach(([n, deg]) => {
      const a = (deg * Math.PI) / 180 - Math.PI / 2
      g.fillText(String(n), 256 + Math.cos(a) * 156, 256 + Math.sin(a) * 156)
    })
  }

  const wallClock = new T.Group()
  wallClock.position.set(-25, FL + 35, -6.3)
  wallClock.rotation.z = -0.014 // hung by hand, like the print
  scene.add(wallClock)

  const clockCase = new T.Mesh(new T.CylinderGeometry(5, 5, 0.8, 44), trim)
  clockCase.rotation.x = Math.PI / 2
  clockCase.castShadow = true
  wallClock.add(clockCase)

  const dial = new T.Mesh(
    new T.CircleGeometry(4.5, 52),
    new T.MeshStandardMaterial({ map: tex(clockFace), roughness: 0.92 })
  )
  dial.position.z = 0.42
  wallClock.add(dial)

  // Each hand is a box offset inside a group, so the group's z-rotation swings
  // it about the dial's centre rather than its own.
  const handMat = new T.MeshStandardMaterial({ color: 0x2a1d10, roughness: 0.6 })
  const secondMat = new T.MeshStandardMaterial({ color: 0x8f3a18, roughness: 0.5 })
  const makeHand = (len, w, z, mat) => {
    const pivot = new T.Group()
    const arm = new T.Mesh(new T.BoxGeometry(w, len, 0.09), mat)
    arm.position.y = len / 2 - 0.35 // a little tail past the centre
    pivot.add(arm)
    pivot.position.z = z
    wallClock.add(pivot)
    return pivot
  }
  const clockHands = {
    hour: makeHand(2.5, 0.36, 0.46, handMat),
    minute: makeHand(3.6, 0.26, 0.5, handMat),
    second: makeHand(4.0, 0.1, 0.54, secondMat),
  }

  const boss = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.16, 20), brassMat)
  boss.rotation.x = Math.PI / 2
  boss.position.z = 0.58
  wallClock.add(boss)

  // a library ladder leaning on the bookcase
  const ladder = new T.Group()
  ladder.position.set(13.6, FL, 7.4)
  ladder.rotation.set(-0.2, -0.12, 0)
  const ladderMat = materials.shared.woodLadder
  ;[-1.7, 1.7].forEach((x) => {
    const rail = new T.Mesh(bevelBox(0.5, 30, 0.7, 0.06), ladderMat)
    rail.position.set(x, 15, 0)
    rail.castShadow = true
    ladder.add(rail)
  })
  for (let i = 0; i < 7; i++) {
    const rung = new T.Mesh(bevelBox(3.6, 0.36, 0.9, 0.06), ladderMat)
    rung.position.set(0, 3.4 + i * 3.9, 0)
    rung.castShadow = true
    ladder.add(rung)
  }
  scene.add(ladder)

  // picture light over the bookcase — brightens the shelf the book sits on
  const picLight = new T.Group()
  picLight.position.set(0, caseH / 2 + 3.4, 1.6)
  const picTube = new T.Mesh(new T.CylinderGeometry(0.6, 0.6, 12, 16), new T.MeshStandardMaterial({ color: 0x9c7a34, roughness: 0.35, metalness: 0.8 }))
  picTube.rotation.z = Math.PI / 2
  picTube.castShadow = true
  picLight.add(picTube)
  ;[-4.4, 4.4].forEach((x) => {
    const stem = new T.Mesh(new T.BoxGeometry(0.4, 3.4, 0.4), trim)
    stem.position.set(x, 1.7, -1.6)
    picLight.add(stem)
  })
  scene.add(picLight)
  const shelfWash = new T.SpotLight(0xffe0ac, 90, 60, 0.9, 0.7, 1.6)
  shelfWash.position.set(0, caseH / 2 + 3, 6)
  shelfWash.target.position.set(0, -1, 0)
  shelfWash.castShadow = false
  scene.add(shelfWash)
  scene.add(shelfWash.target)

  // a plant in the corner, leaves as a few tilted cones
  const pot = new T.Mesh(
    new T.CylinderGeometry(1.5, 1.15, 2.6, 20),
    new T.MeshStandardMaterial({ color: 0x6b3a24, roughness: 0.9 })
  )
  pot.position.set(21.5, FL + 1.3, 5)
  pot.castShadow = true
  pot.receiveShadow = true
  scene.add(pot)
  const leafMat = new T.MeshStandardMaterial({ color: 0x33452f, roughness: 0.88 })
  ;[
    [0, 5.6, 0, 0, 0], [-0.9, 4.6, 0.5, 0.5, 0.3], [1.0, 4.9, -0.4, -0.45, -0.2],
    [0.3, 4.2, 1.0, 0.2, 0.55], [-0.5, 4.0, -0.9, -0.25, -0.5],
  ].forEach(([dx, h, dz, rz, rx]) => {
    const leaf = new T.Mesh(new T.ConeGeometry(0.85, h, 8), leafMat)
    leaf.position.set(21.5 + dx, FL + 2.4 + h / 2, 5 + dz)
    leaf.rotation.set(rx, 0, rz)
    leaf.castShadow = true
    scene.add(leaf)
  })

  // a leaning stack of books on the floor — the overflow from the shelf
  const stackCols = [0x5a4630, 0x33402f, 0x6b3626, 0x1f2a36, 0x7a5a2e]
  let stackY = FL
  ;[[7.4, 1.0], [7.0, 0.85], [7.6, 1.1], [6.6, 0.9]].forEach(([w, t], i) => {
    const vol = new T.Mesh(
      bevelBox(w, t, 5.4),
      new T.MeshStandardMaterial({ color: stackCols[i % stackCols.length], roughness: 0.88 })
    )
    vol.position.set(-21, stackY + t / 2, 7)
    vol.rotation.y = (i % 2 ? 0.08 : -0.06) + i * 0.02
    vol.castShadow = true
    vol.receiveShadow = true
    scene.add(vol)
    stackY += t
  })

  return {
    shelfWash,
    shelfWashFull: 90,
    // update(dt, ctx) is the shared updater contract (see study/index.js);
    // the clock reads the real Date instead of either argument.
    // eslint-disable-next-line no-unused-vars
    update(dt, ctx) {
      const d = new Date()
      const sec = Math.floor(d.getSeconds())
      const min = d.getMinutes() + d.getSeconds() / 60
      const hr = (d.getHours() % 12) + min / 60
      const TAU = Math.PI * 2
      clockHands.second.rotation.z = -(sec / 60) * TAU
      clockHands.minute.rotation.z = -(min / 60) * TAU
      clockHands.hour.rotation.z = -(hr / 12) * TAU
    },
  }
}

// The art inside the frame: three ridges under a moon, in the same dusk blues
// as the window on the far wall so the print looks chosen for the room. Drawn
// deterministically — the same picture every load, no seeded-random surprises.
function drawMoonlitPrint(canvas) {
  const W = canvas.width
  const H = canvas.height
  const c = canvas.getContext('2d')

  // sky: pale cream at the horizon climbing into the window's dusty blue. The
  // warm band sits high enough to show through the gaps between the ridges —
  // pushed to the very bottom it was covered by them and the print read all-blue.
  const sky = c.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#1b2739')
  sky.addColorStop(0.3, '#3b5070')
  sky.addColorStop(0.52, '#6d82a0')
  sky.addColorStop(0.64, '#b9a98e')
  sky.addColorStop(0.74, '#e0cfae')
  sky.addColorStop(1, '#e8d9ba')
  c.fillStyle = sky
  c.fillRect(0, 0, W, H)

  // stars, weighted toward the top where the sky is darkest
  const stars = [
    [0.12, 0.08], [0.28, 0.05], [0.41, 0.14], [0.55, 0.07], [0.83, 0.11],
    [0.19, 0.21], [0.36, 0.27], [0.62, 0.19], [0.9, 0.24], [0.07, 0.33],
    [0.48, 0.35], [0.75, 0.31],
  ]
  stars.forEach(([sx, sy], i) => {
    c.fillStyle = `rgba(255,248,232,${0.5 - sy * 0.9})`
    c.beginPath()
    c.arc(sx * W, sy * H, i % 3 === 0 ? 1.8 : 1.1, 0, 6.283)
    c.fill()
  })

  // the moon, up and to the right, with a soft halo
  const mx = W * 0.7
  const my = H * 0.2
  const halo = c.createRadialGradient(mx, my, 0, mx, my, W * 0.3)
  halo.addColorStop(0, 'rgba(255,247,225,0.55)')
  halo.addColorStop(0.35, 'rgba(255,247,225,0.12)')
  halo.addColorStop(1, 'rgba(255,247,225,0)')
  c.fillStyle = halo
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#fdf6e2'
  c.beginPath()
  c.arc(mx, my, W * 0.075, 0, 6.283)
  c.fill()

  // Three ridges, each darker and lower than the one behind it. Every ridge gets
  // its own control points — driving all three off one shared profile made them
  // rhyme, which read as a stack of identical waves rather than a landscape.
  const ridge = (color, startY, segs) => {
    c.fillStyle = color
    c.beginPath()
    c.moveTo(0, startY * H)
    segs.forEach(([cx, cy, ex, ey]) => c.quadraticCurveTo(cx * W, cy * H, ex * W, ey * H))
    c.lineTo(W, H)
    c.lineTo(0, H)
    c.closePath()
    c.fill()
  }
  // far: one tall peak left of centre, trailing off right
  ridge('#8b9cb0', 0.68, [
    [0.14, 0.60, 0.30, 0.545],
    [0.42, 0.465, 0.52, 0.61],
    [0.66, 0.72, 0.80, 0.655],
    [0.92, 0.615, 1.0, 0.665],
  ])
  // mid: low on the left, its shoulder rising past the far peak on the right
  ridge('#3d4f63', 0.8, [
    [0.1, 0.785, 0.24, 0.805],
    [0.4, 0.835, 0.56, 0.7],
    [0.72, 0.6, 0.84, 0.745],
    [0.95, 0.835, 1.0, 0.79],
  ])
  // near: a long shallow swell, the darkest and least detailed
  ridge('#10161f', 0.92, [
    [0.16, 0.86, 0.34, 0.9],
    [0.52, 0.95, 0.7, 0.88],
    [0.88, 0.83, 1.0, 0.885],
  ])

  // paper grain — a few horizontal streaks so the flat fills don't read as
  // vector clip-art under the lamp
  c.globalAlpha = 0.05
  for (let i = 0; i < 90; i++) {
    const y = (i * 37.7) % H
    c.fillStyle = i % 2 ? '#000' : '#fff'
    c.fillRect(0, y, W, 1)
  }
  c.globalAlpha = 1

  // vignette
  const vig = c.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.72)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.28)')
  c.fillStyle = vig
  c.fillRect(0, 0, W, H)
}
