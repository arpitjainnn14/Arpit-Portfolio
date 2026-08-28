// AmbientAudio: the study's soundscape — rain, vinyl surface crackle, a
// procedurally scheduled lounge loop, a page-turn rustle, and a cat purr.
// A direct port of SRC's toggleSound/audioCtx/setAmbient/setVinylGain/
// scheduleMusic/toggleVinyl/startPurr/stopPurr (SRC:856–1050), with every
// filter frequency, Q, gain and ramp time kept as authored.
//
// The one deliberate departure from SRC: nothing here may touch the Web
// Audio API before the sound chip is clicked. That means:
//  - the AudioContext is built lazily, only from `_audioCtx()`, which is
//    only ever reached from a path gated on `this._on`
//  - `purr(true)` checks `this._on` *before* calling `_audioCtx()` — SRC
//    calls `audioCtx()` unconditionally in `startPurr()`, which would spin
//    up (and resume) a context even while the chip reads "sound off"
//  - `scheduleMusic()`'s tick only bails on its *next* tick in SRC, so a
//    backgrounded tab keeps queuing oscillators into a suspended context
//    and they pile up on return. Fixed here to bail immediately and to
//    restart from a `visibilitychange` listener instead.
export default class AmbientAudio {
  constructor() {
    this._on = false
    this.actx = null
    this.amb = null // { master, music, crackle, noiseBuf }, built on first enable
    this.vinylOn = true // the needle: true until setVinyl(false) lifts it
    this.purrState = null
    this._musicTimer = null
    this._bar = 0
    this._rustleBuf = null // separate 0.5s buffer for the page-turn sound

    // Not audio — just bookkeeping for a background/foreground tab so the
    // music loop resumes cleanly instead of piling up. Safe to register
    // before the first click.
    this._visHandler = () => {
      if (document.visibilityState === 'visible' && this._on && this.vinylOn !== false) {
        this._scheduleMusic()
      }
    }
    document.addEventListener('visibilitychange', this._visHandler)
  }

  get on() {
    return this._on
  }

  // ——— public interface ——————————————————————————————————————

  toggle() {
    this._on = !this._on
    this._setAmbient(this._on)
    if (this._on) this.rustle()
    return this._on
  }

  // The turntable: lifting/dropping the needle.
  setVinyl(on) {
    this.vinylOn = on
    this._setVinylGain()
  }

  // The cat: pet on, doze off.
  purr(on) {
    if (on) this._startPurr()
    else this._stopPurr()
  }

  // Page-turn sound. Moved in from BookEngine so there is exactly one
  // AudioContext in the app.
  rustle() {
    if (!this._on) return
    try {
      const ctx = this._audioCtx()
      if (!ctx) return
      if (!this._rustleBuf) {
        const len = Math.floor(ctx.sampleRate * 0.5)
        this._rustleBuf = ctx.createBuffer(1, len, ctx.sampleRate)
        const d = this._rustleBuf.getChannelData(0)
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
      }
      const src = ctx.createBufferSource()
      src.buffer = this._rustleBuf
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.Q.value = 0.8
      const t = ctx.currentTime
      bp.frequency.setValueAtTime(900, t)
      bp.frequency.exponentialRampToValueAtTime(3200, t + 0.26)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
      src.connect(bp)
      bp.connect(g)
      g.connect(ctx.destination)
      src.start(t)
      src.stop(t + 0.5)
    } catch {
      /* audio is a nicety */
    }
  }

  dispose() {
    if (this._musicTimer) {
      clearTimeout(this._musicTimer)
      this._musicTimer = null
    }
    if (this._visHandler) {
      document.removeEventListener('visibilitychange', this._visHandler)
      this._visHandler = null
    }
    if (this.actx && this.actx.state !== 'closed') this.actx.close()
  }

  // ——— internal: the graph, built lazily on first enable —————————

