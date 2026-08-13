import * as THREE from 'three'
import { shelfTitles } from '../data/book'

// The bookcase and the ~50 neighbouring volumes on its three shelves.
//
// The layout comes from a fixed seed (7) run through a Lehmer generator, so the
// shelf is random-looking but identical on every load — the reader's book is
// always in the same slot, and screenshots stay reproducible. Don't reorder the
// rnd() calls; each one shifts every book after it.

export const CASE = { w: 31, h: 34, d: 9 }

// The gap on the middle shelf that the portfolio itself stands in.
const BOOK_GAP = [-0.9, 7.9]

export default function buildBookcase(scene, tex) {
  const T = THREE
  const { w: caseW, h: caseH, d: caseD } = CASE

  const wood = new T.MeshStandardMaterial({ color: 0x3d2814, roughness: 0.86 })
  const woodBack = new T.MeshStandardMaterial({ color: 0x1e1409, roughness: 0.95 })

  const addBox = (w, h, d, x, y, z, mat, cast) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.receiveShadow = true
    if (cast) m.castShadow = true
    scene.add(m)
    return m
  }

  // carcass: back, two sides, top, bottom, two shelves
  addBox(caseW, caseH, 0.6, 0, 0, -caseD / 2 - 0.3, woodBack)
  addBox(0.8, caseH, caseD, -caseW / 2 + 0.4, 0, 0, wood, true)
  addBox(0.8, caseH, caseD, caseW / 2 - 0.4, 0, 0, wood, true)
  addBox(caseW, 0.8, caseD, 0, caseH / 2 - 0.4, 0, wood, true)
  addBox(caseW, 0.8, caseD, 0, -caseH / 2 + 0.4, 0, wood, true)
  addBox(caseW - 1.6, 0.55, caseD - 0.4, 0, 5.6, 0, wood, true)
  addBox(caseW - 1.6, 0.55, caseD - 0.4, 0, -5.6, 0, wood, true)

  let seed = 7
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }

  const spineCols = [
    0x6b3626, 0x33402f, 0x1f2a36, 0x5a4630, 0x7a5a2e,
    0x412a3a, 0x2f3b3f, 0x8a6a3a, 0x3a2a20, 0x62463a,
  ]

  // A titled spine: the text is drawn rotated onto a tall canvas.
  const spineTex = (title, bg) => {
    const c = document.createElement('canvas')
    c.width = 96
    c.height = 640
    const g = c.getContext('2d')
    g.fillStyle = bg
    g.fillRect(0, 0, 96, 640)
    g.save()
    g.translate(48, 320)
    g.rotate(-Math.PI / 2)
    g.fillStyle = 'rgba(240,226,201,.82)'
    g.font = '500 26px "IBM Plex Mono", monospace'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(title, 0, 0, 560)
    g.restore()
    g.strokeStyle = 'rgba(240,226,201,.22)'
    g.lineWidth = 3
    g.strokeRect(8, 30, 80, 580)
    return tex(c)
  }

  // Fill a shelf left to right, dropping in a titled book now and then and
  // skipping `gap` if one is given.
  const addRow = (shelfY, gap, titles) => {
    let x = -caseW / 2 + 1.2
    const queue = (titles || []).slice(0)
    while (x < caseW / 2 - 1.6) {
      let w = 0.6 + rnd() * 1.5
      const named = queue.length && rnd() > 0.62
      if (named) w = 1.7
      if (gap && x + w > gap[0] && x < gap[1]) {
        x = gap[1] + 0.25
        continue
      }
      const h = named ? 9.4 : 6.8 + rnd() * 3.0
      const d = 5.6 + rnd() * 1.8
      const col = spineCols[Math.floor(rnd() * spineCols.length)]
      let mat
      if (named) {
        const hex = '#' + col.toString(16).padStart(6, '0')
        const face = new T.MeshStandardMaterial({ map: spineTex(queue.shift(), hex), roughness: 0.86 })
        const plain = new T.MeshStandardMaterial({ color: col, roughness: 0.88 })
        mat = [plain, plain, plain, plain, face, plain]
      } else {
        mat = new T.MeshStandardMaterial({ color: col, roughness: 0.88 })
      }
      const b = addBox(w, h, d, x + w / 2, shelfY + h / 2, -0.4 + rnd() * 0.5, mat, false)
      if (!named && rnd() > 0.9) b.rotation.z = (rnd() - 0.5) * 0.16 // one leaner per shelf, roughly
      x += w + 0.12 + rnd() * 0.14
    }
  }

  addRow(-16.6, null, shelfTitles.bottom)
  addRow(-5.3, BOOK_GAP, shelfTitles.middle)
  addRow(5.9, null, shelfTitles.top)
}
