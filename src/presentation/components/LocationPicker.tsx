import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../../domain/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelected: (location: Location | undefined) => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (v: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export function LocationPicker({ onLocationSelected }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (position) {
      onLocationSelected({ lat: position.lat, lng: position.lng });
    } else {
      onLocationSelected(undefined);
    }
  }, [position, onLocationSelected]);

  const handleGetCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        alert('Não foi possível obter a localização. Por favor, marque no mapa.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
      }
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-indigo-900">Anotar Local</span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-[10px] px-3 py-1 bg-indigo-100 text-indigo-700 font-black uppercase tracking-widest rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'BUSCANDO...' : 'USAR ATUAL'}
        </button>
      </div>

      <div className="flex-1 min-h-[140px] w-full rounded-2xl overflow-hidden border-2 border-indigo-100 z-0 relative">
        <MapContainer
          center={position || [-15.793889, -47.882778]}
          zoom={position ? 15 : 4}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      {position && (
        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
          Lat: {position.lat.toFixed(4)} • Lng: {position.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}
