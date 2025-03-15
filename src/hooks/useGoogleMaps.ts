import { useRef, useState, useCallback } from 'react';
import { FishingSpot } from '@/types/spot';
import { useMapUrlParams } from './useMapUrlParams';
import { useMapInteractions } from './useMapInteractions';
import { getSavedUserLocation } from '@/utils/locationUtils';

interface UseGoogleMapsProps {
  initialCenter: [number, number];
  initialZoom: number;
  spots: FishingSpot[];
  onSpotClick?: (spot: FishingSpot) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  isAddingMode?: boolean;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
}

export const useGoogleMaps = ({
  initialCenter,
  initialZoom,
  spots,
  onSpotClick,
  onMapClick,
  isAddingMode,
  onCenterChanged
}: UseGoogleMapsProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);

  // Use the URL parameters hook
  useMapUrlParams({
    mapRef,
    spots,
    onSpotClick,
    onCenterChanged
  });

  // Use the map interactions hook
  const {
    handleMapClick,
    centerOnCoordinates,
    centerOnUserLocation
  } = useMapInteractions({
    mapRef,
    isAddingMode,
    onMapClick,
    onCenterChanged,
    spots
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    // Check if there are URL parameters for shared location first
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    if (lat && lng) {
      const sharedLocation = { 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
      };
      map.panTo(sharedLocation);
      map.setZoom(14);
      onCenterChanged?.(sharedLocation);
      
      // Clean URL parameters after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // Otherwise check for saved location
    else {
      const savedLocation = getSavedUserLocation();
      if (savedLocation) {
        map.panTo(savedLocation);
        map.setZoom(14);
        onCenterChanged?.(savedLocation);
      }
    }
  }, [onCenterChanged]);

  return {
    onLoad,
    handleMapClick,
    selectedSpot,
    setSelectedSpot,
    mapRef,
    centerOnUserLocation,
    centerOnCoordinates
  };
};
