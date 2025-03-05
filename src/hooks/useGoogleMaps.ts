
import { useCallback, useRef, useState, useEffect } from 'react';
import { FishingSpot } from '@/types/spot';
import { GoogleMap } from '@react-google-maps/api';
import { useToast } from './use-toast';

interface UseGoogleMapsProps {
  initialCenter: [number, number];
  initialZoom: number;
  spots: FishingSpot[];
  onSpotClick?: (spot: FishingSpot) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  isAddingMode?: boolean;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
}

// Storage key for user location
const USER_LOCATION_KEY = 'lastUserLocation';

// Helper functions to store and retrieve location from localStorage
const saveUserLocation = (location: { lat: number; lng: number }) => {
  try {
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location to localStorage:', error);
  }
};

const getSavedUserLocation = (): { lat: number; lng: number } | null => {
  try {
    const savedLocation = localStorage.getItem(USER_LOCATION_KEY);
    return savedLocation ? JSON.parse(savedLocation) : null;
  } catch (error) {
    console.error('Error retrieving location from localStorage:', error);
    return null;
  }
};

export const useGoogleMaps = ({
  initialCenter,
  initialZoom,
  spots,
  onSpotClick,
  onMapClick,
  isAddingMode,
  onCenterChanged
}: UseGoogleMapsProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const { toast } = useToast();

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    // Check if there's a saved location on map load
    const savedLocation = getSavedUserLocation();
    if (savedLocation) {
      map.panTo(savedLocation);
      map.setZoom(14);
      onCenterChanged?.(savedLocation);
    }
  }, [onCenterChanged]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isAddingMode || !onMapClick || !e.latLng) return;
    const coordinates: [number, number] = [e.latLng.lng(), e.latLng.lat()];
    onMapClick(coordinates);
  }, [isAddingMode, onMapClick]);

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
  }, [spots, toast, onCenterChanged]);

  return {
    onLoad,
    handleMapClick,
    selectedSpot,
    setSelectedSpot,
    mapRef,
    centerOnUserLocation
  };
};
