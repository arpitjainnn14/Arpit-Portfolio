import * as THREE from 'three'

// The shell of the study: walls, ceiling, baseboard trim, the floor and the
// rug. Moved verbatim out of the old buildStudy.js — see study/index.js for
// how the pieces are wired back together.
//
// The floor joined this module in Task R1 — it used to live in
// BookEngine.js, next to the room but outside any builder, unreachable by
// anything that wanted to touch its material. `plaster`/`dado`/`trimDark`
// now come from study/materials.js via `opts.materials` instead of being
// minted here, so the wall colour has one owner shared with every other
// builder that touches trim.

const FL = -17.2 // floor level

export default function buildRoom(scene, tex, { materials }) {
  const T = THREE
  const { plaster, dado, trimDark } = materials.shared

  const addBox = (w, h, d, x, y, z, mat, cast) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.receiveShadow = true
    if (cast) m.castShadow = true
    scene.add(m)
    return m
  }

  // ——— the room ———————————————————————————————————————————————
  const ceilingMat = new T.MeshStandardMaterial({ color: 0x3c2817, roughness: 0.92 })
  // The dado's cap trim is a different, lighter dark than trimDark — a
  // one-off rather than folded into the shared trim colour.
  const dadoCapMat = new T.MeshStandardMaterial({ color: 0x2e2015, roughness: 0.9 })
  const backWall = addBox(140, 62, 1, 0, FL + 31, -7, plaster)
  const leftWall = addBox(1, 62, 90, -58, FL + 31, 38, plaster)
  const rightWall = addBox(1, 62, 90, 58, FL + 31, 38, plaster)
  addBox(140, 1, 90, 0, FL + 62, 38, ceilingMat)
  addBox(140, 1.6, 1.4, 0, FL + 0.8, -6.2, trimDark)

  // Dado rail and cap
  addBox(140, 12, 1.2, 0, FL + 6, -6.35, dado)
  addBox(140, 1.1, 1.8, 0, FL + 12.2, -6.25, dadoCapMat)

  // ——— the floor ——————————————————————————————————————————————
  // Moved out of BookEngine.js so the room owns its own surfaces. The colour
  // and roughness are unchanged; the boards map comes from study/materials.js
  // at a large repeat, since a single tile across 200 units would read as a
  // stretched decal rather than a floor.
  const floor = new T.Mesh(new T.PlaneGeometry(200, 200), materials.shared.floorBoards)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -17.2
  floor.receiveShadow = true
  scene.add(floor)

  // Rug with canvas texture
  const rugC = document.createElement('canvas')
  rugC.width = 640
  rugC.height = 400
  {
    const g = rugC.getContext('2d')
    g.fillStyle = '#7c3a2f'
    g.fillRect(0, 0, 640, 400)
    g.strokeStyle = 'rgba(233,214,178,.46)'
    g.lineWidth = 8
    g.strokeRect(26, 26, 588, 348)
    g.strokeStyle = 'rgba(233,214,178,.2)'
    g.lineWidth = 3
    g.strokeRect(48, 48, 544, 304)
    g.fillStyle = 'rgba(52,22,18,.5)'
    for (let i = 0; i < 9; i++) {
      const cx = 96 + i * 56
      g.beginPath()
      g.moveTo(cx, 154)
      g.lineTo(cx + 32, 200)
      g.lineTo(cx, 246)
      g.lineTo(cx - 32, 200)
      g.closePath()
      g.fill()
    }
    g.globalAlpha = 0.1
    for (let i = 0; i < 220; i++) {
      g.fillStyle = i % 2 ? '#000' : '#fff'
      g.fillRect(0, (i * 13.7) % 400, 640, 1)
    }
    g.globalAlpha = 1
  }
  const rug = new T.Mesh(new T.PlaneGeometry(56, 34), new T.MeshStandardMaterial({ map: tex(rugC), roughness: 0.98 }))
  rug.rotation.x = -Math.PI / 2
  rug.position.set(0, FL + 0.06, 16)
  rug.receiveShadow = true
  scene.add(rug)

  return { floor, rug, walls: [backWall, leftWall, rightWall] }
}
