
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Plus } from 'lucide-react';

interface MapControlsProps {
  onLocationClick: () => void;
  addingSpot: boolean;
  toggleAddingSpot: () => void;
  isAdmin: boolean;
}

export function MapControls({ 
  onLocationClick, 
  addingSpot, 
  toggleAddingSpot, 
  isAdmin 
}: MapControlsProps) {
  return (
    <>
      <div className="absolute bottom-4 left-4 z-10 space-y-2">
        <Button
          variant={addingSpot ? "secondary" : "default"}
          size="sm"
          onClick={toggleAddingSpot}
          className="shadow-lg"
        >
          {addingSpot ? "Cancelar" : <Plus className="mr-2" />}
          {addingSpot ? "Clique no mapa para adicionar" : isAdmin ? "Adicionar Local" : "Adicionar Spot"}
        </Button>
      </div>

      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          variant="default"
          size="icon"
          onClick={onLocationClick}
          className="shadow-lg"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
