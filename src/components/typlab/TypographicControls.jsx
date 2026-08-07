import { SectionHeading, SliderRow } from '../ui/controls'

export default function TypographicControls({ layer, onUpdate, onTransform }) {
  if (!layer) return null

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Typographic Controls</SectionHeading>

      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <SliderRow
          label="Size"
          min={8}
          max={480}
          value={layer.size}
          unit="px"
          onChange={(size) => onUpdate({ size })}
        />
        <SliderRow
          label="Line height"
          min={0.8}
          max={2.2}
          step={0.01}
          value={layer.lineHeight}
          onChange={(lineHeight) => onUpdate({ lineHeight })}
        />
        <SliderRow
          label="Letter spacing"
          min={-0.1}
          max={0.5}
          step={0.005}
          value={layer.letterSpacing}
          unit="em"
          onChange={(letterSpacing) => onUpdate({ letterSpacing })}
        />
        <SliderRow
          label="Opacity"
          min={0}
          max={1}
          step={0.01}
          value={layer.opacity}
          onChange={(opacity) => onUpdate({ opacity })}
        />

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Color</span>
          <input
            type="color"
            value={layer.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-6 w-10 cursor-pointer rounded border border-border bg-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SliderRow
            label="Offset X"
            min={-200}
            max={200}
            value={layer.transform.x}
            unit="px"
            onChange={(x) => onTransform({ x })}
          />
          <SliderRow
            label="Offset Y"
            min={-200}
            max={200}
            value={layer.transform.y}
            unit="px"
            onChange={(y) => onTransform({ y })}
          />
        </div>
      </div>
    </div>
  )
}
