
import { useState, useEffect } from 'react';
import { FishingSpot } from '@/types/spot';
import { useToast } from '@/hooks/use-toast';

interface UseSpotSelectionProps {
  selectedSpotFromList?: FishingSpot | null;
  centerOnCoordinates: (coordinates: { lat: number; lng: number }) => void;
  isLoaded: boolean;
}

export function useSpotSelection({ 
  selectedSpotFromList, 
  centerOnCoordinates, 
  isLoaded 
}: UseSpotSelectionProps) {
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const { toast } = useToast();

  // Effect to handle centering the map on the selected spot from the list
  useEffect(() => {
    if (selectedSpotFromList && isLoaded) {
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
  }, [selectedSpotFromList, isLoaded, centerOnCoordinates, toast]);

  return {
    selectedSpot,
    setSelectedSpot
  };
}
