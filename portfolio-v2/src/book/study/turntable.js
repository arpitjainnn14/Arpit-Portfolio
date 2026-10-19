import * as THREE from 'three'
import { bevelBox } from './geom'

// The record player, on a credenza under the back-wall window: body, legs,
// plinth, a spinning platter carrying a drawn-canvas record, a tonearm that
// eases toward its playing/resting angle, and a few leaning sleeves.
// Transcribed from SRC:1775–1851 (the build) and SRC:2342–2351 (the per-frame
// spin/tonearm easing).

const FL = -17.2 // floor level

export default function buildTurntable(scene, tex, { materials }) {
  const T = THREE
  // Task R1: brassMat/credMat used to be same-values duplicates/one-offs —
  // now shared instances owned by study/materials.js. See dressing.js's
  // brassMat for the other half of the brass duplication this collapses.
  const trim = materials.shared.trimDark
  const brassMat = materials.shared.brass

  const credMat = materials.shared.woodCredenza
  const cred = new T.Group()
  cred.position.set(26, FL, -2.6)

  const credBody = new T.Mesh(bevelBox(16, 8.4, 6, 0.12), credMat)
  credBody.position.y = 6.2
  credBody.castShadow = true
  credBody.receiveShadow = true
  cred.add(credBody)

  ;[[-6.4, -2], [6.4, -2], [-6.4, 2], [6.4, 2]].forEach(([x, z]) => {
    const leg = new T.Mesh(bevelBox(0.8, 2, 0.8, 0.06), trim)
    leg.position.set(x, 1, z)
    leg.castShadow = true
    cred.add(leg)
  })

  const plinth = new T.Mesh(
    bevelBox(8.6, 1.4, 6.6),
    new T.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.6 })
  )
  plinth.position.set(-1.4, 11.1, 0)
  plinth.castShadow = true
  plinth.receiveShadow = true
  cred.add(plinth)

  const platter = new T.Group()
  platter.position.set(-1.6, 11.9, 0)
  const platterDisc = new T.Mesh(
    new T.CylinderGeometry(2.9, 2.9, 0.3, 34),
    new T.MeshStandardMaterial({ color: 0x8a7350, roughness: 0.5, metalness: 0.5 })
  )
  platter.add(platterDisc)

  // The record's label — grooves, a brass label ring, and the "SIDE A / LATE
  // SET" imprint — drawn once onto a 256px canvas rather than modelled.
  const recC = document.createElement('canvas')
  recC.width = recC.height = 256
  {
    const g = recC.getContext('2d')
    g.fillStyle = '#100d0b'
    g.beginPath(); g.arc(128, 128, 128, 0, Math.PI * 2); g.fill()
    g.strokeStyle = 'rgba(255,240,210,.06)'
    for (let r = 46; r < 124; r += 3) {
      g.lineWidth = 1
      g.beginPath(); g.arc(128, 128, r, 0, Math.PI * 2); g.stroke()
    }
    g.fillStyle = '#b5762c'
    g.beginPath(); g.arc(128, 128, 42, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#f4e6c8'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '500 17px "IBM Plex Mono", monospace'
    g.fillText('SIDE A', 128, 116)
    g.font = '500 12px "IBM Plex Mono", monospace'
    g.fillText('LATE SET', 128, 140)
    g.fillStyle = '#0e0b08'
    g.beginPath(); g.arc(128, 128, 5, 0, Math.PI * 2); g.fill()
  }
  const record = new T.Mesh(
    new T.CircleGeometry(2.7, 42),
    new T.MeshStandardMaterial({ map: tex(recC), roughness: 0.34, metalness: 0.1 })
  )
  record.rotation.x = -Math.PI / 2
  record.position.y = 0.17
  platter.add(record)
  cred.add(platter)

  const spindle = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.7, 8), brassMat)
  spindle.position.set(-1.6, 12.2, 0)
  cred.add(spindle)

  const armPivot = new T.Group()
  armPivot.position.set(1.9, 12.1, -2.2)
  const armBase = new T.Mesh(new T.CylinderGeometry(0.42, 0.5, 0.7, 14), brassMat)
  armPivot.add(armBase)
  const armTube = new T.Mesh(
    new T.BoxGeometry(0.18, 0.18, 5.4),
    new T.MeshStandardMaterial({ color: 0xcbb27a, roughness: 0.3, metalness: 0.8 })
  )
  armTube.position.set(0, 0.34, 2.5)
  armPivot.add(armTube)
  const headshell = new T.Mesh(
    new T.BoxGeometry(0.5, 0.34, 0.9),
    new T.MeshStandardMaterial({ color: 0x1e1a15, roughness: 0.5 })
  )
  headshell.position.set(0, 0.22, 5.1)
  armPivot.add(headshell)
  armPivot.rotation.y = -0.52 // parked pose; update() eases it into place from here
  cred.add(armPivot)

  // A single invisible box takes the click for the whole unit — the raycast
  // (study/index.js's deskHits) is non-recursive.
  const vinylHit = new T.Mesh(
    new T.BoxGeometry(9.6, 4.2, 7.4),
    new T.MeshBasicMaterial({ visible: false })
  )
  vinylHit.position.set(-1.2, 12, 0)
  cred.add(vinylHit)

  // a few sleeves leaning against the credenza
  ;[[-9.4, 0.24, 0x6b3626], [-8.9, 0.3, 0x33402f], [-8.4, 0.2, 0x7a5a2e]].forEach(([x, lean, col]) => {
    const sleeve = new T.Mesh(
      new T.BoxGeometry(6.4, 6.4, 0.4),
      new T.MeshStandardMaterial({ color: col, roughness: 0.9 })
    )
    sleeve.position.set(x, 3.4, 2.4)
    sleeve.rotation.set(0, 0.16, lean)
    sleeve.castShadow = true
    cred.add(sleeve)
  })

  scene.add(cred)

  // The needle starts down: the record spins and the arm rests on it as soon
  // as the room loads. `state` is the live source of truth — `playing` below
  // is just the build-time snapshot the produced handle bag advertises;
  // toggle() and update() both close over `state` directly.
  const state = { playing: true, spin: 0 }

  return {
    vinylHit,
    playing: state.playing,
    toggle() {
      state.playing = !state.playing
      return state.playing
    },
    update(dt) {
      const playing = state.playing !== false
      state.spin += ((playing ? 3.49 : 0) - state.spin) * Math.min(1, dt * 1.6)
      platter.rotation.y += state.spin * dt
      const target = playing ? -0.98 : -0.24
      armPivot.rotation.y += (target - armPivot.rotation.y) * Math.min(1, dt * 2.4)
      armPivot.rotation.x += ((playing ? 0 : 0.13) - armPivot.rotation.x) * Math.min(1, dt * 2.4)
    },
  }
}
