
import React from 'react';
import SpotForm from '../spots/SpotForm';
import { FishingSpot } from '@/types/spot';
import { FirebaseUser } from '@/types/user';

interface SpotFormContainerProps {
  selectedCoordinates: [number, number] | null;
  user: FirebaseUser | null;
  onClose: () => void;
  onSpotAdded: (newSpot: FishingSpot) => void;
}

export const SpotFormContainer: React.FC<SpotFormContainerProps> = ({
  selectedCoordinates,
  user,
  onClose,
  onSpotAdded
}) => {
  if (!selectedCoordinates || !user) return null;

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
