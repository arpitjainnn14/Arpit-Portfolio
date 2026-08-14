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
    leg.position.set(x, FL + 5.52, z)
    leg.castShadow = true
    desk.add(leg)
  })

  // chair
  // Slightly narrower and shorter than the backrest so their sides and back
  // don't share a plane — same z-fighting cause as the posts.
  const seat = new T.Mesh(new T.BoxGeometry(7.8, 0.7, 8), deskMat)
  seat.position.set(0, FL + 6.2, 12.9)
  seat.castShadow = true
  seat.receiveShadow = true
  desk.add(seat)
  ;[[-3.4, 9.8], [3.4, 9.8], [-3.4, 16.2], [3.4, 16.2]].forEach(([x, z]) => {
    const leg = new T.Mesh(new T.BoxGeometry(0.8, 6.2, 0.8), trim)
    leg.position.set(x, FL + 3.12, z)
    leg.castShadow = true
    desk.add(leg)
  })
  const chairBack = new T.Mesh(new T.BoxGeometry(8, 8.4, 0.8), deskMat)
  chairBack.position.set(0, FL + 10.6, 16.6)
  chairBack.castShadow = true
  chairBack.receiveShadow = true
  desk.add(chairBack)
  // The back posts were modelled at exactly the backrest's depth AND exactly
  // the rear legs' width, so those surfaces were coincident and the depth test
  // flickered between them — the hatched stripe down the chair. Slimmer and
  // shifted back by a fraction, they share no plane with anything.
  ;[-3.4, 3.4].forEach((x) => {
    const post = new T.Mesh(new T.BoxGeometry(0.7, 10.6, 0.7), trim)
    post.position.set(x, FL + 5.35, 16.75)
    post.castShadow = true
    desk.add(post)
  })

  // the open book on the desk — the signature gets inked across it
  const openBook = new T.Mesh(
    new T.BoxGeometry(7, 0.5, 5),
    new T.MeshStandardMaterial({ color: 0xe4d7ba, roughness: 0.92 })
  )
  openBook.position.set(-3.0, FL + 11.8, 1.0)
  openBook.rotation.y = -0.2
  openBook.castShadow = true
  openBook.receiveShadow = true
  desk.add(openBook)

  // ——— mug ————————————————————————————————————————————————————
  const MUG_X = -9.5, MUG_Z = -4.7, MUG_BASE = FL + 11.55, MUG_H = 2.6
  const ceramic = new T.MeshStandardMaterial({ color: 0xe6ddcc, roughness: 0.34, metalness: 0.04 })
  const ceramicIn = new T.MeshStandardMaterial({ color: 0xd8cdb8, roughness: 0.4, side: T.BackSide })
  const mug = new T.Group()
  mug.position.set(MUG_X, MUG_BASE, MUG_Z)
  // A cylinder's UV starts at +z, so the mark drawn at u=0.5 lands on the far
  // side. Turning the mug brings it to face the room; the handle comes round to
  // the other side and stays in view.
  mug.rotation.y = Math.PI

  // A stamped monogram, the way a ceramic mug carries a maker's mark. Drawn to
  // a canvas rather than DOM: the cylinder's UV wraps u once around, so placing
  // the mark at u≈0.5 puts it on one side only.
  const mugArt = document.createElement('canvas')
  mugArt.width = 1024
  mugArt.height = 512
  {
    const g = mugArt.getContext('2d')
    g.fillStyle = '#e6ddcc'
    g.fillRect(0, 0, 1024, 512)
    const cx = 512, cy = 250
    g.strokeStyle = 'rgba(143,99,32,.55)'
    g.lineWidth = 5
    g.beginPath()
    g.arc(cx, cy, 104, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = '#8f6320'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '500 84px "IBM Plex Mono", monospace'
    g.fillText('AJ', cx, cy - 12)
    g.font = '500 26px "IBM Plex Mono", monospace'
    g.fillText('EST. 2026', cx, cy + 58)
  }
  const ceramicPrinted = new T.MeshStandardMaterial({
    map: tex(mugArt), roughness: 0.34, metalness: 0.04,
  })
  const shell = new T.Mesh(new T.CylinderGeometry(1.12, 0.96, MUG_H, 30, 1, true), ceramicPrinted)
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
  // The design rotated the handle onto the Y-Z plane, so its loop stuck out
  // sideways past the mug instead of away from it — it read as a flat tab.
  // A torus in its default X-Y plane, spun so the arc's gap faces the mug,
  // gives an actual loop you could put a finger through.
  const HANDLE_ARC = Math.PI * 1.35
  const handle = new T.Mesh(new T.TorusGeometry(0.62, 0.14, 12, 28, HANDLE_ARC), ceramic)
  handle.position.set(1.3, MUG_H * 0.52, 0)
  handle.rotation.set(0, 0, -HANDLE_ARC / 2) // centre the arc on +x
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
  // The notebook you leave a note in — the pen is deliberately beside it.
  const clothMat = new T.MeshStandardMaterial({ color: 0x2e3b44, roughness: 0.85 })
  // Index 2 is the +Y face — the cover you look down on.
  const coverMat = new T.MeshStandardMaterial({ color: 0x2e3b44, roughness: 0.85 })
  const notebook = new T.Mesh(
    new T.BoxGeometry(5.4, 0.7, 7.4),
    [clothMat, clothMat, coverMat, clothMat, clothMat, clothMat]
  )
  out.notebookMat = coverMat
  notebook.position.set(-9.8, FL + 11.9, 1.2)
  notebook.rotation.y = 0.22
  notebook.castShadow = true
  notebook.receiveShadow = true
  desk.add(notebook)

  // A fountain pen rather than a rod: barrel, cap band, tapered section, nib,
  // and a clip. Parts run along the group's local Y so the group keeps the
  // original lie-flat rotation.
  const penBody = new T.MeshStandardMaterial({ color: 0x1d1a17, roughness: 0.34, metalness: 0.35 })
  const penTrim = new T.MeshStandardMaterial({ color: 0xa8862f, roughness: 0.28, metalness: 0.85 })

  const pen = new T.Group()
  // Laid across the top of the open book, just above where the signature is
  // inked — as if it were put down mid-thought. Sitting on the book (rather
  // than half off it) keeps it supported so no end floats over the desk.
  pen.position.set(-3.0, FL + 12.28, -0.6)
  pen.rotation.set(Math.PI / 2, 0, Math.PI / 2 + 0.1)

  const barrel = new T.Mesh(new T.CylinderGeometry(0.15, 0.145, 2.8, 16), penBody)
  barrel.position.y = 0.8
  barrel.castShadow = true
  pen.add(barrel)

  // rounded cap end
  const capEnd = new T.Mesh(new T.SphereGeometry(0.15, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), penBody)
  capEnd.position.y = 2.2
  pen.add(capEnd)

  // brass band where the cap meets the section
  const band = new T.Mesh(new T.CylinderGeometry(0.157, 0.157, 0.16, 16), penTrim)
  band.position.y = -0.62
  pen.add(band)

  // the section, tapering toward the nib
  const section = new T.Mesh(new T.CylinderGeometry(0.14, 0.085, 1.0, 16), penBody)
  section.position.y = -1.2
  section.castShadow = true
  pen.add(section)

  // nib
  const nib = new T.Mesh(new T.ConeGeometry(0.085, 0.5, 12), penTrim)
  nib.position.y = -1.95
  pen.add(nib)

  // pocket clip
  const clip = new T.Mesh(new T.BoxGeometry(0.05, 1.1, 0.11), penTrim)
  clip.position.set(0.16, 1.6, 0)
  clip.castShadow = true
  pen.add(clip)

  desk.add(pen)

  // An invisible proxy so the raycast (which is non-recursive) still has a
  // single mesh to hit for the whole pen.
  const penHit = new T.Mesh(
    new T.CylinderGeometry(0.34, 0.34, 4.6, 8),
    new T.MeshBasicMaterial({ visible: false })
  )
  penHit.position.copy(pen.position)
  penHit.rotation.copy(pen.rotation)
  desk.add(penHit)

  const papers = new T.Mesh(
    new T.BoxGeometry(6, 0.22, 8),
    new T.MeshStandardMaterial({ color: 0xe8dfc9, roughness: 0.92 })
  )
  papers.position.set(3.8, FL + 11.66, -1.0)
  papers.rotation.y = -0.14
  papers.castShadow = true
  papers.receiveShadow = true
  desk.add(papers)

  // The top sheet of the stack, carrying the printed CV. A separate plane rather
  // than a textured box face so its orientation is ours to set, not the box UVs'.
  const cvSheet = new T.Mesh(
    new T.PlaneGeometry(5.7, 7.6),
    new T.MeshStandardMaterial({ color: 0xf4eee1, roughness: 0.94, transparent: true })
  )
  cvSheet.rotation.x = -Math.PI / 2
  cvSheet.rotation.z = -0.14 // match the stack's angle on the desk
  cvSheet.position.set(3.8, FL + 11.79, -1.0)
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

  // The lamp was emissive but cast nothing — objects on the desk sat in a lit
  // pool with no shadows under them. A spotlight from the bulb, aimed down the
  // desk, gives the mug, pen and notebook real shadows. A spotlight rather than
  // a shadow-casting point light: one shadow map instead of a cube of six.
  const lampSpot = new T.SpotLight(0xffc98a, 150, 46, 0.85, 0.65, 2)
  lampSpot.position.set(6.5, FL + 18.3, 3.7)
  lampSpot.castShadow = true
  lampSpot.shadow.mapSize.set(1024, 1024)
  lampSpot.shadow.camera.near = 1
  lampSpot.shadow.camera.far = 40
  lampSpot.shadow.bias = -0.0015
  lampSpot.shadow.normalBias = 0.03
  lampSpot.target.position.set(-1, FL + 11.5, 2)
  desk.add(lampSpot)
  desk.add(lampSpot.target)
  out.lampSpot = lampSpot
  out.lampSpotFull = 150

  scene.add(desk)
  out.desk = desk

  const deskGlow = new T.PointLight(0xffc274, 40, 46, 2)
  deskGlow.position.set(-32.5, FL + 18, 16.4)
  scene.add(deskGlow)
  out.deskGlow = deskGlow

  // A second, softer light set back toward the wall. The lamp was lighting the
  // desktop but leaving the wall behind it flat — this paints the warm pool a
  // real desk lamp throws up the wall. Dimmer and wider than the desk glow.
  const wallWash = new T.PointLight(0xffb765, 26, 52, 2)
  wallWash.position.set(-35, FL + 26, 1.5)
  scene.add(wallWash)
  out.wallWash = wallWash
  out.wallWashFull = 26

  // ——— decoration ————————————————————————————————————————————
  // Non-interactive set dressing. Everything here is deliberately quiet: it
  // should read as a lived-in room in peripheral vision, never compete with the
  // book for attention.

  // a framed print on the back wall, beside the bookcase — a moonlit ridge
  // line, drawn on a canvas so it shares the window's dusk palette rather than
  // sitting there as a flat coloured rectangle.
  const art = new T.Group()
  art.position.set(25, FL + 34, -6.3)
  art.rotation.z = 0.012 // hung by hand, not by CAD
  scene.add(art)

  const frame = new T.Mesh(new T.BoxGeometry(10, 13, 0.5), trim)
  frame.castShadow = true
  art.add(frame)
  // an inner lip, inset and pushed forward, so the moulding reads as bevelled
  // instead of one flat slab
  const lip = new T.Mesh(
    new T.BoxGeometry(9.1, 12.1, 0.3),
    new T.MeshStandardMaterial({ color: 0x3a2617, roughness: 0.7 })
  )
  lip.position.z = 0.16
  art.add(lip)

  const mount = new T.Mesh(
    new T.PlaneGeometry(8.4, 11.4),
    new T.MeshStandardMaterial({ color: 0xd8cbae, roughness: 0.95 })
  )
  mount.position.z = 0.27
  art.add(mount)

  // gallery margins: even on the sides and top, deeper along the bottom
  const printW = 6.4
  const printH = 8.0
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
      emissiveIntensity: 0.5,
      roughness: 0.92,
    })
  )
  print.position.set(0, 0.75, 0.29)
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
    new T.PlaneGeometry(8.4, 11.4),
    new T.MeshBasicMaterial({
      map: tex(glassC), transparent: true, opacity: 0.07, depthWrite: false,
    })
  )
  glass.position.z = 0.31
  art.add(glass)

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
  signPlane.position.set(-3.0, FL + 12.1, 1.0)
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
    { kind: 'note', hit: notebook, tint: [clothMat, coverMat] },
    { kind: 'lamp', hit: shade, tint: [shadeMat] },
    { kind: 'mug', hit: shell, tint: [ceramic, ceramicPrinted] },
    { kind: 'pen', hit: penHit, tint: [penBody, penTrim] },
  ]
  out.deskTargets.forEach((t) => { t.hit.userData.deskKind = t.kind })
  out.deskHits = out.deskTargets.map((t) => t.hit)

  return out
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
