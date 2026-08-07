import { useFontStore, VIEW_MODES } from '../../lib/fontStore'
import { SectionHeading, SliderRow, ToggleRow } from '../ui/controls'
import AddFontPanel from './AddFontPanel'
import FontLayerCard from './FontLayerCard'
import TypographicControls from './TypographicControls'
import OpenTypeControls from './OpenTypeControls'

export default function Sidebar() {
  const {
    layers,
    activeLayerId,
    viewMode,
    zoom,
    sampleText,
    guides,
    setActiveLayer,
    updateLayer,
    setLayerTransform,
    updateLayerFeature,
    removeLayer,
    setViewMode,
    setZoom,
    setSampleText,
    toggleGuide,
  } = useFontStore()

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? null

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-5 overflow-y-auto border-r border-border bg-background p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-sm font-semibold tracking-tight">TypLab</h1>
        <p className="text-[11px] text-muted-foreground">Typography inspection tool</p>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeading>Sample Text</SectionHeading>
        <textarea
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          rows={2}
          className="resize-none rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeading>View</SectionHeading>
        <div className="flex gap-1 text-xs">
          {Object.values(VIEW_MODES).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 rounded px-2 py-1.5 capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-foreground text-accent-foreground'
                  : 'border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {mode.replaceAll('-', ' ')}
            </button>
          ))}
        </div>
        <SliderRow
          label="Zoom"
          min={0.25}
          max={2}
          step={0.05}
          value={zoom}
          unit="x"
          onChange={setZoom}
        />
      </div>

      <div className="flex flex-col gap-1 rounded-md border border-border p-3">
        <SectionHeading>Measurement Guides</SectionHeading>
        <ToggleRow label="Baseline" checked={guides.baseline} onChange={() => toggleGuide('baseline')} />
        <ToggleRow label="X-height" checked={guides.xHeight} onChange={() => toggleGuide('xHeight')} />
        <ToggleRow label="Cap-height" checked={guides.capHeight} onChange={() => toggleGuide('capHeight')} />
        <ToggleRow
          label="Bounding box"
          checked={guides.boundingBox}
          onChange={() => toggleGuide('boundingBox')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeading>Add Font Layer</SectionHeading>
        <AddFontPanel />
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeading>Layers ({layers.length})</SectionHeading>
        <div className="flex flex-col gap-1">
          {layers.length === 0 && (
            <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              No layers yet
            </p>
          )}
          {layers.map((layer) => (
            <FontLayerCard
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
              onSelect={() => setActiveLayer(layer.id)}
              onToggleVisible={() => updateLayer(layer.id, { visible: !layer.visible })}
              onRemove={() => removeLayer(layer.id)}
            />
          ))}
        </div>
      </div>

      {activeLayer && (
        <>
          <TypographicControls
            layer={activeLayer}
            onUpdate={(patch) => updateLayer(activeLayer.id, patch)}
            onTransform={(patch) => setLayerTransform(activeLayer.id, patch)}
          />
          <OpenTypeControls
            layer={activeLayer}
            onToggleFeature={(tag, value) => updateLayerFeature(activeLayer.id, tag, value)}
          />
        </>
      )}
    </aside>
  )
}
