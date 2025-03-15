import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, or } from 'firebase/firestore';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMarkers } from '@/hooks/useMarkers';
import { getSavedUserLocation } from '@/utils/locationUtils';
import { MapContainer } from './map/MapContainer';
import { MapControls } from './map/MapControls';
import { SpotFormContainer } from './map/SpotFormContainer';

const defaultCenter = { lat: -20.4206, lng: -49.9737 };
const libraries: Libraries = ['places', 'geometry', 'marker'];

interface MapProps {
  selectedSpotFromList?: FishingSpot | null;
}

const Map: React.FC<MapProps> = ({ selectedSpotFromList }) => {
  const savedLocation = getSavedUserLocation();
  const [mapCenter, setMapCenter] = useState(savedLocation || defaultCenter);
  
  const [spots, setSpots] = useState<FishingSpot[]>(initialSpots);
  const [addingSpot, setAddingSpot] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA-_4LdTd5sQ4mzocyqwPmolfaFJXgawYg',
    libraries: libraries
  });

  const { data: fetchedSpots } = useQuery({
    queryKey: ['spots', user?.uid],
    queryFn: async () => {
      const spotsCollection = collection(db, 'spots');
      
      let spotsSnapshot;
      
      if (isAdmin) {
        // Admins veem todos os spots
        spotsSnapshot = await getDocs(spotsCollection);
      } else if (user) {
        // Usuários logados veem spots aprovados e seus próprios spots privados
        spotsSnapshot = await getDocs(
          query(spotsCollection, 
            or(
              where('status', '==', 'approved'),
              where('createdBy', '==', user.uid)
            )
          )
        );
      } else {
        // Usuários não logados só veem spots aprovados
        spotsSnapshot = await getDocs(
          query(spotsCollection, where('status', '==', 'approved'))
        );
      }
      
      const spotsData = spotsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FishingSpot[];
      
      setSpots([...initialSpots, ...spotsData]);
      return spotsData;
    },
    enabled: isLoaded
  });

  const handleSpotAdded = (newSpot: FishingSpot) => {
    if (isAdmin || newSpot.status === 'approved') {
      setSpots(prev => [...prev, newSpot]);
    }
    setAddingSpot(false);
    setSelectedCoordinates(null);
    queryClient.invalidateQueries({ queryKey: ['spots'] });
    queryClient.invalidateQueries({ queryKey: ['popularSpots'] });
  };

  const initialCenter = useMemo(() => [mapCenter.lng, mapCenter.lat] as [number, number], [mapCenter.lng, mapCenter.lat]);
  
  const {
    onLoad,
    handleMapClick,
    selectedSpot,
    setSelectedSpot,
    mapRef,
    centerOnUserLocation,
    centerOnCoordinates
  } = useGoogleMaps({
    initialCenter,
    initialZoom: 12,
    spots,
    onSpotClick: (spot) => {
      setSelectedSpot(spot);
    },
    onMapClick: (coordinates) => {
      if (!user) {
        toast({
          title: "Login necessário",
          description: "Faça login para adicionar novos spots",
          variant: "destructive"
        });
        return;
      }
      setSelectedCoordinates(coordinates);
    },
    isAddingMode: addingSpot,
    onCenterChanged: (newCenter) => {
      setMapCenter(newCenter);
    }
  });

  // Directly check URL parameters on component mount
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

  // Use the marker hook
  useMarkers(spots, mapRef, isLoaded, isAdmin, (spot) => setSelectedSpot(spot));

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

  const handleLocationClick = useCallback(() => {
    centerOnUserLocation();
    toast({
      title: "Localizando",
      description: "Buscando sua localização...",
    });
  }, [centerOnUserLocation, toast]);

  const toggleAddingSpot = useCallback(() => {
    setAddingSpot(!addingSpot);
  }, [addingSpot]);

  const mapOptions = useMemo(() => ({
    mapTypeId: 'roadmap',
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    scaleControl: true,
    mapId: 'k9b3mrCq5TOP665GkQDj90RNOoc='
  }), []);

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
        onLocationClick={handleLocationClick}
        addingSpot={addingSpot}
        toggleAddingSpot={toggleAddingSpot}
        isAdmin={isAdmin}
      />

      <SpotFormContainer
        selectedCoordinates={selectedCoordinates}
        user={user}
        onClose={() => {
          setSelectedCoordinates(null);
          setAddingSpot(false);
        }}
        onSpotAdded={handleSpotAdded}
      />
    </div>
  );
};

export default Map;
