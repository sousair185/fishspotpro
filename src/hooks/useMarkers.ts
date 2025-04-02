
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
    // Only proceed if Google Maps is loaded, map reference is available, and spots exist
    if (isLoaded && mapRef.current && spots.length > 0 && window.google?.maps?.marker) {
      // Clean up any existing markers
      markers.forEach(marker => {
        if (marker) {
          marker.map = null;
        }
      });
      
      try {
        // Create new markers for each spot
        const newMarkers = spots.map(spot => {
          const pinElement = createPinElement(spot, isAdmin);
          
          // Make sure google.maps.marker.AdvancedMarkerElement is available
          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: spot.coordinates[1], lng: spot.coordinates[0] },
              map: mapRef.current,
              content: pinElement,
              title: spot.name
            });
            
            // Use 'gmp-click' event instead of 'click' for Advanced Markers
            advancedMarker.addEventListener("gmp-click", () => {
              onSpotClick(spot);
            });
            
            return advancedMarker;
          }
          return null;
        }).filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];
        
        setMarkers(newMarkers);
        
        // Cleanup function to remove markers when component unmounts
        return () => {
          newMarkers.forEach(marker => {
            if (marker) {
              marker.map = null;
            }
          });
        };
      } catch (error) {
        console.error("Error creating markers:", error);
        return () => {};
      }
    }
    
    return () => {}; // Empty cleanup function for when conditions aren't met
  }, [spots, isLoaded, mapRef.current, isAdmin, onSpotClick]);

  return { markers };
};
