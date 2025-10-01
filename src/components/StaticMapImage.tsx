/**
 * Component for displaying static map images using OpenStreetMap
 * No API key required - completely free!
 */

import React from 'react';

interface StaticMapImageProps {
  location: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  width?: number;
  height?: number;
  className?: string;
}

export function StaticMapImage({
  location,
  lat,
  lng,
  zoom = 13,
  width = 600,
  height = 400,
  className = '',
}: StaticMapImageProps) {
  // If lat/lng provided, use them; otherwise we'll use a static map service
  // Using StaticMapLite API (free, no API key required)
  const mapUrl = lat && lng
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red-pushpin`
    : `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(location)}&zoom=${zoom}&size=${width}x${height}`;

  return (
    <div className={className}>
      <img
        src={mapUrl}
        alt={`Map of ${location}`}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
        onError={(e) => {
          // Fallback to a simple placeholder if the map fails to load
          const target = e.target as HTMLImageElement;
          target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3E📍 ${location}%3C/text%3E%3C/svg%3E`;
        }}
      />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Map data © OpenStreetMap contributors
      </p>
    </div>
  );
}
