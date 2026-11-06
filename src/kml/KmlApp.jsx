import { useCallback, useEffect, useRef, useState } from 'react'
import { BASEMAPS, createGlobe, flyTo, listFeatures, loadKml, select, setBasemap } from './globe'

const KEY_STORAGE = 'kml-globe.google-key'
const ACCEPT = '.kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz'

let nextId = 1

export default function KmlApp() {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const fileInputRef = useRef(null)

  const [layers, setLayers] = useState([])
  const [basemap, setBasemapId] = useState('esri')
  const [googleKey, setGoogleKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? '')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const viewer = createGlobe(containerRef.current)
    viewerRef.current = viewer
    setBasemap(viewer, 'esri').catch((e) => setError(String(e.message ?? e)))
    return () => {
      viewerRef.current = null
      viewer.destroy()
    }
  }, [])

  const changeBasemap = useCallback(
    async (id) => {
      const viewer = viewerRef.current
      if (!viewer) return
      setError('')
      try {
        await setBasemap(viewer, id, googleKey.trim())
        setBasemapId(id)
      } catch (e) {
        setError(String(e.message ?? e))
      }
    },
    [googleKey],
  )

  const addSources = useCallback(async (sources) => {
    const viewer = viewerRef.current
    if (!viewer || sources.length === 0) return
    setBusy(true)
    setError('')
    const added = []
    for (const { source, name } of sources) {
      try {
        const ds = await loadKml(viewer, source)
        added.push({
          id: nextId++,
          name: ds.name || name,
          fileName: name,
          ds,
          visible: true,
          open: false,
          features: listFeatures(ds),
        })
      } catch (e) {
        setError(`Could not load ${name}: ${e.message ?? e}`)
      }
    }
    setBusy(false)
    if (added.length) {
      setLayers((prev) => [...prev, ...added])
      flyTo(viewer, added.at(-1).ds)
    }
  }, [])

  const addFiles = useCallback(
    (fileList) => {
      const files = [...fileList].filter((f) => /\.(kml|kmz)$/i.test(f.name))
      if (files.length === 0) {
        setError('Drop .kml or .kmz files.')
        return
      }
      addSources(files.map((f) => ({ source: f, name: f.name })))
    },
    [addSources],
  )

  const addUrl = (e) => {
    e.preventDefault()
    const u = url.trim()
    if (!u) return
    addSources([{ source: u, name: u.split('/').pop() || u }])
    setUrl('')
  }

  const update = (id, patch) => setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const toggle = (layer) => {
    layer.ds.show = !layer.visible
    update(layer.id, { visible: !layer.visible })
  }

  const remove = (layer) => {
    viewerRef.current?.dataSources.remove(layer.ds, true)
    setLayers((prev) => prev.filter((l) => l.id !== layer.id))
  }

  const focusFeature = (entity) => {
    const viewer = viewerRef.current
    if (!viewer) return
    select(viewer, entity)
    flyTo(viewer, entity)
  }

  const saveKey = (v) => {
    setGoogleKey(v)
    if (v.trim()) localStorage.setItem(KEY_STORAGE, v.trim())
    else localStorage.removeItem(KEY_STORAGE)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-background text-foreground"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) setDragging(false)
      }}
      onDrop={onDrop}
    >
      <aside className="flex w-80 shrink-0 flex-col border-r bg-card">
        <header className="border-b px-5 py-4">
          <h1 className="text-sm font-semibold tracking-tight">KML Globe</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Drop .kml / .kmz files anywhere on the page.</p>
        </header>

        <div className="space-y-3 border-b px-5 py-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Open KML / KMZ…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <form onSubmit={addUrl} className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="…or paste a KML URL"
              className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-xs outline-none focus:border-foreground"
            />
            <button type="submit" className="rounded-md border px-2 text-xs hover:bg-muted">
              Load
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {layers.length === 0 && !busy && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">No layers loaded yet.</p>
          )}
          {busy && <p className="px-2 py-2 text-xs text-muted-foreground">Loading…</p>}
          <ul className="space-y-1">
            {layers.map((layer) => (
              <li key={layer.id} className="rounded-md border bg-background">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => toggle(layer)}
                    title="Show / hide"
                    className="accent-current"
                  />
                  <button
                    type="button"
                    onClick={() => update(layer.id, { open: !layer.open })}
                    className="min-w-0 flex-1 truncate text-left text-sm"
                    title={layer.fileName}
                  >
                    <span className="mr-1 inline-block w-3 text-muted-foreground">{layer.open ? '▾' : '▸'}</span>
                    {layer.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => flyTo(viewerRef.current, layer.ds)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    title="Zoom to layer"
                  >
                    ⌖
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(layer)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                {layer.open && (
                  <ul className="max-h-64 overflow-y-auto border-t py-1">
                    {layer.features.length === 0 && (
                      <li className="px-3 py-1 text-xs text-muted-foreground">No features.</li>
                    )}
                    {layer.features.map((f) => (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => focusFeature(f)}
                          className="block w-full truncate px-3 py-1 text-left text-xs hover:bg-muted"
                        >
                          {f.name || '(unnamed)'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 border-t px-5 py-4">
          <label className="block text-xs text-muted-foreground">
            Basemap
            <select
              value={basemap}
              onChange={(e) => changeBasemap(e.target.value)}
              className="mt-1 block w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground"
            >
              {BASEMAPS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                  {b.needsKey ? ' — needs key' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">
            Google Maps API key
            <input
              type="password"
              value={googleKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="Map Tiles API key (optional)"
              className="mt-1 block w-full rounded-md border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-foreground"
            />
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </aside>

      <main className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0" />
        {dragging && (
          <div className="pointer-events-none absolute inset-4 flex items-center justify-center rounded-xl border-2 border-dashed border-white/80 bg-black/40 text-lg font-medium text-white">
            Drop KML / KMZ to add
          </div>
        )}
      </main>
    </div>
  )
}
