
import { useState, useEffect, RefObject } from 'react';
import { FishingSpot } from '@/types/spot';
import { createPinElement } from '@/utils/markerUtils';

export const useMarkers = (
  spots: FishingSpot[],
  mapRef: RefObject<google.maps.Map>,
  isLoaded: boolean,
  isAdmin: boolean,
  onSpotClick: (spot: FishingSpot) => void
) => {
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Effect to create advanced markers when spots or map changes
  useEffect(() => {
    if (isLoaded && mapRef.current && spots.length > 0) {
      // Clean up any existing markers
      markers.forEach(marker => marker.map = null);
      
      // Create new markers for each spot
      const newMarkers = spots.map(spot => {
        const pinElement = createPinElement(spot, isAdmin);
        
        const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: spot.coordinates[1], lng: spot.coordinates[0] },
          map: mapRef.current,
          content: pinElement,
          title: spot.name
        });
        
        // Add click event listener
        advancedMarker.addListener("click", () => {
          onSpotClick(spot);
        });
        
        return advancedMarker;
      });
      
      setMarkers(newMarkers);
      
      // Cleanup function to remove markers when component unmounts
      return () => {
        newMarkers.forEach(marker => marker.map = null);
      };
    }
  }, [spots, isLoaded, mapRef.current, isAdmin, onSpotClick]);

  return { markers };
};
