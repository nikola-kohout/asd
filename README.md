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
