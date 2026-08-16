import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // We only use the MoveNet runtime from @tensorflow-models/pose-detection.
      // Its BlazePose code path imports @mediapipe/pose, which isn't valid
      // ESM and breaks the production bundle if left in.
      '@mediapipe/pose': path.resolve(dirname, 'src/stubs/empty.ts'),
    },
  },
})
