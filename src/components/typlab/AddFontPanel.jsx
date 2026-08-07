import { useRef, useState } from 'react'
import { useFontStore } from '../../lib/fontStore'
import {
  GOOGLE_FONT_CATALOG,
  SYSTEM_FONT_STACKS,
  loadFontFile,
  loadGoogleFont,
  resolveSystemFont,
} from '../../lib/googleFonts'

const TABS = ['Google', 'System', 'Upload']

export default function AddFontPanel() {
  const { addLayer, updateLayer } = useFontStore()
  const [tab, setTab] = useState('Google')
  const [family, setFamily] = useState(GOOGLE_FONT_CATALOG[0].family)
  const [weight, setWeight] = useState(GOOGLE_FONT_CATALOG[0].weights[0])
  const [style, setStyle] = useState('normal')
  const [systemName, setSystemName] = useState(SYSTEM_FONT_STACKS[0].name)
  const fileInputRef = useRef(null)

  const catalogEntry = GOOGLE_FONT_CATALOG.find((f) => f.family === family)

  async function handleAddGoogleFont() {
    const layer = addLayer({ name: family, family, weight, style, source: { type: 'google' } })
    try {
      await loadGoogleFont(family, weight, style)
      updateLayer(layer.id, { status: 'loaded' })
    } catch {
      updateLayer(layer.id, { status: 'error' })
    }
  }

  function handleAddSystemFont() {
    const resolved = resolveSystemFont(systemName)
    addLayer({ name: systemName, ...resolved })
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const placeholder = addLayer({
      name: file.name.replace(/\.[^.]+$/, ''),
      family: 'system-ui',
      weight: 400,
      style: 'normal',
      source: { type: 'upload' },
    })
    try {
      const resolved = await loadFontFile(file)
      updateLayer(placeholder.id, { ...resolved, status: 'loaded' })
    } catch {
      updateLayer(placeholder.id, { status: 'error' })
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <div className="flex gap-1 text-xs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded px-2 py-1 transition-colors ${
              tab === t ? 'bg-foreground text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Google' && (
        <div className="flex flex-col gap-2 text-xs">
          <select
            value={family}
            onChange={(e) => {
              const next = e.target.value
              setFamily(next)
              const entry = GOOGLE_FONT_CATALOG.find((f) => f.family === next)
              if (entry && !entry.weights.includes(weight)) setWeight(entry.weights[0])
            }}
            className="rounded border border-border bg-background px-2 py-1.5"
          >
            {GOOGLE_FONT_CATALOG.map((f) => (
              <option key={f.family} value={f.family}>
                {f.family}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="flex-1 rounded border border-border bg-background px-2 py-1.5"
            >
              {catalogEntry?.weights.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="flex-1 rounded border border-border bg-background px-2 py-1.5"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
            </select>
          </div>
          <button
            onClick={handleAddGoogleFont}
            className="rounded bg-foreground py-1.5 text-accent-foreground hover:opacity-90"
          >
            Add layer
          </button>
        </div>
      )}

      {tab === 'System' && (
        <div className="flex flex-col gap-2 text-xs">
          <select
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1.5"
          >
            {SYSTEM_FONT_STACKS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddSystemFont}
            className="rounded bg-foreground py-1.5 text-accent-foreground hover:opacity-90"
          >
            Add layer
          </button>
        </div>
      )}

      {tab === 'Upload' && (
        <div className="flex flex-col gap-2 text-xs">
          <p className="text-muted-foreground">Upload a .woff, .woff2, .ttf, or .otf file.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf"
            onChange={handleFileChange}
            className="rounded border border-border bg-background px-2 py-1.5 file:mr-2 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1"
          />
        </div>
      )}
    </div>
  )
}
