// Procedural surfaces for the study, drawn to canvases at build time so the
// room needs no image assets. These are pure canvas generators — callers wrap
// them in textures and set the colour space and repeat themselves, because the
// right repeat depends on how large the surface is in world units.

// Sawn timber. The growth rings are sine-perturbed vertical bands at two
// frequencies, so the grain wanders the way real boards do rather than reading
// as printed stripes.
export function woodTexture(base, grain, w = 512, h = 512) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')

  g.fillStyle = base
  g.fillRect(0, 0, w, h)

  const RINGS = 46
  g.strokeStyle = grain
  for (let i = 0; i < RINGS; i++) {
    const x = (i / RINGS) * w + Math.sin(i * 1.7) * 6
    g.globalAlpha = 0.06 + (i % 3) * 0.035
    g.lineWidth = 1 + (i % 4) * 0.7
    g.beginPath()
    for (let y = 0; y <= h; y += 8) {
      // Two frequencies, so the wander never resolves into a clean sine.
      const dx = Math.sin(y * 0.011 + i) * 7 + Math.sin(y * 0.043 + i * 2) * 2.5
      g.lineTo(x + dx, y)
    }
    g.stroke()
  }

  // Flecks: short horizontal ticks so the flat areas between rings aren't
  // perfectly uniform. Without these the wood reads as a gradient at distance.
  g.lineWidth = 1
  for (let i = 0; i < 40; i++) {
    const fx = Math.random() * w
    const fy = Math.random() * h
    g.globalAlpha = 0.02 + Math.random() * 0.03
    g.beginPath()
    g.moveTo(fx, fy)
    g.lineTo(fx + 3 + Math.random() * 9, fy)
    g.stroke()
  }

  g.globalAlpha = 1
  return c
}

// A weave is a crosshatch at low alpha — threads one way, then the other, then
// a little noise so it doesn't read as graph paper.
export function weaveTexture(base, thread, w = 256, h = 256) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')

  g.fillStyle = base
  g.fillRect(0, 0, w, h)
  g.strokeStyle = thread

  const STEP = 4
  for (let x = 0; x < w; x += STEP) {
    g.globalAlpha = 0.05 + Math.random() * 0.04
    g.lineWidth = 1 + Math.random()
    g.beginPath()
    g.moveTo(x, 0)
    g.lineTo(x, h)
    g.stroke()
  }
  for (let y = 0; y < h; y += STEP) {
    g.globalAlpha = 0.05 + Math.random() * 0.04
    g.lineWidth = 1 + Math.random()
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(w, y)
    g.stroke()
  }

  // Slub: single-pixel noise, the irregularity that stops a regular grid from
  // reading as a printed pattern.
  g.fillStyle = thread
  g.globalAlpha = 0.03
  for (let i = 0; i < 400; i++) {
    g.fillRect(Math.random() * w, Math.random() * h, 1, 1)
  }

  g.globalAlpha = 1
  return c
}
