
import React from 'react';
import SpotForm from '../spots/SpotForm';
import { FishingSpot } from '@/types/spot';
import { FirebaseUser } from '@/types/user';

interface SpotFormContainerProps {
  selectedCoordinates: [number, number] | null;
  user: FirebaseUser | null;
  onClose: () => void;
  onSpotAdded: (newSpot: FishingSpot) => void;
  userLocation: { lat: number; lng: number } | null;
}

export const SpotFormContainer: React.FC<SpotFormContainerProps> = ({
  selectedCoordinates,
  user,
  onClose,
  onSpotAdded,
  userLocation
}) => {
  if (!selectedCoordinates || !user) return null;

  // Verifica se o usuário está a no máximo 2km do local selecionado
  const isWithinRange = () => {
    if (!userLocation || !selectedCoordinates) return false;
    
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(userLocation.lat, userLocation.lng),
      new google.maps.LatLng(selectedCoordinates[1], selectedCoordinates[0])
    );
    
    return distance <= 2000; // 2km em metros
  };

  // Se o usuário não é admin, verifica a distância
  if (!isWithinRange() && !user.isAdmin) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg w-80">
          <h3 className="text-lg font-bold mb-2">Localização muito distante</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Você só pode adicionar spots a até 2km de sua localização atual.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose} variant="default">OK</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SpotForm
      isOpen={true}
      onClose={onClose}
      coordinates={selectedCoordinates}
      onSpotAdded={onSpotAdded}
      userId={user.uid}
    />
  );
};

// Importação necessária para o componente Button
import { Button } from '@/components/ui/button';
