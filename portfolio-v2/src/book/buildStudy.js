import * as THREE from 'three'

// The study the bookcase stands in: walls, rug, window, and the desk with its
// four interactive objects (papers, lamp, mug, pen).
//
// Transcribed from the updated design source. Kept out of BookEngine so the
// engine file stays about the book and the camera, not the furniture.

const FL = -17.2 // floor level

export default function buildStudy(scene, tex, { trim, caseW, caseH, caseD }) {
  const T = THREE
  const out = {}

  const addBox = (w, h, d, x, y, z, mat, cast) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.receiveShadow = true
    if (cast) m.castShadow = true
    scene.add(m)
    return m
  }

  // ——— the room ———————————————————————————————————————————————
  const wallMat = new T.MeshStandardMaterial({ color: 0x2a1f16, roughness: 1 })
  addBox(140, 62, 1, 0, FL + 31, -7, wallMat)
  addBox(1, 62, 90, -58, FL + 31, 38, wallMat)
  addBox(1, 62, 90, 58, FL + 31, 38, wallMat)
  addBox(140, 1, 90, 0, FL + 62, 38, wallMat)
  addBox(140, 1.6, 1.4, 0, FL + 0.8, -6.2, trim)

  const rug = new T.Mesh(
    new T.PlaneGeometry(56, 34),
    new T.MeshStandardMaterial({ color: 0x4a2320, roughness: 0.98 })
  )
  rug.rotation.x = -Math.PI / 2
  rug.position.set(0, FL + 0.06, 16)
  rug.receiveShadow = true
  scene.add(rug)

  // ——— the desk ———————————————————————————————————————————————
  const deskMat = new T.MeshStandardMaterial({ color: 0x452c16, roughness: 0.8 })
  const desk = new T.Group()
  desk.position.set(-38, 0, 14)
  desk.rotation.y = 0.42

  const dTop = new T.Mesh(new T.BoxGeometry(26, 1.1, 13), deskMat)
  dTop.position.y = FL + 11
  dTop.castShadow = true
  dTop.receiveShadow = true
  desk.add(dTop)
  ;[[-11.5, -5], [11.5, -5], [-11.5, 5], [11.5, 5]].forEach(([x, z]) => {
    const leg = new T.Mesh(new T.BoxGeometry(1.1, 11, 1.1), trim)
    leg.position.set(x, FL + 5.5, z)
    leg.castShadow = true
    desk.add(leg)
  })

  // chair
  const seat = new T.Mesh(new T.BoxGeometry(8, 0.7, 8), deskMat)
  seat.position.set(0, FL + 6.2, 13)
  seat.castShadow = true
  desk.add(seat)
  ;[[-3.4, 9.8], [3.4, 9.8], [-3.4, 16.2], [3.4, 16.2]].forEach(([x, z]) => {
    const leg = new T.Mesh(new T.BoxGeometry(0.8, 6.2, 0.8), trim)
    leg.position.set(x, FL + 3.1, z)
    leg.castShadow = true
    desk.add(leg)
  })
  const chairBack = new T.Mesh(new T.BoxGeometry(8, 8.4, 0.8), deskMat)
  chairBack.position.set(0, FL + 10.6, 16.6)
  chairBack.castShadow = true
  desk.add(chairBack)
  ;[-3.4, 3.4].forEach((x) => {
    const post = new T.Mesh(new T.BoxGeometry(0.8, 10.6, 0.8), trim)
    post.position.set(x, FL + 5.3, 16.6)
    post.castShadow = true
    desk.add(post)
  })

  // the open book on the desk — the signature gets inked across it
  const openBook = new T.Mesh(
    new T.BoxGeometry(7, 0.5, 5),
    new T.MeshStandardMaterial({ color: 0xe4d7ba, roughness: 0.92 })
  )
  openBook.position.set(-2, FL + 11.8, 0.5)
  openBook.rotation.y = -0.2
  openBook.castShadow = true
  desk.add(openBook)

  // ——— mug ————————————————————————————————————————————————————
  const MUG_X = 5.4, MUG_Z = -1.2, MUG_BASE = FL + 11.55, MUG_H = 2.6
  const ceramic = new T.MeshStandardMaterial({ color: 0xe6ddcc, roughness: 0.34, metalness: 0.04 })
  const ceramicIn = new T.MeshStandardMaterial({ color: 0xd8cdb8, roughness: 0.4, side: T.BackSide })
  const mug = new T.Group()
  mug.position.set(MUG_X, MUG_BASE, MUG_Z)

  const shell = new T.Mesh(new T.CylinderGeometry(1.12, 0.96, MUG_H, 30, 1, true), ceramic)
  shell.position.y = MUG_H / 2
  shell.castShadow = true
  mug.add(shell)
  const shellIn = new T.Mesh(new T.CylinderGeometry(1.06, 0.9, MUG_H - 0.1, 30, 1, true), ceramicIn)
  shellIn.position.y = MUG_H / 2
  mug.add(shellIn)
  const mugBase = new T.Mesh(new T.CylinderGeometry(0.96, 0.96, 0.16, 30), ceramic)
  mugBase.position.y = 0.08
  mugBase.castShadow = true
  mug.add(mugBase)
  const mugRim = new T.Mesh(new T.TorusGeometry(1.1, 0.07, 8, 30), ceramic)
  mugRim.position.y = MUG_H
  mugRim.rotation.x = Math.PI / 2
  mug.add(mugRim)

  const coffee = new T.Mesh(
    new T.CircleGeometry(1.02, 30),
    new T.MeshStandardMaterial({ color: 0x2a1409, roughness: 0.22, metalness: 0.16 })
  )
  coffee.rotation.x = -Math.PI / 2
  coffee.position.y = MUG_H - 0.42
  mug.add(coffee)
  const crema = new T.Mesh(
    new T.RingGeometry(0.72, 1.0, 30),
    new T.MeshStandardMaterial({ color: 0x6b4426, roughness: 0.55, transparent: true, opacity: 0.5 })
  )
  crema.rotation.x = -Math.PI / 2
  crema.position.y = MUG_H - 0.41
  mug.add(crema)
  const handle = new T.Mesh(new T.TorusGeometry(0.62, 0.15, 10, 24, Math.PI * 1.35), ceramic)
  handle.position.set(1.06, MUG_H * 0.56, 0)
  handle.rotation.set(0, Math.PI / 2, -0.35)
  handle.castShadow = true
  mug.add(handle)
  const saucer = new T.Mesh(new T.CylinderGeometry(1.7, 1.55, 0.12, 30), ceramic)
  saucer.position.y = 0.02
  saucer.receiveShadow = true
  mug.add(saucer)
  desk.add(mug)

  out.coffee = coffee
  out.crema = crema
  out.coffeeTop = MUG_H - 0.42

  // steam — soft sprites rising and swaying
  const puffC = document.createElement('canvas')
  puffC.width = puffC.height = 64
  const pctx = puffC.getContext('2d')
  const pgrad = pctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  pgrad.addColorStop(0, 'rgba(255,246,232,.85)')
  pgrad.addColorStop(0.5, 'rgba(255,246,232,.22)')
  pgrad.addColorStop(1, 'rgba(255,246,232,0)')
  pctx.fillStyle = pgrad
  pctx.fillRect(0, 0, 64, 64)
  const puffTex = tex(puffC)
  out.steam = []
  for (let i = 0; i < 14; i++) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 }))
    s.position.set(MUG_X, MUG_BASE + MUG_H - 0.3, MUG_Z)
    s.scale.setScalar(0.9)
    desk.add(s)
    out.steam.push({
      sp: s, t: i / 14, sway: Math.random() * 6.28,
      x0: MUG_X, y0: MUG_BASE + MUG_H - 0.3, z0: MUG_Z,
    })
  }

  // ——— clutter ————————————————————————————————————————————————
  const notebook = new T.Mesh(
    new T.BoxGeometry(5.4, 0.7, 7.4),
    new T.MeshStandardMaterial({ color: 0x2e3b44, roughness: 0.85 })
  )
  notebook.position.set(-8.6, FL + 11.9, 2.4)
  notebook.rotation.y = 0.22
  notebook.castShadow = true
  desk.add(notebook)

  const pen = new T.Mesh(
    new T.CylinderGeometry(0.13, 0.13, 4.4, 10),
    new T.MeshStandardMaterial({ color: 0x1d1a17, roughness: 0.4, metalness: 0.3 })
  )
  pen.position.set(-4.2, FL + 11.7, 4.4)
  pen.rotation.set(Math.PI / 2, 0, 0.5)
  pen.castShadow = true
  desk.add(pen)

  const papers = new T.Mesh(
    new T.BoxGeometry(6, 0.22, 8),
    new T.MeshStandardMaterial({ color: 0xe8dfc9, roughness: 0.92 })
  )
  papers.position.set(3.4, FL + 11.66, 4.6)
  papers.rotation.y = -0.14
  papers.castShadow = true
  desk.add(papers)

  // The top sheet of the stack, carrying the printed CV. A separate plane rather
  // than a textured box face so its orientation is ours to set, not the box UVs'.
  const cvSheet = new T.Mesh(
    new T.PlaneGeometry(5.7, 7.6),
    new T.MeshStandardMaterial({ color: 0xf4eee1, roughness: 0.94, transparent: true })
  )
  cvSheet.rotation.x = -Math.PI / 2
  cvSheet.rotation.z = -0.14 // match the stack's angle on the desk
  cvSheet.position.set(3.4, FL + 11.79, 4.6)
  cvSheet.receiveShadow = true
  desk.add(cvSheet)
  out.cvSheetMat = cvSheet.material

  // ——— desk lamp ——————————————————————————————————————————————
  const lampFoot = new T.Mesh(new T.CylinderGeometry(1.5, 1.7, 0.4, 24), trim)
  lampFoot.position.set(10, FL + 11.75, 4)
  lampFoot.castShadow = true
  desk.add(lampFoot)
  const arm = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 8.4, 12), trim)
  arm.position.set(9.4, FL + 16, 3.7)
  arm.rotation.z = 0.16
  arm.castShadow = true
  desk.add(arm)
  const elbow = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 3.4, 12), trim)
  elbow.position.set(7.9, FL + 19.9, 3.7)
  elbow.rotation.z = Math.PI / 2 - 0.25
  desk.add(elbow)

  const shadeMat = new T.MeshStandardMaterial({ color: 0x8c6b34, roughness: 0.55, metalness: 0.18, side: T.DoubleSide })
  const shade = new T.Mesh(new T.ConeGeometry(2.3, 2.5, 24, 1, true), shadeMat)
  shade.position.set(6.4, FL + 19.1, 3.7)
  shade.rotation.z = -0.22
  shade.castShadow = true
  desk.add(shade)
  const shadeCap = new T.Mesh(new T.CircleGeometry(0.42, 20), shadeMat)
  shadeCap.position.set(6.4, FL + 20.32, 3.7)
  shadeCap.rotation.x = -Math.PI / 2
  desk.add(shadeCap)

  out.bulb = new T.Mesh(
    new T.SphereGeometry(0.52, 16, 16),
    new T.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffcf8a, emissiveIntensity: 2.2, roughness: 0.3 })
  )
  out.bulb.position.set(6.5, FL + 18.5, 3.7)
  desk.add(out.bulb)

  scene.add(desk)
  out.desk = desk

  const deskGlow = new T.PointLight(0xffc274, 40, 46, 2)
  deskGlow.position.set(-32.5, FL + 18, 16.4)
  scene.add(deskGlow)
  out.deskGlow = deskGlow

  // ——— decoration ————————————————————————————————————————————
  // Non-interactive set dressing. Everything here is deliberately quiet: it
  // should read as a lived-in room in peripheral vision, never compete with the
  // book for attention.

  // a framed print on the back wall, beside the bookcase
  const frame = new T.Mesh(new T.BoxGeometry(10, 13, 0.5), trim)
  frame.position.set(25, FL + 34, -6.3)
  frame.castShadow = true
  scene.add(frame)
  const mount = new T.Mesh(
    new T.PlaneGeometry(8.4, 11.4),
    new T.MeshStandardMaterial({ color: 0xd8cbae, roughness: 0.95 })
  )
  mount.position.set(25, FL + 34, -6.03)
  scene.add(mount)
  const plate = new T.Mesh(
    new T.PlaneGeometry(6.2, 8.2),
    new T.MeshStandardMaterial({ color: 0x3b4a3f, roughness: 0.9 })
  )
  plate.position.set(25, FL + 34.6, -6.01)
  scene.add(plate)

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
      new T.BoxGeometry(w, t, 5.4),
      new T.MeshStandardMaterial({ color: stackCols[i % stackCols.length], roughness: 0.88 })
    )
    vol.position.set(-21, stackY + t / 2, 7)
    vol.rotation.y = (i % 2 ? 0.08 : -0.06) + i * 0.02
    vol.castShadow = true
    vol.receiveShadow = true
    scene.add(vol)
    stackY += t
  })

  // curtains flanking the window
  const curtainMat = new T.MeshStandardMaterial({ color: 0x3a2a2e, roughness: 0.98 })
  ;[21, 47].forEach((z) => {
    const c = new T.Mesh(new T.BoxGeometry(0.6, 30, 5), curtainMat)
    c.position.set(56.4, FL + 30, z)
    c.castShadow = true
    scene.add(c)
  })

  // ——— window & moonlight ————————————————————————————————————
  const win = new T.Mesh(new T.PlaneGeometry(22, 26), new T.MeshBasicMaterial({ color: 0x2b3d55 }))
  win.position.set(57.2, FL + 30, 34)
  win.rotation.y = -Math.PI / 2
  scene.add(win)
  ;[[22, 0.7], [0.7, 26]].forEach(([w, h]) => {
    const bar = new T.Mesh(new T.PlaneGeometry(w, h), trim)
    bar.position.set(57.1, FL + 30, 34)
    bar.rotation.y = -Math.PI / 2
    scene.add(bar)
  })
  const moon = new T.DirectionalLight(0x6f8cb8, 0.5)
  moon.position.set(40, FL + 40, 30)
  scene.add(moon)

  // ——— hit volumes & interaction targets ——————————————————————
  const hit = new T.Mesh(
    new T.BoxGeometry(caseW + 2, caseH + 2, caseD + 4),
    new T.MeshBasicMaterial({ visible: false })
  )
  scene.add(hit)
  out.caseHit = hit

  // the signature plane sitting just above the desk book
  const signPlane = new T.Mesh(
    new T.PlaneGeometry(6.6, 4.6),
    new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  )
  signPlane.rotation.x = -Math.PI / 2
  signPlane.position.set(-2, FL + 12.1, 0.5)
  signPlane.rotation.z = -0.2
  desk.add(signPlane)
  out.signCanvas = document.createElement('canvas')
  out.signCanvas.width = 660
  out.signCanvas.height = 460
  out.signTex = tex(out.signCanvas)
  signPlane.material.map = out.signTex
  out.signPlane = signPlane

  out.stain = new T.Mesh(
    new T.RingGeometry(0.66, 0.98, 30),
    new T.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.8, transparent: true, opacity: 0 })
  )
  out.stain.rotation.x = -Math.PI / 2
  out.stain.position.set(MUG_X, MUG_BASE + 0.26, MUG_Z)
  desk.add(out.stain)

  out.deskTargets = [
    { kind: 'cv', hit: papers, tint: [papers.material, cvSheet.material] },
    { kind: 'lamp', hit: shade, tint: [shadeMat] },
    { kind: 'mug', hit: shell, tint: [ceramic] },
    { kind: 'pen', hit: pen, tint: [pen.material] },
  ]
  out.deskTargets.forEach((t) => { t.hit.userData.deskKind = t.kind })
  out.deskHits = out.deskTargets.map((t) => t.hit)

  return out
}
