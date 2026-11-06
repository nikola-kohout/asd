import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// We never use Cesium ion resources (default imagery/terrain/geocoder), so no
// ion token is needed. Base layers are chosen explicitly below.
Cesium.Ion.defaultAccessToken = ''

export const BASEMAPS = [
  { id: 'esri', label: 'Satellite (Esri)', needsKey: false },
  { id: 'osm', label: 'OpenStreetMap', needsKey: false },
  { id: 'google-2d', label: 'Google satellite', needsKey: true },
  { id: 'google-3d', label: 'Google 3D (photorealistic)', needsKey: true },
]

export function createGlobe(container) {
  const viewer = new Cesium.Viewer(container, {
    baseLayer: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: true,
    sceneModePicker: true,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: true,
    selectionIndicator: true,
  })
  viewer.scene.globe.depthTestAgainstTerrain = false
  viewer.scene.skyAtmosphere.show = true
  viewer.scene.globe.enableLighting = false
  return viewer
}

let photorealTileset = null

/**
 * Swap the base imagery / 3D tiles. Throws if a Google layer is requested
 * without a key or the key is rejected.
 */
export async function setBasemap(viewer, id, googleKey) {
  const { imageryLayers, scene } = viewer

  if (photorealTileset) {
    scene.primitives.remove(photorealTileset)
    photorealTileset = null
  }
  scene.globe.show = true

  let provider
  if (id === 'esri') {
    provider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19,
      credit: new Cesium.Credit('Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community'),
    })
  } else if (id === 'osm') {
    provider = new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })
  } else if (id === 'google-2d' || id === 'google-3d') {
    if (!googleKey) throw new Error('This basemap needs a Google Maps API key (Map Tiles API enabled).')
    if (id === 'google-2d') {
      provider = await Cesium.Google2DImageryProvider.fromUrl({ key: googleKey, mapType: 'satellite' })
    } else {
      // There is no geocoder in this app, so the tileset is never paired with a
      // non-Google geocoder, which is what Google's terms require.
      photorealTileset = await Cesium.createGooglePhotorealistic3DTileset(
        { key: googleKey, onlyUsingWithGoogleGeocoder: true },
        { showCreditsOnScreen: true },
      )
      scene.primitives.add(photorealTileset)
      scene.globe.show = false
    }
  }

  imageryLayers.removeAll()
  if (provider) imageryLayers.addImageryProvider(provider)
}

/** Load a KML/KMZ File, Blob or URL into the viewer. */
export async function loadKml(viewer, source) {
  const ds = await Cesium.KmlDataSource.load(source, {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true,
  })
  await viewer.dataSources.add(ds)
  return ds
}

/** Entities worth listing: things with geometry, not bare folders. */
export function listFeatures(ds, limit = 500) {
  const out = []
  for (const e of ds.entities.values) {
    if (e.position || e.polyline || e.polygon || e.billboard || e.point || e.model || e.label) {
      out.push(e)
      if (out.length >= limit) break
    }
  }
  return out
}

export function flyTo(viewer, target) {
  return viewer.flyTo(target, { duration: 1.6 })
}

export function select(viewer, entity) {
  viewer.selectedEntity = entity
}
