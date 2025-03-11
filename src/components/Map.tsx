
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, useLoadScript, Libraries } from '@react-google-maps/api';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import SpotForm from './spots/SpotForm';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPinElement } from '@/utils/markerUtils';
import { SpotInfoWindow } from './spots/SpotInfoWindow';
import { MapControls } from './map/MapControls';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
};

const defaultCenter = { lat: -20.4206, lng: -49.9737 };

const USER_LOCATION_KEY = 'lastUserLocation';

const getSavedUserLocation = (): { lat: number; lng: number } | null => {
  try {
    const savedLocation = localStorage.getItem(USER_LOCATION_KEY);
    return savedLocation ? JSON.parse(savedLocation) : null;
  } catch (error) {
    console.error('Error retrieving location from localStorage:', error);
    return null;
  }
};

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
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA-_4LdTd5sQ4mzocyqwPmolfaFJXgawYg',
    libraries: libraries
  });

  const { data: fetchedSpots } = useQuery({
    queryKey: ['spots'],
    queryFn: async () => {
      const spotsCollection = collection(db, 'spots');
      
      let spotsSnapshot;
      
      if (isAdmin) {
        spotsSnapshot = await getDocs(spotsCollection);
      } else {
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

  // Effect to create advanced markers when spots or map changes
  useEffect(() => {
    if (isLoaded && mapRef.current && spots.length > 0) {
      // Clean up any existing markers
      markers.forEach(marker => marker.map = null);
      
      // Create new markers for each spot
      const newMarkers = spots.map(spot => {
        const pinElement = createPinElement(spot, isAdmin);
        
        const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: spot.coordinates[1], lng: spot.coordinates[0] },
          map: mapRef.current,
          content: pinElement,
          title: spot.name
        });
        
        // Add click event listener
        advancedMarker.addListener("click", () => {
          setSelectedSpot(spot);
        });
        
        return advancedMarker;
      });
      
      setMarkers(newMarkers);
      
      // Cleanup function to remove markers when component unmounts
      return () => {
        newMarkers.forEach(marker => marker.map = null);
      };
    }
  }, [spots, isLoaded, mapRef.current, isAdmin]);

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
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={mapCenter}
        onLoad={onLoad}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {selectedSpot && (
          <SpotInfoWindow 
            spot={selectedSpot} 
            isAdmin={isAdmin} 
            onClose={() => setSelectedSpot(null)}
            onLikeUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['spots'] });
              queryClient.invalidateQueries({ queryKey: ['popularSpots'] });
            }}
          />
        )}
      </GoogleMap>

      <MapControls
        onLocationClick={handleLocationClick}
        addingSpot={addingSpot}
        toggleAddingSpot={toggleAddingSpot}
        isAdmin={isAdmin}
      />

      {selectedCoordinates && user && (
        <SpotForm
          isOpen={true}
          onClose={() => {
            setSelectedCoordinates(null);
            setAddingSpot(false);
          }}
          coordinates={selectedCoordinates}
          onSpotAdded={handleSpotAdded}
          userId={user.uid}
        />
      )}
    </div>
  );
};

export default Map;

