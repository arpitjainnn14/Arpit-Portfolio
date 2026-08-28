import * as THREE from 'three'

// Lindy, asleep on the armchair. Transcribed from SRC:1852–1914 (geometry),
// SRC:996–1013 (flickTail/petCat) and SRC:2303–2340 (the per-frame
// breathing/stretch/wake/tail behaviour) — every timing and curve kept as
// authored.
//
// The one deliberate departure from SRC: she's white-brown, not a grey
// tabby, so she needs a saddle patch and a brown tail tip SRC has no
// equivalent for. See the scale/position note by SADDLE_* below.

const FL = -17.2 // floor level

// catBody's rest scale (SRC:1858/1859) — update() reads its live scale
// against these to keep the saddle patch glued to the body as it breathes
// and stretches, since the saddle is a sibling of catBody, not a child of
// it, and so isn't carried along by catBody's own scale automatically.
const BASE_SX = 1.25
const BASE_SY = 0.78
const BASE_SZ = 0.95

// These markings must POKE THROUGH the body, not sit inside it. Earlier
// versions were tuned to stay strictly *contained* within the body ellipsoid —
// which is precisely why Lindy read as an all-white cat: an opaque body hides
// anything inside it, so a perfectly contained marking is invisible by
// construction. Both patches are now sized so a shallow cap breaks the surface:
// max ratio ~1.065 against the body ellipsoid (semi-axes 3.125/1.95/2.375),
// sampled over the whole patch surface. That is proud enough to show a real
// area of brown — the saddle breaks surface over ~46% of its own surface, each
// flank over ~33% — and shallow enough to read as a marking rather than a lump.
const SADDLE_SX = 1.05
const SADDLE_SY = 0.45
const SADDLE_SZ = 0.85
const SADDLE_PX = -0.1
const SADDLE_PY = 0.85

// Flank patches, one per side. The saddle alone sits on her upper BACK, which
// is largely self-occluded from the room's default camera, so the sides are
// where the marking actually has to be for anyone to see it without orbiting.
const FLANK_SX = 0.75
const FLANK_SY = 0.55
const FLANK_SZ = 0.35
const FLANK_PX = -0.2
const FLANK_PY = 0.0
const FLANK_PZ = 1.6

