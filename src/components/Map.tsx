import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  userLocation: { lat: number; lng: number };
  supporterLocation: { lat: number; lng: number };
  className?: string;
}

const Map: React.FC<MapProps> = ({ userLocation, supporterLocation, className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const supporterMarker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([userLocation.lat, userLocation.lng], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    if (userMarker.current) {
      map.current.removeLayer(userMarker.current);
    }
    if (supporterMarker.current) {
      map.current.removeLayer(supporterMarker.current);
    }

    // Create custom icons
    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
               </svg>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const supporterIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                 <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
               </svg>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add user marker
    userMarker.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map.current)
      .bindPopup('<strong>Your Location</strong>');

    // Add supporter marker
    supporterMarker.current = L.marker([supporterLocation.lat, supporterLocation.lng], { icon: supporterIcon })
      .addTo(map.current)
      .bindPopup('<strong>Supporter Location</strong>');

    // Fit map to show both markers
    const group = L.featureGroup([userMarker.current, supporterMarker.current]);
    map.current.fitBounds(group.getBounds(), { padding: [20, 20] });

  }, [userLocation, supporterLocation]);

  return (
    <div className={className}>
      <div 
        ref={mapContainer} 
        className="w-full h-80 rounded-2xl overflow-hidden shadow-[var(--shadow-medium)]"
        style={{ minHeight: '320px' }}
      />
    </div>
  );
};

export default Map;