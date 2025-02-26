
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { FishingSpot } from '@/types/spot';

// Configure o token do Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZmlzaHNwb3QiLCJhIjoiY2x0eWExbms0MWphZDJrcnZ3eHc1Z2xoMyJ9.mL-OF7H6maGxtiJbEpLrfA';

interface UseMapboxProps {
  initialCenter: [number, number];
  initialZoom: number;
  spots: FishingSpot[];
  onSpotClick?: (spot: FishingSpot) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  isAddingMode?: boolean;
}

export const useMapbox = ({
  initialCenter,
  initialZoom,
  spots,
  onSpotClick,
  onMapClick,
  isAddingMode
}: UseMapboxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: initialCenter,
      zoom: initialZoom,
      maxZoom: 18,
      minZoom: 3,
    });

    // Controles de navegação
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
      }),
      'top-right'
    );

    // Controle de geolocalização
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true
    });

    map.current.addControl(geolocate, 'top-right');

    // Configurações do mapa
    map.current.on('load', () => {
      geolocate.trigger();
      
      map.current?.setFog({
        'horizon-blend': 0.2,
        'color': '#f8f8f8',
        'high-color': '#add8e6',
        'space-color': '#d8f2ff',
        'star-intensity': 0.15
      });

      map.current?.setLight({
        anchor: 'viewport',
        color: 'white',
        intensity: 0.4,
        position: [1.5, 90, 80]
      });

      setMapLoaded(true);
    });

    // Evento de clique no mapa
    if (onMapClick) {
      map.current.on('click', (e) => {
        if (!isAddingMode) return;
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        onMapClick(coordinates);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [initialCenter, initialZoom, isAddingMode]);

  // Atualizar marcadores quando spots mudam
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Limpar marcadores existentes
    const markers = document.getElementsByClassName('marker');
    while (markers[0]) {
      markers[0].parentNode?.removeChild(markers[0]);
    }

    // Adicionar novos marcadores
    spots.forEach(spot => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/><path d="M12 13V7"/><path d="M15 10h-6"/></svg>`;

      if (onSpotClick) {
        el.onclick = () => onSpotClick(spot);
      }

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${spot.name}</h3>
            <p class="text-sm">${spot.description}</p>
            <p class="text-xs mt-1">Espécies: ${spot.species.join(', ')}</p>
            ${spot.images ? `
              <div class="mt-2 flex gap-2">
                ${spot.images.map(url => `
                  <img src="${url}" alt="Foto do spot" class="w-20 h-20 object-cover rounded" />
                `).join('')}
              </div>
            ` : ''}
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat(spot.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [spots, mapLoaded]);

  return { mapContainer, map };
};
