
import { useCallback, useEffect } from 'react';
import { FishingSpot } from '@/types/spot';
import { useUserLocation } from './useUserLocation';
import { useMapClickHandler } from './useMapClickHandler';
import { useMapCenter } from './useMapCenter';

interface UseMapInteractionsProps {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  isAddingMode?: boolean;
  onMapClick?: (coordinates: [number, number]) => void;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
  spots: FishingSpot[];
}

export const useMapInteractions = ({
  mapRef,
  isAddingMode,
  onMapClick,
  onCenterChanged,
  spots
}: UseMapInteractionsProps) => {
  // Use the user location hook
  const { 
    userLocation, 
    centerOnUserLocation: getUserLocation, 
    updateUserMarker 
  } = useUserLocation();

  // Use the map click handler hook
  const { handleMapClick } = useMapClickHandler({
    isAddingMode,
    onMapClick,
    userLocation
  });

  // Use the map center hook
  const { centerOnCoordinates } = useMapCenter({
    mapRef,
    onCenterChanged
  });

  // Wrapper for centerOnUserLocation to include spots and mapRef
  const centerOnUserLocation = useCallback(() => {
    getUserLocation(mapRef, spots, onCenterChanged);
  }, [getUserLocation, mapRef, spots, onCenterChanged]);

  // Inicializa o rastreamento de localização do usuário
  useEffect(() => {
    // Verifica se já existe uma localização salva e atualiza o marcador
    if (userLocation && mapRef.current && window.google?.maps?.marker) {
      updateUserMarker(userLocation, mapRef);
    }
  }, [mapRef, updateUserMarker, userLocation]);

  return {
    handleMapClick,
    centerOnCoordinates,
    centerOnUserLocation,
    userLocation
  };
};
