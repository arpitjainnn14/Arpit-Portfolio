import * as THREE from 'three'
import { createMaterials } from './materials'
import buildRoom from './room'
import buildDesk from './desk'
import buildChair from './chair'
import buildDressing from './dressing'
import buildWindows from './windows'
import buildReadingCorner from './readingCorner'
import buildTurntable from './turntable'
import buildCat from './cat'

// The study the bookcase stands in: walls, rug, window, and the desk with its
// four interactive objects (papers, lamp, mug, pen).
//
// Split across study/room.js, study/desk.js, study/dressing.js and
// study/windows.js — kept out of BookEngine so the engine file stays about
// the book and the camera, not the furniture. This file just wires the parts
// together and owns the bits that are wiring rather than furniture: the
// bookcase hit proxy, deskTargets/deskHits, and the signature plane.

const FL = -17.2 // floor level

export default function buildStudy(scene, tex, opts) {
  const T = THREE
  const out = { updaters: [] }

  // Built once, here, and threaded through every builder below via opts —
  // Task R1 centralised what used to be per-builder `new
  // T.MeshStandardMaterial` calls (brass alone was minted identically in
  // three separate modules). `trim` rides along too, unchanged in shape:
  // windows.js (untouched by that task) still reads opts.trim directly.
  const materials = createMaterials(THREE, tex)
  const buildOpts = { ...opts, materials, trim: materials.shared.trimDark }

  for (const build of [buildRoom, buildDesk, buildDressing, buildWindows, buildReadingCorner, buildTurntable, buildCat]) {
    const part = build(scene, tex, buildOpts)
    if (part.update) out.updaters.push(part.update)
    delete part.update
    Object.assign(out, part)
  }

  // The chair is parented onto the desk group (desk.js's `desk` sits at its
  // own position/rotation, not the scene origin) so it can't come through
  // the loop above like the other builders — it needs out.desk, which only
  // exists once buildDesk has already run.
  const chairPart = buildChair(scene, tex, { ...buildOpts, deskGroup: out.desk })
  Object.assign(out, chairPart)

  // desk.js hands these across only so the deskTargets wiring below can use
  // them — they aren't part of the public handle set, so they come back off
  // `out` again once deskTargets is built.
  const { notebook, clothMat, ceramic, penHit, penBody, penTrim } = out

  // ——— hit volumes & interaction targets ——————————————————————
  const { caseW, caseH, caseD } = opts
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
  out.desk.add(signPlane)
  out.signCanvas = document.createElement('canvas')
  out.signCanvas.width = 660
  out.signCanvas.height = 460
  out.signTex = tex(out.signCanvas)
  signPlane.material.map = out.signTex
  out.signPlane = signPlane

  out.deskTargets = [
    { kind: 'cv', hit: out.papers, tint: [out.papers.material, out.cvSheetMat] },
    { kind: 'note', hit: notebook, tint: [clothMat, out.notebookMat] },
    { kind: 'lamp', hit: out.deskShade, tint: [out.deskShade.material] },
    { kind: 'mug', hit: out.shell, tint: [ceramic, out.shell.material] },
    { kind: 'pen', hit: penHit, tint: [penBody, penTrim] },
    { kind: 'vinyl', hit: out.vinylHit, tint: [] },
    { kind: 'cat', hit: out.catHit, tint: [out.catFur, out.catMark] },
    { kind: 'tail', hit: out.catTailHit, tint: [out.catFur] },
  ]
  out.deskTargets.forEach((t) => { t.hit.userData.deskKind = t.kind })
  out.deskHits = out.deskTargets.map((t) => t.hit)

  // strip the wiring-only locals now that deskTargets is built — everything
  // BookEngine reads is either an original handle or one of deskShade/shell/
  // papers/pen (the hotspot anchors)
  delete out.notebook
  delete out.clothMat
  delete out.ceramic
  delete out.penHit
  delete out.penBody
  delete out.penTrim

  // more wiring-only locals: each is already closed over by the updater or
  // `deps` bag that drives it (windows.js's applyDaylight, readingCorner.js's
  // flicker, turntable.js's toggle), so the copy landing on the engine is
  // pure surface area. `playing` is the one worth calling out — it's a
  // build-time snapshot that goes stale the instant toggle() runs, so
  // anyone trusting `engine.playing` would get a wrong answer.
  delete out.moon
  delete out.pool
  delete out.pool2
  delete out.storm
  delete out.winTex
  delete out.flame
  delete out.candleLight
  delete out.playing
  // room.js's floor/rug/walls exist so a later task can apply texture maps
  // at build time (see study/materials.js) — nothing on the engine needs to
  // reach them afterward, so they're stripped from the bag like the rest of
  // this block.
  delete out.floor
  delete out.rug
  delete out.walls

  // `applyDaylight` (from windows.js) is returned as a handle rather than
  // called here. Calling it here would write engine.lampSpotFull, then
  // BookEngine's `Object.assign(this, study)` would immediately clobber it
  // with desk.js's `out.lampSpotFull = 150` from this same bag — and likewise
  // with the floor lamp's own out.floorLightFull, riding along in the same
  // bag. So BookEngine calls it itself, after that assign.

  return out
}
