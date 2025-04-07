
import { useCallback } from 'react';
import { useToast } from './use-toast';

interface UseMapClickHandlerProps {
  isAddingMode?: boolean;
  onMapClick?: (coordinates: [number, number]) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function useMapClickHandler({
  isAddingMode,
  onMapClick,
  userLocation
}: UseMapClickHandlerProps) {
  const { toast } = useToast();

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isAddingMode || !onMapClick || !e.latLng) return;
    
    // Verificar se o usuário está a no máximo 2km do local clicado
    if (userLocation) {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(userLocation.lat, userLocation.lng),
        e.latLng
      );

      if (distance > 2000) { // 2km em metros
        toast({
          title: "Localização muito distante",
          description: "Você só pode adicionar spots a até 2km de sua localização atual.",
          variant: "destructive"
        });
        return;
      }
    } else {
      toast({
        title: "Localização indisponível",
        description: "Não foi possível determinar sua localização. Por favor, clique em 'Minha Localização' primeiro.",
        variant: "destructive"
      });
      return;
    }

    const coordinates: [number, number] = [e.latLng.lng(), e.latLng.lat()];
    onMapClick(coordinates);
  }, [isAddingMode, onMapClick, userLocation, toast]);

  return {
    handleMapClick
  };
}
