import { createContext, createElement, useCallback, useContext, useMemo, useReducer } from 'react'

let nextId = 1
export function makeLayerId() {
  return `layer-${nextId++}-${Date.now().toString(36)}`
}

// OpenType feature toggles exposed in the UI. `tag` maps directly to a
// font-feature-settings tag; `default` mirrors the browser's own default so
// the UI reflects reality until the user overrides it.
export const OPENTYPE_FEATURES = [
  { tag: 'liga', label: 'Standard Ligatures', default: true },
  { tag: 'dlig', label: 'Discretionary Ligatures', default: false },
  { tag: 'smcp', label: 'Small Caps', default: false },
  { tag: 'c2sc', label: 'Caps to Small Caps', default: false },
  { tag: 'onum', label: 'Oldstyle Figures', default: false },
  { tag: 'lnum', label: 'Lining Figures', default: false },
  { tag: 'tnum', label: 'Tabular Figures', default: false },
  { tag: 'pnum', label: 'Proportional Figures', default: false },
  { tag: 'zero', label: 'Slashed Zero', default: false },
  { tag: 'frac', label: 'Fractions', default: false },
  { tag: 'ss01', label: 'Stylistic Set 01', default: false },
  { tag: 'ss02', label: 'Stylistic Set 02', default: false },
  { tag: 'ss03', label: 'Stylistic Set 03', default: false },
  { tag: 'kern', label: 'Kerning', default: true },
]

function defaultFeatureState() {
  return Object.fromEntries(OPENTYPE_FEATURES.map((f) => [f.tag, f.default]))
}

const LAYER_COLORS = ['#e63946', '#1d4ed8', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2']

export function createLayer({ name, family, weight = 400, style = 'normal', source }) {
  const index = nextId % LAYER_COLORS.length
  return {
    id: makeLayerId(),
    name,
    family,
    weight,
    style,
    source, // { type: 'google' | 'system' | 'upload', url?, fontFace? }
    visible: true,
    status: source?.type === 'system' ? 'loaded' : 'loading', // loading | loaded | error
    color: LAYER_COLORS[index],
    opacity: 1,
    transform: { x: 0, y: 0 },
    size: 96,
    lineHeight: 1.2,
    letterSpacing: 0,
    features: defaultFeatureState(),
  }
}

export const VIEW_MODES = { OVERLAY: 'overlay', SIDE_BY_SIDE: 'side-by-side' }

const initialState = {
  layers: [],
  activeLayerId: null,
  viewMode: VIEW_MODES.OVERLAY,
  zoom: 1,
  sampleText: 'Handgloves',
  guides: {
    baseline: true,
    xHeight: true,
    capHeight: false,
    boundingBox: false,
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_LAYER': {
      const layers = [...state.layers, action.layer]
      return { ...state, layers, activeLayerId: action.layer.id }
    }
    case 'REMOVE_LAYER': {
      const layers = state.layers.filter((l) => l.id !== action.id)
      const activeLayerId =
        state.activeLayerId === action.id ? (layers[0]?.id ?? null) : state.activeLayerId
      return { ...state, layers, activeLayerId }
    }
    case 'UPDATE_LAYER': {
      const layers = state.layers.map((l) =>
        l.id === action.id ? { ...l, ...action.patch } : l,
      )
      return { ...state, layers }
    }
    case 'UPDATE_LAYER_FEATURE': {
      const layers = state.layers.map((l) =>
        l.id === action.id
          ? { ...l, features: { ...l.features, [action.tag]: action.value } }
          : l,
      )
      return { ...state, layers }
    }
    case 'SET_LAYER_TRANSFORM': {
      const layers = state.layers.map((l) =>
        l.id === action.id ? { ...l, transform: { ...l.transform, ...action.patch } } : l,
      )
      return { ...state, layers }
    }
    case 'REORDER_LAYERS': {
      return { ...state, layers: action.layers }
    }
    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayerId: action.id }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode }
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom }
    case 'SET_SAMPLE_TEXT':
      return { ...state, sampleText: action.text }
    case 'TOGGLE_GUIDE':
      return { ...state, guides: { ...state.guides, [action.key]: !state.guides[action.key] } }
    case 'HYDRATE':
      return { ...initialState, ...action.state }
    default:
      return state
  }
}

const FontStoreContext = createContext(null)

export function FontStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addLayer = useCallback((layerInput) => {
    const layer = createLayer(layerInput)
    dispatch({ type: 'ADD_LAYER', layer })
    return layer
  }, [])

  const removeLayer = useCallback((id) => dispatch({ type: 'REMOVE_LAYER', id }), [])

  const updateLayer = useCallback(
    (id, patch) => dispatch({ type: 'UPDATE_LAYER', id, patch }),
    [],
  )

  const updateLayerFeature = useCallback(
    (id, tag, value) => dispatch({ type: 'UPDATE_LAYER_FEATURE', id, tag, value }),
    [],
  )

  const setLayerTransform = useCallback(
    (id, patch) => dispatch({ type: 'SET_LAYER_TRANSFORM', id, patch }),
    [],
  )

  const reorderLayers = useCallback((layers) => dispatch({ type: 'REORDER_LAYERS', layers }), [])
  const setActiveLayer = useCallback((id) => dispatch({ type: 'SET_ACTIVE_LAYER', id }), [])
  const setViewMode = useCallback((mode) => dispatch({ type: 'SET_VIEW_MODE', mode }), [])
  const setZoom = useCallback((zoom) => dispatch({ type: 'SET_ZOOM', zoom }), [])
  const setSampleText = useCallback((text) => dispatch({ type: 'SET_SAMPLE_TEXT', text }), [])
  const toggleGuide = useCallback((key) => dispatch({ type: 'TOGGLE_GUIDE', key }), [])

  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      addLayer,
      removeLayer,
      updateLayer,
      updateLayerFeature,
      setLayerTransform,
      reorderLayers,
      setActiveLayer,
      setViewMode,
      setZoom,
      setSampleText,
      toggleGuide,
    }),
    [
      state,
      addLayer,
      removeLayer,
      updateLayer,
      updateLayerFeature,
      setLayerTransform,
      reorderLayers,
      setActiveLayer,
      setViewMode,
      setZoom,
      setSampleText,
      toggleGuide,
    ],
  )

  return createElement(FontStoreContext.Provider, { value }, children)
}

export function useFontStore() {
  const ctx = useContext(FontStoreContext)
  if (!ctx) throw new Error('useFontStore must be used within a FontStoreProvider')
  return ctx
}

export function featureSettingsCSS(features) {
  const entries = Object.entries(features)
  if (!entries.length) return 'normal'
  return entries.map(([tag, on]) => `"${tag}" ${on ? 1 : 0}`).join(', ')
}
