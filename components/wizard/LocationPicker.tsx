'use client';

import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { osmStyle } from '@/lib/mapStyle';

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

/**
 * Free OpenStreetMap-based map via MapLibre — no Mapbox account or credit
 * card required. Owners click anywhere on the map to drop the marker.
 */
export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-forest/15 h-64 relative">
      <Map
        initialViewState={{ latitude: lat ?? 31.5, longitude: lng ?? 34.8, zoom: lat ? 13 : 6.5 }}
        mapStyle={osmStyle as any}
        onClick={(e) => onChange(e.lngLat.lat, e.lngLat.lng)}
      >
        <NavigationControl position="top-left" />
        {lat && lng && (
          <Marker latitude={lat} longitude={lng} anchor="bottom">
            <MapPin size={28} className="text-brass fill-brass/20" />
          </Marker>
        )}
      </Map>
      <p className="absolute bottom-2 right-2 bg-white/90 rounded-lg px-2.5 py-1 text-[11px] text-charcoal/60">
        לחצו על המפה כדי לסמן את מיקום הנכס
      </p>
    </div>
  );
}
