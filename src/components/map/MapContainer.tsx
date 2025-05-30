
import React, { memo } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { SpotInfoWindow } from '../spots/SpotInfoWindow';
import { FishingSpot } from '@/types/spot';
import { useQueryClient } from '@tanstack/react-query';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
};

interface MapContainerProps {
  mapCenter: { lat: number; lng: number };
  onLoad: (map: google.maps.Map) => void;
  handleMapClick: (e: google.maps.MapMouseEvent) => void;
  mapOptions: google.maps.MapOptions;
  selectedSpot: FishingSpot | null;
  isAdmin: boolean;
  onCloseInfoWindow: () => void;
}

// Use React.memo to prevent unnecessary re-renders
export const MapContainer = memo(({
  mapCenter,
  onLoad,
  handleMapClick,
  mapOptions,
  selectedSpot,
  isAdmin,
  onCloseInfoWindow
}: MapContainerProps) => {
  const queryClient = useQueryClient();
  
  console.log("MapContainer render, selectedSpot:", selectedSpot?.name);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={mapCenter}
      onLoad={onLoad}
      onClick={handleMapClick}
      options={mapOptions}
    >
      {selectedSpot && (
        <SpotInfoWindow 
          spot={selectedSpot} 
          isAdmin={isAdmin} 
          onClose={onCloseInfoWindow}
          onLikeUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['spots'] });
            queryClient.invalidateQueries({ queryKey: ['popularSpots'] });
          }}
        />
      )}
    </GoogleMap>
  );
});

MapContainer.displayName = 'MapContainer';
