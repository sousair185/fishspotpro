
import { useRef, useCallback } from 'react';
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
  const isMapLoaded = useRef<boolean>(false);

  // Use the map interactions hook
  const {
    handleMapClick,
    centerOnCoordinates,
    centerOnUserLocation,
    userLocation
  } = useMapInteractions({
    mapRef,
    isAddingMode,
    onMapClick,
    onCenterChanged,
    spots
  });

  // Use the URL parameters hook
  useMapUrlParams({
    mapRef,
    spots,
    onSpotClick,
    onCenterChanged
  });

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded");
    mapRef.current = map;
    isMapLoaded.current = true;
    
    // Check if there are URL parameters for shared location first
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const spotId = urlParams.get('spotId');
    
    if (lat && lng) {
      const sharedLocation = { 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
      };
      map.panTo(sharedLocation);
      map.setZoom(14);
      onCenterChanged?.(sharedLocation);
      
      // If spotId is provided, find and select the spot
      if (spotId) {
        const spot = spots.find(s => s.id === spotId);
        if (spot && onSpotClick) {
          console.log("Auto-selecting spot from URL:", spot.name);
          setTimeout(() => {
            onSpotClick(spot);
          }, 500);
        }
      }
      
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
  }, [onCenterChanged, spots, onSpotClick]);

  return {
    onLoad: handleMapLoad,
    handleMapClick,
    mapRef,
    centerOnUserLocation,
    centerOnCoordinates,
    userLocation,
    isMapLoaded
  };
};
