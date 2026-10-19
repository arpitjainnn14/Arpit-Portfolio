import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // three.js and html2canvas are the bulk of the 3D edition and they
        // essentially never change, while the room code above them changes
        // constantly. Left in one chunk, every tweak to the study invalidates
        // the whole ~1MB for returning visitors; split out, a room change
        // re-downloads only the room.
        //
        // Rolldown (Vite 8) takes manualChunks as a FUNCTION — the object form
        // Rollup accepted throws "manualChunks is not a function" at build time.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/html2canvas')) return 'raster'
          return null
        },
      },
    },
    // The three chunk is ~725kB and that is expected, not bloat: it sits behind
    // the edition gate's lazy import, so a phone rendering the flat book never
    // fetches it. The default 500kB warning exists to catch surprises, and this
    // one is deliberate and measured.
    chunkSizeWarningLimit: 800,
  },
})
