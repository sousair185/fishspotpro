
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { getSavedUserLocation, saveUserLocation } from '@/utils/locationUtils';
import { FishingSpot } from '@/types/spot';

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
  const { toast } = useToast();

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isAddingMode || !onMapClick || !e.latLng) return;
    const coordinates: [number, number] = [e.latLng.lng(), e.latLng.lat()];
    onMapClick(coordinates);
  }, [isAddingMode, onMapClick]);

  const centerOnCoordinates = useCallback((coordinates: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.panTo(coordinates);
      mapRef.current.setZoom(14);
      onCenterChanged?.(coordinates);
    }
  }, [mapRef, onCenterChanged]);

  const centerOnUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Save the user location to localStorage
          saveUserLocation(userLocation);

          if (mapRef.current) {
            mapRef.current.panTo(userLocation);
            mapRef.current.setZoom(14);
            onCenterChanged?.(userLocation);

            // Encontrar spots próximos (num raio de aproximadamente 20km)
            const nearbySpots = spots.filter(spot => {
              const spotLat = spot.coordinates[1];
              const spotLng = spot.coordinates[0];
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userLocation.lat, userLocation.lng),
                new google.maps.LatLng(spotLat, spotLng)
              );
              return distance <= 20000; // 20km em metros
            });

            // Notificar sobre os spots encontrados
            if (nearbySpots.length > 0) {
              toast({
                title: "Spots encontrados!",
                description: `${nearbySpots.length} spots de pesca num raio de 20km.`
              });
            } else {
              toast({
                title: "Nenhum spot próximo",
                description: "Não encontramos spots de pesca num raio de 20km."
              });
            }
          }
        },
        (error) => {
          toast({
            title: "Erro de localização",
            description: "Não foi possível obter sua localização. Verifique as permissões do navegador.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
    }
  }, [spots, toast, onCenterChanged, mapRef]);

  return {
    handleMapClick,
    centerOnCoordinates,
    centerOnUserLocation
  };
};
