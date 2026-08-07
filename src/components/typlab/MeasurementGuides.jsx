// SVG overlay rendering baselines, x-height lines, cap-height lines, and
// bounding boxes for one or more layers, all anchored to a shared baseline
// so shape differences between fonts line up exactly where they occur.

export default function MeasurementGuides({ width, height, baselineY, entries, guides, zoom }) {
  if (!width || !height) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {guides.baseline && (
        <line
          x1={0}
          x2={width}
          y1={baselineY}
          y2={baselineY}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      )}

      {entries.map(({ layer, metrics, centerX }) => {
        if (!metrics) return null
        const xHeightY = baselineY - metrics.xHeight * zoom
        const capHeightY = baselineY - metrics.capHeight * zoom
        const ascentY = baselineY - metrics.ascent * zoom
        const descentY = baselineY + metrics.descent * zoom
        const boxWidth = metrics.width * zoom
        const boxX = centerX - boxWidth / 2

        return (
          <g key={layer.id}>
            {guides.xHeight && (
              <line
                x1={0}
                x2={width}
                y1={xHeightY}
                y2={xHeightY}
                stroke={layer.color}
                strokeWidth={1}
                strokeOpacity={0.55}
                strokeDasharray="1 4"
              />
            )}
            {guides.capHeight && (
              <line
                x1={0}
                x2={width}
                y1={capHeightY}
                y2={capHeightY}
                stroke={layer.color}
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeDasharray="5 3"
              />
            )}
            {guides.boundingBox && (
              <rect
                x={boxX}
                y={ascentY}
                width={boxWidth}
                height={descentY - ascentY}
                fill="none"
                stroke={layer.color}
                strokeWidth={1}
                strokeOpacity={0.6}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
