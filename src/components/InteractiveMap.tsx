'use client';

/**
 * Interactive map component using Leaflet.js and OpenStreetMap tiles
 * No API key required - completely free!
 */

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  location: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
}

// Dynamically import map components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export function InteractiveMap({
  location,
  lat,
  lng,
  zoom = 5.5,
  className = '',
}: InteractiveMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // If coordinates not provided, geocode the location
    if (!lat || !lng) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }
        })
        .catch((err) => {
          console.error('Geocoding failed:', err);
        });
    }
  }, [location, lat, lng]);

  // Fix Leaflet default marker icon issue in Next.js
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }
  }, [isClient]);

  if (!isClient || !coordinates) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height: '400px' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      >
        {/* Satellite imagery base layer */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        {/* Labels and place names overlay */}
        <TileLayer
          attribution=''
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <strong>{location}</strong>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
