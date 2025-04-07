
import { useCallback } from 'react';

interface UseMapCenterProps {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
}

export function useMapCenter({ mapRef, onCenterChanged }: UseMapCenterProps) {
  const centerOnCoordinates = useCallback((coordinates: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.panTo(coordinates);
      mapRef.current.setZoom(14);
      onCenterChanged?.(coordinates);
    }
  }, [mapRef, onCenterChanged]);

  return {
    centerOnCoordinates
  };
}
