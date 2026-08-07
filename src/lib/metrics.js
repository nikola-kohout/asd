// Approximate font metrics via the Canvas 2D TextMetrics API. This gives us
// real, per-font x-height/cap-height/ascent/descent numbers straight from
// the browser's rasterizer — no font-parsing library required — which is
// exactly the "metric data" the measurement guides need to stay accurate
// across arbitrary Google/uploaded/system fonts.

let sharedCtx = null
function getCtx() {
  if (!sharedCtx) {
    const canvas = document.createElement('canvas')
    sharedCtx = canvas.getContext('2d')
  }
  return sharedCtx
}

const cache = new Map()

export function measureFontMetrics({ family, weight = 400, style = 'normal', size, sampleText = 'Hxpqjy' }) {
  const key = `${family}__${weight}__${style}__${size}__${sampleText}`
  if (cache.has(key)) return cache.get(key)

  const ctx = getCtx()
  ctx.font = `${style === 'italic' ? 'italic ' : ''}${weight} ${size}px "${family}"`

  const xMetrics = ctx.measureText('x')
  const capMetrics = ctx.measureText('H')
  const fullMetrics = ctx.measureText(sampleText)

  const metrics = {
    xHeight: xMetrics.actualBoundingBoxAscent || size * 0.5,
    capHeight: capMetrics.actualBoundingBoxAscent || size * 0.7,
    ascent: fullMetrics.fontBoundingBoxAscent ?? fullMetrics.actualBoundingBoxAscent ?? size * 0.8,
    descent: fullMetrics.fontBoundingBoxDescent ?? fullMetrics.actualBoundingBoxDescent ?? size * 0.2,
    width: fullMetrics.width,
  }

  cache.set(key, metrics)
  return metrics
}

export function clearMetricsCache() {
  cache.clear()
}
