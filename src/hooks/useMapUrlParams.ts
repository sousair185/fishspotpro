
import { useEffect } from 'react';
import { FishingSpot } from '@/types/spot';

interface UseMapUrlParamsProps {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  spots: FishingSpot[];
  onSpotClick?: (spot: FishingSpot) => void;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
}

export const useMapUrlParams = ({
  mapRef,
  spots,
  onSpotClick,
  onCenterChanged
}: UseMapUrlParamsProps) => {
  // Process URL parameters for shared spots
  useEffect(() => {
    // Parse URL for shared spot parameters
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const spotId = urlParams.get('spotId');
    
    if (lat && lng) {
      const sharedLocation = { 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
      };
      
      // If map is already loaded, center it on the shared location
      if (mapRef.current) {
        mapRef.current.panTo(sharedLocation);
        mapRef.current.setZoom(14);
        onCenterChanged?.(sharedLocation);
        
        // If a spot ID was provided, find and select that spot
        if (spotId && spots.length > 0) {
          const sharedSpot = spots.find(spot => spot.id === spotId);
          if (sharedSpot && onSpotClick) {
            onSpotClick(sharedSpot);
          }
        }
      }
      
      // Clean URL parameters after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [spots, onSpotClick, mapRef, onCenterChanged]);
};
