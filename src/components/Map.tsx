
import React, { useState, useEffect, useMemo } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMarkers } from '@/hooks/useMarkers';
import { MapContainer } from './map/MapContainer';
import { MapControls } from './map/MapControls';
import { SpotFormContainer } from './map/SpotFormContainer';
import { useSpotsData } from '@/hooks/useSpotsData';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useSpotSelection } from '@/hooks/useSpotSelection';
import { getDefaultMapOptions, defaultMapOptions } from './map/MapOptions';

const defaultCenter = { lat: -20.4206, lng: -49.9737 };
const libraries: Libraries = ['places', 'geometry', 'marker'];

interface MapProps {
  selectedSpotFromList?: FishingSpot | null;
}

const Map: React.FC<MapProps> = ({ selectedSpotFromList }) => {
  // Initialize map state
  const {
    mapCenter,
    handleCenterChange,
    checkUrlParams,
    toast
  } = useMapInitialization({ defaultCenter });
  
  const [addingSpot, setAddingSpot] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA-_4LdTd5sQ4mzocyqwPmolfaFJXgawYg',
    libraries: libraries
  });

  // Get map options only after Google Maps is loaded
  const mapOptions = useMemo(() => {
    return isLoaded ? getDefaultMapOptions() : defaultMapOptions;
  }, [isLoaded]);

  // Use our extracted hook for fetching spots data
  const { spots, setSpots } = useSpotsData(user, isAdmin, isLoaded, initialSpots);

  const initialCenter = useMemo(() => [mapCenter.lng, mapCenter.lat] as [number, number], [mapCenter.lng, mapCenter.lat]);
  
  // Initialize Google Maps and get the mapRef
  const {
    onLoad,
    handleMapClick,
    mapRef,
    centerOnUserLocation,
    centerOnCoordinates,
    userLocation
  } = useGoogleMaps({
    initialCenter,
    initialZoom: 12,
    spots,
    onSpotClick: (spot) => {
      setSelectedSpot(spot);
    },
    onMapClick: (coordinates) => {
      if (addingSpot) {
        if (!user) {
          toast({
            title: "Login necessário",
            description: "Faça login para adicionar novos spots",
            variant: "destructive"
          });
          return;
        }
        setSelectedCoordinates(coordinates);
      }
    },
    isAddingMode: addingSpot,
    onCenterChanged: handleCenterChange
  });

  // Use spot selection hook
  const { selectedSpot, setSelectedSpot } = useSpotSelection({
    selectedSpotFromList,
    centerOnCoordinates,
    isLoaded
  });

  // Now use markers with the initialized mapRef
  const { markers } = useMarkers(spots, mapRef, isLoaded, isAdmin, (spot) => {
    setSelectedSpot(spot);
  });

  // Check URL parameters on component mount
  useEffect(() => {
    checkUrlParams();
  }, [checkUrlParams]);

  const handleSpotAdded = (newSpot: FishingSpot) => {
    if (isAdmin || newSpot.status === 'approved') {
      setSpots(prev => [...prev, newSpot]);
    }
    setAddingSpot(false);
    setSelectedCoordinates(null);
    queryClient.invalidateQueries({ queryKey: ['spots'] });
    queryClient.invalidateQueries({ queryKey: ['popularSpots'] });
    
    // Show toast notification
    toast({
      title: "Spot adicionado",
      description: isAdmin ? "O spot foi adicionado com sucesso." : "O spot foi enviado para aprovação."
    });
  };

  if (loadError) return <div>Erro ao carregar o mapa. Tente novamente mais tarde.</div>;
  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <MapContainer
        mapCenter={mapCenter}
        onLoad={onLoad}
        handleMapClick={handleMapClick}
        mapOptions={mapOptions}
        selectedSpot={selectedSpot}
        isAdmin={isAdmin}
        onCloseInfoWindow={() => setSelectedSpot(null)}
      />

      <MapControls
        onLocationClick={() => {
          centerOnUserLocation();
          toast({
            title: "Localizando",
            description: "Buscando sua localização...",
          });
        }}
        addingSpot={addingSpot}
        toggleAddingSpot={() => setAddingSpot(!addingSpot)}
        isAdmin={isAdmin}
        userLocation={userLocation}
      />

      <SpotFormContainer
        selectedCoordinates={selectedCoordinates}
        user={user}
        onClose={() => {
          setSelectedCoordinates(null);
          setAddingSpot(false);
        }}
        onSpotAdded={handleSpotAdded}
        userLocation={userLocation}
      />
    </div>
  );
};

export default Map;
