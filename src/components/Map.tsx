import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, User, AlertCircle } from 'lucide-react';

interface MapProps {
  userLocation: { lat: number; lng: number };
  supporterLocation: { lat: number; lng: number };
  className?: string;
}

const Map: React.FC<MapProps> = ({ userLocation, supporterLocation, className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const supporterMarker = useRef<mapboxgl.Marker | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [mapError, setMapError] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Initialize map when token is provided
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      // Set access token
      mapboxgl.accessToken = mapboxToken;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Handle map load
      map.current.on('load', () => {
        setIsMapReady(true);
        console.log('Map loaded successfully');
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Map failed to load. Please check your API key and internet connection.');
      });

      // Add markers when map is ready
      map.current.on('load', () => {
        addMarkers();
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to initialize map. Please check your Mapbox token.');
    }

    // Cleanup
    return () => {
      if (userMarker.current) userMarker.current.remove();
      if (supporterMarker.current) supporterMarker.current.remove();
      if (map.current) map.current.remove();
    };
  }, [mapboxToken, userLocation.lat, userLocation.lng]);

  // Update markers when locations change
  useEffect(() => {
    if (isMapReady && map.current) {
      updateMarkers();
    }
  }, [supporterLocation, isMapReady]);

  const addMarkers = () => {
    if (!map.current) return;

    // User marker (blue)
    const userEl = document.createElement('div');
    userEl.className = 'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white';
    userEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

    userMarker.current = new mapboxgl.Marker(userEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
      .addTo(map.current);

    // Supporter marker (orange)
    const supporterEl = document.createElement('div');
    supporterEl.className = 'w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse';
    supporterEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

    supporterMarker.current = new mapboxgl.Marker(supporterEl)
      .setLngLat([supporterLocation.lng, supporterLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Supporter Location</strong>'))
      .addTo(map.current);
  };

  const updateMarkers = () => {
    if (supporterMarker.current) {
      supporterMarker.current.setLngLat([supporterLocation.lng, supporterLocation.lat]);
    }
    
    // Center map to show both markers
    if (map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([userLocation.lng, userLocation.lat]);
      bounds.extend([supporterLocation.lng, supporterLocation.lat]);
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 16
      });
    }
  };

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim());
      setMapError('');
    }
  };

  if (!mapboxToken) {
    return (
      <Card className={`shadow-[var(--shadow-medium)] rounded-2xl border-0 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="p-3 bg-blue-100 rounded-full mx-auto w-fit">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground">Setup Map</h3>
            <p className="text-sm text-muted-foreground">
              Enter your Mapbox public token to enable the interactive map.
              <br />
              Get your token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">mapbox.com</a>
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91ciB1c2VybmFtZSIsImEiOiJjazEyM..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="text-sm"
              />
              <CustomButton 
                variant="primary" 
                onClick={handleTokenSubmit}
                disabled={!tokenInput.trim()}
                className="w-full"
              >
                Load Map
              </CustomButton>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card className={`shadow-[var(--shadow-medium)] rounded-2xl border-0 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="p-3 bg-red-100 rounded-full mx-auto w-fit">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-foreground">Map Error</h3>
            <p className="text-sm text-muted-foreground">{mapError}</p>
            <CustomButton 
              variant="outline" 
              onClick={() => {
                setMapboxToken('');
                setMapError('');
              }}
              className="w-full"
            >
              Try Again
            </CustomButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-80 rounded-2xl overflow-hidden shadow-[var(--shadow-medium)]"
        style={{ minHeight: '320px' }}
      />
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;