  _audioCtx() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      this.actx = this.actx || new AC()
      if (this.actx.state === 'suspended') this.actx.resume()
      return this.actx
    } catch {
      return null
    }
  }

  _setAmbient(on) {
    const ctx = this._audioCtx()
    if (!ctx) return
    if (!this.amb) {
      const master = ctx.createGain()
      master.gain.value = 0
      master.connect(ctx.destination)

      const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate)
      const nd = noiseBuf.getChannelData(0)
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
      const rain = ctx.createBufferSource()
      rain.buffer = noiseBuf
      rain.loop = true
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 1050
      lp.Q.value = 0.5
      const rg = ctx.createGain()
      rg.gain.value = 0.09
      rain.connect(lp)
      lp.connect(rg)
      rg.connect(master)
      rain.start()

      // vinyl surface noise, only while the needle is down
      const crackBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 3), ctx.sampleRate)
      const cd = crackBuf.getChannelData(0)
      for (let i = 0; i < cd.length; i++) {
        cd[i] = Math.random() < 0.0007 ? (Math.random() * 2 - 1) * 0.7 : 0
      }
      const crack = ctx.createBufferSource()
      crack.buffer = crackBuf
      crack.loop = true
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 1800
      const cg = ctx.createGain()
      cg.gain.value = 0
      crack.connect(hp)
      hp.connect(cg)
      cg.connect(master)
      crack.start()

      const music = ctx.createGain()
      music.gain.value = 0
      const warm = ctx.createBiquadFilter()
      warm.type = 'lowpass'
      warm.frequency.value = 2100
      warm.Q.value = 0.6
      music.connect(warm)
      warm.connect(master)

      this.amb = { master, music, crackle: cg, noiseBuf }
    }
    const t = ctx.currentTime
    this.amb.master.gain.cancelScheduledValues(t)
    this.amb.master.gain.setValueAtTime(this.amb.master.gain.value, t)
    this.amb.master.gain.linearRampToValueAtTime(on ? 1 : 0, t + (on ? 1.2 : 0.6))
    this._setVinylGain()
    if (on) this._scheduleMusic()
  }

  _setVinylGain() {
    if (!this.amb || !this.actx) return
    const t = this.actx.currentTime
    const on = this._on && this.vinylOn !== false
    this.amb.music.gain.cancelScheduledValues(t)
    this.amb.music.gain.setValueAtTime(this.amb.music.gain.value, t)
    this.amb.music.gain.linearRampToValueAtTime(on ? 0.5 : 0, t + (on ? 1.6 : 0.9))
    this.amb.crackle.gain.setTargetAtTime(on ? 0.05 : 0, t, 0.4)
    if (on) this._scheduleMusic()
  }

  // A slow warm loop — a lounge trio at the end of the evening, not a jingle.
  _scheduleMusic() {
    const ctx = this.actx
    if (!ctx || !this.amb || this._musicTimer) return
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)
    const CHORDS = [
      { root: 41, notes: [60, 64, 67, 72] },
      { root: 39, notes: [58, 63, 67, 70] },
      { root: 34, notes: [57, 62, 65, 69] },
      { root: 36, notes: [55, 60, 63, 67] },
    ]
    const MEL = [
      [72, 0], [76, 1.1], [74, 2.2], [null, 0], [79, 0.4], [76, 1.6],
      [null, 0], [72, 0.6], [71, 1.8], [null, 0], [69, 0.8], [72, 2.0],
    ]
    const BAR = 4.4
    let melI = 0
    const voice = (freq, t, dur, gain, type) => {
      const o = ctx.createOscillator()
      o.type = type || 'triangle'
      o.frequency.value = freq
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.5, dur * 0.3))
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      o.connect(g)
      g.connect(this.amb.music)
      o.start(t)
      o.stop(t + dur + 0.05)
    }
    const tick = () => {
      this._musicTimer = null
      if (!this._on || this.vinylOn === false || document.visibilityState !== 'visible') return
      let t = ctx.currentTime + 0.2
      for (let b = 0; b < 4; b++) {
        const ch = CHORDS[(this._bar = (this._bar || 0) + 1) % CHORDS.length]
        ch.notes.forEach((n, i) => {
          voice(hz(n) * (1 + (i % 2 ? 0.0016 : -0.0016)), t + i * 0.05, BAR * 0.92, 0.05)
        })
        voice(hz(ch.root), t, 1.5, 0.1, 'sine')
        voice(hz(ch.root + 7), t + BAR / 2, 1.1, 0.06, 'sine')
        for (let k = 0; k < 3; k++) {
          const m = MEL[melI++ % MEL.length]
          if (m[0]) voice(hz(m[0]), t + m[1], 0.9, 0.055, 'sine')
        }
        // brushed snare on the backbeat
        ;[1, 3].forEach((beat) => {
          const s = ctx.createBufferSource()
          s.buffer = this.amb.noiseBuf
          const bp = ctx.createBiquadFilter()
          bp.type = 'bandpass'
          bp.frequency.value = 4200
          bp.Q.value = 0.9
          const g = ctx.createGain()
          const bt = t + beat * (BAR / 4)
          g.gain.setValueAtTime(0.0001, bt)
          g.gain.exponentialRampToValueAtTime(0.035, bt + 0.02)
          g.gain.exponentialRampToValueAtTime(0.0001, bt + 0.22)
          s.connect(bp)
          bp.connect(g)
          g.connect(this.amb.music)
          s.start(bt)
          s.stop(bt + 0.3)
        })
        t += BAR
      }
      this._musicTimer = setTimeout(tick, BAR * 4 * 1000 - 400)
    }
    tick()
  }

  _startPurr() {
    // SRC calls audioCtx() unconditionally here, which would create (and
    // resume) a context even while sound is off. Guard first instead.
    if (!this._on) return
    const ctx = this._audioCtx()
    if (!ctx) return
    if (!this.amb) this._setAmbient(true)
    if (!this.purrState) {
      const src = ctx.createBufferSource()
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
      src.buffer = buf
      src.loop = true
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 220
      lp.Q.value = 3
      const g = ctx.createGain()
      g.gain.value = 0
      // the tremble that makes it a purr rather than a rumble
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 26
      const lfoG = ctx.createGain()
      lfoG.gain.value = 0.14
      lfo.connect(lfoG)
      lfoG.connect(g.gain)
      lfo.start()
      src.connect(lp)
      lp.connect(g)
      g.connect(this.amb ? this.amb.master : ctx.destination)
      src.start()
      this.purrState = { g }
    }
    const t = ctx.currentTime
    this.purrState.g.gain.cancelScheduledValues(t)
    this.purrState.g.gain.setValueAtTime(this.purrState.g.gain.value, t)
    this.purrState.g.gain.linearRampToValueAtTime(0.16, t + 0.6)
  }

  _stopPurr() {
    if (!this.purrState || !this.actx) return
    const t = this.actx.currentTime
    this.purrState.g.gain.cancelScheduledValues(t)
    this.purrState.g.gain.setValueAtTime(this.purrState.g.gain.value, t)
    this.purrState.g.gain.linearRampToValueAtTime(0, t + 1.4)
  }
}
