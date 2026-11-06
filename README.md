# TypLab

A typography inspection tool for precise visual and technical comparison of fonts — overlay or side-by-side, with baseline/x-height/cap-height/bounding-box guides and per-layer OpenType feature control.

## Getting started

```bash
npm install
npm run dev
```

## Architecture

- `src/lib/fontStore.js` — Context + reducer holding the `fontLayers` array (metadata, color/opacity/transform, size/line-height/letter-spacing, OpenType feature flags) and global controls (view mode, zoom, sample text, guide visibility).
- `src/lib/googleFonts.js` — Font loading: injects Google Fonts `<link>` tags and observes readiness via the CSS Font Loading API, constructs `FontFace` objects for uploaded files, and resolves system font stacks.
- `src/lib/metrics.js` — Per-font x-height/cap-height/ascent/descent measured live via Canvas `TextMetrics`, used to align every layer on a shared baseline.
- `src/components/typlab/ComparisonCanvas.jsx` — The visual engine: overlay mode stacks layers on one baseline, side-by-side mode gives each layer its own stage; renders the SVG measurement guides.
- `src/components/typlab/Sidebar.jsx` — Composes `AddFontPanel`, `FontLayerCard` (layer list), `TypographicControls` (sliders), and `OpenTypeControls` (feature toggles) around the global view/zoom/guide controls.

---

# KML Globe

A second page in this project (`/kml.html`) that shows KML/KMZ files on an interactive 3D globe.

```bash
npm install
npm run dev   # then open http://localhost:5173/kml.html
```

- Drag `.kml` / `.kmz` files onto the page, use **Open KML / KMZ…**, or paste a URL (the server must allow CORS). Try `public/samples/prague.kml`.
- Each file becomes a layer you can show or hide, zoom to, remove, or expand to list its placemarks. Clicking a placemark flies to it and shows its KML description.
- Basemaps: Esri satellite and OpenStreetMap work without a key. **Google satellite** and **Google 3D (photorealistic)** need a Google Maps Platform API key with the *Map Tiles API* enabled. The key is pasted in the sidebar and kept only in the browser's `localStorage`.

Why not Google Earth itself? Google Earth (web or desktop) has no embeddable API; the old Earth plugin API was shut down in 2015. The Maps JavaScript `KmlLayer` only reads KML from a public URL that Google's servers fetch, so it cannot open local files. This page uses [CesiumJS](https://cesium.com/platform/cesiumjs/) (open source, Apache-2.0), which parses KML/KMZ in the browser and can stream Google's own photorealistic 3D tiles, so it looks like Google Earth.

Files: `src/kml/globe.js` (Cesium viewer, basemaps, KML loading) and `src/kml/KmlApp.jsx` (UI). `vite.config.js` serves and copies Cesium's static assets to `/cesium`.
