// Font loading strategy: Google Fonts are injected as <link> tags and
// observed via the native CSS Font Loading API (the same "wait until the
// browser confirms glyphs are ready" idea as the classic Font Face Observer
// pattern, without pulling in the extra dependency). Uploaded files go
// through the FontFace constructor directly. System fonts need no loading
// at all — the browser resolves them through the CSS font stack.

const injectedLinks = new Set()
const loadPromises = new Map()

// A curated set of popular families for the picker UI. Any arbitrary family
// name can still be requested via loadGoogleFont — Google's css2 endpoint
// doesn't require a fixed catalog.
export const GOOGLE_FONT_CATALOG = [
  { family: 'Inter', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Roboto', weights: [300, 400, 500, 700, 900] },
  { family: 'Open Sans', weights: [300, 400, 600, 700, 800] },
  { family: 'Lato', weights: [300, 400, 700, 900] },
  { family: 'Montserrat', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Poppins', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Source Sans 3', weights: [300, 400, 600, 700] },
  { family: 'Nunito', weights: [300, 400, 600, 700, 800] },
  { family: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900] },
  { family: 'Merriweather', weights: [300, 400, 700, 900] },
  { family: 'Lora', weights: [400, 500, 600, 700] },
  { family: 'PT Serif', weights: [400, 700] },
  { family: 'Space Grotesk', weights: [300, 400, 500, 600, 700] },
  { family: 'IBM Plex Sans', weights: [300, 400, 500, 600, 700] },
  { family: 'IBM Plex Serif', weights: [300, 400, 500, 600, 700] },
  { family: 'IBM Plex Mono', weights: [300, 400, 500, 600, 700] },
  { family: 'JetBrains Mono', weights: [300, 400, 500, 700] },
  { family: 'Fira Code', weights: [400, 500, 600, 700] },
  { family: 'Work Sans', weights: [300, 400, 500, 600, 700] },
  { family: 'DM Sans', weights: [400, 500, 700] },
  { family: 'Archivo', weights: [400, 500, 600, 700, 800] },
  { family: 'Manrope', weights: [400, 500, 600, 700, 800] },
  { family: 'Crimson Pro', weights: [400, 500, 600, 700] },
  { family: 'Cormorant Garamond', weights: [400, 500, 600, 700] },
  { family: 'Bebas Neue', weights: [400] },
  { family: 'Oswald', weights: [300, 400, 500, 600, 700] },
]

export const SYSTEM_FONT_STACKS = [
  { name: 'Helvetica Neue', family: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { name: 'Georgia', family: 'Georgia, "Times New Roman", serif' },
  { name: 'Times New Roman', family: '"Times New Roman", Times, serif' },
  { name: 'Courier New', family: '"Courier New", Courier, monospace' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { name: 'system-ui', family: 'system-ui, -apple-system, sans-serif' },
]

function cssUrlFor(family, weights) {
  const params = new URLSearchParams()
  const axis = weights?.length ? `:wght@${[...new Set(weights)].sort((a, b) => a - b).join(';')}` : ''
  params.set('family', `${family}${axis}`)
  params.set('display', 'swap')
  return `https://fonts.googleapis.com/css2?${params.toString()}`
}

function injectLink(href) {
  if (injectedLinks.has(href)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
  injectedLinks.add(href)
}

// Observes font readiness using the native Font Loading API rather than the
// invisible-span width-measurement trick — same goal (resolve once glyphs
// are actually paintable), fewer moving parts.
async function observeFontLoad(family, weight, style) {
  const descriptor = `${style === 'italic' ? 'italic ' : ''}${weight} 16px "${family}"`
  if (document.fonts?.load) {
    await document.fonts.load(descriptor, 'BESbswy')
  }
  await document.fonts?.ready
  if (document.fonts?.check && !document.fonts.check(descriptor, 'BESbswy')) {
    throw new Error(`Font "${family}" (weight ${weight}) failed to load`)
  }
}

/**
 * Loads a Google Font family/weight by injecting the css2 stylesheet link
 * and waiting for the browser to confirm the glyphs are ready.
 */
export function loadGoogleFont(family, weight = 400, style = 'normal') {
  const key = `google:${family}:${weight}:${style}`
  if (loadPromises.has(key)) return loadPromises.get(key)

  const href = cssUrlFor(family, [weight])
  const promise = (async () => {
    injectLink(href)
    await observeFontLoad(family, weight, style)
    return { family, weight, style, source: { type: 'google', url: href } }
  })()

  loadPromises.set(key, promise)
  return promise
}

/**
 * Loads a user-uploaded font file (File/Blob) via the FontFace constructor
 * and registers it on document.fonts under a synthetic, collision-free
 * family name.
 */
export async function loadFontFile(file) {
  const buffer = await file.arrayBuffer()
  const family = `user-upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const fontFace = new FontFace(family, buffer)
  const loaded = await fontFace.load()
  document.fonts.add(loaded)
  return {
    family,
    weight: describedWeight(loaded.weight),
    style: loaded.style?.includes('italic') ? 'italic' : 'normal',
    source: { type: 'upload', fileName: file.name, fontFace: loaded },
  }
}

function describedWeight(weightRange) {
  const first = parseInt(String(weightRange).split(' ')[0], 10)
  return Number.isFinite(first) ? first : 400
}

/** System fonts resolve purely through CSS — nothing to load or await. */
export function resolveSystemFont(name) {
  const stack = SYSTEM_FONT_STACKS.find((s) => s.name === name)
  return {
    family: stack?.family ?? name,
    weight: 400,
    style: 'normal',
    source: { type: 'system' },
  }
}
