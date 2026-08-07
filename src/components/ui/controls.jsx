// Minimal, monochrome control primitives shared across the sidebar panels.
// Deliberately unstyled beyond borders/contrast — the point of the UI is to
// stay out of the way of the type being inspected.

export function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="flex items-center justify-between text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-xs">
      <span className="text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-8 shrink-0 rounded-full border border-border transition-colors ${
          checked ? 'bg-foreground' : 'bg-transparent'
        }`}
      >
        <span
          className={`absolute top-0.5 h-2.5 w-2.5 rounded-full transition-transform ${
            checked ? 'translate-x-4 bg-background' : 'translate-x-0.5 bg-foreground'
          }`}
        />
      </button>
    </label>
  )
}

export function SectionHeading({ children }) {
  return (
    <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}

export function IconButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex h-6 w-6 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
    >
      {children}
    </button>
  )
}
