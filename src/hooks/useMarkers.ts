
import { useState, useEffect, RefObject, useRef } from 'react';
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
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  
  // Effect to create advanced markers when spots or map changes
  useEffect(() => {
    // Only proceed if Google Maps is loaded, map reference is available, and spots exist
    if (!isLoaded || !mapRef.current || !spots.length || !window.google?.maps?.marker) {
      return () => {};
    }
    
    // Clean up any existing markers
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.map = null;
      }
    });
    
    try {
      // Create new markers for each spot
      const newMarkers = spots.map(spot => {
        try {
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
        } catch (error) {
          console.error(`Error creating marker for spot ${spot.name}:`, error);
        }
        return null;
      }).filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];
      
      // Update the ref first, then the state to avoid continuous re-renders
      markersRef.current = newMarkers;
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
  }, [spots, isLoaded, isAdmin, onSpotClick]); // Removed mapRef.current from dependencies

  return { markers: markersRef.current };
};
