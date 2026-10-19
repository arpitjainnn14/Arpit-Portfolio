// Study material ownership, centralised. Before this module, the same
// colour (brass, most visibly) was minted independently in desk.js,
// dressing.js and turntable.js — same values, different instances, no way
// for a later task to touch "the brass" once and have it apply everywhere.
//
// Two accessors, and the split between them is load-bearing — see
// study/index.js's deskTargets and the hover-tint loop in BookEngine.js:
//
//   shared.<name>  — one instance, reused freely. ONLY for objects that are
//                    never in a deskTargets `tint` array — the engine writes
//                    `material.emissive` on every material a hovered
//                    target's `tint` lists, so a shared instance handed to a
//                    tinted target would leak the tint onto everything else
//                    holding that same instance.
//   make.<name>()  — a fresh instance per call, for anything that IS in a
//                    tint array (or might be). Call it once per mesh that
//                    needs its own copy; call it more than once (e.g. the
//                    notebook's body and cover) when the current scene
//                    already used two separate instances of the same look.
//
// The grain and weave maps are generated once here and shared by reference.
// `tex()` already tags canvases as sRGB and asks the GPU for max anisotropy,
// so all a caller adds is wrapping and a repeat.
import { woodTexture, weaveTexture } from './textures'

export function createMaterials(THREE, tex) {
  const T = THREE

  // One canvas per surface family, wrapped once. Repeat is per-material rather
  // than per-canvas: `variant()` clones the texture — which shares the GPU
  // upload — so a desk top and a ladder rail can tile at different densities
  // off the same oak without paying for it twice.
  const wrap = (canvas) => {
    const t = tex(canvas)
    t.wrapS = t.wrapT = T.RepeatWrapping
    return t
  }
  // These are MODULATION maps, not colour maps: three multiplies `map` by
  // `color`, so a brown grain on an already-brown material squares the
  // darkness and the whole room sinks. A near-white base multiplies to ~1 and
  // leaves each material's own colour intact; only the grain lines darken.
  const oak = wrap(woodTexture('#ffffff', '#6b4a2a'))
  const walnut = wrap(woodTexture('#ffffff', '#2a1a0c'))
  const weave = wrap(weaveTexture('#ffffff', '#2a1410', 256, 256))

  const variant = (base, rx, ry) => {
    const t = base.clone()
    t.wrapS = t.wrapT = T.RepeatWrapping
    t.repeat.set(rx, ry)
    t.needsUpdate = true
    return t
  }

  const shared = {
    plaster: new T.MeshStandardMaterial({ color: 0x5e4530, roughness: 1 }),
    dado: new T.MeshStandardMaterial({ color: 0x6e5238, roughness: 0.95 }),
    trimDark: new T.MeshStandardMaterial({ color: 0x231810, roughness: 0.9 }),
    woodDesk: new T.MeshStandardMaterial({ color: 0x452c16, roughness: 0.8, map: variant(oak, 2, 1) }),
    // Not wired up yet: the bookcase's own shelf wood is still minted by
    // buildBookcase.js (outside study/, and outside this task's file list),
    // at these same values. Defined here — at the value it must eventually
    // match — so the name exists for whichever later task rewires the
    // bookcase through study/materials.js; it has no consumer yet, so it
    // has no visible effect either way.
    woodShelf: new T.MeshStandardMaterial({ color: 0x3d2814, roughness: 0.86, map: variant(walnut, 2, 2) }),
    woodLadder: new T.MeshStandardMaterial({ color: 0x6b4a26, roughness: 0.8, map: variant(oak, 1, 4) }),
    woodCredenza: new T.MeshStandardMaterial({ color: 0x54371c, roughness: 0.72, map: variant(walnut, 2, 1) }),
    woodSide: new T.MeshStandardMaterial({ color: 0x4d3218, roughness: 0.78, map: variant(oak, 1, 1) }),
    // Was duplicated identically in desk.js (pen trim — now make.penTrim,
    // since the pen IS tinted), dressing.js (clock boss) and turntable.js
    // (spindle, tonearm base). This instance is only for the latter two,
    // which are never tinted.
    brass: new T.MeshStandardMaterial({ color: 0xa8862f, roughness: 0.28, metalness: 0.85 }),
    // The mug's inner wall (BackSide) — untinted, unlike the mug's outer
    // ceramic (base/rim/handle/saucer/shell), which stays a make() below.
    ceramicPlain: new T.MeshStandardMaterial({ color: 0xd8cdb8, roughness: 0.4, side: T.BackSide }),
    // The reading corner's throw, draped over the armchair's arm.
    cloth: new T.MeshStandardMaterial({ color: 0x9c7a3e, roughness: 0.98, map: variant(weave, 2, 2) }),
    // The floor. A large repeat so the boards read long rather than tiling
    // visibly across a 200-unit plane.
    floorBoards: new T.MeshStandardMaterial({ color: 0x4a3524, roughness: 0.94, map: variant(walnut, 8, 8) }),
    leatherRed: new T.MeshStandardMaterial({ color: 0x6d3b34, roughness: 0.94, map: variant(weave, 3, 3) }),
    // The armchair's cushions, a shade warmer than its frame so they read as
    // separate objects sitting in it rather than part of the same carcass.
    // Was minted inline in readingCorner.js until the cushions were split out.
    cushionRed: new T.MeshStandardMaterial({ color: 0x7d453b, roughness: 0.96, map: variant(weave, 2, 2) }),
  }

  // Every one of these backs a mesh listed in a study/index.js deskTargets
  // `tint` array, so it must never be shared — see the module comment above.
  const make = {
    papers: () => new T.MeshStandardMaterial({ color: 0xe8dfc9, roughness: 0.92 }),
    cvSheet: () => new T.MeshStandardMaterial({ color: 0xf4eee1, roughness: 0.94, transparent: true }),
    // Called twice by desk.js — once for the notebook's cloth body, once for
    // its cover face — same as the two separate same-values instances the
    // scene already built.
    notebookCloth: () => new T.MeshStandardMaterial({ color: 0x2e3b44, roughness: 0.85 }),
    lampShade: () => new T.MeshStandardMaterial({ color: 0x8c6b34, roughness: 0.55, metalness: 0.18, side: T.DoubleSide }),
    ceramic: () => new T.MeshStandardMaterial({ color: 0xe6ddcc, roughness: 0.34, metalness: 0.04 }),
    penBody: () => new T.MeshStandardMaterial({ color: 0x1d1a17, roughness: 0.34, metalness: 0.35 }),
    penTrim: () => new T.MeshStandardMaterial({ color: 0xa8862f, roughness: 0.28, metalness: 0.85 }),
    catFur: () => new T.MeshStandardMaterial({ color: 0xe4d8c4, roughness: 0.95 }),
    catMark: () => new T.MeshStandardMaterial({ color: 0x8a5836, roughness: 0.95 }),
  }

  return { shared, make, textures: { oak, walnut, weave } }
}
