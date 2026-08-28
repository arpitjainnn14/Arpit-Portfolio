import * as THREE from 'three'
import { bevelBox } from './geom'

// The chair at the desk. Split out of desk.js in Task R4 — the chair was
// modelled as a group of meshes added straight onto the desk group (never
// its own scene node), so it stays that way here: buildDesk returns
// out.desk, and study/index.js calls this builder afterward, passing that
// group in as opts.deskGroup. Every position below is desk-local, exactly
// as it was in desk.js — moving the chair here changed nothing about where
// or how it sits.

const FL = -17.2 // floor level

export default function buildChair(scene, tex, { materials, deskGroup }) {
  const T = THREE
  const out = {}
  const trim = materials.shared.trimDark
  const deskMat = materials.shared.woodDesk
  const desk = deskGroup

  const chair = new T.Group()
  desk.add(chair)

  // Slightly narrower and shorter than the backrest so their sides and back
  // don't share a plane — same z-fighting cause as the posts.
  const seat = new T.Mesh(bevelBox(7.8, 0.7, 8), deskMat)
  seat.position.set(0, FL + 6.2, 12.9)
  seat.castShadow = true
  seat.receiveShadow = true
  chair.add(seat)

  // Tapered rather than square, like the desk's legs — a cylinder with a
  // smaller foot radius reads as a turned leg instead of scaffolding. Same
  // footprint and height as the old square legs.
  ;[[-3.4, 9.8], [3.4, 9.8], [-3.4, 16.2], [3.4, 16.2]].forEach(([x, z]) => {
    const leg = new T.Mesh(new T.CylinderGeometry(0.42, 0.32, 6.2, 10), trim)
    leg.position.set(x, FL + 3.12, z)
    leg.castShadow = true
    chair.add(leg)
  })

  // The back posts were modelled at exactly the backrest's depth AND exactly
  // the rear legs' width, so those surfaces were coincident and the depth test
  // flickered between them — the hatched stripe down the chair. Slimmer and
  // shifted back by a fraction, they share no plane with anything. Left
  // untouched by the R4 redesign below — the slats/rails are new members
  // that don't reintroduce a coincident face with these.
  ;[-3.4, 3.4].forEach((x) => {
    const post = new T.Mesh(bevelBox(0.7, 10.6, 0.7, 0.06), trim)
    post.position.set(x, FL + 5.35, 16.75)
    post.castShadow = true
    chair.add(post)
  })

  // ——— back: top rail, three slats, lower rail ——————————————————
  // Replaces the old solid chairBack slab (bevelBox(8, 8.4, 0.8) centered at
  // y = FL+10.6) — every rail/slat below is sized to fill that exact
  // silhouette (x: -4..4, y: FL+6.4..FL+15.0) so the chair's outline is
  // unchanged, only what fills it. None of these share a depth (z-span) with
  // the posts (z 16.4..17.1) or with each other, so no coincident faces.
  const topRail = new T.Mesh(bevelBox(7.2, 1.2, 0.7, 0.06), deskMat)
  topRail.position.set(0, FL + 14.4, 16.6)
  topRail.castShadow = true
  topRail.receiveShadow = true
  chair.add(topRail)

  const lowerRail = new T.Mesh(bevelBox(7.2, 1.0, 0.7, 0.06), deskMat)
  lowerRail.position.set(0, FL + 6.9, 16.6)
  lowerRail.castShadow = true
  lowerRail.receiveShadow = true
  chair.add(lowerRail)

  ;[-2.0, 0, 2.0].forEach((x) => {
    const slat = new T.Mesh(bevelBox(1.0, 6.4, 0.5, 0.06), deskMat)
    slat.position.set(x, FL + 10.6, 16.6)
    slat.castShadow = true
    slat.receiveShadow = true
    chair.add(slat)
  })

  out.chair = chair
  return out
}
