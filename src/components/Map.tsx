
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Libraries } from '@react-google-maps/api';
import { Button } from './ui/button';
import { Plus, Navigation } from 'lucide-react';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import SpotForm from './spots/SpotForm';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useQuery } from '@tanstack/react-query';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
};

// Coordenadas de Votuporanga-SP
const defaultCenter = { lat: -20.4206, lng: -49.9737 };

// Defina as bibliotecas como uma constante fora do componente
// para evitar recriação durante as renderizações
const libraries: Libraries = ['places', 'geometry'];

const Map = () => {
  const [spots, setSpots] = useState<FishingSpot[]>(initialSpots);
  const [addingSpot, setAddingSpot] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const { toast } = useToast();
  const { user } = useAuth();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA-_4LdTd5sQ4mzocyqwPmolfaFJXgawYg',
    libraries: libraries
  });

  const { data: fetchedSpots } = useQuery({
    queryKey: ['spots'],
    queryFn: async () => {
      const spotsCollection = collection(db, 'spots');
      
      // Apenas buscar spots aprovados, exceto se o usuário for administrador
      // (o administrador será configurado manualmente no Firebase)
      let spotsSnapshot;
      
      if (user && user.email === 'admin@fishspotpro.com') {
        // Administrador vê todos os spots
        spotsSnapshot = await getDocs(spotsCollection);
      } else {
        // Usuários comuns só veem spots aprovados
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
    // Só adicione ao mapa se for administrador ou se for spot aprovado
    if (user?.email === 'admin@fishspotpro.com' || newSpot.status === 'approved') {
      setSpots(prev => [...prev, newSpot]);
    }
    setAddingSpot(false);
    setSelectedCoordinates(null);
  };

  // Use useMemo para evitar recriações desnecessárias de objetos
  const initialCenter = useMemo(() => [mapCenter.lng, mapCenter.lat] as [number, number], [mapCenter.lng, mapCenter.lat]);
  
  const {
    onLoad,
    handleMapClick,
    selectedSpot,
    setSelectedSpot,
    mapRef,
    centerOnUserLocation
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

  const handleLocationClick = useCallback(() => {
    centerOnUserLocation();
    toast({
      title: "Localizando",
      description: "Buscando sua localização...",
    });
  }, [centerOnUserLocation, toast]);

  // Apenas carregue o mapa, sem centralizar automaticamente
  useEffect(() => {
    // Efeito de carregamento inicial do mapa
    // Não buscamos mais automaticamente a localização do usuário
  }, [isLoaded]);

  // Memoize as opções do mapa para evitar recriação em cada renderização
  const mapOptions = useMemo(() => ({
    mapTypeId: 'roadmap',
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    scaleControl: true
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
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={{ lat: spot.coordinates[1], lng: spot.coordinates[0] }}
            onClick={() => setSelectedSpot(spot)}
            // Usar ícones diferentes para spots pendentes e rejeitados (apenas para admin)
            icon={user?.email === 'admin@fishspotpro.com' && spot.status !== 'approved' 
              ? {
                  url: `data:image/svg+xml;charset=UTF-8,
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${spot.status === 'pending' ? 'orange' : 'red'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>`,
                  scaledSize: new google.maps.Size(36, 36)
                } 
              : undefined
            }
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
              {user?.email === 'admin@fishspotpro.com' && (
                <p className="text-xs mt-1 font-semibold" style={{
                  color: selectedSpot.status === 'approved' ? 'green' : 
                         selectedSpot.status === 'pending' ? 'orange' : 'red'
                }}>
                  Status: {
                    selectedSpot.status === 'approved' ? 'Aprovado' : 
                    selectedSpot.status === 'pending' ? 'Pendente' : 'Rejeitado'
                  }
                </p>
              )}
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
