'use client';

import { useMemo, useState } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import type { CircleLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Link from 'next/link';
import { osmStyle } from '@/lib/mapStyle';
import { formatPriceILS } from '@/lib/utils';

export interface MapProperty {
  id: string;
  slug: string | null;
  name: string;
  lat: number;
  lng: number;
  coverImageUrl?: string | null;
  weekdayPrice?: number | null;
}

const clusterLayer: CircleLayerSpecification = {
  id: 'clusters',
  type: 'circle',
  source: 'properties',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#1B4332',
    'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
    'circle-opacity': 0.9,
  },
};

const clusterCountLayer: SymbolLayerSpecification = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'properties',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-size': 13,
  },
  paint: { 'text-color': '#FBFAF6' },
};

const unclusteredPointLayer: CircleLayerSpecification = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'properties',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#B8935F',
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#FBFAF6',
  },
};

/**
 * Uses free OpenStreetMap tiles via MapLibre (an open-source, API-compatible
 * fork of Mapbox GL JS) — no account, no credit card, no API key required.
 * See lib/mapStyle.ts if you ever want to swap in a paid tile provider.
 */
export function PropertyMap({ properties, height = '480px' }: { properties: MapProperty[]; height?: string }) {
  const [popupProperty, setPopupProperty] = useState<MapProperty | null>(null);

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: properties
        .filter((p) => p.lat && p.lng)
        .map((p) => ({
          type: 'Feature' as const,
          properties: { id: p.id },
          geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
        })),
    }),
    [properties]
  );

  const israelCenter = { latitude: 31.5, longitude: 34.8, zoom: 6.5 };

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-forest/10 relative">
      <Map
        initialViewState={israelCenter}
        mapStyle={osmStyle as any}
        interactiveLayerIds={[clusterLayer.id, unclusteredPointLayer.id]}
        onClick={(e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          if (feature.layer?.id === 'unclustered-point') {
            const id = feature.properties?.id;
            const prop = properties.find((p) => p.id === id);
            if (prop) setPopupProperty(prop);
          }
        }}
      >
        <NavigationControl position="top-left" />
        <Source id="properties" type="geojson" data={geojson} cluster clusterMaxZoom={14} clusterRadius={50}>
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {popupProperty && (
          <Popup
            latitude={popupProperty.lat}
            longitude={popupProperty.lng}
            onClose={() => setPopupProperty(null)}
            closeButton
            anchor="bottom"
          >
            <Link href={`/property/${popupProperty.slug ?? popupProperty.id}`} className="block w-40">
              {popupProperty.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={popupProperty.coverImageUrl} alt="" className="w-full h-20 object-cover rounded-md mb-1.5" />
              )}
              <p className="text-xs font-medium text-charcoal truncate">{popupProperty.name}</p>
              {popupProperty.weekdayPrice != null && (
                <p className="text-xs text-forest font-semibold">{formatPriceILS(popupProperty.weekdayPrice)}</p>
              )}
            </Link>
          </Popup>
        )}
      </Map>
    </div>
  );
}
