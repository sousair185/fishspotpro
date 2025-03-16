
import React from "react";
import { FishingSpot } from "@/types/spot";
import { SpotCard } from "./SpotCard";

interface LikedSpotsTabProps {
  spots: FishingSpot[] | undefined;
  isLoading: boolean;
  onSpotClick: (spot: FishingSpot) => void;
}

export const LikedSpotsTab: React.FC<LikedSpotsTabProps> = ({ 
  spots, 
  isLoading, 
  onSpotClick 
}) => {
  return (
    <>
      {isLoading ? (
        <div className="text-center py-8">Carregando spots curtidos...</div>
      ) : !spots || spots.length === 0 ? (
        <div className="rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 p-8 text-center">
          <p className="text-muted-foreground">Você ainda não curtiu nenhum ponto de pesca</p>
        </div>
      ) : (
        <div className="space-y-4">
          {spots.map(spot => (
            <SpotCard 
              key={spot.id} 
              spot={spot} 
              onClick={onSpotClick}
              isLikedTab={true}
            />
          ))}
        </div>
      )}
    </>
  );
};
