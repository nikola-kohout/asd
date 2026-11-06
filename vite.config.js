import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync } from 'node:fs'
import { resolve } from 'node:path'

const cesiumSource = resolve(import.meta.dirname, 'node_modules/cesium/Build/Cesium')
const cesiumBaseUrl = 'cesium'

// Cesium loads Workers, Assets, Widgets and ThirdParty at runtime from
// window.CESIUM_BASE_URL (set in kml.html). In dev we serve them straight from
// node_modules; on build we copy them into dist/cesium.
function cesiumStatic() {
  let outDir
  return {
    name: 'cesium-static',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use(`/${cesiumBaseUrl}`, (req, res, next) => {
        req.url = `/@fs${cesiumSource}${req.url}`
        server.middlewares.handle(req, res, next)
      })
    },
    writeBundle() {
      for (const dir of ['Workers', 'ThirdParty', 'Assets', 'Widgets']) {
        cpSync(resolve(cesiumSource, dir), resolve(outDir, cesiumBaseUrl, dir), { recursive: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cesiumStatic()],
  // Relative asset paths so the build works under any subpath (e.g. GitHub Pages /asd/).
  base: './',
  build: {
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        kml: resolve(import.meta.dirname, 'kml.html'),
      },
    },
  },
})
