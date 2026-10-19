import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Task R2: bevelled boxes for the furniture that was reading as razor-edged
// primitives — desk top, chair, armchair, credenza, ladder, floor books,
// picture and window frames. Every hard-edged box in the study went through
// `new T.BoxGeometry(...)`; this is the one place that decides whether a
// given box gets a chamfer instead, so the radius/segment choice (and the
// clamp that keeps it safe) lives in one spot rather than being re-derived
// at each call site.
//
// Radius guidance (study/*.js call sites follow this): 0.12 for large
// furniture surfaces (desk top, credenza body), 0.06 for smaller members
// (legs, rails, rungs), this function's default (0.09) elsewhere.
//
// A bevel radius bigger than half the thinnest side inverts the geometry —
// several parts in this room are thin (glazing bars, the pen's clip,
// curtain slabs) so every call clamps against the part's own dimensions,
// and falls back to a plain box when there's nothing left to round. Two
// segments is enough to read as a chamfer at this scale; more is wasted
// triangles on a room that already draws ~264 calls a frame.
export function bevelBox(w, h, d, radius = 0.09, segments = 2) {
  const r = Math.min(radius, Math.min(w, h, d) / 2 - 0.001)
  if (r <= 0.002) return new THREE.BoxGeometry(w, h, d) // too thin to bevel meaningfully
  return new RoundedBoxGeometry(w, h, d, segments, r)
}
