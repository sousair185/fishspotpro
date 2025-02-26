
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from './ui/button';
import { Plus, Navigation } from 'lucide-react';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import SpotForm from './spots/SpotForm';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useQuery } from '@tanstack/react-query';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
};

const Map = () => {
  const [spots, setSpots] = useState<FishingSpot[]>(initialSpots);
  const [addingSpot, setAddingSpot] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA-_4LdTd5sQ4mzocyqwPmolfaFJXgawYg',
    libraries: ['places']
  });

  const { data: fetchedSpots } = useQuery({
    queryKey: ['spots'],
    queryFn: async () => {
      const spotsCollection = collection(db, 'spots');
      const spotsSnapshot = await getDocs(spotsCollection);
      const spotsData = spotsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FishingSpot[];
      setSpots([...initialSpots, ...spotsData]);
      return spotsData;
    }
  });

  const handleSpotAdded = (newSpot: FishingSpot) => {
    setSpots(prev => [...prev, newSpot]);
    setAddingSpot(false);
    setSelectedCoordinates(null);
  };

  const {
    onLoad,
    handleMapClick,
    selectedSpot,
    setSelectedSpot,
    mapRef,
    centerOnUserLocation
  } = useGoogleMaps({
    initialCenter: [-47.9292, -15.7801],
    initialZoom: 12, // Zoom inicial mais aproximado
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
    isAddingMode: addingSpot
  });

  const handleLocationClick = useCallback(() => {
    centerOnUserLocation();
    toast({
      title: "Localizando",
      description: "Buscando sua localização...",
    });
  }, [centerOnUserLocation, toast]);

  // Buscar localização do usuário assim que o mapa carregar
  useEffect(() => {
    if (isLoaded) {
      centerOnUserLocation();
    }
  }, [isLoaded, centerOnUserLocation]);

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={{ lat: -15.7801, lng: -47.9292 }}
        onLoad={onLoad}
        onClick={handleMapClick}
        options={{
          mapTypeId: 'roadmap', // Muda o tipo do mapa para roadmap (mapa normal)
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          scaleControl: true
        }}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={{ lat: spot.coordinates[1], lng: spot.coordinates[0] }}
            onClick={() => setSelectedSpot(spot)}
          />
        ))}

        {selectedSpot && (
          <InfoWindow
            position={{ lat: selectedSpot.coordinates[1], lng: selectedSpot.coordinates[0] }}
            onCloseClick={() => setSelectedSpot(null)}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedSpot.name}</h3>
              <p className="text-sm">{selectedSpot.description}</p>
              <p className="text-xs mt-1">Espécies: {selectedSpot.species.join(', ')}</p>
              {selectedSpot.images && (
                <div className="mt-2 flex gap-2">
                  {selectedSpot.images.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="Foto do spot"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute bottom-4 left-4 z-10 space-y-2">
        <Button
          variant={addingSpot ? "secondary" : "default"}
          size="sm"
          onClick={() => setAddingSpot(!addingSpot)}
          className="shadow-lg"
        >
          {addingSpot ? "Cancelar" : <Plus className="mr-2" />}
          {addingSpot ? "Clique no mapa para adicionar" : "Adicionar Spot"}
        </Button>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant="default"
          size="icon"
          onClick={handleLocationClick}
          className="shadow-lg"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

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
