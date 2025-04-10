
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
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  
  // Effect to create advanced markers when spots or map changes
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
          marker.map = null;
        }
      });
      markersRef.current = [];
      
      // Wait for Advanced Marker functionality to be available
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        console.log('Advanced Marker not available yet, using fallback markers');
        
        // Use regular markers as fallback
        const newMarkers = spots.map(spot => {
          try {
            const marker = new google.maps.Marker({
              position: { lat: spot.coordinates[1], lng: spot.coordinates[0] },
              map: mapRef.current,
              title: spot.name,
              cursor: 'pointer'  // Add explicit cursor style
            });
            
            // Use regular click event for standard markers
            marker.addListener("click", () => {
              console.log('Standard marker clicked:', spot.name);
              onSpotClick(spot);
            });
            
            return marker as unknown as google.maps.marker.AdvancedMarkerElement;
          } catch (error) {
            console.error(`Error creating fallback marker for spot ${spot.name}:`, error);
            return null;
          }
        }).filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];
        
        markersRef.current = newMarkers;
        
        return () => {
          newMarkers.forEach(marker => {
            if (marker) {
              marker.map = null;
            }
          });
        };
      }
      
      // Create advanced markers if available
      const newMarkers = spots.map(spot => {
        try {
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
          
          // Use 'gmp-click' event for Advanced Markers
          advancedMarker.addEventListener("gmp-click", () => {
            console.log('Advanced marker clicked:', spot.name);
            onSpotClick(spot);
          });
          
          return advancedMarker;
        } catch (error) {
          console.error(`Error creating marker for spot ${spot.name}:`, error);
          return null;
        }
      }).filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];
      
      // Update the ref with the new markers
      markersRef.current = newMarkers;
      console.log('Created markers:', newMarkers.length);
      
      // Cleanup function
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
  }, [spots, isLoaded, isAdmin, onSpotClick, mapRef]);

  return { markers: markersRef.current };
};
