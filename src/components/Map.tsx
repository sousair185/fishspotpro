
import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import SpotForm from './spots/SpotForm';
import { useMapbox } from '@/hooks/useMapbox';
import { useQuery } from '@tanstack/react-query';

// Styles moved to index.css
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .marker {
    cursor: pointer;
    width: 24px;
    height: 24px;
    color: hsl(var(--primary));
  }
  .marker:hover {
    color: hsl(var(--primary) / 0.8);
  }
  .mapboxgl-popup-content {
    padding: 0;
    border-radius: 8px;
  }
`;
document.head.appendChild(styleSheet);

const Map = () => {
  const [spots, setSpots] = useState<FishingSpot[]>(initialSpots);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [addingSpot, setAddingSpot] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar spots usando React Query
  const { data: fetchedSpots } = useQuery({
    queryKey: ['spots'],
    queryFn: async () => {
      const spotsCollection = collection(db, 'spots');
      const spotsSnapshot = await getDocs(spotsCollection);
      return spotsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FishingSpot[];
    },
    onSuccess: (data) => {
      setSpots([...initialSpots, ...data]);
    }
  });

  const { mapContainer } = useMapbox({
    initialCenter: [-47.9292, -15.7801],
    initialZoom: 5,
    spots,
    onSpotClick: setSelectedSpot,
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

  const handleSpotAdded = (newSpot: FishingSpot) => {
    setSpots(prev => [...prev, newSpot]);
    setAddingSpot(false);
    setSelectedCoordinates(null);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
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
