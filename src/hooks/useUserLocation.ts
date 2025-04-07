
import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';
import { getSavedUserLocation, saveUserLocation } from '@/utils/locationUtils';

export function useUserLocation() {
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    getSavedUserLocation()
  );
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const locationErrorsRef = useRef(0);

  // Função para criar ou atualizar o marcador do usuário
  const updateUserMarker = useCallback((position: { lat: number; lng: number }, mapRef: React.MutableRefObject<google.maps.Map | null>) => {
    if (!mapRef.current || !window.google?.maps?.marker) return;
    
    // Remove marcador existente se houver
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
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

      userMarkerRef.current = marker;
    } catch (error) {
      console.error("Erro ao criar marcador do usuário:", error);
    }
  }, []);

  // Função auxiliar para tratar erros de geolocalização
  const handleLocationError = useCallback((
    error: GeolocationPositionError, 
    mapRef: React.MutableRefObject<google.maps.Map | null>,
    onCenterChanged?: (center: { lat: number; lng: number }) => void
  ) => {
    locationErrorsRef.current += 1;
    
    console.error("Erro de geolocalização:", error.code, error.message);
    
    let errorMessage = "Não foi possível obter sua localização. ";
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += "Permissão de localização negada. Verifique as configurações do seu navegador.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += "Informação de localização indisponível.";
        break;
      case error.TIMEOUT:
        errorMessage += "O tempo para obter sua localização expirou.";
        break;
      default:
        errorMessage += "Erro desconhecido.";
    }
    
    toast({
      title: "Erro de localização",
      description: errorMessage,
      variant: "destructive"
    });
    
    // Se for um erro de timeout, tente novamente com menos precisão
    if (error.code === error.TIMEOUT && locationErrorsRef.current < 3) {
      setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            saveUserLocation(userLocation);
            setUserLocation(userLocation);
            updateUserMarker(userLocation, mapRef);
            if (mapRef.current && onCenterChanged) {
              mapRef.current.panTo(userLocation);
              onCenterChanged(userLocation);
            }
            locationErrorsRef.current = 0;
          },
          () => {},
          { 
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000  // 1 minuto
          }
        );
      }, 1000);
    }
  }, [toast, updateUserMarker]);

  // Função para iniciar o monitoramento contínuo de localização
  const startLocationWatching = useCallback((mapRef: React.MutableRefObject<google.maps.Map | null>) => {
    if (!navigator.geolocation || watchIdRef.current !== null) return;
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Apenas atualiza se a localização mudou significativamente (> 10 metros)
        if (!userLocation) {
          setUserLocation(newLocation);
          saveUserLocation(newLocation);
          updateUserMarker(newLocation, mapRef);
        } else {
          const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userLocation.lat, userLocation.lng),
            new google.maps.LatLng(newLocation.lat, newLocation.lng)
          );
          
          if (distance > 10) { // 10 metros
            setUserLocation(newLocation);
            saveUserLocation(newLocation);
            updateUserMarker(newLocation, mapRef);
          }
        }
      },
      (error) => {
        console.warn("Erro no monitoramento de localização:", error.message);
        // Não mostra toast para erros de monitoramento para evitar spam
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 30000, // 30 segundos
        timeout: 27000 // 27 segundos
      }
    );
  }, [userLocation, updateUserMarker]);

  // Função melhorada para obter a localização do usuário
  const centerOnUserLocation = useCallback((
    mapRef: React.MutableRefObject<google.maps.Map | null>,
    spots: any[],
    onCenterChanged?: (center: { lat: number; lng: number }) => void
  ) => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
      return;
    }

    // Mostrar feedback ao usuário
    toast({
      title: "Localizando",
      description: "Buscando sua localização...",
    });

    // Limpar watch anterior se existir
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Primeiro tentar obter uma leitura de alta precisão
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
        updateUserMarker(userLocation, mapRef);

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

        // Iniciar monitoramento contínuo de localização
        startLocationWatching(mapRef);
      },
      (error) => {
        handleLocationError(error, mapRef, onCenterChanged);
      },
      { 
        enableHighAccuracy: true,
        timeout: 15000,  // 15 segundos
        maximumAge: 0    // Não usar cache
      }
    );
  }, [toast, updateUserMarker, handleLocationError, startLocationWatching]);

  // Inicializa o rastreamento de localização do usuário
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
      }
    };
  }, []);

  return {
    userLocation,
    centerOnUserLocation,
    updateUserMarker,
    startLocationWatching
  };
}