export default function buildCat(scene, tex, { engine, materials }) {
  const T = THREE

  // ——— the one deliberate departure from SRC: white-brown, not grey tabby ———
  // catFur/catMark are hover-tinted (petting Lindy, flicking her tail), so
  // Task R1 gives them make() calls rather than a shared instance — see the
  // HAZARD note in the task brief and study/index.js's deskTargets.
  const catFur = materials.make.catFur() // warm off-white
  const catMark = materials.make.catMark() // brown
  const catLid = new T.MeshStandardMaterial({ color: 0x6b432a, roughness: 0.95 })

  const cat = new T.Group()
  cat.position.set(30, FL + 8.6, 20)
  cat.rotation.y = -0.78 + 0.5

  const catBody = new T.Mesh(new T.SphereGeometry(2.5, 20, 16), catFur)
  catBody.scale.set(BASE_SX, BASE_SY, BASE_SZ)
  catBody.castShadow = true
  cat.add(catBody)

  // a saddle patch across the back — see the SADDLE_* note above
  const saddle = new T.Mesh(new T.SphereGeometry(2.5, 20, 16), catMark)
  saddle.scale.set(SADDLE_SX, SADDLE_SY, SADDLE_SZ)
  saddle.position.set(SADDLE_PX, SADDLE_PY, 0)
  cat.add(saddle)

  // one per side, so she reads brown from either direction
  const flanks = [1, -1].map((sign) => {
    const f = new T.Mesh(new T.SphereGeometry(2.5, 16, 12), catMark)
    f.scale.set(FLANK_SX, FLANK_SY, FLANK_SZ)
    f.position.set(FLANK_PX, FLANK_PY, FLANK_PZ * sign)
    cat.add(f)
    return { mesh: f, sign }
  })

  const catHead = new T.Group()
  catHead.position.set(2.5, 0.55, 0.45)
  const skull = new T.Mesh(new T.SphereGeometry(1.25, 18, 14), catFur)
  skull.castShadow = true
  catHead.add(skull)
  const muzzle = new T.Mesh(new T.SphereGeometry(0.62, 12, 10), catFur)
  muzzle.position.set(0.85, -0.32, 0)
  catHead.add(muzzle)
  ;[[0, 0.62], [0, -0.62]].forEach(([dx, dz]) => {
    const ear = new T.Mesh(new T.ConeGeometry(0.44, 0.9, 4), catMark)
    ear.position.set(-0.2 + dx, 1.05, dz)
    ear.rotation.z = -0.16
    catHead.add(ear)
  })
  const catLids = []
  ;[0.5, -0.5].forEach((dz) => {
    const lid = new T.Mesh(new T.BoxGeometry(0.42, 0.07, 0.28), catLid)
    lid.position.set(0.82, 0.06, dz)
    catHead.add(lid)
    catLids.push(lid)
  })
  const catEyes = []
  ;[0.5, -0.5].forEach((dz) => {
    const eye = new T.Mesh(
      new T.SphereGeometry(0.16, 10, 8),
      new T.MeshStandardMaterial({ color: 0xc8d06a, emissive: 0x8f9a3a, emissiveIntensity: 0.5, roughness: 0.4 })
    )
    eye.position.set(0.86, 0.1, dz)
    eye.scale.set(0.7, 1, 1)
    eye.visible = false
    catHead.add(eye)
    catEyes.push(eye)
  })
  cat.add(catHead)

  const tail = new T.Group()
  tail.position.set(-2.4, -0.2, 0.6)
  const tailArc = new T.Mesh(new T.TorusGeometry(1.5, 0.3, 8, 22, Math.PI * 1.15), catFur)
  tailArc.rotation.x = Math.PI / 2
  tailArc.rotation.z = 0.4
  tailArc.castShadow = true
  tail.add(tailArc)
  // and a brown tail tip
  const tailTip = new T.Mesh(new T.SphereGeometry(0.32, 10, 8), catMark)
  tailTip.position.set(1.42, 0, 0.1)
  tail.add(tailTip)
  cat.add(tail)

  const tailHit = new T.Mesh(new T.BoxGeometry(4.0, 3.4, 4.6), new T.MeshBasicMaterial({ visible: false }))
  tailHit.position.set(-3.4, -0.1, 0.6)
  cat.add(tailHit)

  const catHit = new T.Mesh(new T.BoxGeometry(5.6, 5.2, 5.4), new T.MeshBasicMaterial({ visible: false }))
  catHit.position.set(1.9, 0.4, 0)
  cat.add(catHit)

  scene.add(cat)

  // ——— behaviour ————————————————————————————————————————————
  // A flat bag rather than several closed-over `let`s so the shape of what
  // update() is driving each frame reads in one place.
  const state = {
    catAwake: 0, // counts down from 9 while she's awake
    _wake: 0, // smoothed 0..1 version of catAwake, eased at 3.2/s
    pets: 0,
    tailPets: 0,
    wagT: 0,
    wagAmp: 0,
    wagIdle: 4, // first idle burst ~4s in, same as SRC's undefined-defaults-to-4
    _wagE: 0,
  }

  function setCatLabel(text) {
    if (engine && engine.hotspots) engine.hotspots.setLabel('cat', text)
  }
  function setTailLabel(text) {
    if (engine && engine.hotspots) engine.hotspots.setLabel('tail', text)
  }

  // A nudge: she wakes, looks up, and purrs. Both a direct pet and the third
  // tail touch (while asleep) land here.
  function wake() {
    state.catAwake = 9
    state.pets += 1
    if (engine && engine.ambient) engine.ambient.purr(true)
    setCatLabel(state.pets > 2 ? 'purring' : 'lindy woke up')
    return state.pets
  }

  // The tail answers on its own: a short burst of swishes, then still again.
  // Touching it starts a longer burst without necessarily waking her — three
  // touches do.
  function flickTail(strong) {
    state.wagT = strong === false ? 2.4 : 4.2
    state.wagAmp = strong === false ? 0.34 : 1
    state.wagIdle = 5 + Math.random() * 7
    if (strong === false) return
    state.tailPets += 1
    if (state.tailPets >= 3 && !(state.catAwake > 0)) wake()
    setTailLabel(state.tailPets >= 3 ? "now she's up" : state.tailPets === 2 ? 'tail flicking' : 'she twitched it')
  }

  return {
    catHit,
    catTailHit: tailHit,
    catFur,
    catMark,
    pet: wake,
    flickTail,

    // Runs every frame — allocates nothing; all scratch lives in `state`.
    update(dt, ctx) {
      const t = ctx.elapsed

      if (state.catAwake > 0) {
        state.catAwake = Math.max(0, state.catAwake - dt)
        if (state.catAwake === 0) {
          if (engine && engine.ambient) engine.ambient.purr(false)
          setCatLabel('back to sleep')
        }
      }
      const wakeT = state.catAwake > 0 ? 1 : 0
      state._wake += (wakeT - state._wake) * Math.min(1, dt * 3.2)
      const wake_ = state._wake
      const breath = 1 + Math.sin(t * (1.5 + wake_ * 1.6)) * (0.028 + wake_ * 0.02)
      const cyc = (t + 9) % 38
      const s = wake_ < 0.2 && cyc < 2.4 ? Math.sin((cyc / 2.4) * Math.PI) : 0
      catBody.scale.set(BASE_SX + s * 0.3, (BASE_SY + s * 0.05 + wake_ * 0.06) * breath, BASE_SZ - s * 0.05)

      // the saddle isn't a child of catBody (it has to sit in `cat`-space so
      // its own scale/position tune independently of the body's), so it has
      // to track the same breathing/stretch deformation by hand or it reads
      // as floating loose over her back rather than painted on it
      const rx = catBody.scale.x / BASE_SX
      const ry = catBody.scale.y / BASE_SY
      const rz = catBody.scale.z / BASE_SZ
      saddle.scale.set(SADDLE_SX * rx, SADDLE_SY * ry, SADDLE_SZ * rz)
      saddle.position.set(SADDLE_PX * rx, SADDLE_PY * ry, 0)
      for (const f of flanks) {
        f.mesh.scale.set(FLANK_SX * rx, FLANK_SY * ry, FLANK_SZ * rz)
        f.mesh.position.set(FLANK_PX * rx, FLANK_PY * ry, FLANK_PZ * f.sign * rz)
      }

      catHead.position.x = 2.5 + s * 0.75 + wake_ * 0.25
      catHead.position.y = 0.55 + wake_ * 1.15
      catHead.rotation.z = -s * 0.32 + wake_ * 0.34
      catHead.rotation.y = wake_ * Math.sin(t * 0.9) * 0.22

      // idle bursts between intervals, plus whatever a touch just triggered
      state.wagIdle -= dt
      if (state.wagIdle <= 0) flickTail(false)
      state.wagT = Math.max(0, state.wagT - dt)
      const burst = state.wagT > 0 ? Math.min(1, state.wagT / 0.7) * state.wagAmp : 0
      state._wagE += (burst - state._wagE) * Math.min(1, dt * 7)
      const swish = Math.sin(t * 7.4) * 0.62 * state._wagE
      const curl = Math.sin(t * 3.7) * 0.16 * state._wagE
      tail.rotation.z = s * 0.8 + wake_ * 0.35 + curl
      tail.rotation.y = swish + wake_ * Math.sin(t * 3.4) * 0.22
      tail.position.y = -0.2 + s * 0.55 + wake_ * 0.3 + Math.abs(swish) * 0.24
      tailArc.rotation.z = 0.4 - state._wagE * 0.3

      for (const l of catLids) l.visible = wake_ < 0.5
      for (const e of catEyes) e.visible = wake_ >= 0.5
    },
  }
}
