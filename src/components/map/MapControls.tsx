
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Plus } from 'lucide-react';

interface MapControlsProps {
  onLocationClick: () => void;
  addingSpot: boolean;
  toggleAddingSpot: () => void;
  isAdmin: boolean;
  userLocation: { lat: number; lng: number } | null;
}

export function MapControls({ 
  onLocationClick, 
  addingSpot, 
  toggleAddingSpot, 
  isAdmin,
  userLocation
}: MapControlsProps) {
  return (
    <>
      <div className="absolute bottom-4 left-4 z-10 space-y-2">
        <Button
          variant={addingSpot ? "secondary" : "default"}
          size="sm"
          onClick={toggleAddingSpot}
          className="shadow-lg"
          disabled={!userLocation && !isAdmin}
          title={!userLocation && !isAdmin ? "Ative sua localização para adicionar spots" : ""}
        >
          {addingSpot ? "Cancelar" : <Plus className="mr-2" />}
          {addingSpot ? "Clique no mapa para adicionar" : isAdmin ? "Adicionar Local" : "Adicionar Spot"}
        </Button>
        {!userLocation && !isAdmin && (
          <div className="text-xs bg-background/80 p-2 rounded-md shadow">
            Ative sua localização para adicionar spots
          </div>
        )}
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

      {userLocation && (
        <div className="absolute bottom-16 left-4 z-10 bg-background/80 p-2 rounded-md shadow text-xs">
          <p>Sua localização atual:</p>
          <p>Lat: {userLocation.lat.toFixed(6)}</p>
          <p>Lng: {userLocation.lng.toFixed(6)}</p>
        </div>
      )}
    </>
  );
}
