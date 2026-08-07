import { useEffect, useMemo, useRef, useState } from 'react'
import { useFontStore, featureSettingsCSS, VIEW_MODES } from '../../lib/fontStore'
import { measureFontMetrics } from '../../lib/metrics'
import MeasurementGuides from './MeasurementGuides'

const STAGE_PADDING = 48
const MIN_STAGE_HEIGHT = 220

function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
    })
    observer.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

/**
 * Renders one or more layers on a shared baseline. Overlay mode passes every
 * visible layer into a single Stage (so baselines coincide and shape
 * differences pop). Side-by-side mode mounts one Stage per layer.
 */
function Stage({ layers, zoom, sampleText, guides, showLabel }) {
  const [containerRef, width] = useElementWidth()

  const measured = useMemo(
    () =>
      layers.map((layer) => ({
        layer,
        metrics: measureFontMetrics({
          family: layer.family,
          weight: layer.weight,
          style: layer.style,
          size: layer.size * zoom,
          sampleText,
        }),
      })),
    [layers, zoom, sampleText],
  )

  const maxAscent = Math.max(MIN_STAGE_HEIGHT * 0.3, ...measured.map((m) => m.metrics.ascent))
  const maxDescent = Math.max(MIN_STAGE_HEIGHT * 0.1, ...measured.map((m) => m.metrics.descent))
  const stageHeight = Math.max(MIN_STAGE_HEIGHT, maxAscent + maxDescent + STAGE_PADDING * 2)
  const baselineY = STAGE_PADDING + maxAscent

  const guideEntries = measured.map(({ layer, metrics }) => ({
    layer,
    metrics,
    centerX: width / 2 + layer.transform.x * zoom,
  }))

  return (
    <div className="flex flex-col gap-2">
      {showLabel && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="h-2 w-2 rounded-full" style={{ background: layers[0].color }} />
          {layers[0].name} · {layers[0].weight}
          {layers[0].style === 'italic' ? ' italic' : ''}
        </div>
      )}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-md border border-border bg-card bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[length:24px_24px] bg-center"
        style={{ height: stageHeight }}
      >
        <MeasurementGuides
          width={width}
          height={stageHeight}
          baselineY={baselineY}
          entries={guideEntries}
          guides={guides}
          zoom={zoom}
        />

        {measured.map(({ layer, metrics }) => (
          <div
            key={layer.id}
            className="absolute inset-x-0 whitespace-nowrap text-center select-none"
            style={{
              '--layer-color': layer.color,
              top: baselineY - metrics.ascent,
              transform: `translate(${layer.transform.x}px, ${layer.transform.y}px)`,
              color: 'var(--layer-color)',
              opacity: layer.opacity,
              fontFamily: `"${layer.family}"`,
              fontWeight: layer.weight,
              fontStyle: layer.style,
              fontSize: layer.size * zoom,
              lineHeight: layer.lineHeight,
              letterSpacing: `${layer.letterSpacing}em`,
              fontFeatureSettings: featureSettingsCSS(layer.features),
            }}
          >
            {sampleText}
          </div>
        ))}

        {measured.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Add a font layer to begin comparing
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComparisonCanvas() {
  const { layers, viewMode, zoom, sampleText, guides } = useFontStore()
  const visibleLayers = layers.filter((l) => l.visible && l.status === 'loaded')

  if (viewMode === VIEW_MODES.SIDE_BY_SIDE) {
    return (
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        {visibleLayers.length === 0 && (
          <div className="col-span-full flex h-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            No visible layers — add or unhide a font to compare
          </div>
        )}
        {visibleLayers.map((layer) => (
          <Stage
            key={layer.id}
            layers={[layer]}
            zoom={zoom}
            sampleText={sampleText}
            guides={guides}
            showLabel
          />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <Stage layers={visibleLayers} zoom={zoom} sampleText={sampleText} guides={guides} />
    </div>
  )
}
