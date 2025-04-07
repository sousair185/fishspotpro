
import React, { useState, useEffect, useMemo } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMarkers } from '@/hooks/useMarkers';
import { getSavedUserLocation } from '@/utils/locationUtils';
import { MapContainer } from './map/MapContainer';
import { MapControls } from './map/MapControls';
import { SpotFormContainer } from './map/SpotFormContainer';
import { useSpotsData } from '@/hooks/useSpotsData';

const defaultCenter = { lat: -20.4206, lng: -49.9737 };
const libraries: Libraries = ['places', 'geometry', 'marker'];

interface MapProps {
  selectedSpotFromList?: FishingSpot | null;
}

const Map: React.FC<MapProps> = ({ selectedSpotFromList }) => {
  const savedLocation = getSavedUserLocation();
  const [mapCenter, setMapCenter] = useState(savedLocation || defaultCenter);
  
  const [addingSpot, setAddingSpot] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA-_4LdTd5sQ4mzocyqwPmolfaFJXgawYg',
    libraries: libraries
  });

  // Use our extracted hook for fetching spots data - modified to show approved spots to all users
  const { spots, setSpots } = useSpotsData(user, isAdmin, isLoaded, initialSpots);

  const initialCenter = useMemo(() => [mapCenter.lng, mapCenter.lat] as [number, number], [mapCenter.lng, mapCenter.lat]);
  
  // Initialize Google Maps and get the mapRef first
  const {
    onLoad,
    handleMapClick,
    selectedSpot,
    setSelectedSpot,
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
    onCenterChanged: (newCenter) => {
      setMapCenter(newCenter);
    }
  });

  // Now use markers with the initialized mapRef
  const { markers } = useMarkers(spots, mapRef, isLoaded, isAdmin, (spot) => {
    setSelectedSpot(spot);
  });

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

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    // If URL has coordinates, use them for initial center
    if (lat && lng) {
      setMapCenter({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
    }
  }, []);

  // Effect to handle centering the map on the selected spot from the list
  useEffect(() => {
    if (selectedSpotFromList && isLoaded && mapRef.current) {
      const spotCoordinates = {
        lat: selectedSpotFromList.coordinates[1],
        lng: selectedSpotFromList.coordinates[0]
      };
      
      centerOnCoordinates(spotCoordinates);
      setSelectedSpot(selectedSpotFromList);
      
      // Show a toast notification
      toast({
        title: "Spot localizado",
        description: `${selectedSpotFromList.name} centralizado no mapa`
      });
    }
  }, [selectedSpotFromList, isLoaded, centerOnCoordinates, setSelectedSpot, toast]);

  if (loadError) return <div>Erro ao carregar o mapa. Tente novamente mais tarde.</div>;
  if (!isLoaded) return <div>Carregando mapa...</div>;

  // Define the Google Maps options with a cleaner style
  const mapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    streetViewControl: false, // Disable street view to keep UI cleaner
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    scaleControl: true,
    fullscreenControl: false, // Disable fullscreen control to keep UI cleaner
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]  // Turn off points of interest
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }]  // Turn off transit labels
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]  // Lighten landscape
      }
    ],
    mapId: 'k9b3mrCq5TOP665GkQDj90RNOoc='
  };

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
