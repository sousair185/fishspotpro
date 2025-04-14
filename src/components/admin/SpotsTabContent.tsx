
import React from 'react';
import SpotsList from './SpotsList';
import { FishingSpot } from '@/types/spot';

interface SpotsTabContentProps {
  spots: FishingSpot[] | undefined;
  isLoading: boolean;
  activeTab: string;
  onApprove: (spotId: string) => void;
  onReject: (spotId: string) => void;
  isPending: boolean;
}

const SpotsTabContent: React.FC<SpotsTabContentProps> = ({ 
  spots, 
  isLoading, 
  activeTab, 
  onApprove, 
  onReject, 
  isPending 
}) => {
  return (
    <SpotsList
      spots={spots}
      isLoading={isLoading}
      activeTab={activeTab}
      onApprove={onApprove}
      onReject={onReject}
      isPending={isPending}
    />
  );
};

export default SpotsTabContent;
