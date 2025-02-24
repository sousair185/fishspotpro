
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Plus, Fish } from 'lucide-react';
import { FishingSpot, initialSpots } from '@/types/spot';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHRnbXgxbzQwMGtuMmltYTZqeGE4ZnNnIn0.Zmg_sPy9OGW7UPNG_WWGZQ';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [spots, setSpots] = useState<FishingSpot[]>(initialSpots);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [addingSpot, setAddingSpot] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar spots do Firestore
  useEffect(() => {
    const loadSpots = async () => {
      try {
        const spotsCollection = collection(db, 'spots');
        const spotsSnapshot = await getDocs(spotsCollection);
        const spotsData = spotsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as FishingSpot[];
        setSpots([...initialSpots, ...spotsData]);
      } catch (error) {
        console.error('Erro ao carregar spots:', error);
      }
    };

    loadSpots();
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-47.9292, -15.7801],
      zoom: 4,
    });

    // Adicionar controles
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Adicionar marcadores para spots existentes
    spots.forEach(spot => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/><path d="M12 13V7"/><path d="M15 10h-6"/></svg>`;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${spot.name}</h3>
            <p class="text-sm">${spot.description}</p>
            <p class="text-xs mt-1">Espécies: ${spot.species.join(', ')}</p>
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat(spot.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Evento de clique no mapa para adicionar novo spot
    map.current.on('click', (e) => {
      if (!addingSpot) return;

      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      addNewSpot(coordinates);
      setAddingSpot(false);
    });

    return () => {
      map.current?.remove();
    };
  }, [spots, addingSpot]);

  // Função para adicionar novo spot
  const addNewSpot = async (coordinates: [number, number]) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar novos spots",
        variant: "destructive"
      });
      return;
    }

    try {
      const newSpot: Omit<FishingSpot, 'id'> = {
        name: "Novo Spot",
        description: "Descrição do novo spot de pesca",
        coordinates,
        type: 'river',
        species: ['Peixe'],
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      };

      const spotsCollection = collection(db, 'spots');
      const docRef = await addDoc(spotsCollection, newSpot);
      
      setSpots(prev => [...prev, { ...newSpot, id: docRef.id }]);
      
      toast({
        title: "Spot adicionado!",
        description: "Novo ponto de pesca adicionado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar spot",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
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
          {addingSpot ? "Adicionando..." : "Adicionar Spot"}
        </Button>
      </div>
      
      <style jsx global>{`
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
      `}</style>
    </div>
  );
};

export default Map;
