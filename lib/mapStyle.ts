import type { StyleSpecification } from 'maplibre-gl';

/**
 * Uses OpenStreetMap's free raster tiles directly — no Mapbox account, no
 * credit card, no API key needed. This is the default so the map works out
 * of the box with zero configuration.
 *
 * Fair-use note: OSM's tile server is meant for light/moderate traffic
 * (see https://operations.osmfoundation.org/policies/tiles/). If Stavia
 * grows into serious production traffic, swap `tiles` below for a paid
 * tile provider (MapTiler, Stadia Maps, or Mapbox) — the map components
 * don't need to change, only this one style object.
 */
export const osmStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};
