
import { useState, useEffect, RefObject, useRef } from 'react';
import { FishingSpot } from '@/types/spot';
import { createPinElement, getMarkerIcon } from '@/utils/markerUtils';

export const useMarkers = (
  spots: FishingSpot[],
  mapRef: RefObject<google.maps.Map>,
  isLoaded: boolean,
  isAdmin: boolean,
  onSpotClick: (spot: FishingSpot) => void
) => {
  const markersRef = useRef<(google.maps.marker.AdvancedMarkerElement | google.maps.Marker)[]>([]);
  
  // Effect to create markers when spots or map changes
  useEffect(() => {
    // Only proceed if Google Maps is loaded, map reference is available, and spots exist
    if (!isLoaded || !mapRef.current) {
      console.log('Markers not created: conditions not met', { 
        isLoaded, 
        mapExists: !!mapRef.current, 
        spotsCount: spots.length 
      });
      return () => {};
    }
    
    try {
      console.log('Creating markers for spots:', spots.length);
      
      // Clean up any existing markers
      markersRef.current.forEach(marker => {
        if (marker) {
          // Handle different marker types
          if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
            marker.map = null;
          } else if (marker instanceof google.maps.Marker) {
            marker.setMap(null);
          }
        }
      });
      markersRef.current = [];
      
      // Check if Advanced Marker functionality is available
      const useAdvancedMarkers = !!(window.google?.maps?.marker?.AdvancedMarkerElement);
      console.log('Using Advanced Markers:', useAdvancedMarkers);
      
      // Create appropriate markers based on availability
      const newMarkers = spots.map(spot => {
        try {
          if (useAdvancedMarkers) {
            // Create advanced marker
            const pinElement = createPinElement(spot, isAdmin);
            
            if (!pinElement) {
              console.error('Failed to create pin element for spot:', spot.name);
              return null;
            }
            
            const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: spot.coordinates[1], lng: spot.coordinates[0] },
              map: mapRef.current,
              content: pinElement,
              title: spot.name
            });
            
            // Use 'click' event for Advanced Markers (this was 'gmp-click' before)
            advancedMarker.addListener("click", () => {
              console.log('Advanced marker clicked:', spot.name);
              onSpotClick(spot);
            });
            
            return advancedMarker;
          } else {
            // Use regular markers as fallback
            const markerIcon = getMarkerIcon(spot, isAdmin);
            
            const marker = new google.maps.Marker({
              position: { lat: spot.coordinates[1], lng: spot.coordinates[0] },
              map: mapRef.current,
              title: spot.name,
              icon: markerIcon,
              cursor: 'pointer'
            });
            
            // Add explicit click event for standard markers
            marker.addListener("click", () => {
              console.log('Standard marker clicked:', spot.name);
              onSpotClick(spot);
            });
            
            return marker;
          }
        } catch (error) {
          console.error(`Error creating marker for spot ${spot.name}:`, error);
          return null;
        }
      }).filter(Boolean) as (google.maps.marker.AdvancedMarkerElement | google.maps.Marker)[];
      
      // Update the ref with the new markers
      markersRef.current = newMarkers;
      console.log('Created markers:', newMarkers.length);
      
      // Cleanup function
      return () => {
        newMarkers.forEach(marker => {
          if (marker) {
            // Handle different marker types for cleanup
            if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
              marker.map = null;
            } else if (marker instanceof google.maps.Marker) {
              marker.setMap(null);
            }
          }
        });
      };
    } catch (error) {
      console.error("Error creating markers:", error);
      return () => {};
    }
  }, [spots, isLoaded, isAdmin, onSpotClick, mapRef]);

  return { markers: markersRef.current };
};
