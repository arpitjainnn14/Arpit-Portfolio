import * as THREE from 'three'
import { bevelBox } from './geom'

// The desk and everything on it: open book, mug, steam, notebook, fountain
// pen, papers/CV, the desk lamp, and the two lights it throws. The chair
// that sits at it lives in ./chair.js — split out in Task R4 — and is built
// by study/index.js after this module returns, parented onto `out.desk`.
// Moved verbatim out of the old buildStudy.js.
//
// Besides the handles BookEngine reads directly, this also returns a few
// wiring-only locals (notebook, clothMat, ceramic, penHit, penBody, penTrim)
// that study/index.js needs to assemble deskTargets — index.js deletes them
// again before they reach the engine, so they never become part of the
// public handle set.

const FL = -17.2 // floor level

export default function buildDesk(scene, tex, { mobile, materials }) {
  const T = THREE
  const out = {}
  // Ownership of these moved to study/materials.js in Task R1 — same
  // instances/values as before, just built in one place now.
  const trim = materials.shared.trimDark
  const deskMat = materials.shared.woodDesk

  // ——— the desk ———————————————————————————————————————————————
  const desk = new T.Group()
  desk.position.set(-38, 0, 14)
  desk.rotation.y = 0.42

  const dTop = new T.Mesh(bevelBox(26, 1.1, 13, 0.12), deskMat)
  dTop.position.y = FL + 11
  dTop.castShadow = true
  dTop.receiveShadow = true
  desk.add(dTop)
  // Tapered rather than square — a cylinder with a smaller foot radius reads
  // as a turned leg instead of a scaffolding post. Same footprint (x/z) and
  // height as before, so the top's support points don't move.
  ;[[-11.5, -5], [11.5, -5], [-11.5, 5], [11.5, 5]].forEach(([x, z]) => {
    const leg = new T.Mesh(new T.CylinderGeometry(0.58, 0.42, 11, 12), trim)
    leg.position.set(x, FL + 5.52, z)
    leg.castShadow = true
    desk.add(leg)
  })

  // ——— apron + drawer ————————————————————————————————————————
  // A rectangular frame of rails just under the top, inset ~0.4 from the
  // top's edge — the fix for the top reading as a slab floating on posts.
  // The reader-facing rail (+z, toward the chair) is built taller than the
  // other three so a drawer front can be let into it.
  const APRON_Y = FL + 9.95
  ;[
    [0, APRON_Y, -5.7, 25.2, 1.0, 0.8], // back rail
    [12.2, APRON_Y, 0, 0.8, 1.0, 12.2], // right rail
    [-12.2, APRON_Y, 0, 0.8, 1.0, 12.2], // left rail
  ].forEach(([x, y, z, w, h, d]) => {
    const rail = new T.Mesh(bevelBox(w, h, d, 0.06), deskMat)
    rail.position.set(x, y, z)
    rail.castShadow = true
    rail.receiveShadow = true
    desk.add(rail)
  })
  // The front rail (reader-facing) sits deeper than the others to carry the
  // drawer — its top still meets the underside of the top.
  const FRONT_RAIL_H = 2.4
  const frontRail = new T.Mesh(bevelBox(25.2, FRONT_RAIL_H, 0.8, 0.06), deskMat)
  frontRail.position.set(0, FL + 10.45 - FRONT_RAIL_H / 2, 5.7)
  frontRail.castShadow = true
  frontRail.receiveShadow = true
  desk.add(frontRail)

  // The drawer front sits recessed into the front rail — smaller than the
  // rail on every side, and pulled back 0.15 in z, so a shadowed reveal
  // shows all the way round it instead of it reading as flush wood.
  const drawer = new T.Mesh(bevelBox(7.5, 1.8, 0.4, 0.06), deskMat)
  drawer.position.set(0, frontRail.position.y, 5.75)
  drawer.castShadow = true
  drawer.receiveShadow = true
  desk.add(drawer)
  const pull = new T.Mesh(bevelBox(1.6, 0.22, 0.22, 0.06), materials.shared.brass)
  pull.position.set(0, frontRail.position.y, 6.08)
  pull.castShadow = true
  desk.add(pull)

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
  // ceramic (not ceramicIn) is hover-tinted along with the mug — must stay a
  // fresh instance, hence make.ceramic() rather than a shared one.
  const ceramic = materials.make.ceramic()
  const ceramicIn = materials.shared.ceramicPlain
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
  const clothMat = materials.make.notebookCloth()
  // Index 2 is the +Y face — the cover you look down on.
  const coverMat = materials.make.notebookCloth()
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
  const penBody = materials.make.penBody()
  const penTrim = materials.make.penTrim()

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
    materials.make.papers()
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
    materials.make.cvSheet()
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

  const shadeMat = materials.make.lampShade()
  const deskShade = new T.Mesh(new T.ConeGeometry(2.3, 2.5, 24, 1, true), shadeMat)
  deskShade.position.set(6.4, FL + 19.1, 3.7)
  deskShade.rotation.z = -0.22
  deskShade.castShadow = true
  desk.add(deskShade)
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
  // Two shadow-casters is already a lot for a mid-range phone — the key
  // light stays, but the lamp spot's shadow (a second full pass) goes off
  // on mobile. The light itself still shows; only the shadow map is cut.
  lampSpot.castShadow = !mobile
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

  out.stain = new T.Mesh(
    new T.RingGeometry(0.66, 0.98, 30),
    new T.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.8, transparent: true, opacity: 0 })
  )
  out.stain.rotation.x = -Math.PI / 2
  out.stain.position.set(MUG_X, MUG_BASE + 0.26, MUG_Z)
  desk.add(out.stain)

  // ——— hotspot anchors for study/index.js's deskTargets wiring ————
  // deskShade/shell/papers/pen are part of the public contract (BookEngine
  // needs them as hotspot anchors); notebook/clothMat/ceramic/penHit/penBody/
  // penTrim are wiring-only — index.js reads them to build deskTargets, then
  // deletes them before they reach the engine.
  out.deskShade = deskShade
  out.shell = shell
  out.papers = papers
  out.pen = pen
  out.notebook = notebook
  out.clothMat = clothMat
  out.ceramic = ceramic
  out.penHit = penHit
  out.penBody = penBody
  out.penTrim = penTrim

  return out
}
