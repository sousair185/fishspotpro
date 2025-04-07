
import { useState, useCallback } from 'react';
import { getSavedUserLocation } from '@/utils/locationUtils';
import { useToast } from '@/hooks/use-toast';

interface UseMapInitializationProps {
  defaultCenter: { lat: number; lng: number };
}

export function useMapInitialization({ defaultCenter }: UseMapInitializationProps) {
  const savedLocation = getSavedUserLocation();
  const [mapCenter, setMapCenter] = useState(savedLocation || defaultCenter);
  const { toast } = useToast();

  const handleCenterChange = useCallback((newCenter: { lat: number; lng: number }) => {
    setMapCenter(newCenter);
  }, []);

  // Check URL parameters for initial center
  const checkUrlParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    // If URL has coordinates, use them for initial center
    if (lat && lng) {
      const center = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
      setMapCenter(center);
      return center;
    }
    return null;
  }, []);

  return {
    mapCenter,
    setMapCenter,
    handleCenterChange,
    checkUrlParams,
    toast
  };
}
