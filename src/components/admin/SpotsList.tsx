
import React from 'react';
import SpotCard from './SpotCard';
import { FishingSpot } from '@/types/spot';

interface SpotsListProps {
  spots: FishingSpot[] | undefined;
  isLoading: boolean;
  activeTab: string;
  onApprove: (spotId: string) => void;
  onReject: (spotId: string) => void;
  isPending: boolean;
}

const SpotsList: React.FC<SpotsListProps> = ({ 
  spots, 
  isLoading, 
  activeTab, 
  onApprove, 
  onReject, 
  isPending 
}) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        Carregando spots...
      </div>
    );
  }

  if (!spots || spots.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum spot encontrado nesta categoria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {spots.map(spot => (
        <SpotCard
          key={spot.id}
          spot={spot}
          activeTab={activeTab}
          onApprove={onApprove}
          onReject={onReject}
          isPending={isPending}
        />
      ))}
    </div>
  );
};

export default SpotsList;
