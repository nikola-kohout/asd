import { IconButton } from '../ui/controls'

const STATUS_LABEL = {
  loading: 'Loading…',
  loaded: 'Ready',
  error: 'Failed',
}

export default function FontLayerCard({ layer, isActive, onSelect, onToggleVisible, onRemove }) {
  return (
    <div
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-2 text-sm transition-colors ${
        isActive ? 'border-foreground bg-muted' : 'border-border hover:bg-muted'
      }`}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: layer.color, opacity: layer.status === 'error' ? 0.3 : 1 }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{layer.name}</div>
        <div className="truncate font-mono text-[11px] text-muted-foreground">
          {layer.weight} · {layer.style}
          {layer.status !== 'loaded' && ` · ${STATUS_LABEL[layer.status]}`}
        </div>
      </div>
      <IconButton
        title={layer.visible ? 'Hide layer' : 'Show layer'}
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisible()
        }}
      >
        {layer.visible ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-3.4 4M6.6 6.6A13.4 13.4 0 0 0 1 12s4 7 11 7a10.6 10.6 0 0 0 4.2-.9" />
          </svg>
        )}
      </IconButton>
      <IconButton
        title="Remove layer"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  )
}
