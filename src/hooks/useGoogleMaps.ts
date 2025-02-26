
import { useCallback, useRef, useState } from 'react';
import { FishingSpot } from '@/types/spot';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

interface UseGoogleMapsProps {
  initialCenter: [number, number];
  initialZoom: number;
  spots: FishingSpot[];
  onSpotClick?: (spot: FishingSpot) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  isAddingMode?: boolean;
}

export const useGoogleMaps = ({
  initialCenter,
  initialZoom,
  spots,
  onSpotClick,
  onMapClick,
  isAddingMode
}: UseGoogleMapsProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isAddingMode || !onMapClick || !e.latLng) return;
    const coordinates: [number, number] = [e.latLng.lng(), e.latLng.lat()];
    onMapClick(coordinates);
  }, [isAddingMode, onMapClick]);

  return {
    onLoad,
    handleMapClick,
    selectedSpot,
    setSelectedSpot,
    mapRef
  };
};
