import * as THREE from 'three'
import { bevelBox } from './geom'

// The reading corner across from the desk: an armchair with a throw over its
// arm, a side table carrying a lit candle, and a floor lamp. Transcribed from
// SRC:1594–1664.

const FL = -17.2 // floor level

export default function buildReadingCorner(scene, tex, { materials }) {
  const T = THREE
  const trimMat = materials.shared.trimDark

  // ——— armchair, throw ——————————————————————————————————————
  const chairMat = materials.shared.leatherRed
  const chair = new T.Group()
  chair.position.set(30, FL, 20)
  chair.rotation.y = -0.78
  const cSeat = new T.Mesh(bevelBox(11, 2.4, 10.4), chairMat)
  cSeat.position.y = 5.6
  cSeat.castShadow = true
  cSeat.receiveShadow = true
  chair.add(cSeat)
  // The seat cushion's TOP SURFACE sits at y 8.3 (centre 7.4 + half of 1.8).
  // Lindy is placed at FL + 8.6 in cat.js and measured against exactly this
  // plane, so the cushion's height and thickness must not change — she would
  // float above the chair or sink into it. A softer bevel than the frame's is
  // what makes it read as a cushion rather than another carcass panel.
  const cushionMat = materials.shared.cushionRed
  const cCushion = new T.Mesh(bevelBox(9.6, 1.8, 9, 0.34), cushionMat)
  cCushion.position.y = 7.4
  cCushion.castShadow = true
  chair.add(cCushion)
  const cBack = new T.Mesh(bevelBox(11, 12, 2.2), chairMat)
  cBack.position.set(0, 10.6, -5.6)
  cBack.castShadow = true
  chair.add(cBack)
  // A back cushion resting against the backrest, sitting proud of it so the
  // two read as separate objects.
  const cBackCushion = new T.Mesh(bevelBox(9.4, 6.4, 1.5, 0.34), cushionMat)
  cBackCushion.position.set(0, 10.4, -4.05)
  cBackCushion.rotation.x = 0.06
  cBackCushion.castShadow = true
  chair.add(cBackCushion)
  // Rolled arms. The box is shortened by the roll's radius and the cylinder
  // caps it, so the arm's overall top stays at y 9.2 exactly as before — only
  // its silhouette changes. This is the single detail that most separates an
  // armchair from a stack of boxes.
  const ARM_TOP = 9.2
  const ROLL_R = 1.1
  ;[-5.4, 5.4].forEach((x) => {
    const armR = new T.Mesh(bevelBox(2.2, 5.2 - ROLL_R, 10.4), chairMat)
    armR.position.set(x, ARM_TOP - ROLL_R - (5.2 - ROLL_R) / 2, 0)
    armR.castShadow = true
    chair.add(armR)
    const roll = new T.Mesh(new T.CylinderGeometry(ROLL_R, ROLL_R, 10.4, 16), chairMat)
    // The cylinder runs along the arm's local depth, not the world's — the
    // whole chair group is rotated -0.78.
    roll.rotation.x = Math.PI / 2
    roll.position.set(x, ARM_TOP - ROLL_R, 0)
    roll.castShadow = true
    chair.add(roll)
  })
  // Turned feet: three stacked sections instead of a square post. Total height
  // stays 4.4 so the chair sits at the same level.
  ;[[-4.4, -4.2], [4.4, -4.2], [-4.4, 4.2], [4.4, 4.2]].forEach(([x, z]) => {
    const foot = new T.Group()
    foot.position.set(x, 0, z)
    const pad = new T.Mesh(new T.CylinderGeometry(0.52, 0.44, 0.5, 12), trimMat)
    pad.position.y = 0.25
    pad.castShadow = true
    foot.add(pad)
    const bulb = new T.Mesh(new T.CylinderGeometry(0.38, 0.56, 0.9, 12), trimMat)
    bulb.position.y = 0.95
    bulb.castShadow = true
    foot.add(bulb)
    const shaft = new T.Mesh(new T.CylinderGeometry(0.46, 0.36, 3.0, 12), trimMat)
    shaft.position.y = 2.9
    shaft.castShadow = true
    foot.add(shaft)
    chair.add(foot)
  })
  // Draped OVER the rolled arm rather than towering beside it: the old slab
  // stood 1.2 above the roll and read as a yellow box once the arm gained its
  // curve. Sized and seated so its top meets the roll's top (y 9.2) and it
  // hangs down the outer face.
  const throwCloth = new T.Mesh(bevelBox(2.9, 5.2, 8.4, 0.22), materials.shared.cloth)
  throwCloth.position.set(5.5, ARM_TOP - 2.6, 0.6)
  throwCloth.rotation.z = 0.07
  throwCloth.castShadow = true
  chair.add(throwCloth)
  scene.add(chair)

  // ——— side table, candle ——————————————————————————————————
  const sideTable = new T.Group()
  sideTable.position.set(41, FL, 13)
  const stTop = new T.Mesh(new T.CylinderGeometry(3.6, 3.6, 0.5, 28), materials.shared.woodSide)
  stTop.position.y = 9.4
  stTop.castShadow = true
  stTop.receiveShadow = true
  sideTable.add(stTop)
  const stCol = new T.Mesh(new T.CylinderGeometry(0.6, 0.7, 9.2, 16), trimMat)
  stCol.position.y = 4.7
  stCol.castShadow = true
  sideTable.add(stCol)
  // Tapered rather than near-cylindrical — specified in R4's steps but its
  // file list didn't cover this module, so it lands here.
  const stFoot = new T.Mesh(new T.CylinderGeometry(1.9, 2.7, 0.5, 20), trimMat)
  stFoot.position.y = 0.25
  sideTable.add(stFoot)
  // w is part of SRC's shared [w, t, col] tuple shape, but this volume's width is a fixed 3.6 below
  // eslint-disable-next-line no-unused-vars
  ;[[1.6, 0.7, 0x5a4630], [1.4, 0.6, 0x33402f]].forEach(([w, t, col], i) => {
    const vol = new T.Mesh(bevelBox(3.6, t, 2.6), new T.MeshStandardMaterial({ color: col, roughness: 0.88 }))
    vol.position.set(-0.6, 9.9 + i * 0.66, 0.4)
    vol.rotation.y = i ? 0.14 : -0.08
    vol.castShadow = true
    sideTable.add(vol)
  })
  const candle = new T.Mesh(new T.CylinderGeometry(0.42, 0.46, 2.4, 16), new T.MeshStandardMaterial({ color: 0xf0e2c2, roughness: 0.8 }))
  candle.position.set(1.8, 10.85, -0.6)
  candle.castShadow = true
  sideTable.add(candle)
  const flame = new T.Mesh(new T.SphereGeometry(0.22, 10, 10), new T.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffb347, emissiveIntensity: 3.4, roughness: 0.4 }))
  flame.position.set(1.8, 12.3, -0.6)
  flame.scale.y = 1.7
  sideTable.add(flame)
  const candleLight = new T.PointLight(0xffb347, 16, 22, 2)
  candleLight.position.set(1.8, 12.5, -0.6)
  candleLight.castShadow = false
  sideTable.add(candleLight)
  scene.add(sideTable)

  // ——— floor lamp ——————————————————————————————————————————
  const floorLamp = new T.Group()
  floorLamp.position.set(38.5, FL, 28)
  const flFoot = new T.Mesh(new T.CylinderGeometry(2.6, 3, 0.5, 24), trimMat)
  flFoot.position.y = 0.25
  flFoot.castShadow = true
  floorLamp.add(flFoot)
  const flPole = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 24, 14), new T.MeshStandardMaterial({ color: 0x8a6a32, roughness: 0.4, metalness: 0.6 }))
  flPole.position.y = 12
  flPole.castShadow = true
  floorLamp.add(flPole)
  const flShadeMat = new T.MeshStandardMaterial({ color: 0xe8cf9a, roughness: 0.9, side: T.DoubleSide, emissive: 0xffcf8a, emissiveIntensity: 0.45 })
  const flShade = new T.Mesh(new T.CylinderGeometry(3.4, 4.2, 5.2, 26, 1, true), flShadeMat)
  flShade.position.y = 25.4
  floorLamp.add(flShade)
  const flLight = new T.PointLight(0xffcf94, 120, 78, 2)
  flLight.position.y = 24.6
  flLight.castShadow = false
  floorLamp.add(flLight)
  scene.add(floorLamp)

  return {
    flame,
    candleLight,
    floorLight: flLight,
    floorLightFull: 120,
    floorShadeMat: flShadeMat,
    // The candle's flame flicker — two out-of-phase sines so it doesn't read
    // as a metronome. Runs every frame; ctx.elapsed is the shared clock.
    update(dt, ctx) {
      const f = 1 + Math.sin(ctx.elapsed * 11) * 0.11 + Math.sin(ctx.elapsed * 23) * 0.05
      flame.scale.set(f * 0.92, 1.7 * f, f * 0.92)
      candleLight.intensity = 16 * f
    },
  }
}
