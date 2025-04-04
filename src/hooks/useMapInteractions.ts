
import { useCallback, useState, useEffect } from 'react';
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

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

  const centerOnCoordinates = useCallback((coordinates: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.panTo(coordinates);
      mapRef.current.setZoom(14);
      onCenterChanged?.(coordinates);
    }
  }, [mapRef, onCenterChanged]);

  // Função para criar ou atualizar o marcador do usuário
  const updateUserMarker = useCallback((position: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps?.marker) return;
    
    // Remove marcador existente se houver
    if (userMarker) {
      userMarker.map = null;
    }

    try {
      // Cria um elemento visual para o marcador do usuário
      const userElement = document.createElement('div');
      userElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4f46e5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
      userElement.style.cursor = 'pointer';

      // Cria o marcador avançado
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: position,
        map: mapRef.current,
        content: userElement.firstElementChild as HTMLElement,
        title: "Sua localização"
      });

      setUserMarker(marker);
    } catch (error) {
      console.error("Erro ao criar marcador do usuário:", error);
    }
  }, [mapRef, userMarker]);

  const centerOnUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Salva a localização do usuário e atualiza o estado
          saveUserLocation(userLocation);
          setUserLocation(userLocation);
          
          // Atualiza o marcador do usuário
          updateUserMarker(userLocation);

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
  }, [spots, toast, onCenterChanged, mapRef, updateUserMarker]);

  // Inicializa o rastreamento de localização do usuário
  useEffect(() => {
    // Verifica se já existe uma localização salva
    const savedLocation = getSavedUserLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
      if (mapRef.current) {
        updateUserMarker(savedLocation);
      }
    }
    
    // Configura o observador da geolocalização contínua
    let watchId: number | null = null;
    
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(newLocation);
          saveUserLocation(newLocation);
          updateUserMarker(newLocation);
        },
        (error) => {
          console.error("Erro no rastreamento de localização:", error);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 30000, // 30 segundos
          timeout: 27000 // 27 segundos
        }
      );
    }
    
    // Limpeza ao desmontar
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (userMarker) {
        userMarker.map = null;
      }
    };
  }, [mapRef, updateUserMarker]);

  return {
    handleMapClick,
    centerOnCoordinates,
    centerOnUserLocation,
    userLocation
  };
};
