import { OPENTYPE_FEATURES } from '../../lib/fontStore'
import { SectionHeading, ToggleRow } from '../ui/controls'

export default function OpenTypeControls({ layer, onToggleFeature }) {
  if (!layer) return null

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>OpenType Features</SectionHeading>
      <div className="flex flex-col divide-y divide-border rounded-md border border-border px-3">
        {OPENTYPE_FEATURES.map((feature) => (
          <ToggleRow
            key={feature.tag}
            label={feature.label}
            checked={!!layer.features[feature.tag]}
            onChange={(value) => onToggleFeature(feature.tag, value)}
          />
        ))}
      </div>
      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
        Toggles map directly to <code className="font-mono">font-feature-settings</code>. A font
        without a given feature glyph will render unchanged.
      </p>
    </div>
  )
}
